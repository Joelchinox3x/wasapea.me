import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetMethods
} from "@expo/ui/community/bottom-sheet";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Search,
  Send,
  Stethoscope,
  UserRound,
  X
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import type { InternalContact, MessageTemplateItem } from "../../domain/models";
import { ContactRepository } from "../../repositories/ContactRepository";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { buildAppointmentTemplateMessage } from "../../utils/appointmentTemplate";
import { WhatsAppGlyphIcon } from "../icons/AppSvgIcons";
import { AppointmentLocationField } from "./AppointmentLocationField";

export interface AppointmentRecipient {
  contact: InternalContact | null;
  phoneE164: string;
  phoneFormatted: string;
  name: string;
}

export interface PreparedAppointment {
  scheduledAt: string;
  dateLabel: string;
  time: string;
  address: string;
  service: string;
  professional: string;
}

interface AppointmentTemplateModalProps {
  visible: boolean;
  template: MessageTemplateItem;
  colors: ThemeColors;
  initialPhoneE164?: string;
  initialPhoneFormatted?: string;
  onClose: () => void;
  onSend: (
    message: string,
    template: MessageTemplateItem,
    recipient: AppointmentRecipient,
    appointment: PreparedAppointment
  ) => boolean | Promise<boolean>;
}

const TIME_OPTIONS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function dateKey(offsetDays: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatFullDate(value: string): string {
  const date = dateFromKey(value);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

function formatDay(value: string): { weekday: string; day: string; month: string } {
  const date = dateFromKey(value);
  return {
    weekday: WEEKDAYS[date.getDay()].slice(0, 3),
    day: String(date.getDate()),
    month: MONTHS[date.getMonth()].slice(0, 3)
  };
}

function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "p. m." : "a. m.";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function buildScheduledAt(selectedDate: string, selectedTime: string): string {
  const [hours, minutes] = selectedTime.split(":").map(Number);
  if (!/^\d{2}:\d{2}$/.test(selectedTime) || hours > 23 || minutes > 59) {
    throw new Error("Escribe una hora válida en formato HH:MM.");
  }
  const date = dateFromKey(selectedDate);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function AppointmentTemplateModal({
  visible,
  template,
  colors,
  initialPhoneE164 = "",
  initialPhoneFormatted = "",
  onClose,
  onSend
}: AppointmentTemplateModalProps) {
  const { height } = useWindowDimensions();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [contacts, setContacts] = useState<InternalContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => dateKey(1));
  const [time, setTime] = useState("09:00");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("");
  const [professional, setProfessional] = useState("");
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableDates = useMemo(() => Array.from({ length: 30 }, (_, index) => dateKey(index)), []);
  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? null,
    [contacts, selectedContactId]
  );
  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...contacts]
      .filter((contact) =>
        !term ||
        contact.name.toLowerCase().includes(term) ||
        contact.phoneE164.includes(term) ||
        contact.phoneFormatted.includes(term)
      )
      .sort((a, b) => b.favorite - a.favorite || b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 6);
  }, [contacts, search]);

  useEffect(() => {
    if (!visible) return;
    void ContactRepository.getAll()
      .then((rows) => {
        setContacts(rows);
        const currentContact = rows.find((contact) => contact.phoneE164 === initialPhoneE164);
        if (currentContact) {
          setSelectedContactId(currentContact.id);
          setName(currentContact.name);
        }
      })
      .catch(() => setContacts([]));
  }, [initialPhoneE164, visible]);

  const closeSheet = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.close();
      return;
    }
    onClose();
  }, [onClose]);

  const selectContact = (contact: InternalContact) => {
    setSelectedContactId(contact.id);
    setName(contact.name);
    setSearch("");
    setError("");
  };

  const getRecipient = (): AppointmentRecipient => {
    const phoneE164 = selectedContact?.phoneE164 || initialPhoneE164;
    const phoneFormatted = selectedContact?.phoneFormatted || initialPhoneFormatted || phoneE164;
    if (!phoneE164) throw new Error("Busca y selecciona el cliente de esta cita.");
    if (!name.trim()) throw new Error("Escribe el nombre del cliente.");
    return { contact: selectedContact, phoneE164, phoneFormatted, name: name.trim() };
  };

  const preparePreview = () => {
    try {
      setError("");
      const recipient = getRecipient();
      const dateLabel = formatFullDate(selectedDate);
      buildScheduledAt(selectedDate, time);
      const message = buildAppointmentTemplateMessage(template, {
        name: recipient.name,
        date: dateLabel,
        time: formatTime(time),
        address,
        service,
        professional
      });
      setPreviewMessage(message);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "No se pudo preparar la cita.");
    }
  };

  const sendAppointment = async () => {
    if (!previewMessage || submitting) return;
    try {
      setError("");
      const recipient = getRecipient();
      const appointment: PreparedAppointment = {
        scheduledAt: buildScheduledAt(selectedDate, time),
        dateLabel: formatFullDate(selectedDate),
        time: formatTime(time),
        address: address.trim(),
        service: service.trim(),
        professional: professional.trim()
      };
      setSubmitting(true);
      const sent = await onSend(previewMessage, template, recipient, appointment);
      if (sent) closeSheet();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "No se pudo enviar la cita.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      enableDynamicSizing
      enablePanDownToClose={!submitting}
      onClose={onClose}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
    >
      <BottomSheetView style={styles.sheet}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + "1F" }]}>
            <CalendarDays size={23} color={colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.text }]}>Preparar cita</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>Una cita personal para un solo cliente.</Text>
          </View>
          <Pressable
            onPress={closeSheet}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Cerrar formulario"
            style={[styles.closeButton, { backgroundColor: colors.badgeBg }]}
          >
            <X size={19} color={colors.subtext} />
          </Pressable>
        </View>

        <ScrollView
          style={{ maxHeight: Math.max(360, height * 0.74) }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {previewMessage ? (
            <View>
              <View style={[styles.recipientSummary, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "55" }]}> 
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
                  <Text style={styles.avatarText}>{name.trim().charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.recipientCopy}>
                  <Text style={[styles.recipientName, { color: colors.text }]}>{name.trim()}</Text>
                  <Text style={[styles.recipientPhone, { color: colors.subtext }]}>{selectedContact?.phoneFormatted || initialPhoneFormatted || initialPhoneE164}</Text>
                </View>
                <Check size={20} color={colors.primary} />
              </View>

              <View style={[styles.previewCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}> 
                <Text style={[styles.previewLabel, { color: colors.primary }]}>VISTA PREVIA</Text>
                <Text style={[styles.previewText, { color: colors.text }]}>{previewMessage}</Text>
              </View>

              {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

              <View style={styles.previewActions}>
                <Pressable
                  onPress={() => setPreviewMessage(null)}
                  disabled={submitting}
                  style={[styles.editButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                >
                  <ArrowLeft size={18} color={colors.subtext} />
                  <Text style={[styles.editText, { color: colors.text }]}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => void sendAppointment()}
                  disabled={submitting}
                  style={[styles.sendButton, { backgroundColor: colors.primary }, submitting && styles.disabled]}
                >
                  {submitting ? <ActivityIndicator color="#FFFFFF" /> : <WhatsAppGlyphIcon size={21} color="#FFFFFF" />}
                  <Text style={styles.sendText}>Enviar cita</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.subtext }]}>1 · CLIENTE</Text>
              <View style={[styles.searchShell, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}> 
                <Search size={18} color={colors.primary} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar por nombre o número..."
                  placeholderTextColor={colors.subtext}
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {search ? <Pressable onPress={() => setSearch("")}><X size={17} color={colors.subtext} /></Pressable> : null}
              </View>

              {selectedContact ? (
                <View style={[styles.selectedContact, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "66" }]}> 
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
                    <Text style={styles.avatarText}>{selectedContact.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.recipientCopy}>
                    <Text style={[styles.recipientName, { color: colors.text }]}>{selectedContact.name}</Text>
                    <Text style={[styles.recipientPhone, { color: colors.subtext }]}>{selectedContact.phoneFormatted}</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      setSelectedContactId(null);
                      setName("");
                      setSearch("");
                      setError("");
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Quitar cliente seleccionado"
                    hitSlop={8}
                    style={[styles.removeContact, { backgroundColor: colors.badgeBg }]}
                  >
                    <X size={17} color={colors.subtext} />
                  </Pressable>
                </View>
              ) : initialPhoneE164 ? (
                <View style={[styles.currentNumber, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}> 
                  <UserRound size={19} color={colors.primary} />
                  <View style={styles.recipientCopy}>
                    <Text style={[styles.currentNumberTitle, { color: colors.text }]}>Número actual de Home</Text>
                    <Text style={[styles.recipientPhone, { color: colors.subtext }]}>{initialPhoneFormatted || initialPhoneE164}</Text>
                  </View>
                </View>
              ) : null}

              {(search.trim() || !selectedContact) && filteredContacts.length > 0 ? (
                <View style={[styles.results, { borderColor: colors.cardBorder }]}> 
                  {filteredContacts.map((contact) => (
                    <Pressable
                      key={contact.id}
                      onPress={() => selectContact(contact)}
                      style={[styles.resultRow, { borderBottomColor: colors.cardBorder }]}
                    >
                      <View style={[styles.resultAvatar, { backgroundColor: colors.badgeBg }]}> 
                        <Text style={[styles.resultInitial, { color: colors.text }]}>{contact.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.recipientCopy}>
                        <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>{contact.name}</Text>
                        <Text style={[styles.recipientPhone, { color: colors.subtext }]}>{contact.phoneFormatted}</Text>
                      </View>
                      {contact.favorite === 1 ? <Text style={{ color: colors.favorite }}>★</Text> : null}
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {!selectedContact ? (
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.subtext }]}>NOMBRE DEL CLIENTE</Text>
                  <View style={[styles.inputShell, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}> 
                    <UserRound size={18} color={colors.primary} />
                    <TextInput value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor={colors.subtext} style={[styles.input, { color: colors.text }]} />
                  </View>
                </View>
              ) : null}

              <Text style={[styles.sectionLabel, styles.sectionSpacing, { color: colors.subtext }]}>2 · FECHA Y HORA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
                {availableDates.map((value) => {
                  const item = formatDay(value);
                  const selected = selectedDate === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setSelectedDate(value)}
                      style={[
                        styles.dateCard,
                        {
                          backgroundColor: selected ? colors.primary : colors.inputBg,
                          borderColor: selected ? colors.primary : colors.cardBorder
                        }
                      ]}
                    >
                      <Text style={[styles.dateWeekday, { color: selected ? "#FFFFFF" : colors.subtext }]}>{item.weekday}</Text>
                      <Text style={[styles.dateDay, { color: selected ? "#FFFFFF" : colors.text }]}>{item.day}</Text>
                      <Text style={[styles.dateMonth, { color: selected ? "#FFFFFF" : colors.subtext }]}>{item.month}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
                {TIME_OPTIONS.map((value) => {
                  const selected = time === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setTime(value)}
                      style={[
                        styles.timeChip,
                        {
                          backgroundColor: selected ? colors.accent : colors.inputBg,
                          borderColor: selected ? colors.accent : colors.cardBorder
                        }
                      ]}
                    >
                      <Clock3 size={14} color={selected ? "#FFFFFF" : colors.accent} />
                      <Text style={[styles.timeText, { color: selected ? "#FFFFFF" : colors.text }]}>{formatTime(value)}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={[styles.customTime, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}> 
                <Text style={[styles.customTimeLabel, { color: colors.subtext }]}>Otra hora</Text>
                <TextInput value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor={colors.subtext} keyboardType="numbers-and-punctuation" maxLength={5} style={[styles.customTimeInput, { color: colors.text }]} />
              </View>

              <Text style={[styles.sectionLabel, styles.sectionSpacing, { color: colors.subtext }]}>3 · DETALLES</Text>
              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.subtext }]}>SERVICIO</Text>
                  <View style={[styles.inputShell, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}> 
                    <Stethoscope size={18} color={colors.primary} />
                    <TextInput value={service} onChangeText={setService} placeholder="Ej. Consulta, corte, instalación..." placeholderTextColor={colors.subtext} style={[styles.input, { color: colors.text }]} />
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.subtext }]}>PROFESIONAL · OPCIONAL</Text>
                  <View style={[styles.inputShell, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}> 
                    <UserRound size={18} color={colors.accent} />
                    <TextInput value={professional} onChangeText={setProfessional} placeholder="Ej. Dra. López" placeholderTextColor={colors.subtext} style={[styles.input, { color: colors.text }]} />
                  </View>
                </View>
                <AppointmentLocationField colors={colors} value={address} onChange={setAddress} />
              </View>

              {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

              <Pressable onPress={preparePreview} style={[styles.reviewButton, { backgroundColor: colors.primary }]}> 
                <Send size={19} color="#FFFFFF" />
                <Text style={styles.reviewText}>Revisar cita</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  headerIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.displayBold, fontSize: 21 },
  subtitle: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, marginTop: 1 },
  closeButton: { width: 38, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: spacing.sm },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.8, marginBottom: 7 },
  sectionSpacing: { marginTop: spacing.md },
  searchShell: { minHeight: 47, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 10, fontFamily: fonts.body, fontSize: 13.5 },
  selectedContact: { minHeight: 58, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  currentNumber: { minHeight: 54, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  currentNumberTitle: { fontFamily: fonts.bodySemiBold, fontSize: 12.5 },
  avatar: { width: 38, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontFamily: fonts.displayBold, fontSize: 16 },
  recipientCopy: { flex: 1, minWidth: 0 },
  recipientName: { fontFamily: fonts.displaySemiBold, fontSize: 14.5 },
  recipientPhone: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 1 },
  removeContact: { width: 34, height: 34, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  results: { borderWidth: 1, borderRadius: radius.md, overflow: "hidden", marginTop: spacing.xs },
  resultRow: { minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  resultAvatar: { width: 32, height: 32, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  resultInitial: { fontFamily: fonts.displayBold, fontSize: 13 },
  resultName: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  dateRow: { gap: 7, paddingRight: spacing.md },
  dateCard: { width: 58, height: 72, borderRadius: radius.md, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dateWeekday: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, textTransform: "uppercase" },
  dateDay: { fontFamily: fonts.displayBold, fontSize: 21, lineHeight: 24 },
  dateMonth: { fontFamily: fonts.body, fontSize: 9.5, textTransform: "uppercase" },
  timeRow: { gap: 7, paddingRight: spacing.md, marginTop: spacing.xs },
  timeChip: { minHeight: 38, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 5 },
  timeText: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
  customTime: { minHeight: 42, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  customTimeLabel: { fontFamily: fonts.body, fontSize: 11.5 },
  customTimeInput: { width: 72, textAlign: "center", fontFamily: fonts.bodySemiBold, fontSize: 13 },
  form: { gap: spacing.xs },
  fieldGroup: { gap: 4, marginTop: spacing.xs },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 0.6 },
  inputShell: { minHeight: 46, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  input: { flex: 1, minWidth: 0, paddingVertical: 9, fontFamily: fonts.body, fontSize: 13 },
  error: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, marginTop: spacing.sm, textAlign: "center" },
  reviewButton: { minHeight: 50, borderRadius: radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.md },
  reviewText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 14 },
  recipientSummary: { minHeight: 62, borderRadius: radius.lg, borderWidth: 1, padding: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  previewCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, marginTop: spacing.sm },
  previewLabel: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 0.8, marginBottom: spacing.xs },
  previewText: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 19 },
  previewActions: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
  editButton: { flex: 0.75, minHeight: 50, borderRadius: radius.lg, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  editText: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  sendButton: { flex: 1.25, minHeight: 50, borderRadius: radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  sendText: { color: "#FFFFFF", fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
  disabled: { opacity: 0.6 }
});
