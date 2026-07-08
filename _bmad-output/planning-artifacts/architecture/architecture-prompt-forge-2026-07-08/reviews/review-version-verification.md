---
review: version-verification
target: ARCHITECTURE-SPINE.md (PromptForge, architecture-prompt-forge-2026-07-08)
reviewer: finalize-reviewer (version-verification gate)
date: 2026-07-08
method: independent web search against each named technology/version in the spine's Stack table and prose, cross-checked against .memlog.md's claimed "web-verified" entries
---

# Version Verification Review — PromptForge Architecture Spine

## Method

For each committed technology/version, I ran independent web searches (not relying on the memlog's claims) and, where useful, fetched primary sources (Expo docs, GitHub releases/changelogs/issues, react.dev, reactnative.dev). I then cross-checked whether the memlog actually shows a "(version) web-verified" log line for that item, since a claim of verification in the log is not itself proof unless corroborated.

## Findings by Technology

### 1. Expo SDK 56
- **Spine claim:** Expo SDK 56.
- **Memlog claim:** "(version) web-verified 2026-07-08: Expo SDK 56 (May 2026 release), React Native 0.85, React 19.2, New Architecture mandatory (Legacy Architecture removed as of SDK 55+)."
- **Independent finding:** Confirmed real and current. Released May 21, 2026, bundling React Native 0.85 and React 19.2. Corroborated across expo.dev/changelog/sdk-56, multiple independent SDK-56 writeups, and dev.to coverage. New Architecture is indeed mandatory as of SDK 55+ (Old Architecture dropped).
- **Verdict: confirmed-current.**

### 2. React Native 0.85
- **Spine claim:** React Native 0.85.
- **Independent finding:** Confirmed real. Official reactnative.dev blog post dated 2026-04-07, matches Expo SDK 56's bundled RN version. Note (informational, not a defect): RN 0.86 was already released by June 2026, so 0.85 is one minor behind bleeding-edge RN — expected and correct, since Expo pins a specific RN per SDK rather than tracking RN's own release cadence.
- **Verdict: confirmed-current.**

### 3. React 19.2
- **Spine claim:** React 19.2.
- **Independent finding:** Confirmed real (react.dev blog, 2025-10-01 release announcement). Matches what RN 0.85/Expo SDK 56 bundles. Note: React 19.2 has actually been RN's bundled React version since RN 0.83 (Dec 2025), so this is a stable, well-tested pairing, not a fresh/risky one.
- **Verdict: confirmed-current.**

### 4. Expo Router (bundled with Expo SDK 56, file-based routing, default)
- **Spine claim:** "bundled with Expo SDK 56 (file-based routing, default)."
- **Memlog claim:** "web-verified 2026-07-08: Expo SDK 56 ships Expo Router... as the default paved-path navigation; React Navigation still works underneath but is no longer expo-router's direct dependency as of SDK 56."
- **Independent finding:** Confirmed. Expo Router is the documented default/paved-path navigation for Expo SDK 56, file-based routing confirmed via docs.expo.dev. One relevant SDK-56 change not mentioned in the spine (informational only, doesn't contradict anything committed): as of SDK 56, Expo Router app code can no longer import directly from external `@react-navigation/*` packages — imports must go through expo-router's own entry points. This doesn't affect the spine's decisions since the spine never mentions React Navigation directly, but worth flagging for whoever writes actual navigation code.
- **Verdict: confirmed-current.**

### 5. NativeWind v4 (stable, Tailwind v3)
- **Spine claim:** "v4 (stable, Tailwind v3)."
- **Memlog claim:** "web-verified 2026-07-08: NativeWind v4 (stable, Tailwind v3) vs v5 (preview, CSS-first config) — both compatible with Expo SDK 56's mandatory New Architecture."
- **Independent finding:** Confirmed. Latest published NativeWind release as of my search is `4.2.6` (June 22, 2026) — v4 is actively maintained and is the "latest" npm tag. v5 is still at `5.0.0-preview.4` (May 15, 2026) with no stable 5.0.0 tag found. A NativeWind maintainer discussion (opened 2026-06-17) lays out a plan to promote 5.0 to `latest` after an RC + ~2-week bake period — meaning v5's promotion to default could plausibly land within weeks of this spine's 2026-07-08 date. This doesn't make the spine's claim wrong today, but it's a fast-moving target: worth a re-check at actual implementation time rather than treating "v4 is the default" as durable beyond the near term. Both v4 and v5 are independently confirmed compatible with SDK 56's mandatory New Architecture, matching the memlog's claim.
- **Verdict: confirmed-current** (with a freshness caveat — re-verify at implementation time given v5's imminent promotion timeline).

### 6. `@react-native-async-storage/async-storage` — installed via `npx expo install`, do not hand-pin
- **Spine claim:** "installed via `npx expo install` — Expo resolves the SDK-56-compatible version; do not hand-pin a version from npm directly (community package versioning has drifted from Expo's pinned compatibility in the past)."
- **Memlog claim:** "search surfaced conflicting guidance — v2.2.0 'recommended for Expo' vs v3.1.1 'latest' vs a GitHub issue about Expo forcing v1.23.1; safest binding is 'whatever `npx expo install` resolves.'"
- **Independent finding — this is the specific practice the task asked me to stress-test, and it holds up:**
  - There is a real, documented incompatibility: async-storage 3.x fails EAS/native builds against recent Expo SDKs (missing Android dependency `org.asyncstorage.shared_storage:storage-android:1.0.0`), acknowledged by the package maintainer (GitHub issue #43757, expo/expo).
  - Expo's own `packages/expo/bundledNativeModules.json` for SDK 56 pins `@react-native-async-storage/async-storage` to **2.2.0** — the same version community guidance independently recommends as the compatible one.
  - `npx expo install` reads that bundled-native-modules manifest, so for SDK 56 it correctly resolves to 2.2.0, sidestepping the broken 3.x line. This is not merely plausible — it's directly verifiable from Expo's own source of truth.
  - Conclusion: the spine's "don't hand-pin, let `expo install` resolve it" guidance is sound and independently verifiable, not just an assumption inherited from the memlog's own claim.
- **Verdict: confirmed-current** (the practice is independently verified sound, not just asserted).

### 7. `expo-clipboard` 56.0.4
- **Spine claim:** 56.0.4.
- **Independent finding:** Confirmed — npm shows expo-clipboard's current published version as 56.0.4, matching Expo SDK 56's version-alignment scheme (package version tracks SDK number).
- **Verdict: confirmed-current.**

### 8. `expo-crypto` 56.0.4
- **Spine claim:** 56.0.4. Also implicitly claims `expo-crypto` provides `randomUUID()` (used in Consistency Conventions for id generation).
- **Independent finding:** Confirmed — npm shows expo-crypto's current published version as 56.0.4. Also independently confirmed `Crypto.randomUUID()` exists, is synchronous, returns a v4-UUID string per RFC4122 — matches how the spine describes its use in the Repository (id generated once, synchronously, at create time).
- **Verdict: confirmed-current.**

### 9. `expo-splash-screen`
- **Spine claim:** Used to keep the native splash screen visible during initial AsyncStorage hydration via `expo-splash-screen`, package referenced by name in the Stack table and Consistency Conventions.
- **Memlog claim:** **None.** This is the one Stack-table entry with no corresponding "(version) web-verified" log line anywhere in .memlog.md. It was introduced during the gap-reconciliation pass (line 28: "added expo-splash-screen-gated hydration convention...") without an accompanying verification entry, unlike every other Stack item, which each got an explicit `(version) web-verified` log line.
- **Independent finding:** Package name and core API are current and correct — `expo-splash-screen` is not deprecated or renamed; `preventAutoHideAsync()` / `hideAsync()` remain the supported API (older unsuffixed `hide`/`preventAutoHide` methods were removed back in 2023, unrelated to this spine). One caveat worth surfacing: an open GitHub issue (expo/expo #45756, filed against an SDK 56 preview build, ~56.0.0-preview.10) reports `preventAutoHideAsync()` not actually preventing auto-hide in some cases — status "needs more info," unclear if it's fixed in the SDK 56 stable release. This doesn't invalidate the spine's architectural convention, but it's a concrete implementation risk for the exact hydration-gating behavior the Consistency Conventions section describes, and it's the kind of thing a web-verification pass would normally have surfaced and logged.
- **Verdict: plausible-but-unverified-by-spine.** My own search confirms the package/API choice is correct, but the memlog shows no evidence this item was actually checked during drafting — it was asserted (correctly, as it turns out) rather than verified, unlike every sibling entry in the Stack table.

## Cross-Check: Memlog's Own "web-verified" Claims

Every memlog line tagged `(version) web-verified 2026-07-08` was independently re-derived and corroborated by my own search in this review:
- Expo SDK 56 / RN 0.85 / React 19.2 / New Architecture mandatory — corroborated.
- react-native-mmkv perf claim / EAS dev-client requirement (relevant to the storage-engine decision, not in the final Stack table since MMKV was rejected) — not independently re-verified in this pass since it's a rejected option, not a committed decision; flagged here only for completeness, not scored.
- Expo Router as SDK 56 default — corroborated.
- NativeWind v4 vs v5 compatibility with New Architecture — corroborated, with the added freshness note above.
- expo-clipboard/expo-crypto version alignment + AsyncStorage version conflict — corroborated, and the AsyncStorage practice specifically was traced to Expo's own bundledNativeModules.json as a stronger form of verification than the memlog itself performed.

No case was found where the memlog's verification claim conflicted with what independent search turned up. The one real gap is the absence of any verification trail for `expo-splash-screen` (finding #9 above).

## Summary Table

| # | Technology | Spine version/claim | Memlog shows web-verification? | Independent re-check result | Verdict |
|---|---|---|---|---|---|
| 1 | Expo SDK | 56 | Yes | Corroborated | confirmed-current |
| 2 | React Native | 0.85 | Yes | Corroborated | confirmed-current |
| 3 | React | 19.2 | Yes | Corroborated | confirmed-current |
| 4 | Expo Router | bundled/default | Yes | Corroborated (+1 informational note on RN-navigation import change) | confirmed-current |
| 5 | NativeWind | v4 stable / Tailwind v3 | Yes | Corroborated; v5 promotion to `latest` plausible within weeks | confirmed-current (freshness caveat) |
| 6 | `@react-native-async-storage/async-storage` | expo-install-resolved, no hand-pin | Yes | Corroborated and strengthened via Expo's own bundledNativeModules.json (pins 2.2.0 for SDK 56) | confirmed-current |
| 7 | `expo-clipboard` | 56.0.4 | Yes | Corroborated | confirmed-current |
| 8 | `expo-crypto` | 56.0.4 (+ `randomUUID()` usage) | Yes | Corroborated, incl. `randomUUID()` API shape | confirmed-current |
| 9 | `expo-splash-screen` | package name, hydration-gating convention | **No** | Package/API confirmed correct; one open SDK-56-preview bug report on `preventAutoHideAsync()` found that memlog never surfaced | plausible-but-unverified-by-spine |

## Overall Assessment

8 of 9 committed technology decisions show genuine, corroborated web-verification — the memlog's claims hold up under independent re-check, and in one case (AsyncStorage) the underlying practice was verifiable to a stronger degree than the memlog itself demonstrated (via Expo's bundledNativeModules.json). One item, `expo-splash-screen`, was added to the Stack during the gap-reconciliation pass without any accompanying verification log entry and should not be treated as web-checked even though it happens to be correct. No stale or wrong claims were found; no direct conflicts between the spine and current reality were found. The only forward-looking risk worth carrying into implementation: NativeWind v5 is likely to be promoted from preview to `latest` within weeks of this spine's date, and `expo-splash-screen`'s `preventAutoHideAsync()` has an open, unresolved bug report against SDK 56 preview builds that should be re-checked against the stable release before the hydration-gating convention is implemented.
