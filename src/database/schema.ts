import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    color: text("color").notNull().default("#10B981"),
    icon: text("icon").notNull().default("tag"),
    isDefault: integer("is_default").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at")
  },
  (table) => [
    index("idx_categories_name").on(table.name)
  ]
);

export const contacts = sqliteTable(
  "contacts",
  {
    id: text("id").primaryKey(),
    phoneE164: text("phone_e164").notNull(),
    phoneFormatted: text("phone_formatted").notNull(),
    countryCode: text("country_code").notNull(),
    countryIso: text("country_iso").notNull(),
    name: text("name").notNull(),
    company: text("company"),
    note: text("note"),
    categoryId: text("category_id").references(() => categories.id),
    favorite: integer("favorite").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    archivedAt: text("archived_at"),
    deletedAt: text("deleted_at")
  },
  (table) => [
    uniqueIndex("unique_contacts_phone_e164").on(table.phoneE164),
    index("idx_contacts_e164").on(table.phoneE164),
    index("idx_contacts_name").on(table.name),
    index("idx_contacts_updated").on(table.updatedAt)
  ]
);

export const phoneHistory = sqliteTable(
  "phone_history",
  {
    id: text("id").primaryKey(),
    phoneE164: text("phone_e164").notNull(),
    phoneFormatted: text("phone_formatted").notNull(),
    countryCode: text("country_code").notNull(),
    countryIso: text("country_iso").notNull(),
    name: text("name"),
    firstInteractionAt: text("first_interaction_at").notNull(),
    lastInteractionAt: text("last_interaction_at").notNull(),
    interactionCount: integer("interaction_count").notNull().default(1),
    favorite: integer("favorite").notNull().default(0),
    archived: integer("archived").notNull().default(0),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at")
  },
  (table) => [
    uniqueIndex("unique_history_phone_e164").on(table.phoneE164),
    index("idx_history_e164").on(table.phoneE164),
    index("idx_history_last_interaction").on(table.lastInteractionAt)
  ]
);

export const communicationActions = sqliteTable(
  "communication_actions",
  {
    id: text("id").primaryKey(),
    historyId: text("history_id").references(() => phoneHistory.id, { onDelete: "cascade" }),
    actionType: text("action_type").notNull(),
    createdAt: text("created_at").notNull(),
    metadata: text("metadata")
  },
  (table) => [
    index("idx_actions_history_id").on(table.historyId),
    index("idx_actions_created_at").on(table.createdAt)
  ]
);

export const reminders = sqliteTable(
  "reminders",
  {
    id: text("id").primaryKey(),
    contactId: text("contact_id"),
    phoneE164: text("phone_e164").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    scheduledAt: text("scheduled_at").notNull(),
    notificationId: text("notification_id"),
    completed: integer("completed").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at")
  },
  (table) => [
    index("idx_reminders_contact_id").on(table.contactId),
    index("idx_reminders_scheduled_at").on(table.scheduledAt)
  ]
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull()
});

export const messageTemplates = sqliteTable(
  "message_templates",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull().default("general"),
    color: text("color").notNull().default("#10B981"),
    isDefault: integer("is_default").notNull().default(0),
    favorite: integer("favorite").notNull().default(0),
    useCount: integer("use_count").notNull().default(0),
    lastUsedAt: text("last_used_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull()
  },
  (table) => [
    index("idx_message_templates_updated").on(table.updatedAt),
    index("idx_message_templates_last_used").on(table.lastUsedAt)
  ]
);

export const savedAppointmentLocations = sqliteTable(
  "saved_appointment_locations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    mapUrl: text("map_url"),
    kind: text("kind").notNull().default("physical"),
    isDefault: integer("is_default").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull()
  },
  (table) => [
    index("idx_saved_appointment_locations_default").on(table.isDefault),
    index("idx_saved_appointment_locations_updated").on(table.updatedAt)
  ]
);
