import { CheckSquare, Download, RefreshCw, Search, Square, Users, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContactRepository, CreateContactParams } from "../repositories/ContactRepository";
import { CommunicationService } from "../services/CommunicationService";
import type { ThemeColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";

interface DeviceContactItem {
  id: string;
  name: string;
  rawPhone: string;
  phoneE164: string;
  phoneFormatted: string;
  countryCode: string;
  countryIso: string;
}

interface MultiContactImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number, skippedCount: number) => void;
  colors: ThemeColors;
  isDark?: boolean;
  defaultCountryIso?: string;
}

type MultiContactImportModalContentProps = Omit<MultiContactImportModalProps, "visible">;

export function MultiContactImportModal({
  visible,
  ...props
}: MultiContactImportModalProps) {
  if (!visible) return null;
  return <MultiContactImportModalContent {...props} />;
}

function MultiContactImportModalContent({
  onClose,
  onImportSuccess,
  colors,
  defaultCountryIso = "PE"
}: MultiContactImportModalContentProps) {
  const insets = useSafeAreaInsets();
  const [deviceContacts, setDeviceContacts] = useState<DeviceContactItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void CommunicationService.getAllDeviceContacts(defaultCountryIso).then((res) => {
      if (!active) return;
      setLoading(false);
      if (res.error) {
        setError(res.error);
        setDeviceContacts([]);
      } else {
        setDeviceContacts(res.contacts);
      }
    });
    return () => {
      active = false;
    };
  }, [defaultCountryIso]);

  const handleRetry = async () => {
    if (loading || importing) return;
    setLoading(true);
    setError("");
    const res = await CommunicationService.getAllDeviceContacts(defaultCountryIso);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      setDeviceContacts([]);
      return;
    }
    setDeviceContacts(res.contacts);
  };

  const requestClose = () => {
    if (!importing) onClose();
  };

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deviceContacts;
    return deviceContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phoneFormatted.toLowerCase().includes(q) ||
        c.phoneE164.includes(q) ||
        c.rawPhone.includes(q)
    );
  }, [deviceContacts, search]);

  const allFilteredSelected = useMemo(() => {
    if (filteredContacts.length === 0) return false;
    return filteredContacts.every((c) => selectedIds.has(c.id));
  }, [filteredContacts, selectedIds]);

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allFilteredSelected) {
      filteredContacts.forEach((c) => next.delete(c.id));
    } else {
      filteredContacts.forEach((c) => next.add(c.id));
    }
    setSelectedIds(next);
  };

  const toggleContact = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleImport = async () => {
    if (selectedIds.size === 0 || importing) return;
    setImporting(true);

    const contactsToImport: CreateContactParams[] = deviceContacts
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({
        name: c.name,
        phoneE164: c.phoneE164,
        phoneFormatted: c.phoneFormatted,
        countryCode: c.countryCode,
        countryIso: c.countryIso
      }));

    try {
      const result = await ContactRepository.bulkCreate(contactsToImport);
      setImporting(false);
      onImportSuccess(result.importedCount, result.skippedCount);
      onClose();
    } catch (err) {
      setImporting(false);
      setError(err instanceof Error ? err.message : "No se pudieron guardar los contactos.");
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={requestClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} disabled={importing} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconShell, { backgroundColor: colors.primary + "20" }]}>
                <Users size={22} color={colors.primary} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: colors.text }]}>Importar contactos</Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]}>
                  {deviceContacts.length > 0
                    ? `${deviceContacts.length} contactos encontrados en tu teléfono`
                    : "Selecciona contactos de tu agenda"}
                </Text>
              </View>
              <ScalePressable
                onPress={requestClose}
                disabled={importing}
                style={[styles.closeButton, { backgroundColor: colors.badgeBg }, importing && styles.disabledBtn]}
              >
                <X size={18} color={colors.subtext} />
              </ScalePressable>
            </View>
          </View>

          {/* Search bar & Select All */}
          {deviceContacts.length > 0 ? (
            <View style={styles.controlsRow}>
              <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                <Search size={16} color={colors.subtext} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar nombre o número..."
                  placeholderTextColor={colors.subtext}
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
                    <X size={15} color={colors.subtext} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={toggleSelectAll}
                style={[styles.selectAllBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: allFilteredSelected }}
              >
                {allFilteredSelected ? (
                  <CheckSquare size={17} color={colors.primary} />
                ) : (
                  <Square size={17} color={colors.subtext} />
                )}
                <Text style={[styles.selectAllText, { color: allFilteredSelected ? colors.primary : colors.subtext }]}>
                  {allFilteredSelected ? "Todos" : "Marcar"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Content area */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subtext }]}>Leyendo agenda de tu teléfono...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              <ScalePressable
                onPress={() => void handleRetry()}
                style={[styles.retryButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              >
                <RefreshCw size={17} color={colors.primary} />
                <Text style={[styles.retryText, { color: colors.primary }]}>Reintentar</Text>
              </ScalePressable>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                {search ? "No se encontraron contactos para esta búsqueda." : "No hay contactos con número de teléfono."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = selectedIds.has(item.id);
                const initial = item.name.charAt(0).toUpperCase() || "C";
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleContact(item.id)}
                    style={[
                      styles.contactItem,
                      {
                        backgroundColor: isSelected ? colors.primary + "12" : colors.inputBg,
                        borderColor: isSelected ? colors.primary + "66" : colors.cardBorder
                      }
                    ]}
                  >
                    <View style={styles.checkboxShell}>
                      {isSelected ? (
                        <CheckSquare size={20} color={colors.primary} />
                      ) : (
                        <Square size={20} color={colors.subtext} />
                      )}
                    </View>

                    <View style={[styles.avatar, { backgroundColor: isSelected ? colors.primary + "22" : colors.badgeBg }]}>
                      <Text style={[styles.avatarText, { color: isSelected ? colors.primary : colors.text }]}>
                        {initial}
                      </Text>
                    </View>

                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.contactPhone, { color: colors.subtext }]} numberOfLines={1}>
                        {item.phoneFormatted}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Footer action button */}
          <View
            style={[
              styles.footer,
              {
                borderTopColor: colors.cardBorder,
                paddingBottom: Math.max(spacing.md, insets.bottom + spacing.xs)
              }
            ]}
          > 
            <ScalePressable
              onPress={() => void handleImport()}
              disabled={selectedCount === 0 || importing}
              style={[
                styles.importActionBtn,
                { backgroundColor: colors.primary },
                (selectedCount === 0 || importing) && styles.disabledBtn
              ]}
            >
              {importing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Download size={19} color="#FFFFFF" />
              )}
              <Text style={styles.importActionText}>
                {importing
                  ? "Guardando contactos..."
                  : selectedCount > 0
                  ? `Importar ${selectedCount} contacto${selectedCount > 1 ? "s" : ""}`
                  : "Selecciona al menos 1 contacto"}
              </Text>
            </ScalePressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    justifyContent: "flex-end"
  },
  card: {
    height: "82%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: spacing.md,
    overflow: "hidden"
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center"
  },
  headerCopy: {
    flex: 1
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 19
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    marginTop: 2
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs
  },
  searchBox: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    paddingVertical: 0
  },
  clearBtn: {
    padding: 4
  },
  selectAllBtn: {
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  selectAllText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 8
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs
  },
  checkboxShell: {
    paddingHorizontal: 2
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    fontFamily: fonts.displayBold,
    fontSize: 15
  },
  contactInfo: {
    flex: 1
  },
  contactName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  contactPhone: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: spacing.xs
  },
  errorText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    textAlign: "center"
  },
  retryButton: {
    minHeight: 42,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7
  },
  retryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: "center"
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.md
  },
  importActionBtn: {
    height: 50,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  importActionText: {
    color: "#FFFFFF",
    fontFamily: fonts.displaySemiBold,
    fontSize: 14.5
  },
  disabledBtn: {
    opacity: 0.5
  }
});
