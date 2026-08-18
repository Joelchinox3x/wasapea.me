import { FilePlus2, Pencil, Save, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import type { CreateMessageTemplateParams, MessageTemplateItem } from "../../domain/models";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface MessageTemplateModalProps {
  visible: boolean;
  colors: ThemeColors;
  template: MessageTemplateItem | null;
  initialContent?: string;
  onClose: () => void;
  onSave: (params: CreateMessageTemplateParams) => Promise<void>;
}

export function MessageTemplateModal({
  visible,
  colors,
  template,
  initialContent = "",
  onClose,
  onSave
}: MessageTemplateModalProps) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [content, setContent] = useState(template?.content ?? initialContent);
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length >= 2 && content.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        category: template?.category ?? "general",
        color: colors.primary
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.root}
      >
        <Pressable style={styles.backdrop} onPress={saving ? undefined : onClose} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}> 
          <View style={styles.header}>
            <View style={[styles.iconShell, { backgroundColor: colors.primary + "1F" }]}> 
              {template ? <Pencil size={21} color={colors.primary} /> : <FilePlus2 size={22} color={colors.primary} />}
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>
                {template ? "Editar plantilla" : "Nueva plantilla"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>Guárdala para reutilizarla cuando quieras.</Text>
            </View>
            <ScalePressable
              onPress={onClose}
              disabled={saving}
              accessibilityLabel="Cerrar editor de plantilla"
              style={[styles.closeButton, { backgroundColor: colors.badgeBg }]}
            >
              <X size={19} color={colors.subtext} />
            </ScalePressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ej. Confirmación de pedido"
              placeholderTextColor={colors.subtext}
              maxLength={60}
              style={[styles.nameInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
            />

            <View style={styles.messageLabelRow}>
              <Text style={[styles.label, styles.messageLabel, { color: colors.text }]}>Mensaje</Text>
              <Text style={[styles.counter, { color: colors.subtext }]}>{content.length}/3000</Text>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Escribe el mensaje de la plantilla..."
              placeholderTextColor={colors.subtext}
              multiline
              textAlignVertical="top"
              maxLength={3000}
              style={[styles.messageInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
            />
          </ScrollView>

          <View style={styles.footer}>
            <ScalePressable
              onPress={onClose}
              disabled={saving}
              style={[styles.secondaryButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
            >
              <Text style={[styles.secondaryText, { color: colors.text }]}>Cancelar</Text>
            </ScalePressable>
            <ScalePressable
              onPress={() => void handleSave()}
              disabled={!canSave}
              style={[styles.saveButton, { backgroundColor: colors.primary }, !canSave && styles.disabled]}
            >
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Save size={18} color="#FFFFFF" />}
              <Text style={styles.saveText}>{saving ? "Guardando..." : "Guardar"}</Text>
            </ScalePressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.md },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(2, 6, 23, 0.78)" },
  card: { width: "100%", maxWidth: 440, maxHeight: "88%", borderRadius: radius.xl, borderWidth: 1, padding: spacing.md },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  iconShell: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, marginHorizontal: spacing.sm },
  title: { fontFamily: fonts.displayBold, fontSize: 20 },
  subtitle: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 1 },
  closeButton: { width: 36, height: 36, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, marginBottom: 6 },
  nameInput: { minHeight: 46, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, fontFamily: fonts.body, fontSize: 14, marginBottom: spacing.md },
  messageLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  messageLabel: { marginBottom: 6 },
  counter: { fontFamily: fonts.body, fontSize: 10.5 },
  messageInput: { minHeight: 150, maxHeight: 260, borderRadius: radius.md, borderWidth: 1, padding: spacing.sm, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  footer: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  secondaryButton: { flex: 1, minHeight: 48, borderRadius: radius.lg, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  saveButton: { flex: 1.35, minHeight: 48, borderRadius: radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  saveText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 13 },
  disabled: { opacity: 0.45 }
});
