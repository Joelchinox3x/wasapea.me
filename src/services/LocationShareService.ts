import * as Location from "expo-location";

const CURRENT_LOCATION_TIMEOUT_MS = 20_000;

export interface ShareCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationMessagePayload extends ShareCoordinates {
  mapUrl: string;
  message: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

export function buildGoogleMapsLocationUrl({ latitude, longitude }: ShareCoordinates): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Las coordenadas obtenidas no son válidas.");
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

export function buildCurrentLocationMessage(coordinates: ShareCoordinates): LocationMessagePayload {
  const mapUrl = buildGoogleMapsLocationUrl(coordinates);
  return {
    ...coordinates,
    mapUrl,
    message: `*📍 COMPARTO MI UBICACIÓN*\n\nEstoy aquí en este momento:\n${mapUrl}\n\n_Ubicación compartida desde WASAPEA.ME_`
  };
}

export class LocationShareService {
  static async getCurrentLocationMessage(): Promise<LocationMessagePayload> {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      throw new Error("Activa la ubicación del teléfono para poder compartir tu posición.");
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      throw new Error("Necesitamos permiso de ubicación para crear el enlace de Google Maps.");
    }

    let currentLocation: Location.LocationObject | null = null;
    try {
      currentLocation = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        CURRENT_LOCATION_TIMEOUT_MS
      );
    } catch {
      currentLocation = await Location.getLastKnownPositionAsync({
        maxAge: 120_000,
        requiredAccuracy: 250
      });
    }

    if (!currentLocation) {
      throw new Error("No pudimos obtener tu ubicación. Sal a un lugar con mejor señal GPS e inténtalo nuevamente.");
    }

    return buildCurrentLocationMessage({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude
    });
  }
}
