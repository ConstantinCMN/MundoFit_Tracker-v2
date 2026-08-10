# Skeleton Component and Loading States

Date: 2026-08-10

## Summary

Finalized a reusable, token-based Skeleton component family and integrated route-level loading states for authentication, dashboard, and workout exercise-library routes. The former dashboard-only skeleton card was replaced by the shared UI primitive. No business logic, routing behavior, authentication behavior, database code, workout logic, or exercise data was changed.

## Files Modified

- `app/globals.css` - added Skeleton design tokens derived from existing theme, spacing, control-height, divider, and motion tokens.
- `tailwind.config.ts` - mapped the Skeleton color, size, gradient, keyframe, and animation tokens to Tailwind utilities.

## Files Created

- `components/ui/skeleton.tsx`
- `app/[locale]/(auth)/loading.tsx`
- `app/[locale]/(app)/dashboard/loading.tsx`
- `app/[locale]/(app)/workouts/library/loading.tsx`
- `docs/reports/2026-08-10-skeleton-component.md`

## Files Deleted

- `components/dashboard/ui/skeleton-card.tsx` - superseded by `components/ui/skeleton.tsx`; repository search found no remaining imports of the deleted module.

Temporary QA-only files were removed after the bounded QA attempt:

- `app/[locale]/visual-qa/skeleton/page.tsx`
- `scripts/skeleton-qa-cdp.mjs`

## Component API and Supported Skeleton Variants

- `Skeleton`: forwards a `div` ref and standard `HTMLAttributes`; supports `shape="rectangular" | "rounded" | "circular"`, `animation="shimmer" | "none"`, and `decorative`.
- `SkeletonText`: supports one to four lines and `sm` or `md` line height.
- `SkeletonAvatar`: supports `sm`, `md`, and `lg` circular sizes.
- `SkeletonButton`: uses the shared button-height token.
- `SkeletonCard`: supports one to four text lines plus optional avatar and button placeholders.

All variants accept `className` for layout-specific width and placement while retaining shared visual behavior.

## Loading-State Integration

- Auth loading renders a compact card and form-shaped panel inside the existing auth layout.
- Dashboard loading mirrors the live dashboard sequence: hero/profile, today, quick stats, progress/recent content, quick actions, and final action.
- Workout library loading mirrors the live exercise-library sequence: heading, search control, two filter rows, and exercise cards.
- Loading roots use `aria-busy="true"`; placeholder sections remain decorative.

## Design-Token Usage

Skeleton colors resolve through `--bg-elevated`, `--bg-surface`, `--divider`, and `--bg-overlay`. Dimensions resolve through existing spacing, input-height, button-height, and card-radius tokens. Shimmer duration resolves through the existing maximum-duration token. Tailwind mappings expose these values without hard-coded Skeleton colors or timing in component markup.

## Accessibility and Reduced-Motion Behavior

Skeletons are decorative by default and emit `aria-hidden="true"`, preventing placeholder geometry from entering the accessibility tree. Consumers can opt out through `decorative={false}` and provide their own ARIA attributes. `animation="none"` disables shimmer explicitly. The shimmer pseudo-element uses `motion-reduce:after:hidden`, so `prefers-reduced-motion: reduce` removes the animated highlight while preserving the static placeholder.

## Visual QA Results

The development server was started normally on `127.0.0.1:3114`. Next.js 15.5.19 reported ready in 2.9 seconds, but a request to `/en/login` returned zero bytes and timed out after 20 seconds immediately after middleware compilation. Direct diagnostics confirmed the configured Supabase hostname resolves, while its Auth endpoint cannot be reached over TCP port 443 from this execution environment (`curl` status `000`, connection failure after 0.026 seconds). Because `middleware.ts` awaits `supabase.auth.getUser()` for every localized page request, no route can return HTML here.

The server and its three QA-spawned Node processes were stopped after this single bounded attempt. No temporary QA route or script remains. No screenshot or diagnostics artifact was produced, so `docs/reports/assets/2026-08-10-skeleton/` was not created.

Static inspection confirms that the loading screens follow the corresponding production view structure and use responsive widths, page padding, `min-w-0`, grids, and clipped filter rows. This static review does not substitute for the incomplete browser checks for measured dimensions, horizontal overflow, rendered appearance, or computed reduced-motion styles.

## Validation Results

- Next route type generation: PASS (`next typegen`). This refreshed stale generated metadata after removal of the QA route.
- TypeScript: PASS (`npm run type-check -- --incremental false`).
- Targeted ESLint: PASS for the shared Skeleton component, all three loading files, and `tailwind.config.ts` using the repository's legacy ESLint configuration with cache disabled.
- Git whitespace validation: PASS (`git diff --check`); Git emitted existing LF-to-CRLF working-copy warnings only.
- Deleted-component reference search: PASS; no remaining import of `components/dashboard/ui/skeleton-card.tsx`.
- Zod: not applicable; no input boundary, form mutation, or Server Action was added or changed.
- Development server startup: PASS; Next.js reached ready state in 2.9 seconds.
- Localized route reachability: BLOCKED; middleware waits on the unreachable configured Supabase Auth endpoint.
- Visual browser QA: BLOCKED before rendering; overflow, responsive layout, computed dimensions, visual alignment, and computed reduced-motion behavior could not be measured.

## Known Unrelated Lint Debt

`npm run lint` cannot complete in this environment because deprecated `next lint` receives `EPERM` while opening `.next/cache/eslint/.cache_o3z4ib`. A cache-disabled full-source ESLint run bypassed that environment issue and reported only existing unrelated debt in `scripts/seed-exercises.ts:72`:

- Warning: `updated` is assigned a value but never used (`@typescript-eslint/no-unused-vars`).
- Error: `updated` is never reassigned and should be `const` (`prefer-const`).

That unrelated file was not modified. The untracked `.claude/settings.local.json` was also left untouched. `.gitignore` has no remaining task change.

## Architecture Changes

None. The work adds a shared presentation primitive and route-level loading files within existing boundaries.

## Remaining TODOs

- Complete the 390px browser pass in an environment that can reach the configured Supabase project, then retain evidence only after confirming no horizontal overflow, token-resolved dimensions, visual alignment, and reduced-motion behavior.

## Final Production-Readiness Verdict

The implementation remains internally consistent and passes scoped TypeScript, ESLint, reference, and diff validation. Production readiness is not granted because the required rendered 390px and reduced-motion checks are blocked by unavailable Supabase Auth connectivity in the current execution environment.
