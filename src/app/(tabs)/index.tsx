import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CountrySelectorModal } from "../../components/CountrySelectorModal";
import { MoreActionsSheet } from "../../components/MoreActionsSheet";
import { PhoneActionButtons } from "../../components/PhoneActionButtons";
import { QrCodeModal } from "../../components/QrCodeModal";
import { VipBenefitsModal } from "../../components/VipBenefitsModal";
import { ClipboardDetectionBanner } from "../../components/home/ClipboardDetectionBanner";
import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeQuickAccessSection } from "../../components/home/HomeQuickAccessSection";
import { PhoneComposerCard, type PhoneSuggestionItem } from "../../components/home/PhoneComposerCard";
import { SimpleGreetingsSection } from "../../components/home/SimpleGreetingsSection";
import { AppointmentTemplateModal } from "../../components/messages/AppointmentTemplateModal";
import { LocationShareModal } from "../../components/messages/LocationShareModal";
import {
  isAppointmentMessageTemplate,
  LOCATION_MESSAGE_TEMPLATE_ID
} from "../../constants/messageTemplates";
import { POPULAR_COUNTRIES, type CountryItem } from "../../constants/app";
import type { CommunicationActionType, MessageTemplateItem, PhoneHistoryEntry } from "../../domain/models";
import { useClipboardDetection } from "../../hooks/useClipboardDetection";
import { useHomeScreenData } from "../../hooks/useHomeScreenData";
import { usePhoneComposer } from "../../hooks/usePhoneComposer";
import { ContactRepository } from "../../repositories/ContactRepository";
import { HistoryRepository } from "../../repositories/HistoryRepository";
import { MessageTemplateRepository } from "../../repositories/MessageTemplateRepository";
import { ReminderRepository } from "../../repositories/ReminderRepository";
import { CommunicationService } from "../../services/CommunicationService";
import { LocationShareService } from "../../services/LocationShareService";
import {
  buildLiveLocationMessage,
  LiveLocationService,
  type ActiveLiveLocationSession
} from "../../services/LiveLocationService";
import { hasProAccess, useAppStore } from "../../store/useAppStore";
import { darkColors, lightColors } from "../../theme/colors";
import { spacing } from "../../theme/designSystem";

interface QrTarget {
  e164: string;
  formattedNumber: string;
  message?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const {
    themeMode,
    appMode,
    setAppMode,
    showModeSwitch,
    selectedCountry,
    setSelectedCountry,
    autoDetectClipboard,
    logHistoryEnabled,
    currentPhoneInput,
    setCurrentPhoneInput,
    currentMessageInput,
    setCurrentMessageInput,
    showNotice,
    showToast
  } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;
  const compact = width < 390;
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);
  const [historyActionTarget, setHistoryActionTarget] = useState<PhoneHistoryEntry | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [vipModalVisible, setVipModalVisible] = useState(false);
  const [appointmentTemplate, setAppointmentTemplate] = useState<MessageTemplateItem | null>(null);
  const [activeLiveSession, setActiveLiveSession] = useState<ActiveLiveLocationSession | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const validationStateRef = useRef<"empty" | "invalid" | "valid">("empty");
  const currentMessageInputRef = useRef(currentMessageInput);
  useEffect(() => {
    currentMessageInputRef.current = currentMessageInput;
  }, [currentMessageInput]);

  const { parsedPhone, applyInput } = usePhoneComposer({
    input: currentPhoneInput,
    country: selectedCountry,
    setInput: setCurrentPhoneInput,
    setCountry: setSelectedCountry
  });
  const clipboard = useClipboardDetection({
    enabled: autoDetectClipboard,
    currentInput: currentPhoneInput,
    countryIso: selectedCountry.iso
  });
  const homeData = useHomeScreenData();
  const homeTemplates = useMemo(
    () =>
      homeData.templates.filter(
        (template) => template.id !== LOCATION_MESSAGE_TEMPLATE_ID
      ),
    [homeData.templates]
  );

  const refreshLiveSession = useCallback(async () => {
    setActiveLiveSession(await LiveLocationService.getActiveSession());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshLiveSession();
    }, [refreshLiveSession])
  );

  useEffect(() => {
    const trimmed = currentPhoneInput.trim();
    if (!trimmed) {
      validationStateRef.current = "empty";
      return;
    }

    if (parsedPhone.isValid) {
      if (validationStateRef.current !== "valid") {
        showToast({
          message: `Número válido (${selectedCountry.name})`,
          tone: "success",
          duration: 2_200
        });
      }
      validationStateRef.current = "valid";
      return;
    }

    const timer = setTimeout(() => {
      if (validationStateRef.current !== "invalid") {
        showToast({
          message: parsedPhone.error || "El número no parece válido",
          tone: "error",
          duration: 2_400
        });
      }
      validationStateRef.current = "invalid";
    }, 650);

    return () => clearTimeout(timer);
  }, [currentPhoneInput, parsedPhone.error, parsedPhone.isValid, selectedCountry.name, showToast]);

  const recordAction = useCallback(
    async (actionType: CommunicationActionType) => {
      if (!logHistoryEnabled || !parsedPhone.isValid) return;
      const msg = currentMessageInputRef.current;
      try {
        await HistoryRepository.logAction({
          phoneE164: parsedPhone.e164,
          phoneFormatted: parsedPhone.formattedInternational,
          countryCode: parsedPhone.countryCode,
          countryIso: parsedPhone.countryIso,
          actionType,
          metadata: msg ? `Msg: ${msg}` : undefined
        });
        await homeData.reload();
      } catch {
        // Una falla del historial local no debe bloquear la comunicación.
      }
    },
    [homeData, logHistoryEnabled, parsedPhone]
  );

  const openWhatsApp = useCallback(async () => {
    if (!parsedPhone.isValid) return;
    Keyboard.dismiss();
    await recordAction(currentMessageInput ? "whatsapp_message" : "whatsapp");
    const result = await CommunicationService.openWhatsApp(parsedPhone.e164, currentMessageInput);
    if (!result.success && result.error) {
      showNotice({ title: "No se pudo abrir WhatsApp", message: result.error, tone: "error" });
    }
  }, [currentMessageInput, parsedPhone, recordAction, showNotice]);

  const openWhatsAppBusiness = useCallback(async () => {
    if (!parsedPhone.isValid) return;
    Keyboard.dismiss();
    await recordAction("whatsapp");
    const result = await CommunicationService.openWhatsAppBusiness(parsedPhone.e164, currentMessageInput);
    if (!result.success && result.error) {
      showNotice({ title: "No se pudo abrir WhatsApp Business", message: result.error, tone: "error" });
    }
  }, [currentMessageInput, parsedPhone, recordAction, showNotice]);

  const call = useCallback(async () => {
    if (!parsedPhone.isValid) return;
    Keyboard.dismiss();
    await recordAction("call");
    const result = await CommunicationService.makeCall(parsedPhone.e164);
    if (!result.success && result.error) {
      showNotice({ title: "No se pudo iniciar la llamada", message: result.error, tone: "error" });
    }
  }, [parsedPhone, recordAction, showNotice]);

  const sendSms = useCallback(async () => {
    if (!parsedPhone.isValid) return;
    Keyboard.dismiss();
    await recordAction("sms");
    const result = await CommunicationService.sendSms(parsedPhone.e164, currentMessageInput);
    if (!result.success && result.error) {
      showNotice({ title: "No se pudo abrir Mensajes", message: result.error, tone: "error" });
    }
  }, [currentMessageInput, parsedPhone, recordAction, showNotice]);

  const copy = useCallback(async () => {
    if (!parsedPhone.isValid) return;
    await recordAction("copy");
    const result = await CommunicationService.copyToClipboard(parsedPhone.e164);
    showToast({
      message: result.message || result.error || "No se pudo copiar el número.",
      tone: result.success ? "success" : "error"
    });
  }, [parsedPhone, recordAction, showToast]);

  const share = useCallback(async () => {
    if (!parsedPhone.isValid) return;
    await recordAction("share");
    const result = await CommunicationService.shareNumber(parsedPhone.e164, parsedPhone.formattedInternational);
    if (!result.success && result.error) {
      showNotice({ title: "No se pudo compartir", message: result.error, tone: "error" });
    }
  }, [parsedPhone, recordAction, showNotice]);

  const saveToAgenda = useCallback(() => {
    if (!parsedPhone.isValid) return;
    router.push({
      pathname: "/agenda/create",
      params: {
        phoneE164: parsedPhone.e164,
        phoneFormatted: parsedPhone.formattedInternational,
        countryCode: parsedPhone.countryCode,
        countryIso: parsedPhone.countryIso
      }
    });
  }, [parsedPhone, router]);

  const copyHistoryTarget = useCallback(async () => {
    if (!historyActionTarget) return;
    const result = await CommunicationService.copyToClipboard(historyActionTarget.phoneE164);
    showToast({
      message: result.message || result.error || "No se pudo copiar el número.",
      tone: result.success ? "success" : "error"
    });
  }, [historyActionTarget, showToast]);

  const saveHistoryTarget = useCallback(() => {
    if (!historyActionTarget) return;
    router.push({
      pathname: "/agenda/create",
      params: {
        phoneE164: historyActionTarget.phoneE164,
        phoneFormatted: historyActionTarget.phoneFormatted,
        countryCode: historyActionTarget.countryCode,
        countryIso: historyActionTarget.countryIso,
        name: historyActionTarget.name || undefined
      }
    });
  }, [historyActionTarget, router]);

  const showHistoryQr = useCallback(() => {
    if (!historyActionTarget) return;
    setQrTarget({ e164: historyActionTarget.phoneE164, formattedNumber: historyActionTarget.phoneFormatted });
  }, [historyActionTarget]);

  const recordQuickContactAction = useCallback(
    async (
      contact: (typeof homeData.quickContacts)[number]["contact"],
      actionType: CommunicationActionType
    ) => {
      if (!logHistoryEnabled) return;
      try {
        await HistoryRepository.logAction({
          phoneE164: contact.phoneE164,
          phoneFormatted: contact.phoneFormatted,
          countryCode: contact.countryCode,
          countryIso: contact.countryIso,
          name: contact.name,
          actionType
        });
        await homeData.reload();
      } catch {
        // El acceso directo debe funcionar aunque falle el historial local.
      }
    },
    [homeData, logHistoryEnabled]
  );

  const markLocationTemplateUsed = useCallback(async () => {
    await MessageTemplateRepository.recordUse(LOCATION_MESSAGE_TEMPLATE_ID);
    await homeData.reload();
  }, [homeData]);

  const shareCurrentLocation = useCallback(async (): Promise<boolean> => {
    try {
      const payload = await LocationShareService.getCurrentLocationMessage();
      setCurrentMessageInput(payload.message);
      if (!parsedPhone.isValid) {
        showToast({ message: "El destinatario ya no es válido. Elige nuevamente el contacto.", tone: "error" });
        return false;
      }
      const result = await CommunicationService.openWhatsApp(parsedPhone.e164, payload.message);
      if (!result.success) {
        showToast({ message: result.error || "No se pudo abrir WhatsApp.", tone: "error" });
        return false;
      }
      await markLocationTemplateUsed();
      return true;
    } catch (error) {
      showNotice({
        title: "No pudimos obtener tu ubicación",
        message: error instanceof Error ? error.message : "Revisa el permiso y la señal GPS.",
        tone: "error"
      });
      return false;
    }
  }, [markLocationTemplateUsed, parsedPhone.e164, parsedPhone.isValid, setCurrentMessageInput, showNotice, showToast]);

  const handleQuickLocationShare = useCallback(async () => {
    if (isLocationLoading) return;
    setIsLocationLoading(true);
    showToast({
      message: "Obteniendo tu ubicación GPS...",
      tone: "info",
      duration: 3_000
    });
    try {
      const payload = await LocationShareService.getCurrentLocationMessage();
      setCurrentMessageInput(payload.message);

      if (parsedPhone.isValid) {
        Keyboard.dismiss();
        await recordAction("whatsapp_message");
        const result = await CommunicationService.openWhatsApp(parsedPhone.e164, payload.message);
        if (result.success) {
          await markLocationTemplateUsed();
        } else {
          showNotice({
            title: "Ubicación cargada",
            message: result.error || "Se cargó la ubicación en el mensaje.",
            tone: "error"
          });
        }
      } else {
        Keyboard.dismiss();
        const shareResult = await CommunicationService.openWhatsAppShare(payload.message);
        if (shareResult.success) {
          await markLocationTemplateUsed();
          showToast({
            message: "📍 Elige los contactos en WhatsApp a quienes enviar tu ubicación.",
            tone: "success",
            duration: 3_200
          });
        } else {
          showToast({
            message: "📍 Ubicación cargada en el mensaje.",
            tone: "success",
            duration: 3_000
          });
        }
      }
    } catch (error) {
      showNotice({
        title: "No pudimos obtener tu ubicación",
        message: error instanceof Error ? error.message : "Revisa el permiso y la señal GPS de tu dispositivo.",
        tone: "error"
      });
    } finally {
      setIsLocationLoading(false);
    }
  }, [isLocationLoading, markLocationTemplateUsed, parsedPhone.e164, parsedPhone.isValid, recordAction, setCurrentMessageInput, showNotice, showToast]);

  const shareLiveLocation = useCallback(async (): Promise<boolean> => {
    let session = activeLiveSession;
    let sessionCreatedNow = false;
    try {
      if (!session) {
        session = await LiveLocationService.start(60);
        sessionCreatedNow = true;
        setActiveLiveSession(session);
      }
      const message = buildLiveLocationMessage(session.viewerUrl);
      setCurrentMessageInput(message);
      if (!parsedPhone.isValid) {
        const shareResult = await CommunicationService.openWhatsAppShare(message);
        if (shareResult.success) {
          showToast({ message: "🔴 Elige los contactos en WhatsApp a quienes transmitir en vivo.", tone: "success", duration: 3_200 });
          return true;
        }
        return false;
      }
      const result = await CommunicationService.openWhatsApp(parsedPhone.e164, message);
      if (!result.success) {
        if (sessionCreatedNow) {
          await LiveLocationService.stop(session);
          setActiveLiveSession(null);
        }
        showToast({ message: result.error || "No se pudo abrir WhatsApp.", tone: "error" });
        return false;
      }
      await markLocationTemplateUsed();
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
  }, [activeLiveSession, markLocationTemplateUsed, parsedPhone.e164, parsedPhone.isValid, refreshLiveSession, setCurrentMessageInput, showNotice, showToast]);

  const stopLiveLocation = useCallback(async (): Promise<void> => {
    await LiveLocationService.stop(activeLiveSession ?? undefined);
    setActiveLiveSession(null);
    showToast({ message: "Ubicación en vivo detenida.", tone: "success" });
  }, [activeLiveSession, showToast]);

  const recentSuggestions = useMemo(() => {
    const list: PhoneSuggestionItem[] = [];
    const seen = new Set<string>();

    for (const item of homeData.recentItems) {
      if (!seen.has(item.phoneE164)) {
        seen.add(item.phoneE164);
        list.push({
          id: `recent-${item.id}`,
          phoneE164: item.phoneE164,
          phoneFormatted: item.phoneFormatted,
          name: item.name ?? undefined,
          countryIso: item.countryIso
        });
      }
    }

    return list.slice(0, 5);
  }, [homeData.recentItems]);

  const handleSelectSuggestion = useCallback(
    (item: PhoneSuggestionItem) => {
      clipboard.dismiss();
      applyInput(item.phoneE164);
      if (item.countryIso) {
        const matched = POPULAR_COUNTRIES.find((c) => c.iso === item.countryIso);
        if (matched) setSelectedCountry(matched);
      }
      showToast({
        message: `${item.name || item.phoneFormatted} listo.`,
        tone: "success",
        duration: 1800
      });
    },
    [applyInput, clipboard, setSelectedCountry, showToast]
  );

  const dynamicBottomPadding = 0;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { flex: 1, paddingBottom: dynamicBottomPadding }]}>
        <HomeHeader
          appMode={appMode}
          showModeSwitch={showModeSwitch}
          compact={compact}
          colors={colors}
          onModeChange={setAppMode}
          onVipPress={() => setVipModalVisible(true)}
        />

        {clipboard.candidate && (
          <ClipboardDetectionBanner
            candidate={clipboard.candidate}
            colors={colors}
            onUse={() => {
              applyInput(clipboard.candidate ?? "");
              clipboard.dismiss();
            }}
            onDismiss={clipboard.dismiss}
          />
        )}
        <PhoneComposerCard
          colors={colors}
          compact={compact}
          country={selectedCountry}
          phoneInput={currentPhoneInput}
          messageInput={currentMessageInput}
          parsedPhone={parsedPhone}
          recentSuggestions={recentSuggestions}
          onCountryPress={() => setCountryModalVisible(true)}
          onPhoneChange={(value) => {
            clipboard.dismiss();
            applyInput(value);
          }}
          onMessageChange={setCurrentMessageInput}
          onSelectSuggestion={handleSelectSuggestion}
        />

        <PhoneActionButtons
          isValid={parsedPhone.isValid}
          onWhatsApp={() => void openWhatsApp()}
          onWhatsAppBusiness={() => void openWhatsAppBusiness()}
          onCall={() => void call()}
          onSms={() => void sendSms()}
          onCopy={() => void copy()}
          onShare={() => void share()}
          onLocation={() => void handleQuickLocationShare()}
          onLocationLongPress={() => setLocationModalVisible(true)}
          isLocationLoading={isLocationLoading}
          onSaveToAgenda={hasProAccess(appMode) ? saveToAgenda : undefined}
          onShowQr={() => setQrTarget({
            e164: parsedPhone.e164,
            formattedNumber: parsedPhone.formattedInternational,
            message: currentMessageInput
          })}
          isDark={isDark}
        />

        {hasProAccess(appMode) ? (
          <HomeQuickAccessSection
            recentItems={homeData.recentItems}
            latestActions={homeData.latestActions}
            contacts={homeData.quickContacts}
            templates={homeTemplates}
            colors={colors}
            isDark={isDark}
            onReloadTemplates={() => void homeData.reload()}
            onRecentPress={(item) => {
              clipboard.dismiss();
              applyInput(item.phoneE164);
            }}
            onRecentLongPress={setHistoryActionTarget}
            onRecentWhatsApp={(item) => void CommunicationService.openWhatsApp(item.phoneE164)}
            onRecentCall={(item) => void CommunicationService.makeCall(item.phoneE164)}
            onRecentToggleFavorite={(item) => {
              void HistoryRepository.toggleFavorite(item.id).then(homeData.reload);
            }}
            onRecentDelete={(item) => {
              void HistoryRepository.delete(item.id).then(homeData.reload);
            }}
            onContactPress={(item) => {
              clipboard.dismiss();
              applyInput(item.contact.phoneE164);
              showToast({ message: `${item.contact.name} listo para usar.`, tone: "success", duration: 1_800 });
            }}
            onContactWhatsApp={(item) => {
              void recordQuickContactAction(item.contact, "whatsapp").then(() =>
                CommunicationService.openWhatsApp(item.contact.phoneE164)
              );
            }}
            onContactCall={(item) => {
              void recordQuickContactAction(item.contact, "call").then(() =>
                CommunicationService.makeCall(item.contact.phoneE164)
              );
            }}
            onContactToggleFavorite={(item) => {
              void ContactRepository.toggleFavorite(item.contact.id).then(homeData.reload);
            }}
            onContactDelete={(item) => {
              void ContactRepository.delete(item.contact.id).then(homeData.reload);
            }}
            onTemplateUse={(template) => {
              if (template.id === LOCATION_MESSAGE_TEMPLATE_ID) {
                void handleQuickLocationShare();
                return;
              }
              if (isAppointmentMessageTemplate(template.id)) {
                setAppointmentTemplate(template);
                return;
              }
              setCurrentMessageInput(template.content);
            }}
            onTemplateSend={(template) => {
              if (template.id === LOCATION_MESSAGE_TEMPLATE_ID) {
                void handleQuickLocationShare();
                return;
              }
              if (isAppointmentMessageTemplate(template.id)) {
                setAppointmentTemplate(template);
                return;
              }
              setCurrentMessageInput(template.content);
              if (parsedPhone.isValid) {
                void CommunicationService.openWhatsApp(parsedPhone.e164, template.content).then(async (result) => {
                  if (result.success) {
                    await MessageTemplateRepository.recordUse(template.id);
                    await homeData.reload();
                  } else {
                    showToast({ message: result.error || "No se pudo abrir WhatsApp.", tone: "error" });
                  }
                });
              } else {
                void CommunicationService.openWhatsAppShare(template.content).then(async (result) => {
                  if (result.success) {
                    await MessageTemplateRepository.recordUse(template.id);
                    await homeData.reload();
                    showToast({ message: "Elige los contactos en WhatsApp a quienes enviar.", tone: "success", duration: 2800 });
                  }
                });
              }
            }}
            onTemplateToggleFavorite={(template) => {
              void MessageTemplateRepository.toggleFavorite(template.id).then(homeData.reload);
            }}
          />
        ) : (
          <SimpleGreetingsSection
            colors={colors}
            isDark={isDark}
            onSelectGreeting={(content) => {
              setCurrentMessageInput(content);
            }}
            onSendGreeting={async (content) => {
              setCurrentMessageInput(content);
              if (parsedPhone.isValid) {
                Keyboard.dismiss();
                await recordAction("whatsapp_message");
                const result = await CommunicationService.openWhatsApp(parsedPhone.e164, content);
                if (!result.success && result.error) {
                  showNotice({ title: "No se pudo abrir WhatsApp", message: result.error, tone: "error" });
                }
              } else {
                showToast({
                  message: "Escribe o elige un número para enviar por WhatsApp.",
                  tone: "info",
                  duration: 2_600
                });
              }
            }}
          />
        )}
      </View>


      <CountrySelectorModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelectCountry={(country: CountryItem) => setSelectedCountry(country)}
        selectedIso={selectedCountry.iso}
        isDark={isDark}
      />
      <MoreActionsSheet
        visible={historyActionTarget !== null}
        onClose={() => setHistoryActionTarget(null)}
        colors={colors}
        disabled={historyActionTarget === null}
        targetLabel={historyActionTarget?.phoneFormatted}
        onCopy={() => void copyHistoryTarget()}
        onSaveToAgenda={saveHistoryTarget}
        onShowQr={showHistoryQr}
      />
      {qrTarget && (
        <QrCodeModal
          visible
          onClose={() => setQrTarget(null)}
          e164={qrTarget.e164}
          formattedNumber={qrTarget.formattedNumber}
          message={qrTarget.message}
          isDark={isDark}
        />
      )}
      <LocationShareModal
        visible={locationModalVisible}
        colors={colors}
        onClose={() => setLocationModalVisible(false)}
        onShareCurrent={shareCurrentLocation}
        activeLiveSession={activeLiveSession}
        onShareLive={shareLiveLocation}
        onStopLive={stopLiveLocation}
      />
      {appointmentTemplate && (
        <AppointmentTemplateModal
          visible
          template={appointmentTemplate}
          colors={colors}
          initialPhoneE164={parsedPhone.isValid ? parsedPhone.e164 : undefined}
          initialPhoneFormatted={parsedPhone.isValid ? parsedPhone.formattedInternational : undefined}
          onClose={() => setAppointmentTemplate(null)}
          onSend={async (preparedMessage, template, recipient, appointment) => {
            setCurrentMessageInput(preparedMessage);
            clipboard.dismiss();
            applyInput(recipient.phoneE164);
            const result = await CommunicationService.openWhatsApp(recipient.phoneE164, preparedMessage);
            if (!result.success) {
              showToast({ message: result.error || "No se pudo abrir WhatsApp.", tone: "error" });
              return false;
            }
            try {
              await Promise.all([
                ReminderRepository.create({
                  contactId: recipient.contact?.id,
                  phoneE164: recipient.phoneE164,
                  title: `Cita con ${recipient.name}`,
                  description: [
                    appointment.service ? `Servicio: ${appointment.service}` : null,
                    appointment.professional ? `Profesional: ${appointment.professional}` : null,
                    `Lugar: ${appointment.address}`,
                    preparedMessage
                  ].filter(Boolean).join("\n"),
                  scheduledAt: appointment.scheduledAt
                }),
                MessageTemplateRepository.recordUse(template.id),
                HistoryRepository.logAction({
                  phoneE164: recipient.phoneE164,
                  phoneFormatted: recipient.phoneFormatted,
                  countryCode: recipient.contact?.countryCode ?? parsedPhone.countryCode,
                  countryIso: recipient.contact?.countryIso ?? parsedPhone.countryIso,
                  name: recipient.name,
                  actionType: "whatsapp_message",
                  metadata: `Cita: ${appointment.dateLabel}, ${appointment.time}`
                })
              ]);
              await homeData.reload();
              showToast({ message: `Cita guardada para ${recipient.name}.`, tone: "success" });
            } catch {
              showToast({ message: "WhatsApp se abrió, pero no se pudo guardar la cita localmente.", tone: "error" });
            }
            return true;
          }}
        />
      )}
      <VipBenefitsModal
        visible={vipModalVisible}
        active={appMode === "vip"}
        colors={colors}
        onClose={() => setVipModalVisible(false)}
        onActivate={() => setAppMode("vip")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: spacing.xxs,
    paddingBottom: spacing.lg
  },

});
