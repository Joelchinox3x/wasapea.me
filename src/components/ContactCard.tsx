import { Phone, Star } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { InternalContact } from "../repositories/ContactRepository";
import { darkColors, lightColors } from "../theme/colors";
import { WhatsAppGlyphIcon } from "./icons/AppSvgIcons";

interface ContactCardProps {
  contact: InternalContact;
  categoryName?: string;
  categoryColor?: string;
  onPress: () => void;
  onWhatsApp: () => void;
  onCall: () => void;
  onToggleFavorite: () => void;
  isDark?: boolean;
}

export function ContactCard({
  contact,
  categoryName,
  categoryColor,
  onPress,
  onWhatsApp,
  onCall,
  onToggleFavorite,
  isDark = false
}: ContactCardProps) {
  const colors = isDark ? darkColors : lightColors;
  const avatarColor = categoryName && categoryColor ? categoryColor : null;

  const initial = contact.name.trim().charAt(0).toUpperCase() || "👤";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      {/* Avatar Initial */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: avatarColor ? `${avatarColor}20` : colors.inputBg,
            borderColor: avatarColor || colors.cardBorder
          }
        ]}
      >
        <Text style={[styles.avatarText, { color: avatarColor || colors.text }]}>{initial}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {contact.name}
          </Text>
          {categoryName && categoryColor && (
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "20" }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryName}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.phone, { color: colors.subtext }]}>{contact.phoneFormatted}</Text>

        {contact.company && (
          <Text style={[styles.company, { color: colors.subtext }]} numberOfLines={1}>
            🏢 {contact.company}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Star
            size={19}
            color={contact.favorite === 1 ? colors.favorite : colors.subtext}
            fill={contact.favorite === 1 ? colors.favorite : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onWhatsApp}
          style={[styles.quickBtn, { backgroundColor: colors.primary }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <WhatsAppGlyphIcon size={17} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCall}
          style={[styles.quickBtn, { backgroundColor: colors.call }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Phone size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8
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
  avatarText: {
    fontSize: 18,
    fontWeight: "800"
  },
  info: {
    flex: 1,
    marginRight: 8
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6
  },
  name: {
    fontSize: 16,
    fontWeight: "700"
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700"
  },
  phone: {
    fontSize: 13,
    marginTop: 2
  },
  company: {
    fontSize: 12,
    marginTop: 2
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  quickBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  }
});
