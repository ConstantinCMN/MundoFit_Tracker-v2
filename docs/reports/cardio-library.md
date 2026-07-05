# Exercise Library — Cardio (Complete)

**Date:** 2026-07-05 10:06
**Task:** Build out the complete cardio exercise library, covering walking, running, sprinting, cycling, indoor cycling, rowing, elliptical, stair climber, jump rope, swimming, ski erg, assault bike, battle ropes, burpees, mountain climbers (cardio variation), HIIT, and LISS — using only real-world, commonly used exercises with no invented variations.

---

## Summary

Created `data/exercises/cardio.ts` with 20 production-ready cardio exercises, matching every named modality from the brief. This activates the `cardio` module — the last remaining stub in `data/exercises/index.ts` — completing the entire exercise library across all nine muscle-group/category files. No existing exercise entries in any other file were modified.

## Exercises Added (20)

| # | Slug | Equipment | Modality Covered |
|---|------|-----------|--------------------|
| 1 | `walking` | bodyweight | walking (outdoor) |
| 2 | `treadmill-walking` | treadmill | walking (indoor) |
| 3 | `incline-treadmill-walk` | treadmill | walking, LISS ("12-3-30") |
| 4 | `running` | bodyweight | running (outdoor) |
| 5 | `treadmill-running` | treadmill | running (indoor) |
| 6 | `sprinting` | bodyweight | sprinting |
| 7 | `cycling` | bicycle | cycling (outdoor) |
| 8 | `indoor-cycling` | stationary bike | indoor cycling |
| 9 | `rowing-machine` | rowing machine | rowing |
| 10 | `elliptical` | elliptical machine | elliptical |
| 11 | `stair-climber` | stair climber machine | stair climber |
| 12 | `jump-rope` | jump rope | jump rope |
| 13 | `swimming` | pool | swimming |
| 14 | `ski-erg` | ski erg machine | ski erg |
| 15 | `assault-bike` | assault bike | assault bike |
| 16 | `battle-ropes` | battle ropes | battle ropes |
| 17 | `burpees` | bodyweight | burpees |
| 18 | `mountain-climbers-cardio` | bodyweight | mountain climbers (cardio variation) |
| 19 | `hiit-training` | bodyweight | HIIT |
| 20 | `liss-cardio` | bodyweight | LISS |

Coverage confirms every requested focus modality. Two deliberate, real-world (not invented) splits were made: walking and running each got both an outdoor entry and a distinct treadmill entry, since indoor/outdoor pacing, wind resistance, and technique cues are genuinely different and are treated as separate loggable activities in mainstream fitness tracking (Strava, Garmin, etc.), not a fabricated variation. `incline-treadmill-walk` was also split out from flat treadmill walking as its own entry because it is one of the most widely recognized standalone cardio protocols (the "12-3-30" workout), with distinct muscle emphasis (glutes/calves) and distinct technique cues (avoid gripping the console) from flat walking.

`mountain-climbers-cardio` is intentionally a separate catalog entry from `core.ts`'s existing `mountain-climber` (added in the prior core-library sprint). Both describe the same physical movement, but are cataloged for two different real-world training contexts: the core.ts version is framed as a slow, strict-form anti-extension stability drill, while this cardio.ts version is framed as a fast-tempo conditioning/HIIT-circuit exercise. This mirrors how the same movement is commonly presented differently across a "core" section versus a "conditioning" section in real training programs — it is not a duplicate or an invented variation, and the two entries were deliberately given distinct slugs to avoid a collision (`mountain-climber` vs. `mountain-climbers-cardio`).

`hiit-training` and `liss-cardio` are cataloged as their own entries representing the two named training protocols/methodologies from the brief, since HIIT and LISS are universally recognized, real-world training terms (not exercises tied to one specific piece of equipment) — both are described as modality-agnostic protocols applicable to running, cycling, rowing, or bodyweight circuits, consistent with how they are actually used and logged in real fitness contexts.

## Total Cardio Exercises

**20** (all new — this is the first and only cardio batch).

## Total Library Count

**194 exercises** across all nine files: 27 chest + 20 back (47 combined) + 15 shoulders + 18 biceps + 18 triceps + 15 forearms + 41 legs + 20 core + 20 cardio = **194**.

This completes the exercise library: every muscle-group/category stub in `data/exercises/index.ts` (chest, back, legs, shoulders, biceps, triceps, forearms, core, cardio) is now populated. No stubs remain commented out.

## Files Modified

- **Created:** `data/exercises/cardio.ts` (20 entries)
- **Modified:** `data/exercises/index.ts` — activated the pre-existing (commented-out) `cardioExercises` import, spread, and export; every other import/spread/export line untouched
- **Not touched:** `data/exercises/chest.ts`, `data/exercises/back.ts`, `data/exercises/legs.ts`, `data/exercises/shoulders.ts`, `data/exercises/biceps.ts`, `data/exercises/triceps.ts`, `data/exercises/forearms.ts`, `data/exercises/core.ts`

## Validation Results

- **TypeScript** (`npm run type-check`): ✅ Pass, no errors.
- **Zod** (`validateSeedBatch` against full `allExercises`): ✅ 194/194 entries valid, 0 invalid.

## Duplicate Check

- **Within cardio.ts:** No duplicate slugs, no duplicate keywords within any single exercise, no duplicate aliases within any single exercise, among all 20 new entries.
- **Global (across all nine files):** No duplicate slugs anywhere in `allExercises` (194 unique slugs for 194 entries).
- Deliberately verified `mountain-climbers-cardio` does not collide with core.ts's `mountain-climber` slug (distinct slugs confirmed) before finalizing, given both describe the same underlying movement for different training contexts (see note above).
- Verified none of `walking`, `running`, `treadmill-walking`, `treadmill-running`, `cycling`, or `burpees` collide with any existing slug in `legs.ts` (e.g. `walking-lunge` is a distinct, unrelated slug) or any other file.

## Production Readiness

- **Data completeness:** every entry has all required fields populated — tri-lingual name/description/instructions/mistakes/tips, aliases, keywords, equipment, difficulty, category, movement pattern, location, and `muscle_map_id`.
- **New taxonomy applied consistently:** all 20 entries use `muscle_groups: ['cardio']` as the primary tag (matching the file/stub name convention), `category: 'cardio'` and `exercise_type: 'cardio'` (the first batch in the library to use `exercise_type: 'cardio'` — every prior batch used `'strength'`), and `movement_pattern: 'locomotion'` uniformly, since every entry fundamentally represents sustained or repetitive cyclic movement for cardiovascular conditioning.
- **New equipment tags introduced:** `treadmill`, `bicycle`, `stationary bike`, `rowing machine`, `elliptical machine`, `stair climber machine`, `jump rope`, `pool`, `ski erg machine`, `assault bike`, `battle ropes` — all free-form strings (schema has no equipment enum), consistent with every prior batch's pattern of introducing new tags as needed. This is the largest single batch of new equipment vocabulary in the library's history (11 new tags), reflecting how distinct cardio's equipment landscape is from the strength-training files — recommend this be the top priority in the previously-flagged equipment-filter UI/dropdown reconciliation pass.
- **Not yet production-ready:** placeholder `hero_image_url` / `demo_image_url` / `video_url` values (following the established `https://placeholder.mundofit.app/...` convention) and `muscle_map_id` (`cardio-primary`) need real media assets and a confirmed body-map/UI treatment before going live — notably, "cardio" is not really a highlightable muscle region the way chest/back/legs are, so the interactive body map (Phase 10) will need a distinct UI treatment for this category rather than a muscle highlight, flagged here for product awareness.
- **Database seeding:** not run in this task (per the separately-approved pre-beta migration plan, the live Supabase table is expected to be truncated and reseeded from `allExercises` before beta — this batch keeps the TypeScript source complete and ready for that reseed). Zod validation was confirmed via a standalone script invoking `validateSeedBatch` directly against the full 194-entry seed set, then removed.
- **Library complete:** with cardio now populated, all nine planned muscle-group/category files (chest, back, legs, shoulders, biceps, triceps, forearms, core, cardio) are built out — no further stubs remain in `data/exercises/index.ts`.

## Build Status

- **TypeScript:** ✅ Pass (`tsc --noEmit`, no errors)
- **ESLint:** Not run (no lint script invoked for this data-only change)
- **Production Build:** Not run (no build-affecting code changed; seed data only)
