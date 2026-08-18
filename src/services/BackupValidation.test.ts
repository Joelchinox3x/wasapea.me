import { BACKUP_SCHEMA_VERSION, WasapeameBackupFormat } from "../domain/backup";
import { parseBackupJson } from "./BackupValidation";

const now = "2026-08-09T20:00:00.000Z";

function validBackup(): WasapeameBackupFormat {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appName: "WASAPEA.ME",
    version: "1.0.0",
    exportedAt: now,
    categories: [
      { id: "cat-clientes", name: "Clientes", color: "#10B981", icon: "tag", isDefault: 1, createdAt: now }
    ],
    contacts: [
      {
        id: "cnt-1",
        phoneE164: "+51953385003",
        phoneFormatted: "+51 953 385 003",
        countryCode: "+51",
        countryIso: "PE",
        name: "Cliente",
        company: null,
        note: null,
        categoryId: "cat-clientes",
        favorite: 1,
        createdAt: now,
        updatedAt: now,
        archivedAt: null
      }
    ],
    history: [],
    actions: [],
    reminders: [],
    messageTemplates: []
  };
}

describe("BackupValidation", () => {
  test("accepts and normalizes a current backup", () => {
    const parsed = parseBackupJson(JSON.stringify(validBackup()));

    expect(parsed.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(parsed.contacts[0].phoneE164).toBe("+51953385003");
    expect(parsed.categories).toHaveLength(1);
  });

  test("keeps compatibility with schema version 1 backups", () => {
    const legacy = validBackup() as unknown as Record<string, unknown>;
    delete legacy.schemaVersion;
    delete legacy.categories;
    delete legacy.actions;
    delete legacy.reminders;
    delete legacy.messageTemplates;

    const parsed = parseBackupJson(JSON.stringify(legacy));

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.categories).toEqual([]);
    expect(parsed.actions).toEqual([]);
    expect(parsed.messageTemplates).toEqual([]);
  });

  test("rejects another application and malformed phone data", () => {
    const wrongApp = { ...validBackup(), appName: "OTRA APP" };
    expect(() => parseBackupJson(JSON.stringify(wrongApp))).toThrow("no a WASAPEA.ME");

    const malformed = validBackup();
    malformed.contacts[0].phoneE164 = "953385003";
    expect(() => parseBackupJson(JSON.stringify(malformed))).toThrow("E.164");
  });

  test("rejects backups produced by a newer unsupported schema", () => {
    const future = { ...validBackup(), schemaVersion: BACKUP_SCHEMA_VERSION + 1 };
    expect(() => parseBackupJson(JSON.stringify(future))).toThrow("más nuevo");
  });
});
