import { X } from "lucide-react-native";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface ClipboardDetectionBannerProps {
  candidate: string;
  colors: ThemeColors;
  onUse: () => void;
  onDismiss: () => void;
}

export function ClipboardDetectionBanner({ candidate, colors, onUse, onDismiss }: ClipboardDetectionBannerProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      exiting={FadeOutUp.duration(220)}
      style={[styles.banner, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
    >
      <View style={styles.identity}>
        <View style={[styles.icon, { backgroundColor: colors.primary + "1F" }]}> 
          <LottieView
            source={require("../../../assets/lotties/clipboard-detect.json")}
            autoPlay
            loop
            speed={0.8}
            resizeMode="contain"
            colorFilters={[{ keypath: "Icon", color: colors.primary }]}
            style={styles.clipboardAnimation}
            webStyle={{ width: 42, height: 42 }}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.subtext }]}>Número detectado</Text>
          <Text style={[styles.number, { color: colors.text }]} numberOfLines={1}>{candidate}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <ScalePressable style={[styles.useButton, { backgroundColor: colors.primary + "1A" }]} onPress={onUse}>
          <Text style={[styles.useText, { color: colors.primary }]}>Usar</Text>
        </ScalePressable>
        <ScalePressable style={styles.dismissButton} onPress={onDismiss}>
          <X size={21} color={colors.subtext} />
        </ScalePressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  identity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  clipboardAnimation: {
    width: 42,
    height: 42
  },
  copy: {
    flex: 1
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12
  },
  number: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
    marginTop: 2
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  useButton: {
    minHeight: 40,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  useText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  dismissButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  }
});
