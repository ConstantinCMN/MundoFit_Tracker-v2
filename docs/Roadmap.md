# MundoFit Tracker V2 — Roadmap

## Versioning Strategy

Each phase delivers a **vertically complete slice** — shippable, usable, and stable — before the next phase begins. No phase leaves partial features.

---

## Phase 0 — Foundation
**Goal:** Project scaffold is in place. The app runs, routes work, auth works, i18n works.

### Deliverables
- [ ] Initialize Next.js 14 project with TypeScript strict mode
- [ ] Configure Tailwind CSS with design system tokens (colors, spacing, fonts from UI-UX.md)
- [ ] Install and configure Framer Motion
- [ ] Set up Supabase project (local dev + cloud)
- [ ] Configure `@supabase/ssr` for Next.js App Router
- [ ] Configure `next-intl` with `ro`, `en`, `es` message files
- [ ] Implement locale detection middleware (Accept-Language → profiles.locale fallback)
- [ ] Implement auth middleware (redirect unauthenticated / incomplete-onboarding users)
- [ ] Deploy shell to Vercel with environment variables

### Exit Criteria
Visiting the app in a browser redirects to the correct locale login page. No broken routes or missing environment variables.

---

## Phase 1 — Auth & Onboarding
**Goal:** A new user can sign up, complete onboarding, and reach the dashboard.

### Deliverables
- [ ] Register page (first name, email, password)
- [ ] Login page
- [ ] Supabase Auth integration (signUp, signIn, signOut)
- [ ] Profile auto-creation trigger in Supabase
- [ ] Onboarding multi-step flow (7 steps: gender, age, height, weight, activity, location, goal)
- [ ] Onboarding progress bar + step animations
- [ ] Write completed onboarding data to `profiles` table
- [ ] `profiles.onboarding_completed` flag gates app access
- [ ] Password reset flow (email link)
- [ ] Auth error handling (wrong password, email taken, etc.)

### Exit Criteria
A brand new user can register, complete all 7 onboarding steps, and land on the dashboard with their profile data saved.

---

## Phase 2 — App Shell & Navigation
**Goal:** The app shell is complete. Bottom navigation, page transitions, and the header work across all routes.

### Deliverables
- [ ] App shell layout component (header + bottom nav + content area)
- [ ] Bottom navigation with 5 tabs (Dashboard, Weight, Workouts, Calories, Profile)
- [ ] Page transition animations (slide + fade via Framer Motion)
- [ ] Header component (back button, page title, right action slot)
- [ ] Design system component library (Button, Card, Input, Badge, Toast, BottomSheet, ProgressRing)
- [ ] Toast / snackbar system (success, error, undo)
- [ ] Confirmation bottom sheet component (reusable for all delete flows)
- [ ] Global undo-after-delete pattern implemented (optimistic delete + 5s undo window)

### Exit Criteria
Navigating between all 5 tabs feels smooth and native. The delete + undo flow works on a placeholder item.

---

## Phase 3 — Profile Module
**Goal:** Users can view and edit all their profile information and preferences.

### Deliverables
- [ ] Profile page with sections (avatar, physical stats, preferences, account)
- [ ] Edit physical stats (gender, age, height, weight, activity, location, goal)
- [ ] Locale switcher (ro / en / es) — updates `profiles.locale` and re-routes
- [ ] Unit system switcher (metric / imperial) — live conversion in all displays
- [ ] Avatar upload (Supabase Storage bucket `avatars`)
- [ ] Change password flow
- [ ] Sign out
- [ ] Delete account with confirmation (cascades all user data)

### Exit Criteria
A user can change every onboarding value, switch language (page re-renders in new language immediately), and switch between kg/cm and lb/ft.

---

## Phase 4 — Weight Tracking
**Goal:** Users can log, view, and manage their weight history.

### Deliverables
- [ ] Weight log list (sorted by date, most recent first)
- [ ] Add weight entry (bottom sheet: weight value, date/time, optional note)
- [ ] Edit weight entry
- [ ] Delete weight entry (with confirmation + undo)
- [ ] Weight trend chart (line + area, 7d / 30d / 90d / All time toggle)
- [ ] BMI calculator and display badge (derived from latest weight + profile height)
- [ ] Weight unit display respects `profiles.unit_system`

### Exit Criteria
A user can log multiple weigh-ins, see a chart of their progress, and delete entries with undo.

---

## Phase 5 — Measurements Module
**Goal:** Users can track body measurements over time.

### Deliverables
- [ ] Measurements log list (by date)
- [ ] Add measurement entry (all fields optional, log what you have)
- [ ] Edit measurement entry
- [ ] Delete with confirmation + undo
- [ ] Per-measurement mini chart (history view per body part)
- [ ] Overview screen with body silhouette + labeled measurement points
- [ ] Measurement unit display respects `profiles.unit_system` (cm / inches)

### Exit Criteria
A user can log a partial measurement (e.g., only waist and hips), view history charts per measurement, and delete entries with undo.

---

## Phase 6 — Progress Photos
**Goal:** Users can capture and browse progress photos over time.

### Deliverables
- [ ] Photo grid (2 columns, sorted by date)
- [ ] Add photo (camera capture or gallery pick → upload to Supabase Storage)
- [ ] Photo viewer (full-screen, swipe between photos)
- [ ] Photo metadata (angle tag, date, optional note)
- [ ] Edit photo metadata (note, angle)
- [ ] Delete photo (removes from Storage + database) with confirmation + undo
- [ ] Before/After compare mode (select two photos → split-screen view)

### Exit Criteria
A user can take/upload photos, browse them in a grid, and compare two photos side by side. Delete with undo works.

---

## Phase 7 — Goals Module
**Goal:** Users can set, track, and complete fitness goals.

### Deliverables
- [ ] Goals list (active goals with progress bars)
- [ ] Completed goals section (collapsed)
- [ ] Add goal (type, title, target value, target date)
- [ ] Edit goal
- [ ] Delete goal with confirmation + undo
- [ ] Mark goal as completed
- [ ] Goal detail screen with progress history chart
- [ ] Goals linked to weight/measurement data where applicable (automatic progress tracking)

### Exit Criteria
A user can create a weight-target goal, and when they log a new weight, the goal progress updates automatically.

---

## Phase 8 — Calories Calculator
**Goal:** Users can calculate their TDEE and set macro targets. Food diary logging is deferred to V2.1.

### Deliverables
- [ ] TDEE calculator (Mifflin-St Jeor formula, pulled from profile data)
- [ ] TDEE settings screen (manual override, macro split percentage configuration)
- [ ] Calories screen: TDEE value + macro targets display (P / C / F in grams)
- [ ] TDEE breakdown card (BMR + activity multiplier + goal adjustment)

### Exit Criteria
A user can view their TDEE calculated from their profile, adjust the macro split, and see their daily calorie and macro targets update in real time.

---

## Phase 9 — Exercise Library
**Goal:** The exercise database is seeded and searchable.

### Deliverables
- [ ] Database seeding script (200+ exercises, tri-lingual names, muscle groups, equipment)
- [ ] Exercise library list screen (search + filter by muscle, equipment, difficulty)
- [ ] Exercise detail bottom sheet (description, muscles worked, equipment needed)
- [ ] Mini body map on exercise detail (highlights worked muscles)
- [ ] Custom exercise creation (user-added exercises)
- [ ] Edit / delete custom exercises (with confirmation + undo)

### Exit Criteria
A user can search for "bench press", find it in all three languages, see which muscles it works, and add a custom exercise.

---

## Phase 10 — Interactive Body Map
**Goal:** The SVG body map is interactive and drives exercise filtering.

### Deliverables
- [ ] Male body map SVG (front + back views, all muscle groups as individual paths)
- [ ] Female body map SVG (front + back views, all muscle groups as individual paths)
- [ ] Auto-select correct SVG based on `profiles.gender`
- [ ] Front / Back view toggle with animation
- [ ] Clickable muscles — single and multi-select
- [ ] Selected muscles highlight in `--accent` color with glow animation
- [ ] Selected muscle chips row below map
- [ ] "Filter exercises" action connects body map selection to exercise library
- [ ] Body map reused in: workout generator, exercise detail (mini), measurements overview

### Exit Criteria
A user can tap chest + triceps on the body map, tap "Filter Exercises", and see only chest/tricep exercises.

---

## Phase 11 — Workouts Core
**Goal:** Users can create workout templates, start sessions, and log sets.

### Deliverables
- [ ] Workouts hub screen (body map + quick actions + templates + recommended)
- [ ] Create workout template (name, exercises, sets/reps/rest per exercise)
- [ ] Edit workout template
- [ ] Delete workout template with confirmation + undo
- [ ] Active workout session screen (exercise queue, set logger, rest timer)
- [ ] Rest timer (full-screen countdown with accent circle animation)
- [ ] End workout → session summary (total volume, duration, muscles worked)
- [ ] Session saved to `workout_sessions` + `session_sets`
- [ ] Workout history list
- [ ] Session detail screen

### Exit Criteria
A user can create a Push Day template, start a session, log sets with weights, use the rest timer, and see the completed session in history.

---

## Phase 12 — Workout Generator & Recommendations
**Goal:** The app can generate workouts based on user input and recommend workouts based on profile.

### Deliverables
- [ ] Workout generator flow (muscles → location → duration → difficulty → generated plan)
- [ ] Generated workout preview (swap exercises, regenerate)
- [ ] Save generated workout as template or start immediately
- [ ] Recommended workouts algorithm (based on goal, training location, recent muscle groups worked)
- [ ] Recommended workouts section on Workouts hub

### Exit Criteria
A user can go through the generator flow and receive a valid workout. A user with goal "build_muscle" and location "home" sees different recommendations than a "gym" user.

---

## Phase 13 — Dashboard Assembly
**Goal:** The dashboard aggregates data from all modules into a meaningful daily overview.

### Deliverables
- [ ] TDEE target card (daily calorie target + macro breakdown)
- [ ] Weight stat (latest entry + weekly trend)
- [ ] BMI badge
- [ ] Streak counter (consecutive days with any log entry)
- [ ] Active goal card with progress
- [ ] Last workout card
- [ ] Quick-log shortcut chips (weight, photo)
- [ ] Personalized greeting (first_name + time of day)
- [ ] Empty state for each card when no data yet

### Exit Criteria
After logging weight and completing a workout on the same day, all dashboard cards reflect real data.

---

## Phase 14 — Polish & QA
**Goal:** The full app is production-ready.

### Deliverables
- [ ] Comprehensive empty states for all screens
- [ ] Full loading skeleton states
- [ ] Error boundary components
- [ ] Offline / network error handling (graceful degradation)
- [ ] Reduced motion support (`useReducedMotion` in all animations)
- [ ] Full accessibility audit (touch targets, aria labels, focus management)
- [ ] i18n completeness audit (no missing keys in ro/en/es)
- [ ] Performance audit (Lighthouse mobile > 90)
- [ ] Cross-browser / cross-device testing (iOS Safari, Chrome Android, desktop Chrome/Firefox)
- [ ] Security review (RLS policies, input sanitisation, no sensitive data in client logs)

---

## Post-Launch Backlog (V2.1+)

These features are deliberately excluded from V2.0 to keep scope manageable:

| Feature | Rationale for deferral |
|---|---|
| Food diary / calorie logging | Requires `calorie_logs` table and food entry UI; `tdee_settings` covers calorie targets in V2.0 |
| Social / friends / sharing | Requires moderation layer |
| Apple Health / Google Fit sync | Requires native app or specific API access |
| Barcode food scanner | Third-party nutrition API integration |
| AI-generated workout coaching | LLM integration layer |
| Push notifications | Requires PWA service worker |
| PWA / installable app | Can be added post-launch |
| Coaching / trainer role | New user type and permissions model |
| Dark/light theme toggle | Dark only in V2.0 |

---

## Dependency Map

```
Phase 0 (Foundation)
  └── Phase 1 (Auth)
        └── Phase 2 (Shell)
              ├── Phase 3 (Profile)      ← unlocks unit system for all modules
              ├── Phase 4 (Weight)
              ├── Phase 5 (Measurements)
              ├── Phase 6 (Photos)
              ├── Phase 7 (Goals)        ← Phase 4 recommended first
              ├── Phase 8 (Calories)     ← Phase 3 recommended first (TDEE from profile)
              ├── Phase 9 (Exercise Library)
              │     └── Phase 10 (Body Map)
              │           └── Phase 11 (Workouts Core)
              │                 └── Phase 12 (Generator + Recommendations)
              └── Phase 13 (Dashboard)   ← requires all modules complete
                    └── Phase 14 (Polish)
```
