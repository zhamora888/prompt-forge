import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormInput } from "@/components/FormInput";
import { TagChip } from "@/components/TagChip";
import { usePrompts } from "@/lib/PromptsProvider";

export default function CreatePrompt() {
  const router = useRouter();
  const { createPrompt } = usePrompts();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSave = title.trim() !== "" && content.trim() !== "" && !isSaving;

  function handleRemoveTag(tag: string) {
    setTags((current) => current.filter((existing) => existing !== tag));
  }

  function handleSubmitTag() {
    const trimmed = tagDraft.trim();
    if (trimmed !== "" && !tags.includes(trimmed)) {
      setTags((current) => [...current, trimmed]);
    }
    setTagDraft("");
    setIsAddingTag(false);
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }
    setIsSaving(true);

    const trimmedDraft = tagDraft.trim();
    const finalTags = trimmedDraft !== "" && !tags.includes(trimmedDraft) ? [...tags, trimmedDraft] : tags;

    await createPrompt({ title: title.trim(), content: content.trim(), category: "", tags: finalTags });
    router.back();
  }

  return (
    <ScrollView
      className="flex-1 bg-surface-base"
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, gap: 16 }}
    >
      <Text className="text-ink-primary text-2xl font-semibold">New Prompt</Text>

      <FormInput label="Title" value={title} onChangeText={setTitle} placeholder="Prompt title" />
      <FormInput
        label="Content"
        value={content}
        onChangeText={setContent}
        placeholder="Prompt content"
        multiline
      />

      <View>
        <Text className="mb-1 text-sm text-ink-secondary">Tags</Text>
        <View className="flex-row flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
          ))}
          {!isAddingTag && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add tag"
              onPress={() => setIsAddingTag(true)}
              className="h-12 w-12 items-center justify-center"
            >
              <Text className="text-accent text-lg">+</Text>
            </Pressable>
          )}
        </View>
        {isAddingTag && (
          <View className="mt-2">
            <FormInput
              label="New tag"
              value={tagDraft}
              onChangeText={setTagDraft}
              placeholder="Tag name"
              onSubmitEditing={handleSubmitTag}
            />
          </View>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save prompt"
        disabled={!canSave}
        onPress={handleSave}
        className="bg-accent rounded-sm items-center justify-center px-4 py-3"
        style={{ opacity: canSave ? 1 : 0.5, minHeight: 48 }}
      >
        <Text className="text-on-accent text-base font-semibold">Save</Text>
      </Pressable>
    </ScrollView>
  );
}
