import { CircleAlert, CheckCircle2, Info, X } from "lucide-react-native";
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../store/useAppStore";
import { fonts, radius, spacing } from "../theme/designSystem";

const DEFAULT_DURATION = 2_600;

export function AppToastHost() {
  const insets = useSafeAreaInsets();
  const toast = useAppStore((state) => state.toast);
  const hideToast = useAppStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => hideToast(toast.id), toast.duration ?? DEFAULT_DURATION);
    return () => clearTimeout(timer);
  }, [hideToast, toast]);

  if (!toast) return null;

  const tone = toast.tone ?? "info";
  const backgroundColor = tone === "success" ? "#059669" : tone === "error" ? "#DC2626" : "#2563EB";
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : Info;

  return (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeInDown.springify().damping(15).stiffness(220).mass(0.7)}
        exiting={FadeOutUp.duration(180)}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[styles.positioner, { top: insets.top + spacing.sm }]}
      >
        <View style={[styles.toast, { backgroundColor }]}> 
          <View style={[styles.iconShell, tone === "success" && styles.successIconShell]}>
            {tone === "success" ? (
              <LottieView
                key={toast.id}
                source={require("../../assets/lotties/success-check.json")}
                autoPlay
                loop={false}
                speed={1.25}
                resizeMode="contain"
                style={styles.successAnimation}
                webStyle={{ width: 56, height: 56 }}
              />
            ) : (
              <Icon size={20} color="#FFFFFF" strokeWidth={2.3} />
            )}
          </View>
          <Text style={styles.message} numberOfLines={3} maxFontSizeMultiplier={1.2}>
            {toast.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar aviso"
            hitSlop={8}
            onPress={() => hideToast(toast.id)}
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          >
            <X size={17} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10_000,
    elevation: 100,
    pointerEvents: "box-none"
  },
  positioner: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    alignItems: "center",
    pointerEvents: "box-none"
  },
  toast: {
    width: "100%",
    maxWidth: 430,
    minHeight: 62,
    borderRadius: radius.lg,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 14
  },
  iconShell: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)"
  },
  successIconShell: {
    width: 52,
    height: 52,
    backgroundColor: "rgba(255, 255, 255, 0.10)"
  },
  successAnimation: {
    width: 56,
    height: 56
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: spacing.sm
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  closeButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    transform: [{ scale: 0.92 }]
  }
});
