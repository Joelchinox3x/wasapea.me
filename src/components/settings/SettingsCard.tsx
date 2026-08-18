import React, { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import type { ThemeColors } from "../../theme/colors";
import { radius, spacing } from "../../theme/designSystem";

interface SettingsCardProps extends PropsWithChildren {
  colors: ThemeColors;
  style?: ViewStyle;
}

export function SettingsCard({ colors, style, children }: SettingsCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md
  }
});
