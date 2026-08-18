import { ChevronDown, Grid3X3, MessageSquare, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import type { CountryItem } from "../../constants/app";
import type { PhoneService } from "../../services/PhoneService";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface PhoneComposerCardProps {
  colors: ThemeColors;
  compact: boolean;
  country: CountryItem;
  phoneInput: string;
  messageInput: string;
  parsedPhone: ReturnType<typeof PhoneService.parse>;
  onCountryPress: () => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
}

export function PhoneComposerCard({
  colors,
  compact,
  country,
  phoneInput,
  messageInput,
  parsedPhone,
  onCountryPress,
  onPhoneChange,
  onMessageChange
}: PhoneComposerCardProps) {
  const phoneFocus = useSharedValue(0);
  const messageFocus = useSharedValue(0);
  const hasPhoneInput = phoneInput.trim().length > 0;
  const phoneStatusColor = hasPhoneInput
    ? parsedPhone.isValid
      ? colors.primary
      : colors.error
    : colors.cardBorder;
  const focusedPhoneColor = hasPhoneInput ? phoneStatusColor : colors.primary;
  const phoneFocusStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(phoneFocus.get(), [0, 1], [phoneStatusColor, focusedPhoneColor]),
    shadowColor: focusedPhoneColor,
    shadowOpacity: phoneFocus.get() * 0.22,
    shadowRadius: phoneFocus.get() * 10,
    shadowOffset: { width: 0, height: 0 }
  }));
  const messageFocusStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(messageFocus.get(), [0, 1], [colors.cardBorder, colors.primary]),
    shadowColor: colors.primary,
    shadowOpacity: messageFocus.get() * 0.18,
    shadowRadius: messageFocus.get() * 8,
    shadowOffset: { width: 0, height: 0 }
  }));

  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: colors.glass, borderColor: colors.glassBorder }
      ]}
    >
      <View style={styles.phoneRow}>
        <ScalePressable
          style={[
            styles.countryButton,
            compact && styles.countryButtonCompact,
            { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }
          ]}
          onPress={onCountryPress}
          accessibilityLabel={`País seleccionado: ${country.name}`}
        >
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={[styles.countryCode, { color: colors.text }]}>{country.code}</Text>
          <ChevronDown size={16} color={colors.subtext} />
        </ScalePressable>

        <Animated.View style={[styles.phoneShell, { backgroundColor: colors.inputBg }, phoneFocusStyle]}>
          <TextInput
            style={[styles.phoneInput, { color: colors.text }]}
            placeholder="Número"
            placeholderTextColor={colors.subtext}
            value={phoneInput}
            onChangeText={onPhoneChange}
            onFocus={() => phoneFocus.set(withTiming(1, { duration: 180 }))}
            onBlur={() => phoneFocus.set(withTiming(0, { duration: 180 }))}
            keyboardType="phone-pad"
            maxFontSizeMultiplier={1.15}
          />
          {phoneInput.length > 0 ? (
            <ScalePressable onPress={() => onPhoneChange("")} style={styles.inlineButton}>
              <X size={18} color={colors.subtext} />
            </ScalePressable>
          ) : (
            <Grid3X3 size={21} color={colors.subtext} />
          )}
        </Animated.View>
      </View>

      <Animated.View style={[styles.messageShell, { backgroundColor: colors.inputBg }, messageFocusStyle]}>
        <MessageSquare size={17} color={colors.subtext} style={styles.messageIcon} />
        <TextInput
          style={[styles.messageInput, { color: colors.text }]}
          placeholder="Mensaje opcional..."
          placeholderTextColor={colors.subtext}
          value={messageInput}
          onChangeText={onMessageChange}
          onFocus={() => messageFocus.set(withTiming(1, { duration: 180 }))}
          onBlur={() => messageFocus.set(withTiming(0, { duration: 180 }))}
          multiline
          numberOfLines={3}
          maxFontSizeMultiplier={1.2}
        />
        {messageInput.length > 0 && (
          <ScalePressable onPress={() => onMessageChange("")} style={styles.inlineButton}>
            <X size={17} color={colors.subtext} />
          </ScalePressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md
  },
  cardCompact: {
    padding: spacing.sm
  },
  phoneRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  countryButton: {
    width: 108,
    height: 58,
    borderWidth: 1,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: spacing.xs
  },
  countryButtonCompact: {
    width: 98
  },
  flag: {
    fontSize: 21
  },
  countryCode: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  phoneShell: {
    flex: 1,
    height: 58,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1
  },
  phoneInput: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    paddingVertical: 0
  },
  inlineButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  messageShell: {
    marginTop: spacing.xs,
    minHeight: 92,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 1
  },
  messageIcon: {
    marginTop: 4,
    marginRight: spacing.xs
  },
  messageInput: {
    flex: 1,
    minHeight: 66,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingVertical: 0,
    textAlignVertical: "top"
  }
});
