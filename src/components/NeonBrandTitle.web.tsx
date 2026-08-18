import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { APP_NAME } from "../constants/app";
import { fonts } from "../theme/designSystem";
import { AppMode } from "../store/useAppStore";

interface NeonBrandTitleProps {
  compact?: boolean;
  mode: AppMode;
}

export function NeonBrandTitle({ compact = false, mode }: NeonBrandTitleProps) {
  const isPro = mode === "pro";
  const isVip = mode === "vip";
  return (
    <View style={styles.container} accessible accessibilityRole="header" accessibilityLabel={APP_NAME}>
      <Text
        aria-hidden
        style={[styles.text, isVip ? styles.outerGlowVip : isPro ? styles.outerGlowPro : styles.outerGlowSimple, compact && styles.compact]}
        numberOfLines={1}
      >
        {APP_NAME}
      </Text>
      <Text
        aria-hidden
        style={[styles.text, isVip ? styles.outlineVip : isPro ? styles.outlinePro : styles.outlineSimple, compact && styles.compact]}
        numberOfLines={1}
      >
        {APP_NAME}
      </Text>
      <Text
        style={[styles.text, isVip ? styles.coreVip : isPro ? styles.corePro : styles.coreSimple, compact && styles.compact]}
        numberOfLines={1}
      >
        {APP_NAME}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    height: 56,
    justifyContent: "center"
  },
  text: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: fonts.displayBold,
    fontSize: 33,
    letterSpacing: -0.6
  },
  outerGlowPro: {
    color: "rgba(16, 185, 129, 0.42)",
    textShadowColor: "#10B981",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22
  },
  outerGlowVip: {
    color: "rgba(245, 158, 11, 0.46)",
    textShadowColor: "#F59E0B",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22
  },
  outerGlowSimple: {
    color: "rgba(16, 185, 129, 0.10)",
    textShadowColor: "rgba(16, 185, 129, 0.20)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5
  },
  outlinePro: {
    color: "#F2FFF9",
    textShadowColor: "#10B981",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7
  },
  outlineVip: {
    color: "#FFF7D6",
    textShadowColor: "#F59E0B",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7
  },
  outlineSimple: {
    color: "#34D399"
  },
  corePro: {
    color: "#F2FFF9",
    textShadowColor: "#10B981",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2
  },
  coreVip: {
    color: "#FFF7D6",
    textShadowColor: "#F59E0B",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2
  },
  coreSimple: {
    color: "#34D399"
  },
  compact: {
    fontSize: 29
  }
});
