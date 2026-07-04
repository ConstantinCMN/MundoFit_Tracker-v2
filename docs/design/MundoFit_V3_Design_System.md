# MundoFit Design System v1.0

**Status:** Official · **Version:** 1.0.0 · **Date:** 2026-06-30  
**Maintained by:** MundoFit Engineering & Product

> This document is the single source of truth for the visual, interaction, and component design language of MundoFit Tracker V3. Every UI decision — spacing, colour, animation, component — derives from this system. New contributors must read this document before writing any interface code.

---

## Table of Contents

1. [Vision](#1-vision)
2. [Brand Identity](#2-brand-identity)
3. [Non-Negotiable Rules](#3-non-negotiable-rules)
4. [Design Principles](#4-design-principles)
5. [Color System](#5-color-system)
6. [Typography](#6-typography)
7. [Layout System](#7-layout-system)
8. [Grid & Spacing](#8-grid--spacing)
9. [Border Radius](#9-border-radius)
10. [Elevation & Shadows](#10-elevation--shadows)
11. [Iconography](#11-iconography)
12. [Hero Background System](#12-hero-background-system)
13. [SVG Body System](#13-svg-body-system)
14. [Workout Experience](#14-workout-experience)
15. [Dashboard Experience](#15-dashboard-experience)
16. [Accessibility](#16-accessibility)
17. [Motion & Animations](#17-motion--animations)
18. [Component Overview](#18-component-overview)
19. [Future Premium Experience](#19-future-premium-experience)
20. [AI Development Rules](#20-ai-development-rules)
21. [Do / Don't](#21-do--dont)
22. [References](#22-references)

---

## 1. Vision

MundoFit is a **premium dark-mode fitness companion** designed for users who train seriously. The product must feel like the app that serious athletes actually want on their phone — not a wellness diary or a calorie counter.

The design ethos is **focused intensity**: every screen should remove friction from the act of training. The interface recedes when the user is working and resurfaces exactly when they need it.

### Design DNA

| Quality | Expression |
|---|---|
| **Premium** | Dark backgrounds, neon accent, no visual clutter |
| **Intense** | High contrast, bold weights, sharp hierarchy |
| **Focused** | Minimal chrome; content never competes with itself |
| **Trustworthy** | Data is always correct, always accessible, never hidden |
| **Fast** | Animations respect 60 fps; no layout shifts; no spinners unless necessary |

### Reference Image

The official V3 design reference is available at:

```
docs/design/mundofit-v3-design-system.png
```

This image is the visual contract for the V3 release. Any component that deviates from it requires design review.

---

## 2. Brand Identity

### App Name

**MundoFit** — one word, two capitals: `M` and `F`. Never `Mundofit`, `mundo fit`, or `MUNDOFIT`.

### Tagline

_Train Smart. Track Everything._

### Accent Color

The MundoFit signature color is **Electric Lime** (`#aaff00`). This color is the brand's primary identifier. It appears on:

- All primary CTAs
- Active navigation state
- Progress fills
- Data highlights
- Key metric values

### Voice

| Context | Tone |
|---|---|
| Workout screen | Terse, action-oriented |
| Dashboard | Motivating, personal |
| Error states | Direct, never apologetic |
| Empty states | Encouraging, not sad |
| Onboarding | Confident, warm |

### Supported Locales

| Code | Language |
|---|---|
| `en` | English |
| `ro` | Romanian |
| `es` | Spanish |

All UI strings are managed in `messages/{locale}.json`.

---

## 3. Non-Negotiable Rules

These rules cannot be overridden by individual screens or features. Any code that violates them must be fixed before merge.

1. **Dark mode only.** There is no light mode. There is no system-preference toggle. The app background is always `#0a0a0a`.

2. **430 px max width.** The app container never exceeds `430px`. Centered on desktop. Never full-width on a 1440px screen.

3. **Accent is `#aaff00`.** No tints, no shades, no substitutes for the primary accent. `--accent-dim: #88cc00` is used only for gradient tails and hover states.

4. **Inter only.** No other typefaces. No system fonts in rendered UI (system fonts are a fallback only).

5. **No pure white.** The lightest text color is `#f5f5f5`. White (`#ffffff`) does not appear in the UI.

6. **Active state is accent, not bright white.** Icons, labels, and indicators in the active state use `#aaff00`, never white or blue.

7. **No borders on cards.** Cards use background-color elevation, not strokes. Exceptions: subtle `rgba(255,255,255,0.06)` for inner dividers and session list rows.

8. **No shadows for decoration.** Shadows exist to convey elevation (modal, dropdown). They are never added for aesthetics on flat surfaces.

9. **Motion under 500 ms.** No animation exceeds 500ms. The standard fade-up is 450ms.

10. **Session screen is chrome-free.** The workout session layout (`(session)` route group) has no AppShell header, no BottomNav. It is a standalone full-screen experience.

---

## 4. Design Principles

### 1. Hierarchy First

Every screen must have exactly one visual entry point. The eye should never wonder where to look first. Achieve this through:

- Size contrast (display vs. body vs. label)
- Color contrast (accent vs. muted)
- Spacing contrast (generous vs. tight)

### 2. Content, Not Chrome

Navigation and system UI should not compete with workout data. The header is 48px. The bottom nav is 64px (+ safe area). Everything else is content.

### 3. Density with Clarity

MundoFit is data-heavy. Fitness data must be dense without feeling cramped. Achieve density through:

- Consistent `px-5` horizontal padding (20px)
- `space-y-7` between dashboard sections (28px)
- 8px micro-gaps within a section

### 4. Confidence, Not Delight

The interaction model is confident and direct. Animations convey state change, not entertainment. A button tap should feel immediate and certain — not bouncy or playful.

### 5. Accessibility Is Not Optional

WCAG AA minimum for all text. Interactive targets minimum 44×44px. Screen reader labels on all icon-only buttons.

---

## 5. Color System

### Tokens

All color values are defined as CSS custom properties in `app/globals.css` and extended into Tailwind in `tailwind.config.ts`.

```css
:root {
  /* Backgrounds — four elevation levels */
  --bg-base:     #0a0a0a;  /* Page background */
  --bg-surface:  #111111;  /* Cards, sheets */
  --bg-elevated: #1a1a1a;  /* Input fields, inner cards */
  --bg-overlay:  #222222;  /* Dropdowns, modals */

  /* Accent */
  --accent:      #aaff00;           /* Electric Lime — primary brand color */
  --accent-dim:  #88cc00;           /* Dimmed — gradients, hover states */
  --accent-glow: rgba(170,255,0,0.15); /* Glow fill behind accent elements */

  /* Text */
  --text-primary:   #f5f5f5;  /* Headings, primary content */
  --text-secondary: #888888;  /* Labels, secondary content */
  --text-muted:     #555555;  /* Placeholders, timestamps, captions */

  /* Borders */
  --border:        #2a2a2a;            /* Default dividers */
  --border-accent: rgba(170,255,0,0.4); /* Accent-tinted borders */

  /* Semantic */
  --danger:  #ff4444;  /* Destructive actions, errors */
  --warning: #ff9900;  /* Warnings */
  --success: #aaff00;  /* Success states (same as accent) */
  --info:    #4499ff;  /* Informational */
}
```

### Background Elevation Scale

```
z-layer  token           hex        use
───────  ──────────────  ─────────  ─────────────────────────────────
0        --bg-base       #0a0a0a    Page — body background
1        --bg-surface    #111111    Cards, list items, workout tiles
2        --bg-elevated   #1a1a1a    Input fields, inner card sections
3        --bg-overlay    #222222    Dropdown menus, modals, drawers
```

### Accent Usage

| Context | Value |
|---|---|
| CTA button fill | `#aaff00` |
| CTA button text | `#0a0a0a` (black on lime) |
| Active nav icon | `#aaff00` |
| Progress bar fill | `#aaff00` |
| Metric highlights | `#aaff00` |
| Glow effect background | `rgba(170,255,0,0.12–0.15)` |
| Accent ring border | `rgba(170,255,0,0.35)` |
| Icon drop-shadow (active nav) | `rgba(170,255,0,0.7)` — `drop-shadow` |
| Gradient tail | `#88cc00` |

### Text Contrast

| Token | Hex | On `#0a0a0a` | Use |
|---|---|---|---|
| `--text-primary` | `#f5f5f5` | ~18.7:1 | Body text, headings |
| `--text-secondary` | `#888888` | ~5.5:1 | Labels, subtitles |
| `--text-muted` | `#555555` | ~2.6:1 | Captions, timestamps (non-critical) |
| `--accent` | `#aaff00` | ~12.9:1 | Active indicators |

> **Note:** `--text-muted` does not meet WCAG AA at 4.5:1 for normal text. Use it only for non-essential information at 11px or smaller. For interactive labels, use `--text-secondary` or `--text-primary`.

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--danger` | `#ff4444` | Delete, cancel, error |
| `--warning` | `#ff9900` | Caution, overdue, near limit |
| `--success` | `#aaff00` | Completed, saved, confirmed |
| `--info` | `#4499ff` | Tips, informational badges |

---

## 6. Typography

### Typeface

**Inter** — loaded via `next/font/google`, subset `latin`, display `swap`.

```typescript
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

Inter is applied as the CSS variable `--font-inter`. The Tailwind `sans` family resolves to `['var(--font-inter)', 'system-ui', 'sans-serif']`.

### Type Scale

All sizes are defined in `tailwind.config.ts` with explicit line heights.

| Class | Size | Line Height | Weight | Use |
|---|---|---|---|---|
| `text-xs` | 11px | 1.4 | 500–700 | Labels, chips, micro-copy |
| `text-sm` | 13px | 1.5 | 400–700 | Body text, list items, descriptions |
| `text-base` | 15px | 1.6 | 400–600 | Standard body, header titles |
| `text-lg` | 17px | 1.5 | 600–700 | Subheadings, modal titles |
| `text-xl` | 20px | 1.4 | 700–900 | Section titles |
| `text-2xl` | 24px | 1.3 | 700–900 | Screen titles |
| `text-3xl` | 32px | 1.2 | 900 | Hero numbers, workout names |

### Font Weights

MundoFit uses a compressed weight range for intensity:

| Weight | Tailwind | Use |
|---|---|---|
| 400 | `font-normal` | Secondary body text only |
| 500 | `font-medium` | Navigation labels |
| 600 | `font-semibold` | Card titles, header title |
| 700 | `font-bold` | Buttons, section headers |
| 900 | `font-black` | Hero text, CTAs, exercise names |

### Typography Patterns

**Page title (header bar):**  
`text-[15px] font-semibold text-[#f5f5f5]`

**Section heading:**  
`text-[11px] font-semibold uppercase tracking-widest text-[#444444]`

**Hero greeting:**  
`text-[22px] font-black leading-tight tracking-tight text-[#f5f5f5]`

**Workout name (session):**  
`text-[26px] font-black leading-tight text-[#f5f5f5]`

**Data metric:**  
`text-3xl font-black text-[#aaff00]`

**Caption / timestamp:**  
`text-[10px] font-semibold uppercase tracking-widest text-[#444444]`

### Letter Spacing

- Section labels and status chips: `tracking-widest` (0.1em)
- Hero headings: `tracking-tight` (-0.025em)
- All other text: default (`tracking-normal`)

---

## 7. Layout System

### App Container

All content is wrapped in `.app-container`, which constrains width to 430px (iPhone 14 Pro Max width) and centers it on larger screens.

```css
.app-container {
  width: 100%;
  max-width: 430px;
  margin-left: auto;
  margin-right: auto;
}
```

### Route Groups

Next.js App Router route groups define which chrome is shown.

| Route Group | Path Pattern | Chrome |
|---|---|---|
| `(app)` | `/dashboard`, `/workouts`, `/body`, etc. | AppShell: Header + BottomNav |
| `(auth)` | `/login`, `/register` | No chrome |
| `(onboarding)` | `/onboarding` | No chrome |
| `(session)` | `/workouts/session` | No chrome — standalone full-screen |

### AppShell

```
┌─────────────────────────────────────┐
│  Header (48px, fixed, z-40)         │
├─────────────────────────────────────┤
│                                     │
│  Main (flex-1, overflow-y-auto)     │
│  paddingTop: 48px                   │
│  paddingBottom: 64px + safe-area    │
│                                     │
│  ···content···                      │
│                                     │
├─────────────────────────────────────┤
│  BottomNav (64px, fixed, z-40)      │
│  + env(safe-area-inset-bottom)      │
└─────────────────────────────────────┘
```

```tsx
// app-shell.tsx
<div className="relative min-h-dvh bg-[#0a0a0a]">
  <div className="app-container flex min-h-dvh flex-col">
    <Header />
    <main
      style={{
        paddingTop: '48px',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {children}
    </main>
    <BottomNav />
  </div>
</div>
```

### Session Layout (Standalone)

The workout session has no AppShell. It occupies the full dynamic viewport.

```
┌─────────────────────────────────────┐
│  Zone A — Session Header (56px)     │  ← flex-none, backdrop-blur-xl
├─────────────────────────────────────┤
│  Progress Bar (8px)                 │  ← flex-none sibling (outside header)
├─────────────────────────────────────┤
│                                     │
│  Zone B — Scrollable Content        │  ← flex-1, overflow-y-auto
│                                     │
├─────────────────────────────────────┤
│  Zone C — Sticky Bottom Bar         │  ← flex-none
│  (CTA + nav)                        │
└─────────────────────────────────────┘

height: calc(100dvh - env(safe-area-inset-bottom, 0px))
```

### Header

```
height:     48px (h-12)
position:   fixed, top-0, left-0, right-0
z-index:    40
background: #0a0a0a / 95% opacity + backdrop-blur-md
border:     bottom 1px #2a2a2a

Content (inside .app-container):
  Left:   Back button (w-8) — ChevronLeft, 20px, shown on nested routes
  Center: Page title (text-[15px] font-semibold)
  Right:  Reserved slot (w-8)
```

### Bottom Navigation

```
height:     64px + safe-area-inset-bottom
position:   fixed, bottom-0, left-0, right-0
z-index:    40
background: #0a0a0a / 95% opacity + backdrop-blur-md
border:     top 1px #2a2a2a

Tabs: Dashboard · Weight · Body · Calories · Profile
Icon size: 22px
Active:   color #aaff00, strokeWidth 2.5, drop-shadow 0 0 6px rgba(170,255,0,0.7)
Inactive: color #555555, strokeWidth 1.75
Label:    text-[10px] font-medium
```

---

## 8. Grid & Spacing

### Horizontal Padding

| Context | Value | Tailwind |
|---|---|---|
| Default page content | 20px | `px-5` |
| Header / nav | 16px | `px-4` |
| Session content | 20px | `px-5` |

### Vertical Spacing

| Context | Value | Tailwind |
|---|---|---|
| Between dashboard sections | 28px | `space-y-7` |
| Section top padding | 24px | `pt-6` |
| Hero section top | 24px | `pt-6` |
| Between cards | 16px | `gap-4` or `space-y-4` |
| Within a card | 12–16px | `p-4` or `p-3` |
| Between label + value | 4–6px | `gap-1` / `mb-1.5` |

### Spacing Scale (Tailwind defaults in use)

| Tailwind | px | Use |
|---|---|---|
| `gap-0.5` | 2px | Tight label + icon pairs |
| `gap-1` | 4px | Icon + label |
| `gap-2` | 8px | Small card content |
| `gap-3` | 12px | Between rows within a card |
| `gap-4` | 16px | Between cards |
| `gap-5` | 20px | Horizontal padding |
| `gap-6` | 24px | Header bottom margin, section gaps |
| `gap-7` | 28px | Section-level spacing |

### Touch Target Minimum

All interactive elements must meet **44×44px** minimum tap area. Achieved with padding or explicit `h-11 w-11` (44px) or `h-12 w-12` (48px).

---

## 9. Border Radius

### Scale

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `--radius-sm` | 8px | `rounded-lg` | Small chips, tags, toggle pills |
| `--radius-md` | 12px | `rounded-xl` | Input fields, secondary buttons, small cards |
| `--radius-lg` | 16px | `rounded-2xl` | Primary cards, CTAs, modals |
| `--radius-xl` | 24px | `rounded-3xl` | Large feature cards, hero blocks |
| `--radius-full` | 9999px | `rounded-full` | Pills, avatars, nav icons, progress bars |

### Usage Guide

```
8px  (rounded-lg):
  - segmented control tabs (workout type pills)
  - tool buttons within cards
  - small badge/chip components

12px (rounded-xl):
  - weight input fields
  - secondary navigation items
  - quick-link cards on dashboard

16px (rounded-2xl):
  - primary workout cards
  - CTA buttons (h-[52px])
  - session set table
  - overlay sheets (modal body)

24px (rounded-3xl):
  - hero motivation card
  - exercise preview block

9999px (rounded-full):
  - avatar ring
  - active nav indicator
  - progress bar track and fill
  - muscle group chips
  - split type badge
```

---

## 10. Elevation & Shadows

MundoFit uses **background color elevation** as the primary depth signal. Box-shadows are used sparingly — only for modals, glows, and the avatar ring.

### Elevation by Background

```
Layer 0 — base   (#0a0a0a)  — page background, nav bars
Layer 1 — surface (#111111)  — dashboard cards, list items
Layer 2 — elevated (#1a1a1a) — input fields, inner card rows
Layer 3 — overlay (#222222)  — modals, drawers, dropdown menus
```

### Shadow Tokens

```css
/* Subtle depth for surface-level cards */
--shadow-card: 0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4);

/* Deep modal shadow */
--shadow-modal: 0 20px 60px rgba(0,0,0,0.8);

/* Electric lime glow (avatar, active elements) */
--glow-accent:    0 0 20px rgba(170,255,0,0.25), 0 0 40px rgba(170,255,0,0.1);
--glow-accent-sm: 0 0 10px rgba(170,255,0,0.2);
```

### Glow Usage

The accent glow is used exclusively on accent-colored elements to reinforce the brand energy:

- Avatar initials ring
- CTA button (on hero-level screens)
- Active icon (BottomNav, `drop-shadow-[0_0_6px_rgba(170,255,0,0.7)]`)

The ambient background glow (`absolute -inset-2 rounded-full bg-[#aaff00] opacity-[0.12] blur-xl`) appears behind the avatar to create a subtle halo. It is not used elsewhere in the standard UI.

### Backdrop Blur

`backdrop-blur-md` is used on the header and bottom nav to allow the underlying content to bleed through during scroll. This creates depth without requiring an opaque bar.

> **Warning:** Do not add `overflow-hidden` or `border-radius` to elements that are direct children of a `backdrop-filter` parent. This triggers a WebKit compositing bug that makes backgrounds invisible on iOS Safari. If a rounded bar is needed inside a backdrop-blur element, move it outside as a flex sibling.

---

## 11. Iconography

### Library

**Lucide React** — version pinned in `package.json`.

Lucide is the sole icon library. Do not import icons from any other source.

```typescript
import { Home, Scale, PersonStanding, Flame, User } from 'lucide-react';
```

### Sizing

| Context | Size | StrokeWidth |
|---|---|---|
| Bottom nav (inactive) | 22px | 1.75 |
| Bottom nav (active) | 22px | 2.5 |
| Header back button | 20px | 2.0 |
| Card action icons | 18px | 1.5–2.0 |
| Button-embedded icons | 16px | 1.5–2.0 |
| Pause/play in session | 15–16px | 1.75 |

### Color

| State | Color |
|---|---|
| Active | `#aaff00` |
| Default | `#f5f5f5` |
| Secondary | `#888888` |
| Muted / disabled | `#555555` |
| Danger | `#ff4444` |

### Icon Buttons

All icon-only buttons must have an `aria-label`. Minimum touch area: 44×44px.

```tsx
<button
  type="button"
  onClick={...}
  className="flex h-11 w-11 items-center justify-center rounded-full
             border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]
             active:bg-[rgba(255,255,255,0.08)]"
  aria-label="Pause workout"
>
  <Pause size={16} color="#f5f5f5" />
</button>
```

---

## 12. Hero Background System

The MundoFit dashboard hero communicates the user's identity and goal at a glance.

### Structure

```
Avatar ring (56×56px)
  └── Outer glow layer — absolute, -inset-2, blur-xl, #aaff00 @ 12% opacity
  └── Ring border — border-2 rgba(170,255,0,0.35) + box-shadow glow-accent-sm
  └── Initial — text-[23px] font-black #aaff00

Greeting
  └── Date label — 10px, uppercase, tracking-widest, #444444
  └── Greeting + name — 22px, font-black, #f5f5f5 with accent name
  └── Motivational message — 13px, #555555

Status chips
  └── Training location chip
  └── Goal chip (with emoji)

Motivation card
  └── rounded-2xl, border rgba(170,255,0,0.12), bg rgba(170,255,0,0.03)
  └── Contains: Flame icon + goal-specific motivational text
```

### Greeting Logic

| Hour | Greeting |
|---|---|
| 0–11 | Morning greeting |
| 12–17 | Afternoon greeting |
| 18–23 | Evening greeting |

### Goal-Specific Content

Each user goal maps to a unique motivational message and emoji:

| Goal | Emoji |
|---|---|
| `lose_weight` | 🔥 |
| `build_muscle` | 💪 |
| `improve_endurance` | 🫀 |
| `stay_healthy` | 💚 |
| `athletic_performance` | 🏆 |

---

## 13. SVG Body System

The interactive body diagram is the gateway to the workout generation flow. It visualises which muscle groups a user is targeting.

### Files

```
public/anatomy/
  front.svg    — anterior body view (viewBox: 0 0 724 1448)
  back.svg     — posterior body view (viewBox: 0 0 724 1448)
```

Source: `HichamELBSI/react-native-body-highlighter` (MIT License).

### SVG Color Scheme

| Layer | Fill | Stroke | Stroke-Width |
|---|---|---|---|
| Body silhouette | Radial gradient `#282828 → #1a1a1a → #0f0f0f` | `#222222` | 1px |
| Muscle (unselected) | `rgba(255,255,255,0.14)` | `rgba(255,255,255,0.24)` | 0.5px |
| Muscle (selected) | `rgba(170,255,0,0.45)` | `rgba(170,255,0,0.7)` | 1px |
| Muscle (hover) | `rgba(170,255,0,0.25)` | `rgba(170,255,0,0.5)` | 0.7px |

### Muscle Data Attributes

Each muscle path carries a `data-muscle` attribute matching the exercise library's `muscle_groups` identifiers:

```svg
<path data-muscle="chest" d="..." />
<path data-muscle="abs" d="..." />
<path data-muscle="shoulders" d="..." />
```

### View Toggle

The `BodyHubClient` supports `front` and `back` view states. A segmented control switches between them with a `layoutId="body-hub-view-pill"` spring animation (stiffness 400, damping 36).

### Integration

The `MuscleMap` component accepts:
- `view: 'front' | 'back'`
- `selected: Set<MuscleId>`
- `onToggle: (id: MuscleId) => void`

Selected muscles drive the `SPLIT_MUSCLE_MAP` in `lib/workouts/split-types.ts`, which pre-selects muscle groups based on a training split (push, pull, legs, upper, lower, full).

---

## 14. Workout Experience

The workout experience encompasses: workout generation, active session, rest timer, exercise transition, pause, finish, and summary.

### Screen Flow

```
Body Hub (/body)
    │  muscle selection + split type
    ▼
Generator (/workouts/generator)
    │  phase: select → loading → preview → executing → complete
    ▼
[Session active — phase: executing]
    │
    ├── Rest overlay (modal, within executing phase)
    ├── Pause / Resume
    └── Complete → Summary (History + navigate away)
```

### Active Workout Layout (Executing Phase)

The executing phase of the generator renders within the `(app)` layout (AppShell present). The content area has a progress bar, pause control, and exercise set flow.

```
AppShell Header (48px)
─────────────────────
Progress Bar (8px, flex-none sibling)
─────────────────────
Content (flex-col, px-5, pt-5, pb-8, min-h-[calc(100vh-140px)])
  ├── Pause button (top right)
  ├── Exercise name (26px font-black)
  ├── Set info + difficulty badge
  ├── Set table (rows per set)
  ├── Weight / Reps input controls
  ├── Rest / Next hint
  └── CTA button (h-[52px], rounded-2xl)
─────────────────────
AppShell BottomNav (64px)
```

### Progress Bar

```tsx
{/* Track — flex sibling, inside px-5 container */}
<div className="mb-5 h-2 overflow-hidden rounded-full bg-[#2a2a2a]">
  <div
    className="h-full rounded-full bg-[#aaff00] transition-[width] duration-[250ms] ease-out"
    style={{ width: `${progressPct}%` }}
  />
</div>
```

- **Height:** 8px (`h-2`)
- **Track:** `#2a2a2a` — always visible at 0%
- **Fill:** `#aaff00`
- **Animation:** `transition-[width] duration-250ms ease-out`
- **Padding:** inherits `px-5` from parent — aligned with content cards

### Set Completion UX

Each set row is tapped to select, then the CTA logs and advances:

| State | CTA Label |
|---|---|
| Set N in progress | `Complete Set N` |
| All sets done, more exercises | `Next Exercise →` (outline style) |
| All sets done, last exercise | `Finish Workout` (filled, accent) |
| Review mode | `Return to Workout →` (outline) |

### Rest Timer

Full-screen countdown overlay. Displays:
- Rest duration countdown (seconds)
- Next target: set (weight × reps) or exercise name
- Skip button

### Session Screen (`/workouts/session` — Standalone)

The `(session)` route group layout removes AppShell entirely. The session page uses `WorkoutSessionProvider` + `WorkoutSessionRouter`.

Three-zone layout:
- **Zone A:** Session header (56px) — `backdrop-blur-xl`, `bg-[rgba(10,10,10,0.96)]`
- **Progress bar:** 6px sibling div — outside Zone A, avoids WebKit stacking context bug
- **Zone B:** Scrollable exercise content — `flex-1 overflow-y-auto`
- **Zone C:** Sticky bottom bar — CTA button + nav controls

Height: `calc(100dvh - env(safe-area-inset-bottom, 0px))`

---

## 15. Dashboard Experience

The dashboard is the user's daily command center. It surfaces personalized data, today's workout, recent activity, and quick actions.

### Section Order

1. **HeroSection** — greeting, avatar, goal chip, motivation card
2. **TodaySection** — today's scheduled workout + Start CTA
3. **QuickStatsSection** — BMI, calories, training location
4. **ProgressSection** — weight chart + recent workouts chart
5. **RecentWorkoutSection** — last completed session summary
6. **QuickActionsSection** — shortcut tiles to key features

### Dashboard Layout

```tsx
<div className="space-y-7 pb-24">
  <HeroSection    profile={profile} hour={hour} dateStr={dateStr} />
  <TodaySection   todayDay={todayDay} />
  <QuickStatsSection profile={profile} />
  <ProgressSection   profile={profile} weightLogs={weightLogs} />
  <RecentWorkoutSection />
  <QuickActionsSection />
</div>
```

### Section Anatomy

Every dashboard section follows this structure:

```
<section className="px-5">
  <SectionHeader label="..." />   ← 11px, uppercase, tracking-widest, #444444
  <Card>
    ...
  </Card>
</section>
```

### Card Patterns

| Pattern | Background | Border | Use |
|---|---|---|---|
| Standard card | `#111111` | None | Most dashboard cards |
| Accent card | `rgba(170,255,0,0.03)` | `rgba(170,255,0,0.12)` | Motivation, goal, CTAs |
| Inner row | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.06)` | Table rows within a card |

### Empty States

Each section handles its own empty state with an encouraging message and a contextual CTA. Empty states never use sad or apologetic language.

---

## 16. Accessibility

### Color Contrast

| Pair | Ratio | WCAG |
|---|---|---|
| `#f5f5f5` on `#0a0a0a` | 18.7:1 | AAA |
| `#aaff00` on `#0a0a0a` | 12.9:1 | AAA |
| `#888888` on `#0a0a0a` | 5.5:1 | AA |
| `#0a0a0a` on `#aaff00` | 12.9:1 | AAA (CTA button text) |
| `#555555` on `#0a0a0a` | 2.6:1 | Fails AA — non-essential text only |

### Touch Targets

Minimum 44×44px for all interactive elements. Achieved with:
- `h-11 w-11` (44px) for icon buttons
- `h-12` (48px) for standard input rows
- `py-3 px-5` on text buttons produces adequate height

### Screen Reader Support

- All icon-only buttons: `aria-label` required
- Navigation links: `aria-current="page"` on active item
- Form inputs: associated `<label>` or `aria-label`
- Status changes (rest timer complete, set logged): `aria-live` region or toast

### Tap Highlight

```css
html {
  -webkit-tap-highlight-color: transparent;
}
```

Default browser tap highlight is removed. Active states use Tailwind's `active:` variant (background shift) to provide visual feedback.

### Focus Management

- `outline-none` is acceptable on custom-styled elements provided a visible focus ring is applied via `focus-visible:`
- The session overlay modals trap focus within the overlay

### Reduced Motion

Not yet implemented in v1.0. Future: respect `prefers-reduced-motion` to disable `framer-motion` animations.

---

## 17. Motion & Animations

MundoFit uses **Framer Motion** for all JavaScript-driven animations. CSS transitions handle property-level changes (color, width, opacity).

### Motion Philosophy

- Animations communicate **state change**, not decoration
- No animation should make the user wait
- Every animation must feel **physical and intentional**

### Standard Curves

| Name | Cubic Bezier | Feel |
|---|---|---|
| Ease Out (standard) | `[0.25, 0.46, 0.45, 0.94]` | Fast start, smooth settle |
| Spring (navigation) | `stiffness: 400, damping: 25` | Snappy, slightly elastic |
| Spring (indicator) | `stiffness: 400, damping: 36` | Fast, firm, no overshoot |

### `fadeUp` — Standard Entry Animation

Used for all dashboard sections and card content on first render.

```typescript
// components/dashboard/ui/animations.ts
export function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 16 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  };
}
```

Usage:
```tsx
<motion.div {...fadeUp(0)}>First section</motion.div>
<motion.div {...fadeUp(0.05)}>Second section</motion.div>
<motion.div {...fadeUp(0.1)}>Third section</motion.div>
```

### Navigation Tab Spring

```typescript
// bottom-nav.tsx — active icon micro-lift
animate={isActive ? { y: -1, scale: 1.05 } : { y: 0, scale: 1 }}
transition={{ type: 'spring', stiffness: 400, damping: 25 }}
```

### Segmented Control Indicator

```typescript
// Pill slides between tabs with layout animation
<motion.div
  layoutId="body-hub-view-pill"
  className="absolute inset-0 rounded-xl bg-[#aaff00]"
  transition={{ type: 'spring', stiffness: 400, damping: 36 }}
/>
```

### Progress Bar (CSS)

```css
transition-property: width;
transition-duration: 250ms;
transition-timing-function: ease-out;
```

Applied via Tailwind: `transition-[width] duration-[250ms] ease-out`

### whileTap Pattern

Buttons that trigger primary actions use a 3% scale-down on tap:

```tsx
<motion.button whileTap={{ scale: 0.97 }}>
  Continue →
</motion.button>
```

### Overlay Entry / Exit

Modals and overlays use `AnimatePresence` with fade + scale-from-95:

```typescript
initial:    { opacity: 0, scale: 0.95 }
animate:    { opacity: 1, scale: 1 }
exit:       { opacity: 0, scale: 0.95 }
transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
```

### Animation Duration Constraints

| Use | Max Duration |
|---|---|
| Color/opacity transition | 150ms |
| Position / size transition | 300ms |
| Page-level entry | 450ms |
| Complex orchestrated sequence | 500ms (total) |

---

## 18. Component Overview

### Core Components

| Component | Path | Description |
|---|---|---|
| `AppShell` | `components/layout/app-shell.tsx` | Root layout shell with Header + BottomNav |
| `Header` | `components/layout/header.tsx` | Fixed top bar, back navigation, page title |
| `BottomNav` | `components/layout/bottom-nav.tsx` | Fixed 5-tab navigation |
| `MuscleMap` | `components/workouts/muscle-map.tsx` | Interactive SVG body diagram |
| `SplitBadge` | `components/workouts/split-badge.tsx` | Workout split type chip |
| `ElapsedTimer` | `components/workouts/session/elapsed-timer.tsx` | Live workout timer |

### Dashboard Components

| Component | Path |
|---|---|
| `DashboardClient` | `components/dashboard/dashboard-client.tsx` |
| `HeroSection` | `components/dashboard/sections/hero-section.tsx` |
| `TodaySection` | `components/dashboard/sections/today-section.tsx` |
| `QuickStatsSection` | `components/dashboard/sections/quick-stats-section.tsx` |
| `ProgressSection` | `components/dashboard/sections/progress-section.tsx` |
| `RecentWorkoutSection` | `components/dashboard/sections/recent-workout-section.tsx` |
| `QuickActionsSection` | `components/dashboard/sections/quick-actions-section.tsx` |

### Workout Session Components

| Component | Path | Render Condition |
|---|---|---|
| `WorkoutSessionProvider` | `session/workout-session-provider.tsx` | Always (context root) |
| `WorkoutConfirmView` | `session/views/workout-confirm-view.tsx` | `status: idle \| initialising` |
| `ActiveWorkoutView` | `session/views/active-workout-view.tsx` | `status: active \| resting \| paused \| finishing` |
| `ExerciseTransitionView` | `session/views/exercise-transition-view.tsx` | `status: transitioning` |
| `WorkoutSummaryView` | `session/views/workout-summary-view.tsx` | `status: completing \| completed` |
| `PauseOverlay` | `session/overlays/pause-overlay.tsx` | `status: paused` |
| `FinishConfirmDialog` | `session/overlays/finish-confirm-dialog.tsx` | `status: finishing` |
| `RestOverlay` | `session/overlays/rest-overlay.tsx` | Local rest state within `ActiveWorkoutView` |

### Button Patterns

**Primary CTA (filled, accent):**
```tsx
<button
  className="h-[52px] w-full rounded-2xl bg-[#aaff00]
             text-[15px] font-black text-[#0a0a0a]
             transition-colors disabled:opacity-40"
>
  Complete Set 1
</button>
```

**Secondary CTA (outline):**
```tsx
<button
  className="h-[52px] w-full rounded-2xl border border-[#aaff00]
             text-[15px] font-black text-[#aaff00]
             transition-colors disabled:opacity-40"
>
  Next Exercise →
</button>
```

**Destructive:**
```tsx
<button
  className="h-[52px] w-full rounded-2xl bg-[rgba(255,68,68,0.12)]
             border border-[rgba(255,68,68,0.25)]
             text-[15px] font-black text-[#ff4444]"
>
  Cancel Workout
</button>
```

### Input Pattern (Set Weight / Reps)

```tsx
<div className="flex h-11 items-center gap-2 rounded-xl bg-[#1a1a1a] px-3">
  <button className={inputBtn}><Minus size={16} /></button>
  <span className="flex-1 text-center text-[17px] font-bold text-[#f5f5f5]">
    {value}
  </span>
  <button className={inputBtn}><Plus size={16} /></button>
</div>
```

### Chip / Badge Pattern

```tsx
{/* Muscle group chip */}
<span className="rounded-full bg-[rgba(255,255,255,0.06)]
                 px-2.5 py-0.5 text-[11px] font-medium text-[#888888]">
  Chest
</span>

{/* Split type badge */}
<span className="rounded-full border border-[rgba(170,255,0,0.2)]
                 bg-[rgba(170,255,0,0.06)]
                 px-3 py-1 text-[11px] font-bold text-[#aaff00]/75">
  Push
</span>
```

---

## 19. Future Premium Experience

The following capabilities are planned for future releases. They should be designed with this system in mind.

### W8 — Session Recovery

When a user refreshes mid-workout, a recovery screen detects the persisted `wf_active_session` localStorage blob and restores the session to the exact exercise and set. The recovery screen uses the session standalone layout.

### Exercise Library V2

The exercise library will feature:
- Per-exercise detail sheet with hero background image
- SVG muscle map showing primary and secondary activation
- Step-by-step instruction scrollview
- Common mistakes section
- Per-exercise personal record tracking

Visual language: hero image with dark overlay, accent-colored muscle highlights on the anatomy SVG.

### AI Workout Generator V2

The current AI generator will be replaced by a context-aware engine that:
- Considers recent session history
- Respects available equipment (from profile)
- Adapts difficulty based on performance trend

The UI will surface a confidence score and a rationale card for each generated plan.

### Premium Analytics

Extended progress charts using Recharts:
- Volume over time per muscle group
- Strength progression per exercise (1RM estimate)
- Session density heatmap (calendar view)

Charts follow the existing color system: `#aaff00` primary line, `#333333` grid, `#555555` axis labels.

### Dark Glassmorphism Overlay

For future onboarding, feature announcements, and premium upsell screens:
- Background: `backdrop-blur-2xl` with `bg-[rgba(10,10,10,0.9)]`
- Border: `border border-[rgba(255,255,255,0.08)]`
- Top accent line: 1px solid `rgba(170,255,0,0.3)`

---

## 20. AI Development Rules

These rules apply when AI tools (Claude Code, Copilot, or similar) generate UI code for MundoFit.

### Mandatory Checks Before Any UI Code

1. **Read this document first.** All values (colors, spacing, radius, motion) derive from this system. Do not invent values.

2. **Check `globals.css` for tokens.** Use CSS custom properties or Tailwind token names, not raw hex values wherever a token exists.

3. **Never introduce a new color** without explicit designer approval. If a variant is needed, derive it from the accent glow formula: `rgba(170, 255, 0, {opacity})`.

4. **Never add a new typeface.** Inter only.

5. **Check the route group** before choosing a layout. Session screens go in `(session)`. Standard screens go in `(app)`.

### Component Generation Rules

- **Use Tailwind classes**, not inline styles, except for:
  - `height: 'calc(100dvh - ...)'` — not expressible in Tailwind
  - `style={{ width: `${pct}%` }}` — dynamic values
  - `boxShadow` with custom glow values

- **Match font size from the scale.** Do not use arbitrary values outside the defined scale unless matching a specific pixel-perfect design spec.

- **Match border radius from the scale.** `rounded-2xl` for cards and CTAs. `rounded-full` for pills, avatars, progress bars.

- **Use `flex-none` on sticky sections** within a flex column container. Use `flex-1 overflow-y-auto` on scrollable zones.

- **Progress bars are not children of `backdrop-filter` parents.** See §10 warning.

### Quality Gates

Before reporting a task complete:

1. `npx tsc --noEmit` — zero errors
2. Visual check on mobile viewport (390px width)
3. Confirm accent color is `#aaff00` — not `#00ff00`, not `lime-500`
4. Confirm no light backgrounds (`#ffffff`, `#f0f0f0`, white Tailwind classes)
5. Confirm all interactive elements have `aria-label` if icon-only

---

## 21. Do / Don't

### Colors

| ✅ Do | ❌ Don't |
|---|---|
| Use `#aaff00` for all primary CTAs and active states | Use `lime-500` (`#84cc16`) — it is not MundoFit green |
| Use `#f5f5f5` for all primary text | Use `white` or `#ffffff` anywhere in the UI |
| Use `rgba(170,255,0,0.08–0.15)` for subtle accent fills | Use solid accent fills for backgrounds |
| Derive border colors from `rgba(255,255,255,0.06–0.1)` | Use opaque grays for borders on dark surfaces |

### Typography

| ✅ Do | ❌ Don't |
|---|---|
| Use `font-black` for exercise names and primary CTAs | Use `font-bold` on display-level text |
| Use `tracking-widest uppercase` for section labels | Use title case for section labels |
| Use the 11px / 13px / 15px scale | Mix arbitrary font sizes within the same view |

### Layout

| ✅ Do | ❌ Don't |
|---|---|
| Use `px-5` (20px) as the default horizontal padding | Use `px-4` or `px-6` on the main content area |
| Use `h-[52px]` for primary CTA buttons | Use arbitrary heights on buttons |
| Keep session screen in `(session)` route group | Render a workout session inside AppShell |
| Move progress bars outside `backdrop-filter` parents | Put progress bars inside `backdrop-blur-*` elements |

### Motion

| ✅ Do | ❌ Don't |
|---|---|
| Use `fadeUp` for section entry animations | Animate every element with a unique custom curve |
| Keep total animation duration ≤ 500ms | Use slow animations (700ms+) for state changes |
| Use `whileTap={{ scale: 0.97 }}` on action buttons | Use `scale: 0.9` — too aggressive, feels broken |
| Use spring physics for navigation indicators | Use `ease-in-out` cubic bezier for spring-like motion |

### Accessibility

| ✅ Do | ❌ Don't |
|---|---|
| Add `aria-label` to every icon-only button | Leave icon buttons without accessible names |
| Use `aria-current="page"` on the active nav tab | Apply active styles without aria state |
| Ensure 44×44px minimum touch target | Use 32px or 36px touch areas for primary actions |

---

## 22. References

### Internal

| Document | Path |
|---|---|
| Design System Reference Image | `docs/design/mundofit-v3-design-system.png` |
| Global CSS Tokens | `app/globals.css` |
| Tailwind Configuration | `tailwind.config.ts` |
| App Shell | `components/layout/app-shell.tsx` |
| Dashboard Architecture | `components/dashboard/` |
| Session Provider | `components/workouts/session/workout-session-provider.tsx` |
| Database Schema | `supabase/migrations/20240101000000_initial_schema.sql` |
| Exercise Library Architecture | `docs/reports/2026-06-30-exercise-library-architecture.md` |

### External

| Resource | URL | Use |
|---|---|---|
| Inter — Google Fonts | https://fonts.google.com/specimen/Inter | Primary typeface |
| Lucide Icons | https://lucide.dev | Icon library |
| Framer Motion | https://www.framer.com/motion | Animation library |
| Tailwind CSS | https://tailwindcss.com | Utility CSS |
| Recharts | https://recharts.org | Data visualisation |
| Supabase | https://supabase.com | Backend / database |
| Next.js App Router | https://nextjs.org/docs/app | Routing and rendering |
| next-intl | https://next-intl-docs.vercel.app | i18n |
| WCAG 2.1 Guidelines | https://www.w3.org/WAI/WCAG21/quickref | Accessibility standard |
| Body Highlighter SVG | https://github.com/HichamELBSI/react-native-body-highlighter | Anatomy SVG source (MIT) |

---

_MundoFit Design System v1.0 — Last updated 2026-06-30_  
_This document supersedes all prior design references for the V3 release._
