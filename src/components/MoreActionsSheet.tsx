import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetMethods
} from "@expo/ui/community/bottom-sheet";
import { Copy, QrCode, UserPlus, X } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "../theme/colors";
import { fonts, radius, spacing } from "../theme/designSystem";
import { WhatsAppBusinessIcon } from "./icons/AppSvgIcons";

export interface MoreActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  disabled: boolean;
  targetLabel?: string;
  onWhatsAppBusiness?: () => void;
  onCopy: () => void;
  onSaveToAgenda?: () => void;
  onShowQr?: () => void;
}

interface ActionItemProps {
  label: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onPress: () => void;
  colors: ThemeColors;
}

function ActionItem({ label, description, color, icon: Icon, onPress, colors }: ActionItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: color + "20" }}
      style={({ pressed }) => [
        styles.actionItem,
        { backgroundColor: colors.badgeBg, borderColor: colors.glassBorder },
        pressed && styles.actionItemPressed
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + "1F" }]}>
        <Icon size={21} color={color} strokeWidth={2} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.actionDescription, { color: colors.subtext }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

export function MoreActionsSheet({
  visible,
  onClose,
  colors,
  disabled,
  targetLabel,
  onWhatsAppBusiness,
  onCopy,
  onSaveToAgenda,
  onShowQr
}: MoreActionsSheetProps) {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const handleSheetClosed = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    onClose();
    action?.();
  }, [onClose]);

  const closeWithoutAction = useCallback(() => {
    pendingActionRef.current = null;
    if (sheetRef.current) {
      sheetRef.current.close();
      return;
    }
    onClose();
  }, [onClose]);

  const runAndClose = useCallback(
    (action: () => void) => {
      pendingActionRef.current = action;
      if (sheetRef.current) {
        sheetRef.current.close();
        return;
      }
      pendingActionRef.current = null;
      onClose();
      action();
    },
    [onClose]
  );

  if (disabled) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      enableDynamicSizing
      enablePanDownToClose
      onClose={handleSheetClosed}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.text }]}>Más acciones</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
              {targetLabel || "Elige qué hacer con este número"}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={8}
            onPress={closeWithoutAction}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.badgeBg },
              pressed && styles.closeButtonPressed
            ]}
          >
            <X size={20} color={colors.subtext} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          {onWhatsAppBusiness && (
            <ActionItem
              label="WhatsApp Business"
              description="Abrir el número en la aplicación Business"
              color={colors.primary}
              icon={WhatsAppBusinessIcon}
              onPress={() => runAndClose(onWhatsAppBusiness)}
              colors={colors}
            />
          )}
          <ActionItem
            label="Copiar número"
            description="Copiar en formato internacional"
            color={colors.accent}
            icon={Copy}
            onPress={() => runAndClose(onCopy)}
            colors={colors}
          />
          {onSaveToAgenda && (
            <ActionItem
              label="Guardar en Agenda"
              description="Crear un contacto dentro de WASAPEA.ME"
              color={colors.warning}
              icon={UserPlus}
              onPress={() => runAndClose(onSaveToAgenda)}
              colors={colors}
            />
          )}
          {onShowQr && (
            <ActionItem
              label="Código QR"
              description="Compartir un acceso directo al chat"
              color={colors.sms}
              icon={QrCode}
              onPress={() => runAndClose(onShowQr)}
              colors={colors}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 28
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  headerCopy: {
    flex: 1,
    paddingRight: spacing.sm
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  closeButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.94 }]
  },
  actions: {
    gap: spacing.xs
  },
  actionItem: {
    minHeight: 66,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    overflow: "hidden"
  },
  actionItemPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }]
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  actionCopy: {
    flex: 1
  },
  actionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  actionDescription: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2
  }
});
