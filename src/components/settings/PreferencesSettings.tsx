import { ClipboardPaste, Globe2, History } from "lucide-react-native";
import React from "react";
import { Switch } from "react-native";
import type { CountryItem } from "../../constants/app";
import type { ThemeColors } from "../../theme/colors";
import { SettingsRow, SettingsSection } from "./SettingsSection";

interface PreferencesSettingsProps {
  colors: ThemeColors;
  country: CountryItem;
  autoDetectClipboard: boolean;
  logHistoryEnabled: boolean;
  onCountryPress: () => void;
  onAutoDetectChange: (enabled: boolean) => void;
  onLogHistoryChange: (enabled: boolean) => void;
}

export function PreferencesSettings({
  colors,
  country,
  autoDetectClipboard,
  logHistoryEnabled,
  onCountryPress,
  onAutoDetectChange,
  onLogHistoryChange
}: PreferencesSettingsProps) {
  return (
    <SettingsSection title="PREFERENCIAS" colors={colors}>
      <SettingsRow
        icon={Globe2}
        title="País predeterminado"
        subtitle={`${country.flag} ${country.name} (${country.code})`}
        colors={colors}
        onPress={onCountryPress}
      />
      <SettingsRow
        icon={ClipboardPaste}
        title="Detectar portapapeles"
        subtitle="Sugerir números copiados al abrir la aplicación"
        colors={colors}
        trailing={
          <Switch
            value={autoDetectClipboard}
            onValueChange={onAutoDetectChange}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        }
      />
      <SettingsRow
        icon={History}
        title="Registrar historial"
        subtitle="Guardar búsquedas y acciones en el historial local"
        colors={colors}
        trailing={
          <Switch
            value={logHistoryEnabled}
            onValueChange={onLogHistoryChange}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        }
        last
      />
    </SettingsSection>
  );
}
