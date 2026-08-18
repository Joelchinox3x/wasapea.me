import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Building,
  Copy,
  Edit,
  FileText,
  MessageCircle,
  MessageSquare,
  Phone,
  QrCode,
  Share2,
  Star,
  Trash2,
  UserCheck
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { QrCodeModal } from "../../components/QrCodeModal";
import { ReminderModal } from "../../components/ReminderModal";
import { CategoryItemData, CategoryRepository } from "../../repositories/CategoryRepository";
import { ContactRepository, InternalContact } from "../../repositories/ContactRepository";
import { ContactReminder, ReminderRepository } from "../../repositories/ReminderRepository";
import { CommunicationService } from "../../services/CommunicationService";
import { useAppStore } from "../../store/useAppStore";
import { darkColors, lightColors } from "../../theme/colors";

export default function ContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const { themeMode, showNotice, showToast } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  const [contact, setContact] = useState<InternalContact | null>(null);
  const [category, setCategory] = useState<CategoryItemData | null>(null);
  const [remindersList, setRemindersList] = useState<ContactReminder[]>([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    const cnt = await ContactRepository.getById(id);
    if (!cnt) return;
    setContact(cnt);

    if (cnt.categoryId) {
      const cat = await CategoryRepository.getById(cnt.categoryId);
      setCategory(cat);
    }

    const rems = await ReminderRepository.getForContact(cnt.id);
    setRemindersList(rems);
  }, [id]);

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      if (!id) return;
      const cnt = await ContactRepository.getById(id);
      if (!active || !cnt) return;
      setContact(cnt);

      if (cnt.categoryId) {
        const cat = await CategoryRepository.getById(cnt.categoryId);
        if (active) setCategory(cat);
      }

      const rems = await ReminderRepository.getForContact(cnt.id);
      if (active) setRemindersList(rems);
    };

    fetchAll();
    return () => {
      active = false;
    };
  }, [id]);

  if (!contact) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Cargando contacto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initial = contact.name.trim().charAt(0).toUpperCase() || "👤";
  const catColor = category?.color || colors.primary;

  const handleDelete = async () => {
    await ContactRepository.delete(contact.id);
    setConfirmDeleteVisible(false);
    router.back();
  };

  const handleExportToPhone = async () => {
    const res = await CommunicationService.saveToDeviceContacts({
      name: contact.name,
      phoneE164: contact.phoneE164,
      company: contact.company || undefined,
      note: contact.note || undefined
    });

    if (res.success) {
      showNotice({
        title: "Contacto guardado",
        message: res.message || "El contacto se guardó en tu teléfono.",
        tone: "success"
      });
    } else {
      showNotice({
        title: "No se pudo guardar",
        message: res.error || "No se pudo guardar el contacto en el teléfono.",
        tone: "error"
      });
    }
  };

  const handleCopyNumber = async () => {
    const result = await CommunicationService.copyToClipboard(contact.phoneE164);
    showToast({
      message: result.message || result.error || "No se pudo copiar el número.",
      tone: result.success ? "success" : "error"
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.text }]}>Detalle del Contacto</Text>

        <TouchableOpacity
          onPress={async () => {
            await ContactRepository.toggleFavorite(contact.id);
            loadData();
          }}
          style={styles.favBtn}
        >
          <Star
            size={22}
            color={contact.favorite === 1 ? colors.favorite : colors.subtext}
            fill={contact.favorite === 1 ? colors.favorite : "none"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: catColor + "20", borderColor: catColor }]}>
            <Text style={[styles.avatarText, { color: catColor }]}>{initial}</Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
          <Text style={[styles.phone, { color: colors.subtext }]}>{contact.phoneFormatted}</Text>

          {category && (
            <View style={[styles.catBadge, { backgroundColor: catColor + "20" }]}>
              <Text style={[styles.catText, { color: catColor }]}>{category.name}</Text>
            </View>
          )}

          {contact.company && (
            <View style={styles.companyRow}>
              <Building size={16} color={colors.subtext} />
              <Text style={[styles.companyText, { color: colors.subtext }]}>{contact.company}</Text>
            </View>
          )}

          {/* Primary Action Buttons */}
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actBtn, { backgroundColor: colors.primary }]}
              onPress={() => CommunicationService.openWhatsApp(contact.phoneE164)}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.actBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actBtn, { backgroundColor: colors.call }]}
              onPress={() => CommunicationService.makeCall(contact.phoneE164)}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.actBtnText}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actBtn, { backgroundColor: colors.sms }]}
              onPress={() => CommunicationService.sendSms(contact.phoneE164)}
            >
              <MessageSquare size={20} color="#FFFFFF" />
              <Text style={styles.actBtnText}>SMS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Section */}
        {contact.note ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notas</Text>
            </View>
            <Text style={[styles.noteText, { color: colors.text }]}>{contact.note}</Text>
          </View>
        ) : null}

        {/* Reminders Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <Bell size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recordatorios</Text>
            <TouchableOpacity
              style={[styles.smallAddBtn, { backgroundColor: colors.inputBg }]}
              onPress={() => setReminderModalVisible(true)}
            >
              <Text style={[styles.smallAddText, { color: colors.primary }]}>+ Añadir</Text>
            </TouchableOpacity>
          </View>

          {remindersList.length === 0 ? (
            <Text style={[styles.emptyRem, { color: colors.subtext }]}>No hay recordatorios pendientes.</Text>
          ) : (
            remindersList.map((rem) => (
              <View key={rem.id} style={[styles.remRow, { borderColor: colors.cardBorder }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.remTitle, { color: colors.text }]}>{rem.title}</Text>
                  {rem.description ? (
                    <Text style={[styles.remDesc, { color: colors.subtext }]}>{rem.description}</Text>
                  ) : null}
                  <Text style={[styles.remDate, { color: colors.primary }]}>
                    ⏰ {new Date(rem.scheduledAt).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    await ReminderRepository.delete(rem.id);
                    loadData();
                  }}
                >
                  <Trash2 size={16} color={colors.subtext} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Options List */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[styles.optRow, { borderBottomColor: colors.cardBorder }]}
            onPress={() => setQrVisible(true)}
          >
            <QrCode size={18} color={colors.text} />
            <Text style={[styles.optText, { color: colors.text }]}>Mostrar QR de WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optRow, { borderBottomColor: colors.cardBorder }]}
            onPress={() => void handleCopyNumber()}
          >
            <Copy size={18} color={colors.text} />
            <Text style={[styles.optText, { color: colors.text }]}>Copiar número</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optRow, { borderBottomColor: colors.cardBorder }]}
            onPress={async () => {
              const result = await CommunicationService.shareNumber(
                contact.phoneE164,
                contact.phoneFormatted,
                contact.name
              );
              if (!result.success && result.error) {
                showNotice({ title: "No se pudo compartir", message: result.error, tone: "error" });
              }
            }}
          >
            <Share2 size={18} color={colors.text} />
            <Text style={[styles.optText, { color: colors.text }]}>Compartir contacto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optRow, { borderBottomColor: colors.cardBorder }]} onPress={handleExportToPhone}>
            <UserCheck size={18} color={colors.accent} />
            <Text style={[styles.optText, { color: colors.accent, fontWeight: "700" }]}>
              Guardar en contactos del teléfono
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optRow, { borderBottomColor: colors.cardBorder }]}
            onPress={() => router.push(`/agenda/edit/${contact.id}`)}
          >
            <Edit size={18} color={colors.text} />
            <Text style={[styles.optText, { color: colors.text }]}>Editar contacto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optRow} onPress={() => setConfirmDeleteVisible(true)}>
            <Trash2 size={18} color={colors.error} />
            <Text style={[styles.optText, { color: colors.error, fontWeight: "700" }]}>Eliminar de la agenda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation */}
      <ConfirmationModal
        visible={confirmDeleteVisible}
        title="¿Eliminar contacto?"
        message={`¿Estás seguro de eliminar a ${contact.name} de tu agenda interna?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
        isDark={isDark}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        e164={contact.phoneE164}
        formattedNumber={contact.phoneFormatted}
        isDark={isDark}
      />

      {/* Reminder Creator Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        contactName={contact.name}
        phoneE164={contact.phoneE164}
        onSave={async (rem) => {
          await ReminderRepository.create({
            contactId: contact.id,
            phoneE164: contact.phoneE164,
            title: rem.title,
            description: rem.description,
            scheduledAt: rem.scheduledAt.toISOString(),
            notificationId: rem.notificationId || undefined
          });
          loadData();
        }}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 54
  },
  backBtn: {
    padding: 6
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "700"
  },
  favBtn: {
    padding: 6
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800"
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center"
  },
  phone: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 4
  },
  catBadge: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8
  },
  catText: {
    fontSize: 12,
    fontWeight: "700"
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10
  },
  companyText: {
    fontSize: 13,
    fontWeight: "500"
  },
  actionGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18
  },
  actBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  actBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700"
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20
  },
  smallAddBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  smallAddText: {
    fontSize: 12,
    fontWeight: "700"
  },
  emptyRem: {
    fontSize: 13
  },
  remRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  remTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  remDesc: {
    fontSize: 12,
    marginTop: 2
  },
  remDate: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2
  },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  optText: {
    fontSize: 15,
    fontWeight: "500"
  }
});
