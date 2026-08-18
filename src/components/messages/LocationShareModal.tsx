import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetMethods
} from "@expo/ui/community/bottom-sheet";
import { LocateFixed, MapPin, Radio, ShieldCheck, Square, X } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import type { ActiveLiveLocationSession } from "../../services/LiveLocationService";

interface LocationShareModalProps {
  visible: boolean;
  colors: ThemeColors;
  onClose: () => void;
  onShareCurrent: () => Promise<boolean>;
  activeLiveSession: ActiveLiveLocationSession | null;
  onShareLive: () => Promise<boolean>;
  onStopLive: () => Promise<void>;
}

export function LocationShareModal({
  visible,
  colors,
  onClose,
  onShareCurrent,
  activeLiveSession,
  onShareLive,
  onStopLive
}: LocationShareModalProps) {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [busyAction, setBusyAction] = useState<"current" | "live" | "stop" | null>(null);
  const busy = busyAction !== null;

  const closeSheet = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.close();
      return;
    }
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (!busy) closeSheet();
  }, [busy, closeSheet]);

  const handleShareCurrent = async () => {
    if (busy) return;
    setBusyAction("current");
    try {
      const shared = await onShareCurrent();
      if (shared) closeSheet();
    } finally {
      setBusyAction(null);
    }
  };

  const handleShareLive = async () => {
    if (busy) return;
    setBusyAction("live");
    try {
      const shared = await onShareLive();
      if (shared) closeSheet();
    } finally {
      setBusyAction(null);
    }
  };

  const handleStopLive = async () => {
    if (busy) return;
    setBusyAction("stop");
    try {
      await onStopLive();
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      enableDynamicSizing
      enablePanDownToClose={!busy}
      onClose={onClose}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.subtext }}
    >
      <BottomSheetView style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + "1F" }]}> 
              <MapPin size={24} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>Compartir ubicación</Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>Elige cómo quieres compartirla por WhatsApp.</Text>
            </View>
            <Pressable
              onPress={handleClose}
              disabled={busy}
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, { backgroundColor: colors.badgeBg }, pressed && styles.pressed]}
            >
              <X size={19} color={colors.subtext} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => void handleShareCurrent()}
            disabled={busy}
            accessibilityLabel="Enviar mi ubicación actual por WhatsApp"
            accessibilityRole="button"
            android_ripple={{ color: colors.primary + "20" }}
            style={({ pressed }) => [styles.option, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "66" }, pressed && styles.pressed]}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.primary + "20" }]}> 
              {busyAction === "current" ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <LocateFixed size={25} color={colors.primary} strokeWidth={2.1} />
              )}
            </View>
            <View style={styles.optionCopy}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Enviar mi ubicación actual</Text>
              <Text style={[styles.optionDescription, { color: colors.subtext }]}> 
                {busyAction === "current" ? "Obteniendo una posición GPS precisa…" : "Crea un enlace de Google Maps y abre WhatsApp."}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => void handleShareLive()}
            disabled={busy}
            accessibilityLabel={activeLiveSession ? "Volver a compartir el enlace de ubicación en vivo" : "Compartir ubicación en tiempo real"}
            accessibilityRole="button"
            android_ripple={{ color: colors.accent + "20" }}
            style={({ pressed }) => [styles.option, { backgroundColor: colors.accent + "0F", borderColor: colors.accent + "55" }, pressed && styles.pressed]}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.accent + "1F" }]}> 
              {busyAction === "live" ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Radio size={24} color={colors.accent} strokeWidth={2.1} />
              )}
            </View>
            <View style={styles.optionCopy}>
              <View style={styles.optionTitleRow}>
                <Text style={[styles.optionTitle, { color: colors.text }]}> 
                  {activeLiveSession ? "Ubicación en vivo activa" : "Compartir en tiempo real"}
                </Text>
                {activeLiveSession && (
                  <View style={[styles.liveBadge, { backgroundColor: colors.primary + "24" }]}> 
                    <Text style={[styles.liveText, { color: colors.primary }]}>EN VIVO</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.optionDescription, { color: colors.subtext }]}> 
                {busyAction === "live"
                  ? activeLiveSession ? "Abriendo WhatsApp…" : "Creando enlace privado y activando GPS…"
                  : activeLiveSession ? "Toca para compartir nuevamente el enlace." : "Comparte un enlace privado durante 1 hora."}
              </Text>
            </View>
          </Pressable>

          {activeLiveSession && (
            <Pressable
              onPress={() => void handleStopLive()}
              disabled={busy}
              accessibilityLabel="Detener ubicación en vivo"
              accessibilityRole="button"
              android_ripple={{ color: colors.error + "20" }}
              style={({ pressed }) => [styles.stopButton, { backgroundColor: colors.error + "14", borderColor: colors.error + "55" }, pressed && styles.pressed]}
            >
              {busyAction === "stop" ? <ActivityIndicator size="small" color={colors.error} /> : <Square size={15} color={colors.error} fill={colors.error} />}
              <Text style={[styles.stopText, { color: colors.error }]}>Detener ubicación en vivo</Text>
            </Pressable>
          )}

          <View style={[styles.privacyNote, { backgroundColor: colors.badgeBg }]}> 
            <ShieldCheck size={17} color={colors.primary} />
            <Text style={[styles.privacyText, { color: colors.subtext }]}>La transmisión se guarda solo en memoria y se elimina al detenerla o expirar.</Text>
          </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 32
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  headerIcon: { width: 48, height: 48, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.displayBold, fontSize: 21 },
  subtitle: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  option: {
    minHeight: 82,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  optionIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xs },
  optionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14.5 },
  optionDescription: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 3 },
  liveBadge: { borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  liveText: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.5 },
  stopButton: { minHeight: 44, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginBottom: spacing.sm },
  stopText: { fontFamily: fonts.bodySemiBold, fontSize: 12.5 },
  privacyNote: { minHeight: 42, borderRadius: radius.md, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  privacyText: { flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16 }
});
