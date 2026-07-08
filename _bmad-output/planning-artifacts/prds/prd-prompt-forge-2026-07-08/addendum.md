# Addendum — PromptForge

Implementation-level detail volunteered during Discovery that belongs downstream (architecture / build), not in the PRD itself.

## Technology Stack (user-specified)

- **Framework:** React Native (targets both iOS and Android from one codebase).
- **Styling:** Tailwind (via NativeWind or equivalent RN Tailwind binding).
- **Build context:** one-day assessment build — platform polish (iOS vs. Android) will be allocated based on however much build time is left, not a deliberate scope decision.

## Original Prompt Data Shape (user-specified, verbatim)

```ts
type Prompt = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};
```

This shape is carried into the PRD's Glossary/FRs conceptually (Prompt has a title, content, category, tags, favorite flag, created/updated timestamps) without prescribing the TypeScript implementation — the PRD describes the *capability*, this addendum preserves the *exact contract* the user already committed to for the build.

**Note:** the PRD (FR-9) makes category optional — a Prompt can be saved with no category set. The `category: string` type above doesn't itself express that optionality; how "no category" is represented (empty string, `category?: string`, a sentinel value, etc.) is left as a downstream implementation choice, not fixed by this contract.

## Worked Example (user-specified)

**Title:** Senior Code Review
**Category:** Development
**Tags:** react, typescript, architecture
**Content:**
```
Review this code focusing on:
- Security
- Performance
- Scalability
- Maintainability
```

## Fixed Category List (user-specified)

Development, Writing, Research, Marketing, Career, General — dropdown, no category CRUD in v1.

## Storage Mechanism

Not specified by the user beyond "local, offline-capable, persists until uninstall." Choice of on-device storage technology (e.g. AsyncStorage, SQLite, MMKV, Realm) is an architecture decision, out of scope for this PRD.
