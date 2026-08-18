import type {
  CategoryItemData,
  CommunicationActionEntry,
  ContactReminder,
  InternalContact,
  MessageTemplateItem,
  PhoneHistoryEntry
} from "./models";

export const BACKUP_SCHEMA_VERSION = 3;

export interface WasapeameBackupFormat {
  schemaVersion: number;
  appName: string;
  version: string;
  exportedAt: string;
  categories: CategoryItemData[];
  contacts: InternalContact[];
  history: PhoneHistoryEntry[];
  actions: CommunicationActionEntry[];
  reminders: ContactReminder[];
  messageTemplates: MessageTemplateItem[];
}

export interface BackupPreview {
  schemaVersion: number;
  exportedAt: string;
  categories: number;
  contacts: number;
  history: number;
  actions: number;
  reminders: number;
  messageTemplates: number;
  existingContacts: number;
  existingHistory: number;
}

export interface BackupImportResult {
  importedCategories: number;
  importedContacts: number;
  importedHistory: number;
  importedActions: number;
  importedReminders: number;
  importedMessageTemplates: number;
  skippedContacts: number;
  skippedHistory: number;
  skippedMessageTemplates: number;
}
