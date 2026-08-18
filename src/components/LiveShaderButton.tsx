import { Canvas, Fill, Shader } from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  AppStateStatus,
  LayoutChangeEvent,
  PressableProps,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { emeraldGlow, fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";
import { LIVE_BUTTON_SHADER } from "./liveButtonShader";
import type { LiveShaderButtonProps } from "./LiveShaderButton.types";

export type { LiveShaderButtonProps } from "./LiveShaderButton.types";

const SWEEP_DURATION_MS = 820;
const SWEEP_PAUSE_MS = 3_000;

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
  const isFocused = useIsFocused();
  const [reduceMotion, setReduceMotion] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const width = useSharedValue(1);
  const height = useSharedValue(1);
  const phase = useSharedValue(0);
  const energy = useSharedValue(0);
  const canUseShader = LIVE_BUTTON_SHADER !== null && !disabled;
  const shouldAnimate = canUseShader && isFocused && appState === "active" && !reduceMotion;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    cancelAnimation(phase);
    phase.set(0);

    if (shouldAnimate) {
      phase.set(
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: SWEEP_DURATION_MS,
              easing: Easing.inOut(Easing.cubic)
            }),
            withDelay(SWEEP_PAUSE_MS, withTiming(0, { duration: 0 }))
          ),
          -1,
          false
        )
      );
    }

    return () => cancelAnimation(phase);
  }, [phase, shouldAnimate]);

  useEffect(
    () => () => {
      cancelAnimation(energy);
    },
    [energy]
  );

  const uniforms = useDerivedValue(() => ({
    resolution: [Math.max(width.get(), 1), Math.max(height.get(), 1)],
    phase: phase.get(),
    energy: energy.get()
  }));

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      width.set(event.nativeEvent.layout.width);
      height.set(event.nativeEvent.layout.height);
    },
    [height, width]
  );

  const handlePressIn = useCallback<NonNullable<PressableProps["onPressIn"]>>(() => {
    if (!disabled) energy.set(withTiming(1, { duration: 110 }));
  }, [disabled, energy]);

  const handlePressOut = useCallback<NonNullable<PressableProps["onPressOut"]>>(() => {
    energy.set(withTiming(0, { duration: 180 }));
  }, [energy]);

  return (
    <ScalePressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[styles.shell, emeraldGlow, style, disabled && styles.disabled]}
    >
      <View onLayout={handleLayout} style={styles.button}>
        {canUseShader && LIVE_BUTTON_SHADER ? (
          <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Fill>
              <Shader source={LIVE_BUTTON_SHADER} uniforms={uniforms} />
            </Fill>
          </Canvas>
        ) : (
          <LinearGradient
            pointerEvents="none"
            colors={disabled ? [disabledColor, disabledColor] : gradientColors}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.8 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View pointerEvents="none" style={styles.innerTopGlow} />
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
      </View>
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
  title: {
    color: "#FFFFFF",
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    letterSpacing: 0.1
  },
  disabled: {
    opacity: 0.42,
    shadowOpacity: 0,
    elevation: 0
  }
});
