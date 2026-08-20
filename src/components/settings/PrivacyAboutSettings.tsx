import { ShieldCheck, Smartphone, Sparkles, UserCheck, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { APP_BUILD, APP_NAME, APP_VERSION, OTA_REVISION } from "../../constants/app";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";
import { WasapeameSymbolIcon } from "../icons/AppSvgIcons";
import { SettingsRow, SettingsSection } from "./SettingsSection";

interface PrivacyAboutSettingsProps {
  colors: ThemeColors;
  countdown: number | null;
  onVersionTap: () => void;
}

const TESTERS = [
  { name: "Cesar Choy (MoneyMaker)", badge: "Tester iPhone 17", platform: "iOS" },
  { name: "Julio Chacon (Venekito)", badge: "Tester Android", platform: "Android" },
  { name: "Larry Brown (Santa Mafia)", badge: "Tester Android", platform: "Android" },
  { name: "Ivan Soto", badge: "Tester Android", platform: "Android" }
];

export function PrivacyAboutSettings({ colors, countdown, onVersionTap }: PrivacyAboutSettingsProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SettingsSection title="PRIVACIDAD" colors={colors}>
        <SettingsRow
          icon={ShieldCheck}
          title="Privacidad y seguridad"
          subtitle="Tu agenda, notas e historial permanecen dentro del dispositivo y no se envían a servidores externos."
          colors={colors}
          last
        />
      </SettingsSection>

      <SettingsSection title="ACERCA" colors={colors}>
        <SettingsRow
          icon={WasapeameSymbolIcon}
          title="Acerca del autor y equipo"
          subtitle={`Creador, diseñador lead y equipo de testers oficiales de ${APP_NAME}.`}
          colors={colors}
          onPress={() => setModalVisible(true)}
          last
        />
      </SettingsSection>

      <TouchableOpacity
        style={styles.footer}
        onPress={onVersionTap}
        activeOpacity={1}
        accessibilityLabel={`${APP_NAME}, versión ${APP_VERSION}, build ${APP_BUILD}`}
      >
        <Text style={[styles.footerName, { color: colors.text }]}>{APP_NAME}</Text>
        <Text style={[styles.footerVersion, { color: colors.subtext }]}>
          Versión {APP_VERSION} · Build {APP_BUILD}
        </Text>
        {OTA_REVISION && <Text style={[styles.otaRevision, { color: colors.primary }]}>Actualización OTA #{OTA_REVISION}</Text>}
        {countdown !== null && (
          <Text style={[styles.countdown, { color: colors.primary }]}>
            Faltan {countdown} {countdown === 1 ? "toque" : "toques"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Author & Testers Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={styles.titleGroup}>
                <WasapeameSymbolIcon size={20} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Créditos y Equipo</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Lead Creator & Designer Section */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Sparkles size={14} color={colors.primary} />
                  <Text style={[styles.sectionHeading, { color: colors.primary }]}>CREADOR & DISEÑADOR LEAD</Text>
                </View>
                <View style={[styles.authorCard, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "33" }]}>
                  <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.authorAvatarText}>👑</Text>
                  </View>
                  <View style={styles.authorInfo}>
                    <Text style={[styles.authorName, { color: colors.text }]}>Joe (Admin)</Text>
                    <Text style={[styles.authorRole, { color: colors.primary }]}>
                      Creador, Diseñador Lead & Desarrollador Principal
                    </Text>
                    <Text style={[styles.authorBio, { color: colors.subtext }]}>
                      Diseño visual, arquitectura y desarrollo de {APP_NAME}.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Testers Section */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <UserCheck size={14} color={colors.accent} />
                  <Text style={[styles.sectionHeading, { color: colors.accent }]}>EQUIPO DE TESTERS OFICIALES</Text>
                </View>

                <View style={styles.testersGrid}>
                  {TESTERS.map((tester, idx) => (
                    <View
                      key={idx}
                      style={[styles.testerCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                    >
                      <View style={[styles.testerBadgeIcon, { backgroundColor: colors.accent + "1F" }]}>
                        <Smartphone size={13} color={colors.accent} />
                      </View>
                      <View style={styles.testerInfo}>
                        <Text style={[styles.testerName, { color: colors.text }]} numberOfLines={1}>
                          {tester.name}
                        </Text>
                        <View style={[styles.testerTag, { backgroundColor: colors.cardBorder + "66" }]}>
                          <Text style={[styles.testerTagText, { color: colors.subtext }]}>{tester.badge}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    marginVertical: 4
  },
  footerName: {
    fontFamily: fonts.displayBold,
    fontSize: 16
  },
  footerVersion: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2
  },
  otaRevision: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    marginTop: 3
  },
  countdown: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    marginTop: spacing.xs
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md
  },
  backdrop: {
    ...StyleSheet.absoluteFill
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17
  },
  closeBtn: {
    padding: 4
  },
  modalScroll: {
    gap: spacing.md,
    paddingVertical: 4
  },
  sectionBlock: {
    gap: 6
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  sectionHeading: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 12,
    gap: 12
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  authorAvatarText: {
    fontSize: 22
  },
  authorInfo: {
    flex: 1
  },
  authorName: {
    fontFamily: fonts.displayBold,
    fontSize: 15
  },
  authorRole: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    marginTop: 1
  },
  authorBio: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    marginTop: 2
  },
  testersGrid: {
    gap: 6
  },
  testerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10
  },
  testerBadgeIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  testerInfo: {
    flex: 1
  },
  testerName: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 12.5
  },
  testerTag: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2
  },
  testerTagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5
  }
});
