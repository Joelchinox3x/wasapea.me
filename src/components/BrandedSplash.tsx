import * as SplashScreen from "expo-splash-screen";
import React, { useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";

const EXTRA_HOLD_MS = 500;

export function BrandedSplash({ onFinish }: { onFinish: () => void }) {
  const started = useRef(false);
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.82));
  const [translateY] = useState(() => new Animated.Value(18));
  const [haloOpacity] = useState(() => new Animated.Value(0));
  const [haloScale] = useState(() => new Animated.Value(0.72));

  const startAnimation = () => {
    if (started.current) return;
    started.current = true;

    void SplashScreen.hideAsync().finally(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          }),
          Animated.spring(scale, {
            toValue: 1.04,
            damping: 9,
            stiffness: 125,
            mass: 0.75,
            useNativeDriver: true
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 430,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          }),
          Animated.parallel([
            Animated.timing(haloOpacity, {
              toValue: 0.72,
              duration: 380,
              useNativeDriver: true
            }),
            Animated.timing(haloScale, {
              toValue: 1.18,
              duration: 620,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true
            })
          ])
        ]),
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            damping: 10,
            stiffness: 150,
            useNativeDriver: true
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.18,
            duration: 260,
            useNativeDriver: true
          })
        ]),
        Animated.delay(EXTRA_HOLD_MS),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true
          }),
          Animated.timing(scale, {
            toValue: 1.08,
            duration: 320,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true
          }),
          Animated.timing(haloOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true
          })
        ])
      ]).start(({ finished }) => {
        if (finished) onFinish();
      });
    });
  };

  return (
    <View style={styles.overlay} onLayout={startAnimation}>
      <Animated.View
        style={[
          styles.halo,
          { opacity: haloOpacity, transform: [{ scale: haloScale }] }
        ]}
      />
      <Animated.View
        style={[
          styles.brand,
          { opacity, transform: [{ translateY }, { scale }] }
        ]}
      >
        <Image
          source={require("../../branding/splash-source.png")}
          style={styles.splashArtwork}
          resizeMode="contain"
        />
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07151D"
  },
  brand: {
    width: "86%",
    maxWidth: 360,
    alignItems: "center",
    justifyContent: "center"
  },
  splashArtwork: {
    width: 320,
    maxWidth: "100%",
    height: 320
  },
  halo: {
    position: "absolute",
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#2ED889",
    borderRadius: 125,
    backgroundColor: "#123A35"
  }
});
