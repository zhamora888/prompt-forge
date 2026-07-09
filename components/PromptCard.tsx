import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import type { Prompt } from "@/types/prompt";

type PromptCardProps = {
  prompt: Prompt;
};

export function PromptCard({ prompt }: PromptCardProps) {
  const router = useRouter();

  return (
    // Story 1.7/1.8: when the favorite star/copy icon are added here, they must be their
    // own nested Pressables so their onPress takes priority over this card's navigation.
    <Pressable
      onPress={() => router.push({ pathname: "/prompt/[id]", params: { id: prompt.id } })}
      className="bg-surface-raised border-border-hairline rounded-md border p-4"
    >
      <Text numberOfLines={1} className="text-ink-primary text-lg font-semibold">
        {prompt.title}
      </Text>
      <Text numberOfLines={2} className="text-ink-secondary mt-1 text-sm">
        {prompt.content}
      </Text>
    </Pressable>
  );
}
