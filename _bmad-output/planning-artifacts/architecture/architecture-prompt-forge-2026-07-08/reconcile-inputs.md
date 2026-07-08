# Reconciliation — ARCHITECTURE-SPINE.md vs. Source Documents

Checked: `ARCHITECTURE-SPINE.md` (2026-07-08) against `prd.md`, `addendum.md`, `DESIGN.md`, `EXPERIENCE.md` (all `status: final`).

Legend: **(a)** reflected in spine · **(b)** correctly out of spine's scope · **(c)** explicitly named in Deferred · **GAP** falls through all three.

---

## 1. prd.md

### Covered
- Glossary entities (Prompt/Library/Category/Tag/Favorite) → Structural Seed ERD + Consistency Conventions (spine lines 61–62, 104–116).
- FR-1–FR-4 CRUD, id/timestamp assignment ownership → AD-1 (line 43), Capability Map (line 124). (a)
- FR-3 delete confirmation → satisfied structurally: `ConfirmDialog` is a named, first-class component in Structural Seed/Conventions (lines 61, 96); the behavioral requirement itself is fully owned by EXPERIENCE.md (Component Patterns, State Patterns) — correctly not restated. (b)
- FR-5 substring/case-insensitive/live search → Capability Map row (line 125, "filtered in-memory against usePrompts()'s list"); the matching algorithm itself is a functional detail PRD already owns, not an architectural one. (b)
- FR-6 toggle favorite (no confirm) → UI behavior, EXPERIENCE.md owns it, spine correctly silent. (b)
- FR-8 plain-text copy, offline → Stack table `expo-clipboard` (line 75), Capability Map (line 127); "works offline" is a structural consequence of there being no network layer in the Stack at all. (a/b)
- §5 Non-Goals: cloud sync, accounts, sharing, version history, custom-category CRUD, direct AI integration, analytics/telemetry — all correctly reflected by *omission* (no auth/sync/analytics code, no version field in the ERD) rather than restated. (b) Data export/backup is explicitly named in Deferred (line 134). (c)
- Addendum-derived exact `Prompt` type → ERD matches field-for-field (spine lines 106–115).
- Storage mechanism (left to architecture by PRD/addendum) → resolved as AsyncStorage in Stack + AD-1. (a)

### Gaps

1. **FR-2's timestamp-update rule doesn't land.** PRD §4.1 (line 78): "Saving an edit updates `updatedAt` to the current time; `createdAt` never changes." The spine's only related statements are AD-1's generic "The Repository owns id generation, timestamping" (line 43) and the Consistency Conventions row "`createdAt`/`updatedAt`: ISO 8601 strings" (line 62) — neither states that only `updatedAt` changes on edit while `createdAt` is immutable. This is exactly the kind of quiet, easy-to-drop behavioral detail the Repository (AD-1's single owner) needs spelled out, since it's the one place this rule can be enforced consistently.

2. **FR-7 / FR-10's filter-combination behavior has no architectural treatment.** PRD FR-7 (line 135): "The filter combines with an active Search query (FR-5) rather than resetting it." FR-10 (line 172): "Combines with Search (FR-5) the same way the Favorites filter does; Prompts with no category assigned are excluded from any category filter." This is a non-obvious requirement — filters AND together rather than being mutually exclusive modes — with a real state-shape consequence for AD-2's single provider (does `usePrompts()` expose one `viewMode` enum, or independent `searchQuery` / `favoritesOnly` / `categoryFilter` fields that combine?). The spine's AD-2 (lines 45–49) and Capability Map rows for Favorites/Categories (lines 126, 128) say only "toggle via `usePrompts()`" — no mention of combinability. An implementer following only the spine could easily build a single exclusive filter-mode state that silently breaks FR-7/FR-10.

3. **The fixed six-category list has no canonical home.** PRD FR-9 (lines 158–163): "a fixed preset list: Development, Writing, Research, Marketing, Career, General... no free text, no custom categories." The spine resolves the *optionality* question (empty string = no category, line 62) but never states where the six-value list itself lives in code (e.g., a shared `lib/categories.ts` constant consumed by both the Create/Edit picker and the Filter row's category chip). AD-1's stated purpose is preventing "two screens... diverge" (line 35/42) — yet the one other place a fixed, shared vocabulary exists (categories, used independently by at least two components: the form picker and `FilterRow`) has no single-source-of-truth convention, which is precisely the class of drift AD-1 exists to prevent for storage.

4. **The "improve"/AI-assisted deferral isn't carried into the spine's Deferred section.** PRD §5 (line 181): "No AI-assisted prompt generation, rating, critique, or rewriting. The original vision names 'improve' as a pillar... **explicitly deferred, not dropped**. Revisit once/if PromptForge grows beyond a local library." The spine's Deferred section (lines 130–136) mirrors several other v1 non-goals that might return later (dark mode, data export/backup, category migration) but omits this one entirely, even though it's the PRD's most vision-level deferred capability and the PRD itself flags it as deliberately preserved for later, not merely dropped.

---

## 2. addendum.md

### Covered
- Tech stack (React Native, Tailwind/NativeWind) → Stack table (spine lines 67–76). (a)
- Exact `Prompt` TypeScript contract → spine ERD (lines 106–115) matches every field, and the spine text explicitly says "Field shape matches the PRD addendum's TypeScript contract exactly" (line 118). (a)
- The addendum's open question — how to represent "no category" — is explicitly resolved by the spine (empty string `''`, line 62), directly answering the addendum's note (line 28) that this was "left as a downstream implementation choice." (a)
- Storage mechanism, explicitly punted to architecture by the addendum (line 50) → resolved as AsyncStorage (Stack table, AD-1). (a)
- Worked example (Title/Category/Tags/Content sample) → pure illustrative content, correctly not referenced by the spine. (b)

### Gaps

1. **Fixed Category List section (lines 44–46)** — same underlying gap as PRD FR-9 above: "Development, Writing, Research, Marketing, Career, General — dropdown, no category CRUD in v1" has no corresponding convention in the spine for where this closed list is canonically defined/shared across components. See PRD gap #3 for full detail; not double-counted, cross-referenced here since the addendum is the second place this exact list appears verbatim.

---

## 3. DESIGN.md

DESIGN.md is almost entirely visual specification (colors, typography, spacing, elevation, shape tokens) — correctly out of the spine's scope throughout, since none of it carries layering/data-flow/naming consequences beyond component identity. (b)

### Covered
- Component identity/naming for 8 of DESIGN.md's named components (`PromptCard`, `FAB`, `SearchBar`, `FilterRow`, `CategoryBadge`, `TagChip`, `Toast`, `ConfirmDialog`) → spine Consistency Conventions (line 61) and Structural Seed (lines 88–96), 1:1. (a)
- "Modal/sheet stacks one level deep, never two" (DESIGN.md line 72) → AD-3 (lines 51–55). (a)
- Colors, typography, spacing, elevation, shape scales → pure visual tokens, no architectural mirroring needed. (b)

### Gaps

1. **Two named components from DESIGN.md's Components section don't appear in the spine's component list.** DESIGN.md lists 10 components total, including **"Detail action row"** (line 92: "Prompt Detail's action row: four tap targets (Copy, Favorite, Edit, Delete)...") and **"Form input"** (line 93: "Title/Content/Tags fields on Create/Edit..."). The spine's naming-convention line explicitly claims "Components named identically to DESIGN.md/EXPERIENCE.md" and then lists only 8 (spine line 61), and the Structural Seed's `components/` directory (lines 88–96) likewise lists only those same 8. Either these two are meant to be inlined into their host screens (a legitimate choice, but currently unstated) or they were dropped when compressing DESIGN.md's component inventory — as written, the spine's own naming rule is inconsistent with its source.

---

## 4. EXPERIENCE.md

### Covered
- Foundation: offline-only, no platform-specific behavior, light-mode-only → reflected by the Stack's absence of any network layer (a), and dark mode is explicitly named in Deferred (spine line 133). (a/c)
- Information Architecture (Library / Prompt Detail / Create-Edit, one-level-deep modal stack, no tab bar/drawer) → AD-3 and Structural Seed routes (spine lines 51–55, 82–87), matches exactly. (a)
- Voice and Tone (microcopy table) → pure UI copy, correctly not restated by the spine. (b)
- Component Patterns: tap-target behavior (card tap targets, category badge read-only, tag chip add/remove), State Patterns (empty states, toast, focus treatment), Accessibility Floor (VoiceOver labels, 44pt/48dp targets, dynamic type, focus order) → all component/screen-level UI behavior with no data-flow or layering consequence; correctly left to EXPERIENCE.md/DESIGN.md and not mirrored in the spine. (b)
- Delete requiring confirmation, and swipe-to-delete being rejected because it conflicts with that requirement (Interaction Primitives line 74, Anti-patterns line 91) → same as PRD FR-3 above, satisfied via the named `ConfirmDialog` component. (b)
- Bulk mode ban (line 76) → ties to PRD's explicit Non-Goal, nothing built, correctly reflected by omission (no multi-select state anywhere in the spine). (b)
- Pull-to-refresh ban (line 76, "nothing to refresh — fully local") → structurally consistent with there being no network/fetch layer in the Stack at all. (b)

### Gaps

1. **No convention for initial data hydration / loading state.** EXPERIENCE.md bans skeleton loaders because "local reads are effectively instant" (Interaction Primitives, line 76), and Key Flows / Foundation both assert the library "loads instantly — no network wait, no loading state" (line 97; also Foundation line 16). This is a real architectural obligation, not just a UI preference: `PromptsProvider` (AD-2) reads from AsyncStorage, which is asynchronous even for local data — something has to guarantee the list is populated (or the gap is imperceptible) before first render so no screen ever needs a loading/skeleton state. The spine's Consistency Conventions "State & cross-cutting" row (line 63) covers mutation and error handling but says nothing about initial load/hydration timing. Without this, an implementer could easily add a spinner or loading flag on first mount — quietly violating the "no skeleton loaders" ban.

2. **Filter row's combination rule (line 53: "combines with All/Favorites and with an active search query")** — same gap as PRD FR-7/FR-10 above; EXPERIENCE.md is the fullest statement of this requirement, but the spine's AD-2/Capability Map don't reflect it. Cross-referenced here, not double-counted; see PRD gap #2 for detail.

---

## Summary of Gaps (5 unique, cross-referenced where they surface in multiple documents)

| # | Gap | Primary source | Also surfaces in | Missing from spine at |
|---|---|---|---|---|
| 1 | `updatedAt`-changes/`createdAt`-immutable rule not stated | PRD FR-2 (line 78) | — | AD-1 (line 43), Conventions (line 62) |
| 2 | Filter-combination (Search + Favorites + Category AND together) has no state-shape convention | PRD FR-7/FR-10 (lines 135, 172) | EXPERIENCE.md line 53 | AD-2 (45–49), Capability Map (126, 128) |
| 3 | Fixed six-category list has no single-source-of-truth convention | PRD FR-9 (158–163) | addendum.md (44–46) | Conventions (62), Structural Seed (78–102) |
| 4 | "Improve"/AI-assist deferral not carried into spine's Deferred section | PRD §5 (line 181) | — | Deferred (130–136) |
| 5 | "Detail action row" and "Form input" components missing from spine's naming/structural list | DESIGN.md (lines 92–93) | — | Conventions (61), Structural Seed (88–96) |
| 6 | No convention for initial `PromptsProvider` hydration/loading-state timing | EXPERIENCE.md (16, 76, 97) | — | Conventions (63) |

(Table has 6 rows because #2/#3 each cite one additional document where the same underlying gap also surfaces; the reconciliation counts them once per document section above.)
