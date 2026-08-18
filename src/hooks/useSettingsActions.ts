import * as DocumentPicker from "expo-document-picker";
import { File as ExpoFile, Paths } from "expo-file-system";
import { useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import type { BackupImportResult, BackupPreview } from "../domain/backup";
import { ContactRepository } from "../repositories/ContactRepository";
import { HistoryRepository } from "../repositories/HistoryRepository";
import { ReminderRepository } from "../repositories/ReminderRepository";
import { MessageTemplateRepository } from "../repositories/MessageTemplateRepository";
import { SavedAppointmentLocationRepository } from "../repositories/SavedAppointmentLocationRepository";
import { ExportImportService } from "../services/ExportImportService";
import { hasProAccess, type AppMode, type AppNotice } from "../store/useAppStore";
import type { HistoryStats } from "../domain/models";

interface BackupCandidate {
  filename: string;
  contents: string;
  preview: BackupPreview;
}

interface UseSettingsActionsOptions {
  appMode: AppMode;
  showNotice: (notice: AppNotice) => void;
}

function downloadWebFile(contents: string, filename: string, mimeType: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function shareFile(contents: string, filename: string, mimeType: string, title: string): Promise<string> {
  if (Platform.OS === "web") {
    downloadWebFile(contents, filename, mimeType);
    return filename;
  }

  const file = new ExpoFile(Paths.cache, filename);
  file.create({ overwrite: true, intermediates: true });
  file.write(contents);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: title });
  }
  return file.uri;
}

async function readPickedFile(): Promise<{ filename: string; contents: string } | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/json"],
    copyToCacheDirectory: true,
    multiple: false,
    base64: false
  });
  if (picked.canceled) return null;
  const asset = picked.assets[0];
  if (asset.size && asset.size > 20 * 1024 * 1024) {
    throw new Error("El respaldo supera el límite de 20 MB.");
  }
  const contents = asset.file ? await asset.file.text() : await new ExpoFile(asset.uri).text();
  return { filename: asset.name, contents };
}

export function useSettingsActions({ appMode, showNotice }: UseSettingsActionsOptions) {
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [backupCandidate, setBackupCandidate] = useState<BackupCandidate | null>(null);
  const [importing, setImporting] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setStats(await HistoryRepository.getStats());
    } catch {
      setStats(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (hasProAccess(appMode)) void loadStats();
    }, [appMode, loadStats])
  );

  const exportJson = useCallback(async () => {
    try {
      const backup = await ExportImportService.generateJsonBackup();
      const filename = `wasapea-me-backup-${Date.now()}.json`;
      const location = await shareFile(
        JSON.stringify(backup, null, 2),
        filename,
        "application/json",
        "Exportar copia de seguridad"
      );
      if (Platform.OS !== "web" && !(await Sharing.isAvailableAsync())) {
        showNotice({ title: "Respaldo creado", message: `Archivo guardado en ${location}`, tone: "success" });
      }
    } catch (error) {
      showNotice({
        title: "No se pudo exportar",
        message: error instanceof Error ? error.message : "No se pudo crear la copia de seguridad.",
        tone: "error"
      });
    }
  }, [showNotice]);

  const exportCsv = useCallback(async () => {
    try {
      const csv = await ExportImportService.generateContactsCsv();
      const filename = `wasapea-me-agenda-${Date.now()}.csv`;
      const location = await shareFile(csv, filename, "text/csv;charset=utf-8", "Exportar agenda CSV");
      if (Platform.OS !== "web" && !(await Sharing.isAvailableAsync())) {
        showNotice({ title: "Agenda exportada", message: `Archivo guardado en ${location}`, tone: "success" });
      }
    } catch (error) {
      showNotice({
        title: "No se pudo exportar",
        message: error instanceof Error ? error.message : "No se pudo crear el archivo de la agenda.",
        tone: "error"
      });
    }
  }, [showNotice]);

  const selectBackup = useCallback(async () => {
    try {
      const picked = await readPickedFile();
      if (!picked) return;
      const preview = await ExportImportService.inspectJsonBackup(picked.contents);
      setBackupCandidate({ ...picked, preview });
    } catch (error) {
      showNotice({
        title: "Respaldo no válido",
        message: error instanceof Error ? error.message : "No se pudo leer el respaldo.",
        tone: "error"
      });
    }
  }, [showNotice]);

  const importBackup = useCallback(async (): Promise<BackupImportResult | null> => {
    if (!backupCandidate) return null;
    setImporting(true);
    try {
      const result = await ExportImportService.importJsonBackup(backupCandidate.contents);
      setBackupCandidate(null);
      await loadStats();
      showNotice({
        title: "Respaldo restaurado",
        message: `${result.importedContacts} contactos, ${result.importedHistory} números de historial, ${result.importedReminders} recordatorios y ${result.importedMessageTemplates} plantillas importadas.`,
        tone: "success"
      });
      return result;
    } catch (error) {
      showNotice({
        title: "No se pudo restaurar",
        message: error instanceof Error ? error.message : "La operación fue cancelada sin aplicar cambios.",
        tone: "error"
      });
      return null;
    } finally {
      setImporting(false);
    }
  }, [backupCandidate, loadStats, showNotice]);

  const clearAllData = useCallback(async () => {
    await Promise.all([
      HistoryRepository.clearAll(),
      ContactRepository.clearAll(),
      MessageTemplateRepository.clearAll(),
      SavedAppointmentLocationRepository.clearAll()
    ]);
    const reminders = await ReminderRepository.getAll();
    await Promise.all(reminders.map((item) => ReminderRepository.delete(item.id)));
    await loadStats();
  }, [loadStats]);

  return {
    stats,
    backupCandidate,
    importing,
    exportJson,
    exportCsv,
    selectBackup,
    importBackup,
    cancelImport: () => setBackupCandidate(null),
    clearAllData,
    reloadStats: loadStats
  };
}
