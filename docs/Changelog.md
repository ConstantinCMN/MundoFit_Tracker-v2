# MundoFit Tracker V2 — Changelog

> Generated from `git log`, git tags, and `docs/reports/`/`docs/releases/` file timestamps on 2026-07-04. This project versions by sprint (git tags `sprint-N`), not semver — entries are grouped the same way. Nothing below is invented; where a change has no report, only the commit message is listed.

---

## Unreleased — Working Tree (as of 2026-07-04)

The following is built but **not yet committed to git** (local `main` is 13 commits ahead of `origin/main`, plus this uncommitted/untracked working tree). Dates are the corresponding report's file timestamp, not a commit date.

### 2026-07-01 — Exercise Library: Chest & Back
- Structured, tri-lingual, muscle-grouped exercise seed data introduced (`data/exercises/`), replacing ad-hoc SQL seeds, with import/query/search helpers in `lib/exercises/` and a seed script (`scripts/seed-exercises.ts`).
- `chest` and `back` muscle groups fully authored and QA'd (`docs/reports/chest-library-qa.md`, `docs/reports/back-library-qa.md`, phases 1c/1d/1e/2a/2b/2c/2d).
- Remaining groups (legs, shoulders, arms, core, cardio) are stubbed — imports commented out in `data/exercises/index.ts`.

### 2026-06-30 — Session Engine Sprints W3B–W7, QA-01, Stabilization
- Set logging + validation (W3B), previous-performance intelligence (W3C), guided exercise navigation (W4), rest timer experience (W5), pause/finish flow (W6), workout summary screen (W7).
- `docs/qa/QA-01-Workout-Session-Audit.md` — full audit of the session engine; identified 4 blocking defects (cancel-workout blank screen, unwritten `total_volume_kg`, exposed exit paths via shared app shell, stale localStorage).
- Stabilization sprint (S1) and session-persistence fix (S2/H01) address audit findings; a standalone `(session)` route group was introduced to remove the app shell during an active workout.
- Progress bar WebKit visibility fix (root-cause + visual pass) — later also landed as commit `4aff675` on 2026-06-30.
- `docs/design/MundoFit_V3_Design_System.md` v1.0 published — the current, official design system, superseding `docs/UI_UX.md`.
- `docs/reports/2026-06-30-exercise-library-architecture.md` — architecture for the new exercise data layer.

### 2026-06-29 — Dashboard v2, Session Engine Sprints W1–W2
- Dashboard rebuilt into discrete sections (sprints 1, 2A, 2B, 3): Hero, Today, QuickStats, Progress, RecentWorkout, QuickActions, backed by shared `components/dashboard/ui/` primitives. Daily-targets card removed per a follow-up report.
- Compact empty-state cards pass across dashboard sections.
- Session Engine scaffolding (W1) and session creation (W2) — the start of the guided workout session feature.
- Workout History polish patch, plus an investigation report into workout history data issues.

### Untracked schema & modules (no dedicated report date found)
- Workout Program / Schedule module: `workout_schedules` + `workout_schedule_days` tables (`supabase/migrations/20240105000000_add_workout_schedules.sql`), `lib/actions/schedules.ts`, `lib/workouts/schedule-utils.ts`, `components/workouts/program-client.tsx`, wired into the Dashboard's Today section.
- `position` column added to `session_sets` (`supabase/migrations/20240106000000_add_position_to_session_sets.sql`).
- Exercise library schema extended (`supabase/migrations/20240107000000_extend_exercise_library.sql`).

---

## Committed History

### 2026-06-30
- `fix(session)`: moved the progress bar outside the `backdrop-filter` header to fix WebKit/iOS Safari invisibility.

### Sprint 12 — 2026-06-17 (tag `sprint-12`)
- Body Measurements: CRUD, trend charts, imperial unit support.

### 2026-06-21 — Workout Generator & Split System (post-Sprint 12, untagged)
- SplitBadge component added and wired into My Workouts and History.
- `split_type` persisted on generated workouts.
- Body Hub promoted to the primary workout entry point; My Workouts page trimmed.
- Migrations renamed to timestamp format; Supabase CLI temp dir ignored.
- Exercise library expanded with advanced coverage (pre-dates the `data/exercises/` restructure above).
- Goal and experience-level system added to the workout generator.
- Workout type selector and split muscle presets added.

### Sprint 11 — 2026-06-17 (tag `sprint-11.0`, `origin/main` HEAD)
- Body Hub: body-first navigation architecture.
- Body Hub multi-select (tap to select/deselect muscles, Generate Workout CTA).
- Body Hub educational muscle labels (anatomical names on selection).
- Body Map premium visual redesign (size parity + enhanced depth).

### Sprint 10 — 2026-06-15 to 2026-06-17 (tags `sprint-10.0`, `sprint-10.1`)
- GIN-indexed overlaps query + Fisher-Yates shuffle in the workout generator.
- Rest Timer + step-by-step workout execution.

### Sprint 9 — 2026-06-15 (tags `sprint-9`, `sprint-9.1`, `sprint-9.2`, `sprint-9.3`)
- Standalone anatomy muscle map with shared workout selection context.
- Workout deletion system.
- Delete action on Dashboard Recent Sessions cards.
- Unified workout session deletion across dashboard and workouts.

### Sprint 8 — 2026-06-15 (tag `sprint-8`)
- Fix: favicon locale guard (`RangeError` on `favicon.ico` under a locale segment) + BottomNav `prefetch={false}` fix for a blank-page webpack error.

### Sprint 7 — 2026-06-12 (tags `sprint-7`, `sprint-7-final`)
- Exercise Library + Workout Generator + History.
- Anatomy rendering size/aspect-ratio fix.
- Wired all remaining dead interactions on `/workouts` (category cards, create, template cards).

### Sprint 6 — 2026-06-11 to 2026-06-12
- Human Body Muscle Map & Workout Generator.
- Geometric SVG body replaced with a realistic anatomical muscle map, then upgraded to HichamELBSI bezier SVG assets with a fetch-based `MuscleMap`.

### Sprint 5 — 2026-06-11
- Workouts Module foundation.
- "Remember Email" checkbox added to the login form.

### Sprint 4 — 2026-06-11
- Premium Dashboard redesign: glassmorphism, SVG weight chart, macro breakdown, daily targets. (Daily targets were later removed — see Unreleased, 2026-06-29.)

### Sprint 3 — 2026-06-11
- Auth, Onboarding, Profile persistence; Supabase fixes; Next.js runtime fixes and webpack recovery.

### Initial commit — 2026-06-11
- Project scaffold.

---

## Notes on this history

- Sprint numbering is not perfectly linear in git history — e.g. Sprint 9's sub-increments (9.1–9.3) and Sprint 10's (10.0–10.1) were tagged same-day/near-same-day follow-ups, and several 2026-06-17 and 2026-06-21 commits (Body Hub redesign, generator/split work) were never tagged with a sprint number at all.
- `origin/main` is currently pinned at the `sprint-11.0` commit — everything from Sprint 12 onward, plus the entire Unreleased section above, exists only in the local `main` branch / working tree as of 2026-07-04.
