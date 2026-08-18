export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  subtext: string;
  primary: string; // Emerald WhatsApp Green #10B981
  primaryDark: string; // #059669
  primaryLight: string; // #D1FAE5
  accent: string; // #3B82F6 Blue
  call: string; // #2563EB
  sms: string; // #8B5CF6
  error: string; // #EF4444
  warning: string; // #F59E0B
  favorite: string; // #F59E0B
  inputBg: string;
  badgeBg: string;
  glass: string;
  glassBorder: string;
  navBackground: string;
}

export const lightColors: ThemeColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  text: "#0F172A",
  subtext: "#64748B",
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#D1FAE5",
  accent: "#3B82F6",
  call: "#2563EB",
  sms: "#8B5CF6",
  error: "#EF4444",
  warning: "#F59E0B",
  favorite: "#F59E0B",
  inputBg: "#F1F5F9",
  badgeBg: "#E2E8F0",
  glass: "rgba(255, 255, 255, 0.86)",
  glassBorder: "rgba(15, 23, 42, 0.10)",
  navBackground: "rgba(255, 255, 255, 0.92)"
};

export const darkColors: ThemeColors = {
  background: "#090D16",
  card: "#1E293B",
  cardBorder: "#334155",
  text: "#F8FAFC",
  subtext: "#94A3B8",
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#064E3B",
  accent: "#60A5FA",
  call: "#3B82F6",
  sms: "#A78BFA",
  error: "#F87171",
  warning: "#FBBF24",
  favorite: "#FBBF24",
  inputBg: "#151E2D",
  badgeBg: "rgba(255, 255, 255, 0.05)",
  glass: "rgba(30, 41, 59, 0.80)",
  glassBorder: "rgba(255, 255, 255, 0.10)",
  navBackground: "rgba(30, 41, 59, 0.86)"
};
