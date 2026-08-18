import { CheckSquare, RefreshCw, Search, Smartphone, Square, Upload, Users, X } from "lucide-react-native";
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
import { ContactRepository, type InternalContact } from "../repositories/ContactRepository";
import { CommunicationService, type DeviceContactExportResult } from "../services/CommunicationService";
import type { ThemeColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { ScalePressable } from "./ScalePressable";

interface MultiContactExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExportSuccess: (result: DeviceContactExportResult) => void;
  colors: ThemeColors;
  defaultCountryIso?: string;
}

type MultiContactExportModalContentProps = Omit<MultiContactExportModalProps, "visible">;

export function MultiContactExportModal({ visible, ...props }: MultiContactExportModalProps) {
  if (!visible) return null;
  return <MultiContactExportModalContent {...props} />;
}

function MultiContactExportModalContent({
  onClose,
  onExportSuccess,
  colors,
  defaultCountryIso = "PE"
}: MultiContactExportModalContentProps) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<InternalContact[]>([]);
  const [totalAppContacts, setTotalAppContacts] = useState(0);
  const [alreadyOnPhoneCount, setAlreadyOnPhoneCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      ContactRepository.getAll(),
      CommunicationService.getDeviceContactPhoneNumbers(defaultCountryIso)
    ])
      .then(([rows, deviceResult]) => {
        if (!active) return;
        if (deviceResult.error) throw new Error(deviceResult.error);
        const deviceNumbers = new Set(deviceResult.phoneNumbers);
        const availableContacts = rows.filter((contact) => !deviceNumbers.has(contact.phoneE164));
        setContacts(availableContacts);
        setTotalAppContacts(rows.length);
        setAlreadyOnPhoneCount(rows.length - availableContacts.length);
        setLoading(false);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudieron comparar las agendas.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [defaultCountryIso]);

  const handleRetry = async () => {
    if (loading || exporting) return;
    setLoading(true);
    setError("");
    try {
      const [rows, deviceResult] = await Promise.all([
        ContactRepository.getAll(),
        CommunicationService.getDeviceContactPhoneNumbers(defaultCountryIso)
      ]);
      if (deviceResult.error) throw new Error(deviceResult.error);
      const deviceNumbers = new Set(deviceResult.phoneNumbers);
      const availableContacts = rows.filter((contact) => !deviceNumbers.has(contact.phoneE164));
      setContacts(availableContacts);
      setTotalAppContacts(rows.length);
      setAlreadyOnPhoneCount(rows.length - availableContacts.length);
      setSelectedIds(new Set());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron comparar las agendas.");
    } finally {
      setLoading(false);
    }
  };

  const requestClose = () => {
    if (!exporting) onClose();
  };

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query) ||
      contact.phoneFormatted.toLowerCase().includes(query) ||
      contact.phoneE164.includes(query)
    );
  }, [contacts, search]);

  const allFilteredSelected = useMemo(() => {
    return filteredContacts.length > 0 && filteredContacts.every((contact) => selectedIds.has(contact.id));
  }, [filteredContacts, selectedIds]);

  const toggleSelectAll = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredContacts.forEach((contact) => next.delete(contact.id));
      } else {
        filteredContacts.forEach((contact) => next.add(contact.id));
      }
      return next;
    });
  };

  const toggleContact = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async () => {
    if (selectedIds.size === 0 || exporting) return;
    setExporting(true);
    setError("");
    const selected = contacts
      .filter((contact) => selectedIds.has(contact.id))
      .map((contact) => ({
        name: contact.name,
        phoneE164: contact.phoneE164,
        company: contact.company || undefined
      }));
    const result = await CommunicationService.saveManyToDeviceContacts(selected, defaultCountryIso);
    if (result.error) {
      setError(result.error);
      setExporting(false);
      return;
    }
    setExporting(false);
    onExportSuccess(result);
    onClose();
  };

  const selectedCount = selectedIds.size;

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={requestClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} disabled={exporting} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}> 
          <View style={styles.header}>
            <View style={[styles.iconShell, { backgroundColor: colors.primary + "20" }]}> 
              <Smartphone size={22} color={colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>Exportar al teléfono</Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>
                {alreadyOnPhoneCount > 0
                  ? `${contacts.length} por exportar · ${alreadyOnPhoneCount} ya guardados ocultos`
                  : "Guarda tu agenda de WASAPEA.ME en el celular"}
              </Text>
            </View>
            <ScalePressable
              onPress={requestClose}
              disabled={exporting}
              style={[styles.closeButton, { backgroundColor: colors.badgeBg }, exporting && styles.disabled]}
            >
              <X size={18} color={colors.subtext} />
            </ScalePressable>
          </View>

          {contacts.length > 0 ? (
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
                {search ? (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
                    <X size={15} color={colors.subtext} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={toggleSelectAll}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: allFilteredSelected }}
                style={[styles.selectAllButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              >
                {allFilteredSelected ? <CheckSquare size={17} color={colors.primary} /> : <Square size={17} color={colors.subtext} />}
                <Text style={[styles.selectAllText, { color: allFilteredSelected ? colors.primary : colors.subtext }]}> 
                  {allFilteredSelected ? "Todos" : "Marcar"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.feedbackText, { color: colors.subtext }]}>Cargando contactos guardados...</Text>
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
              <Users size={42} color={colors.subtext} />
              <Text style={[styles.feedbackText, { color: colors.subtext }]}> 
                {search
                  ? "No hay resultados para esta búsqueda."
                  : totalAppContacts > 0
                    ? "Todos tus contactos de WASAPEA.ME ya están guardados en el teléfono."
                    : "Todavía no tienes contactos guardados en WASAPEA.ME."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const selected = selectedIds.has(item.id);
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleContact(item.id)}
                    style={[
                      styles.contactItem,
                      {
                        backgroundColor: selected ? colors.primary + "12" : colors.inputBg,
                        borderColor: selected ? colors.primary + "66" : colors.cardBorder
                      }
                    ]}
                  >
                    {selected ? <CheckSquare size={20} color={colors.primary} /> : <Square size={20} color={colors.subtext} />}
                    <View style={[styles.avatar, { backgroundColor: selected ? colors.primary + "22" : colors.badgeBg }]}> 
                      <Text style={[styles.avatarText, { color: selected ? colors.primary : colors.text }]}> 
                        {item.name.trim().charAt(0).toUpperCase() || "C"}
                      </Text>
                    </View>
                    <View style={styles.contactCopy}>
                      <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.contactPhone, { color: colors.subtext }]} numberOfLines={1}>{item.phoneFormatted}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View style={[styles.footer, { borderTopColor: colors.cardBorder, paddingBottom: Math.max(spacing.md, insets.bottom + spacing.xs) }]}> 
            <ScalePressable
              onPress={() => void handleExport()}
              disabled={selectedCount === 0 || exporting}
              style={[styles.exportButton, { backgroundColor: colors.primary }, (selectedCount === 0 || exporting) && styles.disabled]}
            >
              {exporting ? <ActivityIndicator color="#FFFFFF" /> : <Upload size={19} color="#FFFFFF" />}
              <Text style={styles.exportText}>
                {exporting
                  ? "Guardando en el teléfono..."
                  : selectedCount > 0
                    ? `Exportar ${selectedCount} contacto${selectedCount > 1 ? "s" : ""}`
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
  backdrop: { flex: 1, backgroundColor: "rgba(2, 6, 23, 0.75)", justifyContent: "flex-end" },
  card: { height: "82%", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, paddingTop: spacing.md, overflow: "hidden" },
  header: { paddingHorizontal: spacing.md, marginBottom: spacing.xs, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  iconShell: { width: 42, height: 42, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.displayBold, fontSize: 19 },
  subtitle: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 2 },
  closeButton: { width: 34, height: 34, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  searchBox: { flex: 1, height: 42, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.xs, flexDirection: "row", alignItems: "center", gap: 6 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 13, paddingVertical: 0 },
  clearButton: { padding: 4 },
  selectAllButton: { height: 42, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 5 },
  selectAllText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  feedbackText: { fontFamily: fonts.body, fontSize: 13, textAlign: "center", marginTop: spacing.xs },
  errorText: { fontFamily: fonts.bodySemiBold, fontSize: 13, textAlign: "center" },
  retryButton: { minHeight: 42, marginTop: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  retryText: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: 8 },
  contactItem: { flexDirection: "row", alignItems: "center", padding: spacing.xs + 2, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs },
  avatar: { width: 36, height: 36, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.displayBold, fontSize: 15 },
  contactCopy: { flex: 1, minWidth: 0 },
  contactName: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  contactPhone: { fontFamily: fonts.body, fontSize: 12, marginTop: 1 },
  footer: { borderTopWidth: 1, padding: spacing.md },
  exportButton: { height: 50, borderRadius: radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  exportText: { color: "#FFFFFF", fontFamily: fonts.displaySemiBold, fontSize: 14.5 },
  disabled: { opacity: 0.5 }
});
