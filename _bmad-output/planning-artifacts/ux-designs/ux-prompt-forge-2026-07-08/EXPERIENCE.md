---
title: PromptForge
name: PromptForge
status: final
created: 2026-07-08
updated: 2026-07-08
sources:
  - {planning_artifacts}/prds/prd-prompt-forge-2026-07-08/prd.md
  - {planning_artifacts}/prds/prd-prompt-forge-2026-07-08/addendum.md
---

# PromptForge — Experience Spine

## Foundation

Single-surface-family mobile app, iOS + Android parity via React Native, no platform-specific behavior. No named UI system — custom lightweight components styled with NativeWind (Tailwind for RN); `DESIGN.md` is the visual identity reference, this spine is the behavior. Fully offline — no surface, state, or interaction in this document depends on network connectivity. Light mode only for v1; dark mode is deferred (builder decision, not a technical blocker) — revisit as an Update to this spine when prioritized.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| Library | App open (cold start) | Full prompt list, search, All/Favorites/Category filters, entry point to Create |
| Prompt Detail | Library card tap | Full prompt content; Copy, Favorite, Edit, Delete |
| Create/Edit Prompt | Library FAB (create) or Detail's Edit action (edit) | Single form, shared between create and edit |

No separate Search surface — the search bar lives inline at the top of Library, always visible. No tab bar, no drawer — Library is the only top-level destination; Detail and Create/Edit are modal-stack pushes, one level deep.

→ Composition reference: none yet — no mocks rendered this run (Fast path skipped creative tools). Spine wins on conflict if mocks are added later.

## Voice and Tone

Microcopy only — brand voice and aesthetic posture live in `DESIGN.md`.

| Do | Don't |
|---|---|
| "No prompts yet." | "Let's create your first prompt! ✨" |
| "No matches." | "Hmm, we couldn't find anything." |
| "Copied." | "✓ Copied to clipboard successfully!" |
| "Delete this prompt? This can't be undone." | "Are you sure??" |
| Flat, factual, no exclamation marks | Encouragement, gamification language, emoji in system copy |

Matches the builder's explicit call on empty states (§ State Patterns): plain, no CTA copy beyond the always-visible FAB.

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| Prompt card | Library list | Tap anywhere except star/copy icon → Detail. Tap star → toggles favorite in place, no navigation. Tap copy icon → copies content, shows toast, no navigation. |
| FAB | Library, all states | Always visible, including empty and filtered-empty states. Tap → Create form. |
| Search bar | Library, persistent | Live filter as-you-type (FR-5) against title/content/tags. Clearing returns to the current filter's full list. |
| Filter row | Library, below search | "All" / "Favorites" mutually exclusive. Category filter is a separate, additive picker — combines with All/Favorites and with an active search query. |
| Create/Edit form | Create/Edit surface | Title + Content required to save (Save button disabled until both non-empty). Category (picker, optional) and Tags (free-entry chips, optional) below. Edit pre-fills all fields from the existing Prompt. |
| Detail actions | Prompt Detail | Copy (primary, matches card's affordance), Favorite toggle, Edit, Delete. Delete is the only action requiring a confirm dialog. |
| Category badge | Card, Detail | Read-only display everywhere it appears — including on the card. Tapping it does not open the category picker (that only happens inside the Create/Edit form); it's a label, not a shortcut. |
| Tag chip | Card, Detail, Create/Edit form | Read-only display on Card and Detail. On Create/Edit only: tap the "+" affordance to add a new tag (free-text entry, confirmed on submit/enter); tap a chip's "x" to remove it. No tag editing outside the form. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Empty library | Library | "No prompts yet." Bare message, no illustration, no suggested prompts. FAB is the only next action. |
| Empty search results | Library (search active) | "No matches." No suggestions, no fallback content. |
| Empty + filter active | Library (Favorites or Category, no matches) | Same "No matches." pattern — filter and search share one empty-state treatment. |
| Copy succeeded | Library card or Detail | Toast: "Copied." Auto-dismiss, no action required. |
| Delete pending | Detail or Edit | Confirm dialog: "Delete this prompt? This can't be undone." Destructive/Cancel buttons. |
| Favorite toggled | Card or Detail | Instant visual flip (filled/outline star), no confirmation, no toast — matches FR-6's "no confirmation step." |
| Validation blocked | Create/Edit | Save button stays disabled (not an error message) while Title or Content is empty — prevents the invalid state rather than announcing it after the fact. |
| Focus | Create/Edit (Title, Content, Tag-entry inputs) | Border shifts to `{colors.accent}` (`DESIGN.md.Components`, Form input) on focus; no layout shift, no placeholder-as-label behavior. |

## Interaction Primitives

- Tap to act; no long-press menus, no swipe gestures anywhere in v1. Swipe-to-delete is deliberately excluded — FR-3 requires a confirmation step before delete, and a swipe pattern's whole appeal is low-friction removal, which works against that requirement. Delete only happens from Detail/Edit via an explicit trash icon plus the confirm dialog — everything stays inside the app's normal navigation, nothing hidden behind a gesture.
- Category and Favorites filters are toggles, not modals — one tap to apply, one tap to clear.
- **Banned:** swipe actions, multi-select/bulk mode (ties to PRD's explicit Non-Goal), pull-to-refresh (nothing to refresh — fully local), skeleton loaders (local reads are effectively instant).

## Accessibility Floor

Behavioral; visual contrast lives in `DESIGN.md`.

- VoiceOver / TalkBack: every icon-only control (favorite star, copy icon, delete trash icon) carries a text label and current-state announcement (e.g. "Favorite, on" / "Favorite, off").
- Tap targets ≥ 44pt (iOS) / 48dp (Android) — applies to the star and copy icons on the compact card layout, not just full-size buttons.
- Dynamic type honored through `DESIGN.md` typography tokens; card content-preview truncation must still leave the title fully legible at the largest accessibility text size.
- Focus/reading order on Detail and Create/Edit follows visual top-to-bottom order; no custom traversal.

## Inspiration & Anti-patterns

- **Lifted from Google Keep:** the structural shape — a plain card-grid-turned-list, a FAB as the one persistent create affordance, tap-anywhere-on-the-card to open. Familiar enough that no onboarding is needed.
- **Rejected — Keep's per-note color tinting:** PromptForge's cards stay fully monochrome (see `DESIGN.md` Colors, "Avoid"). Color-per-note would compete with the category/tags/favorite system the PRD already owns as the organizational layer — two color-coded systems on one card is one too many.
- **Rejected — swipe-to-delete (common list pattern, including Keep's own archive swipe):** see Interaction Primitives above — conflicts with FR-3's required delete confirmation.

## Key Flows

### Flow 1 — Copy a proven prompt mid-task (mirrors PRD UJ-1: Jas, switching between AI tools all day)

1. Jas opens PromptForge. Library loads instantly — no network wait, no loading state.
2. Types "react" in the search bar, or taps the Favorites filter chip.
3. Scans results by title in the card list.
4. Taps the copy icon directly on the card — no need to open Detail first.
5. **Climax:** Toast reads "Copied." Jas already knows it worked without leaving the list.
6. Switches to the AI tool already open, pastes, keeps working.

Edge case (from PRD UJ-1): search returns nothing → Library shows "No matches." Jas either clears the filter to browse, or taps the FAB to save this prompt fresh so it's found next time.
