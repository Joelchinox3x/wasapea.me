import { Ellipsis, ExternalLink, MessageSquare, Phone, Share2 } from "lucide-react-native";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { darkColors, lightColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { LiveShaderButton } from "./LiveShaderButton";
import { MoreActionsSheet } from "./MoreActionsSheet";
import { ScalePressable } from "./ScalePressable";

interface PhoneActionButtonsProps {
  isValid: boolean;
  onWhatsApp: () => void;
  onWhatsAppBusiness?: () => void;
  onCall: () => void;
  onSms: () => void;
  onCopy: () => void;
  onShare: () => void;
  onSaveToAgenda?: () => void;
  onShowQr?: () => void;
  isDark?: boolean;
}

interface QuickActionProps {
  label: string;
  color: string;
  disabled: boolean;
  compact?: boolean;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onPress: () => void;
}

function AnimatedWhatsAppIcon({ size = 32 }: { size?: number }) {
  const animationSize = Math.max(size, 38);
  return (
    <LottieView
      source={require("../../assets/lotties/whatsapp.json")}
      autoPlay
      loop
      resizeMode="contain"
      renderMode="HARDWARE"
      style={{ width: animationSize, height: animationSize }}
      webStyle={{ width: animationSize, height: animationSize }}
    />
  );
}

function QuickAction({ label, color, disabled, compact = false, icon: Icon, onPress }: QuickActionProps) {
  return (
    <ScalePressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.quickAction,
        compact ? styles.compactAction : styles.regularAction,
        disabled && styles.disabled
      ]}
    >
      <Icon size={compact ? 19 : 20} color={color} strokeWidth={2} />
      <Text
        style={[styles.quickLabel, { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        maxFontSizeMultiplier={1.15}
      >
        {label}
      </Text>
    </ScalePressable>
  );
}

export function PhoneActionButtons({
  isValid,
  onWhatsApp,
  onWhatsAppBusiness,
  onCall,
  onSms,
  onCopy,
  onShare,
  onSaveToAgenda,
  onShowQr,
  isDark = false
}: PhoneActionButtonsProps) {
  const colors = isDark ? darkColors : lightColors;
  const [moreVisible, setMoreVisible] = useState(false);

  return (
    <View style={styles.container}>
      <LiveShaderButton
        disabled={!isValid}
        onPress={onWhatsApp}
        accessibilityLabel="Abrir WhatsApp"
        title="Abrir WhatsApp"
        icon={AnimatedWhatsAppIcon}
        trailingIcon={ExternalLink}
        gradientColors={[colors.primaryDark, colors.primary]}
        disabledColor={colors.subtext}
        style={styles.mainButtonShell}
      />

      <View style={styles.quickRow}>
        <QuickAction
          label="Compartir"
          color={colors.primary}
          disabled={!isValid}
          icon={Share2}
          onPress={onShare}
        />
        <QuickAction label="Llamar" color={colors.call} disabled={!isValid} icon={Phone} onPress={onCall} />
        <QuickAction label="SMS" color={colors.sms} disabled={!isValid} icon={MessageSquare} onPress={onSms} />
        <QuickAction
          label="Otros"
          color={colors.subtext}
          disabled={!isValid}
          compact
          icon={Ellipsis}
          onPress={() => setMoreVisible(true)}
        />
      </View>

      <MoreActionsSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        colors={colors}
        disabled={!isValid}
        onWhatsAppBusiness={onWhatsAppBusiness}
        onCopy={onCopy}
        onSaveToAgenda={onSaveToAgenda}
        onShowQr={onShowQr}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: spacing.md
  },
  mainButtonShell: {
    marginBottom: spacing.sm
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.xs
  },
  quickAction: {
    height: 66,
    borderRadius: radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 4
  },
  regularAction: {
    flex: 1
  },
  compactAction: {
    width: 62
  },
  quickLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11
  },
  disabled: {
    opacity: 0.42
  }
});
