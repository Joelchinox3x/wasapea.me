import { ShieldCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { APP_BUILD, APP_NAME, APP_VERSION, OTA_REVISION } from "../../constants/app";
import type { ThemeColors } from "../../theme/colors";
import { fonts, spacing } from "../../theme/designSystem";
import { SettingsRow, SettingsSection } from "./SettingsSection";
import { WasapeameSymbolIcon } from "../icons/AppSvgIcons";

interface PrivacyAboutSettingsProps {
  colors: ThemeColors;
  countdown: number | null;
  onVersionTap: () => void;
}

export function PrivacyAboutSettings({ colors, countdown, onVersionTap }: PrivacyAboutSettingsProps) {
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
          title="Acerca del autor"
          subtitle={`Desarrollado por Joe · Diseño, desarrollo y producto de ${APP_NAME}.`}
          colors={colors}
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
  }
});
