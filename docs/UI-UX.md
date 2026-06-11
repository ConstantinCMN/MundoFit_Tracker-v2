# MundoFit Tracker V2 — UI/UX

## Design Philosophy

MundoFit Tracker V2 feels like a native mobile app running in a browser. Every interaction is tactile, snappy, and premium. The dark theme and neon green accent communicate performance and focus. Animations reinforce spatial relationships — elements slide, fade, and spring; they never pop in abruptly.

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#0A0A0A` | Page background |
| `--bg-surface` | `#111111` | Card background |
| `--bg-elevated` | `#1A1A1A` | Input fields, modals, bottom sheets |
| `--bg-overlay` | `#222222` | Hover states, selected items |
| `--accent` | `#AAFF00` | Primary accent — neon green |
| `--accent-dim` | `#88CC00` | Pressed / inactive accent |
| `--accent-glow` | `rgba(170,255,0,0.15)` | Glow effects behind accent elements |
| `--text-primary` | `#F5F5F5` | Headings, primary labels |
| `--text-secondary` | `#888888` | Subtitles, metadata |
| `--text-muted` | `#555555` | Placeholders, disabled text |
| `--border` | `#2A2A2A` | Card borders, dividers |
| `--border-accent` | `rgba(170,255,0,0.4)` | Focused input borders |
| `--danger` | `#FF4444` | Delete, error states |
| `--warning` | `#FF9900` | Warnings, approaching limits |
| `--success` | `#AAFF00` | Same as accent — confirmations |
| `--info` | `#4499FF` | Informational badges |

### Typography

| Token | Value | Usage |
|---|---|---|
| Font family | `Inter` (variable) | All text |
| `--text-xs` | `11px / 1.4` | Labels, badges |
| `--text-sm` | `13px / 1.5` | Body small, captions |
| `--text-base` | `15px / 1.6` | Body default |
| `--text-lg` | `17px / 1.5` | Section titles |
| `--text-xl` | `20px / 1.4` | Page headings |
| `--text-2xl` | `24px / 1.3` | Hero numbers (weight, calories) |
| `--text-3xl` | `32px / 1.2` | Large metric displays |
| `--font-normal` | `400` | Body text |
| `--font-medium` | `500` | Labels, buttons |
| `--font-semibold` | `600` | Section headings |
| `--font-bold` | `700` | Hero values, CTAs |

### Spacing Scale (8px base)
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`

### Border Radius
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Badges, tags |
| `--radius-md` | `12px` | Input fields, small cards |
| `--radius-lg` | `16px` | Cards, modals |
| `--radius-xl` | `24px` | Bottom sheets, large panels |
| `--radius-full` | `9999px` | Pills, avatar circles |

### Shadows / Glow Effects
```css
--shadow-card:    0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4);
--shadow-modal:   0 20px 60px rgba(0,0,0,0.8);
--glow-accent:    0 0 20px rgba(170,255,0,0.25), 0 0 40px rgba(170,255,0,0.1);
--glow-accent-sm: 0 0 10px rgba(170,255,0,0.2);
```

---

## Layout

### Mobile-First Breakpoints
```
Base (default): 0–639px   → Mobile layout  (primary target)
sm:             640–767px  → Large phone / small tablet
md:             768–1023px → Tablet (adapted mobile layout)
lg:             1024px+    → Desktop (centered max-w-md container)
```

On desktop, the app is centered in a `max-w-[430px]` container with subtle side padding — it looks like a phone mockup on a dark desktop background, reinforcing the app-like feel.

### Shell Structure

```
┌─────────────────────────────┐
│  Header (fixed top)         │  48px
│  • Back button / page title │
│  • Right action (+ / edit)  │
├─────────────────────────────┤
│                             │
│  Page Content               │  flex-1, overflow-y-auto
│  (scrollable)               │  padding-bottom: 80px
│                             │
├─────────────────────────────┤
│  Bottom Navigation (fixed)  │  64px + safe-area-inset-bottom
│  Dashboard│Weight│Workouts  │
│  Calories│Profile           │
└─────────────────────────────┘
```

### Bottom Navigation Icons
| Tab | Icon | Label |
|---|---|---|
| Dashboard | Home | Dashboard |
| Weight | Scale | Weight |
| Workouts | Dumbbell | Workouts |
| Calories | Flame | Calories |
| Profile | User | Profile |

Active tab: `--accent` color fill + neon glow underline. Inactive: `--text-muted`.

---

## Animation Guidelines (Framer Motion)

### Principles
1. **Purposeful** — animations communicate something (state change, hierarchy, feedback).
2. **Fast** — most transitions complete in 150–300 ms. Nothing feels sluggish.
3. **Spring-based** — use `spring` for natural feel; `tween` with `easeOut` for slides.
4. **Consistent** — the same interaction type always animates the same way.

### Preset Tokens
```ts
const transitions = {
  // For cards appearing on screen
  fadeUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  // For list items (staggered)
  listItem: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  // For pages sliding in from right
  pageSlide: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  // For bottom sheets
  bottomSheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { type: 'spring', damping: 30, stiffness: 300 }
  },
  // For buttons / pressable items
  tap: { scale: 0.96, transition: { duration: 0.1 } }
}
```

### Delete / Undo Flow Animation
1. User taps delete → confirmation bottom sheet springs up.
2. User confirms → item slides left and fades out (x: -40, opacity: 0, height: 0) in 300 ms.
3. Toast appears at bottom with undo button (5-second countdown ring).
4. If undo tapped → item springs back in (reverse of step 2).

---

## Component Patterns

### Card
```
┌──────────────────────────────┐
│ ●  Card Title          →     │  Icon + title + optional chevron
│    Subtitle / value          │
└──────────────────────────────┘
```
Background: `--bg-surface`. Border: `1px solid --border`. Radius: `--radius-lg`. Press state: background shifts to `--bg-overlay`.

### Stat Card (Dashboard)
```
┌──────────────────────────────┐
│  LABEL                       │
│  123.4                    kg │  Large number + unit
│  ↑ +0.8 this week            │  Trend indicator (green/red)
└──────────────────────────────┘
```

### Input Field
- Background: `--bg-elevated`
- Border: `1px solid --border`, focus → `1px solid --border-accent` + `--glow-accent-sm`
- Label floats above on focus / when filled (animated)
- Error state: border `--danger`, error text below in red

### Primary Button
- Background: `--accent` (#AAFF00)
- Text: `#0A0A0A` (dark text on bright background)
- Height: 52px on mobile, border-radius: `--radius-md`
- Press: `scale(0.97)` + 20ms
- Loading state: spinner replaces label

### Secondary Button
- Background: transparent
- Border: `1px solid --border`
- Text: `--text-primary`
- Press: background fades to `--bg-overlay`

### Danger Button
- Background: `rgba(255,68,68,0.1)`
- Border: `1px solid rgba(255,68,68,0.4)`
- Text: `--danger`

### Toast / Snackbar
Appears at the bottom (above nav), slides up. Auto-dismisses after 4 seconds. Undo button stops timer and reverses action.

### Bottom Sheet
Used for: confirmations, add-entry forms, filter menus, exercise details.
- Overlay: `rgba(0,0,0,0.7)` with blur `backdrop-blur-sm`
- Handle bar at top center
- Spring animation (see transitions.bottomSheet)
- Swipe down to dismiss

### Progress Ring
Circular SVG progress indicator. Used for: goal progress, TDEE target display on Calories screen.
- Track: `--bg-elevated` (dark circle)
- Fill: `--accent` with a trailing gradient
- Animated via Framer Motion `pathLength`

---

## Screen Specifications

### Auth Screens

**Login / Register**
- Full-screen dark background with subtle animated gradient mesh.
- App logo + tagline at top.
- Card-style form in center.
- Toggle between Login and Register with tab animation.
- Social sign-in reserved for V2.1.

### Onboarding
- One question per full screen.
- Progress bar at top (step N of 7).
- Large headline question, subtitle/hint below.
- Selection cards for multiple-choice (gender, activity, location, goal) — selected card gets `--accent` border + glow.
- Numeric inputs for age, height, weight with large digit display.
- Previous / Next navigation — swipe gestures supported.

### Dashboard
```
┌────────────────────────────┐
│  Good morning, Ana         │
│  Wednesday, June 11        │
├────────────────────────────┤
│  [TDEE Target Card]        │
│  Target: 2,200 kcal/day    │
│  P 165g  C 248g  F 73g     │
├────────────────────────────┤
│  Weight    BMI   Streak    │  3-column stat row
│  72.3 kg   22.4   14 days  │
├────────────────────────────┤
│  Active Goal               │  Card
│  Lose 5kg by August        │
│  ████████░░░░  64%         │
├────────────────────────────┤
│  Last Workout              │  Card
│  Push Day · Yesterday      │
│  6 exercises · 45 min      │
├────────────────────────────┤
│  Quick Log  [+Weight]      │  Horizontal scroll chips
│  [+Photo]                  │
└────────────────────────────┘
```
Dashboard greeting uses `profiles.first_name`.

### Weight Tracking
- Chart (7d / 30d / 90d / All) — line chart with area fill in accent color.
- Log entry button (FAB, bottom right, accent colored).
- List of recent entries below chart — swipeable for delete.
- BMI indicator badge.

### Measurements
- Segmented control: Overview / Log / History.
- Overview: human body silhouette (same SVG as body map) with measurement labels at measurement points.
- Log: form with all measurement fields (only fill what you know).
- History: table / chart per measurement.

### Progress Photos
- Grid view (2 columns) sorted by date.
- Tap photo → full-screen viewer with swipe between photos.
- Long-press → context menu (Delete, Add note).
- "Compare" mode: split-screen two photos side by side.
- Add button opens camera or photo picker.

### Calories Calculator
- Top: TDEE value + daily calorie target (large number display).
- Macro targets row: Protein / Carbs / Fat in grams — displayed as progress bars filled to their daily target.
- TDEE breakdown card: BMR, activity multiplier, goal adjustment (shown as a readable formula).
- TDEE settings accessible from header icon (manual override, macro split percentage sliders).
- Food diary logging is deferred to V2.1 — this screen is read-only targets display.

### Goals
- Active goals list — progress bar per goal.
- Completed / abandoned goals in collapsed section.
- Tap goal → detail screen with history chart.
- FAB to add goal.

### Workouts — Hub

```
┌─────────────────────────────┐
│  [Body Map]                 │  Interactive SVG, ~300px tall
│  Front ●  Back ○  (toggle)  │
│  Tap muscles to filter      │
├─────────────────────────────┤
│  Quick Actions              │
│  [Start Workout] [Generator]│
├─────────────────────────────┤
│  My Workouts                │
│  (templates list)           │
├─────────────────────────────┤
│  Recommended for You        │
│  (based on goal + location) │
└─────────────────────────────┘
```

### Body Map

The body map is an SVG with individually clickable muscle group paths.

- **Male SVG** shown for male profile, **Female SVG** for female profile.
- Front / Back toggle switches between two SVG layers.
- Resting muscle color: `#2A2A2A` (dark grey).
- Hovered muscle: `#444444`.
- Selected muscle: `#AAFF00` (accent) with glow filter.
- Multi-select enabled — user can tap multiple muscles.
- Selected muscles animate in with a brief `scale(1.02)` spring pulse.
- Below the map: selected muscle chips in a horizontal scroll row.
- "Filter exercises" button updates the exercise library list based on selection.

**Muscle group to SVG path mapping** covers all groups listed in Database.md.

### Exercise Library
- Search bar at top.
- Filter chips: muscle group (from body map selection), equipment, difficulty.
- Exercise cards: name, primary muscle badge, equipment icons.
- Tap → exercise detail bottom sheet: description, muscles worked (highlighted on mini body map), animated demo placeholder.

### Workout Generator
Multi-step form:
1. Select muscles (reuses body map component).
2. Select location (Gym / Home).
3. Select duration (30 / 45 / 60 / 90 min).
4. Select difficulty.
5. → Generated workout preview with exercises list.
6. User can swap individual exercises or regenerate.
7. Save as template or Start now.

### Active Workout Session
- Exercise list at top.
- Current exercise highlighted.
- Set logger: reps / weight input row per set.
- Rest timer: full-screen countdown overlay when rest is active (animated circle, neon green).
- "Finish Workout" button at bottom → summary screen.

### Workout History
- Timeline list sorted by date.
- Each entry: name, date, duration, total volume, muscles worked (mini chip list).
- Tap → session detail with all sets logged.

### Profile
Sections:
1. Avatar, first name, and display name (editable inline).
2. Physical Stats — all onboarding values, editable.
3. Goals — shortcut to goals module.
4. Preferences — locale, unit system.
5. Account — email, change password, sign out.
6. Danger Zone — delete account.

---

## Micro-Interactions Checklist

- [ ] All buttons: `whileTap={{ scale: 0.96 }}` via Framer Motion.
- [ ] Cards: subtle border glow on press.
- [ ] Input focus: border transitions to accent + glow in 150ms.
- [ ] Metric numbers (weight, calories): animate with `useSpring` when value changes.
- [ ] Progress bars: animate width from 0 on mount.
- [ ] Page transitions: slide + fade (see `pageSlide` preset).
- [ ] Delete: slide-out animation before removal.
- [ ] Undo toast: circular countdown progress ring.
- [ ] Body map muscle select: spring pulse + glow on selection.
- [ ] Bottom nav: active icon bounces slightly on tab switch.
- [ ] Rest timer: circular countdown with smooth arc animation.
- [ ] Onboarding steps: horizontal slide between questions.

---

## Accessibility

- All interactive elements: minimum 44×44 px touch target.
- Color is never the only differentiator (icons + labels always accompany color coding).
- `aria-label` on all icon-only buttons.
- Reduced motion: wrap all Framer Motion variants with `useReducedMotion()` check — fall back to instant transitions.
- Focus rings visible (overridden to use `--border-accent` outline instead of browser default).
- Form errors: linked via `aria-describedby`.
