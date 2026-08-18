import { readWebCollection, webStorageKeys, writeWebCollection } from "../database/webStorage";
import type { ContactReminder, CreateReminderParams } from "../domain/models";
import type { ReminderRepositoryContract } from "../domain/repositoryContracts";

export type { ContactReminder } from "../domain/models";

function getReminders(): ContactReminder[] {
  return readWebCollection<ContactReminder>(webStorageKeys.reminders);
}

function saveReminders(reminders: ContactReminder[]): void {
  writeWebCollection(webStorageKeys.reminders, reminders);
}

export class ReminderRepository {
  static async getAll(): Promise<ContactReminder[]> {
    return getReminders().sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }

  static async getForContact(contactId: string): Promise<ContactReminder[]> {
    return getReminders()
      .filter((reminder) => reminder.contactId === contactId)
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }

  static async getForPhone(phoneE164: string): Promise<ContactReminder[]> {
    return getReminders()
      .filter((reminder) => reminder.phoneE164 === phoneE164)
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }

  static async create(params: CreateReminderParams): Promise<ContactReminder> {
    const reminder: ContactReminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      contactId: params.contactId || null,
      phoneE164: params.phoneE164,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      scheduledAt: params.scheduledAt,
      notificationId: params.notificationId || null,
      completed: 0,
      createdAt: new Date().toISOString()
    };
    saveReminders([...getReminders(), reminder]);
    return reminder;
  }

  static async toggleCompleted(id: string): Promise<boolean> {
    const current = getReminders().find((reminder) => reminder.id === id);
    if (!current) return false;
    const completed = current.completed === 1 ? 0 : 1;
    saveReminders(getReminders().map((reminder) => (reminder.id === id ? { ...reminder, completed } : reminder)));
    return completed === 1;
  }

  static async delete(id: string): Promise<void> {
    saveReminders(getReminders().filter((reminder) => reminder.id !== id));
  }
}

export const reminderRepository: ReminderRepositoryContract = ReminderRepository;
