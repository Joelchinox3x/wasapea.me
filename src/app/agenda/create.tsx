import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContactForm, ContactFormHeader } from "../../components/agenda/ContactForm";
import { APP_NAME } from "../../constants/app";
import { useContactForm } from "../../hooks/useContactForm";
import { ContactRepository } from "../../repositories/ContactRepository";
import { useAppStore } from "../../store/useAppStore";
import { darkColors, lightColors } from "../../theme/colors";

export default function CreateContactScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phoneE164?: string;
    phoneFormatted?: string;
    countryIso?: string;
    name?: string;
    company?: string;
  }>();
  const colorScheme = useColorScheme();
  const { themeMode, selectedCountry, showNotice } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;
  const [saving, setSaving] = useState(false);
  const form = useContactForm({
    name: params.name,
    phone: params.phoneFormatted || params.phoneE164,
    country: params.countryIso ? undefined : selectedCountry,
    countryIso: params.countryIso,
    company: params.company
  });

  const save = async () => {
    if (!form.values.name.trim() || !form.parsedPhone.isValid) return;
    setSaving(true);
    try {
      const created = await ContactRepository.create({
        name: form.values.name.trim(),
        phoneE164: form.parsedPhone.e164,
        phoneFormatted: form.parsedPhone.formattedInternational,
        countryCode: form.parsedPhone.countryCode,
        countryIso: form.parsedPhone.countryIso,
        company: form.values.company.trim() || undefined,
        note: form.values.note.trim() || undefined,
        categoryId: form.values.categoryId || undefined,
        favorite: form.values.favorite
      });
      router.replace(`/agenda/${created.id}`);
    } catch (error) {
      showNotice({
        title: "No se pudo guardar",
        message: error instanceof Error ? error.message : "Ocurrió un error al guardar el contacto.",
        tone: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ContactFormHeader
        title="Nuevo contacto"
        subtitle={`Agenda de ${APP_NAME}`}
        colors={colors}
        onBack={() => router.back()}
      />
      <ContactForm
        controller={form}
        colors={colors}
        isDark={isDark}
        submitLabel={`Guardar en ${APP_NAME}`}
        submittingLabel="Guardando..."
        saving={saving}
        onSubmit={() => void save()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  }
});
