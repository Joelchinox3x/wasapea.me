import { ArrowLeft, CheckCircle2, ChevronDown, ShieldAlert, Star } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { ContactFormController } from "../../hooks/useContactForm";
import type { ThemeColors } from "../../theme/colors";
import { emeraldGlow, fonts, radius, spacing } from "../../theme/designSystem";
import { CountrySelectorModal } from "../CountrySelectorModal";

interface ContactFormProps {
  controller: ContactFormController;
  colors: ThemeColors;
  isDark: boolean;
  submitLabel: string;
  submittingLabel: string;
  saving: boolean;
  phoneReadOnly?: boolean;
  onSubmit: () => void;
}

interface ContactFormHeaderProps {
  title: string;
  subtitle: string;
  colors: ThemeColors;
  onBack: () => void;
}

export function ContactFormHeader({ title, subtitle, colors, onBack }: ContactFormHeaderProps) {
  return (
    <View style={[styles.navbar, { backgroundColor: colors.glass, borderBottomColor: colors.glassBorder }]}>
      <TouchableOpacity
        onPress={onBack}
        style={[styles.backButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
        accessibilityLabel="Volver"
      >
        <ArrowLeft size={20} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.navCopy}>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.navSubtitle, { color: colors.subtext }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.navBalance} />
    </View>
  );
}

export function ContactForm({
  controller,
  colors,
  isDark,
  submitLabel,
  submittingLabel,
  saving,
  phoneReadOnly = false,
  onSubmit
}: ContactFormProps) {
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const { values, setters, categories, categoriesError, parsedPhone, canSubmit } = controller;

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormLabel colors={colors}>Nombre del contacto *</FormLabel>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.cardBorder }]}
          placeholder="Ej. Juan Pérez - Constructora"
          placeholderTextColor={colors.subtext}
          value={values.name}
          onChangeText={setters.setName}
          maxFontSizeMultiplier={1.15}
        />

        <FormLabel colors={colors}>Teléfono y país *</FormLabel>
        {phoneReadOnly ? (
          <View style={[styles.readOnly, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.readOnlyText, { color: colors.subtext }]}>
              {parsedPhone.formattedInternational || values.phoneInput} ({parsedPhone.e164 || values.phoneInput})
            </Text>
          </View>
        ) : (
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={[styles.countryButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              onPress={() => setCountryModalVisible(true)}
              accessibilityLabel={`País: ${values.country.name} (${values.country.code})`}
            >
              <Text style={styles.flag}>{values.country.flag}</Text>
              <Text style={[styles.countryCode, { color: colors.text }]}>{values.country.code}</Text>
              <ChevronDown size={16} color={colors.subtext} />
            </TouchableOpacity>
            <TextInput
              style={[styles.phoneInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.cardBorder }]}
              placeholder="Ej. 976 898 196"
              placeholderTextColor={colors.subtext}
              value={values.phoneInput}
              onChangeText={setters.setPhoneInput}
              keyboardType="phone-pad"
              maxFontSizeMultiplier={1.15}
            />
          </View>
        )}

        {!phoneReadOnly && values.phoneInput.length > 0 && (
          <View style={styles.validationSpace}>
            {parsedPhone.isValid ? (
              <View style={[styles.validationBadge, { backgroundColor: colors.primaryLight + "30" }]}>
                <CheckCircle2 size={15} color={colors.primary} />
                <Text style={[styles.validationText, { color: colors.primary }]}>
                  Válido: {parsedPhone.formattedInternational}
                </Text>
              </View>
            ) : (
              <View style={[styles.validationBadge, { backgroundColor: colors.error + "15" }]}>
                <ShieldAlert size={15} color={colors.error} />
                <Text style={[styles.validationText, { color: colors.error }]}>Número no reconocido</Text>
              </View>
            )}
          </View>
        )}

        <FormLabel colors={colors}>Categoría</FormLabel>
        {categoriesError ? (
          <Text style={[styles.categoryError, { color: colors.error }]}>{categoriesError}</Text>
        ) : (
          <View style={styles.categoryRow}>
            {categories.map((category) => {
              const selected = values.categoryId === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setters.setCategoryId(category.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected ? category.color : colors.inputBg,
                      borderColor: selected ? category.color : colors.cardBorder
                    }
                  ]}
                >
                  <Text style={[styles.categoryText, { color: selected ? "#FFFFFF" : colors.text }]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <FormLabel colors={colors}>Empresa u organización (opcional)</FormLabel>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.cardBorder }]}
          placeholder="Ej. Excavadoras y Repuestos S.A."
          placeholderTextColor={colors.subtext}
          value={values.company}
          onChangeText={setters.setCompany}
        />

        <FormLabel colors={colors}>Notas rápidas (opcional)</FormLabel>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.cardBorder }]}
          placeholder="Información útil para el siguiente contacto."
          placeholderTextColor={colors.subtext}
          value={values.note}
          onChangeText={setters.setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.favoriteRow, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
          onPress={() => setters.setFavorite(!values.favorite)}
        >
          <Star
            size={20}
            color={values.favorite ? colors.favorite : colors.subtext}
            fill={values.favorite ? colors.favorite : "none"}
          />
          <Text style={[styles.favoriteText, { color: colors.text }]}>Marcar como favorito</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            emeraldGlow,
            (saving || !canSubmit) && styles.disabled
          ]}
          onPress={onSubmit}
          disabled={saving || !canSubmit}
        >
          <Text style={styles.submitText}>{saving ? submittingLabel : submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>

      <CountrySelectorModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelectCountry={setters.setCountry}
        selectedIso={values.country.iso}
        isDark={isDark}
      />
    </>
  );
}

function FormLabel({ colors, children }: { colors: ThemeColors; children: React.ReactNode }) {
  return <Text style={[styles.label, { color: colors.text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    minHeight: 68,
    borderBottomWidth: 1
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  navCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: spacing.xs
  },
  navTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17
  },
  navSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 1
  },
  navBalance: {
    width: 40,
    height: 40
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 40
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12
  },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 15
  },
  textArea: {
    height: 80,
    paddingTop: 10
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12
  },
  flag: {
    fontSize: 20
  },
  countryCode: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 15
  },
  readOnly: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  readOnlyText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  validationSpace: {
    marginBottom: 12
  },
  validationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 6
  },
  validationText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1
  },
  categoryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13
  },
  categoryError: {
    fontFamily: fonts.body,
    fontSize: 12
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginTop: 18,
    marginBottom: 20
  },
  favoriteText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  submitButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  submitText: {
    color: "#FFFFFF",
    fontFamily: fonts.displaySemiBold,
    fontSize: 16
  },
  disabled: {
    opacity: 0.45
  }
});
