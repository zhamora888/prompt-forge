import "@/global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { PromptsProvider, usePrompts } from "@/lib/PromptsProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { isHydrated } = usePrompts();

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <PromptsProvider>
      <RootNavigator />
    </PromptsProvider>
  );
}