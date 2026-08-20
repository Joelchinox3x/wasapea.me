import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetMethods
} from "@expo/ui/community/bottom-sheet";
import { Crown, Eye, EyeOff, LockKeyhole, ShieldCheck, X } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { VipAccessService } from "../services/VipAccessService";
import type { ThemeColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";

interface VipBenefitsModalProps {
  visible: boolean;
  active: boolean;
  onClose: () => void;
  onActivate: () => void;
  colors: ThemeColors;
}

const upcomingFeatures = [
  {
    icon: "📍",
    title: "Ubicación en Tiempo Real Guardada",
    desc: "Guarda y consulta el historial de ubicación en tiempo real en la nube."
  },
  {
    icon: "☁️",
    title: "Contactos y Respaldo en la Nube",
    desc: "Tus contactos e historial respaldados para no perder nada aunque pierdas el cel."
  },
  {
    icon: "🤖",
    title: "Mensajes Programados por WhatsApp",
    desc: "Envío automático de mensajes y recordatorios en fechas y horas exactas."
  },
  {
    icon: "📊",
    title: "Métricas y Reportes Avanzados",
    desc: "Estadísticas detalladas de interacciones y frecuencia de envíos."
  },
  {
    icon: "💎",
    title: "Experiencia Dorada & Soporte 24/7",
    desc: "Estilo visual VIP exclusivo, sin límites y atención prioritaria."
  }
];

export function VipBenefitsModal({ visible, active, onClose, onActivate, colors }: VipBenefitsModalProps) {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleClosed = useCallback(() => {
    setPassword("");
    setShowPassword(false);
    setError("");
    onClose();
  }, [onClose]);

  const closeSheet = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.close();
      return;
    }
    handleClosed();
  }, [handleClosed]);

  const activateVip = async () => {
    if (busy || active) return;
    setError("");
    setBusy(true);
    try {
      if (!(await VipAccessService.verifyAccessKey(password))) {
        throw new Error("La clave VIP no es válida.");
      }
      onActivate();
      setPassword("");
      closeSheet();
    } catch (activationError) {
      setError(activationError instanceof Error ? activationError.message : "No se pudo activar VIP.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      enableDynamicSizing
      enablePanDownToClose={!busy}
      onClose={handleClosed}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.warning }}
    >
      <BottomSheetView style={styles.sheet}>
        <View style={[styles.goldLine, { backgroundColor: colors.warning }]} />
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={[styles.crownShell, { backgroundColor: colors.warning + "20", borderColor: colors.warning + "55" }]}> 
                <Crown size={27} color={colors.warning} strokeWidth={2.2} />
              </View>
              <View style={styles.headerCopy}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: colors.text }]}>WASAPEA.ME VIP</Text>
                  {active ? (
                    <View style={[styles.activeBadge, { backgroundColor: colors.warning }]}> 
                      <Text style={styles.activeBadgeText}>ACTIVO</Text>
                    </View>
                  ) : (
                    <View style={[styles.activeBadge, { backgroundColor: colors.primary + "22" }]}>
                      <Text style={[styles.activeBadgeText, { color: colors.primary }]}>PRÓXIMAMENTE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.subtitle, { color: colors.subtext }]}>Funciones doradas exclusivas y servicios avanzados en camino.</Text>
              </View>
              <ScalePressable onPress={closeSheet} style={[styles.closeButton, { backgroundColor: colors.badgeBg }]}> 
                <X size={19} color={colors.subtext} />
              </ScalePressable>
            </View>

            <View style={[styles.benefitCard, { backgroundColor: colors.warning + "0A", borderColor: colors.warning + "33" }]}>
              <Text style={[styles.upcomingHeaderTitle, { color: colors.warning }]}>✨ Próximas Funciones Exclusivas VIP:</Text>
              {upcomingFeatures.map((item) => (
                <View key={item.title} style={styles.benefitRow}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.benefitText, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.benefitDesc, { color: colors.subtext }]}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {active ? (
              <View style={[styles.activePanel, { backgroundColor: colors.warning + "14", borderColor: colors.warning + "55" }]}> 
                <Crown size={22} color={colors.warning} />
                <View style={styles.activeCopy}>
                  <Text style={[styles.activeTitle, { color: colors.text }]}>¡Membresía VIP Activa!</Text>
                  <Text style={[styles.activeText, { color: colors.subtext }]}>Tienes acceso a la insignia dorada y a todas las ventajas especiales.</Text>
                </View>
              </View>
            ) : (
              <View style={styles.accessSection}>
                <View style={styles.accessHeading}>
                  <LockKeyhole size={19} color={colors.warning} />
                  <View style={styles.accessCopy}>
                    <Text style={[styles.accessTitle, { color: colors.text }]}> 
                      Activar membresía VIP
                    </Text>
                    <Text style={[styles.accessDescription, { color: colors.subtext }]}> 
                      Ingresa tu código de clave para activar el modo VIP.
                    </Text>
                  </View>
                </View>

                <View style={[styles.inputShell, { backgroundColor: colors.inputBg, borderColor: error ? colors.error : colors.cardBorder }]}> 
                  <ShieldCheck size={18} color={colors.warning} />
                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      setError("");
                    }}
                    placeholder="Ingresa clave promo..."
                    placeholderTextColor={colors.subtext}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.input, { color: colors.text }]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((shown) => !shown)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Ocultar clave" : "Mostrar clave"}
                    hitSlop={8}
                  >
                    {showPassword ? <EyeOff size={18} color={colors.subtext} /> : <Eye size={18} color={colors.subtext} />}
                  </Pressable>
                </View>

                {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                <ScalePressable
                  onPress={() => void activateVip()}
                  disabled={busy || !password.trim()}
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.warning },
                    (busy || !password.trim()) && styles.disabled
                  ]}
                >
                  {busy ? <ActivityIndicator color="#111827" /> : <Crown size={20} color="#111827" />}
                  <Text style={styles.actionText}>Activar VIP</Text>
                </ScalePressable>

                <Text style={[styles.localNote, { color: colors.subtext }]}>Ingresa el código promocional para desbloquear el acceso VIP.</Text>
              </View>
            )}

            {active ? (
              <ScalePressable onPress={closeSheet} style={[styles.doneButton, { borderColor: colors.warning + "66" }]}> 
                <Text style={[styles.doneText, { color: colors.warning }]}>Entendido</Text>
              </ScalePressable>
            ) : null}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { maxHeight: 700, paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: 30 },
  goldLine: { position: "absolute", top: 0, left: 54, right: 54, height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  crownShell: { width: 50, height: 50, borderRadius: radius.lg, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  title: { fontFamily: fonts.displayBold, fontSize: 21 },
  activeBadge: { borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  activeBadgeText: { color: "#111827", fontFamily: fonts.bodySemiBold, fontSize: 8.5, letterSpacing: 0.6 },
  subtitle: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  benefitCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.sm, gap: 10, marginBottom: spacing.md },
  upcomingHeaderTitle: { fontFamily: fonts.displayBold, fontSize: 13, marginBottom: 2 },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs },
  checkShell: { width: 28, height: 28, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  benefitText: { fontFamily: fonts.displaySemiBold, fontSize: 12.5 },
  benefitDesc: { fontFamily: fonts.body, fontSize: 10.5, lineHeight: 14, marginTop: 1 },
  accessSection: { gap: spacing.xs },
  accessHeading: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, marginBottom: 2 },
  accessCopy: { flex: 1 },
  accessTitle: { fontFamily: fonts.displaySemiBold, fontSize: 16 },
  accessDescription: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  inputShell: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  input: { flex: 1, minWidth: 0, paddingVertical: 10, fontFamily: fonts.body, fontSize: 13.5 },
  errorText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, textAlign: "center" },
  actionButton: { minHeight: 50, borderRadius: radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: 3 },
  actionText: { color: "#111827", fontFamily: fonts.displaySemiBold, fontSize: 14 },
  localNote: { fontFamily: fonts.body, fontSize: 10.5, lineHeight: 15, textAlign: "center", paddingHorizontal: spacing.sm, marginTop: 6 },
  activePanel: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  activeCopy: { flex: 1 },
  activeTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15 },
  activeText: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  doneButton: { minHeight: 48, borderRadius: radius.lg, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  doneText: { fontFamily: fonts.bodySemiBold, fontSize: 13.5 },
  loader: { paddingVertical: spacing.lg },
  disabled: { opacity: 0.5 }
});
