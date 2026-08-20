import { CalendarDays, Clock3, MapPin, Pencil, Star, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { isAppointmentMessageTemplate, LOCATION_MESSAGE_TEMPLATE_ID } from "../../constants/messageTemplates";
import type { MessageTemplateItem } from "../../domain/models";
import type { TemplateDensity } from "../../store/useAppStore";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";

interface MessageTemplateCardProps {
  template: MessageTemplateItem;
  colors: ThemeColors;
  selected: boolean;
  width?: number;
  density?: TemplateDensity;
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
  density = "large",
  onUse,
  onToggleFavorite,
  onEdit,
  onDelete
}: MessageTemplateCardProps) {
  const isGrid2x2 = density === "grid2x2";
  const isGrid2x3 = density === "grid2x3";
  const isAppointment = isAppointmentMessageTemplate(template.id);
  const isLocation = template.id === LOCATION_MESSAGE_TEMPLATE_ID;
  const isInteractive = isAppointment || isLocation;

  const cardAccentColor = isAppointment ? "#8B5CF6" : isLocation ? "#059669" : colors.primary;

  const maxPreviewLines = isGrid2x3 ? 3 : isGrid2x2 ? 2 : 4;

  return (
    <ScalePressable
      onPress={onUse}
      pressedScale={0.985}
      accessibilityRole="button"
      accessibilityLabel={`Usar plantilla ${template.title}`}
      style={[
        styles.card,
        isGrid2x2 && styles.cardGrid2x2,
        isGrid2x3 && styles.cardGrid2x3,
        width ? { width } : null,
        {
          backgroundColor: selected
            ? cardAccentColor + "16"
            : isInteractive
            ? cardAccentColor + "0D"
            : colors.card,
          borderColor: selected
            ? cardAccentColor
            : isInteractive
            ? cardAccentColor + "55"
            : colors.cardBorder
        }
      ]}
    >
      <View style={[styles.accent, { backgroundColor: cardAccentColor }]} />
      <View style={[styles.content, isGrid2x3 && styles.content2x3]}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isGrid2x3 && styles.title2x3, { color: colors.text }]}
            numberOfLines={1}
          >
            {template.title}
          </Text>
          <ScalePressable
            onPress={onToggleFavorite}
            accessibilityLabel={template.favorite === 1 ? "Quitar de favoritas" : "Marcar como favorita"}
            style={[
              styles.iconButton,
              isGrid2x3 && styles.iconButton2x3,
              { backgroundColor: template.favorite === 1 ? colors.favorite + "1F" : colors.inputBg }
            ]}
          >
            <Star
              size={isGrid2x3 ? 11 : 14}
              color={template.favorite === 1 ? colors.favorite : colors.subtext}
              fill={template.favorite === 1 ? colors.favorite : "none"}
            />
          </ScalePressable>
        </View>

        {/* Modal / Form Tag for Interactive Templates */}
        {isInteractive && !isGrid2x3 && (
          <View style={[styles.modalTag, { backgroundColor: cardAccentColor + "1F" }]}>
            {isAppointment ? (
              <CalendarDays size={10} color={cardAccentColor} />
            ) : (
              <MapPin size={10} color={cardAccentColor} />
            )}
            <Text style={[styles.modalTagText, { color: cardAccentColor }]}>
              {isAppointment ? "FORMULARIO CITA" : "UBICACIÓN GPS"}
            </Text>
          </View>
        )}

        <Text
          style={[styles.preview, isGrid2x3 && styles.preview2x3, { color: colors.subtext }]}
          numberOfLines={maxPreviewLines}
        >
          {template.content}
        </Text>

        {!isGrid2x3 && (
          <View style={styles.footer}>
            <View style={styles.meta}>
              {template.lastUsedAt ? <Clock3 size={10} color={colors.subtext} /> : null}
              <Text style={[styles.metaText, { color: colors.subtext }]}>
                {template.lastUsedAt
                  ? `Usada ${template.useCount} ${template.useCount === 1 ? "vez" : "veces"}`
                  : template.isDefault === 1 ? "Incluida" : "Creada por ti"}
              </Text>
            </View>

            {template.isDefault !== 1 && (
              <View style={styles.actions}>
                <ScalePressable onPress={onEdit} accessibilityLabel="Editar plantilla" style={styles.smallAction}>
                  <Pencil size={12} color={colors.accent} />
                </ScalePressable>
                <ScalePressable onPress={onDelete} accessibilityLabel="Eliminar plantilla" style={styles.smallAction}>
                  <Trash2 size={12} color={colors.error} />
                </ScalePressable>
              </View>
            )}
          </View>
        )}
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  card: { position: "relative", minHeight: 180, overflow: "hidden", borderRadius: radius.lg, borderWidth: 1, marginRight: spacing.sm },
  cardGrid2x2: { minHeight: 110, marginRight: 0 },
  cardGrid2x3: { minHeight: 108, height: 112, marginRight: 0, borderRadius: radius.md },
  accent: { position: "absolute", left: 0, right: 0, top: 0, height: 3 },
  content: { flex: 1, padding: spacing.sm, paddingTop: spacing.md },
  content2x3: { padding: 7, paddingTop: 9 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  title: { flex: 1, fontFamily: fonts.displaySemiBold, fontSize: 14.5 },
  title2x3: { fontSize: 11.5, lineHeight: 14 },
  iconButton: { width: 26, height: 26, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  iconButton2x3: { width: 20, height: 20 },
  modalTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 4,
    marginBottom: 2
  },
  modalTagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 0.4
  },
  preview: { flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 5 },
  preview2x3: { fontSize: 10, lineHeight: 13.5, marginTop: 3 },
  footer: { minHeight: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  meta: { flexDirection: "row", alignItems: "center", gap: 2 },
  metaText: { fontFamily: fonts.body, fontSize: 9.5 },
  actions: { flexDirection: "row", alignItems: "center", gap: 3 },
  smallAction: { width: 24, height: 24, alignItems: "center", justifyContent: "center" }
});
