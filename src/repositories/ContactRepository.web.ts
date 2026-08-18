import { readWebCollection, webStorageKeys, writeWebCollection } from "../database/webStorage";
import type { CreateContactParams, InternalContact } from "../domain/models";
import type { ContactRepositoryContract } from "../domain/repositoryContracts";

export type { CreateContactParams, InternalContact } from "../domain/models";

function getContacts(): InternalContact[] {
  return readWebCollection<InternalContact>(webStorageKeys.contacts);
}

function saveContacts(contacts: InternalContact[]): void {
  writeWebCollection(webStorageKeys.contacts, contacts);
}

export class ContactRepository {
  static async getAll(options?: {
    search?: string;
    categoryId?: string;
    onlyFavorites?: boolean;
  }): Promise<InternalContact[]> {
    const search = options?.search?.trim().toLowerCase();
    return getContacts()
      .filter((contact) => !options?.onlyFavorites || contact.favorite === 1)
      .filter((contact) => !options?.categoryId || options.categoryId === "all" || contact.categoryId === options.categoryId)
      .filter(
        (contact) =>
          !search ||
          contact.name.toLowerCase().includes(search) ||
          contact.phoneE164.toLowerCase().includes(search) ||
          contact.phoneFormatted.toLowerCase().includes(search) ||
          contact.company?.toLowerCase().includes(search)
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  static async getById(id: string): Promise<InternalContact | null> {
    return getContacts().find((contact) => contact.id === id) ?? null;
  }

  static async getByE164(e164: string): Promise<InternalContact | null> {
    return getContacts().find((contact) => contact.phoneE164 === e164) ?? null;
  }

  static async create(params: CreateContactParams): Promise<InternalContact> {
    const contacts = getContacts();
    const existing = contacts.find((contact) => contact.phoneE164 === params.phoneE164);
    if (existing) {
      throw new Error(`Ya existe un contacto guardado con el número ${params.phoneE164} (${existing.name}).`);
    }

    const now = new Date().toISOString();
    const contact: InternalContact = {
      id: `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    saveContacts([...contacts, contact]);
    return contact;
  }

  static async update(
    id: string,
    params: Partial<Omit<CreateContactParams, "phoneE164">>
  ): Promise<InternalContact | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const updated: InternalContact = {
      ...current,
      ...(params.name !== undefined ? { name: params.name.trim() } : {}),
      ...(params.company !== undefined ? { company: params.company.trim() || null } : {}),
      ...(params.note !== undefined ? { note: params.note.trim() || null } : {}),
      ...(params.categoryId !== undefined ? { categoryId: params.categoryId || null } : {}),
      ...(params.favorite !== undefined ? { favorite: params.favorite ? 1 : 0 } : {}),
      ...(params.phoneFormatted !== undefined ? { phoneFormatted: params.phoneFormatted } : {}),
      ...(params.countryCode !== undefined ? { countryCode: params.countryCode } : {}),
      ...(params.countryIso !== undefined ? { countryIso: params.countryIso } : {}),
      updatedAt: new Date().toISOString()
    };

    saveContacts(getContacts().map((contact) => (contact.id === id ? updated : contact)));
    return updated;
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const current = await this.getById(id);
    if (!current) return false;
    const favorite = current.favorite === 1 ? 0 : 1;
    saveContacts(
      getContacts().map((contact) =>
        contact.id === id ? { ...contact, favorite, updatedAt: new Date().toISOString() } : contact
      )
    );
    return favorite === 1;
  }

  static async delete(id: string): Promise<void> {
    saveContacts(getContacts().filter((contact) => contact.id !== id));
  }

  static async clearAll(): Promise<void> {
    saveContacts([]);
  }
}

export const contactRepository: ContactRepositoryContract = ContactRepository;
