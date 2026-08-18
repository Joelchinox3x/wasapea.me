import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Image as SkiaImage,
  ImageFormat,
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  Shadow,
  Skia,
  useCanvasRef,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { darkColors, lightColors } from "../theme/colors";
import {
  generateQrMatrix,
  getQrLayout,
  hasReservedModulesInLogoArea,
  isFinderPattern,
  isLogoArea,
} from "../utils/qrGenerator";

export interface PremiumSkiaQrCodeProps {
  value: string;
  size?: number;
  isDark?: boolean;
  brandLogo?: "whatsapp" | "wasapeame";
}

export interface PremiumSkiaQrCodeHandle {
  makePngBase64: () => Promise<string | null>;
}

const QR_DARK = "#064E3B";
const QR_GRADIENT = ["#064E3B", "#047857", "#0F766E"];
const LOGO_RATIO = 0.2;

const WA_OUTER_BUBBLE =
  "M12 0C5.373 0 0 5.373 0 12c0 2.119.555 4.109 1.524 5.836L0 24l6.326-1.48C8.001 23.473 9.941 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.808 0-3.541-.482-5.067-1.393l-.363-.217-3.76.88.995-3.663-.238-.378C2.584 15.656 2 13.882 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z";
const WA_PHONE_HANDLE =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z";
export const PremiumSkiaQrCode = forwardRef<
  PremiumSkiaQrCodeHandle,
  PremiumSkiaQrCodeProps
>(function PremiumSkiaQrCode(
  { value, size = 230, isDark = false, brandLogo = "wasapeame" },
  ref,
) {
  const colors = isDark ? darkColors : lightColors;
  const canvasRef = useCanvasRef();
  const brandSymbol = useImage(require("../../assets/images/brand-symbol.png"));
  const scanY = useSharedValue(0);
  const scanOpacity = useSharedValue(0);

  useImperativeHandle(
    ref,
    () => ({
      makePngBase64: async () => {
        scanOpacity.set(0);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const image = await canvasRef.current?.makeImageSnapshotAsync();
        return image?.encodeToBase64(ImageFormat.PNG, 100) ?? null;
      },
    }),
    [canvasRef, scanOpacity],
  );

  const {
    size: matrixSize,
    matrix,
    reservedMatrix,
  } = useMemo(() => generateQrMatrix(value, "H"), [value]);
  const { cellSize, padding, symbolSize } = useMemo(
    () => getQrLayout(matrixSize, size, 4),
    [matrixSize, size],
  );
  const showBrandBadge = useMemo(
    () =>
      matrixSize > 0 &&
      !hasReservedModulesInLogoArea(reservedMatrix, LOGO_RATIO),
    [matrixSize, reservedMatrix],
  );

  const { modulesPath, functionalPath, eyesPath } = useMemo(() => {
    const moduleBuilder = Skia.PathBuilder.Make();
    const functionalBuilder = Skia.PathBuilder.Make();
    const eyesBuilder = Skia.PathBuilder.Make();

    if (matrixSize === 0 || !cellSize) {
      return {
        modulesPath: moduleBuilder.build(),
        functionalPath: functionalBuilder.build(),
        eyesPath: eyesBuilder.build(),
      };
    }

    const dotRadius = cellSize * 0.43;
    const functionalInset = cellSize * 0.05;

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (!matrix[r][c] || isFinderPattern(r, c, matrixSize)) continue;
        if (showBrandBadge && isLogoArea(r, c, matrixSize, LOGO_RATIO))
          continue;

        const x = padding + c * cellSize;
        const y = padding + r * cellSize;

        if (reservedMatrix[r]?.[c]) {
          functionalBuilder.addRRect(
            Skia.RRectXY(
              Skia.XYWHRect(
                x + functionalInset,
                y + functionalInset,
                cellSize - functionalInset * 2,
                cellSize - functionalInset * 2,
              ),
              cellSize * 0.12,
              cellSize * 0.12,
            ),
          );
        } else {
          moduleBuilder.addCircle(
            x + cellSize / 2,
            y + cellSize / 2,
            dotRadius,
          );
        }
      }
    }

    const corners = [
      { r: 0, c: 0 },
      { r: 0, c: matrixSize - 7 },
      { r: matrixSize - 7, c: 0 },
    ];

    corners.forEach(({ r, c }) => {
      const x = padding + c * cellSize;
      const y = padding + r * cellSize;
      const eyeSize = 7 * cellSize;

      eyesBuilder.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(x, y, eyeSize, eyeSize),
          cellSize * 0.8,
          cellSize * 0.8,
        ),
      );
      eyesBuilder.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize),
          cellSize * 0.5,
          cellSize * 0.5,
        ),
      );
      eyesBuilder.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(
            x + 2 * cellSize,
            y + 2 * cellSize,
            3 * cellSize,
            3 * cellSize,
          ),
          cellSize * 0.65,
          cellSize * 0.65,
        ),
      );
    });

    return {
      modulesPath: moduleBuilder.build(),
      functionalPath: functionalBuilder.build(),
      eyesPath: eyesBuilder.build(),
    };
  }, [cellSize, matrix, matrixSize, padding, reservedMatrix, showBrandBadge]);

  useEffect(() => {
    if (!symbolSize) return;
    scanY.set(padding);
    scanOpacity.set(0.72);
    scanY.set(
      withTiming(padding + symbolSize, {
        duration: 1_050,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
    scanOpacity.set(withDelay(820, withTiming(0, { duration: 230 })));

    return () => {
      cancelAnimation(scanY);
      cancelAnimation(scanOpacity);
    };
  }, [padding, scanOpacity, scanY, symbolSize, value]);

  if (matrixSize === 0) {
    return (
      <View style={[styles.invalidContainer, { width: size, height: size }]}>
        <Text style={{ color: colors.subtext }}>URL inválida</Text>
      </View>
    );
  }

  const centerPos = size / 2;
  const logoBadgeSize = symbolSize * 0.15;
  const logoBadgeRadius = logoBadgeSize / 2;
  const waIconScale = logoBadgeSize / 34;
  const symbolImageSize = logoBadgeSize * 1.34;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, shadowColor: "#10B981" },
      ]}
    >
      <Canvas ref={canvasRef} style={{ width: size, height: size }}>
        <RoundedRect
          x={0}
          y={0}
          width={size}
          height={size}
          r={20}
          color="#FFFFFF"
        >
          <Shadow dx={0} dy={2} blur={8} color="rgba(6, 78, 59, 0.08)" inner />
        </RoundedRect>

        <Path path={modulesPath} style="fill">
          <LinearGradient
            start={vec(padding, padding)}
            end={vec(padding + symbolSize, padding + symbolSize)}
            colors={QR_GRADIENT}
          />
        </Path>
        <Path path={functionalPath} style="fill" color={QR_DARK} />
        <Path path={eyesPath} style="fill" fillType="evenOdd" color={QR_DARK} />

        {showBrandBadge && (
          <Group>
            <Circle
              cx={centerPos}
              cy={centerPos}
              r={logoBadgeRadius + 5}
              color="#FFFFFF"
            />
            <Circle
              cx={centerPos}
              cy={centerPos}
              r={logoBadgeRadius + 2}
              color="#10B981"
              opacity={0.32}
            >
              <BlurMask blur={3} style="normal" />
            </Circle>
            <Circle
              cx={centerPos}
              cy={centerPos}
              r={logoBadgeRadius}
              color="#FFFFFF"
            >
              <Shadow dx={0} dy={1} blur={3} color="rgba(6, 78, 59, 0.18)" />
            </Circle>

            {brandLogo === "whatsapp" ? (
              <Group
                transform={[
                  { translateX: centerPos - 12 * waIconScale },
                  { translateY: centerPos - 12 * waIconScale },
                  { scale: waIconScale },
                ]}
              >
                <Path path={WA_OUTER_BUBBLE} color="#10B981" style="fill" />
                <Path path={WA_PHONE_HANDLE} color="#047857" style="fill" />
              </Group>
            ) : brandSymbol ? (
              <SkiaImage
                image={brandSymbol}
                x={centerPos - symbolImageSize / 2}
                y={centerPos - symbolImageSize / 2}
                width={symbolImageSize}
                height={symbolImageSize}
                fit="contain"
              />
            ) : null}
          </Group>
        )}

        <Rect
          x={padding}
          y={scanY}
          width={symbolSize}
          height={1.5}
          color="#10B981"
          opacity={scanOpacity}
        >
          <BlurMask blur={2} style="normal" />
        </Rect>
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  invalidContainer: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
