# Workout Session UX Design — v1

**Date:** 2026-06-29  
**Status:** Design Sprint — No implementation yet  
**Scope:** Complete Workout Session screen from first set to summary  

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Screen Architecture](#2-screen-architecture)
3. [Component Hierarchy](#3-component-hierarchy)
4. [Visual Layout Specifications](#4-visual-layout-specifications)
5. [User Flow](#5-user-flow)
6. [Interaction Flow](#6-interaction-flow)
7. [UX Recommendations](#7-ux-recommendations)
8. [Things to Avoid](#8-things-to-avoid)
9. [Future Improvements](#9-future-improvements)

---

## 1. Design Philosophy

### The four rules of an excellent workout session UI

**1. Never make the user think.**  
Every moment of confusion during a workout is friction that breaks focus. The app should always make the next action obvious — not via tooltips or help text, but through layout hierarchy and a single, unambiguous CTA.

**2. Trust the user with their data.**  
The user knows how much they lifted. Pre-fill intelligently from their last session, but get out of the way. No mandatory dropdowns, no weight wizards. Two taps to confirm a pre-filled set.

**3. Completing a set should feel rewarding.**  
The physical accomplishment happens in the gym. The app should reflect that moment with a micro-animation and clear state change — not a toast notification that disappears, but a permanent, satisfying visual check.

**4. The rest period is part of the workout.**  
Rest timers are not a modal to dismiss. They are the transition state between sets. The timer overlay should be calm, show what's coming next, and reward the user for coming back to it.

---

## 2. Screen Architecture

The session screen has three distinct zones:

```
┌─────────────────────────────────────┐
│  ZONE A — STICKY HEADER             │  ~64px  Never scrolls
│  workout title · elapsed time       │
│  ───────── progress bar ─────────── │  4px accent
├─────────────────────────────────────┤
│                                     │
│  ZONE B — SCROLLABLE CONTENT        │  Grows with content
│  exercise context                   │
│  previous performance card          │
│  sets table                         │
│                                     │
│                                     │
│  ─────── padding buffer ─────────── │  Prevents content hiding behind Zone C
├─────────────────────────────────────┤
│  ZONE C — STICKY BOTTOM BAR         │  ~160px  Never scrolls
│  weight input  │  reps input        │
│  ─────────────────────────────────  │
│  [ Complete Set / Next / Finish ]   │
│  [ ← Prev Exercise ] [ Next → ]     │
└─────────────────────────────────────┘
```

**Why this split?**

Zone C is fixed at the bottom for three reasons:
1. The iOS keyboard appears above it — inputs never get buried under the keyboard.
2. The primary CTA is always reachable with the right thumb, regardless of scroll position.
3. The weight/reps inputs are always visible alongside the sets table — no context switching.

The bottom navigation (`/dashboard`, `/workouts`, etc.) is **hidden entirely** during an active session. The workout owns the screen.

---

## 3. Component Hierarchy

```
WorkoutSessionClient
└── WorkoutSessionProvider                    ← context: status, currentExerciseIndex, sets[]
    ├── SessionHeader (sticky)                ← Zone A
    │   ├── PauseButton (→ PauseOverlay)
    │   ├── WorkoutTitle
    │   ├── ElapsedTimer                      ← Live HH:MM:SS, runs even when overlay open
    │   └── ProgressBar                       ← filled proportion = exercises completed / total
    │
    ├── WorkoutSessionRouter                  ← switches on status
    │   │
    │   ├── [idle]         WorkoutConfirmView
    │   │
    │   ├── [active        ActiveWorkoutView  ← Zone B
    │   │    resting                          
    │   │    transitioning                    
    │   │    paused                           
    │   │    finishing]                       
    │   │   ├── ExerciseContext
    │   │   │   ├── ExerciseLabel            ← "Exercise 2 of 5"
    │   │   │   ├── ExerciseName             ← large, prominent
    │   │   │   └── MuscleGroupTags          ← pill chips
    │   │   │
    │   │   ├── PreviousPerformanceCard      ← compact, always visible
    │   │   │
    │   │   └── SetsTable
    │   │       ├── SetsTableHeader          ← Set · Previous · Status
    │   │       └── SetRow[]
    │   │           ├── [completed] SetRow   ← muted, checkmark
    │   │           ├── [active]    SetRow   ← accent left border, full opacity
    │   │           └── [upcoming]  SetRow   ← muted, no interaction
    │   │
    │   └── [completed]    WorkoutSummaryView
    │
    ├── ActiveBottomBar (sticky)              ← Zone C — visible during active/resting/transitioning
    │   ├── WeightInputControl
    │   │   ├── DecrementButton  (−2.5 kg)
    │   │   ├── WeightDisplay    (tap → keyboard)
    │   │   └── IncrementButton  (+2.5 kg)
    │   ├── RepsInputControl
    │   │   ├── DecrementButton  (−1)
    │   │   ├── RepsDisplay      (tap → keyboard)
    │   │   └── IncrementButton  (+1)
    │   └── SessionCTA                       ← label changes by state (see §6)
    │       └── ExerciseNavBar
    │           ├── PrevExerciseButton
    │           └── NextExerciseButton
    │
    └── Overlays (AnimatePresence)
        ├── RestTimerOverlay   (status = 'resting')
        ├── PauseOverlay       (status = 'paused')
        └── FinishConfirmDialog (status = 'finishing')
```

---

## 4. Visual Layout Specifications

### 4.1 Zone A — Session Header

```
┌────────────────────────────────────────┐
│  [⏸]   Upper Body Push      00:23:45  │
│  █████████████░░░░░░░░░░░░░░░░░░░░░░  │  ← #aaff00 fill / #1a1a1a track
└────────────────────────────────────────┘
```

- Height: 56px for the title row + 4px for the progress bar = 60px total
- Pause button: 44×44px tap target, left-aligned
- Workout title: centered, 14px semibold, `#f5f5f5`, truncated to 1 line
- Elapsed timer: right-aligned, 13px mono, `#555555`
- Progress bar: 4px tall, full width, rounded, `#aaff00` fill — fills as exercises complete (not sets)
- Background: `rgba(10,10,10,0.92)` with `backdrop-filter: blur(12px)` — feels floating

### 4.2 Zone B — Scrollable Content

#### Exercise Context
```
  Exercise 2 of 5

  Bench Press

  [Chest]  [Triceps]  [Front Delt]
```

- "Exercise 2 of 5": 11px uppercase tracking-widest, `#555555`
- Exercise name: 26px font-black, `#f5f5f5`, 1–2 lines max
- Muscle group tags: small pills, `bg-[rgba(255,255,255,0.06)]`, 11px, `#888888`

#### Previous Performance Card
```
  ╔════════════════════════════════════════╗
  ║  Last session · 14 Jun               ↗ ║
  ║  3 × 8 reps · 60 kg                   ║
  ╚════════════════════════════════════════╝
```

- `rounded-2xl`, `border border-[rgba(255,255,255,0.06)]`, `bg-[rgba(170,255,0,0.04)]`
- Accent-tinted background (very subtle) to distinguish from the sets table
- "Last session · 14 Jun" — 11px, `#555555`
- "3 × 8 reps · 60 kg" — 13px semibold, `#f5f5f5`
- If no history: "No previous data — set your baseline today" in `#555555`
- If it's a PR attempt (current inputs exceed last session): replace card with PR nudge:
  `"↑ Beat your best — last time: 60 kg × 8"` in `#aaff00` tinted card

#### Sets Table
```
  Set    Previous      Status
  ────────────────────────────────
  ✓  1   60 kg × 8       ✓
  ●  2   60 kg × 8       ●  ← active
     3   60 kg × 8
```

- Column structure: `[32px] [flex-1] [40px]`
- Row height: 48px (all rows — including upcoming, for tap stability)
- Completed rows: `#555555` text, checkmark icon in `#aaff00`, subtle row background `rgba(170,255,0,0.04)`
- Active row: `border-l-2 border-[#aaff00]`, full `#f5f5f5` text, `bg-[rgba(255,255,255,0.03)]`
- Upcoming rows: `#3a3a3a` text, no interaction cue
- Checkmark animation on completion: scale 0→1 with spring easing, `#aaff00` fill

### 4.3 Zone C — Sticky Bottom Bar

```
  ┌───────────────────┬───────────────────┐
  │     WEIGHT        │      REPS         │
  │   [−]  60  [+]   │   [−]   8  [+]   │
  └───────────────────┴───────────────────┘
  ┌─────────────────────────────────────────┐
  │           Complete Set  →               │
  └─────────────────────────────────────────┘
  [ ← Dumbbell Row ]          [ Shoulder → ]
```

- Zone C sits on top of the keyboard when open — inputs never get covered
- Top section: two equal-width input controls separated by a 1px `#1a1a1a` divider
- Input control label: 10px uppercase, `#555555`
- Input control value: 28px font-black, `#f5f5f5`
- `[−]` / `[+]` buttons: 44×44px tap target, `#3a3a3a` icon — large for gym-gloved fingers
- CTA button: full-width, `rounded-2xl`, 52px height — largest touch target on screen
- Exercise nav bar: two ghost buttons, 13px, `#555555` — secondary, below the CTA

#### Weight Input Detail
- Increment step: **2.5 kg** (standard plate increment)
- Long-press `[+]` or `[−]`: accelerates to +5 kg per step after 500ms hold
- Tap value display: opens **numeric keyboard** (type=`decimal`, no alphabet)
- Units shown inline: "60 kg" — toggle between kg/lbs in user profile (not here)

#### Reps Input Detail
- Increment step: 1
- Tap value display: opens numeric keyboard (type=`number`)
- Range: 1–50 (clamp on input)

---

## 5. User Flow

```
[Workout List / Program]
        │
        ▼
[Confirm View]  ← workoutId, exercises, splitType loaded from server
 "Ready to start — Bench Press, 5 exercises"
        │
        ▼ tap "Start Workout" → createSession() INSERT
        │
        ▼
[Active Workout — Exercise 1]
        │
        ├─ Complete all sets ──────────────────────────────┐
        │  (rest timer between each)                        │
        │                                                   │
        ▼                                                   │
[→ Exercise 2 ... Exercise N]                              │
        │                                                   │
        │  last set of last exercise                        │
        │                                                   │
        ▼                                                   │
[Finish Confirm Dialog]                                    │
        │                                                   │
        ├─ "Keep Going" → back to active ◄─────────────────┘
        │
        ▼ "Finish Workout" → completeSession() UPDATE ended_at
        │
        ▼
[Workout Summary]
        │
        ▼ "Done" → /dashboard
```

**Pause path** (accessible at any point during active):
```
Pause button (header) → [Pause Overlay]
  ├─ "Resume" → back to active (timer resumes)
  └─ "Cancel Workout" → confirmation → /dashboard
```

---

## 6. Interaction Flow

### 6.1 Entering an Exercise

1. Exercise context animates in (slide up, 300ms)
2. Previous performance card fades in with 80ms delay
3. Sets table rows stagger in (60ms each)
4. Zone C inputs pre-fill from last session for this exercise:
   - Weight: last session weight for set 1
   - Reps: last session reps for set 1
   - If no history: workout template defaults
5. CTA label: **"Complete Set 1"**
6. Active row: set 1 highlighted

### 6.2 Completing a Set (non-last)

1. User adjusts weight/reps if needed (optional)
2. Taps **"Complete Set N"**
3. **Immediate feedback** (before network):
   - Set row N: checkmark animates in (spring, 200ms), row fades to muted state
   - Set row N+1: accent border slides in from left (150ms delay)
   - Zone C inputs: update to pre-fill values for set N+1
   - CTA: transitions to **"Complete Set N+1"**
4. `session_sets` INSERT fires in background (optimistic — no spinner)
5. **Rest Timer Overlay** slides up from bottom (300ms ease-out) if `restSec > 0`

**If INSERT fails** (background): row gets a subtle red indicator and sync is queued for retry. User never sees a blocking error mid-workout. (Sync queue: Sprint W9.)

### 6.3 Rest Timer Overlay

```
┌─────────────────────────────────────────┐
│                                         │
│               Resting                   │  ← 12px uppercase, #555555
│                                         │
│                 1:30                    │  ← 72px font-black, #f5f5f5
│                                         │
│        ████████████████░░░░░░░          │  ← countdown arc or bar, #aaff00
│                                         │
│      Next: Set 3 · 60 kg × 8           │  ← 13px, #555555
│                                         │
│      [−30s]              [+30s]         │  ← 44px tap targets
│                                         │
│  ┌───────────────────────────────────┐  │
│  │       Skip Rest — Start Now       │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

- Slides up over the active workout screen — **does not replace it**
- Background: `rgba(10,10,10,0.96)` — almost full blackout, timer is the only focus
- The **large number** is the most important element — 72px, center screen
- At 10 seconds remaining: number turns `#aaff00`, pulses once per second
- At 0: auto-dismiss the overlay → return to active state (same exercise, next set already ready)
- **Skip Rest**: dismisses overlay immediately, same result as auto-dismiss at 0
- `[−30s]` / `[+30s]`: adjusts the current countdown (caps at 10s minimum, 300s maximum)
- The elapsed timer in the header continues running through rest

### 6.4 Completing the Last Set of an Exercise (non-last exercise)

1. Set row checkmark animates in
2. Rest timer overlay appears (if `restSec > 0`)
3. After rest (or skip): overlay dismisses
4. CTA transitions to **"Next Exercise →"** (accent outline, not filled)
5. Exercise nav bar hides (no ambiguity about direction)
6. Tap "Next Exercise →":
   - Slide transition: current exercise slides left, next exercise slides in from right
   - New exercise context, previous performance, sets table animate in
   - Zone C inputs pre-fill for new exercise set 1
   - CTA returns to **"Complete Set 1"**

### 6.5 Completing the Last Set of the Last Exercise

1. Set row checkmark animates
2. Rest timer does **not** appear (no next set)
3. CTA becomes **"Finish Workout"** (full `#aaff00` fill — prominent color change)
4. A one-line hint appears above CTA: "All sets done — great work." (`#555555`)
5. Tap "Finish Workout" → `FinishConfirmDialog` slides up

### 6.6 Finish Confirm Dialog

```
  ╔════════════════════════════════════╗
  ║  Finish Workout?                   ║
  ║                                    ║
  ║  You completed 3 of 4 exercises.   ║
  ║  Finishing now will save your      ║
  ║  progress.                         ║
  ║                                    ║
  ║  [  Keep Going  ] [Finish Workout] ║
  ╚════════════════════════════════════╝
```

- Bottom sheet (not a modal) — slides up with 350ms ease-out
- Shows a real-time count of completed exercises vs. total — no filler copy
- **"Keep Going"**: dismiss sheet, return to exact exercise + set where the user was
- **"Finish Workout"**: `completeSession()` server action (writes `ended_at`), clears localStorage, transitions to summary

### 6.7 Workout Summary

```
  ✓  Workout Complete!

  Upper Body Push

  Duration     Volume        Sets
  38:24        4,240 kg      12 / 15

  ─────────────────────────────────
  Exercise Breakdown
  ─────────────────────────────────
  Bench Press         3×8  60 kg
  Overhead Press      3×8  40 kg
  Tricep Pushdown     3×12 25 kg

  [  Done — Go to Dashboard  ]
```

- PRs are highlighted inline: "Bench Press  3×8  ★ 62.5 kg  PR" in `#aaff00`
- Volume = sum of (weight × reps) across all completed sets
- Sets: completed / planned (e.g., 12/15 if user skipped an exercise)
- "Done" navigates to `/dashboard`, clears any session state

---

## 7. UX Recommendations

### 7.1 Smart Pre-fill Order

When a user arrives at a set, inputs should be pre-filled in this priority:

1. **Same exercise, same set number, last session** — most accurate baseline
2. **Same exercise, any previous set** — if set counts differ from last session
3. **Workout template defaults** (sets × reps from `workout_exercises`) — if no history at all
4. **Previous set in this session** — if this is set 3 and set 2 was already logged, carry it forward

Never leave weight at 0. A pre-filled default always beats an empty field.

### 7.2 Progressive Overload Nudge

When the inputs match or exceed the previous session for a set:
- Replace the Previous Performance card with a nudge: **"↑ Matching your best"** or **"↑ Beating your best"**
- Card background: `rgba(170,255,0,0.06)` — subtle green tint
- No popup, no modal. Just the card changes.

This is motivating without being intrusive.

### 7.3 PR Celebration

When a set is logged that beats the user's all-time best for this exercise:
- Brief full-screen flash: `rgba(170,255,0,0.08)` — 200ms, then fades
- The completed set row shows a `★ PR` badge in `#aaff00`
- No confetti, no full-screen overlay — premium restraint

### 7.4 The "Two-Tap Confirm" Principle

For a user who performs the same workout every week:
1. Arrive at set → inputs pre-filled from last session
2. Tap "Complete Set" — done.

Two taps per set. No typing, no adjustment needed. This is the golden path. Design every decision around making this golden path as frictionless as possible.

### 7.5 Rest Timer Auto-Start

Rest timer starts **automatically** after a set is completed — no extra "Start Rest" tap. The user can skip it, but the default behavior assumes they want to rest. This removes one tap from every set completion.

### 7.6 Keyboard Handling

When the user taps a weight or reps value to type directly:
- The numeric keyboard opens
- Zone C is already at the bottom — inputs are just above the keyboard
- Zone B content scrolls slightly to keep the active set row visible
- No layout jump, no content jumping behind keyboard

Use `inputMode="decimal"` for weight, `inputMode="numeric"` for reps. Never `type="number"` (poor mobile UX — no decimal on some keyboards).

### 7.7 Haptic Feedback (Mobile PWA / Native)

| Moment | Haptic |
|---|---|
| Set completed | Medium impact |
| Rest timer ends | Double light impact |
| PR achieved | Heavy impact + delay + medium impact |
| Exercise navigation | Light impact |

Haptic triggers use the Web Vibration API (`navigator.vibrate()`), wrapped in a try/catch (not available on iOS Safari without special conditions). Treat as progressive enhancement.

### 7.8 Unsaved Data Protection

If the user taps the browser back button or navigates away during an active session:
- Intercept navigation (use `beforeunload` / Next.js `router.beforePopState`)
- Show inline prompt: "Your session is in progress. Leave anyway?"
- Do not use a system `alert()` — show a tasteful in-page confirmation

### 7.9 First-Time Experience

On the very first workout session (no history anywhere):
- Previous Performance card shows: "First time — set your baseline" in `#555555`
- Template defaults fill the inputs
- No PR nudge (nothing to beat)
- Summary is extra congratulatory: "First workout logged! 🎉" — this one time only, an emoji is appropriate

### 7.10 Exercise Navigation — Intentional Friction

The "← Prev" / "Next →" exercise nav buttons (Zone C, below CTA) should have **slightly lower visual prominence** than the CTA. This is intentional:

- Large tap target (44px height) but `#3a3a3a` ghost text style
- Moving between exercises without completing sets should require an intentional tap, not an accidental one
- If the user navigates to a previous exercise that has completed sets, the sets remain completed — no data loss

---

## 8. Things to Avoid

### 8.1 Auto-advancing exercises
Never automatically move to the next exercise after the last set. The user must explicitly tap "Next Exercise". Auto-advance creates anxiety about missing the timer, and some users want to do extra sets.

### 8.2 Mandatory rest timers
The rest timer must always be skippable with one tap. Some users super-set. Some are in a hurry. Never block progress behind a countdown.

### 8.3 Small inputs in a table
Inline weight/reps inputs inside table cells have ~30px tap targets on mobile. Unacceptable. Zone C's dedicated input section solves this.

### 8.4 Weight field that opens a full-screen picker
Wheels, sliders, and pickers for weight input are slower than typing. They also feel patronizing to users who know exactly what they lifted. Use `[−]` / `[+]` for micro-adjustments and tap-to-type for everything else.

### 8.5 Blocking errors mid-workout
If a `session_sets` INSERT fails, do not show an error alert. The user is mid-exercise. Queue the retry silently. Only surface persistent errors (e.g., auth expired after 1+ hour session) via a non-blocking banner.

### 8.6 Losing state on refresh
localStorage already handles this from Sprint W2. The recovery hook (Sprint W8) must restore the exact exercise index, completed sets, and inputted values. Never lose a session.

### 8.7 Bottom navigation during session
The global nav (`/dashboard`, `/workouts`, `/body`) must be hidden while a session is active. A tab tap mid-session would be catastrophic. The header's pause button is the only exit.

### 8.8 Toast notifications for set completion
Set completion feedback must be **permanent and visible** — a checkmark in the row that stays. A toast that auto-dismisses is not feedback; it's noise. The user should be able to glance at the sets table and immediately know which sets they completed.

### 8.9 Decimal weight increments under 2.5 kg
While technically possible, 1.25 kg increments add noise without benefit. Most gyms stock 2.5 kg plates as the smallest unit. Match reality.

### 8.10 Full-screen overlays for every rest
If the user has `restSec = 0` on an exercise, show nothing. Do not show a "0 second rest timer". Not every exercise has programmed rest.

---

## 9. Future Improvements

These are not in scope for the current sprint sequence, but worth capturing for the roadmap.

### 9.1 Plate Calculator
After weight input: show a small chip indicating which plates to put on each side of a barbell. "60 kg → 2×10 + 1×5 per side." Removes mental arithmetic mid-lift.

### 9.2 RPE (Rate of Perceived Exertion) Logging
After completing a set, an optional 1–10 RPE slider appears for 1.5 seconds before auto-dismissing. If the user ignores it, no RPE is logged. This feeds into fatigue/load management in future analytics.

### 9.3 Exercise Swap
"Equipment not available?" — a swap button on the exercise header that allows replacing with an equivalent exercise. Particularly useful in commercial gyms.

### 9.4 Supersets
Group two exercises together so the rest timer alternates between them. Requires a schema-level `superset_group` field and a significant UI rethink — defer.

### 9.5 One-Rep Max Estimator
When a high-weight low-rep set is logged, show an estimated 1RM using the Epley formula. Contextual, educational, motivating.

### 9.6 Video Demonstrations
Icon button on the exercise name that opens a short form video of the exercise. Especially valuable for newer users.

### 9.7 Apple Watch / WearOS Companion
Rest timer on wrist. Haptic alert when rest ends. One-tap set confirmation from watch. Would require a companion app — long-term native roadmap item.

### 9.8 Barbell Mode vs. Machine Mode
Some exercises don't have a "weight" in the traditional sense (bodyweight, machine stack with no kg label, bands). A mode flag per exercise that changes the input to "bodyweight" / "stack" / "band level". Better than forcing kg input for a dip.

### 9.9 Session Notes
A free-text field at the end of the session summary screen: "Anything to note about today?" Stored as `notes` on `workout_sessions`. Surfaced in the history detail view.

### 9.10 Workout "Feel" Rating
Post-workout: a 1–5 star or emoji scale for "How did this session feel?" Fast, optional, single-tap. Feeds into a future session quality trend on the dashboard.

---

*Document version: 1.0 — Design Sprint only. No implementation commitments. Revisit after Sprint W4 to validate against actual session state management experience.*
