---
baseline_commit: 34138cb353d691da5c37a02c6a2fca530839866f
---

# Story 1.1: App Shell & Foundation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to open PromptForge and immediately see a ready, working app,
so that I know it launched correctly before I've saved anything.

## Acceptance Criteria

1. **Given** the app has just been installed and never opened, **When** I launch PromptForge, **Then** the native splash screen stays visible while the app initializes, **And** once ready, I see the Library screen with an empty-state message "No prompts yet." and nothing else — no illustration, no suggested prompts, **And** a persistent "+" FAB is visible in the bottom-right corner.

2. **Given** the app is running, **When** it loads, **Then** no skeleton loader, spinner, or loading indicator ever appears on any screen, **And** the splash-to-Library transition is the only "loading" the user perceives.

3. **Given** the project is freshly scaffolded, **When** a developer inspects the codebase, **Then** it is an Expo (managed) app on SDK 56 using Expo Router for navigation, **And** `lib/theme.ts` exists and defines the full design-token set (colors, typography, rounded, spacing) as the single source NativeWind's config extends from, **And** the app runs on both iOS and Android from the same codebase via Expo Go.

4. **Given** the app is running, **When** any screen renders, **Then** no network request of any kind is made — the app functions fully with the device in airplane mode.

5. **Given** the Library screen, **When** I look for ways to manage prompts, **Then** there is no pull-to-refresh gesture and no multi-select/bulk-action mode anywhere in the app.

## Tasks / Subtasks

- [x] Task 1: Scaffold the Expo project (AC: #3)
  - [x] Scaffold in the repository root (`d:\Work\prompt-forge`, which currently holds only planning docs, no app code) using the default Expo Router template: `npx create-expo-app@latest . --template default`. This ships TypeScript and file-based routing under `app/` by default.
  - [x] Confirm `expo` resolves to **SDK 56** in the generated `package.json`; if the CLI scaffolds a newer default SDK, run `npx expo install expo@56` to pin it, then `npx expo install --fix` to align the rest of the dependency set. **DEVIATION: bumped to SDK 57, see Debug Log.**
  - [x] Confirm the project runs via `npx expo start` and loads in Expo Go on both an iOS and an Android device/simulator. **Verified live on Android via Expo Go (user device). No iOS hardware/simulator available to the user; iOS verified only via successful `expo export --platform ios` compilation (zero errors) — accepted as a known gap per user decision, see Debug Log.**
- [x] Task 2: Install and wire NativeWind (AC: #3)
  - [x] Install `nativewind` pinned to `^4.2.6` (not `@latest` — v5 is CSS-first and breaking; pin the caret range explicitly in `package.json`) plus `tailwindcss` per NativeWind's Expo installation guide.
  - [x] Configure `babel.config.js`: `babel-preset-expo` with `jsxImportSource: "nativewind"`, plus the `nativewind/babel` preset.
  - [x] Configure `metro.config.js`: `getDefaultConfig` from `expo/metro-config`, wrapped with NativeWind's `withNativeWind`, pointing at the global CSS file.
  - [x] Create `global.css` with the three `@tailwind` directives (base/components/utilities) and import it once in `app/_layout.tsx`.
  - [x] Configure `tailwind.config.js` `content` globs to cover `app/**/*.{ts,tsx}` and `components/**/*.{ts,tsx}`.
  - [x] After config changes, clear the Metro cache (`npx expo start -c`) before verifying styles render.
- [x] Task 3: Create the design-token source of truth (AC: #3)
  - [x] Create `lib/theme.ts` mirroring `DESIGN.md`'s frontmatter tokens verbatim: colors (`surface-base` #F7F7F5, `surface-raised` #FFFFFF, `ink-primary` #1C1C1E, `ink-secondary` #6E6E73, `ink-disabled` #B0B0B5, `accent` #4453C9, `accent-soft` #E8EAFB, `on-accent` #FFFFFF, `border-hairline` #E5E5E5, `danger` #B83A3A), rounded (`sm` 8px, `md` 12px, `full` 9999px), spacing (`1`–`6`: 4/8/12/16/24/32px).
  - [x] Extend `tailwind.config.js`'s `theme.extend` **from** `lib/theme.ts`'s exported values — do not hardcode hex values a second time in the Tailwind config; components later reference classes like `bg-accent`, never a raw hex.
- [x] Task 4: Define the `Prompt` entity type (AC: #3)
  - [x] Create `types/prompt.ts` with the exact contract from the PRD addendum: `{ id: string; title: string; content: string; category: string; tags: string[]; isFavorite: boolean; createdAt: string; updatedAt: string; }`. `category: ''` represents "no category" (do not use `category?: string`).
- [x] Task 5: Stand up the Repository/Provider skeleton for hydration only — **do not implement CRUD methods in this story** (AC: #1, #2, #4)
  - [x] Create `lib/promptRepository.ts` with only `getAllPrompts(): Promise<Prompt[]>`, reading the single JSON blob from AsyncStorage (`@react-native-async-storage/async-storage`, installed via `npx expo install`) and returning `[]` if nothing is stored yet. Catch and log (console only) any read failure — no user-facing error state.
  - [x] Create `lib/PromptsProvider.tsx` (React Context) + `usePrompts()` hook that calls `getAllPrompts()` once on mount and exposes the resulting list (empty array initially). This is the seam `createPrompt`/`updatePrompt`/`deletePrompt`/`toggleFavorite` will be added to by Stories 1.2, 1.4, 1.5, and 1.7 respectively — do not add those methods now.
  - [x] Wrap the app in `PromptsProvider` inside `app/_layout.tsx`.
- [x] Task 6: Gate the splash screen on hydration (AC: #1, #2)
  - [x] In `app/_layout.tsx`, call `SplashScreen.preventAutoHideAsync()` (`expo-splash-screen`, installed via `npx expo install`) before the component tree renders, then call `SplashScreen.hideAsync()` once `PromptsProvider`'s initial AsyncStorage read resolves.
  - [x] **Known risk:** `preventAutoHideAsync()` has an open, unresolved upstream issue on SDK 56 where the splash screen can auto-hide regardless (expo/expo#45756). If it doesn't reliably hold the splash screen at implementation time, fall back to a plain conditional render — `return null` from the root layout until hydration resolves — which still avoids a visible skeleton/spinner and satisfies AC #2 either way.
  - [x] Do not add any `ActivityIndicator`, spinner, or skeleton component anywhere — the splash screen (or the `null` fallback) is the only loading state permitted (AC #2).
- [x] Task 7: Build the Library screen shell (AC: #1, #5)
  - [x] `app/index.tsx`: render "No prompts yet." (exact string, flat/factual, no emoji) when `usePrompts()`'s list is empty, and nothing else in that state — no illustration, no suggested prompts.
  - [x] Do not implement search, filters, or the card list yet — those belong to later stories. This screen only needs to prove the empty state and FAB.
  - [x] Confirm no `RefreshControl`/pull-to-refresh and no multi-select/bulk-action affordance exists anywhere in the screen (AC #5).
- [x] Task 8: Build the `FAB` component (AC: #1)
  - [x] `components/FAB.tsx`: `accent` fill, `on-accent` "+" icon, `rounded-full`, fixed bottom-right, low shadow (the one exception to the app's no-drop-shadow rule), visible on every Library state including empty.
  - [x] Accessibility label "Create prompt"; tap target ≥44pt (iOS) / ≥48dp (Android) regardless of the visual icon size.
  - [x] Do not wire `onPress` to navigate to `/prompt/create` yet — that route doesn't exist until Story 1.2. Render the FAB with a no-op (or no `onPress`) for this story; Story 1.2 wires the navigation.
- [x] Task 9: Establish Expo Router file structure per AD-3 (AC: #3)
  - [x] Root `_layout.tsx` is a plain Stack layout (no tab bar, no drawer) wrapping `PromptsProvider`.
  - [x] Do not create `app/prompt/[id].tsx`, `app/prompt/create.tsx`, or `app/prompt/edit/[id].tsx` yet — those are scaffolded by Stories 1.3, 1.2, and 1.4 respectively as siblings under `app/prompt/`, never nested under each other (AD-3). This story only needs `app/index.tsx` and `app/_layout.tsx` to exist.
- [x] Task 10: Verify offline and cross-platform behavior (AC: #4, #3)
  - [x] Put the device/simulator in airplane mode and confirm the app still launches and renders the Library screen (AC #4). **Verified on Android: app loaded over Wi-Fi, then airplane mode enabled without closing/reloading — app continued rendering the Library screen normally.**
  - [x] Confirm no code path in this story calls `fetch`, adds an analytics/telemetry SDK, or otherwise reaches the network (NFR1, NFR5). Verified via source grep across `app/`, `components/`, `lib/`, `types/` — no matches for `fetch`, `XMLHttpRequest`, `axios`, or any analytics SDK; dependency list contains no telemetry packages.
  - [x] Run the app via Expo Go on both an iOS and an Android target to confirm parity (AC #3). **Android confirmed live via Expo Go. iOS confirmed only via successful `expo export --platform ios` compilation (zero errors); no iOS hardware/simulator available to the user — accepted as a known gap per user decision, see Debug Log.**

## Dev Notes

- **Architecture paradigm (binding for the whole app, not just this story):** Layered, one direction of dependency — Presentation (`app/`, `components/`) → State (`PromptsProvider`/`usePrompts()`) → Repository (`lib/promptRepository.ts`) → Storage (AsyncStorage). No screen or component may import AsyncStorage or the Repository directly — only `usePrompts()`. [Source: ARCHITECTURE-SPINE.md#Design Paradigm, #AD-1, #AD-2]
- **Scope discipline for this story:** Story 1.1 is infrastructure only. It stands up the Repository/Provider as a read-only skeleton (`getAllPrompts()` returning `[]` on a fresh install) purely to satisfy the splash-gated-hydration requirement in AC #1/#2. `createPrompt()` arrives in Story 1.2, `updatePrompt()` in Story 1.4, `deletePrompt()` in Story 1.5, `toggleFavorite()` in Story 1.7. Do not pull any of that work forward — and do not skip the skeleton either, since 1.2 needs the Provider/Repository seam already in place to extend rather than create from scratch.
- **Design tokens are single-sourced:** `lib/theme.ts` mirrors `DESIGN.md`'s frontmatter tokens verbatim and is the one place colors/typography/rounded/spacing are declared; NativeWind's Tailwind config extends from it. Components must reference Tailwind classes (`bg-accent`, `text-ink-secondary`, etc.), never a hardcoded hex — this is the same single-source-of-truth discipline AD-1 applies to data. [Source: ARCHITECTURE-SPINE.md#Consistency Conventions; DESIGN.md frontmatter]
- **NativeWind pinning:** `^4.2.6` exactly, not `@latest` — v5 is a breaking CSS-first rewrite expected to take over the `latest` npm tag on a timeline that doesn't line up with this build. [Source: ARCHITECTURE-SPINE.md#Stack]
- **Splash-screen hydration is the only loading state in the entire app.** No skeleton loaders anywhere, ever (this is a hard UX ban, not just an MVP shortcut). `expo-splash-screen`'s `preventAutoHideAsync()` has a known, currently-open SDK 56 issue (expo/expo#45756, filed against this exact SDK) where the splash can auto-hide before the app calls `hideAsync()`. The architecture's own accepted fallback is a plain conditional `return null` from the root layout until the Provider's initial read resolves — implement `preventAutoHideAsync()` first, but don't burn significant time chasing it if it proves unreliable; fall back immediately. [Source: ARCHITECTURE-SPINE.md#Consistency Conventions (State & cross-cutting); web verification 2026-07-08 against github.com/expo/expo/issues/45756]
- **No pull-to-refresh, no multi-select/bulk mode, no swipe gestures — anywhere in the app, not just this story.** These are permanent interaction bans from the UX spine, not just absent-because-not-built-yet. [Source: EXPERIENCE.md#Interaction Primitives "Banned"]
- **FAB must be visible on every Library state including empty** — this is tested directly in AC #1. Do not gate its rendering on the prompt list being non-empty.
- **Prompt entity type** — exact contract, do not deviate: `{ id: string; title: string; content: string; category: string; tags: string[]; isFavorite: boolean; createdAt: string; updatedAt: string; }`. `category: ''` is the "no category" sentinel (distinct from a filter's `null` sentinel, which is Story 1.10's concern, not this one's). [Source: addendum.md#Original Prompt Data Shape]
- **Accessibility floor applies from this story forward:** every icon-only control (the FAB here; star/copy/trash in later stories) needs a text label and ≥44pt/48dp tap target, independent of visual icon size. [Source: EXPERIENCE.md#Accessibility Floor]
- **No network, no accounts, no analytics** are permanent constraints (NFR1, NFR4, NFR5) — don't let the Expo Router starter template pull in anything that phones home (it doesn't, by default, but double-check `app.json`/`package.json` after scaffold for any telemetry-adjacent Expo config).

### Project Structure Notes

- This story creates: `app/_layout.tsx`, `app/index.tsx`, `components/FAB.tsx`, `lib/theme.ts`, `lib/promptRepository.ts` (skeleton), `lib/PromptsProvider.tsx` (skeleton), `types/prompt.ts`, plus the NativeWind config files (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`).
- This story does **not** create: `app/prompt/[id].tsx`, `app/prompt/create.tsx`, `app/prompt/edit/[id].tsx`, `lib/categories.ts`, or `components/PromptCard.tsx`/`SearchBar.tsx`/`FilterRow.tsx`/etc. Those are scaffolded by the stories that need them (1.2–1.10), matching the architecture's full structural seed. Creating them now would be scope creep and risks the file/folder drifting from what its owning story actually needs.
- Full target structure (for orientation only — do not build all of it now): [Source: ARCHITECTURE-SPINE.md#Structural Seed]

```text
promptforge/
  app/
    index.tsx                # THIS STORY
    prompt/[id].tsx           # Story 1.3
    prompt/create.tsx         # Story 1.2
    prompt/edit/[id].tsx      # Story 1.4
    _layout.tsx               # THIS STORY
  components/
    FAB.tsx                   # THIS STORY
    PromptCard.tsx / SearchBar.tsx / FilterRow.tsx / CategoryBadge.tsx /
    TagChip.tsx / Toast.tsx / ConfirmDialog.tsx / DetailActionRow.tsx /
    FormInput.tsx              # later stories
  lib/
    promptRepository.ts       # THIS STORY (skeleton: getAllPrompts only)
    PromptsProvider.tsx        # THIS STORY (skeleton: hydration only)
    categories.ts              # Story 1.9
    theme.ts                   # THIS STORY
  types/
    prompt.ts                 # THIS STORY
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: App Shell & Foundation]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-prompt-forge-2026-07-08/ARCHITECTURE-SPINE.md#Design Paradigm, #AD-1, #AD-2, #AD-3, #Consistency Conventions, #Stack, #Structural Seed, #Deferred]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-prompt-forge-2026-07-08/DESIGN.md frontmatter, #Components (FAB)]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-prompt-forge-2026-07-08/EXPERIENCE.md#Foundation, #Interaction Primitives, #Accessibility Floor]
- [Source: _bmad-output/planning-artifacts/prds/prd-prompt-forge-2026-07-08/prd.md#FR-4 Notes (empty-state), §5 Non-Goals, NFR1/NFR4/NFR5]
- [Source: _bmad-output/planning-artifacts/prds/prd-prompt-forge-2026-07-08/addendum.md#Original Prompt Data Shape]
- Web verification (2026-07-08): NativeWind `^4.2.6` + Expo Router + SDK 56 install steps (babel/metro/global.css/tailwind content globs) — nativewind.dev/docs/getting-started/installation; `expo-splash-screen` SDK 56 `preventAutoHideAsync()` known issue — github.com/expo/expo/issues/45756.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `create-expo-app@latest`'s current default template (as of 2026-07-08/09) has drifted from what this story assumed: it now scaffolds a tabs-based demo under `src/app/` on Expo SDK 57, not a flat `app/`-rooted TypeScript template. Scaffolded into a scratch temp directory instead of the repo root, then hand-built the flat `app/`, `components/`, `lib/`, `types/` structure the architecture spine (AD-3) requires from the scaffold's `package.json`/`app.json`/`assets` baseline, discarding the generated demo tab screens/components.
- Pinned `expo` to SDK 56 via `npx expo install expo@56` then `npx expo install --fix` per the story's explicit fallback instruction; installed `expo@56.0.15` confirmed via `node_modules/expo/package.json`.
- **DEVIATION from story spec — bumped SDK 56 → 57:** user first tried the SDK 56 build with a freshly-downloaded Play Store Expo Go and got "project requires a newer version of Expo Go." Asked the user to check Expo Go's supported SDK (Profile tab): it reported client 54.0.8 / SDK 54 — older than both 56 and 57. User then downloaded Expo Go directly from expo.dev instead, which reported SDK 57. Ran `npx expo install expo@57` + `npx expo install --fix` to match; the `--fix` step hit an `ERESOLVE` peer conflict (`react-native@0.86.0` vs. a stale `@react-native/jest-preset@0.86.0` left from a half-applied dependency bump) and two dev dependencies (`eslint-config-expo`, `jest-expo`) weren't bumped by `--fix` before it failed — fixed by hand-editing those two lines in `package.json` to `~57.0.0`/`~57.0.1`, then a clean `rm -rf node_modules package-lock.json && npm install`. Confirmed `expo@57.0.4` installed. Re-ran `tsc --noEmit`, `expo lint`, `jest` (3/3), and `expo export --platform ios/android` — all clean on SDK 57. Net effect: the story's own "pin to SDK 56" instruction was itself written against an assumption (56 was the then-current npm default) that didn't hold once checked against the real, currently-installable Expo Go client. SDK 57 is now the project's target SDK throughout `package.json`/`app.json`; all Dev Notes/task text elsewhere in this story that mention SDK 56 should be read as superseded by this entry.
- `tailwind.config.js` requires `./lib/theme.ts` directly (a `.ts` file) from a `.js` config — works because Node 24's built-in TypeScript type-stripping handles the `as const`-only syntax in that file; verified by evaluating the resolved config with plain `node -e`.
- NativeWind's `className` prop and `*.css` side-effect imports needed `nativewind-env.d.ts` (`/// <reference types="nativewind/types" />` + `declare module "*.css"`) added to satisfy `tsc --noEmit`; NativeWind auto-registered it into `tsconfig.json`'s `include` on first `expo start` run.
- Jest: `jest-expo` preset requires `expo-modules-core` as a direct dependency (not just transitive) or its setup script fails to resolve it — added via `npx expo install expo-modules-core`. AsyncStorage's native module isn't available under Jest by default; wired the official mock via `jest.setup.js` (`jest.mock(...)` pointing at `@react-native-async-storage/async-storage/jest/async-storage-mock`) referenced from `package.json`'s `jest.setupFiles`, per AsyncStorage's own Jest integration docs.
- **Environment limitation:** this is a headless CLI environment with no iOS/Android simulator or physical device attached, and no Expo Go client. Three subtasks require an actual device/simulator (Task 1's Expo Go load-and-run check, Task 10's airplane-mode check, Task 10's Expo Go iOS/Android parity check) and could not be executed. Asked the user how to proceed (AskUserQuestion); user chose to perform this verification themselves. In place of device testing, verified: `tsc --noEmit` clean, `expo lint` clean (zero output), `jest` (3/3 tests pass), and `npx expo export --platform ios` / `--platform android` both compile the full dependency graph (1462 and 1556 modules respectively) with zero bundler errors — the strongest available signal short of an actual device run.
- **Live device verification (Android, user):** ran `npx expo start`; a leftover background Metro process from earlier CLI testing was holding port 8081 and had to be killed first (`Stop-Process`) to free it. User connected via Expo Go (manual URL `exp://<LAN-IP>:8081`, LAN IP found via `ipconfig`) and confirmed: splash screen resolved into the Library screen showing exactly "No prompts yet." with the "+" FAB visible bottom-right and correctly a no-op (Story 1.2 wires navigation). Airplane-mode check done correctly (load over Wi-Fi first, then enable airplane mode without closing/reloading the app, since Expo Go's dev-mode JS bundle transfer inherently requires network to *cold-start* a connection — that's a dev-tooling constraint, not a violation of AC #4, which concerns the running app's own network usage): app continued rendering the Library screen normally with airplane mode on.
- **iOS not device-verified:** user has no iOS hardware or simulator available. Per user decision, accepted `npx expo export --platform ios` (zero errors, full 1462-module dependency graph compiles) as sufficient evidence in place of a live iOS run. This is a known gap — a real iOS device/simulator run should happen whenever one becomes available, though nothing in this story's code is platform-branched (no `Platform.select`/`.ios.`/`.android.` files), so risk of iOS-specific breakage is low.

### Completion Notes List

- Scaffolded a fresh Expo Router app (SDK 56) at the repo root, replacing the current `create-expo-app` default template's tabs/`src/`-based structure with the flat `app/`/`components/`/`lib/`/`types/` layout mandated by ARCHITECTURE-SPINE.md's AD-3 structural seed.
- Installed and wired NativeWind `^4.2.6` (babel, metro, global.css, tailwind content globs); `tailwind.config.js`'s `theme.extend` is sourced directly from `lib/theme.ts` with no duplicated hex values.
- `lib/theme.ts` mirrors `DESIGN.md`'s frontmatter tokens verbatim (colors, rounded, spacing); typography is represented as platform-native notes since DESIGN.md specifies no concrete font-size tokens.
- `types/prompt.ts` matches the PRD addendum's `Prompt` contract exactly, with `category: string` (not optional) per the `''` = "no category" sentinel convention.
- Repository/Provider skeleton (`lib/promptRepository.ts`, `lib/PromptsProvider.tsx`) implements read-only hydration only — `getAllPrompts()` is the sole exported function, returns `[]` on empty/failed reads, and logs failures to console only. `usePrompts()` exposes `{ prompts, isHydrated }`; no CRUD methods added, matching the scope discipline called out in Dev Notes for Stories 1.2/1.4/1.5/1.7 to extend later.
- `app/_layout.tsx` wraps the tree in `PromptsProvider`, calls `SplashScreen.preventAutoHideAsync()` up front, calls `hideAsync()` once hydration resolves, and *also* renders `null` until hydration resolves regardless of whether the native splash hold succeeds — implementing both the primary approach and the Dev Notes' accepted fallback simultaneously so AC #1/#2 hold even if the known SDK 56 `preventAutoHideAsync` issue (expo/expo#45756) reproduces.
- `app/index.tsx` (Library screen) renders exactly "No prompts yet." with no other content when the list is empty, alongside the always-visible `FAB`; no search/filter/list/RefreshControl/multi-select present.
- `components/FAB.tsx`: accent-filled, `rounded-full`, bottom-right, `on-accent` "+" glyph, `shadow-sm`, 56×56pt/dp box (exceeds both the 44pt iOS and 48dp Android minimums), `accessibilityLabel="Create prompt"`, no `onPress` wired (deferred to Story 1.2).
- Verified no network/analytics code path exists anywhere in the new source (grepped for `fetch`, `XMLHttpRequest`, `axios`, `analytics`, `Sentry`, `Amplitude`, `Segment` across `app/`, `components/`, `lib/`, `types/` — zero matches) and the dependency list contains no telemetry packages.
- Added a Jest unit-test suite (`lib/promptRepository.test.ts`, 3 tests) covering `getAllPrompts()`'s three real behaviors: empty-storage → `[]`, populated-storage → parsed array, and read-failure → `[]` + logged error. All pass. `tsc --noEmit` and `expo lint` are both clean.
- Project SDK is **57**, not the story's originally-specified 56 — see Debug Log for the real-device compatibility reason this changed mid-implementation.
- Live-verified on Android via Expo Go (splash → Library empty state → FAB, plus airplane-mode continuity after initial load). iOS verified via clean `expo export --platform ios` compilation only — no iOS hardware/simulator was available to the user; accepted as a documented known gap rather than blocking the story.

### File List

- `package.json` (new)
- `package-lock.json` (new)
- `app.json` (new)
- `tsconfig.json` (new)
- `babel.config.js` (new)
- `metro.config.js` (new)
- `tailwind.config.js` (new)
- `global.css` (new)
- `nativewind-env.d.ts` (new)
- `jest.setup.js` (new)
- `.vscode/` (new, from scaffold)
- `assets/` (new, from scaffold)
- `lib/theme.ts` (new)
- `types/prompt.ts` (new)
- `lib/promptRepository.ts` (new)
- `lib/promptRepository.test.ts` (new)
- `lib/PromptsProvider.tsx` (new)
- `app/_layout.tsx` (new)
- `app/index.tsx` (new)
- `components/FAB.tsx` (new)

## Change Log

- 2026-07-09: Implemented Tasks 1–9 in full and Task 10's network-check subtask. Scaffolded Expo Router app (SDK 56) with NativeWind, design tokens, Prompt type, read-only Repository/Provider skeleton, splash-gated hydration, Library screen empty state, and FAB. Added Jest unit tests for the Repository. Left three device/simulator-dependent subtasks (Task 1, Task 10) pending user verification — no device/simulator available in this environment.
- 2026-07-09: Bumped project SDK 56 → 57 after live device testing showed the story's original SDK 56 target was incompatible with the actually-available Expo Go client (user's Play Store install reported SDK 54 support; the expo.dev direct download reported SDK 57 — neither matched 56). Re-verified `tsc`/`lint`/`jest`/`expo export` all clean on SDK 57.
- 2026-07-09: Completed device verification with user on Android via Expo Go — confirmed splash → Library empty state → FAB rendering, and airplane-mode continuity after initial load (AC #1, #2, #4). iOS device/simulator unavailable to user; accepted `expo export --platform ios` clean compilation as substitute evidence per user decision, documented as a known gap. All tasks now complete; story moved to `review`.
