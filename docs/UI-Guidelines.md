# MundoFit Tracker V2 — UI Guidelines

> Generated from the actual repository state on 2026-07-04.

## Canonical source of truth

**`docs/design/MundoFit_V3_Design_System.md`** is the official, current design system (v1.0, dated 2026-06-30). It explicitly states it "supersedes all prior design references for the V3 release" and includes an "AI Development Rules" section (§20) written specifically for AI coding agents. Read that document in full before writing UI code — this file is a short index into it, not a replacement.

`docs/UI_UX.md` is an earlier design reference (pre-V3). It predates the official design system and several of its details (color token names, component patterns) are superseded by `docs/design/MundoFit_V3_Design_System.md`. It has not been deleted or merged because that is an editorial/architecture decision outside this document's scope — flag it to the Product/Design owner if you want it consolidated or archived.

---

## Non-negotiable rules (from the design system, §3)

These cannot be overridden by an individual screen or feature:

1. Dark mode only — no light mode, no system-preference toggle. Page background is always `#0a0a0a`.
2. 430px max width app container, centered on desktop.
3. Accent is `#aaff00` ("Electric Lime") — no tints, no substitutes. `#88cc00` only for gradient tails / hover.
4. Inter only, no other typeface.
5. No pure white (`#ffffff`) anywhere in the UI — lightest text is `#f5f5f5`.
6. Active state uses accent, never white or blue.
7. No borders on cards — background-color elevation instead (exception: subtle `rgba(255,255,255,0.06)` inner dividers).
8. Shadows convey elevation only, never decoration.
9. No animation exceeds 500ms.
10. The `(session)` route group is chrome-free — no `AppShell`, no header, no bottom nav.

## Quick token reference

All tokens are defined once, in `app/globals.css`, and mapped into Tailwind in `tailwind.config.ts`. Use the Tailwind names (`bg-surface`, `text-muted`, `accent`, etc.) or the CSS custom properties — never a raw hex value that duplicates an existing token.

| Layer | Token | Hex / Value |
|---|---|---|
| Background | `--bg-base` | `#0a0a0a` |
| Background | `--bg-surface` | `#111111` |
| Background | `--bg-elevated` | `#1a1a1a` |
| Background | `--bg-overlay` | `#222222` |
| Accent | `--accent` | `#aaff00` |
| Accent | `--accent-dim` | `#88cc00` |
| Text | `--text-primary` | `#f5f5f5` |
| Text | `--text-secondary` | `#888888` |
| Text | `--text-muted` | `#555555` (fails WCAG AA at 4.5:1 — non-essential text only) |
| Border | `--border` | `#2a2a2a` |
| Semantic | `--danger` / `--warning` / `--success` / `--info` | `#ff4444` / `#ff9900` / `#aaff00` / `#4499ff` |
| Radius | `sm` / `md` / `lg` / `xl` / `full` | `8px` / `12px` / `16px` / `24px` / `9999px` |
| Type scale | `xs`…`3xl` | `11px`…`32px` (see design system §6 for line-heights and weight pairing) |

Spacing, motion curves (`fadeUp`, spring presets), component patterns (cards, buttons, chips, progress bars), route-group-to-chrome mapping, and the full accessibility checklist all live in the design system doc — sections 5–18 — and are intentionally not duplicated here.

## Route group → chrome (quick lookup)

| Route group | Chrome |
|---|---|
| `(app)` | `AppShell` — Header (48px) + BottomNav (64px) |
| `(auth)` | None |
| `(onboarding)` | None |
| `(session)` | None — standalone, full-screen (`workout-session-engine-blueprint.md` explains why) |

## Before writing UI code

Same gate as the design system's own AI rules (§20):
1. Read `docs/design/MundoFit_V3_Design_System.md` — don't invent a color, spacing, radius, or motion value.
2. Confirm the route group before picking a layout.
3. Run `npx tsc --noEmit` with zero errors.
4. Visually check at a 390px mobile viewport.
5. Confirm the accent is exactly `#aaff00`, never `lime-500` or `#00ff00`.
6. Confirm every icon-only button has an `aria-label`.

See `AGENTS.md` for the broader pre-implementation checklist this fits into.
