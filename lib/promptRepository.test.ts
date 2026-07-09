import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { createPrompt, getAllPrompts, STORAGE_KEY } from "@/lib/promptRepository";
import type { Prompt } from "@/types/prompt";

describe("promptRepository.getAllPrompts", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it("returns an empty array when nothing is stored yet", async () => {
    await expect(getAllPrompts()).resolves.toEqual([]);
  });

  it("returns the parsed prompt array when data is stored", async () => {
    const stored: Prompt[] = [
      {
        id: "1",
        title: "Test prompt",
        content: "Some content",
        category: "",
        tags: [],
        isFavorite: false,
        createdAt: "2026-07-08T00:00:00.000Z",
        updatedAt: "2026-07-08T00:00:00.000Z",
      },
    ];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    await expect(getAllPrompts()).resolves.toEqual(stored);
  });

  it("returns an empty array and logs when the read fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("boom"));

    await expect(getAllPrompts()).resolves.toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });
});

describe("promptRepository.createPrompt", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  const existing: Prompt = {
    id: "existing-1",
    title: "Existing prompt",
    content: "Existing content",
    category: "",
    tags: [],
    isFavorite: false,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  };

  it("appends a new prompt with a generated id and matching created/updated timestamps", async () => {
    jest.spyOn(Crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111");
    const draft = { title: "New prompt", content: "New content", category: "", tags: ["one", "two"] };

    const result = await createPrompt([existing], draft);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(existing);

    const created = result[1];
    expect(created.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(created.title).toBe(draft.title);
    expect(created.content).toBe(draft.content);
    expect(created.category).toBe(draft.category);
    expect(created.tags).toEqual(draft.tags);
    expect(created.isFavorite).toBe(false);
    expect(created.createdAt).toBe(created.updatedAt);
    expect(new Date(created.createdAt).getTime()).toBeCloseTo(Date.now(), -2);
  });

  it("persists the updated array via AsyncStorage.setItem", async () => {
    const draft = { title: "New prompt", content: "New content", category: "", tags: [] };

    const result = await createPrompt([existing], draft);

    await expect(getAllPrompts()).resolves.toEqual(result);
  });

  it("still resolves with the updated array and logs when the write fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("boom"));
    const draft = { title: "New prompt", content: "New content", category: "", tags: [] };

    const result = await createPrompt([existing], draft);

    expect(result).toHaveLength(2);
    expect(result[1].title).toBe(draft.title);
    expect(consoleError).toHaveBeenCalled();
  });
});
