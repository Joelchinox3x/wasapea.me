import { readWebCollection, webStorageKeys, writeWebCollection } from "../database/webStorage";
import type { CategoryItemData } from "../domain/models";
import type { CategoryRepositoryContract } from "../domain/repositoryContracts";

export type { CategoryItemData } from "../domain/models";

export class CategoryRepository {
  static async getAll(): Promise<CategoryItemData[]> {
    return readWebCollection<CategoryItemData>(webStorageKeys.categories);
  }

  static async getById(id: string): Promise<CategoryItemData | null> {
    return (await this.getAll()).find((category) => category.id === id) ?? null;
  }

  static async create(data: { name: string; color?: string; icon?: string }): Promise<CategoryItemData> {
    const categories = await this.getAll();
    const category: CategoryItemData = {
      id: `cat-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      color: data.color || "#3B82F6",
      icon: data.icon || "tag",
      isDefault: 0,
      createdAt: new Date().toISOString()
    };
    writeWebCollection(webStorageKeys.categories, [...categories, category]);
    return category;
  }

  static async update(id: string, data: { name?: string; color?: string; icon?: string }): Promise<void> {
    const categories = (await this.getAll()).map((category) =>
      category.id === id
        ? {
            ...category,
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            ...(data.color !== undefined ? { color: data.color } : {}),
            ...(data.icon !== undefined ? { icon: data.icon } : {})
          }
        : category
    );
    writeWebCollection(webStorageKeys.categories, categories);
  }

  static async delete(id: string): Promise<void> {
    const categories = (await this.getAll()).filter((category) => category.id !== id);
    writeWebCollection(webStorageKeys.categories, categories);
  }
}

export const categoryRepository: CategoryRepositoryContract = CategoryRepository;
