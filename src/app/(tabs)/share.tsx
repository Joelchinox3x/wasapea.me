import { useFocusEffect } from "expo-router";
import { BookmarkPlus, Copy, FileText, Plus, Share2, Sparkles, Trash2 } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { ScalePressable } from "../../components/ScalePressable";
import { WhatsAppGlyphIcon } from "../../components/icons/AppSvgIcons";
import { MessageTemplateCard } from "../../components/messages/MessageTemplateCard";
import { LocationShareModal } from "../../components/messages/LocationShareModal";
import { MessageTemplateModal } from "../../components/messages/MessageTemplateModal";
import { isAppointmentMessageTemplate, LOCATION_MESSAGE_TEMPLATE_ID } from "../../constants/messageTemplates";
import type { CreateMessageTemplateParams, MessageTemplateItem } from "../../domain/models";
import { MessageTemplateRepository } from "../../repositories/MessageTemplateRepository";
import { CommunicationService } from "../../services/CommunicationService";
import { LocationShareService } from "../../services/LocationShareService";
import {
  buildLiveLocationMessage,
  LiveLocationService,
  type ActiveLiveLocationSession
} from "../../services/LiveLocationService";
import { useAppStore } from "../../store/useAppStore";
import { darkColors, lightColors } from "../../theme/colors";
import { emeraldGlow, fonts, radius, spacing } from "../../theme/designSystem";

export default function ShareMessageScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const { themeMode, showNotice, showToast } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;
  const carouselCardWidth = Math.min(176, Math.max(156, width * 0.44));

  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState<MessageTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorTemplate, setEditorTemplate] = useState<MessageTemplateItem | null>(null);
  const [editorInitialContent, setEditorInitialContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplateItem | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState<ActiveLiveLocationSession | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setTemplates(await MessageTemplateRepository.getAll());
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "No se pudieron cargar las plantillas.",
        tone: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refreshLiveSession = useCallback(async () => {
    setActiveLiveSession(await LiveLocationService.getActiveSession());
  }, []);

  useFocusEffect(useCallback(() => {
    void loadTemplates();
    void refreshLiveSession();
  }, [loadTemplates, refreshLiveSession]));

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  );
  const generalTemplates = useMemo(
    () => templates.filter((template) => !isAppointmentMessageTemplate(template.id)),
    [templates]
  );
  const hasMessage = message.trim().length > 0;

  const markTemplateUsed = useCallback(async (templateId = selectedTemplateId) => {
    if (!templateId) return;
    await MessageTemplateRepository.recordUse(templateId);
    await loadTemplates();
  }, [loadTemplates, selectedTemplateId]);

  const handleOpenWhatsApp = async () => {
    const result = await CommunicationService.openWhatsAppShare(message);
    if (result.success) {
      await markTemplateUsed();
      return;
    }
    showToast({ message: result.error || "No se pudo abrir WhatsApp.", tone: "error" });
  };

  const handleCopy = async () => {
    const result = await CommunicationService.copyToClipboard(message.trim(), "Mensaje copiado al portapapeles.");
    if (result.success) await markTemplateUsed();
    showToast({ message: result.message || result.error || "No se pudo copiar el mensaje.", tone: result.success ? "success" : "error" });
  };

  const handleShare = async () => {
    const result = await CommunicationService.shareText(message);
    if (result.success) await markTemplateUsed();
    if (!result.success) showToast({ message: result.error || "No se pudo compartir el mensaje.", tone: "error" });
  };

  const handleShareCurrentLocation = async (): Promise<boolean> => {
    try {
      const payload = await LocationShareService.getCurrentLocationMessage();
      setMessage(payload.message);
      setSelectedTemplateId(LOCATION_MESSAGE_TEMPLATE_ID);

      const result = await CommunicationService.openWhatsAppShare(payload.message);
      if (!result.success) {
        showToast({ message: result.error || "No se pudo abrir WhatsApp.", tone: "error" });
        return false;
      }

      await markTemplateUsed(LOCATION_MESSAGE_TEMPLATE_ID);
      return true;
    } catch (error) {
      showNotice({
        title: "No pudimos obtener tu ubicación",
        message: error instanceof Error ? error.message : "Revisa el permiso y la señal GPS e inténtalo nuevamente.",
        tone: "error"
      });
      return false;
    }
  };

  const handleShareLiveLocation = async (): Promise<boolean> => {
    let session = activeLiveSession;
    let sessionCreatedNow = false;
    try {
      if (!session) {
        session = await LiveLocationService.start(60);
        sessionCreatedNow = true;
        setActiveLiveSession(session);
      }

      const liveMessage = buildLiveLocationMessage(session.viewerUrl);
      setMessage(liveMessage);
      setSelectedTemplateId(LOCATION_MESSAGE_TEMPLATE_ID);
      const result = await CommunicationService.openWhatsAppShare(liveMessage);
      if (!result.success) {
        if (sessionCreatedNow) {
          await LiveLocationService.stop(session);
          setActiveLiveSession(null);
        }
        showToast({ message: result.error || "No se pudo abrir WhatsApp.", tone: "error" });
        return false;
      }

      await markTemplateUsed(LOCATION_MESSAGE_TEMPLATE_ID);
      return true;
    } catch (error) {
      await refreshLiveSession();
      showNotice({
        title: "No se pudo iniciar la ubicación en vivo",
        message: error instanceof Error ? error.message : "Revisa los permisos y la conexión con el servidor.",
        tone: "error"
      });
      return false;
    }
  };

  const handleStopLiveLocation = async (): Promise<void> => {
    await LiveLocationService.stop(activeLiveSession ?? undefined);
    setActiveLiveSession(null);
    showToast({ message: "Ubicación en vivo detenida.", tone: "success" });
  };

  const openNewTemplate = (content = "") => {
    setEditorTemplate(null);
    setEditorInitialContent(content);
    setEditorVisible(true);
  };

  const handleSaveTemplate = async (params: CreateMessageTemplateParams) => {
    try {
      if (editorTemplate) {
        await MessageTemplateRepository.update(editorTemplate.id, params);
        if (selectedTemplateId === editorTemplate.id) setMessage(params.content);
      } else {
        const created = await MessageTemplateRepository.create(params);
        setSelectedTemplateId(created.id);
        setMessage(created.content);
      }
      await loadTemplates();
      setEditorVisible(false);
      showToast({ message: editorTemplate ? "Plantilla actualizada." : "Plantilla creada.", tone: "success" });
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : "No se pudo guardar la plantilla.", tone: "error" });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTarget) return;
    try {
      await MessageTemplateRepository.delete(deleteTarget.id);
      if (selectedTemplateId === deleteTarget.id) setSelectedTemplateId(null);
      setDeleteTarget(null);
      await loadTemplates();
      showToast({ message: "Plantilla eliminada.", tone: "success" });
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : "No se pudo eliminar la plantilla.", tone: "error" });
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.page}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.primary }]}>Mensajes</Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>Mensaje a tus contactos</Text>
            </View>
            <ScalePressable
              onPress={() => openNewTemplate()}
              accessibilityLabel="Crear nueva plantilla"
              style={[styles.newButton, { backgroundColor: colors.primary + "1F", borderColor: colors.primary + "55" }]}
            >
              <Plus size={18} color={colors.primary} />
              <Text style={[styles.newButtonText, { color: colors.primary }]}>Nueva</Text>
            </ScalePressable>
          </View>

          <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}> 
            <View style={styles.composerHeader}>
              <View style={styles.composerTitleRow}>
                <View style={[styles.composerIcon, { backgroundColor: colors.primary + "1F" }]}> 
                  <Sparkles size={18} color={colors.primary} />
                </View>
                <View style={styles.composerCopy}>
                  <Text style={[styles.composerTitle, { color: colors.text }]}>Tu mensaje</Text>
                  <Text style={[styles.composerSubtitle, { color: colors.subtext }]} numberOfLines={1}>
                    {selectedTemplate ? `Plantilla: ${selectedTemplate.title}` : "Sin número ni destinatario fijo"}
                  </Text>
                </View>
              </View>
              {hasMessage && (
                <TouchableOpacity
                  onPress={() => { setMessage(""); setSelectedTemplateId(null); }}
                  accessibilityLabel="Limpiar mensaje"
                  style={[styles.clearButton, { backgroundColor: colors.badgeBg }]}
                >
                  <Trash2 size={15} color={colors.subtext} />
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              value={message}
              onChangeText={(value) => {
                setMessage(value);
                if (selectedTemplate && value !== selectedTemplate.content) setSelectedTemplateId(null);
              }}
              placeholder="Escribe aquí el mensaje que quieres compartir..."
              placeholderTextColor={colors.subtext}
              multiline
              textAlignVertical="top"
              maxLength={3000}
              style={[styles.messageInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
            />
            <Text style={[styles.characterCount, { color: colors.subtext }]}>{message.length}/3000</Text>

            <ScalePressable
              onPress={() => void handleOpenWhatsApp()}
              disabled={!hasMessage}
              style={[styles.whatsappButton, { backgroundColor: colors.primary }, !hasMessage && styles.disabled, emeraldGlow]}
            >
              <WhatsAppGlyphIcon size={25} color="#FFFFFF" />
              <View style={styles.whatsappCopy}>
                <Text style={styles.whatsappTitle}>Elegir destinatario en WhatsApp</Text>
                <Text style={styles.whatsappSubtitle}>Contacto o grupo</Text>
              </View>
            </ScalePressable>

            <View style={styles.secondaryActions}>
              <ScalePressable
                onPress={() => void handleCopy()}
                disabled={!hasMessage}
                style={[styles.secondaryButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }, !hasMessage && styles.disabled]}
              >
                <Copy size={19} color={colors.accent} />
                <Text style={[styles.secondaryText, { color: colors.text }]}>Copiar</Text>
              </ScalePressable>
              <ScalePressable
                onPress={() => void handleShare()}
                disabled={!hasMessage}
                style={[styles.secondaryButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }, !hasMessage && styles.disabled]}
              >
                <Share2 size={19} color={colors.sms} />
                <Text style={[styles.secondaryText, { color: colors.text }]}>Otras apps</Text>
              </ScalePressable>
              <ScalePressable
                onPress={() => openNewTemplate(message)}
                disabled={!hasMessage}
                style={[styles.secondaryButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }, !hasMessage && styles.disabled]}
              >
                <BookmarkPlus size={19} color={colors.primary} />
                <Text style={[styles.secondaryText, { color: colors.text }]}>Plantilla</Text>
              </ScalePressable>
            </View>
          </View>

          <View style={styles.templatesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Plantillas</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary + "18" }]}> 
              <Text style={[styles.countText, { color: colors.primary }]}>{generalTemplates.length}</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : generalTemplates.length > 0 ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToAlignment="start"
              snapToInterval={carouselCardWidth + spacing.sm}
              contentContainerStyle={styles.templateCarousel}
            >
              {generalTemplates.map((template) => (
                <MessageTemplateCard
                  key={template.id}
                  width={carouselCardWidth}
                  template={template}
                  colors={colors}
                  selected={selectedTemplateId === template.id}
                  onUse={() => {
                    if (template.id === LOCATION_MESSAGE_TEMPLATE_ID) {
                      setSelectedTemplateId(template.id);
                      setLocationModalVisible(true);
                      return;
                    }
                    setMessage(template.content);
                    setSelectedTemplateId(template.id);
                  }}
                  onToggleFavorite={async () => {
                    await MessageTemplateRepository.toggleFavorite(template.id);
                    await loadTemplates();
                  }}
                  onEdit={() => {
                    setEditorTemplate(template);
                    setEditorInitialContent("");
                    setEditorVisible(true);
                  }}
                  onDelete={() => setDeleteTarget(template)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}> 
              <FileText size={30} color={colors.subtext} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No hay plantillas aquí</Text>
              <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>Crea una plantilla para reutilizar tus mensajes.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {editorVisible && (
        <MessageTemplateModal
          visible
          colors={colors}
          template={editorTemplate}
          initialContent={editorInitialContent}
          onClose={() => setEditorVisible(false)}
          onSave={handleSaveTemplate}
        />
      )}
      <LocationShareModal
        visible={locationModalVisible}
        colors={colors}
        onClose={() => setLocationModalVisible(false)}
        onShareCurrent={handleShareCurrentLocation}
        activeLiveSession={activeLiveSession}
        onShareLive={handleShareLiveLocation}
        onStopLive={handleStopLiveLocation}
      />
      <ConfirmationModal
        visible={deleteTarget !== null}
        title="¿Eliminar plantilla?"
        message={`Se eliminará “${deleteTarget?.title ?? "esta plantilla"}” de forma permanente.`}
        confirmText="Eliminar"
        cancelText="Conservar"
        isDanger
        isDark={isDark}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteTemplate()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  page: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  headerCopy: { flex: 1, paddingRight: spacing.sm },
  title: { fontFamily: fonts.displayBold, fontSize: 28 },
  subtitle: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, marginTop: 1 },
  newButton: { minHeight: 38, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 5 },
  newButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
  composer: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.md },
  composerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  composerTitleRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  composerIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginRight: 9 },
  composerCopy: { flex: 1 },
  composerTitle: { fontFamily: fonts.displaySemiBold, fontSize: 16 },
  composerSubtitle: { fontFamily: fonts.body, fontSize: 11, marginTop: 1 },
  clearButton: { width: 34, height: 34, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", marginLeft: spacing.xs },
  messageInput: { minHeight: 132, maxHeight: 240, borderRadius: radius.lg, borderWidth: 1, padding: spacing.sm, paddingBottom: 24, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  characterCount: { alignSelf: "flex-end", fontFamily: fonts.body, fontSize: 10.5, marginTop: -19, marginRight: 9, marginBottom: spacing.sm },
  whatsappButton: { minHeight: 56, borderRadius: radius.lg, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  whatsappCopy: { alignItems: "flex-start" },
  whatsappTitle: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 13.5 },
  whatsappSubtitle: { color: "rgba(255,255,255,0.78)", fontFamily: fonts.body, fontSize: 10.5, marginTop: 1 },
  secondaryActions: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
  secondaryButton: { flex: 1, minHeight: 62, borderRadius: radius.md, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 3 },
  secondaryText: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, textAlign: "center" },
  disabled: { opacity: 0.42, shadowOpacity: 0, elevation: 0 },
  templatesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.displayBold, fontSize: 20 },
  countBadge: { minWidth: 30, height: 26, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  countText: { fontFamily: fonts.displaySemiBold, fontSize: 13 },
  templateCarousel: { paddingRight: spacing.md },
  loader: { marginVertical: spacing.xl },
  emptyState: { borderRadius: radius.lg, borderWidth: 1, alignItems: "center", padding: spacing.lg },
  emptyTitle: { fontFamily: fonts.displaySemiBold, fontSize: 16, marginTop: spacing.sm },
  emptySubtitle: { fontFamily: fonts.body, fontSize: 12, textAlign: "center", marginTop: 3 }
});
