import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { PhoneHistoryEntry } from "../../domain/models";
import type { ThemeColors } from "../../theme/colors";
import { fonts, spacing } from "../../theme/designSystem";
import { HistoryItem } from "../HistoryItem";
import { ScalePressable } from "../ScalePressable";

interface RecentHistorySectionProps {
  items: PhoneHistoryEntry[];
  latestActions: Record<string, string>;
  colors: ThemeColors;
  isDark: boolean;
  onSeeAll: () => void;
  onPress: (item: PhoneHistoryEntry) => void;
  onLongPress: (item: PhoneHistoryEntry) => void;
  onWhatsApp: (item: PhoneHistoryEntry) => void;
  onCall: (item: PhoneHistoryEntry) => void;
  onToggleFavorite: (item: PhoneHistoryEntry) => void;
  onDelete: (item: PhoneHistoryEntry) => void;
}

export function RecentHistorySection({
  items,
  latestActions,
  colors,
  isDark,
  onSeeAll,
  onPress,
  onLongPress,
  onWhatsApp,
  onCall,
  onToggleFavorite,
  onDelete
}: RecentHistorySectionProps) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Usados recientemente</Text>
        <ScalePressable onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todo</Text>
        </ScalePressable>
      </View>
      {items.map((item) => (
        <HistoryItem
          key={item.id}
          entry={item}
          lastActionType={latestActions[item.id]}
          isDark={isDark}
          onPress={() => onPress(item)}
          onLongPress={() => onLongPress(item)}
          onWhatsApp={() => onWhatsApp(item)}
          onCall={() => onCall(item)}
          onToggleFavorite={() => onToggleFavorite(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 21
  },
  seeAllButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs
  },
  seeAll: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13
  }
});
