# MundoFit Official Select Component

## Summary

Implemented the official reusable MundoFit `Select` primitive as a production-ready, mobile-first form control. It uses native select semantics and platform pickers while applying the approved MundoFit visual system, validation states, loading/read-only behavior, and accessibility relationships.

No business logic, routing, database behavior, or workout logic changed. The repository contained no native `<select>` fields, so no production screen was migrated by force.

> [!IMPORTANT]
> **Status: Production-ready.** The component API, visual QA, interaction diagnostics, lint, TypeScript, and whitespace validation all pass.

## Files Modified

| File | Change |
|---|---|
| `app/globals.css` | Added semantic Select tokens that reuse the official Input form-control contract. |
| `tailwind.config.ts` | Exposed Select color, dimension, focus, spacing, motion, and animation tokens. |

## Files Created

| File | Purpose |
|---|---|
| `components/ui/select.tsx` | Official Select primitive. |
| `docs/reports/2026-07-07-select-component.md` | Implementation, QA, and validation report. |
| `docs/reports/assets/2026-07-07-select/` | Before/after screenshots and machine-readable diagnostics. |

Temporary QA routes, fixtures, scripts, browser profiles, server copies, generated type entries, and filesystem links were removed after validation.

## Component API

```tsx
<Select
  label={t('trainingLocation')}
  value={trainingLocation}
  onChange={(event) => setTrainingLocation(event.target.value)}
  errorMessage={errors.trainingLocation?.message}
  required
>
  <option value="gym">{t('locations.gym')}</option>
  <option value="home">{t('locations.home')}</option>
</Select>
```

| Prop | Type | Purpose |
|---|---|---|
| `label` | `string` | Required native label content. |
| `variant` | `'default' \| 'filled' \| 'outlined'` | Selects the approved surface treatment. |
| `placeholder` | `string` | Adds a disabled empty option for translated placeholder text. |
| `helperText` | `string` | Adds supporting text and `aria-describedby`. |
| `errorMessage` | `string` | Applies the error state, `aria-invalid`, description, and alert semantics. |
| `successMessage` | `string` | Applies the success state and status semantics. |
| `leftIcon` | `ReactNode` | Adds a decorative leading icon. |
| `readOnly` | `boolean` | Prevents pointer and keyboard selection changes while retaining focus and form submission. |
| `isLoading`, `loadingLabel` | `boolean` and `string` | Locks selection, retains form data, exposes busy/status semantics, and displays a spinner. |
| `containerClassName` | `string` | Supports layout composition on the field wrapper. |
| Native select props | `SelectHTMLAttributes<HTMLSelectElement>` | Preserves name, value/defaultValue, required, disabled, autocomplete, form, and event integration. |

The primitive intentionally supports single selection only. Native `multiple` and `size` are excluded because they have different layout, semantics, and mobile interaction requirements.

## Variants

| Variant | Surface |
|---|---|
| `default` | Existing elevated form-control surface and standard border. |
| `filled` | Stronger filled surface with a transparent resting border. |
| `outlined` | Transparent surface with the standard control border. |

## States

| State | Behavior |
|---|---|
| Default / hover | Tokenized surface and border treatment with native option selection. |
| Focus / focus-visible | Accent border and 3 px tokenized focus shadow. |
| Disabled | Native disabled semantics and disabled opacity. |
| Error | Danger border/label/message, `aria-invalid="true"`, and alert semantics. |
| Success | Success border/label/message and status semantics. |
| Read-only | `aria-readonly`, blocked keyboard/pointer changes, retained focus, and retained form value. |
| Loading | `aria-busy`, read-only selection, retained form value, localized status label, and spinner. |

## Accessibility

- Uses the native `<select>` element, preserving browser and assistive-technology keyboard navigation.
- Associates every field with a native `<label>` and stable ID.
- Connects helper, error, and success text through `aria-describedby`.
- Exposes error state through `aria-invalid` and announced alert semantics.
- Exposes loading through `aria-busy` and an optional localized status label.
- Implements read-only behavior without disabling or removing the value from submitted form data.
- Blocks read-only/loading changes from keyboard, mouse, pointer, touch-generated click, and change events.
- Uses a 56 px control target on mobile.
- Preserves a visible keyboard focus ring.
- Removes transitions under `prefers-reduced-motion: reduce`.
- Uses a decorative custom chevron while retaining the native platform picker.

## Internationalization

The primitive contains no hardcoded user-facing copy. Labels, placeholders, helper text, messages, loading announcements, and native option content are supplied by the consuming feature through `next-intl`.

Temporary QA content verified:

- English labels and options;
- Romanian labels and diacritics;
- Spanish labels and longer option content without overflow.

No persistent translation keys were added because no production Select field was migrated in this task.

## Migration Summary

Repository inspection found no native `<select>` elements or existing shared Select primitive.

The current selection interfaces were not compatible migration candidates:

- onboarding selection cards;
- profile chip selectors;
- workout muscle maps and split selectors;
- measurement chart tabs;
- exercise cards and filters.

Those controls have distinct multi-select, card, tab, or spatial interaction contracts. Replacing them would change UX or business behavior, so migration count is **zero**.

## Visual QA

Visual QA ran against a fresh isolated Next.js/Tailwind server with exact Chrome mobile emulation at 390 px width. The temporary routes and isolated server copy were deleted afterward.

Because the application had no pre-existing Select field, the before image documents the browser-native baseline rather than an application screen.

| Evidence | File |
|---|---|
| Browser-native baseline before the official primitive | [select-baseline-before.png](assets/2026-07-07-select/select-baseline-before.png) |
| Official variants, states, icon, loading, and RO/EN/ES content | [select-gallery-after.png](assets/2026-07-07-select/select-gallery-after.png) |
| Layout, semantics, interactions, form data, focus, and reduced motion | [diagnostics.json](assets/2026-07-07-select/diagnostics.json) |

Diagnostics confirmed:

- exact 390 px viewport with no horizontal overflow;
- every official Select measured 56 px high;
- every Select had exactly one associated label;
- error and success/loading announcements were present;
- `ArrowDown` changed a normal value from `gym` to `home`;
- the same key did not change read-only (`trx`) or loading (`mobility`) values;
- read-only and loading values remained present in `FormData`;
- keyboard focus matched `:focus-visible` and rendered the accent border/focus shadow;
- reduced-motion emulation produced `transition-property: none`;
- Romanian and Spanish long content remained aligned and within the viewport.

No layout, spacing, typography, alignment, color, overflow, focus, state, or accessibility regression was found.

## Validation

| Command | Result |
|---|---|
| `npm run lint` | PASS — no ESLint warnings or errors. The existing Next.js `next lint` deprecation notice remains. |
| `npx tsc --noEmit` | PASS — no TypeScript errors. |
| `git diff --check` | PASS — no whitespace errors. Git emitted only existing line-ending conversion notices. |

## Architecture and Business Logic

- No architecture changes.
- No new dependencies or UI libraries.
- No business logic changes.
- No routing, database, validation schema, or workout changes.

## Next Recommended Task

Implement the official MundoFit Checkbox and Radio primitives, then migrate only native boolean/single-choice fields whose interaction contract matches those controls.
