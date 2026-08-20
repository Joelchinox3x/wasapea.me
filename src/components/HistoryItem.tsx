import * as Haptics from "expo-haptics";
import { Phone, Star, Trash2 } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
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
  const swipeableRef = useRef<Swipeable>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        <WhatsAppGlyphIcon size={19} color="#FFFFFF" />
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
        <Phone size={17} color="#FFFFFF" />
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
        <Star size={18} color="#FFFFFF" fill={entry.favorite === 1 ? "#FFFFFF" : "none"} />
        <Text style={styles.swipeBtnText}>{entry.favorite === 1 ? "Quitar" : "Favorito"}</Text>
      </TouchableOpacity>
    </View>
  );

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
      containerStyle={styles.swipeableContainer}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={450}
        accessibilityHint={onLongPress ? "Mantén presionado para ver más acciones" : undefined}
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      >
        <View pointerEvents="none" style={[styles.actionAccent, { backgroundColor: actionColor }]} />

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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {contactName || entry.phoneFormatted}
              </Text>
              {entry.favorite === 1 && (
                <Star size={13} color={colors.favorite} fill={colors.favorite} style={{ marginLeft: 4 }} />
              )}
            </View>
            {hasContact && (
              <Text style={[styles.subtitle, { color: colors.subtext }]}>{entry.phoneFormatted}</Text>
            )}
          </View>
        </View>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.iconButton, { backgroundColor: colors.badgeBg }]}
            accessibilityLabel="Eliminar del historial"
          >
            <Trash2 size={16} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Swipeable>
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
  },
  swipeableContainer: {
    marginBottom: 8
  },
  rightSwipeActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
    gap: 6,
    paddingLeft: 8
  },
  leftSwipeActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 8,
    paddingRight: 8
  },
  swipeBtn: {
    height: 74,
    minWidth: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 12
  },
  swipeBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700"
  }
});
