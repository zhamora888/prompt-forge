---
title: PromptForge
status: final
created: 2026-07-08
updated: 2026-07-08
name: PromptForge
description: A personal, offline-first prompt library. Structured like Google Keep — simple list of cards, a FAB to add, tap to open — without Keep's per-note color-tint personality. Neutral, monochrome, fast.
colors:
  surface-base: '#F7F7F5'
  surface-raised: '#FFFFFF'
  ink-primary: '#1C1C1E'
  ink-secondary: '#6E6E73'
  ink-disabled: '#B0B0B5'
  accent: '#4453C9'
  accent-soft: '#E8EAFB'
  on-accent: '#FFFFFF'
  border-hairline: '#E5E5E5'
  danger: '#B83A3A'
typography:
  title:
    note: 'Platform native — iOS Title 2 · Android Title Large'
  body:
    note: 'Platform native — iOS Body · Android Body Large'
  meta:
    note: 'Platform native — iOS Footnote · Android Body Small'
rounded:
  sm: 8px
  md: 12px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
---

## Brand & Style

PromptForge is a utility, not a product with a personality to perform. It exists for one moment, repeated many times a day: find a prompt, copy it, get back to work. Every visual decision serves that moment — nothing competes with the text the user actually came for.

The reference is Google Keep's structure — a plain grid of cards, a FAB to add, tap to open — deliberately stripped of Keep's signature move: no per-note color tinting. Cards stay fully monochrome throughout; color-per-category or color-per-favorite would read as a second, competing organizational system alongside the category/tags/favorite system the PRD already owns. One accent color exists, used only for actionable/selected states, never for decoration.

## Colors

- **Warm Off-White (`{colors.surface-base}`, `#F7F7F5`)** — the app canvas. Slightly warm and slightly off pure white so cards visibly sit *on* it.
- **White (`{colors.surface-raised}`, `#FFFFFF`)** — card and sheet surfaces. The only separation from canvas is this tone shift plus a hairline border — no shadow-driven elevation (see Elevation & Depth).
- **Near-Black (`{colors.ink-primary}`, `#1C1C1E`)** — primary text: prompt titles, content body.
- **Warm Gray (`{colors.ink-secondary}`, `#6E6E73`)** — secondary text: category labels, tags, timestamps, content preview snippets. Never used for anything the user needs to act on.
- **Disabled Gray (`{colors.ink-disabled}`, `#B0B0B5`)** — disabled/placeholder states only (e.g. empty title field placeholder).
- **Indigo (`{colors.accent}`, `#4453C9`)** — the one chromatic color. FAB, the filled favorite star, active filter/search state, primary buttons (Save, Copy), form-input focus border. Muted and professional by design — unaffiliated with any specific AI tool's brand color, since the app is intentionally tool-agnostic.
- **Indigo Soft (`{colors.accent-soft}`, `#E8EAFB`)** — accent's light tint. Selected filter chip background, category badge background, favorite star's resting fill-behind. Never for text.
- **On-Accent White (`{colors.on-accent}`, `#FFFFFF`)** — text/icon color on top of `{colors.accent}` or `{colors.ink-primary}` fills (FAB icon, Toast text). Kept as its own semantic token rather than reusing `{colors.surface-raised}`, which means "a card," not "text on a dark fill" — same hex, different job.
- **Hairline (`{colors.border-hairline}`, `#E5E5E5`)** — card borders and list dividers, at the lowest contrast that's still legible.
- **Danger Red (`{colors.danger}`, `#B83A3A`)** — delete confirmation only. Never appears anywhere else, so it stays meaningful when it does.

**Contrast target:** WCAG AA — 4.5:1 for normal text and icons, 3:1 for large text. `{colors.accent}` on `{colors.accent-soft}` and `{colors.danger}`/`{colors.on-accent}` on their respective fills are the load-bearing small-text combinations and were chosen to clear 4.5:1 with margin (not just pass at the threshold).

Avoid: color-per-category or color-per-card (that's Keep's move, deliberately not PromptForge's), gradients, saturated accent variants — one indigo, used sparingly.

## Typography

Platform conventions are the spec — no custom typeface. iOS uses Title 2 / Body / Footnote; Android uses Title Large / Body Large / Body Small. Dynamic type honored at every level.

Prompt titles (card and detail) set in `title`. Content body, form fields, and buttons in `body`. Category, tags, timestamps, and content-preview snippets in `meta`. No display sizes, no all-caps labels, no decorative type.

## Layout & Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32px (`{spacing.1}`–`{spacing.6}`). Card internal padding uses `{spacing.4}`; gaps between cards in the list use `{spacing.3}`; margins between major regions (search bar, filter row, list) use `{spacing.5}`.

Single column list on phone widths — no masonry/staggered grid despite the Keep reference; a straight list keeps content-preview lines easy to scan and matches PromptForge's title/content/copy priority over visual browsing. Mobile margins follow platform convention (iOS 16pt / Android 16dp). Modal/sheet stacks one level deep, never two.

## Elevation & Depth

No drop shadows. Cards sit on `{colors.surface-raised}` against `{colors.surface-base}`, separated by tone plus a `{colors.border-hairline}` border — the same restrained, paper-like logic as a plain list, not a stack of floating panels. The FAB is the one exception: a small, low shadow, since it needs to read as floating above the list to signal "always tappable."

## Shapes

`{rounded.sm}` (8px) for chips, badges, and form inputs. `{rounded.md}` (12px) for cards and sheets. `{rounded.full}` for the FAB and filter chips (pill-shaped). Consistent soft-corner language throughout — nothing sharp, nothing fully skeuomorphic.

## Components

- **Prompt card** — `{colors.surface-raised}`, `{rounded.md}`, hairline border. Title in `title` (1 line, truncated). Content preview in `meta`, `{colors.ink-secondary}` (2 lines, truncated). Category badge (if set) top-left of the preview. Favorite star top-right of the card — filled `{colors.accent}` when active, outline `{colors.ink-secondary}` when not. Copy icon bottom-right — tap target `{spacing.6}`+ regardless of visual icon size.
- **FAB** — `{colors.accent}` fill, `{colors.on-accent}` icon, `{rounded.full}`, fixed bottom-right, low shadow (see Elevation). The one persistent create affordance, visible on every state of the Library surface including empty.
- **Search bar** — `{colors.surface-raised}`, `{rounded.sm}`, persistent at the top of Library, not a separate surface. Placeholder text `{colors.ink-disabled}`.
- **Filter row** — Below the search bar. "All" / "Favorites" segmented as pill chips (`{rounded.full}`); selected chip uses `{colors.accent-soft}` fill with `{colors.accent}` text. Category filter as one additional chip that opens a picker — see FR-10, lowest build priority.
- **Category badge** — Small `{rounded.sm}` pill, `{colors.accent-soft}` background, `{colors.accent}` text, `meta` size. Appears on cards and in the create/edit form's category picker. Behavior: `EXPERIENCE.md.Component Patterns`.
- **Tag chip** — Small `{rounded.sm}` pill, `{colors.surface-base}` background, `{colors.ink-secondary}` text, hairline border, `meta` size. Behavior: `EXPERIENCE.md.Component Patterns`.
- **Toast** — Bottom-anchored, `{colors.ink-primary}` background, `{colors.on-accent}` text, auto-dismiss. Used only for the copy confirmation ("Copied.").
- **Confirm dialog** — Centered sheet, used only for delete. Destructive action button: `{colors.danger}` fill, `{colors.on-accent}` text. Cancel: text-only, `{colors.ink-secondary}`.
- **Detail action row** — Prompt Detail's action row: four tap targets (Copy, Favorite, Edit, Delete), each icon-plus-label, evenly spaced, `{spacing.4}` padding. Copy and Edit in `{colors.ink-primary}`; Favorite follows the card's filled/outline accent rule; Delete in `{colors.danger}`, the only red element on the surface.
- **Form input** — Title/Content/Tags fields on Create/Edit. `{colors.surface-raised}` fill, `{rounded.sm}`, `{colors.border-hairline}` border at rest. Focus: border becomes `{colors.accent}` (2px), no fill change. Placeholder text `{colors.ink-disabled}`.

## Do's and Don'ts

| Do | Don't |
|---|---|
| One accent color, used only for actionable/selected states | Color-code cards by category or favorite status |
| Hairline borders for separation | Drop shadows on cards (reserve shadow for the FAB only) |
| Truncate long content in previews, show full content only in detail | Let a long prompt distort the list's rhythm |
| Text-plus-icon for the one destructive action (delete) | Icon-only destructive actions with no confirm step |
| Platform-native type and navigation conventions | Custom fonts, custom tab bars, custom back gestures |
