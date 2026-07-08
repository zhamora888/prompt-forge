# Spine Pair Review — PromptForge

## Overall verdict

The DESIGN.md / EXPERIENCE.md pair is a tight, proportionate spine that largely holds up as an unambiguous build contract: every frontmatter token resolves, the sole Key Flow (mirroring the PRD's only UJ) is complete with named protagonist, numbered steps, climax, and failure path, and there are zero dangling references to mocks that don't exist. The two real weak points are structural, not content-quality: the Inspiration & Anti-patterns section that the Google Keep callout explicitly earns is missing from EXPERIENCE.md (its substance survives, but only in DESIGN.md), and the Prompt Detail / Create-Edit surfaces get materially thinner visual and behavioral coverage than Library (missing input-focus state, no Detail action-row layout spec, two components with a visual row but no behavioral row). None of this blocks a build, but a downstream consumer will have to infer a handful of load-bearing decisions rather than read them off the page.

## 1. Flow coverage — strong

Checked: extracted every UJ from the PRD (§2.3) and matched against EXPERIENCE.md § Key Flows. The PRD defines exactly one Key User Journey, **UJ-1 (Jas copies a proven prompt mid-task)**. EXPERIENCE.md's sole Key Flow, "Flow 1 — Copy a proven prompt mid-task (mirrors PRD UJ-1...)," carries a named protagonist (Jas, matching the PRD persona verbatim), six numbered steps, an explicit `**Climax:**` beat (toast confirmation), and a stated failure/edge path ("search returns nothing... Jas either clears the filter... or taps the FAB"), itself traceable to the PRD's own UJ-1 edge case. 1-for-1 coverage of the PRD's UJ set.

### Findings

None. The single-flow scope is correct for a PRD with a single UJ, and the flow is structurally complete.

## 2. Token completeness — adequate

Checked: every key in DESIGN.md's YAML frontmatter (`colors`, `typography`, `rounded`, `spacing`) against every `{path.to.token}` / backtick-token reference in the prose. All 9 color tokens carry hex values; all `{spacing.1}`–`{spacing.6}`, `{rounded.sm/md/full}`, and `{colors.*}` references in the body resolve to a defined frontmatter key — no dangling references found. Typography stays correctly semantic (`note` fields for platform-native type), consistent with the spec's allowance.

### Findings

- **medium** DESIGN.md never states a contrast standard (e.g. "WCAG AA, 4.5:1") for any text-on-surface combination, and two load-bearing combinations are borderline-to-failing when computed: `{colors.danger}` (`#D64545`) as text/icon on `{colors.surface-raised}` (`#FFFFFF`) ≈ 4.38:1 (below the 4.5:1 AA threshold for normal-size text), and `{colors.accent}` (`#4C5FD5`) as text on `{colors.accent-soft}` (`#E8EAFB`) — used for the category badge and selected filter chip, both small/`meta`-size text — ≈ 4.5:1, sitting exactly at the threshold with no margin (DESIGN.md, Colors section, lines ~51–54). *Fix:* state an explicit contrast target in Colors or Do's/Don'ts, and either confirm these two combinations pass in the actual rendered type size/weight or darken `danger`/`accent` slightly for text use.
- **low** "white text" (Toast) and "white icon" (FAB) are used as untokenized literals even though `#FFFFFF` already exists as `{colors.surface-raised}` (DESIGN.md, Components section, Toast and FAB rows, lines 80–87). *Fix:* reference the existing token, or add an explicit on-accent/on-dark semantic token if the intent is distinct from the surface token.

## 3. Component coverage — adequate

Checked: every component name in DESIGN.md.Components (Prompt card, FAB, Search bar, Filter row, Category badge, Tag chip, Toast, Confirm dialog) against every row in EXPERIENCE.md.Component Patterns (Prompt card, FAB, Search bar, Filter row, Create/Edit form, Detail actions). Names that appear in both files match exactly, with real behavioral rules (not one-word descriptions) on the EXPERIENCE.md side.

### Findings

- **medium** Category badge and Tag chip have a full visual row in DESIGN.md.Components but no corresponding row in EXPERIENCE.md.Component Patterns — their interaction behavior (tap target on the card? add/remove flow for tags in the form? does the badge open the category picker from the card?) is only inferable from a scattered mention inside the "Create/Edit form" row and from behavior-flavored language that leaked into DESIGN.md's Tag chip entry itself ("Read-only display on cards/detail; editable... only in the create/edit form" — DESIGN.md line 85). *Fix:* add dedicated Category badge and Tag chip rows to EXPERIENCE.md.Component Patterns; move the behavioral clause out of DESIGN.md's Tag chip row into that new EXPERIENCE.md row.
- **medium** Prompt Detail's action row (Copy / Favorite toggle / Edit / Delete — the primary interactive surface of FR-4) and the Create/Edit form's text inputs have no dedicated visual-spec row in DESIGN.md.Components. Library-surface components (card, FAB, search bar, filter row, both chip types, toast, confirm dialog) are fully specified; Detail and Create/Edit — 2 of the app's 3 IA surfaces — get only scattered mentions (typography role assignment at DESIGN.md line 62, "primary buttons (Save, Copy)" at line 51, `{rounded.sm}` "for... form inputs" at line 76) rather than a row describing button layout, input field border/fill, or where the four Detail actions sit on screen. *Fix:* add "Detail action row" and "Form input" rows to DESIGN.md.Components.

## 4. State coverage — adequate

Checked: walked all three IA surfaces (Library, Prompt Detail, Create/Edit Prompt) against EXPERIENCE.md § State Patterns. Library: empty, empty-search, empty+filter, copy-succeeded, favorite-toggled — all covered. Detail: delete-pending, favorite-toggled — covered. Create/Edit: validation-blocked (Save disabled) — covered. Offline/permission-denied states are correctly absent given the app's fully-local, no-network-permission posture (per Foundation).

### Findings

- **medium** No focus-state spec — visual or behavioral — exists for the Create/Edit form's Title/Content text inputs. DESIGN.md defines no focus color/border token; EXPERIENCE.md's Accessibility Floor addresses traversal order only ("Focus/reading order... follows visual top-to-bottom order"), not what a field looks like while being actively typed into. Given Title+Content are the two required fields gating Save on one of only three surfaces, this is a load-bearing gap rather than cosmetic. *Fix:* add a "Focus" row to EXPERIENCE.md.State Patterns and a focus treatment (e.g. accent-colored border) to DESIGN.md.

## 5. Visual reference coverage — strong

Checked: `mockups/`, `wireframes/`, `imports/` under the ux-designs folder. Only `imports/` exists as a directory and it is empty (confirmed via directory listing); no `mockups/` or `wireframes/` directory exists at all. This matches EXPERIENCE.md's own IA note: "→ Composition reference: none yet — no mocks rendered this run (Fast path skipped creative tools)." No dangling references to nonexistent assets in either file.

### Findings

None.

## 6. Bloat & overspecification — strong

Checked both files for pixel specs duplicating tokens, source restatement, prose-where-a-table-works, unread-by-anyone sections, and decorative narrative untied to a decision. DESIGN.md's editorial prose (Brand & Style, per-color rationale) stays tied to real decisions (the Keep reference, the no-color-tint rule) and matches the editorial register of the reference examples. EXPERIENCE.md's prose stays behavioral and terse, including the Key Flow narrative. Pixel values are only ever stated alongside their token (`{spacing.1}`–`{spacing.6}` "4/8/12/16/24/32px"), matching the example convention rather than duplicating it uninformatively. FR/UJ references are cross-references ("see FR-10, lowest build priority"), not restatements.

### Findings

None.

## 7. Inheritance discipline — strong

Checked: `sources` frontmatter resolves to real files (both PRD and addendum exist at the cited `{planning_artifacts}` path); UJ-1's name is preserved near-verbatim and explicitly ID-tagged in the Key Flow title; Glossary terms (Prompt, Library, Category, Tag, Favorite) are used identically across both spines and the PRD with no drift; component names that appear in both files (Prompt card, FAB, Search bar, Filter row) are spelled and capitalized identically. EXPERIENCE.md contains zero `{colors.*}`/`{spacing.*}`-style token references of its own — all visual detail is correctly deferred to DESIGN.md by name-pointer ("Visual specs live in `DESIGN.md.Components`"), which eliminates an entire class of broken-reference risk by construction.

### Findings

None beyond the component-coverage gaps already logged under §3 (not re-listed here to avoid double-counting).

## 8. Shape fit — adequate

Checked: DESIGN.md section order against the canonical order (Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts) — matches exactly. EXPERIENCE.md required defaults (Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows) are all present and in the example-established order. Responsive & Platform is correctly omitted (single-surface-family mobile). Dark mode is correctly deferred-not-omitted, with an explicit rationale in Foundation.

### Findings

- **high** EXPERIENCE.md has no **Inspiration & Anti-patterns** section, despite the product owner explicitly naming Google Keep as the structural reference and explicitly rejecting its signature per-note color-tint pattern — precisely the trigger condition this required-when-applicable section exists for (compare `experience-example-mobile.md`'s "Rejected — Streaks" treatment of an analogous callout). The decision itself is committed and unambiguous — DESIGN.md's Brand & Style prose (line 42), the Colors "Avoid" line (line 56), and the Do's/Don'ts table (line 93) all state it — but it lives entirely in DESIGN.md. A downstream consumer reading EXPERIENCE.md alone (the behavior/rationale contract) for "what was rejected and why" will not find it there. *Fix:* add a short Inspiration & Anti-patterns section to EXPERIENCE.md — "Lifted from Google Keep: card-grid list, FAB-to-create, tap-to-open" / "Rejected — Keep's per-note color tinting: would compete with the category/tags/favorite system" — cross-referencing DESIGN.md's Colors section.

## Mechanical notes

- **Frontmatter field-name drift:** EXPERIENCE.md uses `title` (not `name`) in its frontmatter, while the reference examples (Quill, Drift) use `name`. DESIGN.md carries both `title` and `name` (redundant but harmless, both set to "PromptForge"). Cosmetic only — doesn't break resolution — but worth aligning to the example convention.
- **Status field:** both files are marked `status: draft`. If this pair is meant to be treated as a committed build contract, downstream consumers may reasonably read `draft` as "not yet final" regardless of content completeness.
- **Sources resolve cleanly:** `{planning_artifacts}/prds/prd-prompt-forge-2026-07-08/prd.md` and `.../addendum.md` both exist at the referenced path; no broken cross-file links.
- **No Mermaid diagrams** in either file — N/A for syntax validation.
- **No naming inconsistencies** found for components, glossary terms, or the UJ id between the two spines and the PRD.
- **Zero `{token}`-style cross-references in EXPERIENCE.md** to independently verify against DESIGN.md's frontmatter — all such resolution risk is structurally avoided by EXPERIENCE.md pointing to `DESIGN.md.Components`/`DESIGN.md` by name rather than re-citing token paths.
