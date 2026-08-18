import { Check, ChevronDown, ChevronUp, Link2, LocateFixed, MapPin, Pencil, Plus, Star, Trash2, Video, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type {
  CreateSavedAppointmentLocationParams,
  SavedAppointmentLocation,
  SavedAppointmentLocationKind
} from "../../domain/models";
import { SavedAppointmentLocationRepository } from "../../repositories/SavedAppointmentLocationRepository";
import { LocationShareService } from "../../services/LocationShareService";
import type { ThemeColors } from "../../theme/colors";
import { fonts, radius, spacing } from "../../theme/designSystem";

interface AppointmentLocationFieldProps {
  colors: ThemeColors;
  value: string;
  onChange: (value: string) => void;
}

interface PlaceDraft {
  id: string | null;
  name: string;
  address: string;
  mapUrl: string;
  kind: SavedAppointmentLocationKind;
  isDefault: boolean;
}

const EMPTY_DRAFT: PlaceDraft = {
  id: null,
  name: "",
  address: "",
  mapUrl: "",
  kind: "physical",
  isDefault: false
};

function locationMessageValue(location: SavedAppointmentLocation): string {
  const lines = [location.name, location.address, location.mapUrl].filter((item, index, values) =>
    Boolean(item) && values.indexOf(item) === index
  );
  return lines.join("\n");
}

function toDraft(location: SavedAppointmentLocation): PlaceDraft {
  return {
    id: location.id,
    name: location.name,
    address: location.address ?? "",
    mapUrl: location.mapUrl ?? "",
    kind: location.kind,
    isDefault: location.isDefault === 1
  };
}

export function AppointmentLocationField({ colors, value, onChange }: AppointmentLocationFieldProps) {
  const [locations, setLocations] = useState<SavedAppointmentLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [draft, setDraft] = useState<PlaceDraft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState<"save" | "gps" | "delete" | null>(null);
  const [error, setError] = useState("");

  const loadLocations = useCallback(async (selectDefault = false) => {
    try {
      const rows = await SavedAppointmentLocationRepository.getAll();
      setLocations(rows);
      if (selectDefault && !value.trim()) {
        const defaultLocation = rows.find((item) => item.isDefault === 1);
        if (defaultLocation) {
          setSelectedId(defaultLocation.id);
          onChange(locationMessageValue(defaultLocation));
        }
      }
    } catch {
      setError("No se pudieron cargar tus lugares guardados.");
    }
  }, [onChange, value]);

  useEffect(() => {
    let active = true;
    void SavedAppointmentLocationRepository.getAll()
      .then((rows) => {
        if (!active) return;
        setLocations(rows);
        if (!value.trim()) {
          const defaultLocation = rows.find((item) => item.isDefault === 1);
          if (defaultLocation) {
            setSelectedId(defaultLocation.id);
            onChange(locationMessageValue(defaultLocation));
          }
        }
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar tus lugares guardados.");
      });
    return () => {
      active = false;
    };
  }, [onChange, value]);

  const selectedLocation = locations.find((item) => item.id === selectedId) ?? null;

  const chooseLocation = (location: SavedAppointmentLocation) => {
    setSelectedId(location.id);
    onChange(locationMessageValue(location));
    setSelectorOpen(false);
    setManualOpen(false);
    setEditorOpen(false);
    setError("");
  };

  const openNew = (initial?: Partial<PlaceDraft>) => {
    setDraft({ ...EMPTY_DRAFT, ...initial });
    setEditorOpen(true);
    setSelectorOpen(false);
    setManualOpen(false);
    setError("");
  };

  const saveDraft = async () => {
    if (busy) return;
    setBusy("save");
    setError("");
    try {
      const params: CreateSavedAppointmentLocationParams = {
        name: draft.name,
        address: draft.address,
        mapUrl: draft.mapUrl,
        kind: draft.kind,
        isDefault: draft.isDefault
      };
      const saved = draft.id
        ? await SavedAppointmentLocationRepository.update(draft.id, params)
        : await SavedAppointmentLocationRepository.create(params);
      if (!saved) throw new Error("El lugar ya no existe.");
      await loadLocations();
      chooseLocation(saved);
      setEditorOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el lugar.");
    } finally {
      setBusy(null);
    }
  };

  const obtainCurrentLocation = async () => {
    if (busy) return;
    setBusy("gps");
    setError("");
    try {
      const payload = await LocationShareService.getCurrentLocationMessage();
      openNew({
        name: "Mi ubicación",
        address: "Ubicación obtenida por GPS",
        mapUrl: payload.mapUrl,
        kind: "physical"
      });
    } catch (locationError) {
      setError(locationError instanceof Error ? locationError.message : "No se pudo obtener la ubicación.");
    } finally {
      setBusy(null);
    }
  };

  const deleteLocation = async (location: SavedAppointmentLocation) => {
    if (busy) return;
    setBusy("delete");
    try {
      await SavedAppointmentLocationRepository.delete(location.id);
      if (selectedId === location.id) {
        setSelectedId(null);
        onChange("");
      }
      await loadLocations();
    } catch {
      setError("No se pudo eliminar el lugar.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: colors.subtext }]}>LUGAR DE LA CITA</Text>

      <Pressable
        onPress={() => {
          setSelectorOpen((open) => !open);
          setEditorOpen(false);
          setManualOpen(false);
        }}
        style={[styles.selector, { backgroundColor: colors.inputBg, borderColor: selectedLocation ? colors.primary + "77" : colors.cardBorder }]}
      >
        <View style={[styles.selectorIcon, { backgroundColor: colors.primary + "18" }]}> 
          {selectedLocation?.kind === "virtual" ? <Video size={18} color={colors.primary} /> : <MapPin size={18} color={colors.primary} />}
        </View>
        <View style={styles.selectorCopy}>
          <Text style={[styles.selectorTitle, { color: colors.text }]} numberOfLines={1}>
            {selectedLocation?.name ?? "Seleccionar un lugar guardado"}
          </Text>
          <Text style={[styles.selectorSubtitle, { color: colors.subtext }]} numberOfLines={1}>
            {selectedLocation?.address || selectedLocation?.mapUrl || `${locations.length} lugares guardados`}
          </Text>
        </View>
        {selectorOpen ? <ChevronUp size={19} color={colors.subtext} /> : <ChevronDown size={19} color={colors.subtext} />}
      </Pressable>

      {selectorOpen ? (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}> 
          {locations.length > 0 ? (
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {locations.map((location) => (
                <Pressable
                  key={location.id}
                  onPress={() => chooseLocation(location)}
                  style={[styles.placeRow, { borderBottomColor: colors.cardBorder }]}
                >
                  <View style={[styles.placeIcon, { backgroundColor: location.isDefault === 1 ? colors.favorite + "18" : colors.badgeBg }]}> 
                    {location.kind === "virtual" ? <Video size={17} color={colors.accent} /> : <MapPin size={17} color={colors.primary} />}
                  </View>
                  <View style={styles.placeCopy}>
                    <View style={styles.placeTitleRow}>
                      <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>{location.name}</Text>
                      {location.isDefault === 1 ? <Star size={13} color={colors.favorite} fill={colors.favorite} /> : null}
                    </View>
                    <Text style={[styles.placeAddress, { color: colors.subtext }]} numberOfLines={2}>
                      {location.address || location.mapUrl}
                    </Text>
                  </View>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      setDraft(toDraft(location));
                      setEditorOpen(true);
                      setSelectorOpen(false);
                    }}
                    hitSlop={6}
                    style={styles.rowAction}
                  >
                    <Pencil size={16} color={colors.accent} />
                  </Pressable>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      void deleteLocation(location);
                    }}
                    hitSlop={6}
                    style={styles.rowAction}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </Pressable>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.noPlaces, { color: colors.subtext }]}>Todavía no tienes lugares guardados.</Text>
          )}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable onPress={() => openNew()} style={[styles.action, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}> 
          <Plus size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Nuevo lugar</Text>
        </Pressable>
        <Pressable onPress={() => void obtainCurrentLocation()} disabled={busy !== null} style={[styles.action, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}> 
          {busy === "gps" ? <ActivityIndicator size="small" color={colors.primary} /> : <LocateFixed size={16} color={colors.primary} />}
          <Text style={[styles.actionText, { color: colors.text }]}>Mi ubicación</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setManualOpen((open) => !open);
            setSelectedId(null);
            setSelectorOpen(false);
            setEditorOpen(false);
            if (!manualOpen) onChange("");
          }}
          style={[styles.action, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}
        >
          <Link2 size={16} color={colors.accent} />
          <Text style={[styles.actionText, { color: colors.text }]}>Otra</Text>
        </Pressable>
      </View>

      {manualOpen ? (
        <View style={[styles.manualShell, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}> 
          <MapPin size={18} color={colors.error} />
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Dirección, enlace de Maps, Meet o Zoom"
            placeholderTextColor={colors.subtext}
            multiline
            style={[styles.manualInput, { color: colors.text }]}
          />
        </View>
      ) : null}

      {editorOpen ? (
        <View style={[styles.editor, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}> 
          <View style={styles.editorHeader}>
            <Text style={[styles.editorTitle, { color: colors.text }]}>{draft.id ? "Editar lugar" : "Guardar nuevo lugar"}</Text>
            <Pressable
              onPress={() => setEditorOpen(false)}
              hitSlop={6}
              style={[styles.closeEditor, { backgroundColor: colors.inputBg }]}
            >
              <X size={17} color={colors.subtext} />
            </Pressable>
          </View>

          <View style={styles.kindRow}>
            {(["physical", "virtual"] as SavedAppointmentLocationKind[]).map((kind) => {
              const selected = draft.kind === kind;
              return (
                <Pressable
                  key={kind}
                  onPress={() => setDraft((current) => ({ ...current, kind }))}
                  style={[styles.kindChip, { backgroundColor: selected ? colors.primary : colors.inputBg, borderColor: selected ? colors.primary : colors.cardBorder }]}
                >
                  {kind === "physical" ? <MapPin size={15} color={selected ? "#FFFFFF" : colors.primary} /> : <Video size={15} color={selected ? "#FFFFFF" : colors.accent} />}
                  <Text style={[styles.kindText, { color: selected ? "#FFFFFF" : colors.text }]}>{kind === "physical" ? "Lugar físico" : "Virtual"}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput value={draft.name} onChangeText={(name) => setDraft((current) => ({ ...current, name }))} placeholder="Nombre: Local, Oficina..." placeholderTextColor={colors.subtext} style={[styles.editorInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]} />
          <TextInput value={draft.address} onChangeText={(address) => setDraft((current) => ({ ...current, address }))} placeholder={draft.kind === "virtual" ? "Descripción opcional" : "Dirección escrita"} placeholderTextColor={colors.subtext} style={[styles.editorInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]} />
          <TextInput value={draft.mapUrl} onChangeText={(mapUrl) => setDraft((current) => ({ ...current, mapUrl }))} placeholder={draft.kind === "virtual" ? "Enlace Meet, Zoom..." : "Enlace de Google Maps"} placeholderTextColor={colors.subtext} autoCapitalize="none" keyboardType="url" style={[styles.editorInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]} />

          <Pressable onPress={() => setDraft((current) => ({ ...current, isDefault: !current.isDefault }))} style={styles.defaultRow}>
            <View style={[styles.checkBox, { backgroundColor: draft.isDefault ? colors.favorite : "transparent", borderColor: draft.isDefault ? colors.favorite : colors.cardBorder }]}> 
              {draft.isDefault ? <Check size={14} color="#FFFFFF" /> : null}
            </View>
            <Text style={[styles.defaultText, { color: colors.text }]}>Usar como lugar predeterminado</Text>
          </Pressable>

          <Pressable onPress={() => void saveDraft()} disabled={busy !== null} style={[styles.saveButton, { backgroundColor: colors.primary }, busy === "save" && styles.disabled]}> 
            {busy === "save" ? <ActivityIndicator color="#FFFFFF" /> : <Check size={18} color="#FFFFFF" />}
            <Text style={styles.saveText}>Guardar y usar</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: spacing.xs },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 0.6, marginBottom: 4 },
  selector: { minHeight: 54, borderRadius: radius.md, borderWidth: 1, padding: 8, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  selectorIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  selectorCopy: { flex: 1, minWidth: 0 },
  selectorTitle: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  selectorSubtitle: { fontFamily: fonts.body, fontSize: 10.5, marginTop: 2 },
  dropdown: { borderRadius: radius.md, borderWidth: 1, overflow: "hidden", marginTop: 5 },
  dropdownScroll: { maxHeight: 196 },
  placeRow: { minHeight: 58, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 7 },
  placeIcon: { width: 34, height: 34, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  placeCopy: { flex: 1, minWidth: 0 },
  placeTitleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  placeName: { flexShrink: 1, fontFamily: fonts.bodySemiBold, fontSize: 12.5 },
  placeAddress: { fontFamily: fonts.body, fontSize: 10.5, lineHeight: 14, marginTop: 1 },
  rowAction: { width: 30, height: 32, alignItems: "center", justifyContent: "center" },
  noPlaces: { padding: spacing.md, textAlign: "center", fontFamily: fonts.body, fontSize: 11.5 },
  actions: { flexDirection: "row", gap: 5, marginTop: 6 },
  action: { flex: 1, minHeight: 38, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 4 },
  actionText: { fontFamily: fonts.bodySemiBold, fontSize: 10.5 },
  manualShell: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 6 },
  manualInput: { flex: 1, minWidth: 0, maxHeight: 84, paddingVertical: 9, fontFamily: fonts.body, fontSize: 12.5 },
  editor: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.sm, marginTop: 7, gap: 7 },
  editorHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  editorTitle: { fontFamily: fonts.displaySemiBold, fontSize: 14 },
  closeEditor: { width: 30, height: 30, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  kindRow: { flexDirection: "row", gap: 6 },
  kindChip: { flex: 1, minHeight: 36, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  kindText: { fontFamily: fonts.bodySemiBold, fontSize: 10.5 },
  editorInput: { minHeight: 43, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 8, fontFamily: fonts.body, fontSize: 12.5 },
  defaultRow: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 7 },
  checkBox: { width: 21, height: 21, borderRadius: 6, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  defaultText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5 },
  saveButton: { minHeight: 45, borderRadius: radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  saveText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 13 },
  error: { fontFamily: fonts.bodySemiBold, fontSize: 11, textAlign: "center", marginTop: 5 },
  disabled: { opacity: 0.55 }
});
