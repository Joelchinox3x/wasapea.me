import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useSharedValue,
  withSequence,
  withSpring
} from "react-native-reanimated";
import { Crown, Sparkles, Zap } from "lucide-react-native";
import { AppMode } from "../store/useAppStore";
import { darkColors, lightColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";

interface ModeTransitionOverlayProps {
  mode: AppMode;
  isDark: boolean;
}

export function ModeTransitionOverlay({ mode, isDark }: ModeTransitionOverlayProps) {
  const [activeBanner, setActiveBanner] = useState<{ mode: AppMode; id: number } | null>(null);
  const colors = isDark ? darkColors : lightColors;
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    setActiveBanner({ mode, id: Date.now() });
    pulseScale.value = withSequence(
      withSpring(1.25, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 12 })
    );

    const timer = setTimeout(() => {
      setActiveBanner(null);
    }, 2200);

    return () => clearTimeout(timer);
  }, [mode, pulseScale]);

  if (!activeBanner) return null;

  const isVip = activeBanner.mode === "vip";
  const isPro = activeBanner.mode === "pro";
  const modeColor = isVip ? colors.warning : isPro ? colors.accent : colors.primary;


  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <Animated.View
        entering={FadeInUp.springify().damping(14).stiffness(140)}
        exiting={FadeOutUp.duration(200)}
        style={[
          styles.banner,
          {
            backgroundColor: isDark ? "#0D1B2A" : "#FFFFFF",
            borderColor: modeColor + "77",
            shadowColor: modeColor
          }
        ]}
      >
        <View style={[styles.iconBadge, { backgroundColor: modeColor + "22" }]}>
          {isVip ? (
            <Crown size={22} color={modeColor} />
          ) : isPro ? (
            <Sparkles size={22} color={modeColor} />
          ) : (
            <Zap size={22} color={modeColor} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: modeColor }]}>
            {isVip ? "¡Modo VIP Activado!" : isPro ? "¡Modo PRO Activado!" : "¡Modo Simple Activado!"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {isVip
              ? "Herramientas avanzadas y acceso exclusivo listos."
              : isPro
              ? "Navbar, Agenda e Historial desplegados."
              : "Marcador ultra-rápido de 1 sola pantalla."}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: "center"
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center"
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    letterSpacing: 0.3
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2
  }
});
