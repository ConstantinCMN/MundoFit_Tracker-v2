# Workout Session Engine — Architecture Blueprint

---

## Table of Contents

1. [User Flow](#1-user-flow)
2. [State Management](#2-state-management)
3. [Database](#3-database)
4. [Autosave](#4-autosave)
5. [Component Architecture](#5-component-architecture)
6. [Data Flow](#6-data-flow)
7. [Edge Cases](#7-edge-cases)
8. [Performance](#8-performance)
9. [Error Handling](#9-error-handling)
10. [Implementation Plan](#10-implementation-plan)
11. [Risks](#11-risks)
12. [Final Review](#12-final-review)

---

## 1. User Flow

### Entry Points

Three paths lead into a session. Each must eventually produce the same initialised session state.

- **Path A — Body Hub / Generator:** The user selects muscles, a split is inferred or chosen, the generator assembles a workout. The user taps "Start Workout." A URL is constructed: `/workouts/session?workoutId=X&scheduleDay=Y&split=Z`. No session row exists yet.
- **Path B — Dashboard Today Card:** The "Start Workout" CTA already knows `workoutId` and `scheduleDay`. Navigates directly to the same session URL.
- **Path C — Workout History / My Workouts:** User picks a saved workout to repeat. `scheduleDay` is absent. URL: `/workouts/session?workoutId=X`.
- **Path D — Resume Interrupted Session:** On any app load, the system detects an orphaned session in localStorage. A banner or modal prompts "You have an active workout. Resume?" Accepting resumes at the exact point of interruption.

---

### Complete State Sequence

```
[Workout Confirmed]
       │
       ▼
[Session Initialising]
  → POST to create workout_sessions row
  → Freeze exercise list from workout_exercises (with positions)
  → Write session state to localStorage
       │
       ▼
[Session Active — Exercise N of M]
  → Display exercise name, target sets, target reps, muscle group
  → Display set history for this exercise (empty at start)
       │
       ▼
[Set Entry]
  → User enters weight + reps in SetRow
  → Taps "Complete Set"
  → Set written optimistically to local state
  → session_sets row created in background (non-blocking)
       │
       ▼
[Rest Timer]
  → Starts immediately after set completion (configurable duration)
  → Countdown shown in overlay
  → User may "Skip Rest"
  → If all target sets done for exercise: "Next Exercise" button appears instead
       │
       ▼
[Next Set or Next Exercise decision]
  → If remaining sets > 0: loop back to Set Entry after rest
  → If all sets done: advance exercise index
       │
       ▼
[Exercise Transition]
  → Brief transition card showing next exercise name
  → "Skip This Exercise" option
       │
       ▼
[Repeat for each exercise...]
       │
       ▼
[Last Exercise Complete — or user taps "Finish Early"]
       │
       ▼
[Finish Confirmation Dialog]
  → Shows: exercises completed / total, sets logged
  → "Keep Going" vs "Finish Workout"
       │
       ▼
[Session Completing]
  → Write completed_at to workout_sessions
  → Any unsynced local sets flushed to DB
       │
       ▼
[Workout Summary Screen]
  → Total duration
  → Total volume (sets × weight per exercise)
  → Exercises completed vs skipped
  → Sets logged per exercise
  → Personal record highlights (where detectable)
       │
       ▼
[Session Saved]
  → Clear localStorage session state
  → Navigate to Dashboard or History
```

### Possible States at Any Point

| State | Description |
|---|---|
| `idle` | No session in progress |
| `initialising` | Session start request in flight |
| `active` | Exercise in progress, user entering sets |
| `resting` | Rest timer running between sets |
| `transitioning` | Moving from one exercise to the next |
| `paused` | User explicitly paused the workout |
| `finishing` | Confirmation dialog shown |
| `completing` | DB write of completion in flight |
| `completed` | Session saved, summary shown |
| `cancelled` | User abandoned the workout |
| `recovering` | Session found in localStorage, restoration in progress |
| `error` | Unrecoverable failure (session could not be created) |

---

## 2. State Management

### Guiding Principle

State is split into three tiers by durability requirement:

- **Tier 1 — DB-persisted:** Written to Supabase. Survives everything. Slow to write.
- **Tier 2 — localStorage-persisted:** Survives refresh, tab close, and crashes. Fast to read/write. Lost on storage clear.
- **Tier 3 — Ephemeral React state:** Re-derived on mount. Never survives refresh alone.

### State Inventory

#### Active Workout (Tier 1 + 2)

| Field | Type | Tier | Source of truth |
|---|---|---|---|
| `sessionId` | string | 1 + 2 | Created in DB; synced to localStorage immediately |
| `workoutId` | string | 2 | From URL params; written to localStorage on start |
| `scheduleDayId` | string \| null | 2 | From URL params |
| `startedAt` | ISO timestamp | 1 + 2 | Written to both when session row created |
| `status` | SessionStatus enum | 2 | localStorage only; DB only records `completed_at` |
| `frozenExercises` | OrderedExercise[] | 2 | Frozen copy of workout_exercises at session start |

#### Active Exercise (Tier 2)

| Field | Type | Notes |
|---|---|---|
| `currentExerciseIndex` | number | Index into frozenExercises |
| `currentSetIndex` | number | How many sets the user has started for current exercise |
| `skippedExercises` | string[] (exerciseIds) | Persisted across refresh |

#### Completed Sets (Tier 1 + 2)

Each completed set lives in both `session_sets` (DB) and a local cache in localStorage keyed by `exerciseId`. On mount, the local cache is the primary display source. The DB is the recovery source if localStorage is absent.

| Field | Type |
|---|---|
| `sets[exerciseId]` | Array of `{ setNumber, reps, weightKg, completedAt, synced }` |

The `synced: boolean` flag tracks whether the local set has been written to DB. On any sync event, unsynced sets are flushed.

#### Rest Timer (Tier 2)

Never store a remaining countdown. Store the absolute start timestamp and configured duration.

| Field | Type |
|---|---|
| `restTimer.startedAt` | ISO timestamp or null |
| `restTimer.durationSeconds` | number (default 90) |

Remaining time is always derived: `durationSeconds - (Date.now() - startedAt) / 1000`.

This means the timer automatically corrects itself after a phone lock, app backgrounding, or tab switch. No drift accumulates.

#### Paused Workout (Tier 2)

| Field | Type |
|---|---|
| `pausedAt` | ISO timestamp or null |
| `accumulatedPauseMs` | number |

Elapsed time is computed as `(Date.now() - startedAt) - accumulatedPauseMs`.

#### Finished Workout (Tier 1)

Once `completing` state is entered, `completed_at` is written to `workout_sessions`. On success, localStorage session state is cleared. The summary screen reads from what was already in memory (not re-fetched).

---

### Where State Lives

- **React Context (`WorkoutSessionProvider`):** Holds the single source of truth for the current session during a render session. Derived from localStorage on mount, then kept in sync bidirectionally.
- **localStorage key: `wf_active_session`:** JSON blob of the entire Tier 2 state. Written on every meaningful state change (set completion, exercise advance, pause, timer start). Reads happen only on mount / recovery.
- **Supabase:** Receives writes for `workout_sessions` (create + complete) and `session_sets` (one row per completed set). Never queried mid-session for state — only queried during recovery if localStorage is absent.

---

## 3. Database

### Existing Tables — How They Are Used

#### `workout_sessions`

| Column | When written |
|---|---|
| `id` | On session start (INSERT) |
| `user_id` | On session start |
| `workout_id` | On session start |
| `started_at` | On session start |
| `completed_at` | On session finish (UPDATE) |

No other writes are made to this table during an active session. The row remains with `completed_at = NULL` while in progress. This is intentionally used as the "in-progress" signal for recovery queries.

#### `session_sets`

One row per completed set, written immediately when the user confirms each set (non-blocking).

| Column | Usage |
|---|---|
| `id` | Auto-generated |
| `session_id` | Foreign key to workout_sessions |
| `exercise_id` | Which exercise this set belongs to |
| `set_number` | Sequential within this exercise (1, 2, 3...) |
| `reps` | User-entered |
| `weight_kg` | User-entered |
| `completed_at` | Client timestamp at time of set completion |

The `position` column (from the migration adding position to session_sets) is used to order sets correctly on the summary screen and in history queries.

#### `workout_exercises`

Read at session start. Provides the ordered list of exercises with target reps and sets. This data is frozen into localStorage immediately — mid-session edits to the workout in the DB are irrelevant until the next session.

#### `exercises`

Read alongside `workout_exercises`. Provides exercise names, muscle groups, and descriptions.

#### `workout_schedule_days`

When `scheduleDayId` is present, the schedule day's `completed` status is derived from the existence of a `workout_sessions` row with matching `workout_id` and a `started_at` on the same calendar date. This derivation happens in `getActiveSchedule` — no additional writes required.

---

### New Table Justification

**Verdict: One new table is justified.**

**`workout_session_state`** — optional but strongly recommended for production.

| Reason | Detail |
|---|---|
| localStorage is not reliable | Incognito mode, manual storage clear, browser storage quota exceeded |
| Long session duration | 45–90 minutes is too long to risk total data loss |
| Multi-device | localStorage is device-local; a server-side draft enables session handoff |

**Proposed schema:**

```
workout_session_state
  id              uuid PK
  session_id      uuid FK → workout_sessions.id
  user_id         uuid FK → auth.users.id
  state_blob      jsonb    -- serialised Tier 2 state
  updated_at      timestamptz
```

One row per active session. `state_blob` is the same JSON written to localStorage, also written to this table on a debounced basis (every 30 seconds or on set completion). On recovery, if localStorage is empty, this table is queried.

If this table is deferred, implement localStorage-only for Sprint 1 and introduce server-side state in Sprint 7. The architecture supports both paths.

---

## 4. Autosave

### When Autosave Runs

Autosave operates on two axes: **event-driven** (primary) and **time-driven** (safety net).

**Event-driven triggers:**
- Every set completion (immediate)
- Every exercise advance
- On pause
- On rest timer start
- On "Finish Workout" button tap (before DB write)
- On `window.beforeunload` (best-effort; Safari restricts async here)
- On `document.visibilitychange` (when app goes to background)

**Time-driven triggers:**
- Every 30 seconds while session is active (safety net for missed events)

### What Gets Saved

The localStorage write includes the complete Tier 2 state blob: `sessionId`, `workoutId`, `scheduleDayId`, `startedAt`, `status`, `currentExerciseIndex`, `currentSetIndex`, `frozenExercises`, `sets` (including unsynced entries), `skippedExercises`, `restTimer`, `pausedAt`, `accumulatedPauseMs`.

The DB write (for `session_sets`) is a separate, narrower write: only the newly completed set row.

### Recovery After Refresh

1. On mount, `WorkoutSessionProvider` reads `wf_active_session` from localStorage.
2. If present and `status` is not `completed` or `cancelled`, enter `recovering` state.
3. Verify the session still exists in DB (one lightweight GET: `workout_sessions` by `sessionId` where `completed_at IS NULL`). This guards against stale localStorage after DB deletion.
4. If verified: restore full state, show "Workout resumed" toast, continue.
5. If not verified (session was deleted externally): clear localStorage, return to idle.

### Recovery After Crash / Browser Close

Identical path to refresh recovery. localStorage persists across these events. The same mount-time check applies.

The one additional check: if `startedAt` is more than 24 hours ago, the session is considered stale. Prompt: "You started a workout 26 hours ago. Would you like to save the completed sets or discard?" — allowing partial data rescue before clearing.

### Recovery When Server-Side State Is Available

Query `workout_session_state` for the user's most recent row with a matching unfinished `workout_sessions.completed_at IS NULL`. If fresher than localStorage (compare `updated_at`), use the server blob. This handles the incognito and multi-device cases.

---

## 5. Component Architecture

### Route Structure

```
app/[locale]/(app)/workouts/session/page.tsx    ← Server Component
app/[locale]/(app)/workouts/session/layout.tsx  ← Optional: hides nav bar during session
```

The server page fetches workout + exercises + optional existing session. Passes initial data as props to the client root. The route URL includes `workoutId`, `scheduleDay`, `split` as query params.

---

### Component Tree

```
WorkoutSessionPage (Server)
  Fetches: workout, workout_exercises + exercises, existing session if any
  Renders: WorkoutSessionClient with initialData prop

WorkoutSessionClient (Client root — 'use client')
  Renders: WorkoutSessionProvider wrapping all children
  Handles: back-navigation guard (prompt before leaving)

  WorkoutSessionProvider (Context provider)
    Owns: all session state
    Exposes: useWorkoutSession() hook to all children

    WorkoutSessionRouter (conditional renderer — no DOM output)
      Reads: status from context
      Renders one of:
        ├── WorkoutConfirmView       (status: idle — confirm before starting)
        ├── ActiveWorkoutView        (status: active | resting | transitioning)
        ├── PauseOverlay             (status: paused — rendered on top of ActiveWorkoutView)
        ├── FinishConfirmDialog      (status: finishing)
        ├── SessionCompletingOverlay (status: completing — spinner)
        └── WorkoutSummaryView       (status: completed)

    ── ActiveWorkoutView ──────────────────────────────────────────
    │
    ├── WorkoutHeader
    │     Props: workoutName, exerciseProgress (N of M), onPause, onFinishEarly
    │     Contains:
    │       ElapsedTimer     ← isolated; ticks every second; never causes parent re-render
    │       ProgressBar      ← percent = completedExercises / totalExercises
    │       PauseButton
    │       FinishEarlyButton
    │
    ├── ExerciseCard
    │     Props: exercise, targetSets, targetReps, completedSets (array)
    │     Contains:
    │       ExerciseHeader   ← name, muscles targeted, illustration if available
    │       SetList
    │         SetRow × N    ← one per completed set; finalised rows are read-only
    │         ActiveSetRow  ← current set being entered (reps input, weight input, complete button)
    │       ExerciseActions
    │         CompleteSetButton   ← disabled until reps + weight filled
    │         SkipExerciseButton  ← confirmation inline
    │         PreviousExerciseButton (if not first)
    │
    ├── RestTimerOverlay (conditionally rendered when status = resting)
    │     Props: durationSeconds, startedAt
    │     Contains:
    │       CountdownDisplay  ← derived from (startedAt + duration - now), updated by own interval
    │       ProgressRing      ← animated SVG, same derivation
    │       SkipRestButton
    │       NextExerciseButton (shown when all sets done)
    │
    └── WorkoutProgressDots
          Props: exercises[], currentIndex, completedIndexes[], skippedIndexes[]
          Pure display only. Tap on a dot navigates to that exercise.

    ── WorkoutSummaryView ─────────────────────────────────────────
    │
    ├── SummaryHeader        ← "Workout Complete", duration, date
    ├── SummaryStatsRow      ← total volume, total sets, exercises done
    ├── ExerciseSummaryList
    │     ExerciseSummaryCard × N
    │       ← exercise name, sets logged (reps × weight), vs target
    ├── PersonalRecordBanner ← shown if any set exceeded previous best (if detectable)
    └── SummaryActions
          SaveAndGoHomeButton   ← writes completed_at, clears state, navigates
          SaveAndViewHistoryButton

    ── WorkoutConfirmView ─────────────────────────────────────────
    │
    ├── WorkoutPreviewCard    ← name, split, exercise count, estimated duration
    ├── ExercisePreviewList   ← collapsible list of exercises
    └── StartWorkoutButton    ← triggers session initialisation
```

---

### Supporting Hooks (Non-visual / Utility)

- **`useWorkoutSession()`** — hook that reads from WorkoutSessionProvider context. All child components use this; they do not receive state as props (avoids prop drilling).
- **`useElapsedTime(startedAt, accumulatedPauseMs)`** — hook used only by `ElapsedTimer`. Owns its own `setInterval`. Returns formatted string. Never placed in shared context.
- **`useRestTimer(startedAt, durationSeconds)`** — hook used only by `RestTimerOverlay`. Same isolation pattern.
- **`useAutosave()`** — hook used inside `WorkoutSessionProvider`. Subscribes to state changes via `useEffect`, writes to localStorage (synchronous) and queues DB sync (async).
- **`useSessionRecovery()`** — hook called once on `WorkoutSessionClient` mount. Reads localStorage, checks DB, returns either recovered state or null.

---

## 6. Data Flow

### Lifecycle Narrative

#### Phase 1: Page Load

The server component fetches workout data and the user's profile in parallel. If a `workoutId` exists in the query params, it fetches `workout_exercises` joined with `exercises`, ordered by position. It also checks for an existing `workout_sessions` row with `completed_at IS NULL` for this user and workout combination.

All fetched data is passed as serialisable props to `WorkoutSessionClient`. No session state is created server-side. The server is read-only at this stage.

#### Phase 2: Client Mount

`WorkoutSessionClient` mounts. `useSessionRecovery()` fires synchronously (reads localStorage) and asynchronously (checks DB for orphaned session). If recovery finds an active session, state is restored. If not, the component renders in `idle` state with the workout preview.

#### Phase 3: Session Start

User taps "Start Workout." The `startSession` action fires:

1. Optimistically set local state to `initialising`.
2. Send `POST /api/sessions` (or Supabase client insert) to create `workout_sessions` row.
3. On success, receive `sessionId`. Set status to `active`. Write full state blob to localStorage.
4. On failure, set status back to `idle`, show error toast, offer retry.

#### Phase 4: Set Completion

User completes a set. The `completeSet` dispatch fires:

1. Append set to local `sets[exerciseId]` with `synced: false`.
2. Immediately write localStorage (synchronous).
3. Start rest timer (write timer start timestamp to state).
4. In background: INSERT into `session_sets`. On success, mark set as `synced: true` in local state. On failure, leave `synced: false` for retry.

The UI never waits for the DB write. Set is visible immediately.

#### Phase 5: Sync Queue

A background effect watches `sets` for entries where `synced: false`. It batches these and retries with exponential backoff. During normal operation, most sets sync within 200–500ms. During network issues, sets accumulate in localStorage and flush when connectivity returns.

#### Phase 6: Session Completion

User confirms finish. The `completeSession` dispatch fires:

1. Flush all unsynced sets (await all pending session_set inserts).
2. UPDATE `workout_sessions` SET `completed_at = now()`.
3. On success, set status to `completed`. Clear localStorage session state. Render summary.
4. On failure, show error on summary screen with retry button. Do not clear localStorage.

#### Phase 7: Navigation Away

After saving, navigate to `/dashboard` or `/workouts/history`. The session provider unmounts. No state leaks.

---

## 7. Edge Cases

### User Refreshes Mid-Workout

Session state in localStorage is up to date (written on every event). On mount, recovery detects active session, restores state, shows "Workout resumed" toast. Rest timer recalculates remaining time from stored `startedAt` + `durationSeconds` vs `Date.now()`. If rest period has elapsed, timer shows 0:00 and the "Next Set" prompt.

### User Closes Browser

Identical to refresh. `beforeunload` may fire a final localStorage write. DB writes in-flight are abandoned (browser terminates XHR/fetch). Any unsynced sets are preserved in localStorage and flushed on resume.

### Phone Locks / Screen Off

The app is backgrounded. JS execution is throttled or suspended. Timers stop. On resume, elapsed time and rest timer both recalculate from stored absolute timestamps. The workout does not "think" less time has passed than actually has.

### Network Lost

All DB writes queue in localStorage (unsynced sets). The UI shows a subtle "Syncing..." indicator in the header (not blocking). When connectivity returns, the queue flushes automatically. The workout continues uninterrupted regardless.

### Network Restored with Queued Sets

On reconnect, the sync queue processes oldest-first. If a session_set INSERT returns a duplicate key error (same session_id + exercise_id + set_number), it is silently ignored — the row already exists. This makes the sync queue idempotent.

### Duplicate Set Submit

If the user double-taps "Complete Set" (race condition), the local state update is guarded by a `completing: boolean` flag on the active set row. The button is disabled during the state write. Only one set entry is created locally. Only one DB insert fires.

### Workout Cancelled

User taps "Cancel Workout" from the pause screen. A confirmation dialog appears: "Cancel workout? Sets logged so far will not be saved." On confirm, the `workout_sessions` row is either deleted or left with `completed_at = NULL` (never completed). The in-progress marker is used to detect abandoned sessions on next load. localStorage is cleared. User is navigated to the dashboard.

Alternatively, partial completion can be preserved: mark the session as `abandoned` via a status column. This is a design decision left to product — the architecture supports either approach.

### Rest Timer Running When Exercise Is Skipped

The rest timer overlay is dismissed. `restTimer` is set to null in state. The skip transitions to the next exercise without waiting. Timer state is cleared from localStorage.

### Program Edited While Session Is Active

The exercise list for an active session is frozen in localStorage at session start. Mid-session edits to `workout_exercises` (reordering, adding, removing) in the DB have no effect on the current session. The session operates on its frozen copy. The user will see updated exercises only when they start their next workout.

This is the only safe approach — mutating the active exercise queue mid-session would produce undefined behaviour.

### Multiple Tabs Open

On the second tab's mount, `useSessionRecovery` detects the active session in localStorage. It checks if there is already an active consumer via a localStorage mutex (`wf_session_consumer_id`: a per-mount UUID). If a consumer is already registered, the second tab shows: "This workout is open in another tab. Continue there." with a "Take over" option. The BroadcastChannel API can be used to communicate between tabs.

### Personal Record Detection (Summary Screen)

To detect personal records, the summary screen needs the user's previous best weight for each exercise. This requires a query against `session_sets` grouped by `exercise_id`, filtered to `session_id` not equal to the current session, ordered by `weight_kg DESC`. This query runs only when the summary screen renders — after the session is complete. It is not needed during the active session.

### Session Too Old

If the orphaned session's `startedAt` is more than 24 hours ago, it is unlikely the user wants to continue. Show: "You started a workout 2 days ago. The session data is saved. Would you like to continue or start fresh?" If they choose "Start fresh," the old session remains in DB with `completed_at = NULL` (historical record of partial sets) and localStorage is cleared.

---

## 8. Performance

### What Must Never Re-render

- **`ElapsedTimer`** — ticks every second. It owns its own local state and interval. It must be a leaf component with no children. The parent `WorkoutHeader` does not tick — only the timer inside it does. If ElapsedTimer caused its parent to re-render, the entire active view would re-render every second.
- **`RestTimerOverlay`** — same principle. Owns its own interval. `RestTimerOverlay` re-renders every second but nothing above it does.
- **`WorkoutSessionProvider`** — the context value must be a memoised object. If the context value reference changes on every render (even for unrelated state changes), all consumers re-render. Use `useMemo` on the context value, keyed to only the fields each consumer actually reads.
- **`SetRow` (completed rows)** — once a set is marked complete, its display values never change. These must be memoised. They will not re-render even when new sets are added to the list.

### What Should Be Memoised

- The context value object in `WorkoutSessionProvider`
- `frozenExercises` array (computed once from server data, never changes)
- Total volume in `WorkoutSummaryView` (sum over all sets × weight)
- Completion percentage for `ProgressBar`
- Individual `SetRow` components (keyed by `set_number`, memoised)

### Render Budgets Per Component

| Component | Expected render frequency |
|---|---|
| `ElapsedTimer` | Every 1 second |
| `RestTimerOverlay` | Every 1 second |
| `ExerciseCard` | On exercise change, on set completion |
| `SetList` | On set completion |
| `ActiveSetRow` | On every keystroke (reps/weight input) |
| `WorkoutHeader` | Never independently — timer child ticks, header stays static |
| `WorkoutProgressDots` | On exercise advance only |
| `WorkoutSummaryView` | Once (on session complete) |

### Optimistic Updates

Every user action (set complete, exercise skip, rest skip) updates local state synchronously before any DB operation begins. The UI never shows a loading state for these actions. DB writes are silent background operations with retry logic.

The only exception is session creation (on "Start Workout") and session completion (on "Finish Workout"). These are awaited because failure must be communicated to the user.

### Autosave Strategy

localStorage writes are synchronous and cheap. They happen on every state mutation (no debounce needed — they are fast).

DB writes for `session_sets` are fire-and-forget with a retry queue. No debounce on individual sets (each set should be persisted immediately). The server-side state blob (`workout_session_state`) is written debounced at 30-second intervals — it is a safety net, not primary persistence.

### Lazy Loading

The `WorkoutSummaryView` and `PersonalRecordBanner` can be lazy-loaded since they are only needed after the session completes. The rest of the session UI is eagerly loaded.

---

## 9. Error Handling

### Session Creation Failure

**Cause:** Network error or Supabase error on INSERT to `workout_sessions`.

**UI response:** Status returns to `idle`. Toast: "Could not start workout. Check your connection." Retry button in the confirmation view.

**Recovery:** User taps retry. If DB is available, succeeds. If still unavailable, offer "Start offline" (creates a local-only session with a UUID; syncs to DB when connectivity returns — this is an advanced path requiring careful deduplication).

---

### Set Save Failure

**Cause:** Network error on INSERT to `session_sets`.

**UI response:** Silent. The set is marked `synced: false` in local state. A subtle indicator in `WorkoutHeader` ("Syncing...") may appear but must not interrupt the workout flow.

**Recovery:** Background retry, up to 5 attempts with exponential backoff (1s → 2s → 4s → 8s → 16s). On reconnect, flush all unsynced sets. On final failure (all retries exhausted), the set remains in localStorage and will flush on the next app load.

---

### Session Completion Failure

**Cause:** Network error on UPDATE to `workout_sessions.completed_at`.

**UI response:** Summary screen shows: "Could not save your workout. Tap to retry." Retry button visible. The session is not cleared from localStorage until completion succeeds.

**Recovery:** User taps retry. If success, clear localStorage and show confirmation. If persistent failure, offer: "Your data is saved locally. We'll save it when you reconnect." App can auto-complete the session on next load when it detects a completed-but-unsynced status in localStorage.

---

### Workout Not Found

**Cause:** `workoutId` in URL refers to a deleted or inaccessible workout.

**UI response:** Server component returns 404 state. Client renders: "This workout could not be found." with a link to My Workouts.

---

### Corrupted localStorage State

**Cause:** Partial write, storage corruption, JSON parse failure.

**UI response:** `try/catch` around all localStorage reads. On parse failure, treat as absent state (return null from `useSessionRecovery`). User starts fresh. A console warning is logged.

---

### RLS / Authorisation Failure

**Cause:** User's session expired mid-workout. Supabase returns 401/403 on `session_sets` INSERT.

**UI response:** Detect auth error in the sync layer. Pause DB writes. Show toast: "Session expired. Sign back in to save your progress." Deep-link to sign-in, returning to the workout URL on success.

**Recovery:** After re-authentication, resume localStorage-based session, flush unsynced sets.

---

### Exercise Data Missing

**Cause:** `workout_exercises` returns empty (workout has no exercises). Should not happen if the generator validates this.

**UI response:** Show empty state in `ExerciseCard`: "No exercises found for this workout." with a button to go back to the generator.

---

### Timer Drift / Device Clock Change

**Cause:** User changes system clock, DST transition, or NTP sync mid-workout.

**Mitigation:** All timers use `Date.now()` relative computations. A clock change will affect perceived elapsed time. This is an acceptable edge case. For production, use `performance.now()` for intervals (monotonic clock) while storing absolute timestamps for persistence.

---

## 10. Implementation Plan

Each sprint ships independently. No sprint modifies more than one subsystem. Each is safe to merge and deploy.

---

### Sprint W1 — Session Scaffolding

**Scope:** Route, page, layout, `WorkoutSessionProvider`, `WorkoutConfirmView`, static `ActiveWorkoutView` with hardcoded exercise data.

**Goal:** The route exists. The UI skeleton renders with props passed from server. No session is created. No state is saved.

**Safe to merge:** Yes — no DB changes, no user-facing functionality yet.

---

### Sprint W2 — Session Creation

**Scope:** `startSession` action writes to `workout_sessions`. `sessionId` stored in localStorage. Status transitions to `active`. `frozenExercises` frozen in localStorage.

**Goal:** A real session row is created on "Start Workout." Verified via Supabase dashboard.

**New surface:** One Supabase INSERT.

---

### Sprint W3 — Set Logging

**Scope:** `ActiveSetRow` inputs (reps, weight). `completeSet` action. `session_sets` INSERT (fire-and-forget). Local state update. `SetList` renders completed sets. `synced` flag tracking.

**Goal:** Users can log sets. Sets appear in DB.

**New surface:** `session_sets` INSERTs.

---

### Sprint W4 — Exercise Navigation

**Scope:** `currentExerciseIndex` state. "Next Exercise" / "Previous Exercise" buttons. `WorkoutProgressDots`. Skip exercise flow.

**Goal:** Users can move through the exercise queue. State persists to localStorage on every navigation.

---

### Sprint W5 — Rest Timer

**Scope:** `RestTimerOverlay`. `useRestTimer` hook. Timer auto-starts on set completion. Skip rest. Timer survives refresh (recalculates from stored timestamp).

**Goal:** Rest timer works correctly and recovers after page reload.

---

### Sprint W6 — Pause and Finish

**Scope:** `PauseOverlay`. `FinishConfirmDialog`. `ElapsedTimer` with pause accumulation. `completeSession` action writes `completed_at`. localStorage cleared on success.

**Goal:** Users can pause, resume, and finish workouts. Session row is complete in DB.

---

### Sprint W7 — Workout Summary

**Scope:** `WorkoutSummaryView`. Stats computation (volume, duration, sets per exercise). Navigation to history after save.

**Goal:** A meaningful summary screen appears after completing a workout.

---

### Sprint W8 — Session Recovery

**Scope:** `useSessionRecovery`. Recovery flow on mount. Orphaned session detection (24h rule). "Resume?" prompt. Unsynced set flush on mount.

**Goal:** Refreshing mid-workout restores full state. Browser close and reopen resumes the workout.

---

### Sprint W9 — Error Handling and Retry

**Scope:** Auth error detection in sync layer. Set save retry queue. Session completion retry. Corrupted localStorage guard. Toast notifications.

**Goal:** All failure paths degrade gracefully. No data is lost on network errors.

---

### Sprint W10 — Server-Side State (Optional)

**Scope:** `workout_session_state` table. State blob written to DB every 30 seconds. Recovery prefers server state over localStorage when fresher.

**Goal:** Incognito mode and device switch are handled without data loss.

**Pre-requisite:** Sprint W8 must be complete.

---

## 11. Risks

### Risk 1 — localStorage Unavailability

localStorage is disabled in some privacy configurations (Firefox strict mode, certain Safari settings, third-party cookie restrictions). If localStorage is unavailable, session recovery does not work and mid-session refresh loses all local state.

**Mitigation:** Feature-detect localStorage availability on mount. If unavailable, show a warning banner: "Enhanced session saving is disabled. Do not refresh during your workout." All DB writes still function normally.

---

### Risk 2 — Supabase RLS on session_sets

If RLS policies on `session_sets` are not correctly configured to allow `user_id` ownership checks (or if `session_sets` does not have a direct `user_id` column and relies on a join through `workout_sessions`), insert operations will silently fail in production. This is the most likely source of silent data loss in the first deployed sprint.

**Mitigation:** Write an explicit integration test (or manual verification) that confirms session_sets inserts are permitted for authenticated users and rejected for unauthenticated ones.

---

### Risk 3 — Timer Reliability

Mobile browsers aggressively throttle background JS execution. A user who backgrounds the app during a rest period may return to find the countdown frozen. Since timers are derived from absolute timestamps (not countdown state), the display will immediately correct on foreground. However, if the browser suspended execution for long enough that the rest period elapsed, the timer shows 0:00 rather than triggering the "next set" automatically. The user must tap manually.

This is acceptable UX but must be clearly understood by the team.

---

### Risk 4 — Concurrent Session on Multiple Devices

If the same user starts a workout on their phone, then opens the app on a tablet, both will detect the same `workout_sessions` row (`completed_at IS NULL`). Both will write to the same session, creating duplicate or conflicting `session_sets` entries. Without a device-level lock, this produces corrupted session data.

**Mitigation:** At minimum, warn the user ("This workout is already active on another device"). The BroadcastChannel API handles same-browser same-device tabs but not cross-device. Cross-device locking requires a Supabase Realtime channel or a lock column on `workout_sessions`.

---

### Risk 5 — Volume of DB Writes

A heavy user doing 5 sets × 5 exercises = 25 `session_sets` inserts per workout. At 10 workouts per week, that is 250 inserts per week per user. This is low volume individually but may accumulate at scale. Supabase handles this comfortably but the insert pattern (one per set, immediately on completion) should be tested under slow network conditions to ensure the retry queue does not grow unbounded.

---

### Risk 6 — Summary Screen Personal Records

Detecting personal records requires querying all historical `session_sets` for each exercise. For users with years of history, this query could be slow without proper indexing.

**Required index:** `session_sets(exercise_id, weight_kg)` filtered by `user_id` (via join). This query must not block the summary screen — it should be a deferred, low-priority fetch with a loading state on the PR banner only.

---

### Risk 7 — Workout Edited Mid-Session

If the workout's exercise list is modified by another session (or by a future "edit workout" feature) while a session is active, the frozen localStorage exercises and the DB state diverge. The summary screen writes set data keyed by `exercise_id`, which is stable — so the sets themselves are safe. But the exercise names and targets shown during the session will be stale. This is acceptable for now but must be documented as a known limitation.

---

## 12. Final Review

### Self-Critique

#### Weakness 1 — localStorage as the primary durability mechanism

The architecture places significant trust in localStorage. In practice, users clear their browser data, use incognito mode, or encounter storage quota limits. For a workout session that takes 60 minutes, losing all data is a severe user experience failure. Sprint W10 (server-side state) is described as "optional" but should be treated as required for any production release. The optional label understates its importance.

#### Weakness 2 — No offline-first design

The architecture handles network loss gracefully (queue and retry) but does not explicitly design for a fully offline-capable experience. A user in a gym with no signal who starts a workout must trust that the local queue will eventually flush. There is no explicit UI state for "fully offline mode" where the user is reassured their data is safe locally. Adding a clear "Offline — data saving locally" indicator in the WorkoutHeader would address this.

#### Weakness 3 — The sync queue is under-specified

The autosave section describes queuing unsynced sets but does not specify the queue format, flush order, concurrency limit, or maximum queue size. Without this detail, two different implementors could produce incompatible implementations. Before Sprint W3 begins, the sync queue must be specified precisely: FIFO, max 100 entries, flush one-at-a-time or in batches of 5, clear on success, retain on failure.

#### Weakness 4 — No set editing

Once a set is marked complete, the architecture provides no mechanism to edit it. In practice, users tap the wrong weight or reps. Without an edit affordance, the only option is to log a correction as a new set. This produces confusing history. An "Edit set" flow (tap a completed SetRow to re-enable the inputs) should be included in the component design, even if implemented post-MVP.

#### Weakness 5 — Personal records are undefined for new users

The summary screen includes a `PersonalRecordBanner` that queries historical session_sets. For users on their first workout, there is no history. The query will return empty. The banner must handle this gracefully (simply not render). This is straightforward but must be explicitly handled — a missing loading state or an empty-array crash in the PR calculation would break the summary screen for all new users.

#### Weakness 6 — The `workout_session_state` table has no eviction policy

If implemented, `workout_session_state` will accumulate one row per started (never completed) session. A user who starts and abandons many workouts will accumulate stale rows. An eviction policy (delete rows older than 48 hours with no corresponding `completed_at`) must be specified. A Supabase scheduled function or edge function triggered on session completion is the cleanest implementation.

#### Weakness 7 — Multi-device risk is acknowledged but not resolved

The architecture identifies concurrent multi-device sessions as a risk and suggests a warning. But it does not specify what happens to the second device's writes if the user ignores the warning. Without a conflict resolution strategy, two simultaneous sessions will produce interleaved `session_sets` rows that are indistinguishable in history queries. Even a simple "last write wins" policy needs to be explicitly specified.

---

### Suggested Improvements Before Implementation Begins

1. Promote Sprint W10 (server-side state) to Sprint W2 — implement it immediately after session creation, before any set logging. This makes recovery reliable from day one.
2. Specify the sync queue format precisely in a brief technical design document (one page) before Sprint W3.
3. Add an "Edit set" affordance to the component design in Sprint W3, even if it is a stretch goal for that sprint.
4. Define a RLS verification checklist that is executed before Sprint W3 merges.
5. Decide the abandoned-session policy (preserve partial sets or delete) before Sprint W6, as it affects how `completeSession` and the cancel flow are implemented.
6. Replace the `workout_session_state.state_blob: jsonb` column with versioned typed columns if the state shape is expected to evolve — raw JSON blobs become unmaintainable across schema migrations.
