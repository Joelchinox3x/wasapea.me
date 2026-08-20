import * as Haptics from "expo-haptics";
import { Phone, Star, Trash2 } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import type { InternalContact } from "../repositories/ContactRepository";
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
  onDelete?: () => void;
  showInlineWhatsApp?: boolean;
  showInlineCall?: boolean;
  showInlineFavorite?: boolean;
  isDark?: boolean;
  enableSwipeable?: boolean;
}

export function ContactCard({
  contact,
  categoryName,
  categoryColor,
  onPress,
  onWhatsApp,
  onCall,
  onToggleFavorite,
  onDelete,
  showInlineWhatsApp = false,
  showInlineCall = false,
  showInlineFavorite = false,
  isDark = false,
  enableSwipeable = true
}: ContactCardProps) {
  const colors = isDark ? darkColors : lightColors;
  const avatarColor = categoryName && categoryColor ? categoryColor : null;
  const swipeableRef = useRef<Swipeable>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initial = contact.name.trim().charAt(0).toUpperCase() || "👤";

  const triggerHaptic = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const clearAutoCloseTimer = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  const handleOpen = () => {
    clearAutoCloseTimer();
    autoCloseTimerRef.current = setTimeout(() => {
      swipeableRef.current?.close();
    }, 3500);
  };

  useEffect(() => {
    return () => {
      clearAutoCloseTimer();
    };
  }, []);

  const renderRightActions = () => (
    <View style={styles.rightSwipeActions}>
      <TouchableOpacity
        style={[styles.swipeBtn, { backgroundColor: colors.primary }]}
        onPress={() => {
          triggerHaptic();
          swipeableRef.current?.close();
          onWhatsApp();
        }}
      >
        <WhatsAppGlyphIcon size={20} color="#FFFFFF" />
        <Text style={styles.swipeBtnText}>WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.swipeBtn, { backgroundColor: colors.call }]}
        onPress={() => {
          triggerHaptic();
          swipeableRef.current?.close();
          onCall();
        }}
      >
        <Phone size={18} color="#FFFFFF" />
        <Text style={styles.swipeBtnText}>Llamar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.leftSwipeActions}>
      <TouchableOpacity
        style={[styles.swipeBtn, { backgroundColor: colors.favorite }]}
        onPress={() => {
          triggerHaptic();
          swipeableRef.current?.close();
          onToggleFavorite();
        }}
      >
        <Star size={19} color="#FFFFFF" fill={contact.favorite === 1 ? "#FFFFFF" : "none"} />
        <Text style={styles.swipeBtnText}>{contact.favorite === 1 ? "Quitar" : "Favorito"}</Text>
      </TouchableOpacity>
    </View>
  );

  const cardContent = (
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

      {/* Actions / Indicator */}
      <View style={styles.actions}>
        {showInlineFavorite ? (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              onToggleFavorite();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Star
              size={18}
              color={contact.favorite === 1 ? colors.favorite : colors.subtext}
              fill={contact.favorite === 1 ? colors.favorite : "none"}
            />
          </TouchableOpacity>
        ) : contact.favorite === 1 ? (
          <Star size={16} color={colors.favorite} fill={colors.favorite} style={{ marginRight: 4 }} />
        ) : null}

        {showInlineWhatsApp && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              onWhatsApp();
            }}
            style={[styles.quickBtn, { backgroundColor: colors.primary }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <WhatsAppGlyphIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {showInlineCall && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              onCall();
            }}
            style={[styles.quickBtn, { backgroundColor: colors.call }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Phone size={15} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              onDelete();
            }}
            style={[styles.quickBtn, { backgroundColor: colors.error + "1A" }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Eliminar contacto"
          >
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!enableSwipeable) {
    return cardContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={handleOpen}
      onSwipeableClose={clearAutoCloseTimer}
      friction={1.6}
      overshootRight={false}
      overshootLeft={false}
      containerStyle={styles.swipeContainer}
    >
      {cardContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 8
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1
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
  },
  cleanTrailingRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  rightSwipeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 6,
    marginBottom: 8
  },
  leftSwipeActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
    marginBottom: 8
  },
  swipeBtn: {
    width: 64,
    height: "100%",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  swipeBtnText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700"
  }
});
