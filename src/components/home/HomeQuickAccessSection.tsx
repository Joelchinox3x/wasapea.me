import { Clock3, MessageSquareText, Star, UsersRound } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { MessageTemplateItem, PhoneHistoryEntry } from "../../domain/models";
import type { HomeQuickContact } from "../../hooks/useHomeQuickAccess";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ContactCard } from "../ContactCard";
import { HistoryItem } from "../HistoryItem";
import { ScalePressable } from "../ScalePressable";
import { WhatsAppGlyphIcon } from "../icons/AppSvgIcons";

type QuickAccessTab = "recent" | "contacts" | "messages";

interface HomeQuickAccessSectionProps {
  recentItems: PhoneHistoryEntry[];
  latestActions: Record<string, string>;
  contacts: HomeQuickContact[];
  templates: MessageTemplateItem[];
  colors: ThemeColors;
  isDark: boolean;
  onRecentPress: (item: PhoneHistoryEntry) => void;
  onRecentLongPress: (item: PhoneHistoryEntry) => void;
  onRecentWhatsApp: (item: PhoneHistoryEntry) => void;
  onRecentCall: (item: PhoneHistoryEntry) => void;
  onRecentToggleFavorite: (item: PhoneHistoryEntry) => void;
  onRecentDelete: (item: PhoneHistoryEntry) => void;
  onContactPress: (item: HomeQuickContact) => void;
  onContactWhatsApp: (item: HomeQuickContact) => void;
  onContactCall: (item: HomeQuickContact) => void;
  onContactToggleFavorite: (item: HomeQuickContact) => void;
  onTemplateUse: (template: MessageTemplateItem) => void;
  onTemplateSend: (template: MessageTemplateItem) => void;
  onTemplateToggleFavorite: (template: MessageTemplateItem) => void;
}

const tabs: {
  id: QuickAccessTab;
  label: string;
  icon: typeof Clock3;
}[] = [
  { id: "recent", label: "Recientes", icon: Clock3 },
  { id: "contacts", label: "Contactos", icon: UsersRound },
  { id: "messages", label: "Mensajes", icon: MessageSquareText }
];

export function HomeQuickAccessSection({
  recentItems,
  latestActions,
  contacts,
  templates,
  colors,
  isDark,
  onRecentPress,
  onRecentLongPress,
  onRecentWhatsApp,
  onRecentCall,
  onRecentToggleFavorite,
  onRecentDelete,
  onContactPress,
  onContactWhatsApp,
  onContactCall,
  onContactToggleFavorite,
  onTemplateUse,
  onTemplateSend,
  onTemplateToggleFavorite
}: HomeQuickAccessSectionProps) {
  const [activeTab, setActiveTab] = useState<QuickAccessTab>("recent");
  const visibleContacts = contacts.slice(0, 3);
  const visibleTemplates = templates;
  const isEmpty =
    (activeTab === "recent" && recentItems.length === 0) ||
    (activeTab === "contacts" && visibleContacts.length === 0) ||
    (activeTab === "messages" && visibleTemplates.length === 0);

  return (
    <View style={styles.section}>
      <View style={[styles.switcher, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <ScalePressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              pressedScale={0.97}
              style={[
                styles.tab,
                selected && {
                  backgroundColor: colors.card,
                  borderColor: colors.primary + "55"
                }
              ]}
            >
              <Icon size={15} color={selected ? colors.primary : colors.subtext} />
              <Text
                style={[styles.tabText, { color: selected ? colors.primary : colors.subtext }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                maxFontSizeMultiplier={1.15}
              >
                {tab.label}
              </Text>
            </ScalePressable>
          );
        })}
      </View>

      {isEmpty ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {activeTab === "recent" ? <Clock3 size={26} color={colors.subtext} /> : null}
          {activeTab === "contacts" ? <UsersRound size={26} color={colors.subtext} /> : null}
          {activeTab === "messages" ? <MessageSquareText size={26} color={colors.subtext} /> : null}
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Todavía no hay contenido</Text>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>Usa WASAPEA.ME y aquí aparecerán tus accesos más útiles.</Text>
        </View>
      ) : null}

      {activeTab === "recent" && recentItems.map((item) => (
        <HistoryItem
          key={item.id}
          entry={item}
          lastActionType={latestActions[item.id]}
          isDark={isDark}
          onPress={() => onRecentPress(item)}
          onLongPress={() => onRecentLongPress(item)}
          onWhatsApp={() => onRecentWhatsApp(item)}
          onCall={() => onRecentCall(item)}
          onToggleFavorite={() => onRecentToggleFavorite(item)}
          onDelete={() => onRecentDelete(item)}
        />
      ))}

      {activeTab === "contacts" && visibleContacts.map((item) => (
        <View key={item.contact.id}>
          <ContactCard
            contact={item.contact}
            isDark={isDark}
            onPress={() => onContactPress(item)}
            onWhatsApp={() => onContactWhatsApp(item)}
            onCall={() => onContactCall(item)}
            onToggleFavorite={() => onContactToggleFavorite(item)}
          />
          {item.interactionCount > 0 ? (
            <View style={[styles.usageBadge, { backgroundColor: colors.primary + "18" }]} pointerEvents="none">
              <Text style={[styles.usageText, { color: colors.primary }]}>{item.interactionCount} usos</Text>
            </View>
          ) : null}
        </View>
      ))}

      {activeTab === "messages" && visibleTemplates.length > 0 ? (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={174}
          contentContainerStyle={styles.templateRow}
        >
          {visibleTemplates.map((template) => (
            <ScalePressable
              key={template.id}
              onPress={() => onTemplateUse(template)}
              pressedScale={0.97}
              accessibilityRole="button"
              accessibilityLabel={`Enviar plantilla ${template.title}`}
              style={[
                styles.templateCard,
                {
                  backgroundColor: colors.card,
                  borderColor: template.favorite === 1 ? colors.favorite + "88" : colors.cardBorder
                }
              ]}
            >
              <View style={[styles.templateAccent, { backgroundColor: template.color }]} />
              <View style={styles.templateTop}>
                <View style={[styles.templateIcon, { backgroundColor: template.color + "1F" }]}>
                  <MessageSquareText size={21} color={template.color} />
                </View>
                <ScalePressable
                  onPress={(event) => {
                    event.stopPropagation();
                    onTemplateToggleFavorite(template);
                  }}
                  accessibilityLabel={template.favorite === 1 ? "Quitar de favoritas" : "Marcar como favorita"}
                  pressedScale={0.9}
                  style={styles.favoriteButton}
                >
                  <Star
                    size={17}
                    color={template.favorite === 1 ? colors.favorite : colors.subtext}
                    fill={template.favorite === 1 ? colors.favorite : "none"}
                  />
                </ScalePressable>
              </View>
              <Text style={[styles.templateTitle, { color: colors.text }]} numberOfLines={2}>{template.title}</Text>
              <Text style={[styles.templatePreview, { color: colors.subtext }]} numberOfLines={5}>{template.content}</Text>
              <View style={styles.templateFooter}>
                <Text style={[styles.templateUses, { color: colors.subtext }]}>
                  {template.useCount > 0 ? `${template.useCount} usos` : "Lista para usar"}
                </Text>
                <ScalePressable
                  onPress={(event) => {
                    event.stopPropagation();
                    onTemplateSend(template);
                  }}
                  pressedScale={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={`Enviar ${template.title} por WhatsApp`}
                  style={[styles.sendButton, { backgroundColor: colors.primary }]}
                >
                  <WhatsAppGlyphIcon size={17} color="#FFFFFF" />
                </ScalePressable>
              </View>
            </ScalePressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.sm },
  switcher: { flexDirection: "row", borderRadius: radius.md, borderWidth: 1, padding: 4, marginBottom: spacing.xs },
  tab: { flex: 1, minHeight: 38, borderRadius: radius.sm, borderWidth: 1, borderColor: "transparent", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 4 },
  tabText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5 },
  empty: { minHeight: 132, borderRadius: radius.lg, borderWidth: 1, alignItems: "center", justifyContent: "center", padding: spacing.md },
  emptyTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15, marginTop: spacing.xs },
  emptyText: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 3, textAlign: "center" },
  usageBadge: { position: "absolute", left: 49, bottom: 13, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  usageText: { fontFamily: fonts.bodySemiBold, fontSize: 9.5 },
  templateRow: { paddingRight: spacing.md, paddingBottom: spacing.xs },
  templateCard: { width: 162, minHeight: 222, borderRadius: radius.lg, borderWidth: 1, padding: spacing.sm, marginRight: spacing.sm, overflow: "hidden" },
  templateAccent: { position: "absolute", left: 0, right: 0, top: 0, height: 4 },
  templateTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  templateIcon: { width: 39, height: 39, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  favoriteButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  templateTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15, lineHeight: 19, minHeight: 38, marginTop: spacing.sm },
  templatePreview: { flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 5 },
  templateFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  templateUses: { flex: 1, fontFamily: fonts.body, fontSize: 9.5 },
  sendButton: { width: 32, height: 32, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" }
});
