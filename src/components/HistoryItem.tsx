import { Phone, Star, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { POPULAR_COUNTRIES } from "../constants/app";
import { PhoneHistoryEntry } from "../repositories/HistoryRepository";
import { darkColors, lightColors } from "../theme/colors";
import { WhatsAppGlyphIcon } from "./icons/AppSvgIcons";

interface HistoryItemProps {
  entry: PhoneHistoryEntry;
  lastActionType?: string;
  onPress: () => void;
  onLongPress?: () => void;
  onWhatsApp: () => void;
  onCall: () => void;
  onToggleFavorite: () => void;
  onDelete?: () => void;
  isDark?: boolean;
}

export function HistoryItem({
  entry,
  lastActionType,
  onPress,
  onLongPress,
  onWhatsApp,
  onCall,
  onToggleFavorite,
  onDelete,
  isDark = false
}: HistoryItemProps) {
  const colors = isDark ? darkColors : lightColors;

  const country = POPULAR_COUNTRIES.find((c) => c.iso.toUpperCase() === entry.countryIso.toUpperCase());
  const flag = country?.flag || "🌐";
  const contactName = entry.name?.trim() ?? "";
  const hasContact = contactName.length > 0;
  const initial = contactName.charAt(0).toUpperCase();
  const actionColor = lastActionType === "call"
    ? colors.call
    : lastActionType === "sms"
      ? colors.sms
      : lastActionType === "whatsapp" || lastActionType === "whatsapp_message"
        ? colors.primary
        : colors.accent;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityHint={onLongPress ? "Mantén presionado para ver más acciones" : undefined}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View pointerEvents="none" style={[styles.actionAccent, { backgroundColor: actionColor }]} />
      <TouchableOpacity
        onPress={onToggleFavorite}
        style={[
          styles.favoriteButton,
          {
            backgroundColor: entry.favorite === 1 ? `${colors.favorite}26` : colors.inputBg,
            borderColor: entry.favorite === 1 ? `${colors.favorite}66` : colors.cardBorder
          }
        ]}
        accessibilityLabel={entry.favorite === 1 ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <Star
          size={14}
          color={entry.favorite === 1 ? colors.favorite : colors.subtext}
          fill={entry.favorite === 1 ? colors.favorite : "none"}
        />
      </TouchableOpacity>

      <View style={styles.left}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.cardBorder
            }
          ]}
        >
          <Text style={hasContact ? [styles.initial, { color: colors.text }] : styles.flag}>
            {hasContact ? initial : flag}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {contactName || entry.phoneFormatted}
          </Text>
          {hasContact && (
            <Text style={[styles.subtitle, { color: colors.subtext }]}>{entry.phoneFormatted}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onWhatsApp}
          style={[styles.quickBtn, { backgroundColor: colors.primary }]}
          accessibilityLabel="Abrir WhatsApp"
        >
          <WhatsAppGlyphIcon size={17} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCall}
          style={[styles.quickBtn, { backgroundColor: colors.call }]}
          accessibilityLabel="Llamar"
        >
          <Phone size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.iconButton, { backgroundColor: colors.badgeBg }]}
            accessibilityLabel="Eliminar del historial"
          >
            <Trash2 size={16} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 74,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8
  },
  actionAccent: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  flag: {
    fontSize: 22
  },
  initial: {
    fontSize: 18,
    fontWeight: "800"
  },
  info: {
    flex: 1
  },
  title: {
    fontSize: 15,
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2
  },
  actions: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6
  },
  quickBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  favoriteButton: {
    position: "absolute",
    top: 5,
    left: 5,
    zIndex: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
