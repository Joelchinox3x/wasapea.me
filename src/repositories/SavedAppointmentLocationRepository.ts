import { desc, eq } from "drizzle-orm";
import { db } from "../database/db";
import { savedAppointmentLocations } from "../database/schema";
import type {
  CreateSavedAppointmentLocationParams,
  SavedAppointmentLocation
} from "../domain/models";
import type { SavedAppointmentLocationRepositoryContract } from "../domain/repositoryContracts";

function validate(params: CreateSavedAppointmentLocationParams): void {
  if (!params.name.trim()) throw new Error("Escribe un nombre para el lugar.");
  if (!params.address?.trim() && !params.mapUrl?.trim()) {
    throw new Error("Agrega una dirección, un enlace de Maps o un enlace de reunión.");
  }
}

export class SavedAppointmentLocationRepository {
  static async getAll(): Promise<SavedAppointmentLocation[]> {
    return await db
      .select()
      .from(savedAppointmentLocations)
      .orderBy(desc(savedAppointmentLocations.isDefault), desc(savedAppointmentLocations.updatedAt)) as SavedAppointmentLocation[];
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
    await db.transaction(async (transaction) => {
      if (item.isDefault === 1) {
        await transaction.update(savedAppointmentLocations).set({ isDefault: 0 });
      }
      await transaction.insert(savedAppointmentLocations).values(item);
    });
    return item;
  }

  static async update(
    id: string,
    params: Partial<CreateSavedAppointmentLocationParams>
  ): Promise<SavedAppointmentLocation | null> {
    const current = await db.select().from(savedAppointmentLocations).where(eq(savedAppointmentLocations.id, id));
    if (!current[0]) return null;
    const merged: CreateSavedAppointmentLocationParams = {
      name: params.name ?? current[0].name,
      address: params.address ?? current[0].address ?? undefined,
      mapUrl: params.mapUrl ?? current[0].mapUrl ?? undefined,
      kind: params.kind ?? current[0].kind as SavedAppointmentLocation["kind"],
      isDefault: params.isDefault ?? current[0].isDefault === 1
    };
    validate(merged);
    await db.transaction(async (transaction) => {
      if (merged.isDefault) {
        await transaction.update(savedAppointmentLocations).set({ isDefault: 0 });
      }
      await transaction.update(savedAppointmentLocations).set({
        name: merged.name.trim(),
        address: merged.address?.trim() || null,
        mapUrl: merged.mapUrl?.trim() || null,
        kind: merged.kind ?? "physical",
        isDefault: merged.isDefault ? 1 : 0,
        updatedAt: new Date().toISOString()
      }).where(eq(savedAppointmentLocations.id, id));
    });
    const updated = await db.select().from(savedAppointmentLocations).where(eq(savedAppointmentLocations.id, id));
    return updated[0] as SavedAppointmentLocation;
  }

  static async delete(id: string): Promise<void> {
    await db.delete(savedAppointmentLocations).where(eq(savedAppointmentLocations.id, id));
  }

  static async clearAll(): Promise<void> {
    await db.delete(savedAppointmentLocations);
  }
}

export const savedAppointmentLocationRepository: SavedAppointmentLocationRepositoryContract = SavedAppointmentLocationRepository;
