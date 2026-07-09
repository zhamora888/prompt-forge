import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { Prompt, PromptDraft } from "@/types/prompt";

export const STORAGE_KEY = "@promptforge/prompts";

export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Prompt[]) : [];
  } catch (error) {
    console.error("promptRepository: failed to read prompts", error);
    return [];
  }
}

export async function createPrompt(currentPrompts: Prompt[], draft: PromptDraft): Promise<Prompt[]> {
  const now = new Date().toISOString();
  const prompt: Prompt = {
    id: Crypto.randomUUID(),
    title: draft.title,
    content: draft.content,
    category: draft.category,
    tags: draft.tags,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [...currentPrompts, prompt];

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("promptRepository: failed to persist prompts", error);
  }

  return updated;
}
