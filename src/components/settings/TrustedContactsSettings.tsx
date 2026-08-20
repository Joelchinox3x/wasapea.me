import { BookOpen, Plus, Trash2, UserCheck, UserPlus } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { CommunicationService } from "../../services/CommunicationService";
import type { TrustedContact } from "../../store/useAppStore";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";
import { SettingsSection } from "./SettingsSection";

interface TrustedContactsSettingsProps {
  colors: ThemeColors;
  trustedContacts: TrustedContact[];
  onSaveContacts: (contacts: TrustedContact[]) => void;
}

export function TrustedContactsSettings({
  colors,
  trustedContacts,
  onSaveContacts
}: TrustedContactsSettingsProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loadingContactPicker, setLoadingContactPicker] = useState(false);

  const openAddEdit = (index: number) => {
    const existing = trustedContacts[index];
    setEditingSlotIndex(index);
    setNameInput(existing?.name ?? "");
    setPhoneInput(existing?.phone ?? "");
    setModalVisible(true);
  };

  const handlePickFromDevice = async () => {
    setLoadingContactPicker(true);
    try {
      const res = await CommunicationService.selectDeviceContact();
      if (res.contact) {
        if (res.contact.name) setNameInput(res.contact.name);
        if (res.contact.phoneE164) setPhoneInput(res.contact.phoneE164);
      }
    } catch {
      // Ignorar errores de cancelación
    } finally {
      setLoadingContactPicker(false);
    }
  };

  const handleSave = () => {
    if (editingSlotIndex === null) return;
    const newContacts = [...trustedContacts];
    if (nameInput.trim() && phoneInput.trim()) {
      newContacts[editingSlotIndex] = {
        id: existingContact(editingSlotIndex)?.id ?? `tc-${Date.now()}`,
        name: nameInput.trim(),
        phone: phoneInput.trim()
      };
    }
    // Filter out empty items
    onSaveContacts(newContacts.filter((c) => c && c.name && c.phone));
    setModalVisible(false);
  };

  const handleDelete = (index: number) => {
    const newContacts = trustedContacts.filter((_, i) => i !== index);
    onSaveContacts(newContacts);
  };

  const existingContact = (index: number): TrustedContact | undefined => {
    return trustedContacts[index];
  };

  return (
    <SettingsSection title="CONTACTOS FRECUENTES (MÁX. 5)" colors={colors}>
      <View style={styles.headerBox}>
        <Text style={[styles.subtitleText, { color: colors.subtext }]}>
          Guarda 5 números clave para envío de ubicación o llamadas con 1 toque.
        </Text>
      </View>
      <View style={styles.listContainer}>
        {[0, 1, 2, 3, 4].map((index) => {
          const contact = existingContact(index);
          return (
            <View
              key={index}
              style={[
                styles.slotItem,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: contact ? colors.primary + "44" : colors.cardBorder
                }
              ]}
            >
              <View style={[styles.slotBadge, { backgroundColor: contact ? colors.primary + "22" : colors.badgeBg }]}>
                <Text style={[styles.slotIndex, { color: contact ? colors.primary : colors.subtext }]}>
                  #{index + 1}
                </Text>
              </View>

              {contact ? (
                <ScalePressable style={styles.slotContent} onPress={() => openAddEdit(index)}>
                  <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                    {contact.name}
                  </Text>
                  <Text style={[styles.contactPhone, { color: colors.subtext }]} numberOfLines={1}>
                    {contact.phone}
                  </Text>
                </ScalePressable>
              ) : (
                <ScalePressable style={styles.emptySlot} onPress={() => openAddEdit(index)}>
                  <UserPlus size={16} color={colors.subtext} />
                  <Text style={[styles.emptyText, { color: colors.subtext }]}>Agregar número frecuente</Text>
                </ScalePressable>
              )}

              {contact && (
                <ScalePressable style={styles.deleteBtn} onPress={() => handleDelete(index)}>
                  <Trash2 size={16} color={colors.error} />
                </ScalePressable>
              )}
            </View>
          );
        })}
      </View>

      {/* Edit/Add Contact Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingSlotIndex !== null && existingContact(editingSlotIndex) ? "Editar Contacto" : "Nuevo Contacto Frecuente"}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Nombre o Relación</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                placeholder="Ej. Mamá, Pareja, Trabajo..."
                placeholderTextColor={colors.subtext}
                value={nameInput}
                onChangeText={setNameInput}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Número de Celular</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                placeholder="Ej. +51 987654321"
                placeholderTextColor={colors.subtext}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
              />
            </View>

            <ScalePressable
              style={[styles.pickBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "33" }]}
              onPress={() => void handlePickFromDevice()}
              disabled={loadingContactPicker}
            >
              {loadingContactPicker ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <BookOpen size={16} color={colors.primary} />
                  <Text style={[styles.pickBtnText, { color: colors.primary }]}>Elegir de mi agenda del teléfono</Text>
                </>
              )}
            </ScalePressable>

            <View style={styles.modalButtons}>
              <ScalePressable
                style={[styles.modalBtn, { backgroundColor: colors.inputBg }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.subtext }]}>Cancelar</Text>
              </ScalePressable>
              <ScalePressable
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.modalBtnText, { color: "#FFFFFF", fontWeight: "700" }]}>Guardar</Text>
              </ScalePressable>
            </View>
          </View>
        </View>
      </Modal>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 2
  },
  subtitleText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17
  },
  listContainer: {
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  slotItem: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  slotBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  slotIndex: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11
  },
  slotContent: {
    flex: 1,
    justifyContent: "center"
  },
  contactName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13
  },
  contactPhone: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 1
  },
  emptySlot: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 12
  },
  deleteBtn: {
    padding: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  modalCard: {
    width: "100%",
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    marginBottom: spacing.md
  },
  fieldGroup: {
    marginBottom: spacing.sm
  },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginBottom: 4
  },
  input: {
    height: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14
  },
  pickBtn: {
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 4
  },
  pickBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
    marginTop: spacing.md
  },
  modalBtn: {
    minWidth: 84,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  modalBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13
  }
});
