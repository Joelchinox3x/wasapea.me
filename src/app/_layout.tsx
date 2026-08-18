import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { AppToastHost } from "../components/AppToastHost";
import { BrandedSplash } from "../components/BrandedSplash";
import { DatabaseRecoveryScreen } from "../components/DatabaseRecoveryScreen";
import { ModeTransitionOverlay } from "../components/ModeTransitionOverlay";
import { NoticeModal } from "../components/NoticeModal";

import { initDatabase } from "../database/db";
import { useAppStore } from "../store/useAppStore";
import { darkColors, lightColors } from "../theme/colors";
import "../services/LiveLocationService";

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 250, fade: true });

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Outfit_600SemiBold,
    Outfit_700Bold
  });
  const colorScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.themeMode);
  const appMode = useAppStore((state) => state.appMode);
  const appModeHydrated = useAppStore((state) => state.appModeHydrated);

  const hydrateAppMode = useAppStore((state) => state.hydrateAppMode);
  const notice = useAppStore((state) => state.notice);
  const hideNotice = useAppStore((state) => state.hideNotice);

  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");

  const initializeDependencies = useCallback(
    () => Promise.all([initDatabase(), hydrateAppMode()]),
    [hydrateAppMode]
  );

  const retryDatabase = useCallback(async () => {
    setDbError(null);
    try {
      await initializeDependencies();
      setDbReady(true);
    } catch (error) {
      setDbReady(false);
      setDbError(error instanceof Error ? error.message : "Error desconocido al iniciar la base de datos.");
    }
  }, [initializeDependencies]);

  useEffect(() => {
    void initializeDependencies()
      .then(() => setDbReady(true))
      .catch((error: unknown) => {
        setDbReady(false);
        setDbError(error instanceof Error ? error.message : "Error desconocido al iniciar la base de datos.");
      });
  }, [initializeDependencies]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (dbError) {
    const recoveryColors = isDark ? darkColors : lightColors;
    return <DatabaseRecoveryScreen colors={recoveryColors} error={dbError} onRetry={retryDatabase} />;
  }

  if (!dbReady || !appModeHydrated) return null;

  const customTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: isDark ? darkColors.background : lightColors.background,
      card: isDark ? darkColors.card : lightColors.card,
      text: isDark ? darkColors.text : lightColors.text,
      border: isDark ? darkColors.cardBorder : lightColors.cardBorder,
      primary: isDark ? darkColors.primary : lightColors.primary
    }
  };

  return (
    <ThemeProvider value={customTheme}>
      <StatusBar style={showSplash || isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? darkColors.background : lightColors.background }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="agenda/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="agenda/create" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="agenda/edit/[id]" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="pro" options={{ headerShown: false, presentation: "modal" }} />
      </Stack>
      <AppToastHost />
      <ModeTransitionOverlay mode={appMode} isDark={isDark} />
      <NoticeModal

        visible={notice !== null}
        title={notice?.title || ""}
        message={notice?.message || ""}
        tone={notice?.tone}
        onClose={hideNotice}
        isDark={isDark}
      />
      {showSplash && <BrandedSplash onFinish={() => setShowSplash(false)} />}
    </ThemeProvider>
  );
}
