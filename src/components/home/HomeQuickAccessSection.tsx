import * as Haptics from "expo-haptics";
import { MessageSquareText, UsersRound } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, runOnJS } from "react-native-reanimated";
import type { MessageTemplateItem, PhoneHistoryEntry } from "../../domain/models";
import type { HomeQuickContact } from "../../hooks/useHomeQuickAccess";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ContactCard } from "../ContactCard";
import { ScalePressable } from "../ScalePressable";
import { WhatsAppGlyphIcon } from "../icons/AppSvgIcons";
import { QuickTemplateModal } from "../messages/QuickTemplateModal";

type QuickAccessTab = "contacts" | "messages";

interface HomeQuickAccessSectionProps {
  recentItems?: PhoneHistoryEntry[];
  latestActions?: Record<string, string>;
  contacts: HomeQuickContact[];
  templates: MessageTemplateItem[];
  colors: ThemeColors;
  isDark: boolean;
  onRecentPress?: (item: PhoneHistoryEntry) => void;
  onRecentLongPress?: (item: PhoneHistoryEntry) => void;
  onRecentWhatsApp?: (item: PhoneHistoryEntry) => void;
  onRecentCall?: (item: PhoneHistoryEntry) => void;
  onRecentToggleFavorite?: (item: PhoneHistoryEntry) => void;
  onRecentDelete?: (item: PhoneHistoryEntry) => void;
  onContactPress: (item: HomeQuickContact) => void;
  onContactWhatsApp: (item: HomeQuickContact) => void;
  onContactCall: (item: HomeQuickContact) => void;
  onContactToggleFavorite: (item: HomeQuickContact) => void;
  onContactDelete?: (item: HomeQuickContact) => void;
  onTemplateUse: (template: MessageTemplateItem) => void;
  onTemplateSend: (template: MessageTemplateItem) => void;
  onTemplateToggleFavorite: (template: MessageTemplateItem) => void;
  onReloadTemplates?: () => void;
}

export const HomeQuickAccessSection = React.memo(function HomeQuickAccessSection({
  contacts,
  templates,
  colors,
  isDark,
  onContactPress,
  onContactWhatsApp,
  onContactCall,
  onContactToggleFavorite,
  onTemplateUse,
  onTemplateSend,
  onTemplateToggleFavorite,
  onReloadTemplates
}: HomeQuickAccessSectionProps) {
  const [activeTab, setActiveTab] = useState<QuickAccessTab>("contacts");
  const [createTemplateVisible, setCreateTemplateVisible] = useState(false);
  const visibleContacts = contacts.slice(0, 10);
  const visibleTemplates = templates;
  const isEmpty =
    (activeTab === "contacts" && visibleContacts.length === 0) ||
    (activeTab === "messages" && visibleTemplates.length === 0);

  const toggleTab = () => {
    void Haptics.selectionAsync().catch(() => { });
    setActiveTab((current) => (current === "contacts" ? "messages" : "contacts"));
  };

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(toggleTab)();
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(toggleTab)();
    });

  const swipeTabGesture = Gesture.Simultaneous(flingLeft, flingRight);

  return (
    <View style={styles.section}>
      {/* Ultra-thin Tab Color Strip */}
      <View style={styles.tabStripRow}>
        <View
          style={[
            styles.tabStripBar,
            {
              backgroundColor: activeTab === "contacts" ? colors.primary : colors.cardBorder,
              opacity: activeTab === "contacts" ? 1 : 0.35
            }
          ]}
        />
        <View
          style={[
            styles.tabStripBar,
            {
              backgroundColor: activeTab === "messages" ? colors.primary : colors.cardBorder,
              opacity: activeTab === "messages" ? 1 : 0.35
            }
          ]}
        />
      </View>

      {/* Content Container wrapped in Gesture */}
      <GestureDetector gesture={swipeTabGesture}>
        <Animated.View key={activeTab} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flex: 1 }}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            {isEmpty ? (
              <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {activeTab === "contacts" ? <UsersRound size={26} color={colors.subtext} /> : null}
                {activeTab === "messages" ? <MessageSquareText size={26} color={colors.subtext} /> : null}
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Todavía no hay contenido</Text>
                <Text style={[styles.emptyText, { color: colors.subtext }]}>
                  Usa WASAPEA.ME y aquí aparecerán tus accesos más útiles.
                </Text>
              </View>
            ) : null}

            {activeTab === "contacts" &&
              visibleContacts.map((item) => (
                <View key={item.contact.id} style={styles.contactWrapper}>
                  <ContactCard
                    contact={item.contact}
                    isDark={isDark}
                    enableSwipeable={false}
                    showInlineWhatsApp
                    showInlineCall
                    onPress={() => onContactPress(item)}
                    onWhatsApp={() => onContactWhatsApp(item)}
                    onCall={() => onContactCall(item)}
                    onToggleFavorite={() => onContactToggleFavorite(item)}
                  />
                </View>
              ))}

            {activeTab === "messages" && visibleTemplates.length > 0 ? (
              <View style={styles.proChipsContainer}>
                {visibleTemplates.map((template) => (
                  <ScalePressable
                    key={template.id}
                    onPress={() => onTemplateUse(template)}
                    pressedScale={0.97}
                    accessibilityRole="button"
                    accessibilityLabel={`Usar plantilla ${template.title}`}
                    style={[
                      styles.proChip,
                      {
                        backgroundColor: colors.card,
                        borderColor: template.favorite === 1 ? colors.favorite + "88" : colors.primary + "26"
                      }
                    ]}
                  >
                    <View style={[styles.proChipIcon, { backgroundColor: colors.primary + "14" }]}>
                      <MessageSquareText size={14} color={colors.primary} />
                    </View>

                    <View style={styles.proChipContent}>
                      <Text style={[styles.proChipTitle, { color: colors.text }]} numberOfLines={1}>
                        {template.title}
                      </Text>
                    </View>

                    <ScalePressable
                      onPress={(event) => {
                        event.stopPropagation();
                        onTemplateSend(template);
                      }}
                      pressedScale={0.9}
                      accessibilityRole="button"
                      accessibilityLabel={`Enviar ${template.title} por WhatsApp`}
                      style={[styles.proChipSend, { backgroundColor: colors.primary }]}
                    >
                      <WhatsAppGlyphIcon size={14} color="#FFFFFF" />
                    </ScalePressable>
                  </ScalePressable>
                ))}
              </View>
            ) : null}
          </ScrollView>
        </Animated.View>
      </GestureDetector>

      <QuickTemplateModal
        visible={createTemplateVisible}
        colors={colors}
        onClose={() => setCreateTemplateVisible(false)}
        onSaved={() => onReloadTemplates?.()}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  section: { flex: 1, marginTop: spacing.xs, marginBottom: 0, position: "relative" },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  contactWrapper: { marginBottom: 6 },
  tabStripRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2
  },
  tabStripBar: {
    flex: 1,
    height: 2.5,
    borderRadius: 2
  },
  storyBarContainer: { flexDirection: "row", gap: 6, marginBottom: 8, paddingHorizontal: 2 },
  storySegmentTouchable: { flex: 1, paddingVertical: 4 },
  storySegment: { height: 3, borderRadius: 2 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xs },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
  swipeHintBadge: { borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  swipeHintText: { fontFamily: fonts.bodySemiBold, fontSize: 10 },
  addTemplateBtn: { width: 32, height: 32, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  empty: { minHeight: 120, borderRadius: radius.lg, borderWidth: 1, alignItems: "center", justifyContent: "center", padding: spacing.md },
  emptyTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15, marginTop: spacing.xs },
  emptyText: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 3, textAlign: "center" },
  proChipsContainer: { gap: 6, marginTop: spacing.xs, paddingBottom: spacing.xs },
  proChip: { minHeight: 38, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 6 },
  proChipIcon: { width: 25, height: 25, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  proChipContent: { flex: 1, justifyContent: "center" },
  proChipTitle: { fontFamily: fonts.displaySemiBold, fontSize: 12 },
  proChipPreview: { fontFamily: fonts.body, fontSize: 10.5, marginTop: 0.5 },
  proChipFav: { padding: 3 },
  proChipSend: { width: 25, height: 25, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" }
});
