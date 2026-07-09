// Design-token source of truth, mirrored verbatim from DESIGN.md's frontmatter.
// Plain CommonJS (not .ts) on purpose: tailwind.config.js `require()`s this file
// directly, and relying on Node's TS type-stripping for that require is fragile
// across Node versions/CI. lib/theme.ts re-exports these same values (typed) for
// app code, so there is still exactly one place the token values are declared.
module.exports = {
  colors: {
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
  },
  // Platform-native styling notes, not concrete CSS values, so they aren't wired
  // into tailwind.config.js's theme — they're for components to consult directly
  // (via lib/theme.ts) when choosing which platform text style to apply.
  typography: {
    title: { note: "Platform native — iOS Title 2 · Android Title Large" },
    body: { note: "Platform native — iOS Body · Android Body Large" },
    meta: { note: "Platform native — iOS Footnote · Android Body Small" },
  },
  rounded: {
    sm: 8,
    md: 12,
    full: 9999,
  },
  // Keys 5 and 6 intentionally diverge from Tailwind's default spacing scale
  // (20px/24px) — these are mirrored verbatim from DESIGN.md's frontmatter,
  // not a mistake.
  spacing: {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 24,
    "6": 32,
  },
};
