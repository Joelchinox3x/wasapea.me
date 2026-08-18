import { ContactRound, MessageSquareText, PhoneCall } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { HistoryStats } from "../../domain/models";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { SettingsSection } from "./SettingsSection";
import { WhatsAppGlyphIcon } from "../icons/AppSvgIcons";

interface StatisticsSettingsProps {
  stats: HistoryStats;
  colors: ThemeColors;
}

export function StatisticsSettings({ stats, colors }: StatisticsSettingsProps) {
  const values = [
    { label: "WhatsApp", value: stats.totalWhatsapp, color: colors.primary, icon: WhatsAppGlyphIcon },
    { label: "Llamadas", value: stats.totalCalls, color: colors.call, icon: PhoneCall },
    { label: "SMS", value: stats.totalSms, color: colors.sms, icon: MessageSquareText },
    { label: "Números", value: stats.uniqueNumbers, color: colors.primary, icon: ContactRound }
  ];

  return (
    <SettingsSection title="ESTADÍSTICAS LOCALES" colors={colors}>
      <View style={styles.content}>
        <View style={styles.grid}>
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <View
                key={item.label}
                style={[styles.stat, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              >
                <View style={[styles.iconShell, { backgroundColor: `${item.color}1F` }]}>
                  <Icon size={18} color={item.color} strokeWidth={2} />
                </View>
                <Text style={[styles.number, { color: item.color }]}>{item.value}</Text>
                <Text style={[styles.label, { color: colors.subtext }]} numberOfLines={1}>{item.label}</Text>
              </View>
            );
          })}
        </View>
        <View style={[styles.metaRow, { borderTopColor: colors.cardBorder }]}>
          <Text style={[styles.meta, { color: colors.subtext }]}>Últimos 7 días: <Text style={{ color: colors.text }}>{stats.last7DaysActions}</Text></Text>
          <Text style={[styles.meta, { color: colors.subtext }]}>30 días: <Text style={{ color: colors.text }}>{stats.last30DaysActions}</Text></Text>
        </View>
      </View>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.sm
  },
  grid: {
    flexDirection: "row",
    gap: 6
  },
  stat: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical: spacing.xs
  },
  iconShell: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  number: {
    fontFamily: fonts.displayBold,
    fontSize: 18
  },
  label: {
    width: "100%",
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    textAlign: "center",
    marginTop: 1
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xxs
  },
  meta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5
  }
});
