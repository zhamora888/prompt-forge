import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createPrompt as createPromptInRepository, getAllPrompts } from "@/lib/promptRepository";
import type { Prompt, PromptDraft } from "@/types/prompt";

type PromptsContextValue = {
  prompts: Prompt[];
  isHydrated: boolean;
  createPrompt: (draft: PromptDraft) => Promise<void>;
};

const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

export function PromptsProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);

  useEffect(() => {
    getAllPrompts().then(setPrompts);
  }, []);

  async function createPrompt(draft: PromptDraft) {
    const updated = await createPromptInRepository(prompts ?? [], draft);
    setPrompts(updated);
  }

  return (
    <PromptsContext.Provider value={{ prompts: prompts ?? [], isHydrated: prompts !== null, createPrompt }}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts() {
  const context = useContext(PromptsContext);
  if (!context) {
    throw new Error("usePrompts must be used within a PromptsProvider");
  }
  return context;
}
