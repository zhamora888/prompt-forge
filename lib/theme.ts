export const colors = {
  "surface-base": "#F7F7F5",
  "surface-raised": "#FFFFFF",
  "ink-primary": "#1C1C1E",
  "ink-secondary": "#6E6E73",
  "ink-disabled": "#B0B0B5",
  accent: "#4453C9",
  "accent-soft": "#E8EAFB",
  "on-accent": "#FFFFFF",
  "border-hairline": "#E5E5E5",
  danger: "#B83A3A",
} as const;

export const typography = {
  title: { note: "Platform native — iOS Title 2 · Android Title Large" },
  body: { note: "Platform native — iOS Body · Android Body Large" },
  meta: { note: "Platform native — iOS Footnote · Android Body Small" },
} as const;

export const rounded = {
  sm: 8,
  md: 12,
  full: 9999,
} as const;

export const spacing = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 24,
  "6": 32,
} as const;
