# Deferred Work

## Deferred from: code review of 1-2-create-a-prompt (2026-07-09)

- **router.back() has no fallback if Create is reached without back-history** (e.g. a direct deep link) — `app/prompt/create.tsx:37`. No deep-linking entry point exists in any current story.
- **Tags aren't case-normalized, allowing near-duplicate tags** (e.g. "Work"/"work") — `app/prompt/create.tsx:26-33`. Relevant once Story 1.6 (search) or tag-based filtering ships.
- **FAB has no debounce against rapid double-tap, risking a duplicate route push** — `components/FAB.tsx:14`. Low-impact, common RN pattern gap not required by any AC.
