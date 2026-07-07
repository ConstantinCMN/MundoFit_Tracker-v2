# MundoFit Design System v1 — Implementation Analysis

**Date:** 2026-07-06  
**Scope:** Analysis and implementation planning only  
**Implementation status:** Not started

## Summary

MundoFit already has a recognizable premium dark visual language: Electric Lime (`#aaff00`), Inter, a 430 px mobile container, elevation through dark surfaces, Lucide icons, a chrome-free workout session, and Framer Motion interactions. The repository also contains a 1,278-line visual specification at `docs/design/MundoFit_V3_Design_System.md` and an approved reference image at `docs/design/mundofit-v3-design-system.png`.

The current code is not yet a reusable design system. It is a collection of screen-local patterns supported by only three general UI components (`Button`, `Input`, and `Toast`). Color, radius, typography, spacing, card, progress, modal, chart, and motion decisions are repeatedly hardcoded inside feature components. Similar controls have different states and accessibility behavior, and several documented rules conflict with the live configuration.

Design System v1 should therefore be implemented as a controlled extraction and migration, not a visual rewrite. The existing brand direction should remain intact while the team:

1. resolves token/configuration contradictions;
2. establishes accessible, typed primitives in `components/ui/`;
3. builds composite data, workout, navigation, and overlay patterns from those primitives;
4. validates them in isolation;
5. migrates existing screens incrementally without changing routing, data flow, RLS, Server Actions, or session state architecture.

The design system must be product-neutral enough to support Dashboard V3, Workout Session V2, Program Builder, Progress Hub, Goals, and AI Coach. Those screens should compose shared primitives rather than create new local variants.

## Current Architecture

### Application stack

| Area | Current implementation | Design-system implication |
|---|---|---|
| Framework | Next.js 15.3 App Router, React 19, strict TypeScript | Server Components remain the default; interactive UI primitives require explicit client boundaries only where needed. |
| Styling | Tailwind CSS 3.4 plus CSS custom properties in `app/globals.css` | Preserve Tailwind and CSS variables; do not introduce a second styling system. |
| Motion | Framer Motion 11.18 | Centralize presets and reduced-motion behavior. |
| Charts | Recharts 3.8 | Wrap Recharts with MundoFit chart primitives rather than configuring it per feature. |
| Icons | Lucide React | Keep as the sole interface icon library. |
| i18n | `next-intl`, locales `ro`, `en`, `es` | Components accept translated labels or translation keys; no user-facing English inside primitives. |
| Data/auth | Supabase, Server Actions, RLS | Out of scope for the design system and must not be changed by migration. |

### Route and shell hierarchy

```text
app/[locale]/layout.tsx
├── NextIntlClientProvider + Inter + globals.css
├── (auth)/layout.tsx
│   └── centered, shell-free auth screens
├── (onboarding)/layout.tsx
│   └── full-height, shell-free onboarding
├── (app)/layout.tsx
│   └── AppShell
│       ├── Header (fixed, 48 px)
│       ├── route content
│       └── BottomNav (fixed + safe area)
└── (session)/layout.tsx
    └── standalone 430 px workout session without Header or BottomNav
```

This separation is correct and should remain unchanged. In particular, `(session)` must stay chrome-free. The design system should provide shell components and layout tokens without merging the route groups.

### Feature/component hierarchy

```text
components/
├── ui/                    # Button, Input, Toast only
├── layout/                # AppShell, Header, BottomNav
├── dashboard/
│   ├── ui/                # DashboardCard, SectionHeader, SkeletonCard, fadeUp
│   └── sections/          # Hero, Today, QuickStats, Progress, RecentWorkout, QuickActions
├── workouts/
│   ├── session/           # provider, router, views, overlays, timer
│   ├── generator/program/history/library clients
│   └── feature-local cards, sheets, badges, body map
├── measurements/          # forms, list UI, Recharts chart
├── body/                  # body hub and muscle detail
├── onboarding/            # large wizard with local selection/input patterns
├── profile/               # large client with local fields/cards/selectors
└── auth/                  # forms using shared Button/Input
```

The intended `components/modules/` and `components/shared/` structure described by `docs/ARCHITECTURE.md` is not present. The live feature folders are the source of truth. Design System v1 should not reorganize all feature code; it should add a clear dependency direction:

```text
CSS tokens → UI primitives → shared composites → feature components → route pages
```

`components/ui/` must not import feature components or application data types. Composite workout components may live under `components/workouts/ui/` or an approved shared pattern folder and may depend on `components/ui/`.

### Styling and token architecture

- `app/globals.css` contains color, radius, shadow, safe-area, glow, text-gradient, and app-container definitions.
- `tailwind.config.ts` exposes those CSS variables and defines the Inter type scale and `max-w-app`.
- There is no separate `styles/` directory.
- Components mostly use arbitrary hex, rgba, size, and shadow utilities rather than semantic Tailwind aliases.
- At least 52 files under `app/` and `components/` contain literal color values.
- The current code contains approximately 185 rounded utility usages and 300 arbitrary pixel text-size usages, showing that the documented system is not acting as an enforced API.
- There is no component catalog, Storybook configuration, visual regression suite, or design-system test suite.

### Important configuration defect

`tailwind.config.ts` extends `borderRadius` using the keys `sm`, `md`, `lg`, and `xl`. In Tailwind, this overrides the standard utilities with the configured variables:

| Utility | Live resolved token | Live value |
|---|---|---:|
| `rounded-sm` | `--radius-sm` | 8 px |
| `rounded-md` | `--radius-md` | 12 px |
| `rounded-lg` | `--radius-lg` | 16 px |
| `rounded-xl` | `--radius-xl` | 24 px |

The written guide instead describes `rounded-lg` as 8 px, `rounded-xl` as 12 px, `rounded-2xl` as 16 px, and `rounded-3xl` as 24 px. Existing components appear to have been authored using the written interpretation, so some controls likely render with larger radii than intended. This must be resolved before component migration. The recommended fix is to expose semantic keys (`control`, `card`, `panel`, `pill`) or align the Tailwind keys to the intended utility values, then audit every affected class visually.

## Existing Components

### Reusable foundation currently available

| Component/pattern | Current strengths | Current limitations |
|---|---|---|
| `Button` | Typed variants, loading state, focus-visible ring, tap feedback | Hardcoded colors; sizes differ from documented 52 px CTA; no icon-only contract; no reduced motion; limited loading announcement. |
| `Input` | Floating label, errors/hints, password reveal, controlled/uncontrolled support | Error/hint is not connected through `aria-describedby`; reveal button is below 44 px and removed from tab order; IDs cannot be coordinated with external labels; colors are hardcoded. |
| `Toast` | Success/error visuals and entry/exit animation | No provider/queue, live region, action/undo, pause behavior, safe-area abstraction, or reduced motion. |
| `AppShell` | Correct max width, fixed shell, safe-area bottom padding | Layout values are repeated literals instead of named tokens. |
| `Header` | Route-aware back button, localized route titles | Back target depends on browser history; 32 px button misses 44 px target; right action is not an API; literal `aria-label` is not localized. |
| `BottomNav` | Correct five-tab structure, active state, `aria-current` | Touch geometry and active animation are local; no reduced motion; route matching can mark multiple nested paths unintentionally; border rule conflicts with the borderless premium direction. |
| `DashboardCard` | A shared dashboard wrapper exists | Both variants always use borders, conflicting with the “no borders on cards” rule; it is dashboard-only rather than a general Card primitive. |
| `SectionHeader` | Consistent dashboard label/action anatomy | Action target is too small, accepts only callback actions, and uses low-contrast text. |
| `SkeletonCard` | Basic loading placeholder | Not a general skeleton system; no reduced-motion behavior or shape variants. |
| `fadeUp` | One reusable entry preset | Dashboard-only location; no reduced-motion path; staggered sequences can make content wait. |
| `MuscleMap` | Typed selectable anatomy SVG with brand highlighting | Selection styles are constants; no shared legend/pattern tokens; keyboard and screen-reader model needs validation. |
| `SplitBadge` | Reuses split metadata | Feature-specific and inline-styled; color meaning requires icon/text validation. |
| `MeasurementChart` | Recharts integration, periods, tooltip, empty states | Entire chart theme is local; muted axis colors fail normal-text contrast; no data table/summary fallback; controls have undersized targets. |
| Workout session views | Strong standalone three-zone layout, visible progress, set flow, absolute-time state engine | UI text is heavily hardcoded; local buttons/cards/progress controls duplicate primitives; modal semantics and reduced motion are incomplete. |
| Exercise/session sheets | Backdrop, Escape dismissal, animated bottom sheet | No `role="dialog"`, `aria-modal`, labelled title relationship, focus trap, focus restoration, inert background, scroll lock, or 430 px desktop constraint. Close targets are 32 px and lack accessible labels. |

### Existing screen status relevant to the target products

| Target product | Current status |
|---|---|
| Dashboard V3 | Dashboard V2 exists with six componentized sections, but contains placeholders, hardcoded copy, local chart/progress/card patterns, and incomplete data wiring. |
| Workout Session V2 | The session engine and standalone shell exist. It is the richest source for workout patterns but needs primitive extraction, accessibility, i18n, and recovery/error states. |
| Program Builder | A fixed 14-day `ProgramClient` exists with local rows, pickers, buttons, and toast use. |
| Progress Hub | No unified Progress Hub. Measurements are implemented; Weight is a placeholder; Photos is a placeholder; dashboard has a custom sparkline. |
| Goals | Route is a placeholder. No goal cards, goal forms, progress history, or goal status patterns exist. |
| AI Coach | No route, component, or interaction system exists. The roadmap places AI coaching post-launch; the design system can support it without introducing AI product architecture now. |

### Visual-reference alignment

The approved image strongly establishes the workout-session and accessibility direction:

- near-black layered surfaces with Electric Lime focus;
- large numeric hierarchy and dense workout controls;
- anatomy imagery as a primary workout context element;
- progress represented by both numeric labels and shape/fill;
- status communicated with icon, text, color, and, for muscle categories, patterns/textures;
- a prominent accessibility control strip covering text size, contrast, color modes, reduced motion, and haptic feedback.

The image is a strong contract for workout and accessibility treatment, but it does not fully specify Dashboard V3, Goals, Progress Hub, Program Builder, or AI Coach layouts. The Markdown design document fills in many system values, but screen-specific acceptance references are still needed before those product screens are visually finalized.

## Missing Components

### Foundation primitives

- `Text`/typography recipes for display, title, body, label, caption, numeric, and mono/tabular data.
- General `Card` with surface, elevated, interactive, accent, and inset variants.
- `IconButton` with enforced accessible label and 44/48 px sizes.
- `LinkButton` or button-as-link behavior without invalid nesting.
- `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, and `NumberStepper`.
- `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, and consistent form IDs/ARIA wiring.
- `Badge`, `Chip`, `StatusBadge`, and `Tag` with icon/pattern support.
- `Divider`, `Stack`, `Inline`, `Screen`, `Section`, and safe-area layout recipes.
- `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`, and `InlineAlert`.

### Feedback and overlay primitives

- Application-level toast provider/viewport with queue, action, undo, pause-on-hover/focus, and live-region semantics.
- Accessible `Dialog`, `AlertDialog`, `BottomSheet`, and full-screen overlay primitives.
- Shared backdrop, focus trap/restore, scroll lock, Escape behavior, dismiss policy, and portal/z-index rules.
- Tooltip/popover/menu primitives for desktop/keyboard parity where appropriate.

### Progress and data visualization

- Linear `ProgressBar` with determinate/indeterminate states and accessible value metadata.
- `ProgressRing` with label/value fallback.
- `StepProgress`, `WorkoutProgress`, `GoalProgress`, `Streak`, and `MetricDelta`.
- Chart container, axes/grid theme, tooltip, legend, time-range selector, loading/empty/error states, and accessible data summary/table.
- Reusable line, area, bar, sparkline, and donut/ring configurations.

### Workout-specific composites

- `SessionHeader`, `SessionProgress`, `ExerciseHero`, `MuscleLegend`, and `ExerciseMedia`.
- `SetTable`, `SetRow`, `SetStatus`, `LoadRepsStepper`, `PreviousPerformance`, and `PersonalRecordBadge`.
- `RestTimer`, `RestControls`, `NextExercisePreview`, `WorkoutCTA`, and `SessionBottomBar`.
- `ExerciseCard`, `WorkoutCard`, `ProgramDayCard`, `ScheduleStrip`, and `ExerciseQueue`.
- A color-blind-safe muscle category system using color plus texture, icon, label, or stroke pattern.

### Product composites needed by future screens

- Dashboard: metric card, hero metric, action tile, recommendation card, activity timeline.
- Progress Hub: metric selector, period selector, comparison card, milestone marker, photo comparison controls.
- Goals: goal card, goal state badge, target editor, milestone timeline, completion celebration respecting reduced motion.
- AI Coach: coach message bubble, user message bubble, streaming indicator, suggestion chips, recommendation/evidence card, tool/action confirmation, safety notice, feedback control, and message composer.

## Proposed Design System

### 1. Source of truth and ownership

Use a three-layer contract:

1. **Design contract:** `docs/design/MundoFit_V3_Design_System.md` plus approved mockups.
2. **Runtime tokens:** CSS custom properties in `app/globals.css`, exposed through semantic Tailwind aliases.
3. **Component contract:** typed components in `components/ui/` plus documented composite patterns.

The runtime implementation, catalog examples, and design document must change together. A component may not introduce a new color, radius, shadow, font size, or motion curve without adding an approved token or documented exception.

### 2. Token model

#### Color

Retain the approved base palette:

| Role | Token | Value |
|---|---|---|
| Page | `--color-bg-base` | `#0a0a0a` |
| Surface | `--color-bg-surface` | `#111111` |
| Elevated | `--color-bg-elevated` | `#1a1a1a` |
| Overlay | `--color-bg-overlay` | `#222222` |
| Brand | `--color-accent` | `#aaff00` |
| Brand dim | `--color-accent-dim` | `#88cc00` |
| Primary text | `--color-text-primary` | `#f5f5f5` |
| Secondary text | `--color-text-secondary` | `#888888` |
| Muted decoration | `--color-text-muted` | `#555555` |
| Danger | `--color-danger` | `#ff4444` |
| Warning | `--color-warning` | `#ff9900` |
| Info | `--color-info` | `#4499ff` |

Add semantic aliases such as `--color-control-bg`, `--color-card-bg`, `--color-focus-ring`, `--color-disabled-fg`, and `--color-scrim` so components depend on roles, not raw palette values. Add chart-series and muscle-category tokens only after testing contrast and color-blind modes. `#555555` must be restricted to disabled/decorative content; readable captions and interactive labels should use at least `#888888`.

#### Typography

- Keep Inter only.
- Formalize recipes: display metric (32–46 px), screen title (24 px), section title (20 px), card title (17 px), body (15 px), compact body (13 px), label/caption (11 px).
- Define line height, weight, letter spacing, tabular-number behavior, truncation, and responsive constraints for each recipe.
- Replace one-off arbitrary sizes during migration; permit exceptions only for documented hero/session metrics.
- Verify Romanian and Spanish labels at 320 px width and 200% text zoom.

#### Spacing and layout

- Use a 4 px base grid with 2 px only for micro-alignment.
- Standardize page padding at 20 px, shell padding at 16 px, section gap at 28 px, card gap at 16 px, and card padding at 16/20 px.
- Define shell dimensions (`48px` header, `64px` nav), content max width (`430px`), safe-area values, and sticky-bottom offsets as named properties/utilities.
- Do not make generic UI components aware of route groups.

#### Radius

Adopt semantic names and resolve the Tailwind collision before migration:

| Semantic role | Intended value |
|---|---:|
| chip/small | 8 px |
| control | 12 px |
| card/dialog | 16 px |
| feature panel | 24 px |
| pill | 9999 px |

Use Tailwind names such as `rounded-control`, `rounded-card`, `rounded-panel`, and `rounded-pill`. This makes intent stable and avoids relying on Tailwind default names.

#### Elevation and shadows

- Surface color is the default elevation mechanism.
- Standard cards have no visible border.
- Dividers and inset rows may use a 6% white separator.
- Shadows are limited to floating overlays, menus, and approved accent emphasis.
- Define explicit z-index layers for base, sticky, navigation, scrim, sheet/dialog, toast, and critical session overlay.

#### Motion

Create one shared motion module containing:

- duration tokens: 100/150 ms micro, 250/300 ms state, 450 ms page entry, 500 ms hard maximum;
- approved easing and spring presets;
- fade, fade-up, slide, scale, sheet, progress, and shared-layout variants;
- a reduced-motion adapter that removes movement and long delays while preserving state visibility.

Progress and state animations must begin from the current/known value when appropriate, not replay from zero on every render. Haptics, if introduced later, must be preference-controlled and never be the only feedback.

### 3. Primitive component contracts

#### Buttons

- Variants: primary, secondary, outline-accent, ghost, danger.
- Sizes: compact 36 px (only where a larger hit-area wrapper exists), standard 48 px, primary CTA 52 px, icon 44/48 px.
- States: default, hover, active, focus-visible, disabled, loading, success where product-approved.
- API supports start/end icon, full width, button/link rendering, loading label, and localized accessible label.
- Loading preserves width, exposes busy state, and prevents duplicate submission.

#### Cards

- Variants: surface, elevated, accent, interactive, inset.
- Slots: header, title, description, content, footer/action.
- Interactive cards render as a single link/button with visible focus and minimum target size.
- Borderless by default; border use limited to accent selection, focus, or inset separation.

#### Inputs

- Compose all fields through a shared field wrapper.
- Support labels, optional/required indication, prefix/suffix, help text, error text, and character/unit affordances.
- IDs, `aria-invalid`, and `aria-describedby` are automatic.
- Add numeric stepper for workout loads/reps and standard text/select/textarea controls for forms and AI Coach.
- Ensure 16 px input text where needed to prevent iOS zoom, or explicitly verify existing 15 px behavior.

#### Chips and segmented controls

- Separate selectable chips from passive badges.
- Selectable controls expose pressed/selected state to assistive technology.
- Color-dependent categories include label/icon/pattern.
- Horizontal scroll collections retain visible focus and do not hide content at 200% zoom.

### 4. Progress system

Build one base `Progress` contract with value, minimum, maximum, label, value text, size, and tone. Derive:

- linear progress for workouts and goals;
- rings for rest, daily targets, and completion;
- segmented/step progress for onboarding/program building;
- metric delta and milestone markers for Progress Hub.

Every progress visualization needs a non-color cue and an accessible text equivalent. Indeterminate progress must not use fake percentages.

### 5. Chart system

Wrap Recharts in shared components rather than expose library configuration to feature screens:

- `ChartContainer` controls size, margins, theme, responsive behavior, loading/empty/error state.
- `ChartTooltip`, `ChartLegend`, `ChartAxis`, and `TimeRangeControl` standardize visuals and localization.
- Presets cover line/area trends, bar comparisons, compact sparklines, and progress rings/donuts.
- Dates, units, number precision, and direction-of-improvement are provided by the feature layer.
- Each chart renders a textual summary and can expose an accessible data table/details view.
- Motion is disabled or simplified under reduced motion.

### 6. Workout system

Extract from the current session rather than rewrite its state engine:

```text
WorkoutSessionProvider (existing state/data)
└── session layout components
    ├── SessionHeader + WorkoutProgress
    ├── ExerciseHero + MuscleLegend
    ├── PreviousPerformance + TargetCard
    ├── SetTable / SetRow
    ├── LoadRepsStepper
    ├── SessionBottomBar + WorkoutCTA
    └── Rest/Pause/Finish overlays built on shared dialog primitives
```

The set logger must preserve large numeric controls and dense hierarchy from the approved mockup. The anatomy system should gain a reusable legend with patterns/textures so color-blind modes are practical. Workout copy must move to all three locale files during migration.

### 7. Navigation and shell

- Keep the five-tab app navigation and chrome-free session group.
- Convert shell sizes, scrims, separators, safe areas, and z-indexes to tokens.
- Give `Header` explicit title, back behavior, and right-action slots where routes need contextual actions.
- Ensure every navigation target is at least 44 px and supports keyboard focus.
- Define behavior for scroll, viewport resize, iOS safe areas, virtual keyboard, and desktop centering.
- AI Coach navigation placement is a product decision; the design system should supply an icon/action pattern but not change the five-tab information architecture without approval.

### 8. Modal system

Build shared overlay infrastructure before migrating any sheet:

- portal and z-index management;
- `role="dialog"`/`alertdialog`, `aria-modal`, title/description associations;
- initial focus, focus trap, focus restore, inert/hidden background;
- Escape and backdrop dismissal policies;
- body scroll lock and overscroll containment;
- safe-area padding, 430 px maximum desktop width, and virtual-keyboard handling;
- reduced-motion transition;
- BottomSheet handle and optional swipe-to-dismiss only when it does not interfere with scrolling or accessibility.

Finish/cancel workout confirmation should use `AlertDialog`; exercise/session details should use `BottomSheet`; the rest experience may use a full-screen session overlay.

### 9. Accessibility baseline

Design System v1 cannot be considered complete until it enforces:

- WCAG 2.2 AA contrast for readable and interactive content;
- 44 × 44 px targets;
- visible keyboard focus for every interactive element;
- semantic names, states, errors, and live announcements;
- focus containment/restoration for overlays;
- reduced motion through CSS and Framer Motion;
- 200% text resize and 320 px reflow checks;
- screen-reader equivalents for charts, progress, timers, and set completion;
- color-blind-safe muscle/status communication using texture/icon/text, matching the approved reference;
- locale-aware labels and no hardcoded user-facing strings.

The mockup shows accessibility settings for larger text, high contrast, color mode, reduced motion, and haptic feedback. Design System v1 should define token hooks and component behavior for these preferences. Persistence and product settings UI can be delivered separately after product/architecture approval.

### 10. Documentation, catalog, and quality gates

Create an isolated catalog, preferably Storybook, containing every primitive state and representative composites at 320, 390, and 430 px. If adding Storybook is not approved, use a non-production design-system showcase route excluded from release builds.

Required quality gates:

- TypeScript passes.
- ESLint passes once the repository's current lint command is made compatible with Next.js 15.
- Component behavior tests cover keyboard interaction, ARIA state, focus management, and dismiss behavior.
- Automated accessibility checks run on catalog stories and critical composed screens.
- Visual regression snapshots cover default, focus, error, loading, disabled, long localized copy, reduced motion, and color modes.
- Manual validation covers iOS Safari, Android Chrome, desktop keyboard, screen reader smoke tests, 200% text, and safe areas.
- No new literal visual value enters a feature component without a documented exception.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Radius configuration contradicts documentation | A token change can visually alter most existing components. | Resolve semantics first; capture baseline screenshots; migrate by component family with visual comparison. |
| “No card borders” conflicts with many current cards | Broad visual drift during migration. | Approve exact surface/border matrix and test on real devices before bulk replacement. |
| Hardcoded values and local primitives are widespread | Large blast radius and inconsistent partial migration. | Add primitives first, migrate one vertical slice at a time, and forbid new duplication. |
| Existing design reference is workout/accessibility-heavy | Dashboard, Goals, Progress Hub, Program Builder, and AI Coach can be under-specified. | Obtain screen-specific approved references or explicit acceptance criteria before final screen composition. |
| Reduced motion is absent | Accessibility failure and inconsistent behavior when retrofitted late. | Build reduced motion into motion primitives in the foundation sprint. |
| Current sheets lack dialog semantics/focus management | Keyboard and screen-reader blockers; duplicated fixes are likely. | Implement overlay primitives before any further modal work. |
| Muted colors are used for meaningful labels/actions | WCAG failures, especially in charts and navigation. | Establish semantic text tokens and automated contrast checks; reserve muted color for non-essential decoration. |
| Many hardcoded English strings remain in active UI | Violates the tri-lingual architecture and increases layout risk. | Migrate copy alongside each component and test all three locales. |
| Chart accessibility is not defined | Progress Hub data becomes inaccessible. | Require summaries/data views and keyboard-readable controls in chart wrappers. |
| AI Coach is not currently in route/data architecture | Design-system work could accidentally define product behavior or unsafe AI flows. | Limit this scope to visual primitives; plan AI product, safety, streaming, persistence, and route decisions separately. |
| Component catalog/test tooling is absent | Regressions will be found only in feature screens. | Add isolated documentation and visual/a11y testing before broad migration. |
| Existing uncommitted workspace state | Accidental overlap with unrelated user work. | Keep changes narrowly scoped and review status/diff before each sprint. |

## Recommended Sprint Breakdown

### Sprint DS0 — Contract and baseline

**Goal:** Freeze the approved visual contract and measure current behavior.

- Confirm the Markdown specification and reference image are the v1 approval sources.
- Resolve radius mapping and card-border contradictions with Product/Design.
- Define component naming, dependency rules, supported states, and browser matrix.
- Capture baseline screenshots for Dashboard, Program, Generator, Measurements, History, and Session.
- Inventory hardcoded values/copy and select migration owners.

**Exit criteria:** Token decisions are approved; baseline references exist; no unresolved foundation contradiction remains.

### Sprint DS1 — Tokens, layout, typography, and motion

**Goal:** Establish the stable runtime vocabulary.

- Normalize color, text, spacing, radius, elevation, z-index, safe-area, and motion tokens.
- Add semantic Tailwind aliases.
- Add typography and layout recipes.
- Add reduced-motion utilities/presets.
- Document allowed raw-value exceptions.

**Exit criteria:** Token catalog renders correctly at target widths; contrast and radius mappings are verified.

### Sprint DS2 — Core controls and states

**Goal:** Deliver accessible primitives for all future forms and actions.

- Button, IconButton, link-button.
- Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, NumberStepper.
- Card, Badge, Chip, segmented control, divider.
- Skeleton, Spinner, EmptyState, ErrorState, InlineAlert.
- Unit/behavior/a11y tests and catalog stories.

**Exit criteria:** All states, keyboard paths, loading/error behavior, long labels, and three locales are documented and tested.

### Sprint DS3 — Overlays and feedback

**Goal:** Replace unsafe local overlay behavior.

- Dialog, AlertDialog, BottomSheet, full-screen overlay.
- Toast provider, viewport, action/undo, queue, live region.
- Focus trap/restore, scroll lock, safe area, reduced motion.
- Migrate exercise detail, session detail, and finish confirmation as reference integrations.

**Exit criteria:** Keyboard and screen-reader overlay tests pass; no migrated overlay contains local backdrop/focus logic.

### Sprint DS4 — Progress, charts, and data display

**Goal:** Create the visualization foundation for Dashboard, Progress Hub, and Goals.

- Progress bar/ring/steps, metric card, delta, milestone.
- Recharts wrappers, tooltip, legend, periods, empty/loading/error states.
- Accessible summary/data view.
- Migrate MeasurementChart and dashboard sparkline/macro bars.

**Exit criteria:** Charts work at 320–430 px, all locales, keyboard/screen-reader fallback, and reduced motion.

### Sprint DS5 — Workout and program composites

**Goal:** Apply the system to the most demanding interaction surface.

- Session header/progress, exercise hero, set table/rows, load/reps stepper.
- Rest/pause/finish overlays, personal record/status patterns.
- Exercise/workout cards, program day rows, schedule controls.
- Color-blind muscle legend and patterns based on the approved mockup.
- Migrate Workout Session V2 and Program Builder incrementally without changing state/data architecture.

**Exit criteria:** The workout golden path passes on mobile, session remains chrome-free, and all copy/states are localized and accessible.

### Sprint DS6 — Shell and Dashboard V3 migration

**Goal:** Validate composition across the primary app shell.

- Migrate Header, BottomNav, section headers, cards, actions, skeletons, and dashboard metrics.
- Connect Dashboard V3 layouts to shared progress/chart/workout patterns.
- Validate safe areas, scroll behavior, loading, empty, error, and long copy.

**Exit criteria:** Dashboard has no feature-local primitive variants or undocumented visual literals.

### Sprint DS7 — Progress Hub and Goals enablement

**Goal:** Use the system to build consistent tracking surfaces.

- Compose Progress Hub patterns from chart, metric, comparison, photo, and filter primitives.
- Compose Goals patterns from cards, progress, milestone, form, modal, and completion states.
- Do not implement missing product/data architecture as part of the design-system package; coordinate those feature sprints separately.

**Exit criteria:** Approved screen compositions can be built without adding new foundation primitives.

### Sprint DS8 — AI Coach enablement and system hardening

**Goal:** Ensure the component vocabulary supports conversational coaching safely and consistently.

- Add message, composer, streaming, suggestion, action confirmation, evidence, feedback, and safety-notice patterns.
- Validate dynamic-height content, long/streamed text, keyboard/virtual keyboard, and screen-reader announcements.
- Run full visual, accessibility, performance, locale, and browser audits.
- Deprecate remaining duplicate local primitives and update contribution rules.

**Exit criteria:** AI Coach UI can be composed without bypassing tokens; no critical design-system accessibility defects remain.

## Estimated Implementation Order

The dependency order below is more important than calendar duration:

1. Approve token contradictions and visual acceptance references.
2. Normalize tokens, typography, layout, elevation, z-index, and motion.
3. Implement component catalog and test harness.
4. Implement Button/IconButton, Card, Field/Input, selection controls, and state components.
5. Implement accessible Dialog/AlertDialog/BottomSheet and Toast infrastructure.
6. Implement progress and chart foundations.
7. Extract Workout Session and Program Builder composites from live screens.
8. Migrate shell navigation and Dashboard V3.
9. Compose Progress Hub and Goals on the stable primitives.
10. Add AI Coach conversational composites after its product/safety architecture is approved.
11. Complete cross-screen deprecation, literal-value cleanup, visual regression, accessibility, locale, and device QA.

Parallel work should begin only after DS1 tokens and DS2 component contracts are stable. Overlay work and chart work can then proceed in parallel because they have limited overlap. Screen migration should not begin by copying provisional primitives into feature folders.

### Completion definition for Design System v1

Design System v1 is complete when:

- approved tokens are the only default visual source;
- every required primitive and documented state exists in the catalog;
- critical components pass keyboard, screen-reader, contrast, reduced-motion, and touch-target checks;
- Dashboard V3 and Workout Session V2 demonstrate the system in production compositions;
- Program Builder, Progress Hub, Goals, and AI Coach can be composed without inventing new foundation styles;
- all component copy paths support Romanian, English, and Spanish;
- no route/data/auth/session architecture was changed as a side effect;
- migration/deprecation guidance prevents new feature-local duplicates.

---

**Files created by this analysis:** `docs/reports/2026-07-06-design-system-analysis.md`  
**Application files modified:** None  
**Architecture changes:** None; proposals require approval before implementation.  
**Validation performed:** Documentation, route/component hierarchy, styling/token configuration, representative UI components, charting, session overlays, accessibility patterns, and approved design reference were reviewed. No build or test command was run because this task made no application-code changes.
