import type { BackupImportResult, WasapeameBackupFormat } from "../domain/backup";
import type {
  CategoryItemData,
  CommunicationActionEntry,
  ContactReminder,
  InternalContact,
  MessageTemplateItem,
  PhoneHistoryEntry
} from "../domain/models";
import { readWebCollection, webStorageKeys, writeWebCollection } from "./webStorage";

function uniqueId(preferred: string, prefix: string, used: Set<string>): string {
  if (!used.has(preferred)) {
    used.add(preferred);
    return preferred;
  }
  let candidate = "";
  do {
    candidate = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  } while (used.has(candidate));
  used.add(candidate);
  return candidate;
}

export async function importBackupData(payload: WasapeameBackupFormat): Promise<BackupImportResult> {
  const categories = readWebCollection<CategoryItemData>(webStorageKeys.categories);
  const contacts = readWebCollection<InternalContact>(webStorageKeys.contacts);
  const history = readWebCollection<PhoneHistoryEntry>(webStorageKeys.history);
  const actions = readWebCollection<CommunicationActionEntry>(webStorageKeys.actions);
  const reminders = readWebCollection<ContactReminder>(webStorageKeys.reminders);
  const messageTemplates = readWebCollection<MessageTemplateItem>(webStorageKeys.messageTemplates);

  const categoryIds = new Set(categories.map((item) => item.id));
  const contactIds = new Set(contacts.map((item) => item.id));
  const historyIds = new Set(history.map((item) => item.id));
  const actionIds = new Set(actions.map((item) => item.id));
  const reminderIds = new Set(reminders.map((item) => item.id));
  const messageTemplateIds = new Set(messageTemplates.map((item) => item.id));
  const contactsByPhone = new Map(contacts.map((item) => [item.phoneE164, item.id]));
  const historyByPhone = new Map(history.map((item) => [item.phoneE164, item.id]));
  const contactIdMap = new Map<string, string>();
  const historyIdMap = new Map<string, string>();
  const nextCategories = [...categories];
  const nextContacts = [...contacts];
  const nextHistory = [...history];
  const nextActions = [...actions];
  const nextReminders = [...reminders];
  const nextMessageTemplates = [...messageTemplates];
  const result: BackupImportResult = {
    importedCategories: 0,
    importedContacts: 0,
    importedHistory: 0,
    importedActions: 0,
    importedReminders: 0,
    importedMessageTemplates: 0,
    skippedContacts: 0,
    skippedHistory: 0,
    skippedMessageTemplates: 0
  };

  for (const category of payload.categories) {
    if (categoryIds.has(category.id)) continue;
    categoryIds.add(category.id);
    nextCategories.push(category);
    result.importedCategories++;
  }

  for (const contact of payload.contacts) {
    const duplicateId = contactsByPhone.get(contact.phoneE164);
    if (duplicateId) {
      contactIdMap.set(contact.id, duplicateId);
      result.skippedContacts++;
      continue;
    }
    const id = uniqueId(contact.id, "cnt", contactIds);
    const imported = {
      ...contact,
      id,
      categoryId: contact.categoryId && categoryIds.has(contact.categoryId) ? contact.categoryId : null
    };
    nextContacts.push(imported);
    contactsByPhone.set(contact.phoneE164, id);
    contactIdMap.set(contact.id, id);
    result.importedContacts++;
  }

  for (const entry of payload.history) {
    const duplicateId = historyByPhone.get(entry.phoneE164);
    if (duplicateId) {
      historyIdMap.set(entry.id, duplicateId);
      result.skippedHistory++;
      continue;
    }
    const id = uniqueId(entry.id, "hist", historyIds);
    nextHistory.push({ ...entry, id });
    historyByPhone.set(entry.phoneE164, id);
    historyIdMap.set(entry.id, id);
    result.importedHistory++;
  }

  for (const action of payload.actions) {
    if (actionIds.has(action.id)) continue;
    const mappedHistoryId = action.historyId ? historyIdMap.get(action.historyId) ?? null : null;
    if (action.historyId && !mappedHistoryId) continue;
    actionIds.add(action.id);
    nextActions.push({ ...action, historyId: mappedHistoryId });
    result.importedActions++;
  }

  for (const reminder of payload.reminders) {
    if (reminderIds.has(reminder.id)) continue;
    reminderIds.add(reminder.id);
    nextReminders.push({
      ...reminder,
      contactId: reminder.contactId ? contactIdMap.get(reminder.contactId) ?? null : null
    });
    result.importedReminders++;
  }

  for (const template of payload.messageTemplates) {
    if (messageTemplateIds.has(template.id)) {
      result.skippedMessageTemplates++;
      continue;
    }
    messageTemplateIds.add(template.id);
    nextMessageTemplates.push(template);
    result.importedMessageTemplates++;
  }

  // Build every collection before writing. localStorage writes are then applied
  // as a single logical commit; an exception restores the original snapshot.
  try {
    writeWebCollection(webStorageKeys.categories, nextCategories);
    writeWebCollection(webStorageKeys.contacts, nextContacts);
    writeWebCollection(webStorageKeys.history, nextHistory);
    writeWebCollection(webStorageKeys.actions, nextActions);
    writeWebCollection(webStorageKeys.reminders, nextReminders);
    writeWebCollection(webStorageKeys.messageTemplates, nextMessageTemplates);
  } catch (error) {
    writeWebCollection(webStorageKeys.categories, categories);
    writeWebCollection(webStorageKeys.contacts, contacts);
    writeWebCollection(webStorageKeys.history, history);
    writeWebCollection(webStorageKeys.actions, actions);
    writeWebCollection(webStorageKeys.reminders, reminders);
    writeWebCollection(webStorageKeys.messageTemplates, messageTemplates);
    throw error;
  }

  return result;
}
