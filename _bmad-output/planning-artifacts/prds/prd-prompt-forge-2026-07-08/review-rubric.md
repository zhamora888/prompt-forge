# PRD Quality Review — PromptForge

## Overall verdict

This PRD holds up well for its actual purpose: a one-day, single-user assessment build with a builder who is also the sole reader. The thesis (context-switch tax between AI tools) is stated once and every feature, priority order, and success metric traces back to it without drift. FRs are unusually well specified for this scale — most have genuinely testable consequences, not adjectives. The two things that would trip up a builder using this as a literal spec are a data-contract mismatch between the PRD's "category is optional" requirement and the addendum's non-optional `category: string` type, and one broken section cross-reference in §5. Neither is severe; both are one-line fixes.

## Decision-readiness — strong

Trade-offs are named with what's given up, not smoothed. §5 states the "improve" pillar from the original vision is dropped from scope with an explicit reason ("it requires LLM integration that's out of scope for this build — **explicitly deferred**, not dropped"). §6.2 carries a live `[NOTE FOR PM]` on the backup/export omission that names the actual cost that grows over time ("losing a growing personal prompt library to a lost phone gets more painful over time, not less") rather than filing it as settled. The addendum is honest that iOS/Android polish is *not* a deliberate scope call — "will be allocated based on however much build time is left, not a deliberate scope decision" — which is a harder thing to admit than to smooth into "we'll handle platform parity as time allows."

§8's Open Questions are handled correctly for this dimension: they're presented as resolved-with-rationale ("All four questions raised during review were resolved by the builder"), not left dressed up as still-open when the next sentence already answers them. That's the honest version of a closed PRD, not the red-flag version.

No findings — this dimension doesn't need padding.

## Substance over theater — strong

One persona-carrying UJ (Jas), used consistently, not stacked with decorative alternates. The Vision (§1) is specific to this product's actual mechanism ("Every switch costs the same tax: recreating a prompt that already worked, from memory, because there's nowhere it was saved") rather than a swappable "we help users be more productive" paragraph. There's no bolted-on Differentiation/Competitive section and no boilerplate NFR language ("must be scalable/secure/reliable") — the one performance claim (SM-2, "comfortably under 10 seconds") is a bound, not an adjective.

No findings.

## Strategic coherence — strong

The thesis (switching-tax between tools) drives feature order, not the reverse: §6.1's build order runs Prompt Management → Search → Favorites → Copy → Categories, explicitly because "the first four form the complete UJ-1 loop on their own; Categories is additive polish" — and Categories is independently confirmed as the lowest-priority, cut-first feature (§4.5, §6.1). Success metrics validate the thesis rather than measuring activity: SM-1 (sustained use), SM-2 (time-to-copy), SM-3 (reuse rate) all track whether the loop actually gets used repeatedly, and SM-C1 explicitly refuses to credit raw library growth as success ("a library that grows but is never reused again is a hoarding failure mode, not a win"). That counter-metric is doing real work, not present as a rubric checkbox.

No findings.

## Done-ness clarity — strong, with one medium gap

Almost every FR has consequences that are actually testable: FR-5's search is pinned down as "plain substring match, not fuzzy/ranked search," case-insensitive, live-updating; FR-1/FR-2 pin down exactly which fields are required and what happens to timestamps; FR-7/FR-10 state precisely how filters compose with search rather than leaving composition to inference. This is the dimension the rubric asks to be unforgiving on, and there's little to push back on.

### Findings

- **medium** Category optionality contradicts the addendum's "exact contract" (FR-9, Glossary §3, vs. `addendum.md` Prompt type) — FR-9 requires category to be optional ("Category is optional — a Prompt can be saved with no category set") and the Glossary says a Prompt has "at most one Category" (implying zero is valid), but the addendum's data shape declares `category: string` — not `category?: string` or `string | null` — and calls itself "the *exact contract* the user already committed to for the build." A builder implementing FR-9/FR-10 literally has to invent an unspecified sentinel (empty string? placeholder value?) for "no category," and FR-10's rule ("Prompts with no category assigned are excluded from any category filter") depends on that representation being unambiguous. *Fix:* either loosen the addendum type to `category?: string` (or `string | null`) to match FR-9, or note in the addendum that empty string is the canonical "no category" representation.
- **low** FR-8's "brief visual confirmation" (toast/checkmark/haptic) is the one soft adjective in an otherwise bound-heavy FR set — "brief" isn't itself testable, though the surrounding intent (user knows the copy succeeded without switching apps) effectively substitutes for a hard bound. Not worth blocking on at this scale, but noted since the rubric asks to flag every instance.
- **low** FR-4: "Full content is shown unclipped/unrtruncated, regardless of length" — typo ("unrtruncated"). Cosmetic only.

## Scope honesty — strong

§5 Non-Goals is doing real work, not listing the obvious: it explicitly distinguishes deferred-with-reason ("improve," pending LLM integration) from permanently-out-of-scope (multi-user, version history), and each bullet carries its own justification rather than a bare list. §6.2 adds a live `[NOTE FOR PM]` flagging the backup/export omission as a growing risk if the app outlives the assessment — that's an omission surfaced honestly, not silently assumed. Open-items density is zero (§8, §9 both closed out), which the rubric treats as fine — even ideal — for a low-stakes, green-lit, single-reader PRD; it isn't a sign of unexamined risk here because the closure narrative in §8/§9 shows the questions were actually raised and resolved, not skipped.

No findings.

## Downstream usability — strong (standalone-scale; matters less here but holds up)

Per §0, this PRD is meant to be implemented directly by the builder without an intervening UX/architecture doc, so this dimension carries more weight than a typical "standalone" PRD would get under the rubric — and it holds up. Glossary (§3) terms (Prompt, Library, Category, Tag, Favorite) are used consistently in the FRs. FR IDs (FR-1–FR-10), the single UJ (UJ-1), and SM IDs (SM-1–SM-3, SM-C1) are contiguous with no gaps or duplicates. Cross-references generally resolve: FR-8 correctly ties to "UJ-1's climax," §6.2 correctly cites §5, the cloud-sync Non-Goal in §5 correctly cites §2.1.

### Findings
- **low** Broken cross-reference in §5: "No export, import, or backup mechanism... an accepted risk by explicit user decision (§2, storage discussion)." §2 (Target User) contains no storage discussion — the closest actual content is §1's "no server, no prompt content ever leaving the phone" or the addendum's "Storage Mechanism" note. *Fix:* repoint the citation or drop the parenthetical.

## Shape fit — strong

This is correctly shaped as a light consumer-product spec for a single-operator tool: one UJ carries real narrative weight (named protagonist, entry state, climax, resolution, and an edge case), which is proportionate — not over-formalized with a persona roster, not under-formalized by skipping UJs entirely the way a pure capability-spec shape might. No stakeholder sign-off, compliance, or ROI sections are present, correctly, given the stated stakes. The addendum split (tech stack, exact data shape, worked example kept out of the PRD body) is a sound way to keep the PRD itself capability-focused while preserving implementation detail the builder volunteered.

No findings.

## Mechanical notes

- **Broken cross-reference**: §5's "(§2, storage discussion)" pointer doesn't resolve to actual content in §2 (see Downstream usability finding above).
- **ID continuity**: FR-1–FR-10 contiguous; UJ-1 only UJ; SM-1/SM-2/SM-3 + SM-C1 counter-metric — no gaps, no duplicates.
- **Assumptions Index roundtrip**: §9 states all draft assumptions "were reviewed and confirmed by the builder — resolved directly into the FRs above," and correspondingly there are zero inline `[ASSUMPTION: …]` tags anywhere in the current body text. The roundtrip is vacuously satisfied (0 inline ↔ 0 tracked as open), but §0's process description ("inferred details are tagged inline as `[ASSUMPTION]` and indexed in §9 for confirmation") describes a convention a reader won't actually see evidence of in this finalized draft — worth knowing this is a post-resolution document, not a mechanical defect requiring action.
- **UJ protagonist naming**: UJ-1 has a named, contextualized protagonist ("Jas... works across Claude, ChatGPT, Cursor, and other AI tools throughout the day") — no floating UJs.
- **Minor logic conflation**: FR-9's consequence — "Category is optional... consistent with categories being lower priority (§6.1)" — ties a data-model decision (field optionality) to a build-priority decision (Categories shipping last) as if one implies the other. They're independent choices that happen to point the same direction; not incorrect, just loosely reasoned.
- **Typo**: FR-4, "unclipped/unrtruncated" → "untruncated."
- **Required sections for stakes**: All sections appropriate to a hobby/solo one-day build are present (Vision, Target User, Glossary, Features/FRs, Non-Goals, MVP Scope, Success Metrics, Open Questions, Assumptions Index); no enterprise-scale sections forced in, correctly.
