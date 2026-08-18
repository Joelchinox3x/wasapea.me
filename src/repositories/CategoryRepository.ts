import { eq } from "drizzle-orm";
import { db } from "../database/db";
import { categories } from "../database/schema";
import type { CategoryItemData } from "../domain/models";
import type { CategoryRepositoryContract } from "../domain/repositoryContracts";

export type { CategoryItemData } from "../domain/models";

export class CategoryRepository {
  static async getAll(): Promise<CategoryItemData[]> {
    return await db.select().from(categories);
  }

  static async getById(id: string): Promise<CategoryItemData | null> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0] || null;
  }

  static async create(data: { name: string; color?: string; icon?: string }): Promise<CategoryItemData> {
    const id = `cat-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newCat = {
      id,
      name: data.name.trim(),
      color: data.color || "#3B82F6",
      icon: data.icon || "tag",
      isDefault: 0,
      createdAt: new Date().toISOString()
    };
    await db.insert(categories).values(newCat);
    return newCat;
  }

  static async update(id: string, data: { name?: string; color?: string; icon?: string }): Promise<void> {
    await db
      .update(categories)
      .set({
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.color ? { color: data.color } : {}),
        ...(data.icon ? { icon: data.icon } : {})
      })
      .where(eq(categories.id, id));
  }

  static async delete(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }
}

export const categoryRepository: CategoryRepositoryContract = CategoryRepository;
