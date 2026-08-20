import { Check, ClipboardPaste, Globe2, History, LayoutGrid, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import type { CountryItem } from "../../constants/app";
import type { TemplateDensity } from "../../store/useAppStore";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { SettingsRow, SettingsSection } from "./SettingsSection";

interface PreferencesSettingsProps {
  colors: ThemeColors;
  country: CountryItem;
  autoDetectClipboard: boolean;
  logHistoryEnabled: boolean;
  templateDensity: TemplateDensity;
  onCountryPress: () => void;
  onAutoDetectChange: (enabled: boolean) => void;
  onLogHistoryChange: (enabled: boolean) => void;
  onTemplateDensityChange: (density: TemplateDensity) => void;
}

const densityOptions: { id: TemplateDensity; badge: string; label: string; sub: string }[] = [
  { id: "large", badge: "Opción 1", label: "Carrusel Grande", sub: "Horizontal tradicional (deslizable)" },
  { id: "grid2x2", badge: "Opción 2", label: "Cuadrícula 2 × 2", sub: "2 filas de 2 tarjetas cada una" },
  { id: "grid2x3", badge: "Opción 3", label: "Cuadrícula 2 × 3", sub: "2 filas de 3 tarjetas cada una" }
];

export function PreferencesSettings({
  colors,
  country,
  autoDetectClipboard,
  logHistoryEnabled,
  templateDensity,
  onCountryPress,
  onAutoDetectChange,
  onLogHistoryChange,
  onTemplateDensityChange
}: PreferencesSettingsProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOpt = densityOptions.find((opt) => opt.id === templateDensity) || densityOptions[0];

  return (
    <SettingsSection title="PREFERENCIAS" colors={colors}>
      <SettingsRow
        icon={Globe2}
        title="País predeterminado"
        subtitle={`${country.flag} ${country.name} (${country.code})`}
        colors={colors}
        onPress={onCountryPress}
      />
      <SettingsRow
        icon={ClipboardPaste}
        title="Detectar portapapeles"
        subtitle="Sugerir números copiados al abrir la aplicación"
        colors={colors}
        trailing={
          <Switch
            value={autoDetectClipboard}
            onValueChange={onAutoDetectChange}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        }
      />
      <SettingsRow
        icon={History}
        title="Registrar historial"
        subtitle="Guardar búsquedas y acciones en el historial local"
        colors={colors}
        trailing={
          <Switch
            value={logHistoryEnabled}
            onValueChange={onLogHistoryChange}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        }
      />
      <SettingsRow
        icon={LayoutGrid}
        title="Diseño de plantillas"
        subtitle={selectedOpt.label}
        colors={colors}
        onPress={() => setModalVisible(true)}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleGroup}>
                <LayoutGrid size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Diseño de plantillas</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {densityOptions.map((opt) => {
                const isSelected = templateDensity === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      onTemplateDensityChange(opt.id);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? colors.primary + "18" : colors.inputBg,
                        borderColor: isSelected ? colors.primary : colors.cardBorder
                      }
                    ]}
                  >
                    <View style={styles.optionTextCol}>
                      <Text style={[styles.optionBadge, { color: isSelected ? colors.primary : colors.subtext }]}>
                        {opt.badge}
                      </Text>
                      <Text style={[styles.optionLabel, { color: isSelected ? colors.text : colors.subtext }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.optionSub, { color: colors.subtext }]}>{opt.sub}</Text>
                    </View>
                    {isSelected && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md
  },
  backdrop: {
    ...StyleSheet.absoluteFill
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16
  },
  closeBtn: {
    padding: 4
  },
  optionsList: {
    gap: 8
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  optionTextCol: {
    flex: 1,
    paddingRight: 8
  },
  optionBadge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  optionLabel: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13.5,
    marginTop: 1
  },
  optionSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 1
  }
});
