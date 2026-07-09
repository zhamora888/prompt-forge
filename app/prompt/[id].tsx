import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DetailActionRow } from "@/components/DetailActionRow";
import { TagChip } from "@/components/TagChip";
import { usePrompts } from "@/lib/PromptsProvider";

export default function PromptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { prompts } = usePrompts();
  const insets = useSafeAreaInsets();

  const prompt = prompts.find((p) => p.id === id);

  useEffect(() => {
    if (!prompt) {
      router.back();
    }
  }, [prompt, router]);

  if (!prompt) {
    return null;
  }

  return (
    <ScrollView
      className="flex-1 bg-surface-base"
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, gap: 16 }}
    >
      <Text className="text-ink-primary text-2xl font-semibold">{prompt.title}</Text>
      <View className="bg-surface-raised border-border-hairline gap-4 rounded-md border p-4">
        <Text className="text-ink-primary text-base">{prompt.content}</Text>
        {prompt.category ? <Text className="text-accent text-sm">{prompt.category}</Text> : null}
        {prompt.tags.length > 0 && (
          <View className="flex-row flex-wrap items-center gap-2">
            {prompt.tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>
        )}
      </View>
      <DetailActionRow isFavorite={prompt.isFavorite} />
    </ScrollView>
  );
}
