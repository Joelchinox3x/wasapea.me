import React, { useCallback } from "react";
import { StyleSheet, Switch, Text } from "react-native";
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { AppMode, useAppStore } from "../store/useAppStore";
import { ThemeColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";

interface AppModeSelectorProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
  colors: ThemeColors;
  transient?: boolean;
  compact?: boolean;
  showVip?: boolean;
  onVipPress?: () => void;
}

export function AppModeSelector({
  mode,
  onChange,
  colors,
  transient = false,
  compact = false,
  showVip = false,
  onVipPress
}: AppModeSelectorProps) {
  const lastElevatedMode = useAppStore((state) => state.lastElevatedMode);
  const renderOption = useCallback(
    (value: AppMode, label: string) => {
      const selected = mode === value;
      return (
        <ScalePressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={`Cambiar a versión ${label}`}
          onPress={() => onChange(value)}
          style={[
            styles.option,
            showVip && styles.optionThree,
            {
              backgroundColor: selected ? colors.primary : "transparent"
            }
          ]}
        >
          <Text style={[styles.optionText, { color: selected ? "#FFFFFF" : colors.subtext }]}>{label}</Text>
        </ScalePressable>
      );
    },
    [colors.primary, colors.subtext, mode, onChange, showVip]
  );

  if (compact) {
    const elevatedMode = mode === "pro" || mode === "vip";
    return (
      <Animated.View
        entering={transient ? FadeInUp.duration(280) : undefined}
        exiting={transient ? FadeOutUp.duration(240) : undefined}
        style={styles.compactContainer}
      >
        <Switch
          value={elevatedMode}
          onValueChange={(enabled) => onChange(enabled ? lastElevatedMode : "simple")}
          trackColor={{ false: colors.cardBorder, true: mode === "vip" ? colors.warning : colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.cardBorder}
          accessibilityLabel={`Versión ${mode === "vip" ? "VIP" : mode === "pro" ? "Pro" : "Simple"}`}
          accessibilityHint="Cambia entre la versión Simple y Pro"
          style={styles.compactSwitch}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={transient ? FadeInUp.duration(280) : undefined}
      exiting={transient ? FadeOutUp.duration(240) : undefined}
      layout={LinearTransition.duration(240)}
      style={[
        styles.container,
        showVip && styles.containerThree,
        { backgroundColor: colors.glass, borderColor: colors.glassBorder }
      ]}
    >
      {renderOption("simple", "Simple")}
      {renderOption("pro", "Pro")}
      {showVip && (
        <ScalePressable
          accessibilityRole="button"
          accessibilityState={{ selected: mode === "vip" }}
          accessibilityLabel="Conocer la versión VIP"
          onPress={onVipPress}
          style={[
            styles.option,
            styles.optionThree,
            { backgroundColor: mode === "vip" ? colors.warning : colors.warning + "18" }
          ]}
        >
          <Text style={[styles.optionText, { color: mode === "vip" ? "#111827" : colors.warning }]}>VIP</Text>
        </ScalePressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  compactSwitch: {
    transform: [{ scaleX: 0.88 }, { scaleY: 0.88 }]
  },
  container: {
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: spacing.xxs,
    gap: spacing.xxs
  },
  containerThree: {
    alignSelf: "stretch"
  },
  option: {
    minWidth: 104,
    minHeight: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  optionThree: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.xs
  },
  optionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    letterSpacing: 0.2
  }
});
