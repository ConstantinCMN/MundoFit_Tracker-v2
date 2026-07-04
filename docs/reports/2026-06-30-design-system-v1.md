# Design System Documentation — MundoFit V3

**Date:** 2026-06-30  
**Type:** Documentation  
**Status:** COMPLETE  

---

## Executive Summary

`docs/design/MundoFit_V3_Design_System.md` has been created as the official MundoFit Design System v1.0. The document is 1 278 lines, covers all 22 required sections, contains zero placeholders, and derives every technical value directly from the live codebase (`app/globals.css`, `tailwind.config.ts`, component source files). It is intended to serve as the single source of truth for all present and future UI decisions.

---

## Document Location

```
docs/design/MundoFit_V3_Design_System.md   — 1 278 lines
docs/design/mundofit-v3-design-system.png  — official design reference (linked in §1 and §22)
```

---

## Section Inventory

| # | Section | Key Content |
|---|---|---|
| 1 | Vision | Design DNA table, reference image path |
| 2 | Brand Identity | App name rules, accent color, voice, supported locales |
| 3 | Non-Negotiable Rules | 10 hard constraints that cannot be overridden |
| 4 | Design Principles | 5 named principles with implementation guidance |
| 5 | Color System | All CSS tokens, elevation scale, accent usage table, text contrast ratios, semantic colors |
| 6 | Typography | Inter font config, full 7-level type scale, weight guide, 6 named patterns, letter-spacing rules |
| 7 | Layout System | App container, route groups, AppShell ASCII diagram, session standalone layout diagram, header/nav specs |
| 8 | Grid & Spacing | Horizontal padding by context, vertical spacing scale, spacing table, touch-target minimum |
| 9 | Border Radius | 5-token scale with usage guide per radius value |
| 10 | Elevation & Shadows | 4-layer elevation system, 4 named shadow tokens, glow usage, backdrop-blur WebKit warning |
| 11 | Iconography | Library (Lucide), sizing by context, color by state, icon button pattern with code |
| 12 | Hero Background System | Avatar ring structure, greeting logic table, goal-specific emoji map |
| 13 | SVG Body System | File paths, SVG color scheme table, `data-muscle` attribute, view toggle details, component API |
| 14 | Workout Experience | Screen flow diagram, executing-phase layout diagram, progress bar code, set completion UX table, rest timer, session standalone layout |
| 15 | Dashboard Experience | Section order, layout code, section anatomy, card pattern table, empty state guidelines |
| 16 | Accessibility | Contrast ratio table, touch target guidance, screen reader requirements, focus management, tap highlight |
| 17 | Motion & Animations | Philosophy, curve table, `fadeUp` code, nav spring, segmented control, progress bar CSS, whileTap, overlay entry/exit, duration constraints table |
| 18 | Component Overview | Core, dashboard, and session component directories; 3 button patterns; input pattern; chip/badge patterns |
| 19 | Future Premium Experience | Session recovery, exercise library V2, AI generator V2, analytics, glassmorphism overlay |
| 20 | AI Development Rules | Pre-coding checklist, component generation rules, 5-point quality gate |
| 21 | Do / Don't | 4 tables (Colors, Typography, Layout, Motion, Accessibility) |
| 22 | References | Internal file paths + 10 external references with URLs |

---

## Formatting Verification

- [x] Clickable table of contents (`[Section](#anchor)` format)
- [x] All 22 `## N. Section` headings present (verified via grep)
- [x] ASCII layout diagrams for AppShell and session screen
- [x] Markdown tables for all structured data
- [x] Code blocks for all token definitions, patterns, and component examples
- [x] Callout note for the WebKit `backdrop-filter` / `overflow: hidden` bug
- [x] Zero placeholders — every technical value sourced from codebase
- [x] Relative file paths for internal references
- [x] Professional technical English throughout

---

## Technical Values Coverage

| Category | Source File | Documented |
|---|---|---|
| CSS custom properties (colors, radius, shadows) | `app/globals.css` | ✅ All tokens in §5, §9, §10 |
| Tailwind extended theme (font sizes, weights) | `tailwind.config.ts` | ✅ Full scale in §6 |
| Header dimensions and styles | `components/layout/header.tsx` | ✅ §7 |
| Bottom nav structure and animation values | `components/layout/bottom-nav.tsx` | ✅ §7, §17 |
| AppShell layout | `components/layout/app-shell.tsx` | ✅ §7 |
| Inter font configuration | `app/[locale]/layout.tsx` | ✅ §6 |
| fadeUp animation | `components/dashboard/ui/animations.ts` | ✅ §17 |
| Avatar glow and accent gradient | `components/dashboard/sections/hero-section.tsx` | ✅ §12 |
| SVG body viewBox and color system | `public/anatomy/front.svg` | ✅ §13 |
| Progress bar implementation | `components/workouts/generator-client.tsx` | ✅ §14 |
| Session screen layout | `components/workouts/session/` | ✅ §14 |
| Design reference image | `docs/design/mundofit-v3-design-system.png` | ✅ §1, §22 |

---

## What Was NOT Included

- Component-level code for every dashboard section — the document is a design system reference, not a component library dump. Code patterns are shown for the most reusable primitives (buttons, inputs, chips, progress bar). Individual section implementations are in `components/dashboard/sections/`.
- Exercise library UI components — scheduled for a future sprint; §19 names the intended design direction.
- Recharts configuration details — charting is a future premium feature referenced in §19.

---

## Maintenance Notes

- **Color tokens:** Update `app/globals.css` first, then update §5 in the design system.
- **Component additions:** Add to the Component Overview table in §18 when a new reusable component is created.
- **New animation curves:** Add to the curves table in §17 and document which component introduced them.
- **Rule violations:** The Non-Negotiable Rules in §3 require design review to override. They are not resolved by consensus in PRs.

---

_Report generated 2026-06-30_
