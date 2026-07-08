import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAllPrompts } from "@/lib/promptRepository";
import type { Prompt } from "@/types/prompt";

type PromptsContextValue = {
  prompts: Prompt[];
  isHydrated: boolean;
};

const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

export function PromptsProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    getAllPrompts().then((loaded) => {
      setPrompts(loaded);
      setIsHydrated(true);
    });
  }, []);

  return (
    <PromptsContext.Provider value={{ prompts, isHydrated }}>
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
