import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { fonts, radius } from "../theme/designSystem";
import type { AppSvgIcon } from "./icons/AppSvgIcons";

interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  color?: string;
  icon?: AppSvgIcon;
  onPress: () => void;
  isDark?: boolean;
}

export function CategoryChip({ label, isSelected, color = "#10B981", icon: Icon, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? color : `${color}14`,
          borderColor: isSelected ? color : `${color}66`
        }
      ]}
    >
      {Icon ? <Icon size={14} color={isSelected ? "#FFFFFF" : color} strokeWidth={2.1} /> : null}
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? "#FFFFFF" : color
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: 8
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
  }
});
