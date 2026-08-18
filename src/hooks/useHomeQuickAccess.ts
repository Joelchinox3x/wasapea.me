import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import type { InternalContact, MessageTemplateItem } from "../domain/models";
import { ContactRepository } from "../repositories/ContactRepository";
import { HistoryRepository } from "../repositories/HistoryRepository";
import { MessageTemplateRepository } from "../repositories/MessageTemplateRepository";

export interface HomeQuickContact {
  contact: InternalContact;
  interactionCount: number;
}

export function useHomeQuickAccess() {
  const [contacts, setContacts] = useState<HomeQuickContact[]>([]);
  const [templates, setTemplates] = useState<MessageTemplateItem[]>([]);

  const reload = useCallback(async () => {
    try {
      const [contactRows, historyRows, templateRows] = await Promise.all([
        ContactRepository.getAll(),
        HistoryRepository.getAll(),
        MessageTemplateRepository.getAll()
      ]);
      const usageByPhone = new Map(historyRows.map((item) => [item.phoneE164, item.interactionCount]));

      setContacts(
        contactRows
          .map((contact) => ({ contact, interactionCount: usageByPhone.get(contact.phoneE164) ?? 0 }))
          .sort((a, b) =>
            b.contact.favorite - a.contact.favorite ||
            b.interactionCount - a.interactionCount ||
            b.contact.updatedAt.localeCompare(a.contact.updatedAt)
          )
      );
      setTemplates(templateRows);
    } catch {
      setContacts([]);
      setTemplates([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  return { contacts, templates, reload };
}
