import { create } from "zustand";
import { CountryItem, DEFAULT_COUNTRY, POPULAR_COUNTRIES } from "../constants/app";
import { SecureStorageService } from "../services/SecureStorageService";

export type ThemeMode = "system" | "light" | "dark";
export type AppMode = "simple" | "pro" | "vip";
export type ElevatedAppMode = Exclude<AppMode, "simple">;
export type NoticeTone = "info" | "success" | "error";

export interface AppNotice {
  title: string;
  message: string;
  tone?: NoticeTone;
}

export interface AppToast {
  id: number;
  message: string;
  tone?: NoticeTone;
  duration?: number;
}

export type AppToastInput = Omit<AppToast, "id">;

const APP_MODE_STORAGE_KEY = "wasapeame.app-mode";
const LAST_ELEVATED_MODE_STORAGE_KEY = "wasapeame.last-elevated-mode";
const MODE_SWITCH_VISIBILITY_STORAGE_KEY = "wasapeame.show-mode-switch";
const PREFERENCES_STORAGE_KEY = "wasapeame.preferences.v1";
let toastSequence = 0;

interface PersistedPreferences {
  themeMode: ThemeMode;
  countryIso: string;
  autoDetectClipboard: boolean;
  confirmBeforeCall: boolean;
  logHistoryEnabled: boolean;
}

export interface AppStoreState {
  themeMode: ThemeMode;
  appMode: AppMode;
  lastElevatedMode: ElevatedAppMode;
  appModeHydrated: boolean;
  showModeSwitch: boolean;
  selectedCountry: CountryItem;
  autoDetectClipboard: boolean;
  confirmBeforeCall: boolean;
  logHistoryEnabled: boolean;
  currentPhoneInput: string;
  currentMessageInput: string;
  notice: AppNotice | null;
  toast: AppToast | null;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setAppMode: (mode: AppMode) => void;
  setShowModeSwitch: (visible: boolean) => void;
  hydrateAppMode: () => Promise<void>;
  setSelectedCountry: (country: CountryItem) => void;
  setAutoDetectClipboard: (enabled: boolean) => void;
  setConfirmBeforeCall: (enabled: boolean) => void;
  setLogHistoryEnabled: (enabled: boolean) => void;
  setCurrentPhoneInput: (phone: string) => void;
  setCurrentMessageInput: (msg: string) => void;
  showNotice: (notice: AppNotice) => void;
  hideNotice: () => void;
  showToast: (toast: AppToastInput) => void;
  hideToast: (id?: number) => void;
  resetDraft: () => void;
}

function persistPreferences(state: AppStoreState): Promise<boolean> {
  const preferences: PersistedPreferences = {
    themeMode: state.themeMode,
    countryIso: state.selectedCountry.iso,
    autoDetectClipboard: state.autoDetectClipboard,
    confirmBeforeCall: state.confirmBeforeCall,
    logHistoryEnabled: state.logHistoryEnabled
  };
  return SecureStorageService.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  themeMode: "dark",
  appMode: "simple",
  lastElevatedMode: "pro",
  appModeHydrated: false,
  showModeSwitch: true,
  selectedCountry: DEFAULT_COUNTRY,
  autoDetectClipboard: true,
  confirmBeforeCall: false,
  logHistoryEnabled: true,
  currentPhoneInput: "",
  currentMessageInput: "",
  notice: null,
  toast: null,

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    void persistPreferences(get());
  },
  setAppMode: (mode) => {
    const elevatedMode = mode === "pro" || mode === "vip" ? mode : null;
    set({
      appMode: mode,
      ...(elevatedMode ? { lastElevatedMode: elevatedMode } : {})
    });
    void SecureStorageService.setItem(APP_MODE_STORAGE_KEY, mode);
    if (elevatedMode) {
      void SecureStorageService.setItem(LAST_ELEVATED_MODE_STORAGE_KEY, elevatedMode);
    }
  },
  setShowModeSwitch: (visible) => {
    set({ showModeSwitch: visible });
    void SecureStorageService.setItem(MODE_SWITCH_VISIBILITY_STORAGE_KEY, visible ? "true" : "false");
  },
  hydrateAppMode: async () => {
    try {
      const [storedMode, storedLastElevatedMode, storedSwitchVisibility, storedPreferences] = await Promise.all([
        SecureStorageService.getItem(APP_MODE_STORAGE_KEY),
        SecureStorageService.getItem(LAST_ELEVATED_MODE_STORAGE_KEY),
        SecureStorageService.getItem(MODE_SWITCH_VISIBILITY_STORAGE_KEY),
        SecureStorageService.getItem(PREFERENCES_STORAGE_KEY)
      ]);
      const preferences = storedPreferences ? (JSON.parse(storedPreferences) as Partial<PersistedPreferences>) : null;
      const storedCountry = POPULAR_COUNTRIES.find((item) => item.iso === preferences?.countryIso);
      set({
        appMode: storedMode === "pro" || storedMode === "vip" ? storedMode : "simple",
        lastElevatedMode: storedLastElevatedMode === "vip" ? "vip" : "pro",
        showModeSwitch: storedSwitchVisibility !== "false",
        themeMode: ["system", "light", "dark"].includes(String(preferences?.themeMode))
          ? (preferences?.themeMode as ThemeMode)
          : "dark",
        selectedCountry: storedCountry ?? DEFAULT_COUNTRY,
        autoDetectClipboard: preferences?.autoDetectClipboard ?? true,
        confirmBeforeCall: preferences?.confirmBeforeCall ?? false,
        logHistoryEnabled: preferences?.logHistoryEnabled ?? true,
        appModeHydrated: true
      });
    } catch {
      set({ appModeHydrated: true });
    }
  },
  setSelectedCountry: (country) => {
    set({ selectedCountry: country });
    void persistPreferences(get());
  },
  setAutoDetectClipboard: (enabled) => {
    set({ autoDetectClipboard: enabled });
    void persistPreferences(get());
  },
  setConfirmBeforeCall: (enabled) => {
    set({ confirmBeforeCall: enabled });
    void persistPreferences(get());
  },
  setLogHistoryEnabled: (enabled) => {
    set({ logHistoryEnabled: enabled });
    void persistPreferences(get());
  },
  setCurrentPhoneInput: (phone) => set({ currentPhoneInput: phone }),
  setCurrentMessageInput: (msg) => set({ currentMessageInput: msg }),
  showNotice: (notice) => set({ notice }),
  hideNotice: () => set({ notice: null }),
  showToast: (toast) => set({ toast: { ...toast, id: ++toastSequence } }),
  hideToast: (id) =>
    set((state) => {
      if (id !== undefined && state.toast?.id !== id) return state;
      return { toast: null };
    }),
  resetDraft: () => set({ currentPhoneInput: "", currentMessageInput: "" })
}));

export function hasProAccess(mode: AppMode): boolean {
  return mode === "pro" || mode === "vip";
}
