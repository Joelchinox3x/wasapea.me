import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { darkColors, lightColors } from "../theme/colors";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
  isDark?: boolean;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  buttonLabel,
  onButtonPress,
  isDark = false
}: EmptyStateProps) {
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>{subtitle}</Text>
      {buttonLabel && onButtonPress && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>{buttonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  iconBox: {
    marginBottom: 14
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  },
  button: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  }
});
