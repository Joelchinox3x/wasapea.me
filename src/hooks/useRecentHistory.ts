import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import type { PhoneHistoryEntry } from "../domain/models";
import { ContactRepository } from "../repositories/ContactRepository";
import { HistoryRepository } from "../repositories/HistoryRepository";
import { buildHistoryActionMaps, enrichHistoryWithContacts } from "../utils/historyPresentation";

export function useRecentHistory() {
  const [items, setItems] = useState<PhoneHistoryEntry[]>([]);
  const [latestActions, setLatestActions] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    try {
      const [history, contacts, actions] = await Promise.all([
        HistoryRepository.getAll({ limit: 3 }),
        ContactRepository.getAll(),
        HistoryRepository.getAllActions()
      ]);
      setItems(enrichHistoryWithContacts(history, contacts));
      setLatestActions(buildHistoryActionMaps(actions).latestActions);
    } catch {
      setItems([]);
      setLatestActions({});
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  return { items, latestActions, reload };
}
