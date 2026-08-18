import Constants from "expo-constants";

export interface CountryItem {
  iso: string;
  code: string;
  name: string;
  flag: string;
}

export const APP_NAME = "WASAPEA.ME";
export const APP_TAGLINE = "Tu lanzador y gestor de contactos directo sin guardar";
export const APP_VERSION = Constants.expoConfig?.version || "1.0.0";
export const APP_BUILD = String(
  Constants.expoConfig?.android?.versionCode ?? Constants.expoConfig?.ios?.buildNumber ?? "—"
);
export const OTA_REVISION = process.env.EXPO_PUBLIC_OTA_REVISION?.trim() || null;
const configuredSafeServerUrl = process.env.EXPO_PUBLIC_SAFE_SERVER_URL?.trim().replace(/\/+$/, "");
export const SAFE_SERVER_URL = configuredSafeServerUrl || "https://safe.boxtiove.com";
const configuredBotServerUrl = process.env.EXPO_PUBLIC_BOT_SERVER_URL?.trim().replace(/\/+$/, "");
export const BOT_SERVER_URL = configuredBotServerUrl || "https://bot.boxtiove.com";

export const DEFAULT_COUNTRY: CountryItem = {
  iso: "PE",
  code: "+51",
  name: "Perú",
  flag: "🇵🇪"
};

export const FEATURE_FLAGS = {
  CLOUD_SYNC: false,
  PRO_ENABLED: false
} as const;

export const POPULAR_COUNTRIES: CountryItem[] = [
  { iso: "PE", code: "+51", name: "Perú", flag: "🇵🇪" },
  { iso: "MX", code: "+52", name: "México", flag: "🇲🇽" },
  { iso: "ES", code: "+34", name: "España", flag: "🇪🇸" },
  { iso: "AR", code: "+54", name: "Argentina", flag: "🇦🇷" },
  { iso: "CO", code: "+57", name: "Colombia", flag: "🇨🇴" },
  { iso: "CL", code: "+56", name: "Chile", flag: "🇨🇱" },
  { iso: "US", code: "+1", name: "Estados Unidos", flag: "🇺🇸" },
  { iso: "EC", code: "+593", name: "Ecuador", flag: "🇪🇨" },
  { iso: "BO", code: "+591", name: "Bolivia", flag: "🇧🇴" },
  { iso: "VE", code: "+58", name: "Venezuela", flag: "🇻🇪" },
  { iso: "BR", code: "+55", name: "Brasil", flag: "🇧🇷" },
  { iso: "UY", code: "+598", name: "Uruguay", flag: "🇺🇾" },
  { iso: "PY", code: "+595", name: "Paraguay", flag: "🇵🇾" },
  { iso: "CR", code: "+506", name: "Costa Rica", flag: "🇨🇷" },
  { iso: "GT", code: "+502", name: "Guatemala", flag: "🇬🇹" },
  { iso: "PA", code: "+507", name: "Panamá", flag: "🇵🇦" },
  { iso: "DO", code: "+1", name: "República Dominicana", flag: "🇩🇴" }
];
