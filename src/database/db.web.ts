import { readWebCollection, webStorageKeys, writeWebCollection } from "./webStorage";
import { DEFAULT_MESSAGE_TEMPLATES } from "../constants/messageTemplates";
import type { MessageTemplateItem } from "../domain/models";

interface WebCategorySeed {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: number;
  createdAt: string;
}

export async function initDatabase(): Promise<void> {
  const existing = readWebCollection<WebCategorySeed>(webStorageKeys.categories);
  if (existing.length === 0) {
    const now = new Date().toISOString();
    writeWebCollection<WebCategorySeed>(webStorageKeys.categories, [
      { id: "cat-clientes", name: "Clientes", color: "#10B981", icon: "user-check", isDefault: 1, createdAt: now },
      { id: "cat-proveedores", name: "Proveedores", color: "#F59E0B", icon: "truck", isDefault: 1, createdAt: now },
      { id: "cat-trabajo", name: "Trabajo", color: "#3B82F6", icon: "briefcase", isDefault: 1, createdAt: now },
      { id: "cat-personal", name: "Personal", color: "#8B5CF6", icon: "smile", isDefault: 1, createdAt: now },
      { id: "cat-temporal", name: "Temporal", color: "#64748B", icon: "clock", isDefault: 1, createdAt: now }
    ]);
  }

  const templates = readWebCollection<MessageTemplateItem>(webStorageKeys.messageTemplates);
  const templateIds = new Set(templates.map((item) => item.id));
  const missingTemplates = DEFAULT_MESSAGE_TEMPLATES.filter((item) => !templateIds.has(item.id));
  if (missingTemplates.length > 0) {
    writeWebCollection(webStorageKeys.messageTemplates, [...templates, ...missingTemplates]);
  }
}
