import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";
import { DEFAULT_MESSAGE_TEMPLATES } from "../constants/messageTemplates";

const DB_NAME = "wasapeame.db";

export const expoDb = SQLite.openDatabaseSync(DB_NAME);
export const db = drizzle(expoDb, { schema });

export class DatabaseInitializationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DatabaseInitializationError";
  }
}

/**
 * Initializes SQLite database tables and default seed categories if missing.
 */
export async function initDatabase(): Promise<void> {
  try {
    // WAL cannot be enabled from inside a transaction.
    expoDb.execSync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    expoDb.withTransactionSync(() => {
      expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#3B82F6',
        icon TEXT NOT NULL DEFAULT 'tag',
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY NOT NULL,
        phone_e164 TEXT UNIQUE NOT NULL,
        phone_formatted TEXT NOT NULL,
        country_code TEXT NOT NULL,
        country_iso TEXT NOT NULL,
        name TEXT NOT NULL,
        company TEXT,
        note TEXT,
        category_id TEXT REFERENCES categories(id),
        favorite INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        archived_at TEXT,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_contacts_e164 ON contacts(phone_e164);
      CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
      CREATE INDEX IF NOT EXISTS idx_contacts_updated ON contacts(updated_at);

      CREATE TABLE IF NOT EXISTS phone_history (
        id TEXT PRIMARY KEY NOT NULL,
        phone_e164 TEXT UNIQUE NOT NULL,
        phone_formatted TEXT NOT NULL,
        country_code TEXT NOT NULL,
        country_iso TEXT NOT NULL,
        name TEXT,
        first_interaction_at TEXT NOT NULL,
        last_interaction_at TEXT NOT NULL,
        interaction_count INTEGER NOT NULL DEFAULT 1,
        favorite INTEGER NOT NULL DEFAULT 0,
        archived INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_history_e164 ON phone_history(phone_e164);
      CREATE INDEX IF NOT EXISTS idx_history_last_interaction ON phone_history(last_interaction_at);

      CREATE TABLE IF NOT EXISTS communication_actions (
        id TEXT PRIMARY KEY NOT NULL,
        history_id TEXT REFERENCES phone_history(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        metadata TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_actions_history_id ON communication_actions(history_id);
      CREATE INDEX IF NOT EXISTS idx_actions_created_at ON communication_actions(created_at);

      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY NOT NULL,
        contact_id TEXT,
        phone_e164 TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        scheduled_at TEXT NOT NULL,
        notification_id TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_reminders_contact_id ON reminders(contact_id);
      CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON reminders(scheduled_at);

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS message_templates (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        color TEXT NOT NULL DEFAULT '#10B981',
        is_default INTEGER NOT NULL DEFAULT 0,
        favorite INTEGER NOT NULL DEFAULT 0,
        use_count INTEGER NOT NULL DEFAULT 0,
        last_used_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_message_templates_updated ON message_templates(updated_at);
      CREATE INDEX IF NOT EXISTS idx_message_templates_last_used ON message_templates(last_used_at);

      CREATE TABLE IF NOT EXISTS saved_appointment_locations (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        map_url TEXT,
        kind TEXT NOT NULL DEFAULT 'physical',
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_saved_appointment_locations_default
        ON saved_appointment_locations(is_default);
      CREATE INDEX IF NOT EXISTS idx_saved_appointment_locations_updated
        ON saved_appointment_locations(updated_at);
      `);

      // Existing installations may have been created before these nullable
      // columns were added. Migrate atomically without losing user data.
      ensureColumn("categories", "updated_at", "TEXT");
      ensureColumn("categories", "deleted_at", "TEXT");
      ensureColumn("contacts", "deleted_at", "TEXT");
      ensureColumn("phone_history", "updated_at", "TEXT");
      ensureColumn("phone_history", "deleted_at", "TEXT");
      ensureColumn("reminders", "updated_at", "TEXT");
      ensureColumn("reminders", "deleted_at", "TEXT");

      seedDefaultCategories();
      seedDefaultMessageTemplates();
    });
  } catch (error) {
    console.error("Failed to initialize SQLite database:", error);
    throw new DatabaseInitializationError(
      "No se pudo preparar la base de datos local de WASAPEA.ME.",
      { cause: error }
    );
  }
}

function seedDefaultMessageTemplates(): void {
  for (const template of DEFAULT_MESSAGE_TEMPLATES) {
    expoDb.runSync(
      `INSERT OR IGNORE INTO message_templates
        (id, title, content, category, color, is_default, favorite, use_count, last_used_at, created_at, updated_at)
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
  }
}

function ensureColumn(tableName: string, columnName: string, definition: string): void {
  const columns = expoDb.getAllSync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  if (columns.some((column) => column.name === columnName)) return;
  expoDb.execSync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function seedDefaultCategories(): void {
  const existing = expoDb.getFirstSync<{ count: number }>("SELECT COUNT(*) as count FROM categories");
  if (existing && existing.count > 0) return;

  const now = new Date().toISOString();
  const defaultCats = [
    { id: "cat-clientes", name: "Clientes", color: "#10B981", icon: "user-check", isDefault: 1, createdAt: now },
    { id: "cat-proveedores", name: "Proveedores", color: "#F59E0B", icon: "truck", isDefault: 1, createdAt: now },
    { id: "cat-trabajo", name: "Trabajo", color: "#3B82F6", icon: "briefcase", isDefault: 1, createdAt: now },
    { id: "cat-personal", name: "Personal", color: "#8B5CF6", icon: "smile", isDefault: 1, createdAt: now },
    { id: "cat-temporal", name: "Temporal", color: "#64748B", icon: "clock", isDefault: 1, createdAt: now }
  ];

  for (const cat of defaultCats) {
    expoDb.runSync(
      "INSERT INTO categories (id, name, color, icon, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [cat.id, cat.name, cat.color, cat.icon, cat.isDefault, cat.createdAt]
    );
  }
}
