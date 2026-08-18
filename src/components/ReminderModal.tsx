import { Bell, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NotificationService } from "../services/NotificationService";
import { darkColors, lightColors } from "../theme/colors";

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (params: { title: string; description: string; scheduledAt: Date; notificationId: string | null }) => void;
  contactName?: string;
  phoneE164: string;
  isDark?: boolean;
}

export function ReminderModal({
  visible,
  onClose,
  onSave,
  contactName,
  phoneE164,
  isDark = false
}: ReminderModalProps) {
  const colors = isDark ? darkColors : lightColors;

  const [title, setTitle] = useState(contactName ? `Llamar a ${contactName}` : "Recordatorio de contacto");
  const [description, setDescription] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(15); // Default 15 mins
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      const notificationId = await NotificationService.scheduleReminder({
        title: title.trim(),
        body: description.trim() || `Recordatorio para ${contactName || phoneE164}`,
        scheduledAt,
        phoneE164
      });

      onSave({
        title: title.trim(),
        description: description.trim(),
        scheduledAt,
        notificationId
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Bell size={20} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Crear Recordatorio</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <Text style={[styles.label, { color: colors.text }]}>Título</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.cardBorder }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej. Enviar cotización por WhatsApp"
            placeholderTextColor={colors.subtext}
          />

          <Text style={[styles.label, { color: colors.text }]}>Nota / Detalle (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.cardBorder }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Escribe notas adicionales..."
            placeholderTextColor={colors.subtext}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { color: colors.text }]}>Notificar en:</Text>
          <View style={styles.timeOptions}>
            {[
              { label: "15 min", value: 15 },
              { label: "1 hora", value: 60 },
              { label: "3 horas", value: 180 },
              { label: "Mañana (24h)", value: 1440 }
            ].map((opt) => {
              const isSelected = delayMinutes === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setDelayMinutes(opt.value)}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.inputBg,
                      borderColor: isSelected ? colors.primary : colors.cardBorder
                    }
                  ]}
                >
                  <Text style={[styles.timeChipText, { color: isSelected ? "#FFFFFF" : colors.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving || !title.trim()}
          >
            <Text style={styles.saveBtnText}>Guardar Recordatorio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end"
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
    paddingTop: 10
  },
  timeOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 16
  },
  timeChip: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: "600"
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700"
  }
});
