import { CircleAlert, CheckCircle2, Info, X } from "lucide-react-native";
import LottieView from "lottie-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { darkColors, lightColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";

export type NoticeTone = "info" | "success" | "error";

interface NoticeModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  tone?: NoticeTone;
  actionText?: string;
  isDark?: boolean;
}

export function NoticeModal({
  visible,
  title,
  message,
  onClose,
  tone = "info",
  actionText = "Entendido",
  isDark = false
}: NoticeModalProps) {
  const colors = isDark ? darkColors : lightColors;
  const accent = tone === "success" ? colors.primary : tone === "error" ? colors.error : colors.accent;
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : Info;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Cerrar aviso" onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={ZoomIn.duration(220)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}
        >
          <ScalePressable
            onPress={onClose}
            accessibilityLabel="Cerrar"
            style={[styles.closeButton, { backgroundColor: colors.badgeBg }]}
          >
            <X size={18} color={colors.subtext} />
          </ScalePressable>

          <View style={[styles.iconShell, { backgroundColor: accent + "1F" }]}> 
            {tone === "success" ? (
              <LottieView
                source={require("../../assets/lotties/success-check.json")}
                autoPlay
                loop={false}
                speed={1.25}
                resizeMode="contain"
                style={styles.successAnimation}
                webStyle={{ width: 58, height: 58 }}
              />
            ) : (
              <Icon size={26} color={accent} strokeWidth={2} />
            )}
          </View>
          <Text style={[styles.title, { color: colors.text }]} maxFontSizeMultiplier={1.15}>
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.subtext }]} maxFontSizeMultiplier={1.2}>
            {message}
          </Text>

          <ScalePressable onPress={onClose} style={[styles.actionButton, { backgroundColor: accent }]}> 
            <Text style={styles.actionText} maxFontSizeMultiplier={1.15}>{actionText}</Text>
          </ScalePressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(2, 6, 23, 0.76)"
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center"
  },
  closeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  iconShell: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm
  },
  successAnimation: {
    width: 58,
    height: 58
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    textAlign: "center"
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg
  },
  actionButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  actionText: {
    color: "#FFFFFF",
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  }
});
