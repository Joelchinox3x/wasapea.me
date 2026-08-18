import { ArchiveRestore, CalendarClock, FileText, History, Users, X } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { BackupPreview } from "../../domain/backup";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface BackupImportModalProps {
  candidate: { filename: string; preview: BackupPreview } | null;
  colors: ThemeColors;
  importing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BackupImportModal({
  candidate,
  colors,
  importing,
  onCancel,
  onConfirm
}: BackupImportModalProps) {
  const preview = candidate?.preview;
  return (
    <Modal
      visible={candidate !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={importing ? undefined : onCancel} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
          <ScalePressable disabled={importing} onPress={onCancel} style={styles.closeButton}>
            <X size={20} color={colors.subtext} />
          </ScalePressable>
          <View style={[styles.iconShell, { backgroundColor: colors.primary + "1F" }]}>
            <ArchiveRestore size={27} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Revisar respaldo</Text>
          <Text style={[styles.filename, { color: colors.subtext }]} numberOfLines={1}>
            {candidate?.filename}
          </Text>

          {preview && (
            <View style={[styles.summary, { backgroundColor: colors.inputBg }]}>
              <SummaryRow icon={Users} label="Contactos" value={preview.contacts} colors={colors} />
              <SummaryRow icon={History} label="Historial" value={preview.history} colors={colors} />
              <SummaryRow icon={CalendarClock} label="Recordatorios" value={preview.reminders} colors={colors} />
              <SummaryRow icon={FileText} label="Plantillas" value={preview.messageTemplates} colors={colors} />
              <Text style={[styles.duplicates, { color: colors.subtext }]}>
                Ya existentes: {preview.existingContacts} contactos y {preview.existingHistory} números. Se conservarán sin duplicarlos.
              </Text>
            </View>
          )}

          <Text style={[styles.explanation, { color: colors.subtext }]}>
            La restauración es transaccional: si algún dato falla, no se aplicará una importación parcial.
          </Text>

          <ScalePressable
            disabled={importing}
            onPress={onConfirm}
            style={[styles.confirmButton, { backgroundColor: colors.primary }, importing && styles.disabled]}
          >
            {importing && <ActivityIndicator color="#FFFFFF" />}
            <Text style={styles.confirmText}>{importing ? "Restaurando..." : "Restaurar respaldo"}</Text>
          </ScalePressable>
        </View>
      </View>
    </Modal>
  );
}

interface SummaryRowProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: number;
  colors: ThemeColors;
}

function SummaryRow({ icon: Icon, label, value, colors }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Icon size={17} color={colors.primary} />
      <Text style={[styles.summaryLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(2, 6, 23, 0.78)"
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center"
  },
  closeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  },
  iconShell: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 21
  },
  filename: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 3,
    maxWidth: "90%"
  },
  summary: {
    width: "100%",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  summaryLabel: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13
  },
  summaryValue: {
    fontFamily: fonts.displayBold,
    fontSize: 16
  },
  duplicates: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.xxs
  },
  explanation: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginVertical: spacing.md
  },
  confirmButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  confirmText: {
    color: "#FFFFFF",
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  disabled: {
    opacity: 0.65
  }
});
