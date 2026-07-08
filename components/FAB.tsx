import { Pressable, Text } from "react-native";

export function FAB() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create prompt"
      className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-accent shadow-sm"
    >
      <Text className="text-on-accent text-2xl leading-none">+</Text>
    </Pressable>
  );
}
