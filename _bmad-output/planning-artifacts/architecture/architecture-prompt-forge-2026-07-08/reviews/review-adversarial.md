---
title: Adversarial Review — PromptForge Architecture Spine
type: review
gate: Finalize (Architecture)
target: '{planning_artifacts}/architecture/architecture-prompt-forge-2026-07-08/ARCHITECTURE-SPINE.md'
sources_checked:
  - '{planning_artifacts}/prds/prd-prompt-forge-2026-07-08/prd.md'
  - '{planning_artifacts}/ux-designs/ux-prompt-forge-2026-07-08/EXPERIENCE.md'
created: '2026-07-08'
verdict: FAIL — 3 findings block Finalize (self-contradiction + two silent-data-loss races), 5 additional findings should be closed before build
---

# Adversarial Review — PromptForge Architecture Spine

## Method

Adopted the posture of two independent builders — "today's screen" and "next week's screen" — each reading only the spine (never each other's code), each obeying AD-1/AD-2/AD-3 to the letter, and asked: where do they still build something that clashes? Eight scenarios found, ranked by downstream impact. Findings 1–3 are load-bearing (they violate PRD FRs that are explicitly "testable" consequences, i.e. acceptance criteria); 4–8 are consistency/maintainability holes that will surface as the app grows past v1.

---

## Finding 1 — AD-3's own rule text contradicts its own Structural Seed (SEVERITY: HIGH — spine is internally inconsistent today, not just divergence-prone)

**The rule (prose):** "Prompt Detail and Create/Edit are stack pushes one level deep, never nested further."

**The seed (code block):**
```
app/prompt/[id].tsx          # Prompt Detail        — depth 1
app/prompt/create.tsx        # Create                — depth 1
app/prompt/[id]/edit.tsx     # Edit                  — depth 2 (nested under [id])
```

`app/prompt/[id]/edit.tsx` is a route nested *under* `app/prompt/[id]`, i.e. two segments deep, in a file-based router where route depth is folder depth. EXPERIENCE.md's own IA table reinforces the deeper path is the intended one: Create/Edit is "Reached from: Library FAB (create) **or Detail's Edit action** (edit)" — the natural user path to Edit is Library → Detail → Edit, a 2-deep stack push, not the 1-deep push the Rule text promises.

**The clash:** Two builders working from this spine today, in good faith, produce different route trees:
- Builder A reads the **Rule** literally ("never nested further") and implements Edit as a sibling route (e.g. `app/prompt/edit/[id].tsx`) reached via `router.push` from Detail, keeping stack depth at 1.
- Builder B reads the **Structural Seed** literally (it's presented as prescriptive, not illustrative — it's the only concrete file layout in the whole document) and creates `app/prompt/[id]/edit.tsx`, which Expo Router will treat as nested.

Both can point to the spine as authority. The resulting route strings differ (`/prompt/edit/:id` vs `/prompt/:id/edit`), so any `router.push()` call, deep link, or typed-route reference written against one assumption breaks against the other's actual router table — and back-button/stack-depth behavior after Save differs (pop 1 vs pop 2), which is directly observable to the user and is exactly the "one-level-deep... no nested modals sneaking in" property AD-3 exists to prevent.

**Not closed by:** anything in the spine — this is a document self-contradiction, not an unstated boundary.

---

## Finding 2 — AD-1 names a single gateway but specifies no commit protocol, so concurrent writes race and can silently resurrect/lose data (SEVERITY: HIGH)

AD-1's rule governs *where* storage code lives ("exactly one module") and what fields it owns (id/timestamps). It says nothing about:
- **Storage shape** — one JSON blob under one AsyncStorage key (implied by "serialization," singular) vs. per-prompt keys. Never stated.
- **Concurrency semantics** — whether concurrent calls into the Repository are queued/serialized, or whether each call independently does read-full-list → mutate → write-full-list with no locking.

AsyncStorage's `getItem`/`setItem` pair is not atomic across two overlapping calls. Given the likely (and simplest, "spine-compliant") implementation — one JSON array under one key — two overlapping Repository calls produce a classic lost-update:

- Call A: `deletePrompt(X)` reads `[X, Y, Z]`, filters to `[Y, Z]`, begins writing.
- Call B: `toggleFavorite(Y)` (fired from a rapid tap on a *different* card, or the same double-tap pattern PRD FR-6 explicitly allows with "no confirmation step") reads `[X, Y, Z]` **before A's write lands**, toggles Y, writes `[X, Y', Z]`.
- B's write lands after A's. X — which the user confirmed deleting via the required ConfirmDialog (FR-3) — reappears in the library.

This directly violates FR-3's testable consequence: "Once confirmed, the Prompt is immediately removed from the library... permanently... unrecoverable." A double-tap on Favorite (FR-6's own "single tap, immediate, no confirmation" design *invites* rapid repeated taps) racing against any other concurrent mutation is not an exotic edge case — it's ordinary one-handed phone use.

**Note on scope:** because AD-2 guarantees a single `PromptsProvider` instance, the in-memory React state itself won't fork between two components — the race is entirely in the **Repository → AsyncStorage** hop, which AD-1 leaves unserialized and un-scoped. AD-1's "single gateway" prevents two different *serialization formats*; it does not prevent two *overlapping calls into the same format* from clobbering each other.

**Not closed by:** AD-1's rule text ("exactly one module") is necessary but not sufficient for correctness — a single door two people can still walk through at once.

---

## Finding 3 — No commit protocol between optimistic UI state and Repository persistence means writes can silently fail while the UI shows success (SEVERITY: HIGH, lower frequency)

The Consistency Conventions table states storage failures are "caught inside the Repository and logged; there is no user-facing error state in v1." AD-2 says `PromptsProvider` "sourc[es] all state from the Repository" but never specifies *when* — synchronously from the write's return value (pull model: state can never be ahead of disk) vs. optimistically updating local state immediately and firing the persistence write in the background (push model: needed to satisfy UX's "instant... no confirmation, no toast" flip requirement for Favorite, and "immediately visible" for Create).

Both are legitimate readings of "sourcing state from the Repository," and they have opposite failure characteristics:

- **Pull model:** slower perceived UI (must await write before flipping the star) but disk and UI can never diverge.
- **Push model:** matches PRD/UX's explicit "instant, no confirmation" requirements (FR-6; State Patterns table) but if the background write fails (quota, corrupted JSON — the spine's own examples), the UI has already shown the user their edit/delete/favorite "succeeded," while disk still holds the old value. On next cold start (hydration re-reads from disk per AD-1), the change silently reverts — a deleted prompt "comes back," a newly created prompt "disappears," a favorite "un-flips" — with the user having already trusted the in-app confirmation and moved on.

This is a genuine "same nominal rule, different behavior" hole: a builder who implements the push model to satisfy the UX spine's own instant-feedback mandate is fully AD-1/AD-2-compliant, and produces a silent-data-loss mode that directly contradicts FR-1/FR-2/FR-3's "immediately visible / immediately removed / permanently" guarantees. Nothing in the spine requires the Repository to signal success/failure back through `usePrompts()`, and nothing requires reconciliation on hydration mismatch.

---

## Finding 4 — `categoryFilter`'s "inactive" sentinel collides with the Prompt entity's own `''` = "no category" convention (SEVERITY: MEDIUM-HIGH)

AD-2 says `categoryFilter` is one of three independent AND-combining fields but never types it. The Consistency Conventions table, in the very next row, defines `category: ''` on the **Prompt entity** to mean "no category set." Nothing distinguishes the filter's "off" representation from the entity's "unset" representation — they're prose-adjacent, not disambiguated.

Two defensible, spine-compliant implementations diverge on what should be the common case (filter cleared):

- **Builder A** (optimizing for AD-2's AND-combining directive): `categoryFilter: string = ''` where `''` means "no constraint," predicate is `categoryFilter === '' || prompt.category === categoryFilter` — correct, matches FR-10.
- **Builder B** (reusing the entity's own documented convention sitting right next to it): treats `categoryFilter === ''` as "filter to prompts with no category," predicate is `prompt.category === categoryFilter` unconditionally — when the filter is cleared, this shows **only uncategorized prompts** instead of everything.

Both builders can cite the Consistency Conventions table as their authority. The bug is silent and only visible when a user clears the category filter and gets a wrong (much smaller) result set — a direct, silent violation of FR-10 ("Filtering by category shows only Prompts assigned that category" / uncategorized prompts "only appear in All") that a spot-check against the happy path (actively filtering by a real category) would never catch.

**Not closed by:** AD-2's AND-combining prose — it describes the *logic*, not the *data contract* (type: `string | null`? sentinel value? nullable field?).

---

## Finding 5 — Does toggling Favorite bump `updatedAt`? Two functionally-identical implementations diverge (SEVERITY: MEDIUM)

AD-1's rule and the Consistency Conventions table name exactly four Repository functions: `getAllPrompts()`, `createPrompt()`, `updatePrompt()`, `deletePrompt()` — no `toggleFavorite()`. AD-1's rule states "On `updatePrompt()`, the Repository sets `updatedAt` to the current time." FR-2 (Edit) ties `updatedAt` refresh explicitly to editing title/content/category/tags; FR-6 (Favorite) never mentions `updatedAt` at all — it's presented as a functionally distinct, lower-ceremony action ("single tap... no confirmation step").

Given only four named Repository functions exist, a builder implementing Favorite has two equally spine-compliant options:
- Route it through the generic `updatePrompt()` (the only mutation function that touches a single field) — which per AD-1's rule silently bumps `updatedAt` on every star tap.
- Add a fifth, dedicated `toggleFavorite(id)` function (reasonable, since FR-2 and FR-6 are separate features in the PRD) that leaves `updatedAt` untouched.

Neither the PRD nor the spine states which is correct. The observable difference — whether starring a prompt makes it look "recently edited" — is invisible today (no "sort by last updated" surface exists) but becomes a real, silently-inconsistent behavior the moment such a feature is added, and two builders adding Favorite and Edit independently would very plausibly land on opposite answers.

---

## Finding 6 — `lib/categories.ts` single-source-of-truth is a convention, not a constraint — nothing stops literal drift (SEVERITY: MEDIUM)

The Rule text says only that "the Create/Edit picker and `FilterRow`'s category chip both import it rather than each hard-coding the list" — scoped to two named consumers, in prose, with no type derived from the constant (the entity's `category` field is typed `string`, not a union of the six literals). Nothing structurally prevents a third consumer — a future `CategoryBadge` color-mapping table, a quick-add-from-card shortcut, a unit test fixture — from hardcoding `'Development' | 'Writing' | ...` directly. It would type-check today (plain `string`), pass code review (matches current values), and only diverge the day the six-category list changes — which the spine's own Deferred section flags as an open possibility ("Category-based data migration... not fixed here"). At that point, the two hardcoded-vs-imported consumers silently show different category sets with no compiler or runtime signal.

---

## Finding 7 — "Empty" for required-field validation is defined differently by two spine sources, and the shared form component doesn't resolve *when* it's checked (SEVERITY: MEDIUM)

Two spine sources describe the same rule with different mechanisms:
- PRD FR-1: "the app **blocks save with the field(s) highlighted**" (implies: attempt save, then react).
- EXPERIENCE.md: "**Save button disabled** until both non-empty" (implies: continuously validated, preemptive).

The architecture spine adopts neither explicitly and specifies no validation predicate (`.length > 0` vs `.trim().length > 0` — a whitespace-only title passes the former, fails the latter). The Structural Seed does force Create and Edit through one shared `FormInput`/form component, which protects the *two known* instances from diverging on the predicate itself — but not from diverging on *when* it runs: Create starts blank (predicate runs from first keystroke via onChange), while Edit pre-fills from a stored `Prompt` (predicate must also run against the initial pre-filled value, before any onChange fires, to catch a whitespace-only title that reached storage some other way — e.g. a future non-UI write path, or a value crafted directly via the Repository in a script/test). If the validation wiring is only attached to onChange handlers (a natural implementation given the UX's own "disabled until non-empty" framing describes reactive behavior), Edit mode's Save button can start enabled on a pre-filled whitespace-only title, while Create mode correctly starts disabled — same rule, different runtime path, because the spine never pins down the predicate or its trigger points.

---

## Finding 8 — Toast (and other ephemeral UI feedback) has no assigned owner — AD-1/AD-2 only govern Prompt *data*, not cross-cutting UI state (SEVERITY: LOW-MEDIUM)

`Toast.tsx` is named once in the Structural Seed as one of ten components but no AD assigns it an ownership model. Copy-to-clipboard confirmation is required from **both** the Library card and the Detail screen (FR-8: "from either the library list or the detail view"). Nothing in the spine says whether Toast is a single instance mounted once at the root (e.g. in `_layout.tsx`, driven by a shared trigger — the same "single owner" pattern AD-1/AD-2 apply to data) or instantiated locally per screen (Card owns its own toast state, Detail owns its own). Two independently-built consumers of "show a toast on copy" can each be locally correct and still produce: overlapping/stacked toasts if a copy is triggered right before navigating from Library to Detail, or an orphaned auto-dismiss timer firing a state update after its owning screen has unmounted. The spine's "single owner, no seam" argument (stated explicitly in the Design Paradigm section) is applied to the Prompt entity and to navigation, but not extended to this shared, cross-screen, stateful UI concern — an inconsistency in how thoroughly the "one owner" principle was applied.

---

## Summary Table

| # | Finding | Severity | FR/UX guarantee at risk |
|---|---|---|---|
| 1 | AD-3 rule text vs. Structural Seed contradict on Edit route depth | HIGH | AD-3 itself ("one level deep, never nested further") |
| 2 | No commit protocol / concurrency semantics for Repository writes | HIGH | FR-3 (permanent delete), FR-1/FR-2 (immediate visibility) |
| 3 | Optimistic UI vs. silently-failed persistence, no reconciliation | HIGH | FR-1, FR-2, FR-3 (user trusts a success that didn't happen) |
| 4 | `categoryFilter` "off" sentinel collides with entity's `''`="no category" | MED-HIGH | FR-10 (category filter correctness) |
| 5 | Favorite toggle's effect on `updatedAt` is unspecified | MEDIUM | FR-2 vs FR-6 boundary, future "recently updated" features |
| 6 | `lib/categories.ts` not structurally enforced | MEDIUM | FR-9 consistency as the category list evolves |
| 7 | "Empty" validation predicate/trigger-timing unspecified across Create vs Edit | MEDIUM | FR-1/FR-2 (title/content required) |
| 8 | Toast/ephemeral UI state has no assigned single owner | LOW-MED | FR-8 (copy confirmation), UX State Patterns |
