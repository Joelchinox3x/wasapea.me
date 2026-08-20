import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import type { MessageTemplateItem, PhoneHistoryEntry } from "../domain/models";
import { ContactRepository } from "../repositories/ContactRepository";
import { HistoryRepository } from "../repositories/HistoryRepository";
import { MessageTemplateRepository } from "../repositories/MessageTemplateRepository";
import { buildHistoryActionMaps, enrichHistoryWithContacts } from "../utils/historyPresentation";
import type { HomeQuickContact } from "./useHomeQuickAccess";

export interface HomeScreenData {
  recentItems: PhoneHistoryEntry[];
  latestActions: Record<string, string>;
  quickContacts: HomeQuickContact[];
  templates: MessageTemplateItem[];
  loading: boolean;
  reload: () => Promise<void>;
}

export function useHomeScreenData(): HomeScreenData {
  const [data, setData] = useState<Omit<HomeScreenData, "reload">>({
    recentItems: [],
    latestActions: {},
    quickContacts: [],
    templates: [],
    loading: true
  });

  const reload = useCallback(async () => {
    try {
      // Single unified batch query to local SQLite / storage
      const [historyRows, contactRows, actionRows, templateRows] = await Promise.all([
        HistoryRepository.getAll(),
        ContactRepository.getAll(),
        HistoryRepository.getAllActions(),
        MessageTemplateRepository.getAll()
      ]);

      const recentItems = enrichHistoryWithContacts(historyRows.slice(0, 3), contactRows);
      const { latestActions } = buildHistoryActionMaps(actionRows);

      const usageByPhone = new Map(historyRows.map((item) => [item.phoneE164, item.interactionCount]));
      const quickContacts: HomeQuickContact[] = contactRows
        .map((contact) => ({
          contact,
          interactionCount: usageByPhone.get(contact.phoneE164) ?? 0
        }))
        .sort((a, b) =>
          b.contact.favorite - a.contact.favorite ||
          b.interactionCount - a.interactionCount ||
          b.contact.updatedAt.localeCompare(a.contact.updatedAt)
        );

      setData({
        recentItems,
        latestActions,
        quickContacts,
        templates: templateRows,
        loading: false
      });
    } catch {
      setData({
        recentItems: [],
        latestActions: {},
        quickContacts: [],
        templates: [],
        loading: false
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  return { ...data, reload };
}
