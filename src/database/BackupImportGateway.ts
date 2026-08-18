import type { BackupImportResult, WasapeameBackupFormat } from "../domain/backup";
import { expoDb } from "./db";

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

  await expoDb.withExclusiveTransactionAsync(async (txn) => {
    const existingCategories = await txn.getAllAsync<{ id: string }>("SELECT id FROM categories");
    const existingContacts = await txn.getAllAsync<{ id: string; phoneE164: string }>(
      "SELECT id, phone_e164 AS phoneE164 FROM contacts"
    );
    const existingHistory = await txn.getAllAsync<{ id: string; phoneE164: string }>(
      "SELECT id, phone_e164 AS phoneE164 FROM phone_history"
    );
    const existingActions = await txn.getAllAsync<{ id: string }>("SELECT id FROM communication_actions");
    const existingReminders = await txn.getAllAsync<{ id: string }>("SELECT id FROM reminders");
    const existingMessageTemplates = await txn.getAllAsync<{ id: string }>("SELECT id FROM message_templates");

    const categoryIds = new Set(existingCategories.map((item) => item.id));
    const contactIds = new Set(existingContacts.map((item) => item.id));
    const historyIds = new Set(existingHistory.map((item) => item.id));
    const actionIds = new Set(existingActions.map((item) => item.id));
    const reminderIds = new Set(existingReminders.map((item) => item.id));
    const messageTemplateIds = new Set(existingMessageTemplates.map((item) => item.id));
    const contactsByPhone = new Map(existingContacts.map((item) => [item.phoneE164, item.id]));
    const historyByPhone = new Map(existingHistory.map((item) => [item.phoneE164, item.id]));
    const contactIdMap = new Map<string, string>();
    const historyIdMap = new Map<string, string>();

    for (const category of payload.categories) {
      if (categoryIds.has(category.id)) continue;
      await txn.runAsync(
        "INSERT INTO categories (id, name, color, icon, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [category.id, category.name, category.color, category.icon, category.isDefault, category.createdAt]
      );
      categoryIds.add(category.id);
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
      await txn.runAsync(
        `INSERT INTO contacts
          (id, phone_e164, phone_formatted, country_code, country_iso, name, company, note,
           category_id, favorite, created_at, updated_at, archived_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          contact.phoneE164,
          contact.phoneFormatted,
          contact.countryCode,
          contact.countryIso,
          contact.name,
          contact.company,
          contact.note,
          contact.categoryId && categoryIds.has(contact.categoryId) ? contact.categoryId : null,
          contact.favorite,
          contact.createdAt,
          contact.updatedAt,
          contact.archivedAt
        ]
      );
      contactsByPhone.set(contact.phoneE164, id);
      contactIdMap.set(contact.id, id);
      result.importedContacts++;
    }

    for (const history of payload.history) {
      const duplicateId = historyByPhone.get(history.phoneE164);
      if (duplicateId) {
        historyIdMap.set(history.id, duplicateId);
        result.skippedHistory++;
        continue;
      }
      const id = uniqueId(history.id, "hist", historyIds);
      await txn.runAsync(
        `INSERT INTO phone_history
          (id, phone_e164, phone_formatted, country_code, country_iso, name,
           first_interaction_at, last_interaction_at, interaction_count, favorite, archived)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          history.phoneE164,
          history.phoneFormatted,
          history.countryCode,
          history.countryIso,
          history.name,
          history.firstInteractionAt,
          history.lastInteractionAt,
          history.interactionCount,
          history.favorite,
          history.archived
        ]
      );
      historyByPhone.set(history.phoneE164, id);
      historyIdMap.set(history.id, id);
      result.importedHistory++;
    }

    for (const action of payload.actions) {
      if (actionIds.has(action.id)) continue;
      const mappedHistoryId = action.historyId ? historyIdMap.get(action.historyId) ?? null : null;
      if (action.historyId && !mappedHistoryId) continue;
      actionIds.add(action.id);
      await txn.runAsync(
        "INSERT INTO communication_actions (id, history_id, action_type, created_at, metadata) VALUES (?, ?, ?, ?, ?)",
        [action.id, mappedHistoryId, action.actionType, action.createdAt, action.metadata]
      );
      result.importedActions++;
    }

    for (const reminder of payload.reminders) {
      if (reminderIds.has(reminder.id)) continue;
      const mappedContactId = reminder.contactId ? contactIdMap.get(reminder.contactId) ?? null : null;
      reminderIds.add(reminder.id);
      await txn.runAsync(
        `INSERT INTO reminders
          (id, contact_id, phone_e164, title, description, scheduled_at, notification_id, completed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reminder.id,
          mappedContactId,
          reminder.phoneE164,
          reminder.title,
          reminder.description,
          reminder.scheduledAt,
          reminder.notificationId,
          reminder.completed,
          reminder.createdAt
        ]
      );
      result.importedReminders++;
    }

    for (const template of payload.messageTemplates) {
      if (messageTemplateIds.has(template.id)) {
        result.skippedMessageTemplates++;
        continue;
      }
      messageTemplateIds.add(template.id);
      await txn.runAsync(
        `INSERT INTO message_templates
          (id, title, content, category, color, is_default, favorite, use_count,
           last_used_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          template.id,
          template.title,
          template.content,
          template.category,
          template.color,
          template.isDefault,
          template.favorite,
          template.useCount,
          template.lastUsedAt,
          template.createdAt,
          template.updatedAt
        ]
      );
      result.importedMessageTemplates++;
    }
  });

  return result;
}
