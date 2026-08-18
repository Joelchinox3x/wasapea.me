import { FileJson2, FileSpreadsheet, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface BackupFormatModalProps {
  visible: boolean;
  colors: ThemeColors;
  onClose: () => void;
  onJson: () => void;
  onCsv: () => void;
}

export function BackupFormatModal({ visible, colors, onClose, onJson, onCsv }: BackupFormatModalProps) {
  const choose = (action: () => void) => {
    onClose();
    setTimeout(action, 220);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar formatos de respaldo" />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
          <View style={styles.header}>
            <View style={styles.headingCopy}>
              <Text style={[styles.title, { color: colors.text }]}>Crear respaldo</Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>Elige el formato que necesitas</Text>
            </View>
            <ScalePressable
              onPress={onClose}
              style={[styles.close, { backgroundColor: colors.badgeBg }]}
              accessibilityLabel="Cerrar"
            >
              <X size={18} color={colors.subtext} />
            </ScalePressable>
          </View>

          <ScalePressable
            onPress={() => choose(onJson)}
            style={[styles.option, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
            accessibilityLabel="Crear respaldo completo JSON"
          >
            <View style={[styles.iconShell, { backgroundColor: `${colors.primary}1F` }]}>
              <FileJson2 size={25} color={colors.primary} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>JSON</Text>
              <Text style={[styles.optionText, { color: colors.subtext }]}>Respaldo completo: agenda, historial y recordatorios</Text>
            </View>
          </ScalePressable>

          <ScalePressable
            onPress={() => choose(onCsv)}
            style={[styles.option, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
            accessibilityLabel="Exportar agenda CSV"
          >
            <View style={[styles.iconShell, { backgroundColor: `${colors.accent}1F` }]}>
              <FileSpreadsheet size={25} color={colors.accent} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>CSV</Text>
              <Text style={[styles.optionText, { color: colors.subtext }]}>Agenda compatible con Excel y otras aplicaciones</Text>
            </View>
          </ScalePressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(2, 6, 23, 0.76)"
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxs
  },
  headingCopy: {
    flex: 1
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  option: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center"
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  optionCopy: {
    flex: 1
  },
  optionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  }
});
