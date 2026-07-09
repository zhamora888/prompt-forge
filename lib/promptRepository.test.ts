import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllPrompts, STORAGE_KEY } from "@/lib/promptRepository";
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
