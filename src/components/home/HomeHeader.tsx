import { Crown, Sparkles } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import type { AppMode } from "../../store/useAppStore";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { AppModeSelector } from "../AppModeSelector";
import { NeonBrandTitle } from "../NeonBrandTitle";
import { ScalePressable } from "../ScalePressable";

interface HomeHeaderProps {
  appMode: AppMode;
  showModeSwitch: boolean;
  compact: boolean;
  colors: ThemeColors;
  onModeChange: (mode: AppMode) => void;
  onVipPress: () => void;
}

export function HomeHeader({ appMode, showModeSwitch, compact, colors, onModeChange, onVipPress }: HomeHeaderProps) {
  const isVip = appMode === "vip";
  const elevatedMode = appMode === "pro" || isVip;
  const modeColor = isVip ? colors.warning : colors.primary;
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={[styles.logoShell, compact && styles.logoShellCompact]}>
          <View
            style={[
              styles.logoHalo,
              elevatedMode ? styles.logoHaloPro : styles.logoHaloSimple,
              { backgroundColor: modeColor, shadowColor: modeColor }
            ]}
          />
          <Image
            source={require("../../../assets/images/brand-symbol.png")}
            style={[styles.logo, compact && styles.logoCompact]}
            resizeMode="contain"
          />
        </View>
        <NeonBrandTitle compact={compact} mode={appMode} />
      </View>
      <View style={styles.modeColumn}>
        {elevatedMode && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutUp.duration(150)}
          >
            <ScalePressable
              onPress={onVipPress}
              pressedScale={0.94}
              accessibilityRole="button"
              accessibilityLabel={isVip ? "Abrir estado VIP" : "Conocer versión VIP"}
              style={[styles.proBadge, { backgroundColor: modeColor + "1F", borderColor: modeColor + "77", shadowColor: modeColor }]}
            >
              {isVip ? <Crown size={12} color={modeColor} /> : <Sparkles size={11} color={modeColor} />}
              <Text style={[styles.proBadgeText, { color: modeColor }]}>{isVip ? "VIP" : "PRO"}</Text>
            </ScalePressable>
          </Animated.View>
        )}
        {showModeSwitch && <AppModeSelector mode={appMode} onChange={onModeChange} colors={colors} compact />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    flex: 1,
    minWidth: 0
  },
  modeColumn: {
    width: 54,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.pill
  },
  logoCompact: {
    width: 60,
    height: 60
  },
  logoShell: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center"
  },
  logoShellCompact: {
    width: 64,
    height: 64
  },
  logoHalo: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    shadowOffset: { width: 0, height: 0 }
  },
  logoHaloPro: {
    opacity: 0.25,
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10
  },
  logoHaloSimple: {
    opacity: 0.035,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 46,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  proBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.6
  }
});
