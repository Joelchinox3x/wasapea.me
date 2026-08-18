import { readWebCollection, webStorageKeys, writeWebCollection } from "../database/webStorage";
import type {
  CommunicationActionEntry,
  HistoryStats,
  LogHistoryActionParams,
  PhoneHistoryEntry
} from "../domain/models";
import type { HistoryRepositoryContract } from "../domain/repositoryContracts";

export type { CommunicationActionEntry, HistoryStats, PhoneHistoryEntry } from "../domain/models";

function getHistory(): PhoneHistoryEntry[] {
  return readWebCollection<PhoneHistoryEntry>(webStorageKeys.history);
}

function saveHistory(history: PhoneHistoryEntry[]): void {
  writeWebCollection(webStorageKeys.history, history);
}

function getActions(): CommunicationActionEntry[] {
  return readWebCollection<CommunicationActionEntry>(webStorageKeys.actions);
}

function saveActions(actions: CommunicationActionEntry[]): void {
  writeWebCollection(webStorageKeys.actions, actions);
}

export class HistoryRepository {
  static async logAction(params: LogHistoryActionParams): Promise<PhoneHistoryEntry> {
    const now = new Date().toISOString();
    const history = getHistory();
    const existing = history.find((entry) => entry.phoneE164 === params.phoneE164);
    const entry: PhoneHistoryEntry = existing
      ? {
          ...existing,
          phoneFormatted: params.phoneFormatted,
          name: params.name || existing.name,
          lastInteractionAt: now,
          interactionCount: existing.interactionCount + 1
        }
      : {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

    saveHistory(existing ? history.map((item) => (item.id === entry.id ? entry : item)) : [...history, entry]);
    saveActions([
      ...getActions(),
      {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        historyId: entry.id,
        actionType: params.actionType,
        createdAt: now,
        metadata: params.metadata || null
      }
    ]);
    return entry;
  }

  static async getAll(options?: {
    search?: string;
    onlyFavorites?: boolean;
    limit?: number;
  }): Promise<PhoneHistoryEntry[]> {
    const search = options?.search?.trim().toLowerCase();
    return getHistory()
      .filter((entry) => !options?.onlyFavorites || entry.favorite === 1)
      .filter(
        (entry) =>
          !search ||
          entry.phoneE164.toLowerCase().includes(search) ||
          entry.phoneFormatted.toLowerCase().includes(search) ||
          entry.name?.toLowerCase().includes(search)
      )
      .sort((a, b) => b.lastInteractionAt.localeCompare(a.lastInteractionAt))
      .slice(0, options?.limit || 100);
  }

  static async getById(id: string): Promise<PhoneHistoryEntry | null> {
    return getHistory().find((entry) => entry.id === id) ?? null;
  }

  static async getByE164(e164: string): Promise<PhoneHistoryEntry | null> {
    return getHistory().find((entry) => entry.phoneE164 === e164) ?? null;
  }

  static async getActionsForHistory(historyId: string): Promise<CommunicationActionEntry[]> {
    return getActions()
      .filter((action) => action.historyId === historyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  static async getAllActions(): Promise<CommunicationActionEntry[]> {
    return getActions().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const current = await this.getById(id);
    if (!current) return false;
    const favorite = current.favorite === 1 ? 0 : 1;
    saveHistory(getHistory().map((entry) => (entry.id === id ? { ...entry, favorite } : entry)));
    return favorite === 1;
  }

  static async delete(id: string): Promise<void> {
    saveHistory(getHistory().filter((entry) => entry.id !== id));
    saveActions(getActions().filter((action) => action.historyId !== id));
  }

  static async clearAll(): Promise<void> {
    saveHistory([]);
    saveActions([]);
  }

  static async getStats(): Promise<HistoryStats> {
    const actions = getActions();
    const history = getHistory();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    return {
      totalWhatsapp: actions.filter((action) => ["whatsapp", "whatsapp_message"].includes(action.actionType)).length,
      totalCalls: actions.filter((action) => action.actionType === "call").length,
      totalSms: actions.filter((action) => action.actionType === "sms").length,
      totalActions: actions.length,
      uniqueNumbers: history.length,
      favoriteNumbers: history.filter((entry) => entry.favorite === 1).length,
      last7DaysActions: actions.filter((action) => now - new Date(action.createdAt).getTime() <= sevenDays).length,
      last30DaysActions: actions.filter((action) => now - new Date(action.createdAt).getTime() <= thirtyDays).length
    };
  }
}

export const historyRepository: HistoryRepositoryContract = HistoryRepository;
