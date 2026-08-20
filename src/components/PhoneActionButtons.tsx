import * as Haptics from "expo-haptics";
import { Ellipsis, MapPin, MessageSquare, Phone, Share2 } from "lucide-react-native";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { darkColors, lightColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { LiveShaderButton } from "./LiveShaderButton";
import { MoreActionsSheet } from "./MoreActionsSheet";
import { ScalePressable } from "./ScalePressable";
import { WhatsAppGlyphIcon } from "./icons/AppSvgIcons";

interface PhoneActionButtonsProps {
  isValid: boolean;
  onWhatsApp: () => void;
  onWhatsAppBusiness?: () => void;
  onCall: () => void;
  onSms: () => void;
  onCopy: () => void;
  onShare: () => void;
  onLocation?: () => void;
  onLocationLongPress?: () => void;
  isLocationLoading?: boolean;
  onSaveToAgenda?: () => void;
  onShowQr?: () => void;
  isDark?: boolean;
}

interface QuickActionProps {
  label: string;
  color: string;
  disabled: boolean;
  compact?: boolean;
  loading?: boolean;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onPress: () => void;
  onLongPress?: () => void;
}

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  void Haptics.impactAsync(style).catch(() => {});
};

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

function MutedWhatsAppIcon({ size = 22 }: { size?: number }) {
  return <WhatsAppGlyphIcon size={size} color="rgba(255, 255, 255, 0.6)" />;
}

function QuickAction({ label, color, disabled, compact = false, loading = false, icon: Icon, onPress, onLongPress }: QuickActionProps) {
  const handlePress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleLongPress = () => {
    if (onLongPress) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  return (
    <ScalePressable
      disabled={disabled || loading}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.quickAction,
        compact ? styles.compactAction : styles.regularAction,
        (disabled || loading) && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Icon size={compact ? 18 : 20} color={color} strokeWidth={2} />
      )}
      <Text
        style={[styles.quickLabel, { color }, compact && styles.compactLabel]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
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
  onLocation,
  onLocationLongPress,
  isLocationLoading = false,
  onSaveToAgenda,
  onShowQr,
  isDark = false
}: PhoneActionButtonsProps) {
  const colors = isDark ? darkColors : lightColors;
  const [moreVisible, setMoreVisible] = useState(false);

  const handleWhatsApp = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    onWhatsApp();
  };

  return (
    <View style={styles.container}>
      <LiveShaderButton
        disabled={!isValid}
        onPress={handleWhatsApp}
        accessibilityLabel="Abrir WhatsApp"
        title="Abrir WhatsApp"
        icon={isValid ? AnimatedWhatsAppIcon : MutedWhatsAppIcon}
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
        {onLocation && (
          <QuickAction
            label="Ubicación"
            color={colors.accent}
            disabled={false}
            loading={isLocationLoading}
            icon={MapPin}
            onPress={onLocation}
            onLongPress={onLocationLongPress}
          />
        )}
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
    gap: 4
  },
  quickAction: {
    height: 64,
    borderRadius: radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 2
  },
  regularAction: {
    flex: 1
  },
  compactAction: {
    width: 44
  },
  quickLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5
  },
  compactLabel: {
    fontSize: 9.5
  },
  disabled: {
    opacity: 0.42
  }
});
