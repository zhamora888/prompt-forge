import { Text, View } from "react-native";
import type { Prompt } from "@/types/prompt";

type PromptCardProps = {
  prompt: Prompt;
};

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <View className="bg-surface-raised border-border-hairline rounded-md border p-4">
      <Text numberOfLines={1} className="text-ink-primary text-lg font-semibold">
        {prompt.title}
      </Text>
      <Text numberOfLines={2} className="text-ink-secondary mt-1 text-sm">
        {prompt.content}
      </Text>
    </View>
  );
}
