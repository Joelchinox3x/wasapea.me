import * as Clipboard from "expo-clipboard";
import * as SplashScreen from "expo-splash-screen";
import { Copy, DatabaseZap, RefreshCcw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ThemeColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";

interface DatabaseRecoveryScreenProps {
  colors: ThemeColors;
  error: string;
  onRetry: () => Promise<void>;
}

export function DatabaseRecoveryScreen({ colors, error, onRetry }: DatabaseRecoveryScreenProps) {
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  const retry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const copyDiagnostic = async () => {
    await Clipboard.setStringAsync(`WASAPEA.ME database startup error\n${error}`);
    setCopied(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.icon, { backgroundColor: colors.error + "1F" }]}>
          <DatabaseZap size={30} color={colors.error} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Base de datos no disponible</Text>
        <Text style={[styles.message, { color: colors.subtext }]}>
          Tus datos no serán modificados. Reintenta el inicio; si continúa, copia el diagnóstico antes de solicitar ayuda.
        </Text>
        <Text selectable style={[styles.diagnostic, { color: colors.error, backgroundColor: colors.inputBg }]}>
          {error}
        </Text>

        <ScalePressable
          disabled={retrying}
          onPress={() => void retry()}
          style={[styles.primaryButton, { backgroundColor: colors.primary }, retrying && styles.disabled]}
        >
          {retrying ? <ActivityIndicator color="#FFFFFF" /> : <RefreshCcw size={18} color="#FFFFFF" />}
          <Text style={styles.primaryText}>{retrying ? "Reintentando..." : "Reintentar"}</Text>
        </ScalePressable>

        <ScalePressable
          onPress={() => void copyDiagnostic()}
          style={[styles.secondaryButton, { borderColor: colors.cardBorder }]}
        >
          <Copy size={17} color={colors.text} />
          <Text style={[styles.secondaryText, { color: colors.text }]}>
            {copied ? "Diagnóstico copiado" : "Copiar diagnóstico"}
          </Text>
        </ScalePressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center"
  },
  icon: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    textAlign: "center"
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing.xs
  },
  diagnostic: {
    width: "100%",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginVertical: spacing.lg,
    fontFamily: fonts.body,
    fontSize: 12
  },
  primaryButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  primaryText: {
    color: "#FFFFFF",
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  secondaryButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  secondaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  disabled: {
    opacity: 0.65
  }
});
