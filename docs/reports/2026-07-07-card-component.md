# MundoFit Card Component

**Date:** 2026-07-07  
**Status:** Complete

## Summary

Implemented the official reusable MundoFit `Card` primitive in `components/ui/card.tsx` with four variants, loading support, keyboard-accessible interactive behavior, and the optional `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` sections.

The component uses the existing design-token system for color, radius, elevation, spacing, focus treatment, and transition timing. No app redesign was introduced.

Low-risk existing card-like surfaces were migrated to the shared primitive:

- the dashboard surface wrapper (`DashboardCard`);
- the interactive quick-link tile (`QuickLinkCard`);
- the simple placeholder pages for Weight, Photos, Goals, and Calories;
- the auth card shells for Login, Register, and Forgot Password.

## Files Created

- `components/ui/card.tsx`
- `docs/reports/assets/2026-07-07-card/login-after.png`
- `docs/reports/assets/2026-07-07-card/register-after.png`
- `docs/reports/assets/2026-07-07-card/forgot-password-after.png`
- `docs/reports/assets/2026-07-07-card/card-gallery-after.png`
- `docs/reports/assets/2026-07-07-card/diagnostics.json`
- `docs/reports/2026-07-07-card-component.md`

## Files Modified

- `components/dashboard/ui/dashboard-card.tsx`
- `components/workouts/quick-link-card.tsx`
- `components/auth/login-form.tsx`
- `components/auth/register-form.tsx`
- `components/auth/forgot-password-form.tsx`
- `app/[locale]/(app)/weight/page.tsx`
- `app/[locale]/(app)/photos/page.tsx`
- `app/[locale]/(app)/goals/page.tsx`
- `app/[locale]/(app)/calories/page.tsx`

## Files Deleted

- `app/[locale]/visual-qa/card/page.tsx`  *(temporary QA route)*
- `components/visual-qa/card-gallery.tsx`  *(temporary QA fixture)*

## Component API

| Export | Purpose |
|---|---|
| `Card` | Root surface primitive. Supports `default`, `elevated`, `outlined`, and `interactive` variants, plus `loading` state and native props. |
| `CardHeader` | Structured header section with token-backed spacing. |
| `CardTitle` | Title heading for card surfaces. |
| `CardDescription` | Supporting description text for card surfaces. |
| `CardContent` | Main content section helper. |
| `CardFooter` | Footer/action row helper. |

`Card` renders a `div` for non-interactive variants and a native `button` for `interactive`, preserving keyboard behavior without additional wrapper code.

## Variants

| Variant | Contract |
|---|---|
| `default` | Standard MundoFit surface with token-backed border, surface background, and shadow. |
| `elevated` | Slightly higher-emphasis surface for grouped content or emphasized panels. |
| `outlined` | Lower-chrome surface using the divider token and no shadow. |
| `interactive` | Keyboard-accessible button surface with hover and focus-visible treatment for tappable cards. |

## Accessibility

- `interactive` cards use a native `<button>`, so keyboard activation and focus management are built in.
- `loading` cards set `aria-busy` and show a non-interactive spinner overlay.
- Focus-visible treatment uses the approved token-backed focus ring.
- The implementation preserves minimum mobile touch sizing through existing tokenized spacing patterns.
- Decorative loading and icon treatment remains outside the accessible name where appropriate.
- Reduced-motion behavior is preserved through the shared transition token set.

## Migration Summary

- `DashboardCard` now composes the shared `Card` primitive and keeps its existing accent option.
- `QuickLinkCard` now uses the `interactive` card variant instead of a local one-off card button shell.
- The placeholder pages for Weight, Photos, Goals, and Calories now use the shared `Card` surface instead of hardcoded surface classes.
- The auth shell cards on Login, Register, and Forgot Password now use the shared `Card` surface while preserving the existing layouts and actions.

No business logic, routing, database, or workout logic was changed.

## Visual QA

Headless browser capture was blocked by the sandbox browser GPU process, so visual QA used a visible Chrome window plus the browser remote-debugging protocol to capture the rendered page surface directly.

Captured screens:

| Surface | Screenshot | Result |
|---|---|---|
| Login | [login-after.png](assets/2026-07-07-card/login-after.png) | PASS |
| Register | [register-after.png](assets/2026-07-07-card/register-after.png) | PASS |
| Forgot password | [forgot-password-after.png](assets/2026-07-07-card/forgot-password-after.png) | PASS |
| Card gallery | [card-gallery-after.png](assets/2026-07-07-card/card-gallery-after.png) | PASS |
| Diagnostics | [diagnostics.json](assets/2026-07-07-card/diagnostics.json) | PASS |

Observed in QA:

- No layout regressions were found on the inspected surfaces.
- No spacing, alignment, overflow, typography, or color regressions were found.
- The interactive card focus state is visible and keyboard-accessible.
- The loading card state preserves geometry and shows the expected spinner treatment.
- The Next.js development indicator is visible in the dev screenshots; it is not application UI.

## Validation

| Check | Command | Result |
|---|---|---|
| ESLint | `npm.cmd run lint` | PASS |
| TypeScript | `npx.cmd tsc --noEmit` | PASS |
| Diff check | `git diff --check` | PASS |

## Next Recommended Task

Migrate the remaining safe card-like containers in the dashboard, measurements, workouts, and profile surfaces to the official `Card` primitive, then add a shared empty-state or skeleton-card contract if those patterns remain duplicated.

