import { readWebCollection, webStorageKeys, writeWebCollection } from "../database/webStorage";
import type {
  CreateSavedAppointmentLocationParams,
  SavedAppointmentLocation
} from "../domain/models";
import type { SavedAppointmentLocationRepositoryContract } from "../domain/repositoryContracts";

function getItems(): SavedAppointmentLocation[] {
  return readWebCollection<SavedAppointmentLocation>(webStorageKeys.savedAppointmentLocations);
}

function saveItems(items: SavedAppointmentLocation[]): void {
  writeWebCollection(webStorageKeys.savedAppointmentLocations, items);
}

function validate(params: CreateSavedAppointmentLocationParams): void {
  if (!params.name.trim()) throw new Error("Escribe un nombre para el lugar.");
  if (!params.address?.trim() && !params.mapUrl?.trim()) {
    throw new Error("Agrega una dirección, un enlace de Maps o un enlace de reunión.");
  }
}

export class SavedAppointmentLocationRepository {
  static async getAll(): Promise<SavedAppointmentLocation[]> {
    return getItems().sort((a, b) => b.isDefault - a.isDefault || b.updatedAt.localeCompare(a.updatedAt));
  }

  static async create(params: CreateSavedAppointmentLocationParams): Promise<SavedAppointmentLocation> {
    validate(params);
    const now = new Date().toISOString();
    const item: SavedAppointmentLocation = {
      id: `place-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: params.name.trim(),
      address: params.address?.trim() || null,
      mapUrl: params.mapUrl?.trim() || null,
      kind: params.kind ?? "physical",
      isDefault: params.isDefault ? 1 : 0,
      createdAt: now,
      updatedAt: now
    };
    const current = getItems().map((entry) => item.isDefault === 1 ? { ...entry, isDefault: 0 } : entry);
    saveItems([...current, item]);
    return item;
  }

  static async update(
    id: string,
    params: Partial<CreateSavedAppointmentLocationParams>
  ): Promise<SavedAppointmentLocation | null> {
    const current = getItems();
    const item = current.find((entry) => entry.id === id);
    if (!item) return null;
    const merged: SavedAppointmentLocation = {
      ...item,
      ...(params.name !== undefined ? { name: params.name.trim() } : {}),
      ...(params.address !== undefined ? { address: params.address.trim() || null } : {}),
      ...(params.mapUrl !== undefined ? { mapUrl: params.mapUrl.trim() || null } : {}),
      ...(params.kind !== undefined ? { kind: params.kind } : {}),
      ...(params.isDefault !== undefined ? { isDefault: params.isDefault ? 1 : 0 } : {}),
      updatedAt: new Date().toISOString()
    };
    validate({ name: merged.name, address: merged.address ?? undefined, mapUrl: merged.mapUrl ?? undefined });
    saveItems(current.map((entry) => {
      if (merged.isDefault === 1 && entry.id !== id) return { ...entry, isDefault: 0 };
      return entry.id === id ? merged : entry;
    }));
    return merged;
  }

  static async delete(id: string): Promise<void> {
    saveItems(getItems().filter((item) => item.id !== id));
  }

  static async clearAll(): Promise<void> {
    saveItems([]);
  }
}

export const savedAppointmentLocationRepository: SavedAppointmentLocationRepositoryContract = SavedAppointmentLocationRepository;
