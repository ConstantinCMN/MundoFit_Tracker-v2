# Sprint 3 Report — Profile Module

**Date:** 2026-06-11
**Status:** Complete
**Previous Sprint:** Sprint 2 — Authentication & Onboarding
**Next Sprint:** Sprint 4 — Weight Tracking

---

## Objective

Build the complete Profile page: display a live summary of the user's fitness metrics (TDEE, BMI, weight, goal, activity) and allow inline editing of all onboarding fields, with save back to Supabase.

---

## Deliverables

### 1. Fitness Calculation Utilities

`lib/utils/fitness.ts` — pure math functions used both by the Profile summary and future Dashboard/Calories sprints:

| Function | Formula |
|---|---|
| `calculateBMR(weight, height, age, gender)` | Mifflin-St Jeor equation |
| `calculateTDEE(weight, height, age, gender, activityLevel)` | BMR × activity multiplier |
| `calculateBMI(weight, height)` | weight / height² |
| `getBMICategory(bmi)` | underweight / normal / overweight / obese |

### 2. Profile Validation Schema

`lib/validations/profile.ts` — `profileEditSchema` (Zod) covering all 8 editable fields:
`first_name`, `gender`, `age`, `height_cm`, `weight_kg`, `activity_level`, `goal`, `preferred_workout_style`.

### 3. Server Actions (updated `lib/actions/profile.ts`)

| Action | Description |
|---|---|
| `completeOnboardingAction(data, locale)` | Unchanged from Sprint 2 |
| `getProfileAction()` | Return type fixed to `ActionResult<Profile>` |
| `updateProfileAction(data: ProfileEditData)` | **New** — patches 8 profile fields, returns updated `Profile` row |

### 4. Profile Client Component (`components/profile/profile-client.tsx`)

Single `'use client'` component that owns all interactivity:

**Avatar + Name header**
- Circular avatar with user's initial letter in neon green
- Name updates live as the user edits `first_name`

**5 live Summary Cards**
- **TDEE** (full-width, neon accent) — recalculates on every form change
- **Current Weight** | **BMI** — 2-column, BMI shows category label below value
- **Goal** | **Activity Level** — 2-column, labels from enum → translation map

**Inline Edit Form** (always active, no toggle)
- `Section: Date personale` — floating-label `first_name` Input
- `Section: Date fizice` — gender toggle buttons (2-col), then age/height/weight in 3-col `NumericField` row
- `Section: Preferințe` — three `ChipSelector` rows for activity level, goal, workout style
- `Section: Cont` — Sign Out button (danger variant)

**Floating Save Bar**
- Slides up from bottom (above the bottom nav) with `AnimatePresence`
- Visible when `isDirty || showSuccess`
- Shows loading spinner while saving
- After successful save: shows a green "Saved!" confirmation for 2.5 s, then slides away
- Error message appears above the button on failure

**Dirty detection**: `JSON.stringify(form) !== JSON.stringify(profileToForm(savedProfile))`

**After save**: `savedProfile` is updated from the server response, resetting the baseline without a full page reload.

### 5. Profile Server Page (`app/[locale]/(app)/profile/page.tsx`)

Server component:
1. Gets the authenticated user via `createClient().auth.getUser()`
2. Fetches the full profile row
3. Redirects to `/login` if unauthenticated, to `/onboarding` if profile is missing
4. Renders `<ProfileClient profile={...} />`

### 6. Translation Updates (all 3 locales)

New keys added to the `profile` namespace:

| Key group | Keys |
|---|---|
| `profile.summary.*` | `currentWeight`, `bmi`, `bmiNormal/Underweight/Overweight/Obese`, `tdee`, `goal`, `activity`, `notSet` |
| `profile.gender.*` | `male`, `female` |
| `profile.activityLevel.*` | 5 options (compact labels for chips) |
| `profile.goal.*` | 5 options |
| `profile.workoutStyle.*` | 5 options |
| `profile.units.years` | Localized age unit (ani / yrs / años) |
| `profile.saveChanges` | Save button label |
| `profile.saved` | Post-save confirmation label |
| `profile.fields.workoutStyle` | New field label added |

---

## Architecture Notes

- **Live metrics**: TDEE and BMI recalculate as the user changes weight/height/age/gender/activity — instant visual feedback without a round trip.
- **No page reload on save**: `updateProfileAction` returns the full updated `Profile` row; the client calls `setSavedProfile(result.data)` to reset the dirty baseline.
- **Form state as strings**: Numeric fields are kept as strings (`age: string`) during editing to allow free typing; parsed to numbers only on blur (clamp) and on save.
- **Fitness utils are reusable**: `lib/utils/fitness.ts` exports pure functions with no framework dependencies — ready to be imported by the Dashboard and Calories modules.

---

## TypeScript Notes

Pre-existing TypeScript errors in `lib/actions/auth.ts`, `lib/supabase/server.ts`, and `middleware.ts` remain. These are caused by `@supabase/ssr` type inference quirks and **will not affect runtime behaviour**. They existed before Sprint 3 and are unrelated to the Profile module.

---

## File Count

**8 files created or modified:**

- 1 new utility (`lib/utils/fitness.ts`)
- 1 new validation (`lib/validations/profile.ts`)
- 1 updated server action (`lib/actions/profile.ts`)
- 1 new client component (`components/profile/profile-client.tsx`)
- 1 updated page (`app/[locale]/(app)/profile/page.tsx`)
- 3 translation files updated (`messages/ro.json`, `en.json`, `es.json`)

---

## How to Test

```
1. Log in and complete onboarding
2. Tap Profile in bottom nav
3. Summary cards show live TDEE/BMI based on your onboarding data
4. Edit any field — summary cards update immediately
5. Save bar slides up at the bottom
6. Tap "Salvează modificările" — bar shows "Salvat!" then disappears
7. Reload page — changes persist from Supabase
```
