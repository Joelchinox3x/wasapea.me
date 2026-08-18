import type { CommunicationActionEntry, InternalContact, PhoneHistoryEntry } from "../domain/models";

export function enrichHistoryWithContacts(
  history: PhoneHistoryEntry[],
  contacts: InternalContact[]
): PhoneHistoryEntry[] {
  const contactsByPhone = new Map(contacts.map((contact) => [contact.phoneE164, contact]));
  return history.map((entry) => {
    const contact = contactsByPhone.get(entry.phoneE164);
    if (!contact) return { ...entry, name: null };
    return {
      ...entry,
      name: contact.name,
      phoneFormatted: contact.phoneFormatted
    };
  });
}

export function buildHistoryActionMaps(actions: CommunicationActionEntry[]) {
  const actionTypes: Record<string, string[]> = {};
  const latestActions: Record<string, string> = {};
  for (const action of actions) {
    if (!action.historyId) continue;
    actionTypes[action.historyId] ??= [];
    if (!actionTypes[action.historyId].includes(action.actionType)) {
      actionTypes[action.historyId].push(action.actionType);
    }
    latestActions[action.historyId] ??= action.actionType;
  }
  return { actionTypes, latestActions };
}
