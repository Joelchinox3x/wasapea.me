const STORAGE_PREFIX = "wasapeame.secure-fallback.";

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export class SecureStorageService {
  static async setItem(key: string, value: string): Promise<boolean> {
    try {
      window.localStorage.setItem(storageKey(key), value);
      return true;
    } catch {
      return false;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return window.localStorage.getItem(storageKey(key));
    } catch {
      return null;
    }
  }

  static async deleteItem(key: string): Promise<boolean> {
    try {
      window.localStorage.removeItem(storageKey(key));
      return true;
    } catch {
      return false;
    }
  }
}
