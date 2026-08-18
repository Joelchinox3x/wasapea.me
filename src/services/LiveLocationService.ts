import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { SAFE_SERVER_URL } from "../constants/app";

const LIVE_LOCATION_TASK = "wasapeame-live-location";
const ACTIVE_SESSION_KEY = "wasapeame.live-location.session.v1";
const SERVER_URL = SAFE_SERVER_URL;

interface ServerTripResponse {
  tripId: string;
  publisherToken: string;
  viewerUrl: string;
  expiresAt: number;
}

export interface ActiveLiveLocationSession extends ServerTripResponse {
  startedAt: number;
  sequence: number;
}

interface LocationTaskData {
  locations: Location.LocationObject[];
}

function requireServerUrl(): string {
  if (!SERVER_URL) {
    throw new Error("El servidor de ubicación en vivo todavía no está configurado en esta compilación.");
  }
  return SERVER_URL;
}

function toServerPosition(location: Location.LocationObject) {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    speed: location.coords.speed,
    heading: location.coords.heading,
    timestamp: location.timestamp
  };
}

async function readSession(): Promise<ActiveLiveLocationSession | null> {
  const stored = await SecureStore.getItemAsync(ACTIVE_SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ActiveLiveLocationSession;
  } catch {
    await SecureStore.deleteItemAsync(ACTIVE_SESSION_KEY);
    return null;
  }
}

async function saveSession(session: ActiveLiveLocationSession): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

async function stopNativeTask(): Promise<void> {
  try {
    if (await Location.hasStartedLocationUpdatesAsync(LIVE_LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(LIVE_LOCATION_TASK);
    }
  } catch {
    // The local session is still cleared even if Android already stopped the service.
  }
}

async function clearExpiredOrMissingSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACTIVE_SESSION_KEY);
  await stopNativeTask();
}

async function publishPosition(
  session: ActiveLiveLocationSession,
  location: Location.LocationObject
): Promise<"accepted" | "ended" | "retry"> {
  try {
    const sequence = session.sequence + 1;
    const response = await fetch(`${requireServerUrl()}/api/trips/${session.tripId}/location`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.publisherToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sequence, position: toServerPosition(location) })
    });

    if (response.status === 404) return "ended";
    if (!response.ok) return "retry";
    session.sequence = sequence;
    await saveSession(session);
    return "accepted";
  } catch {
    return "retry";
  }
}

if (!TaskManager.isTaskDefined(LIVE_LOCATION_TASK)) {
  TaskManager.defineTask<LocationTaskData>(LIVE_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data?.locations?.length) return;
    const session = await readSession();
    if (!session || Date.now() >= session.expiresAt) {
      await clearExpiredOrMissingSession();
      return;
    }

    for (const location of data.locations) {
      const result = await publishPosition(session, location);
      if (result === "ended") {
        await clearExpiredOrMissingSession();
        return;
      }
    }
  });
}

export function buildLiveLocationMessage(viewerUrl: string): string {
  return `*📍 ESTOY COMPARTIENDO MI UBICACIÓN EN VIVO*\n\nPuedes seguir mi ubicación aquí:\n${viewerUrl}\n\n_Este enlace es privado y temporal._`;
}

export class LiveLocationService {
  static async getActiveSession(): Promise<ActiveLiveLocationSession | null> {
    const session = await readSession();
    if (!session) return null;
    if (Date.now() >= session.expiresAt) {
      await clearExpiredOrMissingSession();
      return null;
    }
    return session;
  }

  static async start(ttlMinutes = 60): Promise<ActiveLiveLocationSession> {
    requireServerUrl();
    if (!(await TaskManager.isAvailableAsync())) {
      throw new Error("La ubicación en segundo plano requiere un Development Build instalado.");
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) throw new Error("Activa la ubicación del teléfono para iniciar la transmisión.");

    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== Location.PermissionStatus.GRANTED) {
      throw new Error("Concede el permiso de ubicación para compartir tu posición.");
    }

    const background = await Location.requestBackgroundPermissionsAsync();
    if (background.status !== Location.PermissionStatus.GRANTED) {
      throw new Error("Selecciona “Permitir todo el tiempo” para continuar compartiendo al abrir WhatsApp.");
    }

    const initialLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const response = await fetch(`${requireServerUrl()}/api/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ttlMinutes, initialPosition: toServerPosition(initialLocation) })
    });
    if (!response.ok) {
      throw new Error("El servidor de ubicación no respondió. Inténtalo nuevamente.");
    }

    const created = await response.json() as ServerTripResponse;
    const session: ActiveLiveLocationSession = {
      ...created,
      startedAt: Date.now(),
      sequence: 0
    };
    await saveSession(session);

    try {
      await Location.startLocationUpdatesAsync(LIVE_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5_000,
        distanceInterval: 5,
        deferredUpdatesInterval: 10_000,
        deferredUpdatesDistance: 10,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "WASAPEA.ME · Ubicación en vivo",
          notificationBody: "Tu ubicación se está compartiendo. Toca para volver y detenerla.",
          notificationColor: "#10B981",
          killServiceOnDestroy: false
        }
      });
      return session;
    } catch (error) {
      await this.stop(session);
      throw error;
    }
  }

  static async stop(providedSession?: ActiveLiveLocationSession): Promise<void> {
    const session = providedSession ?? await readSession();
    await stopNativeTask();
    await SecureStore.deleteItemAsync(ACTIVE_SESSION_KEY);
    if (!session || !SERVER_URL) return;

    try {
      await fetch(`${SERVER_URL}/api/trips/${session.tripId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.publisherToken}` }
      });
    } catch {
      // Local tracking must stop even if the ephemeral server is unavailable.
    }
  }
}
