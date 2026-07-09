import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FAB } from "@/components/FAB";
import { PromptCard } from "@/components/PromptCard";
import { usePrompts } from "@/lib/PromptsProvider";

export default function Library() {
  const { prompts } = usePrompts();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface-base" style={{ paddingTop: insets.top }}>
      <Text className="text-ink-primary px-4 pb-2 pt-4 text-2xl font-semibold">My Prompts</Text>
      {prompts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-secondary">No prompts yet.</Text>
        </View>
      ) : (
        <FlatList
          data={prompts}
          keyExtractor={(prompt) => prompt.id}
          renderItem={({ item }) => <PromptCard prompt={item} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
        />
      )}
      <FAB />
    </View>
  );
}
