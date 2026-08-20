import { useFocusEffect, useRouter } from "expo-router";
import { Download, Plus, Star, Upload, Users } from "lucide-react-native";
import LottieView from "lottie-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryChip } from "../../../components/CategoryChip";
import { ContactCard } from "../../../components/ContactCard";
import { EmptyState } from "../../../components/EmptyState";
import { MultiContactExportModal } from "../../../components/MultiContactExportModal";
import { MultiContactImportModal } from "../../../components/MultiContactImportModal";
import { SearchInput } from "../../../components/SearchInput";
import {
  ClientIcon,
  PersonalIcon,
  SupplierIcon,
  TemporaryIcon,
  WorkIcon,
  type AppSvgIcon
} from "../../../components/icons/AppSvgIcons";
import { CategoryItemData, CategoryRepository } from "../../../repositories/CategoryRepository";
import { ContactRepository, InternalContact } from "../../../repositories/ContactRepository";
import { HistoryRepository } from "../../../repositories/HistoryRepository";
import { CommunicationService } from "../../../services/CommunicationService";
import { useAppStore } from "../../../store/useAppStore";
import { darkColors, lightColors } from "../../../theme/colors";

const CATEGORY_ICONS: Record<string, AppSvgIcon> = {
  "cat-clientes": ClientIcon,
  "cat-proveedores": SupplierIcon,
  "cat-trabajo": WorkIcon,
  "cat-personal": PersonalIcon,
  "cat-temporal": TemporaryIcon
};

export default function AgendaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const { themeMode, showToast, selectedCountry } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;
  const isCompact = width <= 380;

  const [contactsList, setContactsList] = useState<InternalContact[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItemData[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const showClientEmptyAnimation = selectedCategoryId === "cat-clientes" && !onlyFavorites && !search.trim();

  const recordContactAction = useCallback(
    async (contactItem: InternalContact, actionType: "whatsapp" | "call" | "sms") => {
      try {
        await HistoryRepository.logAction({
          phoneE164: contactItem.phoneE164,
          phoneFormatted: contactItem.phoneFormatted,
          countryCode: contactItem.countryCode,
          countryIso: contactItem.countryIso,
          name: contactItem.name,
          actionType
        });
      } catch {
        /* ignore */
      }
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      const [cats, cnts] = await Promise.all([
        CategoryRepository.getAll(),
        ContactRepository.getAll({ search, categoryId: selectedCategoryId, onlyFavorites })
      ]);
      setCategoriesList(cats);
      setContactsList(cnts);
    } catch {
      /* ignore */
    }
  }, [search, selectedCategoryId, onlyFavorites]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text
              style={[styles.title, isCompact && styles.titleCompact, { color: colors.primary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              maxFontSizeMultiplier={1.1}
            >
              Agenda interna
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={2} maxFontSizeMultiplier={1.1}>
              Contactos en WASAPEA.ME
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              onPress={() => setImportModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Importar contactos del dispositivo"
            >
              <Download size={19} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              onPress={() => setExportModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Exportar contactos al teléfono"
            >
              <Upload size={19} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, isCompact && styles.addBtnCompact, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/agenda/create")}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addText} numberOfLines={1} maxFontSizeMultiplier={1.1}>Nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <SearchInput
          value={search}
          onChangeText={(val: string) => {
            setSearch(val);
          }}
          placeholder="Buscar en tu agenda..."
          isDark={isDark}
        />

        {/* Categories Horizontal Chips Filter */}
        <View style={{ height: 42, marginBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <CategoryChip
              label="Todos"
              isSelected={selectedCategoryId === "all" && !onlyFavorites}
              onPress={() => {
                setSelectedCategoryId("all");
                setOnlyFavorites(false);
              }}
              color={colors.primary}
              isDark={isDark}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setOnlyFavorites(!onlyFavorites)}
              style={[
                styles.favChip,
                {
                  backgroundColor: onlyFavorites ? colors.favorite : `${colors.favorite}14`,
                  borderColor: onlyFavorites ? colors.favorite : `${colors.favorite}66`
                }
              ]}
            >
              <Star size={14} color={onlyFavorites ? "#FFFFFF" : colors.favorite} fill={onlyFavorites ? "#FFFFFF" : "none"} />
              <Text style={[styles.favChipText, { color: onlyFavorites ? "#FFFFFF" : colors.favorite }]}>
                Favoritos
              </Text>
            </TouchableOpacity>

            {categoriesList.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                color={cat.color}
                icon={CATEGORY_ICONS[cat.id]}
                isSelected={selectedCategoryId === cat.id && !onlyFavorites}
                onPress={() => {
                  setSelectedCategoryId(cat.id);
                  setOnlyFavorites(false);
                }}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        </View>

        {/* Contacts List */}
        <FlatList
          data={contactsList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 12, paddingTop: 4 }}
          renderItem={({ item }) => {
            const cat = categoriesList.find((c) => c.id === item.categoryId);
            return (
              <ContactCard
                contact={item}
                categoryName={cat?.name}
                categoryColor={cat?.color}
                isDark={isDark}
                onPress={() => router.push(`/agenda/${item.id}`)}
                onWhatsApp={async () => {
                  await recordContactAction(item, "whatsapp");
                  await CommunicationService.openWhatsApp(item.phoneE164);
                }}
                onCall={async () => {
                  await recordContactAction(item, "call");
                  await CommunicationService.makeCall(item.phoneE164);
                }}
                onToggleFavorite={async () => {
                  await ContactRepository.toggleFavorite(item.id);
                  loadData();
                }}
                onDelete={async () => {
                  await ContactRepository.delete(item.id);
                  loadData();
                  showToast({ message: "Contacto eliminado.", tone: "info" });
                }}
              />
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={showClientEmptyAnimation ? (
                <LottieView
                  source={require("../../../../assets/lotties/empty-state.json")}
                  autoPlay
                  loop
                  resizeMode="contain"
                  style={styles.emptyAnimation}
                  webStyle={{ width: 220, height: 112 }}
                />
              ) : (
                <Users size={48} color={colors.subtext} />
              )}
              title={showClientEmptyAnimation ? "Aún no tienes clientes" : "Tu agenda rápida está vacía"}
              subtitle={showClientEmptyAnimation
                ? "Agrega tu primer cliente para tener su número y datos siempre a la mano."
                : "Guarda contactos temporales o clientes con notas para tener toda la información a la mano."}
              buttonLabel="+ Crear nuevo contacto"
              onButtonPress={() => router.push("/agenda/create")}
              isDark={isDark}
            />
          }
        />
      </View>

      <MultiContactImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        colors={colors}
        isDark={isDark}
        defaultCountryIso={selectedCountry.iso}
        onImportSuccess={(importedCount, skippedCount) => {
          loadData();
          showToast({
            message: `¡${importedCount} contactos importados!${
              skippedCount > 0 ? ` (${skippedCount} ya existían)` : ""
            }`,
            tone: "success",
            duration: 3_000
          });
        }}
      />

      <MultiContactExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        colors={colors}
        defaultCountryIso={selectedCountry.iso}
        onExportSuccess={(result) => {
          const details = [
            result.skippedCount > 0 ? `${result.skippedCount} ya existían` : "",
            result.failedCount > 0 ? `${result.failedCount} no se pudieron guardar` : ""
          ].filter(Boolean).join(" · ");
          showToast({
            message: result.exportedCount > 0
              ? `¡${result.exportedCount} contactos guardados en tu teléfono!${details ? ` (${details})` : ""}`
              : result.skippedCount > 0 && result.failedCount === 0
                ? "Los contactos seleccionados ya estaban en tu teléfono."
                : "No se pudo guardar ningún contacto en el teléfono.",
            tone: result.failedCount > 0 && result.exportedCount === 0 ? "error" : "success",
            duration: 4_000
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 8
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 8
  },
  title: {
    fontSize: 24,
    fontWeight: "900"
  },
  titleCompact: {
    fontSize: 21
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  importBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12
  },
  addBtnCompact: {
    paddingHorizontal: 10
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16
  },
  favChip: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8
  },
  favChipText: {
    fontSize: 11.5,
    fontWeight: "700"
  },
  emptyAnimation: {
    width: 220,
    height: 112
  }
});
