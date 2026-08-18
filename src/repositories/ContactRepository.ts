import { desc, eq, sql } from "drizzle-orm";
import { db } from "../database/db";
import { contacts } from "../database/schema";
import type { CreateContactParams, InternalContact } from "../domain/models";
import type { ContactRepositoryContract } from "../domain/repositoryContracts";

export type { CreateContactParams, InternalContact } from "../domain/models";

export class ContactRepository {
  static async getAll(options?: {
    search?: string;
    categoryId?: string;
    onlyFavorites?: boolean;
  }): Promise<InternalContact[]> {
    const conditions = [];

    if (options?.onlyFavorites) {
      conditions.push(eq(contacts.favorite, 1));
    }

    if (options?.categoryId && options.categoryId !== "all") {
      conditions.push(eq(contacts.categoryId, options.categoryId));
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim().toLowerCase()}%`;
      conditions.push(
        sql`LOWER(${contacts.name}) LIKE ${term} OR LOWER(${contacts.phoneE164}) LIKE ${term} OR LOWER(${contacts.phoneFormatted}) LIKE ${term} OR LOWER(COALESCE(${contacts.company}, '')) LIKE ${term}`
      );
    }

    return await db
      .select()
      .from(contacts)
      .where(conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined)
      .orderBy(desc(contacts.updatedAt));
  }

  static async getById(id: string): Promise<InternalContact | null> {
    const res = await db.select().from(contacts).where(eq(contacts.id, id));
    return res[0] || null;
  }

  static async getByE164(e164: string): Promise<InternalContact | null> {
    const res = await db.select().from(contacts).where(eq(contacts.phoneE164, e164));
    return res[0] || null;
  }

  static async create(params: CreateContactParams): Promise<InternalContact> {
    // Check if contact with same E.164 exists
    const existing = await this.getByE164(params.phoneE164);
    if (existing) {
      throw new Error(`Ya existe un contacto guardado con el número ${params.phoneE164} (${existing.name}).`);
    }

    const now = new Date().toISOString();
    const id = `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newContact: InternalContact = {
      id,
      phoneE164: params.phoneE164,
      phoneFormatted: params.phoneFormatted,
      countryCode: params.countryCode,
      countryIso: params.countryIso,
      name: params.name.trim(),
      company: params.company?.trim() || null,
      note: params.note?.trim() || null,
      categoryId: params.categoryId || null,
      favorite: params.favorite ? 1 : 0,
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    };

    await db.insert(contacts).values(newContact);
    return newContact;
  }

  static async bulkCreate(
    items: CreateContactParams[]
  ): Promise<{ importedCount: number; skippedCount: number }> {
    let importedCount = 0;
    let skippedCount = 0;
    const now = new Date().toISOString();

    for (const params of items) {
      if (!params.phoneE164) continue;
      const existing = await this.getByE164(params.phoneE164);
      if (existing) {
        skippedCount++;
        continue;
      }

      const id = `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${importedCount}`;
      const newContact: InternalContact = {
        id,
        phoneE164: params.phoneE164,
        phoneFormatted: params.phoneFormatted,
        countryCode: params.countryCode,
        countryIso: params.countryIso,
        name: params.name.trim() || "Contacto",
        company: params.company?.trim() || null,
        note: params.note?.trim() || null,
        categoryId: params.categoryId || null,
        favorite: params.favorite ? 1 : 0,
        createdAt: now,
        updatedAt: now,
        archivedAt: null
      };

      await db.insert(contacts).values(newContact);
      importedCount++;
    }

    return { importedCount, skippedCount };
  }

  static async update(
    id: string,
    params: Partial<Omit<CreateContactParams, "phoneE164">>
  ): Promise<InternalContact | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const updatedFields: Partial<InternalContact> = {
      updatedAt: now
    };

    if (params.name !== undefined) updatedFields.name = params.name.trim();
    if (params.company !== undefined) updatedFields.company = params.company.trim() || null;
    if (params.note !== undefined) updatedFields.note = params.note.trim() || null;
    if (params.categoryId !== undefined) updatedFields.categoryId = params.categoryId || null;
    if (params.favorite !== undefined) updatedFields.favorite = params.favorite ? 1 : 0;
    if (params.phoneFormatted !== undefined) updatedFields.phoneFormatted = params.phoneFormatted;
    if (params.countryCode !== undefined) updatedFields.countryCode = params.countryCode;
    if (params.countryIso !== undefined) updatedFields.countryIso = params.countryIso;

    await db.update(contacts).set(updatedFields).where(eq(contacts.id, id));
    return await this.getById(id);
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const current = await this.getById(id);
    if (!current) return false;
    const nextVal = current.favorite === 1 ? 0 : 1;
    await db.update(contacts).set({ favorite: nextVal, updatedAt: new Date().toISOString() }).where(eq(contacts.id, id));
    return nextVal === 1;
  }

  static async delete(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  static async clearAll(): Promise<void> {
    await db.delete(contacts);
  }
}

export const contactRepository: ContactRepositoryContract = ContactRepository;
