import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContactForm, ContactFormHeader } from "../../../components/agenda/ContactForm";
import { APP_NAME } from "../../../constants/app";
import type { InternalContact } from "../../../domain/models";
import { useContactForm } from "../../../hooks/useContactForm";
import { ContactRepository } from "../../../repositories/ContactRepository";
import { useAppStore } from "../../../store/useAppStore";
import { darkColors, lightColors } from "../../../theme/colors";

export default function EditContactScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const { themeMode, showNotice } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;
  const [contact, setContact] = useState<InternalContact | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void ContactRepository.getById(id)
      .then((item) => {
        if (!active) return;
        if (!item) setLoadingError("El contacto ya no existe.");
        else setContact(item);
      })
      .catch((error: unknown) => {
        if (active) setLoadingError(error instanceof Error ? error.message : "No se pudo cargar el contacto.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loadingError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ContactFormHeader title="Editar contacto" subtitle={APP_NAME} colors={colors} onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{loadingError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!contact) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <EditContactForm
      contact={contact}
      isDark={isDark}
      colors={colors}
      onBack={() => router.back()}
      onSaved={() => router.back()}
      showNotice={showNotice}
    />
  );
}

interface EditContactFormProps {
  contact: InternalContact;
  isDark: boolean;
  colors: typeof darkColors;
  onBack: () => void;
  onSaved: () => void;
  showNotice: ReturnType<typeof useAppStore.getState>["showNotice"];
}

function EditContactForm({ contact, isDark, colors, onBack, onSaved, showNotice }: EditContactFormProps) {
  const [saving, setSaving] = useState(false);
  const form = useContactForm({
    name: contact.name,
    phone: contact.phoneFormatted || contact.phoneE164,
    countryIso: contact.countryIso,
    company: contact.company || "",
    note: contact.note || "",
    favorite: contact.favorite === 1,
    categoryId: contact.categoryId
  });

  const save = async () => {
    if (!form.values.name.trim()) return;
    setSaving(true);
    try {
      await ContactRepository.update(contact.id, {
        name: form.values.name.trim(),
        company: form.values.company.trim(),
        note: form.values.note.trim(),
        categoryId: form.values.categoryId || "",
        favorite: form.values.favorite
      });
      onSaved();
    } catch (error) {
      showNotice({
        title: "No se pudo actualizar",
        message: error instanceof Error ? error.message : "No se pudo actualizar el contacto.",
        tone: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ContactFormHeader title="Editar contacto" subtitle={APP_NAME} colors={colors} onBack={onBack} />
      <ContactForm
        controller={form}
        colors={colors}
        isDark={isDark}
        submitLabel="Guardar cambios"
        submittingLabel="Guardando..."
        saving={saving}
        phoneReadOnly
        onSubmit={() => void save()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
