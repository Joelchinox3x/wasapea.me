import { desc, eq } from "drizzle-orm";
import { db } from "../database/db";
import { reminders } from "../database/schema";
import type { ContactReminder, CreateReminderParams } from "../domain/models";
import type { ReminderRepositoryContract } from "../domain/repositoryContracts";

export type { ContactReminder } from "../domain/models";

export class ReminderRepository {
  static async getAll(): Promise<ContactReminder[]> {
    return await db.select().from(reminders).orderBy(desc(reminders.scheduledAt));
  }

  static async getForContact(contactId: string): Promise<ContactReminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.contactId, contactId))
      .orderBy(desc(reminders.scheduledAt));
  }

  static async getForPhone(phoneE164: string): Promise<ContactReminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.phoneE164, phoneE164))
      .orderBy(desc(reminders.scheduledAt));
  }

  static async create(params: CreateReminderParams): Promise<ContactReminder> {
    const id = `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRem: ContactReminder = {
      id,
      contactId: params.contactId || null,
      phoneE164: params.phoneE164,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      scheduledAt: params.scheduledAt,
      notificationId: params.notificationId || null,
      completed: 0,
      createdAt: new Date().toISOString()
    };
    await db.insert(reminders).values(newRem);
    return newRem;
  }

  static async toggleCompleted(id: string): Promise<boolean> {
    const res = await db.select().from(reminders).where(eq(reminders.id, id));
    if (!res[0]) return false;
    const nextVal = res[0].completed === 1 ? 0 : 1;
    await db.update(reminders).set({ completed: nextVal }).where(eq(reminders.id, id));
    return nextVal === 1;
  }

  static async delete(id: string): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }
}

export const reminderRepository: ReminderRepositoryContract = ReminderRepository;
