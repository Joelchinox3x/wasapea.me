import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Cloud, RefreshCw, ShieldCheck, Smartphone, Sparkles, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_NAME } from "../constants/app";
import { useAppStore } from "../store/useAppStore";
import { darkColors, lightColors } from "../theme/colors";

export default function WasapeaMeProScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { themeMode } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>{APP_NAME} Pro</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={[styles.sparkleIcon, { backgroundColor: colors.primary + "20" }]}>
            <Sparkles size={32} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{APP_NAME} Pro</Text>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>PRÓXIMAMENTE</Text>
          </View>
          <Text style={[styles.heroSub, { color: colors.subtext }]}>
            Estamos desarrollando herramientas profesionales para llevar la gestión de tus contactos al siguiente nivel.
          </Text>
        </View>

        {/* Feature List */}
        <View style={styles.featuresList}>
          {[
            {
              title: "Sincronización en la Nube",
              desc: "Tus contactos de la agenda interna y notas sincronizados automáticamente con Supabase.",
              icon: Cloud
            },
            {
              title: "Multi-Dispositivo",
              desc: "Accede a tus contactos temporales y notas desde tu celular, tablet o navegador web.",
              icon: Smartphone
            },
            {
              title: "Copia de Seguridad Automática",
              desc: "Restauración instantánea al cambiar de teléfono o reinstalar la aplicación.",
              icon: RefreshCw
            },
            {
              title: "Escáner OCR e IA",
              desc: "Reconocimiento automático de números telefónicos desde fotos de tarjetas, volantes o carteles.",
              icon: Zap
            },
            {
              title: "Seguridad y Encriptación",
              desc: "Resguardado con encriptación de extremo a extremo para máxima privacidad.",
              icon: ShieldCheck
            }
          ].map((item, index) => {
            const IconComp = item.icon;
            return (
              <View key={index} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + "15" }]}>
                  <IconComp size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.featureDesc, { color: colors.subtext }]}>{item.desc}</Text>
                </View>
                <CheckCircle size={18} color={colors.primary} />
              </View>
            );
          })}
        </View>

        {/* Notification Button */}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.actionBtnText}>Volver a la App Principal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 54
  },
  backBtn: {
    padding: 6
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "700"
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: "center",
    marginBottom: 20
  },
  sparkleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 6
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  heroSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  },
  featuresList: {
    gap: 10,
    marginBottom: 20
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700"
  },
  featureDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16
  },
  actionBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  }
});
