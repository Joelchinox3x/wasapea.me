import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFont, useImage } from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { Download, Share2, Sparkles, X } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { PhoneService } from "../services/PhoneService";
import { saveQrImage, shareQrImage } from "../services/QrImageService";
import type { QrImagePayload } from "../services/QrImageService.types";
import { createQrShareCardPng } from "../services/QrShareCardService";
import { useAppStore } from "../store/useAppStore";
import { darkColors, lightColors } from "../theme/colors";
import {
  PremiumSkiaQrCode,
} from "./PremiumSkiaQrCode";
import { ScalePressable } from "./ScalePressable";

interface QrCodeModalProps {
  visible: boolean;
  onClose: () => void;
  e164: string;
  formattedNumber: string;
  message?: string;
  isDark?: boolean;
}

export function QrCodeModal({
  visible,
  onClose,
  e164,
  formattedNumber,
  message,
  isDark = false,
}: QrCodeModalProps) {
  const colors = isDark ? darkColors : lightColors;
  const showNotice = useAppStore((state) => state.showNotice);
  const { width, height } = useWindowDimensions();
  const [busyAction, setBusyAction] = useState<"share" | "save" | null>(null);
  const qrSize = Math.max(150, Math.min(224, width - 96, height - 460));
  const regularCardFont = useFont(Inter_400Regular, 28);
  const semiboldCardFont = useFont(Inter_600SemiBold, 46);
  const boldCardFont = useFont(Inter_700Bold, 64);
  const cardBrandSymbol = useImage(require("../../assets/images/brand-symbol.png"));

  const waUrl = PhoneService.buildWhatsAppUrl(e164, message);
  const canUseQr = Boolean(waUrl) && busyAction === null;
  const cardFontsReady = Boolean(
    regularCardFont && semiboldCardFont && boldCardFont && cardBrandSymbol,
  );
  const canUseCard = canUseQr && cardFontsReady;

  const capturePayload =
    useCallback(async (): Promise<QrImagePayload | null> => {
      if (!waUrl) return null;
      if (!regularCardFont || !semiboldCardFont || !boldCardFont || !cardBrandSymbol) return null;

      const pngBase64 = createQrShareCardPng({
        formattedNumber,
        waUrl,
        fonts: {
          regular: regularCardFont,
          semibold: semiboldCardFont,
          bold: boldCardFont
        },
        brandSymbol: cardBrandSymbol,
      });
      if (!pngBase64) return null;
      return { pngBase64, e164, formattedNumber, waUrl, variant: "card" };
    }, [boldCardFont, cardBrandSymbol, e164, formattedNumber, regularCardFont, semiboldCardFont, waUrl]);

  const handleShare = useCallback(async () => {
    setBusyAction("share");
    const payload = await capturePayload();
    if (!payload) {
      setBusyAction(null);
      showNotice({
        title: "No se pudo crear la imagen",
        message:
          "Espera un instante a que termine de cargar la tarjeta e inténtalo nuevamente.",
        tone: "error",
      });
      return;
    }

    const result = await shareQrImage(payload);
    setBusyAction(null);
    if (!result.ok) {
      showNotice({
        title: "No se pudo compartir",
        message: result.error ?? "Inténtalo nuevamente.",
        tone: "error",
      });
      return;
    }
    if (result.linkCopied) {
      showNotice({
        title: "QR compartido",
        message: result.messageAttached
          ? "La imagen y el enlace se incluyeron en el mismo envío. El enlace también quedó copiado."
          : "La imagen fue compartida. El enlace quedó copiado para que puedas pegarlo.",
        tone: "success",
      });
    }
  }, [capturePayload, showNotice]);

  const handleSave = useCallback(async () => {
    setBusyAction("save");
    const payload = await capturePayload();
    if (!payload) {
      setBusyAction(null);
      showNotice({
        title: "No se pudo crear la imagen",
        message:
          "Espera un instante a que termine de cargar el QR e inténtalo nuevamente.",
        tone: "error",
      });
      return;
    }

    const result = await saveQrImage(payload);
    setBusyAction(null);
    showNotice(
      result.ok
        ? {
            title: "Tarjeta QR guardada",
            message: "La tarjeta completa se guardó en la galería del teléfono.",
            tone: "success",
          }
        : {
            title: "No se pudo guardar",
            message: result.error ?? "Inténtalo nuevamente.",
            tone: "error",
          },
    );
  }, [capturePayload, showNotice]);

  const buttonLabelColor = useMemo(
    () => (isDark ? "#D1FAE5" : "#065F46"),
    [isDark],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Premium Tag */}
          <View style={styles.badgeTag}>
            <Sparkles size={13} color="#10B981" />
            <Text style={styles.badgeText}>TARJETA QR · WASAPEA.ME</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}> 
            Tu QR de WhatsApp
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {formattedNumber}
          </Text>

          {/* Premium Skia QR Code Container */}
          <View style={styles.qrBox}>
            {waUrl ? (
              <PremiumSkiaQrCode
                value={waUrl}
                size={qrSize}
                isDark={isDark}
                brandLogo="wasapeame"
              />
            ) : (
              <Text style={{ color: colors.subtext }}>Inválido</Text>
            )}
          </View>

          <Text style={[styles.instruction, { color: colors.subtext }]}> 
            Al compartir, enviaremos una tarjeta con tu número, este QR y una
            instrucción clara para abrir el chat.
          </Text>

          <View style={styles.actionsRow}>
            <ScalePressable
              accessibilityRole="button"
              accessibilityLabel="Compartir QR"
              disabled={!canUseCard}
              onPress={() => void handleShare()}
              style={[
                styles.actionButton,
                styles.shareButton,
                !canUseCard && styles.disabledButton,
              ]}
            >
              <LinearGradient
                colors={["#10B981", "#059669", "#047857"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonContent}
              >
                <View style={styles.shareIconShell}>
                  {busyAction === "share" ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Share2 size={18} color="#FFFFFF" strokeWidth={2.4} />
                  )}
                </View>
                <Text style={styles.shareButtonText} numberOfLines={1}>
                  Compartir QR
                </Text>
              </LinearGradient>
            </ScalePressable>

            <ScalePressable
              accessibilityRole="button"
              accessibilityLabel="Guardar QR en la galería"
              disabled={!canUseCard}
              onPress={handleSave}
              style={[
                styles.actionButton,
                styles.saveButton,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.inputBg,
                },
                !canUseCard && styles.disabledButton,
              ]}
            >
              <View style={[styles.saveIconShell, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.16)" : "#D1FAE5" }]}>
                {busyAction === "save" ? (
                  <ActivityIndicator size="small" color={buttonLabelColor} />
                ) : (
                  <Download
                    size={18}
                    color={buttonLabelColor}
                    strokeWidth={2.4}
                  />
                )}
              </View>
              <Text
                style={[styles.saveButtonText, { color: buttonLabelColor }]}
                numberOfLines={1}
              >
                Guardar QR
              </Text>
            </ScalePressable>
          </View>

          <Text style={[styles.shareHint, { color: colors.subtext }]}> 
            Tarjeta PNG vertical en alta resolución · enlace listo para pegar
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    position: "relative",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    padding: 6,
    zIndex: 10,
  },
  badgeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 18,
    fontWeight: "500",
  },
  qrBox: {
    padding: 6,
    borderRadius: 26,
    marginBottom: 18,
  },
  instruction: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  actionsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    minHeight: 50,
    flex: 1,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  actionButtonContent: {
    minHeight: 50,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  shareButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  saveButton: {
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 10,
  },
  disabledButton: {
    opacity: 0.48,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
  shareIconShell: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  saveIconShell: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  shareHint: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
