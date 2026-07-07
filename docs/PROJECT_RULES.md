# MundoFit Tracker V2 — Project Rules

> [!IMPORTANT]
> This document is the official operating manual and engineering constitution for MundoFit Tracker V2. Every AI and human contributor must read and follow it before analyzing, implementing, reviewing, or documenting project work.

**Status:** Official  
**Owner:** Product Owner and Human  
**Audience:** Product Owner, Developer (Codex), Human, reviewers, and future AI contributors  
**Applies to:** Product decisions, design, application code, data, tests, documentation, scripts, configuration, validation, reports, and commits

## 1. Authority and Use

`docs/PROJECT_RULES.md` is the standing source of truth for how work is performed on MundoFit. A task may add stricter constraints, but it may not silently weaken these rules.

Read project guidance in this order:

1. The Human's current explicit task and decisions
2. `docs/PROJECT_RULES.md`
3. `AGENTS.md`
4. `docs/PROJECT_CONTEXT.md` and `docs/ROADMAP.md`
5. `docs/ARCHITECTURE.md` and `docs/DATABASE.md`
6. Approved design specifications, QA documents, and relevant recent reports
7. The live implementation affected by the task

`docs/DEVELOPMENT_RULES.md` is retained as an earlier handbook. Where it overlaps or conflicts with this document, `docs/PROJECT_RULES.md` governs.

> [!NOTE]
> Documentation records intent and prior decisions. The live repository is the factual source of truth for current implementation details. A difference between them must be reported, not silently resolved.

## 2. Mission

MundoFit is a **Premium Fitness Platform** and a **Universal Fitness Platform**. It helps people plan training, perform workouts, understand physical progress, manage nutrition targets, pursue goals, and receive useful coaching.

MundoFit is:

| Principle | Meaning |
|---|---|
| **Premium Fitness Platform** | Every finished experience is deliberate, focused, fast, trustworthy, and visually cohesive. |
| **Universal Fitness Platform** | The platform serves different bodies, abilities, goals, experience levels, training environments, languages, units, and supported device ecosystems. |
| **Mobile First** | Design begins with touch, small screens, safe areas, virtual keyboards, interrupted sessions, and real-device performance. |
| **Design First** | Approved product flows and designs are understood before UI implementation begins. |
| **Component First** | Features are composed from approved tokens, primitives, and reusable patterns. |
| **Accessibility First** | Semantics, contrast, focus, touch targets, reduced motion, and assistive technology support are requirements from the start. |
| **AI Ready** | Product and technical boundaries can support AI Coach without coupling core fitness behavior to an unapproved model or vendor. |

> [!WARNING]
> MundoFit is **not a lifestyle application** and must not become a generic wellness dashboard.

### Product scope

MundoFit focuses on:

- workouts and workout execution;
- an exercise library;
- body measurements;
- progress photos;
- calories and macronutrient targets;
- fitness goals;
- AI Coach.

MundoFit will not include:

- sleep tracking;
- water tracking;
- step counting;
- generic wellness tracking.

These exclusions are permanent unless the Human explicitly changes product strategy. Do not add them indirectly as dashboard widgets, onboarding questions, AI Coach tools, integrations, or “helpful” scope extensions.

## 3. Product Vision

### Platform priorities

| Priority | Platform | Product expectation |
|---|---|---|
| **Primary** | Android | Touch-first behavior, Chrome/WebView compatibility, and reliable performance on mid-range devices. |
| **Primary** | iOS | Safari/WebView compatibility, safe areas, dynamic viewports, virtual keyboards, and background/resume correctness. |
| **Future** | Huawei | Avoid unnecessary Google-only dependencies and keep platform services replaceable. |

Core domain logic, validation, and data contracts must remain platform-neutral. Native capabilities such as camera, notifications, haptics, storage, authentication, health integrations, and billing belong behind approved interfaces.

### Exercise category roadmap

The platform must be able to support these future exercise categories without premature implementation:

| Category | Status |
|---|---|
| Gym | Future category |
| Resistance Bands | Future category |
| Bodyweight | Future category |
| TRX | Future category |
| Kettlebell | Future category |
| Mobility | Future category |
| Stretching | Future category |

Do not build a future category unless it is in the approved roadmap or current task. Do not hardcode current data models or UI assumptions so narrowly that these approved categories become impractical.

## 4. Team Roles and Decision Authority

| Role | Actor | Responsibilities | Decision authority |
|---|---|---|---|
| **Product Owner** | ChatGPT acting as Product Owner / Technical Lead | Product definition, roadmap, architecture direction, UX direction, acceptance criteria, prioritization, and QA direction | Approves product, design, architecture, and technical direction within the Human's strategy. |
| **Developer** | Codex | Analysis, implementation, approved refactoring, tests, documentation, validation, and reports | Chooses reversible implementation details inside approved scope and architecture. May recommend changes; may not redefine the product, design, roadmap, or architecture. |
| **Human** | User | Product vision, business decisions, final approval, release authority, and resolution of high-impact disputes | Final authority. May approve exceptions or change any project decision explicitly. |

### Approval flow

```text
Human defines objective / Product Owner defines approved direction
                         |
                         v
              Developer analyzes the task
                         |
              +----------+----------+
              |                     |
              v                     v
    Within approved scope     Missing/conflicting decision
              |                     |
              v                     v
        Implement safely      Ask Product Owner
                                    |
                                    v
                         Business, scope, or final
                          approval still required?
                                    |
                                    v
                                Ask Human
```

The Developer must escalate before changing product scope, architecture, data ownership, security, approved UX, or visual design. The Developer should not escalate facts that can be established by reading the repository.

## 5. Permanent Development Rules

### 5.1 Product Owner Authority

Implement the Product Owner's approved roadmap, architecture, UX, and acceptance criteria. Recommendations must be identified as proposals.

**Example:** Codex may recommend a different AI Coach entry point with supporting evidence. It may not change navigation before approval.

### 5.2 Design Authority

Approved MundoFit designs and the official design system are binding. Visual ambiguity or conflicts must be raised for a decision.

**Example:** If a mockup and a token specification disagree on radius, record the discrepancy and ask. Do not choose the value that looks better locally.

### 5.3 No Feature Creep

Implement only the requested behavior and the minimum supporting work necessary for correctness, accessibility, security, maintainability, and validation.

**Example:** Fixing workout timer persistence does not authorize achievements, notifications, or a sleep-recovery score.

### 5.4 Architecture First

Read `docs/ARCHITECTURE.md`, the affected implementation, and relevant reports before editing. Preserve route groups, server/client boundaries, data flow, state ownership, validation, RLS, and internationalization patterns. Architecture changes require approval.

**Example:** A new goal form uses the established validated Server Action pattern; it does not write directly to Supabase from the browser for convenience.

### 5.5 Reuse Before Create

Search for an existing token, component, hook, schema, helper, type, or pattern before creating one. Reuse must match the semantic contract; forced reuse is not required.

**Example:** Use or extend the approved `Card` primitive instead of copying a dashboard card into Goals.

### 5.6 Small Tasks

Keep work independently reviewable with one clear outcome. Split broad foundation, feature, migration, and cleanup work into separate tasks.

**Example:** “Create an accessible BottomSheet and migrate Exercise Details” is bounded. “Refactor all overlays and redesign Workouts” is not.

### 5.7 Reports Required

Every implementation task creates a dated report in `docs/reports/`. The report records what actually changed, decisions, validation evidence, risks, and remaining work.

**Example:** A one-line bug fix still records the root cause, changed file, and actual check results.

### 5.8 Validation Required

Run the mandatory baseline checks and all relevant targeted tests. Never describe an unrun command as passing.

**Example:** Documentation-only work still runs lint and TypeScript validation.

### 5.9 Explain Decisions

Make non-obvious tradeoffs visible in the task report and, only where valuable, in code comments. Explain why the decision fits current product and architecture constraints.

**Example:** If an accessible chart summary belongs in a shared primitive, document why it is a component contract rather than a feature-only workaround.

### 5.10 No Silent Refactors

Do not rename, reorganize, reformat, or refactor unrelated code. Necessary refactoring must be declared and included in the report.

**Example:** Fixing a Program Builder row does not authorize reorganizing the workout directory.

### 5.11 Mobile First

Validate the smallest supported mobile viewport first. Consider touch targets, safe areas, dynamic viewport units, virtual keyboards, low/mid-range device performance, and background/resume behavior.

**Example:** A fixed action bar must remain reachable above the iOS home indicator and keyboard.

### 5.12 MundoFit Identity

Preserve the premium dark fitness language, Electric Lime emphasis, focused intensity, clear information hierarchy, and frictionless training interactions. Do not introduce generic SaaS, lifestyle, or wellness styling.

**Example:** Do not replace the approved primary action with a generic blue gradient from a component library.

### 5.13 Accessibility First

Accessibility is part of “done.” Evaluate semantics, accessible names, focus order and visibility, dialog behavior, keyboard operation, contrast, touch target size, non-color cues, reduced motion, zoom/reflow, and status announcements.

**Example:** A completed set uses icon, text/state semantics, and an announcement—not lime color alone.

### 5.14 Design System First

Build UI from approved tokens and components. Add an approved primitive when a stable shared contract is missing; do not bypass the design system locally.

**Example:** Goals and Progress Hub use one accessible progress primitive rather than two local implementations.

### 5.15 Performance First

Avoid unnecessary Client Components, rerenders, layout shifts, blocking requests, unbounded queries, large dependencies, and decorative animation. Preserve documented mobile performance targets.

**Example:** Use a Server Component for initial page data instead of adding a client fetch effect only for convenience.

### 5.16 Ask Instead of Assume

Ask when the answer would change product behavior, design, architecture, data, privacy, security, or scope. First inspect the repository for answers that are discoverable.

**Example:** Ask whether AI Coach conversations are persisted because it changes privacy and data architecture. Do not ask where shared components live without searching.

### 5.17 Think Before Coding

Do not start with edits. Confirm scope, read governing documents, inspect live code and uncommitted changes, identify affected boundaries and risks, and define validation first.

**Example:** Before editing workout-session UI, inspect its provider, router, views, overlays, translations, persistence rules, route shell, and QA reports.

### 5.18 Preserve User Work

Treat unrelated working-tree changes as user-owned. Never discard, rewrite, include, or “clean up” them without explicit authorization.

**Example:** Work around unrelated uncommitted files and list only task-owned files in the report.

### 5.19 Premium Completion

Where applicable, finished behavior covers loading, empty, error, disabled, success, long-content, interrupted, offline, and recovery states.

**Example:** AI Coach requires streaming, retry, failure, long-response, keyboard, safety, and offline behavior—not only a successful mockup.

## 6. Design Authority Contract

> [!CAUTION]
> Codex must faithfully implement approved MundoFit designs. Codex is an implementer and technical advisor, not an autonomous product designer.

Codex may improve implementation quality without changing the approved experience:

- performance;
- accessibility;
- maintainability.

Codex must never change the following without Product Owner or Human approval:

| Protected design area | Includes |
|---|---|
| **Colors** | Palette, semantic use, contrast mode, gradients, status colors, and brand emphasis |
| **Spacing** | Padding, gaps, rhythm, density, safe-area treatment, and component dimensions |
| **Typography** | Font family, scale, weight, line height, letter spacing, and numeric treatment |
| **Layouts** | Screen hierarchy, navigation, shell, responsive structure, and information placement |
| **UX** | Interaction behavior, labels, states, gestures, feedback, and accessibility model |
| **Animations** | Timing, easing, transitions, celebrations, motion hierarchy, and reduced-motion behavior |
| **Product flow** | Onboarding, navigation, workout sequence, data entry, confirmation, recovery, and completion flow |

An accessibility concern does not grant permission for an unrelated redesign. Implement the smallest compliant adjustment that preserves the approved intent; if compliance materially changes the design, request approval.

Authoritative design references include:

- `docs/design/MundoFit_V3_Design_System.md`;
- `docs/design/mundofit-v3-design-system.png`;
- `docs/reports/2026-07-06-design-system-analysis.md`;
- newer Product Owner- or Human-approved specifications and mockups.

## 7. Official Workflow

```text
+----------------+     +----------------+     +----------------+
|      Task      | --> |    Analysis    | --> | Implementation |
+----------------+     +----------------+     +--------+-------+
                                                     |
                                                     v
+----------------+     +----------------+     +--------+-------+
|     Commit     | <-- |     Review     | <-- |     Report     |
+----------------+     +--------+-------+     +--------+-------+
                              ^                        ^
                              |                        |
                              +------------------------+
                                       Validation
```

The required linear sequence is:

```text
Task → Analysis → Implementation → Validation → Report → Review → Commit
```

| Stage | Required activity | Exit condition |
|---|---|---|
| **Task** | Confirm objective, scope, constraints, outputs, and acceptance criteria. | The outcome is sufficiently clear to analyze safely. |
| **Analysis** | Read governing docs and live code; inspect dependencies, architecture, UX, risks, and current changes. | A bounded approach and validation plan exist. |
| **Implementation** | Make the smallest approved change and preserve unrelated work. | Requested behavior and documentation are implemented. |
| **Validation** | Run mandatory checks, targeted tests, and relevant manual QA. | Required evidence is available and mandatory checks pass. |
| **Report** | Create or finalize the dated task report from actual results. | The report matches the final task diff and validation. |
| **Review** | Product Owner/Human reviews scope, design, architecture, evidence, and risks. | Work is approved or returned for revision. |
| **Commit** | Commit only approved task files with a meaningful message. | One coherent commit represents the reviewed task. |

> [!WARNING]
> Do not skip Analysis, invent validation results, commit before review/authorization, or include unrelated working-tree changes.

If review finds a defect, return to Analysis and repeat Implementation, Validation, Report, and Review.

## 8. Documentation Map

| Document | Purpose | Maintenance rule |
|---|---|---|
| `AGENTS.md` | Entry point for AI roles, essential workflow, and repository-specific pre-implementation instructions. | Keep concise; point detailed standing policy to `PROJECT_RULES.md`. |
| `docs/ARCHITECTURE.md` | Approved system structure: stack, routing, auth, i18n, data flow, state boundaries, RLS conventions, modules, and performance targets. | Update only with an approved architecture change. |
| `docs/PROJECT_RULES.md` | Official operating manual: mission, authority, permanent rules, design governance, workflow, reporting, validation, and completion criteria. | Update when an approved project rule changes; every change requires a report and review. |
| `docs/ROADMAP.md` | Ordered product phases, priorities, milestones, dependencies, and exit criteria. | The Product Owner controls priority; implementation does not silently change it. |
| `docs/CHANGELOG.md` | User- and release-relevant history of shipped changes. The repository currently uses `docs/Changelog.md`; preserve that path until an approved naming migration. | Record released outcomes, not plans or internal task narration. Do not create a duplicate solely to change capitalization. |
| `docs/reports/` | Dated evidence of individual tasks, audits, decisions, validation, known issues, and implementation history. | Add one report per implementation task; reports are immutable history except for factual corrections. |

Supporting documents such as `docs/DATABASE.md`, `docs/PROJECT_CONTEXT.md`, design specifications, QA audits, and release reports remain authoritative in their specialist areas. When documents conflict, stop and request resolution according to the authority order in Section 1.

## 9. Reports

Every implementation task must generate:

```text
docs/reports/YYYY-MM-DD-task-name.md
```

Use lowercase kebab-case for `task-name`. If the filename already exists, use `YYYY-MM-DD-HHMM-task-name.md`; never overwrite unrelated history.

Reports describe completed facts, not expected results. Use this template:

```markdown
# <Task Name>

**Date:** YYYY-MM-DD
**Status:** Complete | Incomplete | Blocked

## Summary

<What was requested and what was delivered.>

## Files Created

- `path/to/file`

## Files Modified

- None

## Files Deleted

- None

## Architecture Changes

- None

## Decisions Made

- <Decision and rationale>

## Validation

| Check | Command | Result |
|---|---|---|
| ESLint | `npm run lint` | PASS / FAIL / NOT RUN |
| TypeScript | `npx tsc --noEmit` | PASS / FAIL / NOT RUN |
| Targeted tests | `<command>` | PASS / FAIL / N/A |
| Production build | `npm run build` | PASS / FAIL / NOT RUN |

## Testing Checklist

- [ ] Golden path
- [ ] Relevant edge cases
- [ ] Error/loading/empty states
- [ ] Accessibility
- [ ] Mobile viewport and safe areas
- [ ] Romanian, English, and Spanish copy where applicable

## Remaining TODOs

- None

## Known Issues

- None

## Notes

<Context for the next developer or reviewer.>
```

## 10. Validation

The mandatory baseline commands are:

```bash
npm run lint
npx tsc --noEmit
```

> [!IMPORTANT]
> A task is not complete until both commands pass. Record the exact commands and results in the task report.

Additional validation is proportional to impact:

| Change type | Additional validation |
|---|---|
| Server Action or form input | Prove Zod runs before mutation; test valid and invalid input. |
| Database or migration | Review RLS, ownership, indexes, generated types, and rollback impact. |
| UI component | Test keyboard, focus, semantics, contrast, touch targets, reduced motion, reflow, and relevant states. |
| Localization | Verify keys and layouts in Romanian, English, and Spanish. |
| Workout session | Test start, set logging, rest, pause/resume, transitions, finish, summary, background/resume, and recovery. |
| Performance-sensitive work | Inspect bundle, render, request/query behavior, and collect relevant profiling evidence. |
| Release-impacting work | Run `npm run build` and supported device/browser QA. |

Do not silently fix unrelated failures. Establish whether they predate the task, report the evidence, and separate remediation unless explicitly authorized.

## 11. Design System Rules

The approved dependency direction is:

```text
Design tokens
    ↓
UI primitives
    ↓
Shared composites
    ↓
Feature components
    ↓
Route screens
```

### Design tokens

Use approved semantic tokens for color, typography, spacing, radius, elevation, motion, z-index, and safe areas. Tokens are the shared contract between design specifications, Tailwind/CSS, and components.

- Do not add hardcoded colors when an approved semantic token exists.
- Do not introduce local values that duplicate an existing token.
- New tokens require design approval and documentation.
- Resolve token/specification conflicts before migrating components.

### Components

- Search existing primitives and feature patterns before creating a component.
- Do not duplicate the same visual and interaction contract across features.
- Keep `components/ui/` independent of feature data and feature components.
- Prefer typed variants and composition over arbitrary style escape hatches.
- Keep static primitives server-compatible; add `'use client'` only when browser behavior requires it.
- Reusable components must document purpose, variants, states, accessibility, and usage.

### Accessibility

Components own their accessibility contract. Features should not each reinvent focus trapping, error relationships, keyboard behavior, live regions, reduced motion, or accessible names.

**Prohibited:**

```tsx
<div className="text-[#aaff00]">Complete</div>
```

**Required direction:** use the approved semantic accent/status token and provide a non-color completion cue with correct semantics.

## 12. Coding Standards

### TypeScript and boundaries

- Keep strict TypeScript enabled.
- Do not introduce `any` without a documented boundary reason.
- Prefer discriminated unions for state and Server Action results.
- Validate external/runtime input with Zod; TypeScript alone is not runtime validation.
- Keep shared domain types authoritative; do not create parallel definitions.

### Readability and structure

- Use clear, domain-accurate names.
- Keep functions small, named, single-purpose, and testable.
- Prefer pure helpers for calculations and transformations.
- Build reusable components around stable contracts.
- Avoid duplicated business logic and UI.
- Avoid unnecessary complexity, premature abstraction, and speculative frameworks.
- Comments explain constraints or rationale, not obvious syntax.

### React and Next.js

- Prefer Server Components for data loading and static composition.
- Add Client Components only for state, effects, browser APIs, event handling, or client-only motion.
- Keep data access out of presentation primitives.
- Preserve locale routes, route-group responsibilities, and established Server Action patterns.
- Include loading, empty, error, disabled, and recovery behavior where relevant.

### Data, security, and localization

- Mutations use Server Actions and validate before execution.
- User-owned data requires verified RLS and authenticated ownership checks.
- Never expose raw database errors or secrets to clients, logs, reports, or committed files.
- Store weight in kilograms and height in centimeters; convert at input/display boundaries.
- No hardcoded user-facing copy; update Romanian, English, and Spanish together.
- Format dates, numbers, units, and pluralization by locale.

## 13. Mandatory Final Checklist

Execute this checklist before declaring any task complete:

### Scope and authority

- [ ] Requirements and acceptance criteria are satisfied.
- [ ] No feature creep or excluded lifestyle/wellness scope was introduced.
- [ ] Product Owner and Human decisions were respected.
- [ ] Any required approvals were obtained.

### Architecture and implementation

- [ ] Current architecture and data ownership were preserved.
- [ ] The task was implemented as the smallest coherent change.
- [ ] No silent or unrelated refactor was included.
- [ ] Existing user-owned working-tree changes were preserved.
- [ ] Strict TypeScript, Zod, RLS, security, and i18n implications were checked where relevant.

### Design and product quality

- [ ] Approved design and MundoFit identity were preserved.
- [ ] Mobile behavior, safe areas, keyboard, and background/resume were checked where relevant.
- [ ] Accessibility was checked where relevant.
- [ ] Design tokens and shared components were used.
- [ ] No hardcoded colors, duplicated UI, or hardcoded user-facing copy was introduced.
- [ ] Performance impact was considered.
- [ ] Golden path, edge cases, and relevant loading/error/empty/recovery states were tested.

### Evidence and handoff

- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] Relevant targeted tests and manual QA pass.
- [ ] The dated task report exists and matches the final diff.
- [ ] `git status` and the task diff were reviewed for unrelated changes.
- [ ] The work is ready for Product Owner/Human review.
- [ ] No commit was created without review/authorization.

If a mandatory item is unchecked, the task is not complete. Continue the workflow or report the exact blocker; never lower the standard silently.

---

## Maintenance

Update this manual only when an approved rule, authority boundary, workflow, product boundary, or engineering standard changes. Every update requires a dated report and Product Owner/Human review. Keep specialist detail in the appropriate architecture, database, design, roadmap, or QA document and link it here rather than creating conflicting sources of truth.
