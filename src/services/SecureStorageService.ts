import * as SecureStore from "expo-secure-store";

export class SecureStorageService {
  /**
   * Saves a key-value pair securely.
   */
  static async setItem(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves a securely stored value.
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  /**
   * Deletes a key from secure storage.
   */
  static async deleteItem(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch {
      return false;
    }
  }
}
