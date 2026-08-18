import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import type { AppMode } from "../../store/useAppStore";
import type { ThemeColors } from "../../theme/colors";
import { fonts, spacing } from "../../theme/designSystem";
import { AppModeSelector } from "../AppModeSelector";
import { SettingsSection } from "./SettingsSection";

interface AppVersionSettingsProps {
  appMode: AppMode;
  showModeSwitch: boolean;
  colors: ThemeColors;
  onModeChange: (mode: AppMode) => void;
  onVisibilityChange: (visible: boolean) => void;
  onVipPress: () => void;
}

export function AppVersionSettings({
  appMode,
  showModeSwitch,
  colors,
  onModeChange,
  onVisibilityChange,
  onVipPress
}: AppVersionSettingsProps) {
  return (
    <SettingsSection title="VERSIÓN DE LA APLICACIÓN" colors={colors}>
      <View style={styles.selector}>
        <AppModeSelector
          mode={appMode}
          onChange={onModeChange}
          colors={colors}
          showVip
          onVipPress={onVipPress}
        />
      </View>

      <View style={[styles.visibilityRow, { borderTopColor: colors.cardBorder }]}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>Mostrar selector en Inicio</Text>
        <Switch
          value={showModeSwitch}
          onValueChange={onVisibilityChange}
          trackColor={{ false: colors.cardBorder, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  selector: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs
  },
  visibilityRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs
  },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    paddingRight: spacing.sm
  }
});
