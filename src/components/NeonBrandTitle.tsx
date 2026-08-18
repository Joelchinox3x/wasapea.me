import { Outfit_700Bold } from "@expo-google-fonts/outfit";
import { BlurMask, Canvas, Text as SkiaText, useFont } from "@shopify/react-native-skia";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { APP_NAME } from "../constants/app";
import { fonts } from "../theme/designSystem";
import { AppMode } from "../store/useAppStore";

interface NeonBrandTitleProps {
  compact?: boolean;
  mode: AppMode;
}

const EMERALD = "#10B981";
const GOLD = "#F59E0B";
const CORE_WHITE = "#F2FFF9";
const VIP_CORE = "#FFF7D6";
const SIMPLE_CORE = "#34D399";

export function NeonBrandTitle({ compact = false, mode }: NeonBrandTitleProps) {
  const isPro = mode === "pro";
  const isVip = mode === "vip";
  const glowColor = isVip ? GOLD : EMERALD;
  const fontSize = compact ? 29 : 33;
  const font = useFont(Outfit_700Bold, fontSize);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth !== canvasWidth) setCanvasWidth(nextWidth);
  };

  if (!font) {
    return (
      <Text
        style={[
          styles.fallbackText,
          isVip ? styles.fallbackVip : isPro ? styles.fallbackPro : styles.fallbackSimple,
          compact && styles.fallbackTextCompact
        ]}
        numberOfLines={1}
      >
        {APP_NAME}
      </Text>
    );
  }

  const baseline = compact ? 42 : 45;
  const textWidth = font.measureText(APP_NAME).width;
  const textX = Math.max(10, (canvasWidth - textWidth) / 2);

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      accessible
      accessibilityRole="header"
      accessibilityLabel={APP_NAME}
    >
      <Canvas style={styles.canvas} pointerEvents="none">
        <SkiaText x={textX} y={baseline} text={APP_NAME} font={font} color={glowColor} opacity={isPro || isVip ? 1 : 0.16}>
          <BlurMask blur={isPro || isVip ? 22 : 8} style="outer" />
        </SkiaText>
        <SkiaText x={textX} y={baseline} text={APP_NAME} font={font} color={glowColor} opacity={isPro || isVip ? 1 : 0.24}>
          <BlurMask blur={isPro || isVip ? 9 : 3} style="outer" />
        </SkiaText>
        <SkiaText
          x={textX}
          y={baseline}
          text={APP_NAME}
          font={font}
          color={isVip ? GOLD : isPro ? EMERALD : "#047857"}
          style="stroke"
          strokeWidth={isPro || isVip ? 2.7 : 1.2}
          strokeJoin="round"
        />
        <SkiaText x={textX} y={baseline} text={APP_NAME} font={font} color={isVip ? VIP_CORE : isPro ? CORE_WHITE : SIMPLE_CORE} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    height: 62
  },
  canvas: {
    flex: 1
  },
  fallbackText: {
    flexShrink: 1,
    fontFamily: fonts.displayBold,
    fontSize: 33,
    letterSpacing: -0.6
  },
  fallbackPro: {
    color: CORE_WHITE,
    textShadowColor: EMERALD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22
  },
  fallbackVip: {
    color: VIP_CORE,
    textShadowColor: GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22
  },
  fallbackSimple: {
    color: SIMPLE_CORE,
    textShadowColor: "rgba(16, 185, 129, 0.22)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4
  },
  fallbackTextCompact: {
    fontSize: 29
  }
});
