import { and, desc, eq, sql } from "drizzle-orm";
import { DEFAULT_MESSAGE_TEMPLATES } from "../constants/messageTemplates";
import { db } from "../database/db";
import { messageTemplates } from "../database/schema";
import type { CreateMessageTemplateParams, MessageTemplateItem } from "../domain/models";
import type { MessageTemplateRepositoryContract } from "../domain/repositoryContracts";

export class MessageTemplateRepository {
  static async getAll(): Promise<MessageTemplateItem[]> {
    return await db
      .select()
      .from(messageTemplates)
      .orderBy(desc(messageTemplates.favorite), desc(messageTemplates.lastUsedAt), desc(messageTemplates.updatedAt)) as MessageTemplateItem[];
  }

  static async create(params: CreateMessageTemplateParams): Promise<MessageTemplateItem> {
    const now = new Date().toISOString();
    const item: MessageTemplateItem = {
      id: `msg-template-custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: params.title.trim(),
      content: params.content.trim(),
      category: params.category,
      color: params.color,
      isDefault: 0,
      favorite: 0,
      useCount: 0,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now
    };
    await db.insert(messageTemplates).values(item);
    return item;
  }

  static async update(id: string, params: Partial<CreateMessageTemplateParams>): Promise<void> {
    await db
      .update(messageTemplates)
      .set({
        ...(params.title !== undefined ? { title: params.title.trim() } : {}),
        ...(params.content !== undefined ? { content: params.content.trim() } : {}),
        ...(params.category !== undefined ? { category: params.category } : {}),
        ...(params.color !== undefined ? { color: params.color } : {}),
        updatedAt: new Date().toISOString()
      })
      .where(and(eq(messageTemplates.id, id), eq(messageTemplates.isDefault, 0)));
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const current = await db.select().from(messageTemplates).where(eq(messageTemplates.id, id));
    if (!current[0]) return false;
    const favorite = current[0].favorite === 1 ? 0 : 1;
    await db.update(messageTemplates).set({ favorite }).where(eq(messageTemplates.id, id));
    return favorite === 1;
  }

  static async recordUse(id: string): Promise<void> {
    const now = new Date().toISOString();
    await db
      .update(messageTemplates)
      .set({ useCount: sql`${messageTemplates.useCount} + 1`, lastUsedAt: now, updatedAt: now })
      .where(eq(messageTemplates.id, id));
  }

  static async delete(id: string): Promise<void> {
    await db.delete(messageTemplates).where(and(eq(messageTemplates.id, id), eq(messageTemplates.isDefault, 0)));
  }

  static async clearAll(): Promise<void> {
    await db.delete(messageTemplates);
    await db.insert(messageTemplates).values(DEFAULT_MESSAGE_TEMPLATES);
  }
}

export const messageTemplateRepository: MessageTemplateRepositoryContract = MessageTemplateRepository;
