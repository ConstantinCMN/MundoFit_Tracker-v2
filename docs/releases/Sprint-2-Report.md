# Sprint 2 Report — Authentication & Onboarding

**Date:** 2026-06-11
**Status:** Complete
**Previous Sprint:** Sprint 1 — Foundation Setup
**Next Sprint:** Sprint 3 — Profile Page

---

## Objective

Implement complete Supabase authentication (login, register, forgot password, sign-out) and a 9-step onboarding wizard that collects all user profile data. Profile becomes the application's source of truth.

---

## Deliverables

### 1. Database Migration

`supabase/migrations/001_initial_schema.sql` — Complete SQL for all 11 tables matching `docs/Database.md`, including:
- `profiles` table with full onboarding fields + new `preferred_workout_style` column
- RLS policies (owner-only) on every table
- Auto-update trigger (`updated_at`) on all mutable tables
- Profile auto-creation trigger on `auth.users` INSERT (reads `locale` from user metadata)

**To apply:** paste into Supabase SQL Editor → Run.

### 2. Type System Updates

| File | Change |
|---|---|
| `types/database.ts` | Added `PreferredWorkoutStyle` enum type; added `preferred_workout_style` field to `profiles` Row and Insert |
| `types/index.ts` | Re-exports `PreferredWorkoutStyle` |

### 3. Validation Schemas

| File | Schemas |
|---|---|
| `lib/validations/auth.ts` | `loginSchema`, `registerSchema` (with `confirmPassword` refinement), `forgotPasswordSchema` |
| `lib/validations/onboarding.ts` | `onboardingSchema` — all 9 fields with range constraints |

### 4. Server Actions

#### `lib/actions/auth.ts`

| Action | Description |
|---|---|
| `signInAction(email, password)` | Signs in, returns `{ onboardingCompleted }` for client-side redirect |
| `signUpAction(email, password, locale)` | Creates account, upserts profile with locale; returns `{ confirmEmail }` flag |
| `signOutAction()` | Signs out; client navigates to login |
| `resetPasswordAction(email, redirectTo)` | Sends password reset email via Supabase |

#### `lib/actions/profile.ts`

| Action | Description |
|---|---|
| `completeOnboardingAction(data, locale)` | Upserts all 9 onboarding fields + `onboarding_completed: true` |
| `getProfileAction()` | Returns full profile row for the authenticated user |

All actions return `ActionResult<T>` — client decides redirect, server never calls `redirect()`.

### 5. UI Components

#### `components/ui/button.tsx`
- Framer Motion `whileTap` spring
- Variants: `primary` (accent), `secondary`, `danger`, `ghost`
- Sizes: `sm`, `md`, `lg`
- `isLoading` prop with spinner

#### `components/ui/input.tsx`
- Floating label animation (CSS transitions)
- Password show/hide toggle (Eye icon)
- Focus ring with accent glow
- Error and hint text
- Works with React Hook Form `register()` (forwardRef)

### 6. Auth Components

#### `components/auth/login-form.tsx`
- React Hook Form + Zod (`loginSchema`)
- Email + Password inputs with floating labels
- Root error display with AnimatePresence
- Forgot password link, Register link
- On success: routes to `/dashboard` or `/onboarding` based on profile

#### `components/auth/register-form.tsx`
- Email + Password + Confirm Password
- Post-submit: redirects to `/onboarding` OR shows "check your email" card (if email confirmation enabled)

#### `components/auth/forgot-password-form.tsx`
- Email input + submit
- Two-state card: form → success (animated with AnimatePresence)

#### `components/auth/sign-out-button.tsx`
- Client component; calls `signOutAction()` then navigates to `/login`

### 7. Onboarding Wizard — `components/onboarding/onboarding-wizard.tsx`

9-step wizard with direction-aware slide transitions (Framer Motion `AnimatePresence`).

| Step | Field | UI |
|---|---|---|
| 1 | `first_name` | Text input with floating label |
| 2 | `gender` | Two selection cards (male / female) |
| 3 | `age` | Large number display with −/+ buttons |
| 4 | `height_cm` | Large number display with −/+ buttons |
| 5 | `weight_kg` | Large number display with −/+ buttons (0.5 step) |
| 6 | `activity_level` | 5 selection cards with icons and descriptions |
| 7 | `training_location` | 3 selection cards |
| 8 | `goal` | 5 selection cards with icons |
| 9 | `preferred_workout_style` | 5 selection cards with icons |

Features:
- Animated progress bar (width transitions via Framer Motion)
- Step counter `N / 9`
- Back button (fades out on step 1)
- Continue/Finish button disabled until step is valid
- Final step calls `completeOnboardingAction` → redirects to `/dashboard`
- Error display if submission fails

### 8. Pages Updated

| Page | Change |
|---|---|
| `app/[locale]/(auth)/login/page.tsx` | Replaced placeholder with `<LoginForm>` |
| `app/[locale]/(auth)/register/page.tsx` | Replaced placeholder with `<RegisterForm>` |
| `app/[locale]/(auth)/forgot-password/page.tsx` | **New page** — `<ForgotPasswordForm>` |
| `app/[locale]/(onboarding)/onboarding/page.tsx` | Replaced placeholder with `<OnboardingWizard>` |
| `app/[locale]/(app)/dashboard/page.tsx` | Added `<SignOutButton>` for testing |

### 9. Middleware Updated

`middleware.ts` now includes the onboarding guard:

```
Authenticated + protected app route → query profiles.onboarding_completed
  → false: redirect to /{locale}/onboarding
  → true:  proceed
```

Also added `/forgot-password` to `AUTH_PATHS` so authenticated users are redirected away.

### 10. i18n Updates

All three message files (`ro.json`, `en.json`, `es.json`) updated with two new onboarding sections:

- `onboarding.firstName` — question, hint, placeholder
- `onboarding.workoutStyle` — question, hint + all 5 options with descriptions

---

## Auth Flow Summary

```
Register (email + password)
  │
  ├─ Email confirmation ON → show "Check email" card
  └─ Email confirmation OFF
       │
       ↓ signUpAction → profile created (trigger) → upsert locale
       ↓
    /onboarding → 9 steps → completeOnboardingAction
       │                       (sets onboarding_completed: true)
       ↓
    /dashboard

Login (email + password)
  │
  ├─ onboarding_completed: false → /onboarding
  └─ onboarding_completed: true  → /dashboard
```

---

## Known Limitations / Sprint 3 TODO

1. **DB migration must be applied manually** — open Supabase SQL Editor, paste `001_initial_schema.sql`, run.
2. **Email confirmation** — for development, disable email confirmation in Supabase Auth settings (Authentication → Email → Confirm email = OFF) to skip the confirmation step.
3. **Middleware DB query** — one Supabase query per protected-route request to check `onboarding_completed`. A cookie-based cache can be added in Sprint 3.
4. **No profile avatar upload** — Sprint 3 (Profile page).
5. **No unit system toggle in onboarding** — height and weight are shown in metric (cm / kg). Unit system preference is set in Profile (Sprint 3).
6. **`reset-password` callback page not built** — Supabase sends the reset link to `/{locale}/reset-password` but that route doesn't exist yet. Add in Sprint 3.

---

## File Count

**22 files created or modified:**

- 1 SQL migration (`supabase/migrations/`)
- 2 type file updates (`types/`)
- 2 validation schemas (`lib/validations/`)
- 2 server actions (`lib/actions/`)
- 2 UI components (`components/ui/`)
- 4 auth components (`components/auth/`)
- 1 onboarding wizard (`components/onboarding/`)
- 5 page files (4 updated + 1 new)
- 1 middleware update
- 3 message file updates

---

## How to Run

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Apply database migration
#    Open Supabase → SQL Editor → paste 001_initial_schema.sql → Run

# 3. Fill in .env.local with your Supabase project values

# 4. Start dev server
npm run dev
# → http://localhost:3000
# → Redirects to /ro/login → Register → Onboarding → Dashboard
```
