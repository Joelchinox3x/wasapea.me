import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { emeraldGlow, fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";
import type { LiveShaderButtonProps } from "./LiveShaderButton.types";

export type { LiveShaderButtonProps } from "./LiveShaderButton.types";

export function LiveShaderButton({
  title,
  accessibilityLabel = title,
  disabled = false,
  onPress,
  icon: Icon,
  trailingIcon: TrailingIcon,
  gradientColors,
  disabledColor,
  style
}: LiveShaderButtonProps) {
  return (
    <ScalePressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[styles.shell, emeraldGlow, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={disabled ? [disabledColor, disabledColor] : gradientColors}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={styles.button}
      >
        <View pointerEvents="none" style={styles.innerTopGlow} />
        <View pointerEvents="none" style={styles.webShine} />
        <Icon size={23} color="#FFFFFF" strokeWidth={2} />
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          maxFontSizeMultiplier={1.15}
        >
          {title}
        </Text>
        {TrailingIcon ? <TrailingIcon size={20} color="#FFFFFF" strokeWidth={2} /> : null}
      </LinearGradient>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.lg
  },
  button: {
    minHeight: 58,
    borderRadius: radius.lg,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md
  },
  innerTopGlow: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 4,
    borderBottomLeftRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.20)"
  },
  webShine: {
    position: "absolute",
    top: -30,
    bottom: -30,
    left: "44%",
    width: 70,
    opacity: 0.12,
    backgroundColor: "#A7F3D0",
    transform: [{ rotate: "-24deg" }]
  },
  title: {
    color: "#FFFFFF",
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    letterSpacing: 0.1
  },
  disabled: {
    opacity: 0.42,
    shadowOpacity: 0
  }
});
