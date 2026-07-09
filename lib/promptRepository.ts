import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Prompt } from "@/types/prompt";

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
