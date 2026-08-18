import { Archive, RotateCcw, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import type { ThemeColors } from "../../theme/colors";
import { BackupFormatModal } from "./BackupFormatModal";
import { SettingsRow, SettingsSection } from "./SettingsSection";

interface DataBackupSettingsProps {
  colors: ThemeColors;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: () => void;
  onClearData: () => void;
}

export function DataBackupSettings({
  colors,
  onExportJson,
  onExportCsv,
  onImportJson,
  onClearData
}: DataBackupSettingsProps) {
  const [formatVisible, setFormatVisible] = useState(false);

  return (
    <>
      <SettingsSection title="DATOS Y RESPALDO" colors={colors}>
        <SettingsRow
          icon={Archive}
          title="Crear respaldo"
          subtitle="Elige entre respaldo completo JSON o agenda CSV"
          colors={colors}
          onPress={() => setFormatVisible(true)}
        />
        <SettingsRow
          icon={RotateCcw}
          title="Restaurar respaldo"
          subtitle="Importar un respaldo completo en formato JSON"
          colors={colors}
          onPress={onImportJson}
        />
        <SettingsRow
          icon={Trash2}
          title="Eliminar todos los datos"
          subtitle="Borrar agenda, historial y recordatorios locales"
          colors={colors}
          onPress={onClearData}
          danger
          last
        />
      </SettingsSection>

      <BackupFormatModal
        visible={formatVisible}
        colors={colors}
        onClose={() => setFormatVisible(false)}
        onJson={onExportJson}
        onCsv={onExportCsv}
      />
    </>
  );
}
