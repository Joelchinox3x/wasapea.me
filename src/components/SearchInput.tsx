import { Search, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { darkColors, lightColors } from "../theme/colors";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isDark?: boolean;
}

export function SearchInput({ value, onChangeText, placeholder = "Buscar...", isDark = false }: SearchInputProps) {
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.box, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
      <Search size={18} color={colors.subtext} style={{ marginRight: 8 }} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={16} color={colors.subtext} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginVertical: 10
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: "100%"
  }
});
