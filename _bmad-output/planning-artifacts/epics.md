---
stepsCompleted: [step-01, step-02, step-03, step-04]
inputDocuments:
  - "{planning_artifacts}/prds/prd-prompt-forge-2026-07-08/prd.md"
  - "{planning_artifacts}/architecture/architecture-prompt-forge-2026-07-08/ARCHITECTURE-SPINE.md"
  - "{planning_artifacts}/ux-designs/ux-prompt-forge-2026-07-08/DESIGN.md"
  - "{planning_artifacts}/ux-designs/ux-prompt-forge-2026-07-08/EXPERIENCE.md"
---

# PromptForge - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for PromptForge, decomposing the requirements from the PRD, UX design contract (DESIGN.md + EXPERIENCE.md), and Architecture spine into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: A user can create a new Prompt by entering a title and content, and optionally a category and one or more tags. Title and Content are required (blocked on empty); category/tags optional. The app assigns a unique `id` and sets `createdAt`/`updatedAt` automatically. A persistent "+" (FAB) is the entry point, visible on every Library state including empty.

FR2: A user can edit the title, content, category, or tags of an existing Prompt. Saving updates `updatedAt` to the current time; `createdAt` never changes. Title/Content still cannot be saved empty.

FR3: A user can permanently delete a Prompt. The app requires a confirmation step before deleting (no backup exists, so deletion is unrecoverable). Once confirmed, the Prompt is immediately removed from the library, search results, and Favorites.

FR4: A user can open a Prompt from the library list to see its full title, content, category, and tags, unclipped regardless of length. Copy and Favorite toggle are both reachable from this view.

FR5: A user can search the library by text matching against a Prompt's title, content, or tags. Matching is a live, case-insensitive substring match (not fuzzy/ranked). Clearing the search returns to the full (or currently filtered) list. Empty results show a "no matches" state.

FR6: A user can mark or unmark any Prompt as a Favorite from the library list or detail view, in a single tap with no confirmation step. The favorite state is visually distinguishable wherever the Prompt appears.

FR7: A user can switch the library view between "All" and "Favorites." The Favorites filter combines with an active Search query rather than resetting it.

FR8: A user can copy a Prompt's content to the system clipboard in one tap, from either the library list or the detail view. Copy places plain text only (no tool-specific formatting) and shows a visual confirmation. Works fully offline.

FR9: A user can optionally assign a Prompt to one category from a fixed preset list (Development, Writing, Research, Marketing, Career, General) via a dropdown/picker. No free text, no custom categories, no category CRUD. Category is optional, not required.

FR10: A user can filter the library view to a single category, the same way the Favorites filter works. Combines with Search and Favorites (AND). Prompts with no category assigned are excluded from any active category filter.

### NonFunctional Requirements

NFR1: The app must be fully functional offline — no feature (create/edit/delete/view/search/favorite/copy) depends on network connectivity.

NFR2: All data persists locally on-device only, surviving app restarts and reboots, until the app is uninstalled. No cloud sync, no server-side storage of any kind.

NFR3: The app runs on both iOS and Android from a single React Native (Expo) codebase.

NFR4: No user accounts, authentication, or login of any kind.

NFR5: No analytics or telemetry collection — no usage data leaves the device.

NFR6: Time from opening the app to a known Prompt landing on the clipboard should be comfortably under 10 seconds (PRD SM-2).

NFR7: Every icon-only interactive control (favorite star, copy icon, delete/trash icon) carries a VoiceOver/TalkBack label and current-state announcement.

NFR8: Tap targets are ≥44pt (iOS) / ≥48dp (Android), including compact card-level icons — not just full-size buttons.

NFR9: Dynamic type is honored at every text role (title/body/meta); no truncated controls at the largest accessibility text size.

NFR10: Initial app load shows the full prompt library instantly with no visible loading/skeleton state.

### Additional Requirements

- **Starter/greenfield template:** Expo (managed workflow), SDK 56, initialized with the Expo Router template (`npx create-expo-app`) — this is the starter for Epic 1 Story 1.
- **Paradigm:** Layered — Presentation (screens/components) → State (Context) → Repository → Storage — one direction of dependency, enforced by AD-1/AD-2/AD-3 in the architecture spine.
- **Storage:** AsyncStorage only, single JSON blob holding the full Prompt array. No backend, no API, no relational database.
- **Data-access gateway (AD-1):** Exactly one module, `lib/promptRepository.ts`, owns all AsyncStorage reads/writes, id generation, and timestamping. No screen/component may import AsyncStorage directly. Writes always act on the single in-memory list (never a fresh re-read), closing a read-modify-write race. `toggleFavorite()` is a dedicated function that does not bump `updatedAt`.
- **State (AD-2):** Exactly one `lib/PromptsProvider.tsx` (React Context) + `usePrompts()` hook. No screen calls the Repository directly. Exposes `searchQuery`, `favoritesOnly`, `categoryFilter` (typed `string | null`, distinct from `Prompt.category`'s `''`) as independent, AND-combining fields.
- **Navigation (AD-3):** Expo Router, file-based, sibling routes under `app/prompt/` (`[id].tsx`, `create.tsx`, `edit/[id].tsx` — Edit is a sibling, never nested under Detail). Opening Edit from Detail uses `router.replace()`, not `push()`, keeping stack depth at exactly one level from Library.
- **Category list single source of truth:** `lib/categories.ts` — the fixed six-value list plus a derived `Category` type, imported by both the Create/Edit picker and the FilterRow category chip.
- **Design-token single source of truth:** `lib/theme.ts` mirrors DESIGN.md's color/typography/rounded/spacing tokens verbatim; NativeWind's config extends from it rather than components hardcoding hex values.
- **id generation:** `expo-crypto`'s `randomUUID()`, generated once inside the Repository at create time only.
- **Clipboard:** `expo-clipboard`.
- **Initial hydration:** `expo-splash-screen` keeps the native splash visible while `PromptsProvider` performs its one-time AsyncStorage read; fallback to a plain conditional render (`return null` until hydrated) if `preventAutoHideAsync()` proves unreliable at implementation time.
- **Styling:** NativeWind pinned to `^4.2.6` (not `@latest`) to avoid an unplanned v5 breaking upgrade.
- **No monitoring/logging infrastructure** beyond console-level error logging inside the Repository for rare storage read/write failures (caught, logged, no user-facing error state — in-memory state is not rolled back).
- **No CI/CD, no EAS Build / app store submission** in this scope — runs via Expo Go / a local dev build.
- **No automated testing strategy** decided yet — the Repository is the natural unit-test seam if picked up later.

### UX Design Requirements

UX-DR1: Implement `lib/theme.ts` design-token system — colors (`surface-base` #F7F7F5, `surface-raised` #FFFFFF, `ink-primary` #1C1C1E, `ink-secondary` #6E6E73, `ink-disabled` #B0B0B5, `accent` #4453C9, `accent-soft` #E8EAFB, `on-accent` #FFFFFF, `border-hairline` #E5E5E5, `danger` #B83A3A), typography (title/body/meta, platform-native), rounded (sm 8px / md 12px / full 9999px), spacing (4/8/12/16/24/32px). Light-mode only for v1 — no dark variant tokens needed yet (deferred).

UX-DR2: `PromptCard` component — title (1 line, truncated), content preview (2 lines, truncated, `ink-secondary`), category badge (if set), favorite star (filled `accent` / outline `ink-secondary`), copy icon (≥44/48pt tap target), tap-anywhere-else opens Prompt Detail.

UX-DR3: `FAB` component — `accent` fill, `on-accent` icon, persistent bottom-right, low shadow, visible on every Library state including empty.

UX-DR4: `SearchBar` component — inline at the top of Library (not a separate screen), live/incremental case-insensitive substring match against title/content/tags.

UX-DR5: `FilterRow` component — "All"/"Favorites" segmented pill toggle plus a category-filter chip that opens a picker; both combine (AND) with an active search query and with each other.

UX-DR6: `CategoryBadge` component — read-only pill (`accent-soft` background, `accent` text) on card and detail; tapping it does not open the category picker.

UX-DR7: `TagChip` component — read-only pill on card/detail; add-via-"+"/remove-via-"x" only inside the Create/Edit form.

UX-DR8: `Toast` component — bottom-anchored, auto-dismiss, used only for the "Copied." confirmation; visibility is local component state, not part of `PromptsProvider`.

UX-DR9: `ConfirmDialog` component — used only for delete; destructive button (`danger` fill, `on-accent` text) plus a text-only cancel.

UX-DR10: `DetailActionRow` component — Copy / Favorite / Edit / Delete, four evenly-spaced icon-plus-label tap targets on Prompt Detail.

UX-DR11: `FormInput` component — shared text input for Title/Content/Tags fields on Create/Edit; `border-hairline` at rest, `accent` 2px border on focus, no fill change.

UX-DR12: Empty/loading state treatment — empty library ("No prompts yet.", plain, FAB is the only affordance), empty search and empty+filter results (shared "No matches." treatment, no suggestions), Create/Edit Save button disabled (not an error message) while Title or Content is empty (trimmed).

UX-DR13: Accessibility floor — VoiceOver/TalkBack label + state announcement on every icon-only control (star, copy, trash); ≥44pt/48dp tap targets including compact card icons; dynamic type honored via theme tokens with no truncated controls at largest size; focus/reading order follows visual top-to-bottom order on Detail and Create/Edit.

UX-DR14: Interaction bans — no swipe gestures anywhere (specifically no swipe-to-delete, since FR3 requires an explicit confirm step), no multi-select/bulk mode, no pull-to-refresh, no skeleton loaders (replaced by splash-screen-gated hydration).

UX-DR15: Navigation/IA — Library (root) / Prompt Detail / Create-Edit as sibling Expo Router routes, no tab bar, no drawer, stack never more than one level deep from Library; Edit reached from Detail replaces Detail on the stack.

UX-DR16: Voice and tone microcopy — implement the exact strings from EXPERIENCE.md's Do/Don't table ("No prompts yet.", "No matches.", "Copied.", "Delete this prompt? This can't be undone.") — flat, factual, no exclamation marks or emoji anywhere in system copy.

### FR Coverage Map

FR1: Epic 1 - Create Prompt
FR2: Epic 1 - Edit Prompt
FR3: Epic 1 - Delete Prompt
FR4: Epic 1 - View Prompt Details
FR5: Epic 1 - Search Prompts
FR6: Epic 1 - Toggle Favorite
FR7: Epic 1 - Filter by Favorites
FR8: Epic 1 - One-Tap Copy
FR9: Epic 1 - Assign Category
FR10: Epic 1 - Filter by Category

## Epic List

## Epic 1: Personal Prompt Library

Users can create, organize, search, and instantly reuse their AI prompts — the complete PromptForge MVP, entirely offline, on one device.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10

### Story 1.1: App Shell & Foundation

As a user,
I want to open PromptForge and immediately see a ready, working app,
So that I know it launched correctly before I've saved anything.

**Acceptance Criteria:**

**Given** the app has just been installed and never opened
**When** I launch PromptForge
**Then** the native splash screen stays visible while the app initializes
**And** once ready, I see the Library screen with an empty-state message "No prompts yet." and nothing else — no illustration, no suggested prompts
**And** a persistent "+" FAB is visible in the bottom-right corner

**Given** the app is running
**When** it loads
**Then** no skeleton loader, spinner, or loading indicator ever appears on any screen
**And** the splash-to-Library transition is the only "loading" the user perceives

**Given** the project is freshly scaffolded
**When** a developer inspects the codebase
**Then** it is an Expo (managed) app on SDK 56 using Expo Router for navigation
**And** `lib/theme.ts` exists and defines the full design-token set (colors, typography, rounded, spacing) as the single source NativeWind's config extends from
**And** the app runs on both iOS and Android from the same codebase via Expo Go

**Given** the app is running
**When** any screen renders
**Then** no network request of any kind is made — the app functions fully with the device in airplane mode

**Given** the Library screen
**When** I look for ways to manage prompts
**Then** there is no pull-to-refresh gesture and no multi-select/bulk-action mode anywhere in the app

### Story 1.2: Create a Prompt

As a user,
I want to save a new prompt with a title and content,
So that I can find and reuse it later instead of retyping it from memory.

**Acceptance Criteria:**

**Given** I am on the Library screen
**When** I tap the "+" FAB
**Then** the Create form opens with empty Title, Content, Category, and Tags fields

**Given** I am on the Create form
**When** I enter a Title and Content and tap Save
**Then** a new Prompt is created with a unique id (`expo-crypto`'s `randomUUID()`), `createdAt`/`updatedAt` set to the current time, and persisted through `promptRepository.ts`
**And** I am returned to the Library screen, where the new Prompt appears immediately as a card

**Given** I am on the Create form
**When** Title or Content is empty or whitespace-only
**Then** the Save button stays disabled — no error message is shown

**Given** I am on the Create form
**When** I don't enter a Category or any Tags
**Then** the Prompt still saves successfully, with category stored as an empty string and tags as an empty array

**Given** I am filling out the Create form
**When** I tap into the Title or Content field
**Then** the field's border changes to the accent color while focused

**Given** the app has zero prompts
**When** I create my first Prompt
**Then** the Library's "No prompts yet." empty state is replaced by a card list showing exactly one card

**Given** I am on the Create form
**When** I add one or more tags
**Then** each appears as a removable chip (tap "×" to remove); tapping "+" opens free-text entry for a new tag

**Given** the "+" FAB and any icon-only control on this screen
**When** a screen reader is active
**Then** each carries a text label (e.g. "Create prompt") and meets the ≥44pt (iOS) / ≥48dp (Android) tap-target minimum

**Given** the device's text-size accessibility setting is at its largest
**When** I view the Create form
**Then** Title/Content/Tags labels and input text remain fully legible with no truncated controls

**Given** a rare AsyncStorage write failure while saving
**When** I tap Save
**Then** no error message is shown to the user — the failure is caught and logged only, per the architecture's explicit no-user-facing-error-state decision

### Story 1.3: View Prompt Details

As a user,
I want to open a saved prompt and see its full content,
So that I can read the whole thing before copying or editing it.

**Acceptance Criteria:**

**Given** the Library shows at least one Prompt card
**When** I tap anywhere on a card except the favorite star or copy icon
**Then** the Prompt Detail screen opens, showing the full title, content (untruncated regardless of length), category, and tags

**Given** I am on the Prompt Detail screen
**When** the screen renders
**Then** a Detail action row is visible with four tap targets — Copy, Favorite, Edit, Delete

**Given** I am on the Prompt Detail screen, reached from the Library
**When** I navigate back
**Then** I return to the Library screen with my previous search/filter state intact

**Given** I am on the Prompt Detail screen
**When** Detail is the current screen
**Then** the navigation stack is exactly one level deep from Library

**Given** a Prompt has one or more tags
**When** I view it on the Detail screen
**Then** each tag renders as a read-only chip — no add/remove affordance outside the Create/Edit form

**Given** the Detail action row's four icon-plus-label controls
**When** a screen reader is active
**Then** each carries a text label and meets the ≥44pt/48dp tap-target minimum, independent of its visual icon size

### Story 1.4: Edit a Prompt

As a user,
I want to change a prompt's title, content, category, or tags,
So that I can fix mistakes or improve a prompt without losing my library history.

**Acceptance Criteria:**

**Given** I am viewing a Prompt's Detail screen
**When** I tap Edit
**Then** the Edit form opens, pre-filled with the Prompt's current title, content, category, and tags
**And** Edit replaces Detail on the navigation stack (`router.replace`, not `push`) — the stack stays one level deep from Library

**Given** I am on the Edit form with changes made
**When** I tap Save
**Then** the Prompt's `updatedAt` is set to the current time, `createdAt` remains unchanged, and the change is persisted
**And** I am returned to the Prompt's Detail screen showing the updated content

**Given** I am on the Edit form
**When** I clear the Title or Content to empty/whitespace-only
**Then** Save stays disabled, identical to the Create form's validation

**Given** a Prompt was created at time T1
**When** I edit it at a later time T2
**Then** `createdAt` still reads T1 and `updatedAt` reads T2

**Given** the Edit form's tag list
**When** I add a tag via "+" or remove one via its chip's "×"
**Then** the change is reflected immediately in the form, matching the Create form's TagChip behavior

### Story 1.5: Delete a Prompt

As a user,
I want to permanently remove a prompt I no longer need,
So that my library doesn't fill up with things I'll never reuse.

**Acceptance Criteria:**

**Given** I am viewing a Prompt's Detail screen
**When** I tap Delete
**Then** a confirm dialog appears: "Delete this prompt? This can't be undone." with a destructive Delete button and a Cancel button

**Given** the delete confirm dialog is open
**When** I tap Cancel
**Then** the dialog closes and the Prompt is unchanged

**Given** the delete confirm dialog is open
**When** I tap the destructive Delete button
**Then** the Prompt is permanently removed from storage, disappears from the Library list, search results, and Favorites, and I am returned to the Library screen

**Given** I am anywhere in the app viewing a Prompt (card or Detail)
**When** I look for a way to delete it
**Then** there is no swipe-to-delete gesture anywhere — deletion is only reachable via the Detail screen's Delete button and its confirm dialog

**Given** a rare AsyncStorage write failure while deleting
**When** I tap the destructive Delete button
**Then** no error message is shown to the user — the failure is caught and logged only, matching Story 1.2's storage-failure behavior

### Story 1.6: Search Prompts

As a user,
I want to search my prompts by title, content, or tags,
So that I can find a specific prompt in seconds instead of scrolling.

**Acceptance Criteria:**

**Given** the Library has multiple Prompts
**When** I type into the search bar at the top of the Library
**Then** results update live, as I type, with no separate submit action

**Given** I search for a term
**When** a Prompt's title, content, or any tag contains that term (case-insensitive substring match)
**Then** that Prompt appears in the results

**Given** I have typed a search query with no matches
**When** the results render
**Then** I see a plain "No matches." message with no suggestions

**Given** I have an active search query
**When** I clear the search bar
**Then** the Library returns to showing the full, unfiltered list

**Given** the search bar is present
**When** the Library is displayed
**Then** it remains visible and usable inline at the top at all times — never a separate screen

### Story 1.7: Favorite & Filter by Favorites

As a user,
I want to mark my most-used prompts as favorites and filter down to just those,
So that the prompts I reach for most are always one tap away.

**Acceptance Criteria:**

**Given** I am viewing a Prompt (card or Detail)
**When** I tap the favorite star
**Then** the Prompt's `isFavorite` flips immediately, with no confirmation step, and the star's visual state (filled vs. outline) updates everywhere the Prompt appears

**Given** I favorite a Prompt
**When** I check its `updatedAt` afterward
**Then** `updatedAt` is unchanged — favoriting does not count as editing

**Given** the Library's filter row
**When** I tap "Favorites"
**Then** only Prompts with `isFavorite` true are shown; tapping "All" returns to the full list

**Given** the favorite star control on a card or Detail
**When** a screen reader is active
**Then** it announces its current state on toggle (e.g. "Favorite, on" / "Favorite, off"), not just a generic tap sound

**Given** both a search query and the Favorites filter are active
**When** the list renders
**Then** it shows only Prompts matching both — search and Favorites combine (AND), neither resets the other

### Story 1.8: Copy Prompt to Clipboard

As a user,
I want to copy a prompt's content in one tap,
So that I can paste it straight into whatever AI tool I'm using without retyping it.

**Acceptance Criteria:**

**Given** I am viewing the Library
**When** I tap the copy icon on a Prompt card
**Then** the Prompt's content (plain text, no formatting) is placed on the system clipboard and a "Copied." toast briefly appears at the bottom of the screen

**Given** I am viewing a Prompt's Detail screen
**When** I tap Copy in the Detail action row
**Then** the same copy behavior occurs as from the card

**Given** the device is offline (airplane mode)
**When** I copy a Prompt
**Then** the copy still succeeds instantly — copying never depends on network state

**Given** the Toast is showing
**When** the auto-dismiss timer elapses
**Then** the Toast disappears on its own; its visibility is local to the Toast component, not part of the app's shared prompt state

**Given** a known Prompt I want to reuse
**When** I open the app, find it, and copy it
**Then** the whole action, start to finish, comfortably completes in under 10 seconds

**Given** the copy icon on a card and the Copy button in the Detail action row
**When** a screen reader is active
**Then** both carry a "Copy prompt" label and meet the ≥44pt/48dp tap-target minimum

### Story 1.9: Assign Category

As a user,
I want to tag a prompt with one category from a fixed list,
So that my library stays lightly organized as it grows.

**Acceptance Criteria:**

**Given** I am on the Create or Edit form
**When** I open the category picker
**Then** I see exactly six options — Development, Writing, Research, Marketing, Career, General — sourced from the single `lib/categories.ts` list, with no way to type a custom value

**Given** I select a category and save
**When** the Prompt is created or updated
**Then** the category is stored and a CategoryBadge appears on the Prompt's card and Detail view

**Given** I leave the category picker untouched
**When** I save the Prompt
**Then** it saves successfully with no category set — category is optional, never required

**Given** a Prompt's CategoryBadge is visible on a card
**When** I tap the badge
**Then** nothing happens — it's a read-only label, not a shortcut to the picker

### Story 1.10: Filter by Category

As a user,
I want to narrow my library down to one category,
So that I can browse a specific kind of prompt (e.g. just "Development") without scrolling past everything else.

**Acceptance Criteria:**

**Given** the Library's filter row
**When** I select a category from the category filter chip
**Then** only Prompts assigned that exact category are shown

**Given** a category filter, the Favorites filter, and/or a search query are active at once
**When** the list renders
**Then** all active filters combine (AND) — the same combination rule as Story 1.7

**Given** a Prompt has no category assigned
**When** any category filter is active
**Then** that Prompt is excluded from the results (it only appears under "All")

**Given** a category filter (alone or combined with search/Favorites) matches zero Prompts
**When** the results render
**Then** I see the same plain "No matches." treatment used for empty search results — one shared empty-results state, not a separate one per filter type

**Given** no category filter is active
**When** I check the underlying filter state
**Then** it reads as `null` — distinct from a Prompt's own empty-string "no category" value, so "filter off" and "show only uncategorized prompts" can never be confused
