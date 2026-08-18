import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { darkColors, lightColors } from "../theme/colors";
import { generateQrMatrix, getQrLayout } from "../utils/qrGenerator";
import type {
  PremiumSkiaQrCodeHandle,
  PremiumSkiaQrCodeProps,
} from "./PremiumSkiaQrCode";

const QR_GRADIENT = ["#064E3B", "#0F766E"];

export const PremiumSkiaQrCode = forwardRef<
  PremiumSkiaQrCodeHandle,
  PremiumSkiaQrCodeProps
>(function PremiumSkiaQrCode({ value, size = 230, isDark = false }, ref) {
  const colors = isDark ? darkColors : lightColors;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scanProgress = useSharedValue(0);
  const scanOpacity = useSharedValue(0);
  const { size: matrixSize } = useMemo(
    () => generateQrMatrix(value, "H"),
    [value],
  );
  const { padding, symbolSize } = useMemo(
    () => getQrLayout(matrixSize, size, 4),
    [matrixSize, size],
  );
  const quietZone = matrixSize > 0 ? (size * 4) / matrixSize : 0;

  useImperativeHandle(
    ref,
    () => ({
      makePngBase64: async () => {
        if (!svgRef.current || typeof document === "undefined") return null;
        const svg = new XMLSerializer().serializeToString(svgRef.current);
        const source = URL.createObjectURL(
          new Blob([svg], { type: "image/svg+xml" }),
        );
        try {
          const image = new Image();
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () =>
              reject(new Error("No se pudo renderizar el QR"));
            image.src = source;
          });
          const canvas = document.createElement("canvas");
          canvas.width = size * 2;
          canvas.height = size * 2;
          const context = canvas.getContext("2d");
          if (!context) return null;
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL("image/png").split(",")[1] ?? null;
        } finally {
          URL.revokeObjectURL(source);
        }
      },
    }),
    [size],
  );

  useEffect(() => {
    if (!symbolSize) return;
    scanProgress.set(0);
    scanOpacity.set(0.65);
    scanProgress.set(
      withTiming(symbolSize, {
        duration: 1_050,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
    scanOpacity.set(withDelay(820, withTiming(0, { duration: 230 })));

    return () => {
      cancelAnimation(scanProgress);
      cancelAnimation(scanOpacity);
    };
  }, [scanOpacity, scanProgress, symbolSize, value]);

  const scanStyle = useAnimatedStyle(() => ({
    opacity: scanOpacity.get(),
    transform: [{ translateY: scanProgress.get() }],
  }));

  if (matrixSize === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.invalid,
          { width: size, height: size },
        ]}
      >
        <Text style={{ color: colors.subtext }}>URL inválida</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <QRCode
        value={value}
        size={size}
        color="#064E3B"
        backgroundColor="#FFFFFF"
        quietZone={quietZone}
        ecl="H"
        enableLinearGradient
        linearGradient={QR_GRADIENT}
        gradientDirection={["0%", "0%", "100%", "100%"]}
        getRef={(node) => {
          svgRef.current = node as SVGSVGElement | null;
        }}
        logo={require("../../assets/images/brand-symbol.png")}
        logoSize={size * 0.23}
        logoBackgroundColor="#FFFFFF"
        logoMargin={2}
        logoBorderRadius={size * 0.08}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.scanLine,
          { left: padding, top: padding, width: symbolSize },
          scanStyle,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  invalid: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    position: "absolute",
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(16, 185, 129, 0.72)",
    boxShadow: "0 0 8px rgba(16, 185, 129, 0.65)",
  },
});
