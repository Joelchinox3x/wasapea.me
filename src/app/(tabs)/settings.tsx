import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppearanceSettings } from "../../components/settings/AppearanceSettings";
import { AppVersionSettings } from "../../components/settings/AppVersionSettings";
import { BackupImportModal } from "../../components/settings/BackupImportModal";

import { DataBackupSettings } from "../../components/settings/DataBackupSettings";
import { PreferencesSettings } from "../../components/settings/PreferencesSettings";
import { PrivacyAboutSettings } from "../../components/settings/PrivacyAboutSettings";
import { StatisticsSettings } from "../../components/settings/StatisticsSettings";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { CountrySelectorModal } from "../../components/CountrySelectorModal";
import { VipBenefitsModal } from "../../components/VipBenefitsModal";
import { APP_NAME } from "../../constants/app";
import { useDeveloperEasterEgg } from "../../hooks/useDeveloperEasterEgg";
import { useSettingsActions } from "../../hooks/useSettingsActions";
import { hasProAccess, useAppStore } from "../../store/useAppStore";
import { darkColors, lightColors } from "../../theme/colors";
import { fonts, spacing } from "../../theme/designSystem";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const {
    themeMode,
    setThemeMode,
    appMode,
    setAppMode,
    showModeSwitch,
    setShowModeSwitch,
    selectedCountry,
    setSelectedCountry,
    autoDetectClipboard,
    setAutoDetectClipboard,
    logHistoryEnabled,
    setLogHistoryEnabled,
    showNotice
  } = useAppStore();
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [confirmClearDataVisible, setConfirmClearDataVisible] = useState(false);
  const [vipModalVisible, setVipModalVisible] = useState(false);
  const {
    stats,
    backupCandidate,
    importing,
    exportJson,
    exportCsv,
    selectBackup,
    importBackup,
    cancelImport,
    clearAllData
  } = useSettingsActions({ appMode, showNotice });
  const { countdown, handleTap } = useDeveloperEasterEgg({ showNotice });

  const changeModeSwitchVisibility = (visible: boolean) => {
    setShowModeSwitch(visible);
    if (!visible) {
      showNotice({
        title: "Selector oculto",
        message: "Puedes volver a mostrarlo en Ajustes, dentro de Versión de la aplicación.",
        tone: "info"
      });
    }
  };

  const confirmClearData = async () => {
    try {
      await clearAllData();
      setConfirmClearDataVisible(false);
      showNotice({
        title: "Limpieza completa",
        message: "Contactos, historial y recordatorios locales fueron eliminados.",
        tone: "success"
      });
    } catch (error) {
      showNotice({
        title: "No se pudo completar la limpieza",
        message: error instanceof Error ? error.message : "Inténtalo nuevamente.",
        tone: "error"
      });
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>Ajustes</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Configura tu experiencia en {APP_NAME}</Text>
        </View>

        <AppVersionSettings
          appMode={appMode}
          showModeSwitch={showModeSwitch}
          colors={colors}
          onModeChange={setAppMode}
          onVisibilityChange={changeModeSwitchVisibility}
          onVipPress={() => setVipModalVisible(true)}
        />

        {hasProAccess(appMode) && stats && <StatisticsSettings stats={stats} colors={colors} />}

        <PreferencesSettings
          colors={colors}
          country={selectedCountry}
          autoDetectClipboard={autoDetectClipboard}
          logHistoryEnabled={logHistoryEnabled}
          onCountryPress={() => setCountryModalVisible(true)}
          onAutoDetectChange={setAutoDetectClipboard}
          onLogHistoryChange={setLogHistoryEnabled}
        />

        <AppearanceSettings mode={themeMode} colors={colors} onChange={setThemeMode} />


        {hasProAccess(appMode) && (
          <DataBackupSettings
            colors={colors}
            onExportJson={() => void exportJson()}
            onExportCsv={() => void exportCsv()}
            onImportJson={() => void selectBackup()}
            onClearData={() => setConfirmClearDataVisible(true)}
          />
        )}

        <PrivacyAboutSettings colors={colors} countdown={countdown} onVersionTap={handleTap} />
      </ScrollView>

      <CountrySelectorModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSelectCountry={setSelectedCountry}
        selectedIso={selectedCountry.iso}
        isDark={isDark}
      />
      <ConfirmationModal
        visible={confirmClearDataVisible}
        title="¿Eliminar TODOS los datos?"
        message="Se eliminarán permanentemente tu historial, contactos y recordatorios locales."
        confirmText="Sí, eliminar todo"
        cancelText="Cancelar"
        isDanger
        onConfirm={() => void confirmClearData()}
        onCancel={() => setConfirmClearDataVisible(false)}
        isDark={isDark}
      />
      <BackupImportModal
        candidate={backupCandidate}
        colors={colors}
        importing={importing}
        onCancel={cancelImport}
        onConfirm={() => void importBackup()}
      />
      <VipBenefitsModal
        visible={vipModalVisible}
        active={appMode === "vip"}
        onClose={() => setVipModalVisible(false)}
        onActivate={() => setAppMode("vip")}
        colors={colors}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl
  },
  header: {
    marginBottom: spacing.md
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2
  }
});
