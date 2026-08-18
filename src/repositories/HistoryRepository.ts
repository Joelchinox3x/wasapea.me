import { desc, eq, sql } from "drizzle-orm";
import { db } from "../database/db";
import { communicationActions, phoneHistory } from "../database/schema";
import type {
  CommunicationActionEntry,
  HistoryStats,
  LogHistoryActionParams,
  PhoneHistoryEntry
} from "../domain/models";
import type { HistoryRepositoryContract } from "../domain/repositoryContracts";

export type { CommunicationActionEntry, HistoryStats, PhoneHistoryEntry } from "../domain/models";

export class HistoryRepository {
  /**
   * Logs an action for a phone number. Automatically creates or updates the history record for E.164.
   */
  static async logAction(params: LogHistoryActionParams): Promise<PhoneHistoryEntry> {
    const now = new Date().toISOString();
    const existing = await db
      .select()
      .from(phoneHistory)
      .where(eq(phoneHistory.phoneE164, params.phoneE164));

    let historyId: string;
    let entry: PhoneHistoryEntry;

    if (existing && existing.length > 0) {
      historyId = existing[0].id;
      const newCount = (existing[0].interactionCount || 0) + 1;
      const updatedName = params.name || existing[0].name || null;

      await db
        .update(phoneHistory)
        .set({
          lastInteractionAt: now,
          interactionCount: newCount,
          name: updatedName,
          phoneFormatted: params.phoneFormatted
        })
        .where(eq(phoneHistory.id, historyId));

      entry = {
        ...existing[0],
        lastInteractionAt: now,
        interactionCount: newCount,
        name: updatedName
      };
    } else {
      historyId = `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newEntry = {
        id: historyId,
        phoneE164: params.phoneE164,
        phoneFormatted: params.phoneFormatted,
        countryCode: params.countryCode,
        countryIso: params.countryIso,
        name: params.name || null,
        firstInteractionAt: now,
        lastInteractionAt: now,
        interactionCount: 1,
        favorite: 0,
        archived: 0
      };
      await db.insert(phoneHistory).values(newEntry);
      entry = newEntry;
    }

    // Insert action log record
    const actionId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(communicationActions).values({
      id: actionId,
      historyId,
      actionType: params.actionType,
      createdAt: now,
      metadata: params.metadata || null
    });

    return entry;
  }

  static async getAll(options?: {
    search?: string;
    onlyFavorites?: boolean;
    limit?: number;
  }): Promise<PhoneHistoryEntry[]> {
    const conditions = [];
    if (options?.onlyFavorites) {
      conditions.push(eq(phoneHistory.favorite, 1));
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim().toLowerCase()}%`;
      conditions.push(
        sql`LOWER(${phoneHistory.phoneE164}) LIKE ${term} OR LOWER(${phoneHistory.phoneFormatted}) LIKE ${term} OR LOWER(COALESCE(${phoneHistory.name}, '')) LIKE ${term}`
      );
    }

    const rows = await db
      .select()
      .from(phoneHistory)
      .where(conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined)
      .orderBy(desc(phoneHistory.lastInteractionAt))
      .limit(options?.limit || 100);

    return rows;
  }

  static async getById(id: string): Promise<PhoneHistoryEntry | null> {
    const res = await db.select().from(phoneHistory).where(eq(phoneHistory.id, id));
    return res[0] || null;
  }

  static async getByE164(e164: string): Promise<PhoneHistoryEntry | null> {
    const res = await db.select().from(phoneHistory).where(eq(phoneHistory.phoneE164, e164));
    return res[0] || null;
  }

  static async getActionsForHistory(historyId: string): Promise<CommunicationActionEntry[]> {
    return await db
      .select()
      .from(communicationActions)
      .where(eq(communicationActions.historyId, historyId))
      .orderBy(desc(communicationActions.createdAt));
  }

  static async getAllActions(): Promise<CommunicationActionEntry[]> {
    return await db.select().from(communicationActions).orderBy(desc(communicationActions.createdAt));
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const current = await this.getById(id);
    if (!current) return false;
    const nextVal = current.favorite === 1 ? 0 : 1;
    await db.update(phoneHistory).set({ favorite: nextVal }).where(eq(phoneHistory.id, id));
    return nextVal === 1;
  }

  static async delete(id: string): Promise<void> {
    await db.delete(communicationActions).where(eq(communicationActions.historyId, id));
    await db.delete(phoneHistory).where(eq(phoneHistory.id, id));
  }

  static async clearAll(): Promise<void> {
    await db.delete(communicationActions);
    await db.delete(phoneHistory);
  }

  static async getStats(): Promise<HistoryStats> {
    const actions = await db.select().from(communicationActions);
    const historyList = await db.select().from(phoneHistory);

    const now = Date.now();
    const ms7Days = 7 * 24 * 60 * 60 * 1000;
    const ms30Days = 30 * 24 * 60 * 60 * 1000;

    let totalWhatsapp = 0;
    let totalCalls = 0;
    let totalSms = 0;
    let last7DaysActions = 0;
    let last30DaysActions = 0;

    for (const act of actions) {
      if (act.actionType === "whatsapp" || act.actionType === "whatsapp_message") totalWhatsapp++;
      if (act.actionType === "call") totalCalls++;
      if (act.actionType === "sms") totalSms++;

      const actTime = new Date(act.createdAt).getTime();
      if (now - actTime <= ms7Days) last7DaysActions++;
      if (now - actTime <= ms30Days) last30DaysActions++;
    }

    const favoriteNumbers = historyList.filter((h) => h.favorite === 1).length;

    return {
      totalWhatsapp,
      totalCalls,
      totalSms,
      totalActions: actions.length,
      uniqueNumbers: historyList.length,
      favoriteNumbers,
      last7DaysActions,
      last30DaysActions
    };
  }
}

export const historyRepository: HistoryRepositoryContract = HistoryRepository;
