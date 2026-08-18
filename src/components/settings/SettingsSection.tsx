import { ChevronRight } from "lucide-react-native";
import React, { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { SettingsCard } from "./SettingsCard";

type SettingsIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

interface SettingsSectionProps extends PropsWithChildren {
  title: string;
  colors: ThemeColors;
}

export function SettingsSection({ title, colors, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      <SettingsCard colors={colors} style={styles.card}>
        {children}
      </SettingsCard>
    </View>
  );
}

interface SettingsRowProps {
  icon: SettingsIcon;
  title: string;
  colors: ThemeColors;
  subtitle?: string;
  value?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  danger?: boolean;
  accessibilityLabel?: string;
}

export function SettingsRow({
  icon: Icon,
  title,
  colors,
  subtitle,
  value,
  trailing,
  onPress,
  last = false,
  danger = false,
  accessibilityLabel
}: SettingsRowProps) {
  const accent = danger ? colors.error : colors.primary;
  const content = (
    <>
      <View style={[styles.iconShell, { backgroundColor: `${accent}1F` }]}>
        <Icon size={21} color={accent} strokeWidth={2} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.rowTitle, { color: danger ? colors.error : colors.text }]} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.subtext }]} maxFontSizeMultiplier={1.2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.trailing}>
        {value ? <Text style={[styles.value, { color: colors.subtext }]}>{value}</Text> : null}
        {trailing}
        {onPress ? <ChevronRight size={19} color={danger ? colors.error : colors.subtext} /> : null}
      </View>
    </>
  );

  const rowStyle = [
    styles.row,
    !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.cardBorder }
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={rowStyle}
        onPress={onPress}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs
  },
  card: {
    padding: 0,
    marginBottom: 0,
    overflow: "hidden"
  },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  copy: {
    flex: 1,
    paddingRight: spacing.xs
  },
  rowTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 2
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 13,
    maxWidth: 92
  }
});
