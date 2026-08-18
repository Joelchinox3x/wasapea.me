import type {
  CategoryItemData,
  CommunicationActionEntry,
  ContactReminder,
  CreateContactParams,
  CreateSavedAppointmentLocationParams,
  CreateReminderParams,
  HistoryStats,
  InternalContact,
  LogHistoryActionParams,
  MessageTemplateItem,
  CreateMessageTemplateParams,
  PhoneHistoryEntry,
  SavedAppointmentLocation
} from "./models";

export interface ContactRepositoryContract {
  getAll(options?: { search?: string; categoryId?: string; onlyFavorites?: boolean }): Promise<InternalContact[]>;
  getById(id: string): Promise<InternalContact | null>;
  getByE164(e164: string): Promise<InternalContact | null>;
  create(params: CreateContactParams): Promise<InternalContact>;
  update(id: string, params: Partial<Omit<CreateContactParams, "phoneE164">>): Promise<InternalContact | null>;
  toggleFavorite(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}

export interface HistoryRepositoryContract {
  logAction(params: LogHistoryActionParams): Promise<PhoneHistoryEntry>;
  getAll(options?: { search?: string; onlyFavorites?: boolean; limit?: number }): Promise<PhoneHistoryEntry[]>;
  getById(id: string): Promise<PhoneHistoryEntry | null>;
  getByE164(e164: string): Promise<PhoneHistoryEntry | null>;
  getActionsForHistory(historyId: string): Promise<CommunicationActionEntry[]>;
  getAllActions(): Promise<CommunicationActionEntry[]>;
  toggleFavorite(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
  getStats(): Promise<HistoryStats>;
}

export interface ReminderRepositoryContract {
  getAll(): Promise<ContactReminder[]>;
  getForContact(contactId: string): Promise<ContactReminder[]>;
  getForPhone(phoneE164: string): Promise<ContactReminder[]>;
  create(params: CreateReminderParams): Promise<ContactReminder>;
  toggleCompleted(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}

export interface CategoryRepositoryContract {
  getAll(): Promise<CategoryItemData[]>;
  getById(id: string): Promise<CategoryItemData | null>;
  create(data: { name: string; color?: string; icon?: string }): Promise<CategoryItemData>;
  update(id: string, data: { name?: string; color?: string; icon?: string }): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface MessageTemplateRepositoryContract {
  getAll(): Promise<MessageTemplateItem[]>;
  create(params: CreateMessageTemplateParams): Promise<MessageTemplateItem>;
  update(id: string, params: Partial<CreateMessageTemplateParams>): Promise<void>;
  toggleFavorite(id: string): Promise<boolean>;
  recordUse(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}

export interface SavedAppointmentLocationRepositoryContract {
  getAll(): Promise<SavedAppointmentLocation[]>;
  create(params: CreateSavedAppointmentLocationParams): Promise<SavedAppointmentLocation>;
  update(id: string, params: Partial<CreateSavedAppointmentLocationParams>): Promise<SavedAppointmentLocation | null>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}
