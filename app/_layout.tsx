import "@/global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PromptsProvider, usePrompts } from "@/lib/PromptsProvider";

SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error("RootLayout: failed to prevent splash auto-hide", error);
});

function RootNavigator() {
  const { isHydrated } = usePrompts();

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync().catch((error) => {
        console.error("RootLayout: failed to hide splash screen", error);
      });
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PromptsProvider>
        <RootNavigator />
      </PromptsProvider>
    </SafeAreaProvider>
  );
}
