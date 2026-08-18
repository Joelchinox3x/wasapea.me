import { APP_NAME, APP_VERSION } from "../constants/app";
import { importBackupData } from "../database/BackupImportGateway";
import {
  BACKUP_SCHEMA_VERSION,
  BackupImportResult,
  BackupPreview,
  WasapeameBackupFormat
} from "../domain/backup";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { ContactRepository } from "../repositories/ContactRepository";
import { HistoryRepository } from "../repositories/HistoryRepository";
import { ReminderRepository } from "../repositories/ReminderRepository";
import { MessageTemplateRepository } from "../repositories/MessageTemplateRepository";
import { parseBackupJson } from "./BackupValidation";

export type { BackupImportResult, BackupPreview, WasapeameBackupFormat } from "../domain/backup";

export class ExportImportService {
  /**
   * Generates a complete JSON backup payload.
   */
  static async generateJsonBackup(): Promise<WasapeameBackupFormat> {
    const [categories, contacts, history, actions, reminders, messageTemplates] = await Promise.all([
      CategoryRepository.getAll(),
      ContactRepository.getAll(),
      HistoryRepository.getAll({ limit: 50_000 }),
      HistoryRepository.getAllActions(),
      ReminderRepository.getAll(),
      MessageTemplateRepository.getAll()
    ]);

    return {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appName: APP_NAME,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      categories,
      contacts,
      history,
      actions,
      reminders,
      messageTemplates
    };
  }

  /**
   * Generates a CSV string representation of internal contacts.
   */
  static async generateContactsCsv(): Promise<string> {
    const contactsList = await ContactRepository.getAll();
    const headers = ["Nombre", "Telefono_E164", "Telefono_Formateado", "Pais", "Empresa", "Notas", "Favorito", "Fecha_Creacion"];
    const rows = contactsList.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.phoneE164}"`,
      `"${c.phoneFormatted}"`,
      `"${c.countryIso}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${(c.note || "").replace(/"/g, '""')}"`,
      c.favorite === 1 ? "SI" : "NO",
      `"${c.createdAt}"`
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  /**
   * Validates and imports a JSON backup, skipping duplicate E.164 entries safely.
   */
  static async inspectJsonBackup(jsonString: string): Promise<BackupPreview> {
    const payload = parseBackupJson(jsonString);
    const [existingContacts, existingHistory] = await Promise.all([
      ContactRepository.getAll(),
      HistoryRepository.getAll({ limit: 50_000 })
    ]);
    const contactPhones = new Set(existingContacts.map((item) => item.phoneE164));
    const historyPhones = new Set(existingHistory.map((item) => item.phoneE164));

    return {
      schemaVersion: payload.schemaVersion,
      exportedAt: payload.exportedAt,
      categories: payload.categories.length,
      contacts: payload.contacts.length,
      history: payload.history.length,
      actions: payload.actions.length,
      reminders: payload.reminders.length,
      messageTemplates: payload.messageTemplates.length,
      existingContacts: payload.contacts.filter((item) => contactPhones.has(item.phoneE164)).length,
      existingHistory: payload.history.filter((item) => historyPhones.has(item.phoneE164)).length
    };
  }

  static async importJsonBackup(jsonString: string): Promise<BackupImportResult> {
    const payload = parseBackupJson(jsonString);
    return await importBackupData(payload);
  }
}
