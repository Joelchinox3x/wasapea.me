import {
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Gift,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  Moon,
  Navigation,
  PhoneCall,
  Sparkles,
  Sun,
  ThumbsUp,
  Utensils
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

export interface SimpleGreetingItem {
  id: string;
  chipLabel: string;
  content: string;
  color: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

export const LEFT_GREETINGS: SimpleGreetingItem[] = [
  {
    id: "greet-birthday",
    chipLabel: "¡Feliz Cumpleaños!",
    content: "¡Feliz Cumpleaños! 🎂🎉 Que tengas un día super especial lleno de alegría, salud y bendiciones. ¡Disfruta mucho tu día! 🥳✨",
    color: "#EC4899",
    icon: Gift
  },
  {
    id: "greet-morning",
    chipLabel: "Buenos Días",
    content: "¡Buenos días! ☀️ Te deseo un excelente y bendecido día lleno de éxitos.",
    color: "#F59E0B",
    icon: Sun
  },
  {
    id: "greet-night",
    chipLabel: "Buenas Noches",
    content: "¡Buenas noches! 🌙 Que tengas un bonito descanso y dulces sueños. ¡Hasta mañana!",
    color: "#6366F1",
    icon: Moon
  },
  {
    id: "greet-arrived",
    chipLabel: "Ya llegué",
    content: "¡Hola! 👋 Ya llegué, estoy afuera esperándote 🚗",
    color: "#10B981",
    icon: Car
  },
  {
    id: "greet-location",
    chipLabel: "Pedir Ubicación",
    content: "Hola 👋 ¿Me podrías compartir tu ubicación exacta por favor? 📍",
    color: "#3B82F6",
    icon: MapPin
  },
  {
    id: "greet-thanks",
    chipLabel: "¡Muchas Gracias!",
    content: "¡Muchas gracias por todo! 🙏 Aprecio bastante tu ayuda y amabilidad.",
    color: "#8B5CF6",
    icon: Sparkles
  },
  {
    id: "greet-moment",
    chipLabel: "Un momento",
    content: "¡Hola! En un momentito te respondo bien con calma ⏳",
    color: "#06B6D4",
    icon: Clock
  },
  {
    id: "greet-meetup",
    chipLabel: "¿Sale un café?",
    content: "¡Hola! 👋 ¿Cómo estás? ¿Tienes tiempo hoy para coordinar un ratito o reunirnos? ☕",
    color: "#E11D48",
    icon: Utensils
  }
];

export const RIGHT_GREETINGS: SimpleGreetingItem[] = [
  {
    id: "greet-confirmation",
    chipLabel: "Confirmar Cita",
    content: "¡Hola! 👋 Te escribo para confirmar nuestra cita/reunión programada.",
    color: "#10B981",
    icon: Calendar
  },
  {
    id: "greet-delayed",
    chipLabel: "Voy en camino",
    content: "¡Hola! 👋 Ya voy en camino, llego en un momento 🏃💨",
    color: "#F59E0B",
    icon: Navigation
  },
  {
    id: "greet-home",
    chipLabel: "En casa",
    content: "¡Hola! 👋 Ya llegué bien a casa, muchas gracias por todo.",
    color: "#8B5CF6",
    icon: Home
  },
  {
    id: "greet-call",
    chipLabel: "¿Puedes hablar?",
    content: "¡Hola! 👋 ¿Tienes un minuto libre para una llamada rápida? 📞",
    color: "#3B82F6",
    icon: PhoneCall
  },
  {
    id: "greet-ok",
    chipLabel: "Entendido / Listo",
    content: "¡Perfecto! Entendido, quedo atento 👍",
    color: "#10B981",
    icon: ThumbsUp
  },
  {
    id: "greet-received",
    chipLabel: "Recibido con éxito",
    content: "¡Hola! Confirmo que recibí la información/documento correctamente. ¡Muchas gracias! ✅",
    color: "#06B6D4",
    icon: CheckCircle2
  },
  {
    id: "greet-great",
    chipLabel: "¡Excelente!",
    content: "¡Excelente! Me parece super bien 🙌",
    color: "#EC4899",
    icon: HeartHandshake
  },
  {
    id: "greet-done",
    chipLabel: "Tarea Completada",
    content: "¡Listo! Ya quedó todo completado y revisado 👌",
    color: "#6366F1",
    icon: Check
  }
];

interface SimpleGreetingsSectionProps {
  colors: ThemeColors;
  isDark?: boolean;
  onSelectGreeting: (text: string) => void;
  onSendGreeting?: (text: string) => void;
}

function GreetingChip({
  item,
  rowIndex,
  colors,
  onSelectGreeting
}: {
  item: SimpleGreetingItem;
  rowIndex: number;
  colors: ThemeColors;
  onSelectGreeting: (text: string, rowIndex: number) => void;
}) {
  const Icon = item.icon;
  const shimmerProgress = useSharedValue(0);

  const handlePress = () => {
    onSelectGreeting(item.content, rowIndex);
    shimmerProgress.value = 0;
    shimmerProgress.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
  };

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerProgress.value, [0, 0.2, 0.8, 1], [0, 1, 0.8, 0]);
    const translateX = interpolate(shimmerProgress.value, [0, 1], [-120, 160]);
    return {
      opacity,
      transform: [{ translateX }]
    };
  });

  return (
    <ScalePressable
      onPress={handlePress}
      pressedScale={0.96}
      accessibilityRole="button"
      accessibilityLabel={`Plantilla ${item.chipLabel}`}
      style={[
        styles.chip,
        {
          backgroundColor: colors.card,
          borderColor: colors.primary + "26"
        }
      ]}
    >
      <View style={[styles.chipIcon, { backgroundColor: colors.primary + "14" }]}>
        <Icon size={12} color={colors.primary} />
      </View>
      <Text style={[styles.chipText, { color: colors.text }]} numberOfLines={1}>
        {item.chipLabel}
      </Text>

      <Animated.View pointerEvents="none" style={[styles.shimmerOverlay, shimmerStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(16, 185, 129, 0.40)",
            "rgba(255, 255, 255, 0.85)",
            "rgba(16, 185, 129, 0.40)",
            "transparent"
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </ScalePressable>
  );
}

export const SimpleGreetingsSection = React.memo(function SimpleGreetingsSection({
  colors,
  onSelectGreeting
}: SimpleGreetingsSectionProps) {
  const heartY = useSharedValue(0);
  const heartScale = useSharedValue(1);
  const lineSweep = useSharedValue(0);

  useEffect(() => {
    // Baja (1s), espera 2s, sube (1s), espera 2s y repite
    lineSweep.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withDelay(2000, withTiming(1, { duration: 0 })),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withDelay(2000, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
  }, []);

  const lineSweepStyle = useAnimatedStyle(() => {
    const translateY = interpolate(lineSweep.value, [0, 1], [-60, 298]);
    const opacity = interpolate(lineSweep.value, [0, 0.08, 0.92, 1], [0.15, 1, 1, 0.15]);
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const handleChipSelect = useCallback(
    (content: string, rowIndex: number) => {
      onSelectGreeting(content);

      // 8 rows total (0 to 7). Center is row 3.5. Step between chip centers = 38px (32px height + 6px gap)
      const targetY = (rowIndex - 3.5) * 38;
      const distance = Math.abs(targetY - heartY.value);

      // Adaptive spring damping: Higher damping (less bounce) for long distances
      const damping = distance > 120 ? 24 : 16;
      const stiffness = distance > 120 ? 120 : 150;

      // Smooth spring movement to the selected row level
      heartY.value = withSpring(targetY, { damping, stiffness });

      // Pulse Heart badge on arrival
      heartScale.value = withSequence(
        withTiming(1.3, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: 250, easing: Easing.inOut(Easing.quad) })
      );
    },
    [onSelectGreeting]
  );

  useEffect(() => {
    // Periodic heartbeat when idle
    heartScale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 350, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: 350, easing: Easing.inOut(Easing.quad) }),
        withDelay(3500, withTiming(1.0, { duration: 0 }))
      ),
      -1,
      false
    );
  }, []);

  const heartBadgeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: heartY.value }, { scale: heartScale.value }]
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.twoColumnGrid}>
        <View style={styles.leftColumn}>
          {LEFT_GREETINGS.map((item, idx) => (
            <GreetingChip
              key={item.id}
              item={item}
              rowIndex={idx}
              colors={colors}
              onSelectGreeting={handleChipSelect}
            />
          ))}
        </View>

        <View style={styles.dividerWrapper}>
          <LinearGradient
            colors={[
              "transparent",
              "rgba(16, 185, 129, 0.3)",
              "#10B981",
              "#34D399",
              "#059669",
              "rgba(16, 185, 129, 0.3)",
              "transparent"
            ]}
            locations={[0, 0.08, 0.25, 0.5, 0.75, 0.92, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.dividerLine}
          >
            {/* Periodic Color Shimmer Wave Gliding Down (Cada 3.9s) */}
            <Animated.View pointerEvents="none" style={[styles.lineSweepBeam, lineSweepStyle]}>
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(52, 211, 153, 0.3)",
                  "rgba(255, 255, 255, 0.95)",
                  "#34D399",
                  "transparent"
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </LinearGradient>

          <Animated.View
            style={[
              styles.centerPulseBadge,
              { backgroundColor: colors.card, borderColor: "#10B981" },
              heartBadgeStyle
            ]}
          >
            <Heart size={10} color="#10B981" fill="#10B981" />
          </Animated.View>
        </View>

        <View style={styles.rightColumn}>
          {RIGHT_GREETINGS.map((item, idx) => (
            <GreetingChip
              key={item.id}
              item={item}
              rowIndex={idx}
              colors={colors}
              onSelectGreeting={handleChipSelect}
            />
          ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    width: "100%"
  },
  twoColumnGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    width: "100%"
  },
  leftColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    paddingRight: 6
  },
  dividerWrapper: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  dividerLine: {
    width: 4.5,
    height: 298,
    borderRadius: radius.pill,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5
  },
  lineSweepBeam: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 60,
    borderRadius: radius.pill
  },
  centerPulseBadge: {
    position: "absolute",
    top: "50%",
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOpacity: 0.95,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 7
  },
  rightColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    paddingLeft: 6
  },
  chip: {
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingLeft: 6,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    overflow: "hidden"
  },
  chipIcon: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 70,
    height: "100%"
  }
});
