---
title: PromptForge
status: final
created: 2026-07-08
updated: 2026-07-08
---

# PRD: PromptForge
*Working title — confirm.*

## 0. Document Purpose

This PRD defines the MVP for PromptForge, a mobile app that lets AI users, developers, and prompt engineers save, find, and reuse their best prompts across tools (Claude, ChatGPT, Gemini, Cursor, Windsurf, and others). It is written for two audiences at once: the assessment reviewer evaluating the product thinking behind a one-day build, and the builder (the same person, acting as sole user) who will implement it directly from this document. Features are grouped with functional requirements (FRs) nested underneath and numbered globally (FR-1...FR-N) for stable reference; drafting decisions and resolved assumptions are logged in §8. Technology choices (React Native, Tailwind, exact data types) were already decided by the builder and are captured in `addendum.md`, not repeated here.

## 1. Vision

AI power-users don't have one AI tool — they have five, and they switch between them constantly. Every switch costs the same tax: recreating a prompt that already worked, from memory, because there's nowhere it was saved. PromptForge is a personal, offline-first prompt library that closes that gap: save a prompt once, find it in seconds, copy it, paste it into whatever tool is open.

The product is deliberately narrow. It does not try to be a prompt marketplace, a team collaboration tool, or an AI-assisted prompt optimizer. It is a fast, private, single-user reference — closer to a well-organized notes app than a platform. Its entire value proposition rests on one loop: open app → find prompt → copy → paste → back to work, in under ten seconds, with zero network dependency.

Because it lives entirely on-device, PromptForge also sidesteps a category of concerns a networked version would carry — no accounts, no server, no prompt content ever leaving the phone. For a tool that may end up storing proprietary or work-sensitive prompt text, that's a feature, not a limitation.

## 2. Target User

### 2.1 Jobs To Be Done

- As a developer/prompt engineer who works across multiple AI tools, I want to save a prompt once and retrieve it instantly later, so I don't retype or reconstruct it from memory every time I switch tools.
- As someone building a personal library of proven prompts, I want to organize and tag them, so the library stays useful instead of becoming an unsearchable pile.
- As a single user with no need to share this library, I want it to work fully offline and stay on my device, so it's fast, private, and doesn't depend on a network connection or an account.

### 2.2 Non-Users (v1)

- Teams or multiple people sharing one prompt library — this is a single-user, single-device tool in v1.
- Anyone expecting AI-assisted prompt writing, rating, or optimization — PromptForge stores and retrieves prompts; it does not generate or critique them.

### 2.3 Key User Journeys

- **UJ-1. Jas copies a proven prompt mid-task.**
  - **Persona + context:** Jas, a developer and prompt engineer, works across Claude, ChatGPT, Cursor, and other AI tools throughout the day and keeps hitting the same wall: a prompt that worked well last week is gone, and rebuilding it from memory breaks flow.
  - **Entry state:** App already installed, library already has saved prompts. No login — the app opens straight into the library.
  - **Path:** Opens PromptForge → library list loads instantly (no network wait) → searches "react" or taps the Favorites filter → scans results by title → taps the prompt to view full content.
  - **Climax:** Taps Copy — content is on the clipboard, and the app confirms it visually (e.g. a brief toast/checkmark) so Jas doesn't second-guess whether it worked.
  - **Resolution:** Switches to the AI tool already open, pastes, continues the task without having broken flow to reconstruct the prompt from scratch.
  - **Edge case:** If the search returns nothing (prompt was never saved, or phrased differently than expected), Jas falls back to browsing by category or Favorites, or gives up and writes the prompt fresh this once — this is the moment the library's job is to prevent for next time by saving the new prompt.

## 3. Glossary

- **Prompt** — A single saved reusable text template intended for pasting into an AI tool. Has a title, content body, an optional category, zero or more tags, a favorite flag, and created/updated timestamps.
- **Library** — The full set of a user's saved Prompts, stored locally on their device.
- **Category** — A single classification a Prompt can optionally carry, chosen from a fixed preset list (§4.5). One Prompt has at most one Category.
- **Tag** — A free-form keyword attached to a Prompt. A Prompt may have zero or more Tags; used for search and future filtering.
- **Favorite** — A boolean flag on a Prompt. Favorited Prompts surface in the Favorites filter (§4.3).

## 4. Features

### 4.1 Prompt Management

**Description:** The core CRUD loop that makes PromptForge a library instead of a note. Every Prompt has a title and content at minimum; category and tags are optional metadata that make the library searchable and organized as it grows. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: Create Prompt

A user can create a new Prompt by entering a title and content, and optionally a category and one or more tags.

**Consequences (testable):**
- A persistent "+" button (visible from the library list, including the empty state) is the entry point into Create.
- Title and Content are required; the app blocks save with the field(s) highlighted if either is empty.
- Category and Tags are optional at creation.
- The app assigns a unique `id` and sets `createdAt`/`updatedAt` automatically; the user never enters either.
- The new Prompt is immediately visible in the library list and matchable by Search.

#### FR-2: Edit Prompt

A user can modify the title, content, category, or tags of an existing Prompt.

**Consequences (testable):**
- Saving an edit updates `updatedAt` to the current time; `createdAt` never changes.
- Title and Content still cannot be saved empty.

#### FR-3: Delete Prompt

A user can permanently delete a Prompt.

**Consequences (testable):**
- The app asks for confirmation before deleting — there is no backup (§6.2), so an accidental delete is unrecoverable.
- Once confirmed, the Prompt is immediately removed from the library, search results, and Favorites.

#### FR-4: View Prompt Details

A user can open a Prompt from the library list to see its full title, content, category, and tags.

**Consequences (testable):**
- Full content is shown unclipped/untruncated, regardless of length.
- Copy (FR-8) and Favorite toggle (FR-6) are both reachable from this view.

**Notes:** Empty-library state (no prompts saved yet) shows a simple placeholder message indicating there are no prompts yet. The persistent "+" button (the same one used to create a Prompt at any time, per FR-1) is the add-prompt entry point — the empty state does not need its own separate CTA.

### 4.2 Search

**Description:** The mechanism that makes a growing library still fast to use. Realizes UJ-1.

**Functional Requirements:**

#### FR-5: Search Prompts

A user can search the library by entering text that matches against a Prompt's title, content, or tags.

**Consequences (testable):**
- A Prompt appears in results if the query text (case-insensitive) appears anywhere in its title, content, or any of its tags — plain substring match, not fuzzy/ranked search.
- Results update as the user types, without a separate submit step.
- Clearing the search returns to the full (or currently favorite-filtered) list.
- An empty result set shows a "no matches" state, not a blank screen.

### 4.3 Favorites

**Description:** A lightweight way to surface the prompts a user reaches for most, without requiring folders or manual sorting. Realizes UJ-1.

**Functional Requirements:**

#### FR-6: Toggle Favorite

A user can mark or unmark any Prompt as a Favorite from the library list or the detail view.

**Consequences (testable):**
- Toggling is a single tap and takes effect immediately, with no confirmation step.
- The favorite state is visually distinguishable (e.g. filled vs. outline star) wherever the Prompt appears.

#### FR-7: Filter by Favorites

A user can switch the library view between "All" and "Favorites."

**Consequences (testable):**
- The Favorites filter shows only Prompts with `isFavorite = true`.
- The filter combines with an active Search query (FR-5) rather than resetting it.

### 4.4 Copy Prompt

**Description:** The single most important interaction in the app — the moment the library actually pays off. One tap, no navigation detour. Realizes UJ-1's climax.

**Functional Requirements:**

#### FR-8: One-Tap Copy

A user can copy a Prompt's content to the system clipboard in one tap, from either the library list or the detail view.

**Consequences (testable):**
- Tapping Copy places the Prompt's `content` (plain text) on the system clipboard — no tool-specific formatting or markup. The product is intentionally AI-tool-agnostic.
- The app shows a brief visual confirmation (e.g. toast, checkmark, haptic) so the user knows the copy succeeded without needing to switch apps to check.
- Works fully offline — copy never depends on network state.

### 4.5 Prompt Categories

**Description:** A light organizational layer, not a full taxonomy system. One fixed dropdown, no category management. Lowest build priority of the five MVP features — see §6.1.

**Functional Requirements:**

#### FR-9: Assign Category

A user can optionally assign a Prompt to one category from a fixed preset list: Development, Writing, Research, Marketing, Career, General.

**Consequences (testable):**
- Category is selected via a dropdown/picker showing exactly the six preset values; no free text, no custom categories, no add/edit/delete of the list itself.
- Category is optional — a quick-saved prompt often doesn't have an obvious category yet, and forcing a choice at Create (FR-1) would add friction the app is meant to avoid.

#### FR-10: Filter by Category

A user can filter the library view to a single category, the same way Favorites (FR-7) filters the list.

**Consequences (testable):**
- Filtering by category shows only Prompts assigned that category.
- Combines with Search (FR-5) the same way the Favorites filter does; Prompts with no category assigned are excluded from any category filter (they only appear in "All").

**Out of Scope:** Custom categories, and any category management beyond the fixed six-item list, remain out of scope (§5).

## 5. Non-Goals (Explicit)

- No cloud sync or multi-device support. The library is local to one phone by design (user decision, §2.1).
- No user accounts, login, or authentication of any kind.
- No sharing, collaboration, or multi-user access to a library.
- No AI-assisted prompt generation, rating, critique, or rewriting. The original vision names "improve" as a pillar, but it requires LLM integration that's out of scope for this build — **explicitly deferred**, not dropped. Revisit once/if PromptForge grows beyond a local library.
- No prompt version history — editing a Prompt overwrites it; there's no way to see or revert to a prior version.
- No export, import, or backup mechanism. Uninstalling the app or losing the phone means losing the library — an accepted risk by explicit user decision (§1, per-device storage).
- No custom categories or category management (create/rename/delete categories) — the six-item list is fixed for v1.
- No bulk actions (multi-select delete, bulk tagging, etc.).
- No direct integration with AI tools (e.g. pushing a prompt via API) — copy-to-clipboard is the entire integration mechanism, by design.
- No analytics or telemetry collection — nothing about usage leaves the device (ties to the privacy posture in §1).

## 6. MVP Scope

### 6.1 In Scope

- Prompt Management: create, edit, delete, view (FR-1–FR-4).
- Search across title, content, tags (FR-5).
- Favorites: toggle and filter (FR-6, FR-7).
- One-tap copy to clipboard (FR-8).
- Category assignment and category filtering via fixed dropdown (FR-9, FR-10) — **build last, after everything else is working.** It's explicitly the lowest-priority pair of features and the first to cut if the one-day timebox runs short.
- Full offline capability, local-only storage, both iOS and Android via React Native.

**Build order:** Prompt Management (FR-1–FR-4) → Search (FR-5) → Favorites (FR-6, FR-7) → Copy (FR-8) → Categories (FR-9, FR-10). The first four form the complete UJ-1 loop on their own; Categories is additive polish.

### 6.2 Out of Scope for MVP

- Everything listed in §5 Non-Goals.
- Data export/backup. `[NOTE FOR PM]` — flagged by the user as an accepted risk now, but worth revisiting if PromptForge outlives the assessment and becomes a real daily-use app; losing a growing personal prompt library to a lost phone gets more painful over time, not less.

## 7. Success Metrics

*Personal-scale, self-assessed — no telemetry (§5), so these are observed by the user, not instrumented.*

**Primary**
- **SM-1**: Sustained personal use — the app is opened and at least one Prompt is copied at least 3x/week, for at least a month past first install (i.e., it survives past the point most personal utility apps get abandoned). Validates FR-8.

**Secondary**
- **SM-2**: Time-to-copy — from opening the app to a known Prompt landing on the clipboard, comfortably under 10 seconds. Validates FR-5, FR-8.
- **SM-3**: Reuse rate — Prompts saved are actually copied again later, not just written once and forgotten (target: most Prompts copied at least once within 30 days of creation). Validates FR-1, FR-8.

**Counter-metrics (do not optimize)**
- **SM-C1**: Total Prompts saved is not a success signal on its own — a library that grows but is never reused again is a hoarding failure mode, not a win. Counterbalances SM-3.

## 8. Resolution Log

Nothing outstanding — every open question and inferred assumption from drafting was resolved by the builder and folded directly into the FRs and sections above.

**Open questions, resolved:**
1. **"Improve" (vision vs. scope gap):** confirmed deferred — it requires LLM integration, out of scope for this build. See §5 Non-Goals.
2. **Category-based filtering:** in scope, bundled with Categories as equal-priority "nice to have." See FR-10.
3. **Empty-state polish:** rejected — stays a plain, simple placeholder message, no starter-prompt suggestions or extra treatment. See §4.1 Notes.
4. **Tool-specific copy formatting:** rejected — plain text only, no per-tool formatting, keeps the product simple and AI-tool-agnostic. See FR-8.

**Draft assumptions, confirmed:** delete confirmation, empty-state treatment, substring search, plain-text copy, optional category, and self-assessed success metrics were all confirmed as drafted.
