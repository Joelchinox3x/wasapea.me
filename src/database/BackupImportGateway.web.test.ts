import { BACKUP_SCHEMA_VERSION, WasapeameBackupFormat } from "../domain/backup";
import { readWebCollection, webStorageKeys, writeWebCollection } from "./webStorage";
import { importBackupData } from "./BackupImportGateway.web";

const now = "2026-08-09T20:00:00.000Z";

const backup: WasapeameBackupFormat = {
  schemaVersion: BACKUP_SCHEMA_VERSION,
  appName: "WASAPEA.ME",
  version: "1.0.0",
  exportedAt: now,
  categories: [],
  contacts: [
    {
      id: "cnt-import",
      phoneE164: "+51953385003",
      phoneFormatted: "+51 953 385 003",
      countryCode: "+51",
      countryIso: "PE",
      name: "Importado",
      company: null,
      note: null,
      categoryId: null,
      favorite: 0,
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    }
  ],
  history: [
    {
      id: "hist-import",
      phoneE164: "+51953385003",
      phoneFormatted: "+51 953 385 003",
      countryCode: "+51",
      countryIso: "PE",
      name: "Importado",
      firstInteractionAt: now,
      lastInteractionAt: now,
      interactionCount: 1,
      favorite: 0,
      archived: 0
    }
  ],
  actions: [
    { id: "act-import", historyId: "hist-import", actionType: "whatsapp", createdAt: now, metadata: null }
  ],
  reminders: [
    {
      id: "rem-import",
      contactId: "cnt-import",
      phoneE164: "+51953385003",
      title: "Llamar",
      description: null,
      scheduledAt: now,
      notificationId: null,
      completed: 0,
      createdAt: now
    }
  ],
  messageTemplates: [
    {
      id: "msg-template-import",
      title: "Pedido",
      content: "Tu pedido está listo.",
      category: "sales",
      color: "#3B82F6",
      isDefault: 0,
      favorite: 1,
      useCount: 2,
      lastUsedAt: now,
      createdAt: now,
      updatedAt: now
    }
  ]
};

describe("web backup import gateway", () => {
  beforeEach(() => {
    Object.values(webStorageKeys).forEach((key) => writeWebCollection(key, []));
  });

  test("imports related data and remains idempotent", async () => {
    const first = await importBackupData(backup);
    const second = await importBackupData(backup);

    expect(first.importedContacts).toBe(1);
    expect(first.importedActions).toBe(1);
    expect(first.importedReminders).toBe(1);
    expect(first.importedMessageTemplates).toBe(1);
    expect(second.importedContacts).toBe(0);
    expect(second.importedActions).toBe(0);
    expect(second.importedReminders).toBe(0);
    expect(second.importedMessageTemplates).toBe(0);
    expect(readWebCollection(webStorageKeys.actions)).toHaveLength(1);
    expect(readWebCollection(webStorageKeys.reminders)).toHaveLength(1);
    expect(readWebCollection(webStorageKeys.messageTemplates)).toHaveLength(1);
  });
});
