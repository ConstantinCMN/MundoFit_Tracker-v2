# MundoFit Official Input Component

## Summary

Implemented the official reusable MundoFit `Input` primitive and migrated the existing authentication forms to its production API. The component centralizes text-field visuals and behavior without changing business logic, routing, database access, or workout behavior.

The implementation supports three visual variants, validation and lifecycle states, optional icons and actions, localized password visibility controls, native accessibility relationships, mobile touch targets, and reduced motion. All component design values resolve through the MundoFit token system.

## Files Modified

| File | Change |
|---|---|
| `components/ui/input.tsx` | Rebuilt the shared Input API, variants, states, actions, accessibility, and token-only styling. |
| `app/globals.css` | Added semantic Input color, dimension, focus, spacing, and motion tokens. |
| `tailwind.config.ts` | Exposed Input tokens as Tailwind utilities without duplicating token values. |
| `components/auth/login-form.tsx` | Migrated validation props and added localized password visibility labels. |
| `components/auth/register-form.tsx` | Migrated validation/helper props and added localized password visibility labels. |
| `components/auth/forgot-password-form.tsx` | Migrated the validation-message prop. |
| `messages/en.json` | Added English Input action labels and the password helper translation. |
| `messages/ro.json` | Added Romanian Input action labels and the password helper translation. |
| `messages/es.json` | Added Spanish Input action labels and the password helper translation. |

### Files created

| File | Purpose |
|---|---|
| `docs/reports/2026-07-07-input-component.md` | Implementation and validation report. |
| `docs/reports/assets/2026-07-07-input/` | Before/after screenshots, interaction evidence, and machine-readable diagnostics. |

Temporary QA routes, fixtures, scripts, browser profiles, and the isolated QA application copy were removed after validation.

## Component API

```tsx
<Input
  label={t('email')}
  type="email"
  variant="default"
  helperText={t('emailHint')}
  errorMessage={errors.email?.message}
  leftIcon={<Mail />}
  required
/>
```

| Prop | Type | Purpose |
|---|---|---|
| `label` | `string` | Required native label content. |
| `variant` | `'default' \| 'filled' \| 'outlined'` | Selects the approved surface treatment. |
| `helperText` | `string` | Adds supporting text and `aria-describedby`. |
| `errorMessage` | `string` | Applies the error state, `aria-invalid`, description, and alert semantics. |
| `successMessage` | `string` | Applies the success state and status semantics. |
| `leftIcon`, `rightIcon` | `ReactNode` | Adds decorative leading or trailing icons. |
| `passwordVisibilityLabels` | `{ show: string; hide: string }` | Enables the keyboard-accessible password toggle with localized names. |
| `onClear`, `clearLabel` | callback and `string` | Enables an optional localized clear action for controlled inputs. |
| `isLoading`, `loadingLabel` | `boolean` and `string` | Locks editing without removing the value from form submission and exposes busy/status semantics. |
| `containerClassName` | `string` | Allows layout composition on the outer field wrapper. |
| Native input props | `InputHTMLAttributes<HTMLInputElement>` | Preserves autocomplete, input mode, required, disabled, read-only, and form-library integration. |

## Variants

| Variant | Surface |
|---|---|
| `default` | Existing elevated MundoFit input surface and standard border. |
| `filled` | Stronger filled surface with a transparent resting border. |
| `outlined` | Transparent surface with the standard control border. |

## States

| State | Behavior |
|---|---|
| Default / hover | Tokenized border and surface treatments preserve the existing visual identity. |
| Focus / focus-visible | Accent border plus tokenized focus ring; keyboard focus is visibly distinguishable. |
| Disabled | Native disabled semantics, blocked interaction, and disabled opacity token. |
| Error | Danger border/label/message, `aria-invalid="true"`, and announced alert. |
| Success | Success border/label/message and announced status. |
| Read-only | Value remains selectable and submitted while editing is blocked. |
| Loading | Input remains part of form data, becomes read-only, exposes `aria-busy`, and displays a spinner. |

## Accessibility

- Every field uses a native `<label>` associated with a stable input ID.
- Helper, error, and success text is connected through `aria-describedby`.
- Error fields expose `aria-invalid`; error and success messages use alert/status semantics.
- Password and clear controls are native keyboard-accessible buttons with localized accessible names.
- The input is 56 px high. Trailing action targets are 48 px wide and 56 px high.
- Keyboard focus-visible testing confirmed the accent border and 3 px focus shadow.
- Reduced-motion emulation confirmed `transition-property: none`.
- Required fields retain the native `required` attribute and add a visual indicator hidden from assistive technology.

## Migration Summary

The Login, Register, and Forgot Password forms now use `errorMessage`, `helperText`, and localized password visibility labels. Existing Onboarding and Profile name fields already consumed the shared primitive and inherit the official implementation without business-logic changes.

Specialized raw inputs were intentionally not migrated:

- onboarding's large numeric stepper input;
- profile unit-aware numeric controls;
- inline measurement cells and the native date field;
- the compact Exercise Library search control.

Those controls have distinct layout or interaction contracts. Replacing them in this task would introduce behavioral or visual risk.

## Visual QA

QA ran against a fresh isolated Next.js/Tailwind server at an exact 390 px emulated mobile viewport. The temporary state gallery exercised all variants, messages, icons, password visibility, clear, loading, disabled, read-only, focus-visible, and reduced-motion behavior.

An initial QA pass exposed that a generic `xl` spacing utility activated unrelated auth Card padding. It was replaced with Input-specific spacing tokens, and all screenshots and diagnostics were recaptured after the fix.

| Screen / evidence | Before | After |
|---|---|---|
| Login | [login-before.png](assets/2026-07-07-input/login-before.png) | [login-after.png](assets/2026-07-07-input/login-after.png) |
| Register | [register-before.png](assets/2026-07-07-input/register-before.png) | [register-after.png](assets/2026-07-07-input/register-after.png) |
| Forgot Password | [forgot-password-before.png](assets/2026-07-07-input/forgot-password-before.png) | [forgot-password-after.png](assets/2026-07-07-input/forgot-password-after.png) |
| Full state gallery | — | [input-gallery-after.png](assets/2026-07-07-input/input-gallery-after.png) |
| Password visible, cleared value, keyboard focus | — | [input-gallery-interactions.png](assets/2026-07-07-input/input-gallery-interactions.png) |

[diagnostics.json](assets/2026-07-07-input/diagnostics.json) records viewport dimensions, element bounds, overflow, label associations, validation relationships, touch targets, interaction results, focus styling, and reduced-motion results.

Final results:

- no horizontal overflow on Login, Register, Forgot Password, or the state gallery;
- no layout, alignment, typography, color, or spacing regression remained after the token correction;
- all inspected inputs measured 56 px high;
- password toggle changed the native input type from `password` to `text` and exposed `aria-pressed="true"`;
- clear action produced an empty controlled value;
- helper, error, success, loading, disabled, and read-only states rendered correctly;
- keyboard focus and reduced-motion behavior passed.

## Validation

| Command | Result |
|---|---|
| `npm run lint` | PASS — no ESLint warnings or errors. The existing Next.js `next lint` deprecation notice remains. |
| `npx tsc --noEmit` | PASS — no TypeScript errors. |
| `git diff --check` | PASS — no whitespace errors. Git emitted only existing line-ending conversion notices. |

## Next Recommended Task

Implement the official MundoFit Select component using the same token, accessibility, mobile, visual-QA, and focused-migration standards.
