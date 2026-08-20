import { useFocusEffect, useRouter } from "expo-router";
import { Clock, Trash2 } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { EmptyState } from "../../components/EmptyState";
import { HistoryItem } from "../../components/HistoryItem";
import { MoreActionsSheet } from "../../components/MoreActionsSheet";
import { QrCodeModal } from "../../components/QrCodeModal";
import { SearchInput } from "../../components/SearchInput";
import { ContactRepository } from "../../repositories/ContactRepository";
import { HistoryRepository, PhoneHistoryEntry } from "../../repositories/HistoryRepository";
import { CommunicationService } from "../../services/CommunicationService";
import { PhoneService } from "../../services/PhoneService";
import { useAppStore } from "../../store/useAppStore";
import { darkColors, lightColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { buildHistoryActionMaps, enrichHistoryWithContacts } from "../../utils/historyPresentation";

interface HistorySection {
  key: string;
  title: string;
  data: PhoneHistoryEntry[];
}

function localDayKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function sectionTitle(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Anteriores";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (localDayKey(value) === localDayKey(today.toISOString())) return "Hoy";
  if (localDayKey(value) === localDayKey(yesterday.toISOString())) return "Ayer";
  const label = date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function HistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { themeMode, selectedCountry, setSelectedCountry, setCurrentPhoneInput, showToast } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  const [historyList, setHistoryList] = useState<PhoneHistoryEntry[]>([]);
  const [actionTypes, setActionTypes] = useState<Record<string, string[]>>({});
  const [latestActions, setLatestActions] = useState<Record<string, string>>({});
  const [hasAnyHistory, setHasAnyHistory] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmClearVisible, setConfirmClearVisible] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<PhoneHistoryEntry | null>(null);
  const [qrTarget, setQrTarget] = useState<PhoneHistoryEntry | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const [allHistory, actions, contacts] = await Promise.all([
        HistoryRepository.getAll(),
        HistoryRepository.getAllActions(),
        ContactRepository.getAll()
      ]);
      const enriched = enrichHistoryWithContacts(allHistory, contacts);
      const term = search.trim().toLowerCase();
      const list = term
        ? enriched.filter((entry) =>
            entry.phoneE164.toLowerCase().includes(term)
            || entry.phoneFormatted.toLowerCase().includes(term)
            || entry.name?.toLowerCase().includes(term)
          )
        : enriched;
      const maps = buildHistoryActionMaps(actions);
      setHistoryList(list);
      setActionTypes(maps.actionTypes);
      setLatestActions(maps.latestActions);
      setHasAnyHistory(allHistory.length > 0);
      setLoadError(null);
    } catch (error) {
      setHistoryList([]);
      setActionTypes({});
      setLatestActions({});
      setLoadError(error instanceof Error ? error.message : "No se pudo leer el historial local.");
    }
  }, [search]);

  useFocusEffect(useCallback(() => { void loadHistory(); }, [loadHistory]));

  const sections = useMemo<HistorySection[]>(() => {
    const grouped = new Map<string, HistorySection>();
    for (const entry of historyList) {
      const key = localDayKey(entry.lastInteractionAt);
      const current = grouped.get(key);
      if (current) current.data.push(entry);
      else grouped.set(key, { key, title: sectionTitle(entry.lastInteractionAt), data: [entry] });
    }
    return [...grouped.values()];
  }, [historyList]);

  const handleClearAll = async () => {
    await HistoryRepository.clearAll();
    setConfirmClearVisible(false);
    await loadHistory();
  };

  const handleDeleteItem = async (id: string) => {
    await HistoryRepository.delete(id);
    await loadHistory();
  };

  const trackHistoryAction = async (item: PhoneHistoryEntry, actionType: "whatsapp" | "call") => {
    try {
      await HistoryRepository.logAction({
        phoneE164: item.phoneE164,
        phoneFormatted: item.phoneFormatted,
        countryCode: item.countryCode,
        countryIso: item.countryIso,
        name: item.name || undefined,
        actionType
      });
      await loadHistory();
    } catch {
      // Abrir la acción sigue siendo más importante que actualizar el contador.
    }
  };

  const handleCopyTarget = useCallback(async () => {
    if (!actionTarget) return;
    const result = await CommunicationService.copyToClipboard(actionTarget.phoneE164);
    showToast({ message: result.message || result.error || "Número copiado al portapapeles.", tone: result.success ? "success" : "error" });
  }, [actionTarget, showToast]);

  const handleSaveTarget = useCallback(() => {
    if (!actionTarget) return;
    router.push({
      pathname: "/agenda/create",
      params: {
        phoneE164: actionTarget.phoneE164,
        phoneFormatted: actionTarget.phoneFormatted,
        countryCode: actionTarget.countryCode,
        countryIso: actionTarget.countryIso,
        name: actionTarget.name || undefined
      }
    });
  }, [actionTarget, router]);

  const handleShowTargetQr = useCallback(() => {
    if (actionTarget) setQrTarget(actionTarget);
  }, [actionTarget]);

  const emptyTitle = loadError
    ? "No se pudo cargar el historial"
    : search.trim()
      ? "No encontramos coincidencias"
      : "Aún no hay historial";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headingCopy}>
            <Text style={[styles.title, { color: colors.primary }]}>Historial</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>Números e interacciones recientes</Text>
          </View>
          {hasAnyHistory && (
            <TouchableOpacity
              style={[styles.clearBtn, { backgroundColor: `${colors.error}14`, borderColor: `${colors.error}52` }]}
              onPress={() => setConfirmClearVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Borrar todo el historial"
            >
              <Trash2 size={15} color={colors.error} />
              <Text style={[styles.clearText, { color: colors.error }]}>Borrar todo</Text>
            </TouchableOpacity>
          )}
        </View>

        <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar números o nombres..." isDark={isDark} />

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <HistoryItem
              entry={item}
              lastActionType={latestActions[item.id]}
              isDark={isDark}
              onPress={() => {
                const normalized = PhoneService.normalizeForInput(item.phoneE164, selectedCountry.iso);
                if (normalized) {
                  setSelectedCountry(normalized.country);
                  setCurrentPhoneInput(normalized.input);
                } else setCurrentPhoneInput(item.phoneFormatted);
                router.navigate("/");
              }}
              onLongPress={() => setActionTarget(item)}
              onWhatsApp={async () => {
                await trackHistoryAction(item, "whatsapp");
                await CommunicationService.openWhatsApp(item.phoneE164);
              }}
              onCall={async () => {
                await trackHistoryAction(item, "call");
                await CommunicationService.makeCall(item.phoneE164);
              }}
              onToggleFavorite={async () => {
                await HistoryRepository.toggleFavorite(item.id);
                await loadHistory();
              }}
              onDelete={() => void handleDeleteItem(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Clock size={48} color={colors.subtext} />}
              title={emptyTitle}
              subtitle={loadError
                ? `No se pudo cargar el historial: ${loadError}`
                : "Realiza una búsqueda o inicia un nuevo chat desde el Home."}
              isDark={isDark}
            />
          }
        />
      </View>

      <ConfirmationModal
        visible={confirmClearVisible}
        title="¿Borrar todo el historial?"
        message="Esta acción eliminará permanentemente todos los registros de llamadas, mensajes y búsquedas recientes."
        confirmText="Sí, borrar todo"
        cancelText="Cancelar"
        isDanger
        onConfirm={() => void handleClearAll()}
        onCancel={() => setConfirmClearVisible(false)}
        isDark={isDark}
      />

      <MoreActionsSheet
        visible={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        colors={colors}
        disabled={actionTarget === null}
        targetLabel={actionTarget?.phoneFormatted}
        onCopy={handleCopyTarget}
        onSaveToAgenda={handleSaveTarget}
        onShowQr={handleShowTargetQr}
      />

      {qrTarget && (
        <QrCodeModal visible onClose={() => setQrTarget(null)} e164={qrTarget.phoneE164} formattedNumber={qrTarget.phoneFormatted} isDark={isDark} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  headingCopy: { flex: 1, paddingRight: spacing.sm },
  title: { fontFamily: fonts.displayBold, fontSize: 28 },
  subtitle: { fontFamily: fonts.body, fontSize: 12.5, marginTop: 1 },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  clearText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5 },
  filterScroll: { flexGrow: 0, marginBottom: spacing.xs },
  filters: { gap: 7, paddingRight: spacing.md },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  filterText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5 },
  listContent: { flexGrow: 1, paddingBottom: spacing.lg },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginLeft: 2
  }
});
