# MundoFit Design Token Foundation

**Date:** 2026-07-07  
**Status:** Complete

## Summary

Implemented the first MundoFit Design System foundation by expanding the existing CSS custom-property contract in `app/globals.css` and exposing it through semantic Tailwind aliases in `tailwind.config.ts`.

The implementation centralizes approved reusable values without changing component markup, application behavior, product flows, layouts, or resolved visual values. Existing Tailwind utility names remain backward compatible.

## Files Modified

| File | Change |
|---|---|
| `app/globals.css` | Expanded the centralized runtime token contract and replaced reusable global literals with token references. |
| `tailwind.config.ts` | Mapped the token contract into semantic Tailwind utilities while retaining all existing mappings. |
| `docs/reports/2026-07-07-design-tokens.md` | Added this implementation and validation report. |

No business logic, database, route, layout, or component file was modified.

## Tokens Created

| Category | Token groups |
|---|---|
| Colors | Background, accent, text, border, divider, scrim, selection, and semantic status colors |
| Typography | Inter font-family stack, seven approved font sizes, paired line heights, five font weights, and approved letter spacing |
| Spacing | 2 px micro step and the approved 4 px-based scale through the 28 px section gap |
| Border radius | Existing numeric scale plus semantic `chip`, `control`, `card`, `panel`, and `pill` roles |
| Shadows | Card, modal, accent glow, and compact accent glow |
| Layout | App maximum width, header height, bottom navigation height, minimum touch target, primary action height, and safe areas |
| Z-index | Base, content, dropdown, sticky, navigation, and overlay layers |
| Animation duration | Micro, fast, state, overlay, entry, and 500 ms maximum durations |
| Transition timing | Standard MundoFit cubic Bézier, progress ease-out, and linear timing |
| Opacity | Hidden, subtle, soft, disabled, muted, scrim, chrome, and visible roles |

Tailwind now exposes semantic utilities for these groups, including `rounded-control`, `rounded-card`, `rounded-panel`, `z-navigation`, `z-overlay`, `duration-state`, `duration-entry`, `ease-standard`, `opacity-disabled`, layout dimensions, and safe-area spacing.

## Decisions

- Kept `app/globals.css` as the single runtime token source because it already owns the approved MundoFit palette and is consumed by every route.
- Kept `tailwind.config.ts` as an adapter to CSS variables instead of duplicating raw values in TypeScript.
- Preserved the existing `rounded-sm`, `rounded-md`, `rounded-lg`, and `rounded-xl` mappings exactly. The documented legacy naming collision remains backward compatible; new work can use semantic radius aliases without changing current rendering.
- Replaced `--success`'s duplicate raw color with a reference to `--accent` because success intentionally uses the brand accent.
- Preserved all existing font-size, line-height, font-weight, letter-spacing, width, safe-area, color, shadow, and radius computed values.
- Did not add custom breakpoints. The application remains mobile-first, the existing Tailwind breakpoints are sufficient, and the 430 px rule is a container-width token rather than a responsive breakpoint.
- Did not migrate component-local literals in this foundation task. Broad component migration would increase visual-regression risk and mix the token contract with component refactoring.

## Validation

| Check | Command | Result |
|---|---|---|
| Tailwind token compilation | `npx.cmd tailwindcss -i app/globals.css -o NUL` | PASS |
| ESLint | `npm run lint` (executed through `npm.cmd`) | PASS — no warnings or errors |
| TypeScript | `npx tsc --noEmit` (executed through `npx.cmd`) | PASS |
| Diff integrity | `git diff --check` | PASS |
| Scope review | Final task-file and working-tree review | PASS — only token foundation files and this report are task-owned changes |

The project currently uses `next lint`, which emitted its existing Next.js 16 deprecation notice. This warning does not affect the passing lint result.

## Next Recommended Task

Migrate the core `Button`, `Input`, and `Toast` primitives to the new semantic color, typography, radius, spacing, motion, opacity, and z-index utilities as one bounded task. Capture before/after mobile screenshots and require pixel-equivalent visual output before migrating feature components.
