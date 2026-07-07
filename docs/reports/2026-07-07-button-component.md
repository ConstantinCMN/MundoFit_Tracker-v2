# MundoFit Button Component

**Date:** 2026-07-07  
**Status:** Complete

## Summary

Implemented `components/ui/button.tsx` as the official reusable MundoFit Button. The component provides five token-backed variants, three touch-friendly sizes, icon slots, full-width layout, loading behavior, native button semantics, keyboard focus, disabled behavior, and reduced-motion support.

The implementation removes Button-local hardcoded colors, spacing, radius, shadows, and transitions. It also removes the Button's Framer Motion dependency in favor of token-backed CSS state transitions, reducing client-side overhead without changing application business behavior.

## Files Modified

| File | Change |
|---|---|
| `app/globals.css` | Added semantic Button tokens for colors, dimensions, focus, pressed state, and spinner timing. |
| `tailwind.config.ts` | Exposed Button tokens as semantic Tailwind utilities. |
| `components/ui/button.tsx` | Rebuilt the official Button API and implementation. |
| `components/auth/login-form.tsx` | Replaced layout-only `w-full` styling with `fullWidth`. |
| `components/auth/register-form.tsx` | Replaced layout-only `w-full` styling with `fullWidth`. |
| `components/auth/forgot-password-form.tsx` | Replaced layout-only `w-full` styling with `fullWidth`. |
| `components/onboarding/onboarding-wizard.tsx` | Replaced layout-only `w-full` styling with `fullWidth`. |
| `components/profile/profile-client.tsx` | Adopted `fullWidth` and the `leftIcon` slot for existing shared Button usage. |
| `docs/reports/2026-07-07-button-component.md` | Added this implementation report and component contract. |

No database, route, business logic, workout logic, or product flow was modified.

## Component API

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Selects the approved visual and semantic treatment. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Selects the approved height, padding, gap, text, and icon sizing. |
| `isLoading` | `boolean` | `false` | Shows the spinner, preserves content width, prevents duplicate activation, and sets `aria-busy`. |
| `loadingLabel` | `string` | — | Optionally changes the accessible name while loading. |
| `leftIcon` | `ReactNode` | — | Renders a decorative leading icon using the selected size token. |
| `rightIcon` | `ReactNode` | — | Renders a decorative trailing icon using the selected size token. |
| `fullWidth` | `boolean` | `false` | Expands the button to its container width. |
| `disabled` | `boolean` | `false` | Uses native disabled semantics and the approved disabled state. |
| `type` | Native button type | `'button'` | Prevents accidental form submission unless `type="submit"` is explicit. |
| `className` | `string` | — | Supports layout composition such as external margins; it is not permission to bypass design tokens. |
| Native button props | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Supports ARIA attributes, form attributes, event handlers, names, and values. |
| `ref` | `HTMLButtonElement` ref | — | Enables focus management and integrations through `forwardRef`. |

Example:

```tsx
<Button
  variant="primary"
  size="lg"
  leftIcon={<Dumbbell />}
  isLoading={isStarting}
  loadingLabel={t('startingWorkout')}
  fullWidth
  onClick={startWorkout}
>
  {t('startWorkout')}
</Button>
```

## Variants

| Variant | Contract |
|---|---|
| `primary` | Electric Lime filled action with high-emphasis typography and approved hover, active, focus, disabled, and loading states. |
| `secondary` | Transparent dark-surface action with the approved neutral border and text treatment. |
| `outline` | Accent-outline action for high-visibility secondary CTAs. |
| `ghost` | Low-chrome action that gains surface and text emphasis on interaction. |
| `danger` | Destructive action using semantic danger foreground, translucent surface, and border tokens. |

Every variant defines default, hover, active, focus-visible, disabled, and loading behavior. Variant styles contain no raw visual values.

## Sizes

| Size | Height | Intended use |
|---|---:|---|
| `sm` | 44 px | Compact actions while retaining the minimum mobile touch target. |
| `md` | 48 px | Standard forms, toolbars, and general actions. |
| `lg` | 52 px | Primary mobile CTAs and full-width actions. |

Padding, content gap, icon dimensions, typography, and radius are resolved through Design Tokens for every size.

## Accessibility

- Uses a native `<button>` and preserves all native keyboard and form behavior.
- Defaults to `type="button"` to prevent accidental form submission.
- Uses `:focus-visible` with token-backed ring color, width, offset, and offset color.
- Enforces a minimum 44 px touch target for every size.
- Uses native `disabled` semantics and prevents activation while loading.
- Sets `aria-busy="true"` during loading.
- Supports a localized `loadingLabel` for an explicit loading-state accessible name.
- Keeps original content in the accessibility tree while visually hiding it during loading, preserving the accessible name when no loading label is supplied.
- Marks decorative icon slots and the loading spinner as hidden from assistive technology.
- Preserves button width during loading to prevent layout shift.
- Disables transform transitions for users who prefer reduced motion.

## Migration Summary

All existing consumers of the shared Button automatically use the new official implementation. Existing Authentication, Onboarding, Profile save, Profile sign-out, and standalone sign-out actions retain their event handlers, submit types, disabled conditions, and loading conditions.

Layout-only `w-full` overrides were migrated to `fullWidth`. The Profile sign-out icon was migrated to `leftIcon`.

No specialized native controls were migrated. Header icon controls, password visibility, checkbox-like controls, segmented controls, cards acting as buttons, workout set controls, and workout-session actions require separate component-specific visual and behavioral QA before conversion.

## Visual QA

The application was run locally and inspected at a 390 × 844 mobile viewport after entrance animations completed. Public routes were captured directly. The protected Onboarding and Profile components were rendered through a temporary local fixture route to avoid creating accounts or mutating Supabase; the route and fixture were removed after capture.

| Surface | Evidence | Result |
|---|---|---|
| Login | [login-after.png](assets/2026-07-07-button/login-after.png) | PASS — primary CTA aligned, 52 px high, no overflow |
| Registration | [register-after.png](assets/2026-07-07-button/register-after.png) | PASS — primary CTA aligned, no card or form regression |
| Password reset | [forgot-password-after.png](assets/2026-07-07-button/forgot-password-after.png) | PASS — primary CTA aligned, no spacing regression |
| Onboarding | [onboarding-after.png](assets/2026-07-07-button/onboarding-after.png) | PASS — disabled CTA remains fixed, readable, and within viewport |
| Profile sign-out | [profile-bottom-after.png](assets/2026-07-07-button/profile-bottom-after.png) | PASS — danger button and leading icon align correctly |
| Profile save state | [profile-save-after.png](assets/2026-07-07-button/profile-save-after.png) | PASS — fixed primary CTA does not overlap navigation or overflow |
| Variants and states | [button-gallery-after.png](assets/2026-07-07-button/button-gallery-after.png) | PASS — all variants, sizes, disabled, loading, icons, and keyboard focus inspected |
| Computed diagnostics | [diagnostics.json](assets/2026-07-07-button/diagnostics.json) | PASS — geometry, computed colors/type, overflow, focus, disabled, and ARIA state evidence |

### QA findings

- No horizontal document, body, or Button overflow was detected on any inspected surface.
- Primary CTAs resolve to Electric Lime `rgb(170, 255, 0)` with base-dark foreground `rgb(10, 10, 10)`.
- Heights resolve to 44 px (`sm`), 48 px (`md`), and 52 px (`lg`); radius resolves to 16 px.
- Primary/danger typography resolves to 15 px and weight 900 on affected screens.
- Loading preserves the 52 px Button geometry and exposes `aria-busy="true"`.
- Keyboard Tab navigation activates `:focus-visible`; computed focus styling includes both the dark offset and Electric Lime ring.
- No broken alignment, unintended wrapping, clipped content, spacing regression, typography regression, or color regression was found in the final captures.
- The bottom-left `N` visible in development screenshots is the Next.js development indicator, not application UI.

The visual QA request was received after implementation, so true pre-change screenshots were not available. Final captures were compared with the approved MundoFit design specification, existing surrounding layouts, and exact computed-style diagnostics.

### Regression fixed during QA

The first keyboard test found that `tailwind-merge` removed the custom ring-width class because it treated the ring width and color utility names as conflicting. The Button now consumes a single composed `--button-focus-shadow` token. A repeat keyboard test confirmed `:focus-visible` and a visible Electric Lime focus treatment.

## Validation

| Check | Command | Result |
|---|---|---|
| Tailwind generation | Token utility compilation and selector verification | PASS |
| Button literal audit | Search for prohibited visual literals in `components/ui/button.tsx` | PASS |
| Runtime visual QA | Stable Chromium screenshots and computed diagnostics at 390 × 844 | PASS |
| Keyboard focus QA | Tab navigation, `:focus-visible`, and computed focus shadow | PASS |
| ESLint | `npm run lint` (executed through `npm.cmd`) | PASS — no warnings or errors |
| TypeScript | `npx tsc --noEmit` (executed through `npx.cmd`) | PASS |
| Diff integrity | `git diff --check` | PASS |
| Scope review | Final task-file and working-tree review | PASS — no business logic, routing, database, or workout logic changed |

The project currently uses `next lint`, which emitted its existing Next.js 16 deprecation notice. This warning does not affect the passing lint result.

## Next Recommended Task

Create the official token-backed `IconButton` primitive for icon-only actions, including mandatory accessible labels and 44/48 px touch sizes. Then migrate the Header back action and Input password visibility control as the first bounded integrations with keyboard, focus, and mobile visual QA.
