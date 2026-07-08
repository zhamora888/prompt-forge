import { Text, View } from "react-native";
import { FAB } from "@/components/FAB";
import { usePrompts } from "@/lib/PromptsProvider";

export default function Library() {
  const { prompts } = usePrompts();

  return (
    <View className="flex-1 bg-surface-base">
      {prompts.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-secondary">No prompts yet.</Text>
        </View>
      )}
      <FAB />
    </View>
  );
}
