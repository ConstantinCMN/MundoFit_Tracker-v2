# Exercise Library — Final High-Priority Fixes

**Date:** 2026-07-05 11:54
**Role:** Developer (per `.claude/agents/developer.md`)
**Task:** Apply only the two approved High-priority fixes from `docs/reports/exercise-library-final-qa.md` (H-1: duplicate Face Pull entries; H-4: `location` field on four pure-dumbbell exercises). No other improvements were made.

`AGENTS.md` and `.claude/agents/mundofit-expert.md` were read fresh before starting, per instructions.

---

## Fix 1: Duplicate Face Pull entries (H-1)

**Decision: differentiate, not merge.**

The two entries (`face-pull` in `back.ts`, `cable-face-pull` in `shoulders.ts`) already have genuinely distinct content that was never actually identical — different `movement_pattern` (`isolation` vs. `pull`), different rope height/hand-finish cues (eye-level pull vs. upper-chest-to-head with hands finishing beside the ears), and mirrored `muscle_groups`/`secondary_muscles` (`back`+`shoulders` vs. `shoulders`+`back`). The actual defect was narrower than "two identical exercises": each entry's `aliases` array named the *other* exercise's exact name, and both claimed the alias `"rope face pull"`, so alias-based search returned two hits for what looked like one movement. Merging would have meant deleting a full, already-well-written, tri-lingual entry — a destructive, out-of-scope change that would touch translations by definition (explicitly excluded) and reduce the library from 194 to 193 exercises for no content-quality gain over the surgical fix below.

**Changes applied:**

| File | Field | Before | After |
|---|---|---|---|
| `data/exercises/back.ts` (`face-pull`) | `aliases` | `['cable face pull', 'rope face pull']` | `['rope face pull']` |
| `data/exercises/shoulders.ts` (`cable-face-pull`) | `aliases` | `['rope face pull', 'face pull']` | `['high face pull']` |
| `data/exercises/shoulders.ts` (`cable-face-pull`) | `keywords` | `[..., 'posture', 'cable rope pull']` | `[..., 'external rotation', 'cable rope pull']` |

- Removed `'cable face pull'` from `face-pull`'s aliases — it was the exact name of the other exercise.
- Removed `'face pull'` from `cable-face-pull`'s aliases — same collision in the other direction.
- Resolved the shared `'rope face pull'` alias by keeping it only on `face-pull` (the more foundational, eye-level-pull entry) and giving `cable-face-pull` a new, genuinely distinguishing alias, `'high face pull'`, reflecting its higher rope path and ear-height hand finish — already accurate to its own existing instruction text, not a new claim.
- Replaced the redundant `'posture'` keyword on `cable-face-pull` with `'external rotation'` — a term already present in that entry's own `description_en`, so this sharpens its identity as the external-rotation-focused variant rather than introducing new vocabulary.
- `muscle_groups` and `secondary_muscles` were reviewed on both entries and found already correctly, symmetrically differentiated (`back`+`shoulders` vs. `shoulders`+`back`) — no change was needed there, so none was made.
- **Not touched:** `name_en/ro/es`, `description_en/ro/es`, `instructions_*`, `mistakes_*`, `tips_*`, `equipment`, `difficulty`, `category`, `movement_pattern`, media placeholder URLs — per the explicit "do not modify translations / media placeholders" constraint, and because none of it needed to change to resolve the actual defect.

Result: zero alias is now claimed by more than one exercise anywhere in the 194-entry library (verified programmatically — see Validation).

## Fix 2: `location` field on four pure-dumbbell exercises (H-4)

Changed `location: 'gym'` → `location: 'both'` on exactly the four exercises specified, all of which require nothing but dumbbells:

| File | Slug | Before | After |
|---|---|---|---|
| `data/exercises/shoulders.ts` | `dumbbell-lateral-raise` | `gym` | `both` |
| `data/exercises/shoulders.ts` | `dumbbell-front-raise` | `gym` | `both` |
| `data/exercises/shoulders.ts` | `bent-over-dumbbell-rear-delt-fly` | `gym` | `both` |
| `data/exercises/forearms.ts` | `farmers-carry` | `gym` | `both` |

No other field on these four entries was touched.

## Explicitly not touched (per instructions)

Media placeholder URLs, `landmine-press`/`landmine-single-arm-press` (the H-3 finding — not in scope for this task), equipment naming (the M-1 `"EZ bar"` casing finding), any translation content, `docs/DATABASE.md` or any other documentation file, the live database/migrations, the muscle-filter UI, or any other component.

---

## Files Modified

- `data/exercises/back.ts` — `face-pull` aliases (1 line).
- `data/exercises/shoulders.ts` — `cable-face-pull` aliases and keywords (2 lines); `location` on `dumbbell-lateral-raise`, `dumbbell-front-raise`, `bent-over-dumbbell-rear-delt-fly` (3 lines).
- `data/exercises/forearms.ts` — `location` on `farmers-carry` (1 line).

No other file was created, deleted, or modified.

## Fixes Applied

1. Duplicate Face Pull entries (H-1) — differentiated via aliases/keywords, no merge, no translation changes.
2. `location` field corrected on 4 pure-dumbbell exercises (H-4): `dumbbell-lateral-raise`, `dumbbell-front-raise`, `bent-over-dumbbell-rear-delt-fly`, `farmers-carry` — `gym` → `both`.

## Validation

- **TypeScript** (`npm run type-check`): ✅ Pass, no errors.
- **Zod** (`validateSeedBatch` against full `allExercises`): ✅ 194/194 entries valid, 0 invalid.
- **Alias collision check** (programmatic, across all 194 entries): 0 aliases now claimed by more than one exercise (previously 1: `"rope face pull"`).
- **Location fix check** (programmatic): all four target exercises confirmed `location: 'both'`.
- **Duplicate slug check** (global): 0 — unchanged, as expected (no slugs were added or removed).
- **Diff scope check** (`git status` / `git diff`): confirms only `back.ts`, `shoulders.ts`, and `forearms.ts` were touched, and only on the specific lines described above.

## Build Status

- **TypeScript:** ✅ Pass (`tsc --noEmit`, no errors)
- **ESLint:** Not run (no lint script invoked for this data-only change)
- **Production Build:** Not run (no build-affecting code changed; seed data only)
