import { Bot, CheckCircle2, Database, KeyRound, Link2, LogOut, Plus, RotateCcw, Send, ShieldCheck, Trash2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { BotAdminService, type BotRule, type BotStatus } from "../../services/BotAdminService";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { ScalePressable } from "../ScalePressable";
import { SettingsRow, SettingsSection } from "./SettingsSection";

interface AutoResponderSettingsModalProps {
  colors: ThemeColors;
}

interface SimulatorMessage {
  id: string;
  role: "user" | "bot";
  text: string;
}

const createSimulationId = () => `wasapeame-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const missingLabel: Record<string, string> = {
  META_ACCESS_TOKEN: "Token permanente de Meta",
  META_PHONE_NUMBER_ID: "Phone Number ID",
  META_APP_SECRET: "App Secret renovado",
  META_WABA_ID: "WhatsApp Business Account ID",
  META_VERIFY_TOKEN: "Token de verificación"
};

export function AutoResponderSettingsModal({ colors }: AutoResponderSettingsModalProps) {
  const [visible, setVisible] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [connectedToken, setConnectedToken] = useState("");
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [rules, setRules] = useState<BotRule[]>([]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [simulationId, setSimulationId] = useState(createSimulationId);
  const [simulationInput, setSimulationInput] = useState("");
  const [simulationMessages, setSimulationMessages] = useState<SimulatorMessage[]>([]);
  const [simulationOptions, setSimulationOptions] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (token: string) => {
    const [nextStatus, nextRules] = await Promise.all([
      BotAdminService.getStatus(token),
      BotAdminService.getRules(token)
    ]);
    setStatus(nextStatus);
    setRules(nextRules);
    setConnectedToken(token);
  }, []);

  useEffect(() => {
    void (async () => {
      const stored = await BotAdminService.getStoredAdminToken();
      if (!stored) return;
      try {
        await refresh(stored);
      } catch {
        await BotAdminService.clearAdminToken();
      }
    })();
  }, [refresh]);

  const connect = async () => {
    const code = pairingCode.trim();
    if (!/^\d{6}$/.test(code)) return;
    setLoading(true);
    setError("");
    try {
      const token = await BotAdminService.pairDevice(code);
      await refresh(token);
      await BotAdminService.storeAdminToken(token);
      setPairingCode("");
    } catch (cause) {
      setConnectedToken("");
      setStatus(null);
      setError(cause instanceof Error ? cause.message : "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    await BotAdminService.clearAdminToken();
    setPairingCode("");
    setConnectedToken("");
    setStatus(null);
    setRules([]);
    setError("");
    resetSimulation();
  };

  const saveRules = async (nextRules: BotRule[]) => {
    if (!connectedToken) return;
    setLoading(true);
    setError("");
    try {
      const saved = await BotAdminService.saveRules(connectedToken, nextRules);
      setRules(saved);
      setStatus((current) => current ? { ...current, rulesCount: saved.length } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron guardar las reglas.");
    } finally {
      setLoading(false);
    }
  };

  const setBotEnabled = async (enabled: boolean) => {
    if (!connectedToken || !status) return;
    setLoading(true);
    setError("");
    try {
      const savedEnabled = await BotAdminService.setEnabled(connectedToken, enabled);
      setStatus({ ...status, enabled: savedEnabled });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar el estado del bot.");
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    if (!newTrigger.trim() || !newResponse.trim()) return;
    const nextRules: BotRule[] = [...rules, {
      id: `rule-custom-${Date.now()}`,
      trigger: newTrigger.trim(),
      matchType: "exact",
      responseMessage: newResponse.trim(),
      enabled: true,
      createdAt: new Date().toISOString()
    }];
    await saveRules(nextRules);
    setNewTrigger("");
    setNewResponse("");
  };

  const simulate = async (selectedMessage?: string) => {
    const message = (selectedMessage ?? simulationInput).trim();
    if (!connectedToken || !message || loading) return;
    const userMessage: SimulatorMessage = { id: `user-${Date.now()}`, role: "user", text: message };
    setSimulationMessages((current) => [...current, userMessage].slice(-30));
    setSimulationInput("");
    setSimulationOptions([]);
    setLoading(true);
    setError("");
    try {
      const result = await BotAdminService.simulate(connectedToken, simulationId, message);
      const timestamp = Date.now();
      setSimulationMessages((current) => [
        ...current,
        ...result.replies.map((text, index): SimulatorMessage => ({
          id: `bot-${timestamp}-${index}`,
          role: "bot",
          text
        }))
      ].slice(-30));
      setSimulationOptions(result.options);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo ejecutar la prueba.");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setSimulationId(createSimulationId());
    setSimulationInput("");
    setSimulationMessages([]);
    setSimulationOptions([]);
  };

  const rowValue = status?.ready
    ? (status.enabled ? "Activo" : "Pausado")
    : connectedToken ? "Falta Meta" : "Configurar";

  return (
    <>
      <SettingsSection title="AUTOMATIZACIÓN" colors={colors}>
        <SettingsRow
          icon={Bot}
          title="Auto-Responder 24/7"
          subtitle="WhatsApp Cloud API oficial"
          value={rowValue}
          colors={colors}
          onPress={() => setVisible(true)}
          last
        />
      </SettingsSection>

      <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}1F` }]}>
                <Bot size={22} color={colors.primary} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: colors.text }]}>Auto-Responder 24/7</Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]}>Servidor privado + API oficial de Meta</Text>
              </View>
              <ScalePressable onPress={() => setVisible(false)} style={[styles.closeButton, { backgroundColor: colors.badgeBg }]}>
                <X size={18} color={colors.subtext} />
              </ScalePressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: `${colors.error}18`, borderColor: `${colors.error}55` }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}

              {!connectedToken ? (
                <View style={[styles.connectCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                  <KeyRound size={24} color={colors.primary} />
                  <Text style={[styles.connectTitle, { color: colors.text }]}>Vincular este dispositivo</Text>
                  <Text style={[styles.connectCopy, { color: colors.subtext }]}>
                    Escribe el código de 6 dígitos generado por el administrador. Vence en 5 minutos y solo funciona una vez.
                  </Text>
                  <TextInput
                    value={pairingCode}
                    onChangeText={(value) => setPairingCode(value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    placeholderTextColor={colors.subtext}
                    keyboardType="number-pad"
                    maxLength={6}
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    style={[styles.codeInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                  />
                  <ScalePressable
                    onPress={() => void connect()}
                    disabled={loading || pairingCode.length !== 6}
                    style={[styles.primaryButton, { backgroundColor: colors.primary }, (loading || pairingCode.length !== 6) && styles.disabled]}
                  >
                    {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <ShieldCheck size={17} color="#FFFFFF" />}
                    <Text style={styles.primaryButtonText}>Vincular dispositivo</Text>
                  </ScalePressable>
                </View>
              ) : status ? (
                <>
                  <View style={[styles.statusBox, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                    <View style={styles.statusLeft}>
                      {status.ready ? <CheckCircle2 size={21} color="#10B981" /> : <ShieldCheck size={21} color="#F59E0B" />}
                      <View style={styles.flexCopy}>
                        <Text style={[styles.statusTitle, { color: colors.text }]}>{status.ready ? "Meta conectado" : "Servidor conectado"}</Text>
                        <Text style={[styles.statusSubtitle, { color: colors.subtext }]}>
                          {status.ready
                            ? `${status.machinery?.businessName || "Asistente comercial"} · listo para responder`
                            : "Faltan credenciales de Meta en el servidor"}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={status.enabled}
                      onValueChange={(value) => void setBotEnabled(value)}
                      disabled={loading}
                      trackColor={{ false: colors.cardBorder, true: `${colors.primary}77` }}
                      thumbColor={status.enabled ? colors.primary : "#94A3B8"}
                    />
                  </View>

                  <View style={[styles.integrationCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                    <View style={[styles.integrationIcon, { backgroundColor: `${colors.primary}1F` }]}>
                      <Database size={18} color={colors.primary} />
                    </View>
                    <View style={styles.flexCopy}>
                      <Text style={[styles.statusTitle, { color: colors.text }]}>Catálogo Proforma</Text>
                      <Text style={[styles.statusSubtitle, { color: colors.subtext }]}>
                        {status.machinery?.catalogConfigured
                          ? "Conectado: productos, precios y solicitudes en vivo"
                          : "La conexión privada del catálogo está pendiente"}
                      </Text>
                    </View>
                    <View style={[styles.integrationBadge, { backgroundColor: status.machinery?.catalogConfigured ? "#10B98120" : "#F59E0B20" }]}>
                      <Text style={[styles.integrationBadgeText, { color: status.machinery?.catalogConfigured ? "#10B981" : "#F59E0B" }]}>
                        {status.machinery?.catalogConfigured ? "ACTIVO" : "PENDIENTE"}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.webhookCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                    <View style={styles.webhookTitleRow}>
                      <Link2 size={17} color={colors.primary} />
                      <Text style={[styles.sectionLabel, { color: colors.text }]}>Webhook de Meta</Text>
                    </View>
                    <Text selectable style={[styles.webhookUrl, { color: colors.primary }]}>{status.webhookUrl}</Text>
                    <Text style={[styles.hint, { color: colors.subtext }]}>Graph API {status.graphVersion} · suscripción requerida: messages</Text>
                  </View>

                  {!status.ready ? (
                    <View style={[styles.missingCard, { backgroundColor: "#F59E0B14", borderColor: "#F59E0B55" }]}>
                      <Text style={styles.missingTitle}>Falta configurar en el servidor:</Text>
                      {status.missingCredentials.map((item) => (
                        <Text key={item} style={[styles.missingItem, { color: colors.text }]}>• {missingLabel[item] ?? item}</Text>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.simulatorHeader}>
                    <View>
                      <Text style={[styles.sectionTitle, { color: colors.subtext }]}>PROBAR ASISTENTE</Text>
                      <Text style={[styles.simulatorHint, { color: colors.subtext }]}>Simula WhatsApp sin enviar mensajes ni crear leads reales.</Text>
                    </View>
                    <ScalePressable onPress={resetSimulation} style={[styles.resetButton, { backgroundColor: colors.badgeBg }]}>
                      <RotateCcw size={15} color={colors.subtext} />
                    </ScalePressable>
                  </View>

                  <View style={[styles.simulatorCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                    {simulationMessages.length === 0 ? (
                      <View style={styles.simulatorEmpty}>
                        <Bot size={25} color={colors.primary} />
                        <Text style={[styles.simulatorEmptyTitle, { color: colors.text }]}>Prueba el flujo comercial</Text>
                        <Text style={[styles.simulatorHint, { color: colors.subtext }]}>Escribe “Hola” o inicia directamente el menú.</Text>
                        <ScalePressable onPress={() => void simulate("hola")} disabled={loading} style={[styles.startTestButton, { borderColor: colors.primary }]}>
                          <Text style={[styles.startTestText, { color: colors.primary }]}>Iniciar prueba</Text>
                        </ScalePressable>
                      </View>
                    ) : (
                      <View style={styles.simulatorMessages}>
                        {simulationMessages.map((message) => (
                          <View
                            key={message.id}
                            style={[
                              styles.simulatorBubble,
                              message.role === "user" ? styles.userBubble : styles.botBubble,
                              { backgroundColor: message.role === "user" ? `${colors.primary}25` : colors.card, borderColor: colors.cardBorder }
                            ]}
                          >
                            <Text style={[styles.simulatorBubbleText, { color: colors.text }]}>{message.text}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {simulationOptions.length > 0 ? (
                      <View style={styles.simulationOptions}>
                        {simulationOptions.map((option) => (
                          <ScalePressable
                            key={option.id}
                            onPress={() => void simulate(option.id)}
                            disabled={loading}
                            style={[styles.optionChip, { borderColor: colors.primary, backgroundColor: `${colors.primary}12` }]}
                          >
                            <Text style={[styles.optionChipText, { color: colors.primary }]}>{option.title}</Text>
                          </ScalePressable>
                        ))}
                      </View>
                    ) : null}

                    <View style={styles.simulatorComposer}>
                      <TextInput
                        value={simulationInput}
                        onChangeText={setSimulationInput}
                        placeholder="Escribe como cliente..."
                        placeholderTextColor={colors.subtext}
                        onSubmitEditing={() => void simulate()}
                        returnKeyType="send"
                        style={[styles.simulatorInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                      />
                      <ScalePressable
                        onPress={() => void simulate()}
                        disabled={loading || !simulationInput.trim()}
                        style={[styles.sendButton, { backgroundColor: colors.primary }, (loading || !simulationInput.trim()) && styles.disabled]}
                      >
                        {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Send size={17} color="#FFFFFF" />}
                      </ScalePressable>
                    </View>
                  </View>

                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>RESPUESTAS ADICIONALES</Text>
                    <Text style={[styles.simulatorHint, { color: colors.subtext }]}>Se usan cuando el mensaje no pertenece al menú comercial.</Text>
                  </View>
                  {rules.map((rule) => (
                    <View key={rule.id} style={[styles.ruleCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                      <View style={styles.ruleHeader}>
                        <Text style={[styles.ruleTrigger, { color: colors.primary }]}>Si escribe: “{rule.trigger}”</Text>
                        <View style={styles.ruleActions}>
                          <Switch
                            value={rule.enabled}
                            disabled={loading}
                            onValueChange={(enabled) => void saveRules(rules.map((item) => item.id === rule.id ? { ...item, enabled } : item))}
                            trackColor={{ false: colors.cardBorder, true: `${colors.primary}77` }}
                            thumbColor={rule.enabled ? colors.primary : "#94A3B8"}
                          />
                          <Pressable disabled={loading} onPress={() => void saveRules(rules.filter((item) => item.id !== rule.id))} hitSlop={6}>
                            <Trash2 size={17} color={colors.error} />
                          </Pressable>
                        </View>
                      </View>
                      <Text style={[styles.ruleResponseText, { color: colors.text }]}>{rule.responseMessage}</Text>
                    </View>
                  ))}

                  <View style={[styles.addCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.sectionLabel, { color: colors.primary }]}>AGREGAR REGLA</Text>
                    <TextInput
                      value={newTrigger}
                      onChangeText={setNewTrigger}
                      placeholder="Palabra o número: 4, catálogo..."
                      placeholderTextColor={colors.subtext}
                      style={[styles.ruleInput, { color: colors.text, borderColor: colors.cardBorder }]}
                    />
                    <TextInput
                      value={newResponse}
                      onChangeText={setNewResponse}
                      placeholder="Respuesta automática"
                      placeholderTextColor={colors.subtext}
                      multiline
                      style={[styles.ruleTextArea, { color: colors.text, borderColor: colors.cardBorder }]}
                    />
                    <ScalePressable
                      onPress={() => void addRule()}
                      disabled={loading || !newTrigger.trim() || !newResponse.trim()}
                      style={[styles.primaryButton, { backgroundColor: colors.primary }, (loading || !newTrigger.trim() || !newResponse.trim()) && styles.disabled]}
                    >
                      {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Plus size={16} color="#FFFFFF" />}
                      <Text style={styles.primaryButtonText}>Guardar regla en el servidor</Text>
                    </ScalePressable>
                  </View>

                  <ScalePressable onPress={() => void disconnect()} style={[styles.disconnectButton, { borderColor: colors.cardBorder }]}>
                    <LogOut size={16} color={colors.subtext} />
                    <Text style={[styles.disconnectText, { color: colors.subtext }]}>Desvincular esta aplicación</Text>
                  </ScalePressable>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(2, 6, 23, 0.78)", justifyContent: "flex-end" },
  card: { width: "100%", maxHeight: "90%", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  headerIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1 },
  title: { fontFamily: fonts.displayBold, fontSize: 19 },
  subtitle: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 1 },
  closeButton: { width: 36, height: 36, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  scrollContent: { gap: spacing.sm, paddingBottom: spacing.lg },
  errorBox: { borderRadius: radius.md, borderWidth: 1, padding: spacing.sm },
  errorText: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, lineHeight: 17 },
  connectCard: { alignItems: "center", padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
  connectTitle: { fontFamily: fonts.displayBold, fontSize: 16 },
  connectCopy: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, textAlign: "center" },
  codeInput: { alignSelf: "stretch", minHeight: 52, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, fontFamily: fonts.displayBold, fontSize: 24, letterSpacing: 8, textAlign: "center" },
  primaryButton: { minHeight: 42, alignSelf: "stretch", borderRadius: radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  primaryButtonText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 13 },
  disabled: { opacity: 0.5 },
  statusBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1 },
  statusLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  flexCopy: { flex: 1 },
  statusTitle: { fontFamily: fonts.bodySemiBold, fontSize: 13.5 },
  statusSubtitle: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 1 },
  integrationCard: { flexDirection: "row", alignItems: "center", gap: spacing.xs, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  integrationIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  integrationBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  integrationBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.6 },
  webhookCard: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: 5 },
  webhookTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 12.5 },
  webhookUrl: { fontFamily: fonts.bodySemiBold, fontSize: 12, lineHeight: 17 },
  hint: { fontFamily: fonts.body, fontSize: 10.5 },
  missingCard: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: 4 },
  missingTitle: { color: "#F59E0B", fontFamily: fonts.bodySemiBold, fontSize: 12.5, marginBottom: 2 },
  missingItem: { fontFamily: fonts.body, fontSize: 12 },
  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.8, marginTop: spacing.xs },
  simulatorHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  simulatorHint: { fontFamily: fonts.body, fontSize: 10.5, lineHeight: 15, marginTop: 2 },
  resetButton: { width: 32, height: 32, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  simulatorCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.sm, gap: spacing.sm },
  simulatorEmpty: { alignItems: "center", gap: 5, paddingVertical: spacing.sm },
  simulatorEmptyTitle: { fontFamily: fonts.displayBold, fontSize: 14 },
  startTestButton: { minHeight: 34, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", marginTop: 4 },
  startTestText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
  simulatorMessages: { gap: 6 },
  simulatorBubble: { maxWidth: "88%", borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 8 },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  botBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  simulatorBubbleText: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16 },
  simulationOptions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  optionChip: { minHeight: 32, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  optionChipText: { fontFamily: fonts.bodySemiBold, fontSize: 10.5 },
  simulatorComposer: { flexDirection: "row", alignItems: "center", gap: 7 },
  simulatorInput: { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.sm, fontFamily: fonts.body, fontSize: 12.5 },
  sendButton: { width: 42, height: 42, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  ruleCard: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs },
  ruleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ruleTrigger: { flex: 1, fontFamily: fonts.displayBold, fontSize: 12.5 },
  ruleActions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  ruleResponseText: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  addCard: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs, marginTop: spacing.xs },
  ruleInput: { minHeight: 40, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.xs, fontFamily: fonts.body, fontSize: 12.5 },
  ruleTextArea: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 8, minHeight: 68, fontFamily: fonts.body, fontSize: 12.5, textAlignVertical: "top" },
  disconnectButton: { minHeight: 40, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  disconnectText: { fontFamily: fonts.bodySemiBold, fontSize: 12 }
});
