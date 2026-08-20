import { ChevronDown, Clock3, Grid3X3, MessageSquare, User, X } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import type { CountryItem } from "../../constants/app";
import type { PhoneService } from "../../services/PhoneService";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

export interface PhoneSuggestionItem {
  id: string;
  phoneE164: string;
  phoneFormatted: string;
  name?: string;
  countryIso?: string;
}

interface PhoneComposerCardProps {
  colors: ThemeColors;
  compact: boolean;
  country: CountryItem;
  phoneInput: string;
  messageInput: string;
  parsedPhone: ReturnType<typeof PhoneService.parse>;
  recentSuggestions?: PhoneSuggestionItem[];
  onCountryPress: () => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSelectSuggestion?: (item: PhoneSuggestionItem) => void;
}

export function PhoneComposerCard({
  colors,
  compact,
  country,
  phoneInput,
  messageInput,
  parsedPhone,
  recentSuggestions,
  onCountryPress,
  onPhoneChange,
  onMessageChange,
  onSelectSuggestion
}: PhoneComposerCardProps) {
  const phoneFocus = useSharedValue(0);
  const messageFocus = useSharedValue(0);
  const [showDropdown, setShowDropdown] = useState(false);
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

  const hasSuggestions = Boolean(recentSuggestions && recentSuggestions.length > 0);

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

        <View style={styles.phoneShellWrapper}>
          <Animated.View style={[styles.phoneShell, { backgroundColor: colors.inputBg }, phoneFocusStyle]}>
            <TextInput
              style={[styles.phoneInput, { color: colors.text }]}
              placeholder="Número"
              placeholderTextColor={colors.subtext}
              value={phoneInput}
              onChangeText={(val) => {
                onPhoneChange(val);
                if (val.length > 0) setShowDropdown(false);
              }}
              onFocus={() => {
                phoneFocus.set(withTiming(1, { duration: 180 }));
                if (hasSuggestions) setShowDropdown(true);
              }}
              onBlur={() => {
                phoneFocus.set(withTiming(0, { duration: 180 }));
                setTimeout(() => setShowDropdown(false), 220);
              }}
              keyboardType="phone-pad"
              maxFontSizeMultiplier={1.15}
            />
            {phoneInput.length > 0 ? (
              <ScalePressable onPress={() => onPhoneChange("")} style={styles.inlineButton}>
                <X size={18} color={colors.subtext} />
              </ScalePressable>
            ) : hasSuggestions ? (
              <ScalePressable
                onPress={() => setShowDropdown((prev) => !prev)}
                style={styles.inlineButton}
                accessibilityLabel="Mostrar números recientes"
              >
                <Clock3 size={19} color={colors.primary} />
              </ScalePressable>
            ) : (
              <Grid3X3 size={21} color={colors.subtext} />
            )}
          </Animated.View>

          {/* Floating Compact Phone Autocomplete Dropdown */}
          {showDropdown && hasSuggestions && recentSuggestions && (
            <Animated.View
              entering={FadeInDown.duration(180)}
              exiting={FadeOutUp.duration(120)}
              style={[styles.dropdownContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              {recentSuggestions.slice(0, 5).map((item, index) => (
                <ScalePressable
                  key={item.id}
                  onPress={() => {
                    onSelectSuggestion?.(item);
                    setShowDropdown(false);
                  }}
                  pressedScale={0.97}
                  style={[styles.dropdownItem, index > 0 && { borderTopWidth: 1, borderTopColor: colors.cardBorder + "33" }]}
                >
                  <View style={[styles.itemAvatar, { backgroundColor: colors.primary + "1A" }]}>
                    <User size={11} color={colors.primary} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                      {item.name || item.phoneFormatted}
                    </Text>
                    {item.name ? (
                      <Text style={[styles.itemPhone, { color: colors.subtext }]} numberOfLines={1}>
                        {item.phoneFormatted}
                      </Text>
                    ) : null}
                  </View>
                </ScalePressable>
              ))}
            </Animated.View>
          )}
        </View>
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
          numberOfLines={4}
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
    gap: spacing.sm,
    zIndex: 99,
    position: "relative"
  },
  phoneShellWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 99
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
  validBadge: {
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center"
  },
  inlineButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  dropdownContainer: {
    position: "absolute",
    top: 62,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 2,
    overflow: "hidden"
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  itemAvatar: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center"
  },
  itemName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12
  },
  itemPhone: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 0.5
  },
  messageShell: {
    marginTop: spacing.xs,
    height: 138,
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
    height: 118,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingVertical: 0,
    textAlignVertical: "top"
  }
});
