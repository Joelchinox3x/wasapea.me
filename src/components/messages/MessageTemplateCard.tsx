import { Clock3, Pencil, Star, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { MessageTemplateItem } from "../../domain/models";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface MessageTemplateCardProps {
  template: MessageTemplateItem;
  colors: ThemeColors;
  selected: boolean;
  width?: number;
  onUse: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MessageTemplateCard({
  template,
  colors,
  selected,
  width,
  onUse,
  onToggleFavorite,
  onEdit,
  onDelete
}: MessageTemplateCardProps) {
  return (
    <ScalePressable
      onPress={onUse}
      pressedScale={0.985}
      accessibilityRole="button"
      accessibilityLabel={`Usar plantilla ${template.title}`}
      style={[
        styles.card,
        width ? { width } : null,
        {
          backgroundColor: selected ? colors.primary + "12" : colors.card,
          borderColor: selected ? colors.primary : colors.cardBorder
        }
      ]}
    >
      <View style={[styles.accent, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{template.title}</Text>
          <ScalePressable
            onPress={onToggleFavorite}
            accessibilityLabel={template.favorite === 1 ? "Quitar de favoritas" : "Marcar como favorita"}
            style={[styles.iconButton, { backgroundColor: template.favorite === 1 ? colors.favorite + "1F" : colors.inputBg }]}
          >
            <Star
              size={16}
              color={template.favorite === 1 ? colors.favorite : colors.subtext}
              fill={template.favorite === 1 ? colors.favorite : "none"}
            />
          </ScalePressable>
        </View>

        <Text style={[styles.preview, { color: colors.subtext }]} numberOfLines={6}>{template.content}</Text>

        <View style={styles.footer}>
          <View style={styles.meta}>
            {template.lastUsedAt ? <Clock3 size={12} color={colors.subtext} /> : null}
            <Text style={[styles.metaText, { color: colors.subtext }]}> 
              {template.lastUsedAt
                ? `Usada ${template.useCount} ${template.useCount === 1 ? "vez" : "veces"}`
                : template.isDefault === 1 ? "Incluida" : "Creada por ti"}
            </Text>
          </View>

          {template.isDefault !== 1 && (
            <View style={styles.actions}>
              <ScalePressable onPress={onEdit} accessibilityLabel="Editar plantilla" style={styles.smallAction}>
                <Pencil size={15} color={colors.accent} />
              </ScalePressable>
              <ScalePressable onPress={onDelete} accessibilityLabel="Eliminar plantilla" style={styles.smallAction}>
                <Trash2 size={15} color={colors.error} />
              </ScalePressable>
            </View>
          )}
        </View>
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  card: { position: "relative", minHeight: 236, overflow: "hidden", borderRadius: radius.lg, borderWidth: 1, marginRight: spacing.sm },
  accent: { position: "absolute", left: 0, right: 0, top: 0, height: 4 },
  content: { flex: 1, padding: spacing.sm, paddingTop: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  title: { flex: 1, fontFamily: fonts.displaySemiBold, fontSize: 15 },
  iconButton: { width: 32, height: 32, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  preview: { flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 7 },
  footer: { minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  meta: { flexDirection: "row", alignItems: "center" },
  metaText: { fontFamily: fonts.body, fontSize: 10.5 },
  actions: { flexDirection: "row", alignItems: "center", gap: 5 },
  smallAction: { width: 30, height: 28, alignItems: "center", justifyContent: "center" }
});
