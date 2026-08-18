const WEB_STORAGE_PREFIX = "wasapeame.web.";
const memoryFallback = new Map<string, string>();

export const webStorageKeys = {
  categories: "categories",
  contacts: "contacts",
  history: "history",
  actions: "actions",
  reminders: "reminders",
  messageTemplates: "message-templates",
  savedAppointmentLocations: "saved-appointment-locations"
} as const;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readWebCollection<T>(key: string): T[] {
  const fullKey = `${WEB_STORAGE_PREFIX}${key}`;
  try {
    const raw = getStorage()?.getItem(fullKey) ?? memoryFallback.get(fullKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function writeWebCollection<T>(key: string, value: T[]): void {
  const fullKey = `${WEB_STORAGE_PREFIX}${key}`;
  const serialized = JSON.stringify(value);
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(fullKey, serialized);
      return;
    }
  } catch {
    // Algunos navegadores bloquean localStorage en modo privado.
  }
  memoryFallback.set(fullKey, serialized);
}
