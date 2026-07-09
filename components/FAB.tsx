import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@/lib/theme";

export function FAB() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create prompt"
      onPress={() => router.push("/prompt/create")}
      className="absolute h-14 w-14 items-center justify-center rounded-full bg-accent shadow-sm"
      style={{
        bottom: spacing["4"] + insets.bottom,
        right: spacing["4"] + insets.right,
      }}
    >
      <Text className="text-on-accent text-2xl leading-none">+</Text>
    </Pressable>
  );
}
