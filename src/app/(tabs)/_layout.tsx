import { BlurTargetView, BlurView } from "expo-blur";
import { Tabs, useIsFocused } from "expo-router";
import { Clock, Home, Send, Settings, Users } from "lucide-react-native";
import React, { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hasProAccess, useAppStore } from "../../store/useAppStore";
import { darkColors, lightColors, ThemeColors } from "../../theme/colors";
import { fonts, radius } from "../../theme/designSystem";

interface TabIconProps {
  focused: boolean;
  label: string;
  color: string;
  colors: ThemeColors;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

interface TabBlurTargetProps {
  children: React.ReactNode;
  onFocused: (target: RefObject<View | null>) => void;
}

function TabBlurTarget({ children, onFocused }: TabBlurTargetProps) {
  const targetRef = useRef<View | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      onFocused(targetRef);
    }
  }, [isFocused, onFocused]);

  return (
    <BlurTargetView ref={targetRef} style={styles.blurTarget}>
      {children}
    </BlurTargetView>
  );
}

function TabIcon({ focused, label, color, colors, icon: Icon }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && { backgroundColor: colors.primary + "1F" }]}>
      <Icon size={21} color={color} strokeWidth={2} />
      <Text
        style={[styles.tabLabel, { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        maxFontSizeMultiplier={1.15}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const themeMode = useAppStore((state) => state.themeMode);
  const appMode = useAppStore((state) => state.appMode);
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;
  const bottomInset = Math.max(insets.bottom, 8);
  const [activeBlurTarget, setActiveBlurTarget] = useState<RefObject<View | null>>(
    () => React.createRef<View>()
  );
  const screenLayout = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <TabBlurTarget onFocused={setActiveBlurTarget}>{children}</TabBlurTarget>
    ),
    []
  );

  return (
    <Tabs
      screenLayout={screenLayout}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 70 + bottomInset,
          paddingTop: 12,
          paddingBottom: bottomInset,
          elevation: 0,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: isDark ? 0.08 : 0.04,
          shadowRadius: 18
        },
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => (
          <BlurView
            blurTarget={activeBlurTarget}
            tint={isDark ? "dark" : "light"}
            intensity={72}
            blurMethod="dimezisBlurViewSdk31Plus"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.navBackground }]}
          />
        )
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} label="Inicio" color={String(color)} colors={colors} icon={Home} />
          )
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: "Mensajes",
          href: hasProAccess(appMode) ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} label="Mensajes" color={String(color)} colors={colors} icon={Send} />
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          href: hasProAccess(appMode) ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} label="Historial" color={String(color)} colors={colors} icon={Clock} />
          )
        }}
      />

      <Tabs.Screen
        name="agenda/index"
        options={{
          title: "Agenda",
          href: hasProAccess(appMode) ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} label="Agenda" color={String(color)} colors={colors} icon={Users} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} label="Ajustes" color={String(color)} colors={colors} icon={Settings} />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurTarget: {
    flex: 1
  },
  tabBarItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4
  },
  tabIcon: {
    minWidth: 54,
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 2,
    paddingVertical: 4
  },
  tabLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    textAlign: "center"
  }
});
