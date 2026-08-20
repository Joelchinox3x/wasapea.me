import { X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { MessageTemplateRepository } from "../../repositories/MessageTemplateRepository";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface QuickTemplateModalProps {
  visible: boolean;
  colors: ThemeColors;
  onClose: () => void;
  onSaved: () => void;
}

export function QuickTemplateModal({
  visible,
  colors,
  onClose,
  onSaved
}: QuickTemplateModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || loading) return;
    setLoading(true);
    try {
      await MessageTemplateRepository.create({
        title: title.trim(),
        content: content.trim(),
        category: "general",
        color: "#25D366"
      });
      setTitle("");
      setContent("");
      onSaved();
      onClose();
    } catch {
      // Manejar error silenciosamente
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Nueva Plantilla de Mensaje</Text>
            <ScalePressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.subtext} />
            </ScalePressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.subtext }]}>Título / Atajo</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              placeholder="Ej. Confirmación de Pago, Dirección..."
              placeholderTextColor={colors.subtext}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.subtext }]}>Contenido del Mensaje</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              placeholder="Escribe el mensaje prediseñado..."
              placeholderTextColor={colors.subtext}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonsRow}>
            <ScalePressable style={[styles.btn, { backgroundColor: colors.inputBg }]} onPress={onClose}>
              <Text style={[styles.btnText, { color: colors.subtext }]}>Cancelar</Text>
            </ScalePressable>
            <ScalePressable
              style={[
                styles.btn,
                { backgroundColor: colors.primary },
                (!title.trim() || !content.trim()) && styles.btnDisabled
              ]}
              onPress={() => void handleSave()}
              disabled={!title.trim() || !content.trim() || loading}
            >
              <Text style={[styles.btnText, { color: "#FFFFFF", fontWeight: "700" }]}>Guardar Plantilla</Text>
            </ScalePressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  card: {
    width: "100%",
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 17
  },
  closeBtn: {
    padding: 4
  },
  fieldGroup: {
    marginBottom: spacing.sm
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginBottom: 4
  },
  input: {
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  textArea: {
    height: 100,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontFamily: fonts.body,
    fontSize: 13.5,
    textAlignVertical: "top"
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
    marginTop: spacing.md
  },
  btn: {
    minWidth: 88,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  btnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13
  },
  btnDisabled: {
    opacity: 0.5
  }
});
