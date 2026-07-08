import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Prompt } from "@/types/prompt";

const STORAGE_KEY = "@promptforge/prompts";

export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Prompt[]) : [];
  } catch (error) {
    console.error("promptRepository: failed to read prompts", error);
    return [];
  }
}
