import { DEFAULT_MESSAGE_TEMPLATES } from "../constants/messageTemplates";
import { readWebCollection, webStorageKeys, writeWebCollection } from "../database/webStorage";
import type { CreateMessageTemplateParams, MessageTemplateItem } from "../domain/models";
import type { MessageTemplateRepositoryContract } from "../domain/repositoryContracts";

function readTemplates(): MessageTemplateItem[] {
  const templates = readWebCollection<MessageTemplateItem>(webStorageKeys.messageTemplates);
  const templateIds = new Set(templates.map((item) => item.id));
  const missingTemplates = DEFAULT_MESSAGE_TEMPLATES.filter((item) => !templateIds.has(item.id));
  if (missingTemplates.length === 0) return templates;
  const completeTemplates = [...templates, ...missingTemplates];
  writeWebCollection(webStorageKeys.messageTemplates, completeTemplates);
  return completeTemplates;
}

export class MessageTemplateRepository {
  static async getAll(): Promise<MessageTemplateItem[]> {
    return readTemplates().sort((a, b) => {
      if (a.favorite !== b.favorite) return b.favorite - a.favorite;
      return (b.lastUsedAt ?? b.updatedAt).localeCompare(a.lastUsedAt ?? a.updatedAt);
    });
  }

  static async create(params: CreateMessageTemplateParams): Promise<MessageTemplateItem> {
    const now = new Date().toISOString();
    const item: MessageTemplateItem = {
      id: `msg-template-custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: params.title.trim(),
      content: params.content.trim(),
      category: params.category,
      color: params.color,
      isDefault: 0,
      favorite: 0,
      useCount: 0,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now
    };
    writeWebCollection(webStorageKeys.messageTemplates, [...readTemplates(), item]);
    return item;
  }

  static async update(id: string, params: Partial<CreateMessageTemplateParams>): Promise<void> {
    const now = new Date().toISOString();
    writeWebCollection(
      webStorageKeys.messageTemplates,
      readTemplates().map((item) => item.id === id
        && item.isDefault !== 1 ? {
            ...item,
            ...(params.title !== undefined ? { title: params.title.trim() } : {}),
            ...(params.content !== undefined ? { content: params.content.trim() } : {}),
            ...(params.category !== undefined ? { category: params.category } : {}),
            ...(params.color !== undefined ? { color: params.color } : {}),
            updatedAt: now
          }
        : item)
    );
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    let favorite = false;
    writeWebCollection(
      webStorageKeys.messageTemplates,
      readTemplates().map((item) => {
        if (item.id !== id) return item;
        favorite = item.favorite !== 1;
        return { ...item, favorite: favorite ? 1 : 0 };
      })
    );
    return favorite;
  }

  static async recordUse(id: string): Promise<void> {
    const now = new Date().toISOString();
    writeWebCollection(
      webStorageKeys.messageTemplates,
      readTemplates().map((item) => item.id === id
        ? { ...item, useCount: item.useCount + 1, lastUsedAt: now, updatedAt: now }
        : item)
    );
  }

  static async delete(id: string): Promise<void> {
    writeWebCollection(
      webStorageKeys.messageTemplates,
      readTemplates().filter((item) => item.id !== id || item.isDefault === 1)
    );
  }

  static async clearAll(): Promise<void> {
    writeWebCollection(webStorageKeys.messageTemplates, DEFAULT_MESSAGE_TEMPLATES);
  }
}

export const messageTemplateRepository: MessageTemplateRepositoryContract = MessageTemplateRepository;
