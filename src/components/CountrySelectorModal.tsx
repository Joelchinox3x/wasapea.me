import { Globe, Search, Sparkles, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CountryItem } from "../constants/app";
import { ALL_COUNTRIES, LATAM_SPAIN_USA_CODES } from "../constants/countries";
import { darkColors, lightColors } from "../theme/colors";

interface CountrySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCountry: (country: CountryItem) => void;
  selectedIso: string;
  isDark?: boolean;
}

type ListItem =
  | { type: "header"; title: string; icon: "sparkles" | "globe" }
  | { type: "country"; data: CountryItem };

export function CountrySelectorModal({
  visible,
  onClose,
  onSelectCountry,
  selectedIso,
  isDark = false
}: CountrySelectorModalProps) {
  const colors = isDark ? darkColors : lightColors;
  const [searchTerm, setSearchTerm] = useState("");

  // Build the list of items (with section headers when not searching)
  const listItems = useMemo<ListItem[]>(() => {
    const term = searchTerm.toLowerCase().trim();

    if (term) {
      // Search across ALL 245 countries
      const filtered = ALL_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.code.includes(term) ||
          c.iso.toLowerCase().includes(term)
      );
      return filtered.map((c) => ({ type: "country" as const, data: c }));
    }

    // Default view: Priority LatAm/Spain/USA at the top + Rest below
    const popular: CountryItem[] = [];
    const others: CountryItem[] = [];

    ALL_COUNTRIES.forEach((c) => {
      if (LATAM_SPAIN_USA_CODES.has(c.iso)) {
        popular.push(c);
      } else {
        others.push(c);
      }
    });

    const items: ListItem[] = [
      { type: "header", title: "Frecuentes (América Latina, España, EE.UU.)", icon: "sparkles" },
      ...popular.map((c) => ({ type: "country" as const, data: c })),
      { type: "header", title: "Todos los Países del Mundo (A-Z)", icon: "globe" },
      ...others.map((c) => ({ type: "country" as const, data: c }))
    ];

    return items;
  }, [searchTerm]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Selecciona un País</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.inputBg }]}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
            <Search size={18} color={colors.subtext} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar país, prefijo (+51) o código..."
              placeholderTextColor={colors.subtext}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <X size={16} color={colors.subtext} />
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <FlatList
            data={listItems}
            keyExtractor={(item, index) =>
              item.type === "header" ? `header-${index}-${item.title}` : item.data.iso
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.type === "header") {
                return (
                  <View style={[styles.sectionHeaderRow, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    {item.icon === "sparkles" ? (
                      <Sparkles size={13} color="#10B981" />
                    ) : (
                      <Globe size={13} color={colors.subtext} />
                    )}
                    <Text
                      style={[
                        styles.sectionHeaderText,
                        { color: item.icon === "sparkles" ? "#10B981" : colors.subtext }
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                );
              }

              const country = item.data;
              const isSelected = country.iso.toUpperCase() === selectedIso.toUpperCase();
              return (
                <TouchableOpacity
                  style={[
                    styles.countryRow,
                    { borderBottomColor: colors.cardBorder },
                    isSelected && { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }
                  ]}
                  onPress={() => {
                    onSelectCountry(country);
                    onClose();
                  }}
                >
                  <Text style={styles.flag}>{country.flag}</Text>
                  <Text style={[styles.countryName, { color: colors.text }]}>{country.name}</Text>
                  <Text style={[styles.countryCode, { color: colors.primary }]}>{country.code}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end"
  },
  container: {
    height: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16
  },
  searchInput: {
    flex: 1,
    fontSize: 15
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 8
  },
  flag: {
    fontSize: 22,
    marginRight: 12
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500"
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "700"
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 6
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase"
  }
});
