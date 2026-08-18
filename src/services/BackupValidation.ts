import { APP_NAME } from "../constants/app";
import { BACKUP_SCHEMA_VERSION, WasapeameBackupFormat } from "../domain/backup";
import type {
  CategoryItemData,
  CommunicationActionEntry,
  ContactReminder,
  InternalContact,
  MessageTemplateCategory,
  MessageTemplateItem,
  PhoneHistoryEntry
} from "../domain/models";

const MAX_ROWS_PER_COLLECTION = 50_000;
const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

type JsonObject = Record<string, unknown>;

function asObject(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} debe ser un objeto.`);
  }
  return value as JsonObject;
}

function asArray(value: unknown, label: string, optional = false): unknown[] {
  if (value === undefined && optional) return [];
  if (!Array.isArray(value)) throw new Error(`${label} debe ser una lista.`);
  if (value.length > MAX_ROWS_PER_COLLECTION) throw new Error(`${label} supera el máximo permitido.`);
  return value;
}

function text(value: unknown, label: string, maxLength = 5_000): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} no es válido.`);
  if (value.length > maxLength) throw new Error(`${label} es demasiado largo.`);
  return value;
}

function optionalText(value: unknown, label: string, maxLength = 5_000): string | null {
  if (value === undefined || value === null || value === "") return null;
  return text(value, label, maxLength);
}

function integer(value: unknown, label: string, fallback = 0): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || Number(value) < 0) throw new Error(`${label} debe ser un entero positivo.`);
  return Number(value);
}

function isoDate(value: unknown, label: string): string {
  const result = text(value, label, 64);
  if (Number.isNaN(Date.parse(result))) throw new Error(`${label} no contiene una fecha válida.`);
  return result;
}

function e164(value: unknown, label: string): string {
  const result = text(value, label, 18);
  if (!E164_PATTERN.test(result)) throw new Error(`${label} no está en formato E.164.`);
  return result;
}

function parseCategory(value: unknown, index: number): CategoryItemData {
  const item = asObject(value, `categories[${index}]`);
  return {
    id: text(item.id, `categories[${index}].id`, 120),
    name: text(item.name, `categories[${index}].name`, 120),
    color: text(item.color, `categories[${index}].color`, 32),
    icon: text(item.icon, `categories[${index}].icon`, 80),
    isDefault: integer(item.isDefault, `categories[${index}].isDefault`),
    createdAt: isoDate(item.createdAt, `categories[${index}].createdAt`)
  };
}

function parseContact(value: unknown, index: number): InternalContact {
  const item = asObject(value, `contacts[${index}]`);
  const createdAt = isoDate(item.createdAt, `contacts[${index}].createdAt`);
  return {
    id: text(item.id, `contacts[${index}].id`, 120),
    phoneE164: e164(item.phoneE164, `contacts[${index}].phoneE164`),
    phoneFormatted: text(item.phoneFormatted, `contacts[${index}].phoneFormatted`, 80),
    countryCode: text(item.countryCode, `contacts[${index}].countryCode`, 8),
    countryIso: text(item.countryIso, `contacts[${index}].countryIso`, 3).toUpperCase(),
    name: text(item.name, `contacts[${index}].name`, 200),
    company: optionalText(item.company, `contacts[${index}].company`, 200),
    note: optionalText(item.note, `contacts[${index}].note`),
    categoryId: optionalText(item.categoryId, `contacts[${index}].categoryId`, 120),
    favorite: integer(item.favorite, `contacts[${index}].favorite`),
    createdAt,
    updatedAt: item.updatedAt ? isoDate(item.updatedAt, `contacts[${index}].updatedAt`) : createdAt,
    archivedAt: item.archivedAt ? isoDate(item.archivedAt, `contacts[${index}].archivedAt`) : null
  };
}

function parseHistory(value: unknown, index: number): PhoneHistoryEntry {
  const item = asObject(value, `history[${index}]`);
  return {
    id: text(item.id, `history[${index}].id`, 120),
    phoneE164: e164(item.phoneE164, `history[${index}].phoneE164`),
    phoneFormatted: text(item.phoneFormatted, `history[${index}].phoneFormatted`, 80),
    countryCode: text(item.countryCode, `history[${index}].countryCode`, 8),
    countryIso: text(item.countryIso, `history[${index}].countryIso`, 3).toUpperCase(),
    name: optionalText(item.name, `history[${index}].name`, 200),
    firstInteractionAt: isoDate(item.firstInteractionAt, `history[${index}].firstInteractionAt`),
    lastInteractionAt: isoDate(item.lastInteractionAt, `history[${index}].lastInteractionAt`),
    interactionCount: integer(item.interactionCount, `history[${index}].interactionCount`, 1),
    favorite: integer(item.favorite, `history[${index}].favorite`),
    archived: integer(item.archived, `history[${index}].archived`)
  };
}

function parseAction(value: unknown, index: number): CommunicationActionEntry {
  const item = asObject(value, `actions[${index}]`);
  return {
    id: text(item.id, `actions[${index}].id`, 120),
    historyId: optionalText(item.historyId, `actions[${index}].historyId`, 120),
    actionType: text(item.actionType, `actions[${index}].actionType`, 40),
    createdAt: isoDate(item.createdAt, `actions[${index}].createdAt`),
    metadata: optionalText(item.metadata, `actions[${index}].metadata`)
  };
}

function parseReminder(value: unknown, index: number): ContactReminder {
  const item = asObject(value, `reminders[${index}]`);
  return {
    id: text(item.id, `reminders[${index}].id`, 120),
    contactId: optionalText(item.contactId, `reminders[${index}].contactId`, 120),
    phoneE164: e164(item.phoneE164, `reminders[${index}].phoneE164`),
    title: text(item.title, `reminders[${index}].title`, 200),
    description: optionalText(item.description, `reminders[${index}].description`),
    scheduledAt: isoDate(item.scheduledAt, `reminders[${index}].scheduledAt`),
    notificationId: optionalText(item.notificationId, `reminders[${index}].notificationId`, 200),
    completed: integer(item.completed, `reminders[${index}].completed`),
    createdAt: isoDate(item.createdAt, `reminders[${index}].createdAt`)
  };
}

const MESSAGE_TEMPLATE_CATEGORIES = new Set<MessageTemplateCategory>([
  "general",
  "sales",
  "payments",
  "appointments",
  "thanks"
]);

function parseMessageTemplate(value: unknown, index: number): MessageTemplateItem {
  const item = asObject(value, `messageTemplates[${index}]`);
  const category = text(item.category, `messageTemplates[${index}].category`, 40) as MessageTemplateCategory;
  if (!MESSAGE_TEMPLATE_CATEGORIES.has(category)) {
    throw new Error(`messageTemplates[${index}].category no es válida.`);
  }
  const createdAt = isoDate(item.createdAt, `messageTemplates[${index}].createdAt`);
  return {
    id: text(item.id, `messageTemplates[${index}].id`, 120),
    title: text(item.title, `messageTemplates[${index}].title`, 60),
    content: text(item.content, `messageTemplates[${index}].content`, 3_000),
    category,
    color: text(item.color, `messageTemplates[${index}].color`, 32),
    isDefault: integer(item.isDefault, `messageTemplates[${index}].isDefault`),
    favorite: integer(item.favorite, `messageTemplates[${index}].favorite`),
    useCount: integer(item.useCount, `messageTemplates[${index}].useCount`),
    lastUsedAt: item.lastUsedAt ? isoDate(item.lastUsedAt, `messageTemplates[${index}].lastUsedAt`) : null,
    createdAt,
    updatedAt: item.updatedAt ? isoDate(item.updatedAt, `messageTemplates[${index}].updatedAt`) : createdAt
  };
}

export function parseBackupJson(jsonString: string): WasapeameBackupFormat {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch {
    throw new Error("El archivo no contiene un JSON válido.");
  }

  const payload = asObject(raw, "El respaldo");
  const schemaVersion = integer(payload.schemaVersion, "schemaVersion", 1);
  if (schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new Error(`Este respaldo usa el formato ${schemaVersion}, más nuevo que el compatible (${BACKUP_SCHEMA_VERSION}).`);
  }

  const appName = text(payload.appName, "appName", 80);
  if (appName.toUpperCase() !== APP_NAME.toUpperCase()) {
    throw new Error(`El archivo pertenece a ${appName}, no a ${APP_NAME}.`);
  }

  return {
    schemaVersion,
    appName,
    version: text(payload.version, "version", 40),
    exportedAt: isoDate(payload.exportedAt, "exportedAt"),
    categories: asArray(payload.categories, "categories", true).map(parseCategory),
    contacts: asArray(payload.contacts, "contacts").map(parseContact),
    history: asArray(payload.history, "history", true).map(parseHistory),
    actions: asArray(payload.actions, "actions", true).map(parseAction),
    reminders: asArray(payload.reminders, "reminders", true).map(parseReminder),
    messageTemplates: asArray(payload.messageTemplates, "messageTemplates", true).map(parseMessageTemplate)
  };
}
