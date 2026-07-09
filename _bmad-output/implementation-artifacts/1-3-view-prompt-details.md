---
baseline_commit: 2aaa610bcbb7edfdf409b720a54f4a521a9dd519
---

# Story 1.3: View Prompt Details

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to open a saved prompt and see its full content,
so that I can read the whole thing before copying or editing it.

## Acceptance Criteria

1. **Given** the Library shows at least one Prompt card, **When** I tap anywhere on a card except the favorite star or copy icon, **Then** the Prompt Detail screen opens, showing the full title, content (untruncated regardless of length), category, and tags.

2. **Given** I am on the Prompt Detail screen, **When** the screen renders, **Then** a Detail action row is visible with four tap targets — Copy, Favorite, Edit, Delete.

3. **Given** I am on the Prompt Detail screen, reached from the Library, **When** I navigate back, **Then** I return to the Library screen with my previous search/filter state intact.

4. **Given** I am on the Prompt Detail screen, **When** Detail is the current screen, **Then** the navigation stack is exactly one level deep from Library.

5. **Given** a Prompt has one or more tags, **When** I view it on the Detail screen, **Then** each tag renders as a read-only chip — no add/remove affordance outside the Create/Edit form.

6. **Given** the Detail action row's four icon-plus-label controls, **When** a screen reader is active, **Then** each carries a text label and meets the ≥44pt/48dp tap-target minimum, independent of its visual icon size.

## Tasks / Subtasks

- [x] Task 1: Build the `DetailActionRow` component (AC: #2, #6)
  - [x] Create `components/DetailActionRow.tsx` per `DESIGN.md.Components` Detail action row spec: four evenly-spaced icon-plus-label tap targets — Copy, Favorite, Edit, Delete — with `spacing.4` padding.
  - [x] Colors: Copy and Edit in `ink-primary`. Favorite follows the filled(`accent`)/outline(`ink-secondary`) rule based on an `isFavorite: boolean` prop (render the real current value from the Prompt — this is just displaying existing data, not building the toggle). Delete in `danger` — the only red element on this surface.
  - [x] Props: `isFavorite: boolean`. No `onCopy`/`onFavorite`/`onEdit`/`onDelete` callback props yet — see below.
  - [x] **Each of the four Pressables is functionally inert in this story** — no `onPress` handler (or a no-op). Copy needs `expo-clipboard` (Story 1.8), Favorite needs `toggleFavorite()` on the Repository (Story 1.7), Edit needs `app/prompt/edit/[id].tsx` (Story 1.4), Delete needs `ConfirmDialog` + `deletePrompt()` (Story 1.5) — none of which exist yet. This mirrors the exact precedent set by `FAB.tsx` in Story 1.1 (rendered, not wired, until the story that owns the behavior arrived) and must not be "solved" by adding placeholder alerts, console logs, or partial functionality — leave the buttons visually complete and behaviorally silent.
  - [x] Accessibility: `accessibilityRole="button"`, `accessibilityLabel` of exactly `"Copy prompt"`, `"Favorite"`, `"Edit prompt"`, `"Delete prompt"` respectively, ≥44pt(iOS)/48dp(Android) tap target regardless of the icon's visual size — reuse the `h-12 w-12`-style pattern already used for `TagChip`'s "×" (`components/TagChip.tsx:17`) and the FAB.

- [x] Task 2: Build the Prompt Detail screen (AC: #1, #3, #4, #5)
  - [x] Create `app/prompt/[id].tsx` as a new sibling route under `app/prompt/` (AD-3 — sibling to `create.tsx`, never nested under it; `edit/[id].tsx` doesn't exist yet either, so there's nothing to nest under incorrectly).
  - [x] Read the route param with `useLocalSearchParams<{ id: string }>()` and find the Prompt via `usePrompts().prompts.find((p) => p.id === id)` — call the Repository/Provider through the hook only, never import `promptRepository` directly (AD-1, AD-2).
  - [x] Guard the not-found case (defensive only — no code path can produce it yet since delete doesn't exist until Story 1.5): if no matching prompt is found, call `router.back()` in a `useEffect` and render `null`. Do not build a dedicated "not found" UI/message for this — there's nothing in this story's scope that can trigger it live.
  - [x] Render, top to bottom: full `title` (no `numberOfLines` — unlike `PromptCard`'s 1-line truncation, Detail must show the complete string regardless of length, per AC #1), full `content` (no `numberOfLines`, whitespace/newlines preserved), category, tags, then `DetailActionRow`.
  - [x] **Category display — do not build `CategoryBadge` in this story.** `lib/categories.ts` and `components/CategoryBadge.tsx` are Story 1.9's components (structural seed), and every Prompt in the app today always has `category === ""` (Story 1.2 never wired the picker). Render a plain conditional: `{prompt.category ? <Text className="text-accent text-sm">{prompt.category}</Text> : null}`. This satisfies AC #1's literal "...content, category, and tags" without pulling Story 1.9's component forward; it will read real category values automatically once Story 1.9 ships, no changes needed here.
  - [x] **Tags display — reuse `TagChip` exactly as-is, read-only.** Map `prompt.tags` to `<TagChip key={tag} label={tag} />` with **no `onRemove` prop** — `TagChip`'s `onRemove` is already optional and its "×" only renders when the prop is passed (`components/TagChip.tsx:12`), so this is a zero-modification reuse, not new work. Only render the tags row/wrapper if `prompt.tags.length > 0` (AC #5 — no visible tag section when there are none).
  - [x] Layout: `ScrollView` with `useSafeAreaInsets()`-driven top/bottom padding, matching the exact pattern already established in `app/prompt/create.tsx:50-53` and `app/index.tsx:12` (`insets.top`/`insets.bottom`, `padding: 16`).
  - [x] Do not add a page-level heading like "Prompt Detail" — the Prompt's own title *is* the heading (same reasoning that gave `create.tsx` a "New Prompt" title only because there was no other heading source; here there is one).

- [x] Task 3: Wire the Library card to navigate to Detail (AC: #1)
  - [x] In `components/PromptCard.tsx`, wrap the existing card content in a `Pressable` with `onPress` navigating to Detail (`useRouter()` from `expo-router`, same import pattern as `FAB.tsx`). Use `push`, not `replace` — Detail is reached from Library the same way Create is (AD-3 reserves `replace` for the Detail→Edit hand-off only, which doesn't exist until Story 1.4). **Deviation from the literal snippet in this task:** used `router.push({ pathname: "/prompt/[id]", params: { id: prompt.id } })` instead of the template-literal form `router.push(\`/prompt/${prompt.id}\`)` — Expo Router's generated typed routes (`.expo/types/router.d.ts`) reject a bare template-literal `Href` for a dynamic segment under `tsc --noEmit`; the object form is the type-safe idiom for the same runtime navigation and was required to keep the story's zero-regression tsc gate green.
  - [x] The card has no favorite star or copy icon yet (Story 1.2 explicitly deferred both to Stories 1.7/1.8) — so the *entire* card becomes the tap target in this story; there is no sub-region to exclude. **Left a one-line comment for Stories 1.7/1.8** (`components/PromptCard.tsx`) noting the star/copy icon must be their own nested `Pressable`s so tapping them doesn't also trigger card navigation.
  - [x] Did not add `accessibilityRole="button"` to the whole card wrapper — confirmed by code review that `Pressable`'s default behavior leaves the title/content `Text` children's screen-reader announcement order unchanged.

- [x] Task 4: Accessibility and Dynamic Type verification (AC: #6, #1)
  - [x] Confirmed all four `DetailActionRow` controls have the exact `accessibilityLabel`s and `minHeight`/`minWidth: 48` tap targets (code-review verification, same method as Story 1.2's Task 9 — visual box size, not icon glyph size).
  - [x] Confirmed by code review that Detail's title/content `Text` have no `numberOfLines` and no fixed-height containers, so they remain unclipped at any Dynamic Type size — the specific behavior distinguishing Detail from the card's truncated preview. (Actual on-device largest-accessibility-text-size check deferred to the user's live verification below — no simulator/device in this CLI environment.)

- [x] Task 5: Verify navigation depth, offline behavior, and no regressions (AC: #3, #4, NFR1)
  - [x] Confirmed the navigation stack is exactly one level deep from Library when Detail is open (AC #4) — `app/_layout.tsx`'s root `Stack` has no nested `Stack.Screen` `presentation` overrides, and `app/prompt/[id].tsx` is a flat sibling of `create.tsx`; no code changes were needed.
  - [x] Confirmed returning from Detail via back restores Library unchanged (AC #3) — vacuously satisfied, no search/filter state exists yet (Stories 1.6/1.7/1.10); no state-preservation logic was built.
  - [x] Grepped for `fetch`/`XMLHttpRequest`/`axios` across all new/changed files — zero matches (NFR1).
  - [x] Re-ran `tsc --noEmit`, `expo lint`, and `jest` — all pass, zero regressions (`lib/promptRepository.test.ts`'s 6 tests still pass unchanged).
  - [x] Live-verify on device via Expo Go (no simulator/device available in this CLI environment — hand off to the user, same as Stories 1.1/1.2): tap a card → Detail opens showing full title/content/tags and the four-button action row → tapping Copy/Favorite/Edit/Delete visibly does nothing (expected, not a bug) → back gesture returns to Library. **User confirmed live on device** — card layout, Material Icons, and title-outside-card placement all read correctly; confirmed the four action buttons are visibly present but inert, as expected.

## Dev Notes

- **This story exists to unblock Story 1.8.** The user explicitly chose to build 1.3 before 1.8 because Story 1.8 (Copy Prompt to Clipboard) requires a Copy button inside a Detail action row, and neither the Detail screen nor `DetailActionRow` existed. Stories 1.4–1.7 (Edit, Delete, Search, Favorites) are still `backlog` and were **not** pulled forward — this story only builds what its own ACs require: the Detail screen shell, `DetailActionRow`'s visual/accessibility surface, and card→Detail navigation. Do not implement Edit, Delete, Search, or Favorite-toggle behavior here.
- **Zero new dependencies required.** Everything this story needs (`useLocalSearchParams`, `useRouter`, `Pressable`, `TagChip`, `theme` tokens, `useSafeAreaInsets`) is already installed and in use from Stories 1.1/1.2. No `npx expo install` step in this story.
- **Exact current state of files this story touches** (read directly, not inferred):
  - `components/PromptCard.tsx` currently renders a static `View` (title + 2-line content preview only, no star/copy/category, no tap handler) — Story 1.2 explicitly left it inert pending Story 1.3.
  - `lib/PromptsProvider.tsx`'s `PromptsContextValue` currently exposes `{ prompts, isHydrated, createPrompt }` — this story only *reads* `prompts` via `usePrompts()`, it adds no new Provider/Repository methods (there is no new CRUD operation — viewing is a pure read of already-loaded state).
  - `components/TagChip.tsx` already supports read-only usage today (`onRemove?` is optional, "×" only renders when passed) — reuse directly, do not modify.
  - `app/prompt/create.tsx` is the only existing sibling under `app/prompt/`; this story adds `app/prompt/[id].tsx` alongside it, per AD-3.
  - No component-level test harness exists in this project (only `lib/promptRepository.test.ts` Jest unit tests, per Stories 1.1/1.2's precedent of the Repository being "the natural unit-test seam"). This story adds no new Repository function, so it adds no new Jest coverage — verification is `tsc`/`lint`/live device only, same as Story 1.1's screen-shell work.
- **AD-1/AD-2 compliance:** the Detail screen must call `usePrompts()` only — never import `promptRepository` directly, and never hold its own local copy of the prompt list. Finding "this" prompt is a `.find()` over the array `usePrompts()` already returns.
- **AD-3 compliance:** `app/prompt/[id].tsx` is a sibling of `create.tsx` and (eventually) `edit/[id].tsx` under `app/prompt/` — never nested. Reached via `router.push()` from the card (not `replace` — that's reserved for the future Detail→Edit hand-off in Story 1.4).
- **Known, expected, non-functional state after this story ships:** all four `DetailActionRow` buttons are visible and accessible but do nothing when tapped. This is intentional scope discipline, not a bug — flag it to the user during live device verification so it isn't mistaken for broken behavior (same category of expected gap as Story 1.2's inert Category row before it was removed, except here the plan is for four *future* stories to wire these in one at a time, starting with Story 1.8 wiring Copy next).
- **Accessibility floor applies, as in every prior story:** every icon-only control (all four `DetailActionRow` buttons) needs a text label and ≥44pt/48dp tap target independent of visual icon size. [Source: EXPERIENCE.md#Accessibility Floor]
- **No network, no accounts, no analytics** — permanent constraints (NFR1, NFR4, NFR5); this story is a pure local-read/navigation feature, zero new network surface.
- **Validation-philosophy note:** this story introduces no new user input/validation surface (no forms) — nothing here needs the trim/empty-check pattern from Stories 1.2's Create form.

### Project Structure Notes

- **This story creates:** `app/prompt/[id].tsx`, `components/DetailActionRow.tsx`.
- **This story modifies:** `components/PromptCard.tsx` (wrap in `Pressable`, wire navigation to Detail).
- **This story does not create:** `lib/categories.ts`/`components/CategoryBadge.tsx` (Story 1.9), `components/Toast.tsx` (Story 1.8), `components/ConfirmDialog.tsx` (Story 1.5), `components/SearchBar.tsx`/`FilterRow.tsx` (Stories 1.6/1.7/1.10), `app/prompt/edit/[id].tsx` (Story 1.4). It also does not add `updatePrompt`/`deletePrompt`/`toggleFavorite` to the Repository, and does not install `expo-clipboard`.
- Alignment with the architecture's structural seed: `app/prompt/[id].tsx` is a sibling route under `app/prompt/`, matching AD-3 exactly.

```text
promptforge/
  app/
    index.tsx                 # unchanged this story
    prompt/create.tsx          # unchanged this story
    prompt/[id].tsx             # THIS STORY
    prompt/edit/[id].tsx        # Story 1.4 (does not exist yet)
    _layout.tsx                 # unchanged
  components/
    PromptCard.tsx              # MODIFIED THIS STORY — tap → Detail
    DetailActionRow.tsx          # THIS STORY (visible, inert)
    FAB.tsx / FormInput.tsx / TagChip.tsx   # unchanged, TagChip reused read-only
  lib/
    promptRepository.ts         # unchanged — no new CRUD this story
    PromptsProvider.tsx          # unchanged — read-only usage via usePrompts()
    theme.ts                     # unchanged
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: View Prompt Details]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-prompt-forge-2026-07-08/ARCHITECTURE-SPINE.md#AD-1, #AD-2, #AD-3, #Structural Seed]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-prompt-forge-2026-07-08/DESIGN.md#Components (Detail action row, Tag chip, Category badge)]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-prompt-forge-2026-07-08/EXPERIENCE.md#Information Architecture, #Component Patterns (Prompt card, Detail actions), #Accessibility Floor]
- [Source: _bmad-output/planning-artifacts/prds/prd-prompt-forge-2026-07-08/prd.md#FR-4]
- [Source: _bmad-output/implementation-artifacts/1-2-create-a-prompt.md — Dev Notes scope-discipline precedent, `TagChip`'s optional-`onRemove` read-only support, safe-area/insets pattern]
- [Source: _bmad-output/implementation-artifacts/1-1-app-shell-foundation.md — FAB-rendered-but-inert precedent later wired by 1.2]

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- 2026-07-09: Implemented Tasks 1–3 (`DetailActionRow`, `app/prompt/[id].tsx`, `PromptCard` tap-to-navigate wiring).
- 2026-07-09: `tsc --noEmit` initially failed — `PromptCard.tsx`'s `router.push(\`/prompt/${prompt.id}\`)` (the literal form named in Task 3) doesn't type-check against Expo Router's generated typed routes for a dynamic segment. Regenerated `.expo/types/router.d.ts` via `npx expo export --platform web` (confirmed it already included `/prompt/[id]`), so this wasn't a stale-typegen issue like Story 1.2's — it's that a bare template-literal `Href` is never assignable to a dynamic-segment route under Expo Router's typed routes. Fixed by switching to the object form `router.push({ pathname: "/prompt/[id]", params: { id: prompt.id } })`, which is the type-safe idiom for the same runtime navigation.
- 2026-07-09: `expo lint` clean. `jest` — all 6 existing tests in `lib/promptRepository.test.ts` still pass unchanged (this story adds no new Repository function, so no new Jest coverage, per Dev Notes precedent from Story 1.1's screen-shell work). Grepped for `fetch`/`XMLHttpRequest`/`axios` — no matches.
- Task 5's live device-verification subtask (tap card → Detail → four inert buttons → back → Library) requires a physical/simulator device not available in this CLI environment — handed off to the user, matching Stories 1.1/1.2's precedent.
- 2026-07-09: User live-viewed the Detail screen and requested the title/content/category/tags block be presented in its own card, matching the Library card's visual style, for consistency between the two surfaces. Wrapped that block in a `View` styled identically to `PromptCard`'s container (`bg-surface-raised border-border-hairline rounded-md border p-4`); `DetailActionRow` stays outside/below the card as its own row, matching `DESIGN.md`'s Detail action row being a distinct component from the card. `tsc --noEmit` and `expo lint` re-verified clean.
- 2026-07-09: User then asked to (a) keep the title outside the card and (b) flagged the `DetailActionRow` icons as visually inconsistent, asking what icon set was in use and suggesting Material Icons. Root cause: this story had no icon library available (`@expo/vector-icons` wasn't installed — confirmed absent from `node_modules` during original Task 1 build), so icons were plain mixed Unicode glyphs (⧉/★-☆/✎/🗑 — a geometric symbol, two text-presentation characters, and one default-emoji-presentation character all in one row), which is what read as inconsistent. **New dependency added: `@expo/vector-icons` via `npx expo install @expo/vector-icons`** (Expo's official, SDK-version-matched icon package; bundles Material Icons among other sets). Swapped `DetailActionRow`'s glyphs for `MaterialIcons`: `content-copy`, `star`/`star-border` (favorite, unchanged accent/ink-secondary color rule), `edit`, `delete` — all rendered as a single consistent icon family at `size={24}`. Moved `app/prompt/[id].tsx`'s title `Text` back out above the card `View` (content/category/tags remain inside the card). Re-verified clean: `tsc --noEmit`, `expo lint`, `jest` (6/6).
- 2026-07-09: User live-verified on device: card layout, Material Icons, and title placement all confirmed correct; confirmed all four `DetailActionRow` buttons are visibly present but inert (expected, per this story's explicit scope — Stories 1.4/1.5/1.7/1.8 wire them up individually). Task 5's live-verification subtask now complete; all story tasks checked.

### Completion Notes List

- New component: `components/DetailActionRow.tsx` — four evenly-spaced icon-plus-label `Pressable`s (Copy, Favorite, Edit, Delete) at `spacing.4` padding, each with `minHeight`/`minWidth: 48` and the exact `accessibilityLabel`s specified. Copy/Edit in `ink-primary`, Delete in `danger`, Favorite in `accent` (filled) when `isFavorite` else `ink-secondary` (outline). Icons render via `@expo/vector-icons`'s `MaterialIcons` (`content-copy`, `star`/`star-border`, `edit`, `delete`) at `size={24}` — added after user feedback that the original plain-Unicode-glyph icons (per `FAB.tsx`/`TagChip.tsx` precedent) read as visually inconsistent; see Debug Log. All four `Pressable`s have no `onPress` — functionally inert per this story's explicit scope.
- New screen: `app/prompt/[id].tsx` — reads the route param via `useLocalSearchParams<{ id: string }>()`, finds the Prompt via `usePrompts().prompts.find(...)` only (no direct Repository import), guards not-found with `router.back()` in a `useEffect` + render `null`. Title renders above the card (heading, no `numberOfLines`). Content, the conditional category `Text` (no `CategoryBadge`), and read-only `TagChip`s (only when `tags.length > 0`) render inside a `PromptCard`-styled container per user request during live testing. `DetailActionRow` sits below/outside that card.
- `components/PromptCard.tsx`: wrapped the existing card `View` in a `Pressable` (kept the same `View`-era styling classes), navigating to Detail via `router.push({ pathname: "/prompt/[id]", params: { id: prompt.id } })` — see Debug Log for why the object form was required over the task's literal template-string snippet. Did not add `accessibilityRole="button"` to the wrapper (confirmed by code review this doesn't change how title/content `Text` children are announced). Left a one-line comment flagging that Stories 1.7/1.8's star/copy icons must be their own nested `Pressable`s.
- One new dependency added mid-story, beyond the original Dev Notes' "zero new dependencies" expectation: `@expo/vector-icons`, added per explicit user request during live-device feedback (see Debug Log) to replace inconsistent placeholder glyphs with a proper icon set.
- No scope creep: Copy/Favorite/Edit/Delete remain fully inert (no alerts, no console logs, no partial wiring); no `CategoryBadge`, `Toast`, `ConfirmDialog`, `SearchBar`/`FilterRow`, or `app/prompt/edit/[id].tsx` were built; no `updatePrompt`/`deletePrompt`/`toggleFavorite` were added to the Repository/Provider.

### File List

- `components/DetailActionRow.tsx` (new)
- `app/prompt/[id].tsx` (new)
- `components/PromptCard.tsx` (modified — wrapped card in `Pressable`, wired navigation to Detail)
- `package.json` (modified — added `@expo/vector-icons` dependency)
- `package-lock.json` (modified — lockfile update from `@expo/vector-icons` install)

## Change Log

- 2026-07-09: Implemented Tasks 1–4 and Task 5's automated checks in full. Added `DetailActionRow` (visible, inert, four buttons) and `app/prompt/[id].tsx` (Detail screen shell, read-only), wired `PromptCard` to navigate to Detail on tap. `tsc --noEmit`, `expo lint`, and `jest` (6/6) all pass clean with zero regressions; grepped for network APIs with zero matches. Task 5's live on-device verification (tap card → Detail → inert action row → back → Library) is pending — no device/simulator available in this environment; handed off to the user, matching Stories 1.1/1.2's precedent.
