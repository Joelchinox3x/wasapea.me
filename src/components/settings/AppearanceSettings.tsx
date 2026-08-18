import { Check, MonitorSmartphone, Moon, Palette, Sun, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeMode } from "../../store/useAppStore";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";
import { SettingsRow, SettingsSection } from "./SettingsSection";

interface AppearanceSettingsProps {
  mode: ThemeMode;
  colors: ThemeColors;
  onChange: (mode: ThemeMode) => void;
}

const OPTIONS = [
  { id: "system" as const, label: "Sistema", description: "Usar el tema del teléfono", icon: MonitorSmartphone },
  { id: "light" as const, label: "Claro", description: "Fondo claro y alto contraste", icon: Sun },
  { id: "dark" as const, label: "Oscuro", description: "Fondo oscuro y menor brillo", icon: Moon }
];

export function AppearanceSettings({ mode, colors, onChange }: AppearanceSettingsProps) {
  const [visible, setVisible] = useState(false);
  const current = OPTIONS.find((option) => option.id === mode) ?? OPTIONS[0];

  const select = (nextMode: ThemeMode) => {
    onChange(nextMode);
    setVisible(false);
  };

  return (
    <>
      <SettingsSection title="APARIENCIA" colors={colors}>
        <SettingsRow
          icon={Palette}
          title="Tema"
          subtitle="Apariencia de la aplicación"
          value={current.label}
          colors={colors}
          onPress={() => setVisible(true)}
          last
        />
      </SettingsSection>

      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setVisible(false)}>
        <View style={styles.root}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} accessibilityLabel="Cerrar selector de tema" />
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
            <View style={styles.header}>
              <View style={styles.headingCopy}>
                <Text style={[styles.title, { color: colors.text }]}>Apariencia</Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]}>Selecciona el tema de WASAPEA.ME</Text>
              </View>
              <ScalePressable
                onPress={() => setVisible(false)}
                style={[styles.close, { backgroundColor: colors.badgeBg }]}
                accessibilityLabel="Cerrar"
              >
                <X size={18} color={colors.subtext} />
              </ScalePressable>
            </View>

            {OPTIONS.map((option) => {
              const selected = option.id === mode;
              const Icon = option.icon;
              return (
                <ScalePressable
                  key={option.id}
                  onPress={() => select(option.id)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? `${colors.primary}14` : colors.inputBg,
                      borderColor: selected ? colors.primary : colors.cardBorder
                    }
                  ]}
                >
                  <View style={[styles.iconShell, { backgroundColor: `${colors.primary}1F` }]}>
                    <Icon size={22} color={colors.primary} />
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>{option.label}</Text>
                    <Text style={[styles.optionText, { color: colors.subtext }]}>{option.description}</Text>
                  </View>
                  {selected ? <Check size={20} color={colors.primary} /> : null}
                </ScalePressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(2, 6, 23, 0.76)"
  },
  modalCard: {
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
    minHeight: 74,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center"
  },
  iconShell: {
    width: 44,
    height: 44,
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
    fontSize: 14
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2
  }
});
