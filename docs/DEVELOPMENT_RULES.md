# MundoFit Tracker V2 — Development Rules

> [!IMPORTANT]
> This document is the official engineering handbook for MundoFit Tracker V2. Every human or AI developer must read and follow it before analyzing, implementing, reviewing, or documenting project work.

**Status:** Official  
**Audience:** Product Owner, AI developers, human contributors, and reviewers  
**Applies to:** Application code, design-system work, database changes, tests, documentation, scripts, and configuration

## 1. Purpose

This handbook defines how MundoFit Tracker V2 is designed, implemented, validated, documented, reviewed, and committed. Its purpose is to preserve product identity, architecture, quality, accessibility, and engineering context as the project grows across many development sessions and contributors.

Every AI working on MundoFit must follow these rules. A task prompt may add stricter requirements, but it may not silently weaken this handbook. When a task conflicts with this handbook, the developer must stop, identify the conflict, and request a decision from the Product Owner or Human.

The governing documentation should be read in this order:

1. `AGENTS.md`
2. `docs/DEVELOPMENT_RULES.md`
3. `docs/PROJECT_CONTEXT.md`
4. `docs/ROADMAP.md`
5. `docs/ARCHITECTURE.md`
6. Relevant design, database, QA, and recent report documents
7. The live code affected by the task

> [!NOTE]
> Reports and context files describe prior work. The live repository remains the factual source of truth for current implementation details.

## 2. Project Philosophy

MundoFit is not a generic fitness tracker. It is a focused, premium fitness platform designed to support the complete training lifecycle: planning, workout execution, body tracking, progress analysis, goals, and intelligent coaching.

| Principle | Meaning in practice |
|---|---|
| **Premium Fitness Platform** | Every screen must feel deliberate, focused, fast, and trustworthy. Temporary-looking UI, inconsistent controls, and low-quality states are not acceptable as finished work. |
| **Mobile First** | Design and implementation begin with touch, safe areas, small screens, virtual keyboards, interrupted sessions, and real-device performance. Desktop is a centered extension of the mobile experience. |
| **Design First** | Approved UX, mockups, and design-system rules are understood before UI code is written. The developer implements the approved language; the developer does not invent a replacement visual direction. |
| **Component First** | Features are assembled from reusable tokens, primitives, and shared patterns. A local one-off component is justified only when its behavior is genuinely feature-specific. |
| **Accessibility First** | Accessibility is part of the component contract, not a cleanup phase. Contrast, focus, semantics, touch targets, reduced motion, non-color cues, and assistive technology are considered from the start. |
| **AI Ready** | Components and data boundaries should be capable of supporting AI Coach and future intelligent workflows without coupling core product behavior to an unapproved AI provider or model. |
| **Universal Fitness Platform** | The platform must support different bodies, goals, experience levels, training environments, languages, units, accessibility needs, and future device ecosystems. |

MundoFit's identity is premium dark-mode fitness with focused intensity, high information clarity, Electric Lime brand emphasis, and frictionless workout interactions. Generic dashboard templates, wellness-app styling, and arbitrary “modernization” are outside the product direction.

## 3. Team Roles

Clear ownership prevents an AI developer from silently becoming the product manager or architect.

| Role | Actor | Responsibilities | Authority boundary |
|---|---|---|---|
| **Product Owner / Technical Lead** | ChatGPT | Architecture, roadmap, QA direction, UX decisions, technical decisions, acceptance criteria, prioritization | Defines what should be built and approves product/technical direction. Does not replace the Human's final authority. |
| **Developer** | Codex | Implementation, approved refactoring, bug fixing, tests, documentation, validation, task reports | Executes approved work. May identify risks and recommend improvements, but may not redefine scope, architecture, roadmap, or product decisions. |
| **Human** | User | Product vision, final approval, business decisions, release authority | Final authority. Resolves disputed or high-impact product and business decisions. |

### Decision escalation

```text
Implementation question
        |
        v
Can the answer be proven from current code or approved documentation?
        |
   +----+----+
   | Yes     | No / conflicting guidance
   v         v
Proceed      Ask Product Owner
             |
             v
      Business/final approval needed?
             |
             v
          Ask Human
```

## 4. Development Rules

### 4.1 Product Owner Authority

The Developer implements the Product Owner's approved architecture, roadmap, UX, and technical decisions. Suggestions are welcome; unilateral product decisions are not.

**Example:** The Developer may recommend moving an AI Coach action out of the bottom navigation for information-architecture reasons. The Developer may not change the five-tab navigation without approval.

### 4.2 Design Authority

Approved mockups and the official MundoFit Design System define visual authority. A mismatch must be raised before implementation, not resolved through personal preference.

**Example:** If a mockup and the Tailwind radius configuration disagree, document the conflict and request a decision. Do not choose whichever value looks better locally.

### 4.3 No Feature Creep

Implement only the requested behavior and the minimum supporting work required to make it correct, accessible, and maintainable.

**Example:** A task to fix workout timer persistence does not authorize adding achievements, notifications, or a new workout summary.

### 4.4 Architecture First

Read and preserve existing route groups, server/client boundaries, data flow, RLS conventions, state ownership, and validation patterns. Architecture changes require explicit approval.

Protected constraints include:

- Server Components by default; Client Components only for required interactivity.
- Mutations through Server Actions, not client-side database writes or ad hoc API CRUD.
- Zod validation at every changed input boundary before mutation.
- Discriminated Server Action results.
- RLS on every user-owned table.
- Locale-aware routes and copy.
- Metric storage in kilograms and centimeters; conversion at the render boundary.
- A chrome-free `(session)` route group.
- Absolute timestamps for session timers, not decrement-only counters.

**Example:** A new goal form should call a validated Server Action. It must not write directly through the browser Supabase client because that appears faster to implement.

### 4.5 Reuse First

Search for an existing token, component, hook, validation schema, helper, type, and pattern before creating one. Reuse must be semantically correct, not forced.

**Example:** Extend the approved `Card` primitive with a documented variant when a goal card shares the same structure. Do not copy a dashboard card into the Goals module and rename it.

### 4.6 Small Tasks

Break large objectives into independently reviewable tasks with one clear outcome. Avoid broad migrations that mix foundation work, features, and cleanup.

**Example:** “Implement accessible BottomSheet and migrate ExerciseDetailSheet” is reviewable. “Refactor every modal and redesign workouts” is not.

### 4.7 Reports Required

Every completed task creates a report in `docs/reports/`. Reports record actual work, validation, decisions, known issues, and follow-up items. A chat summary is not a substitute.

**Example:** A one-line bug fix still receives a concise report that identifies the root cause, changed file, test evidence, and build status.

### 4.8 Validation Required

The Developer must run the mandatory validation commands and relevant targeted tests. A task is not complete while required validation fails.

**Example:** “The change is documentation-only” does not justify claiming validation passed without running the required commands. If an existing tooling defect prevents validation, report the exact command and output, then obtain direction.

### 4.9 Explain Decisions

Non-obvious implementation decisions and tradeoffs must be made visible in code comments where necessary and in the task report.

**Example:** If a chart wrapper exposes a text summary for accessibility, document why the summary belongs in the primitive contract rather than only in one feature.

### 4.10 No Silent Refactors

Do not rename, reorganize, reformat, or refactor unrelated code while implementing a task. Necessary refactoring must be called out before or during the work and listed in the report.

**Example:** Fixing a Program Builder row does not authorize reorganizing the workout directory. Propose the directory change as a separate task.

### 4.11 Mobile First

Validate the smallest supported mobile layout before desktop. Account for touch input, 44 × 44 px targets, safe areas, dynamic viewport units, virtual keyboards, and background/resume behavior.

**Example:** A bottom action bar must remain usable above the iOS home indicator and must not be covered when an input opens the keyboard.

### 4.12 MundoFit Identity

Preserve the official premium dark visual language and interaction tone. Do not introduce generic SaaS dashboards, unrelated colors, unapproved typefaces, or playful motion that weakens focused intensity.

**Example:** A primary workout CTA uses approved Electric Lime tokens and MundoFit typography. It does not use a generic blue gradient because a component library defaults to it.

### 4.13 Accessibility First

Build accessible behavior into the first implementation. At minimum, evaluate semantics, accessible names, focus order, focus visibility, dialog behavior, contrast, touch targets, non-color cues, reduced motion, zoom/reflow, and status announcements.

**Example:** Set completion is communicated by a check icon, text/state semantics, and an announcement—not lime color alone.

### 4.14 Design System First

All UI work starts with existing design tokens and components. Missing primitives should be added to the approved design system before being copied across features.

**Example:** If Progress Hub and Goals need the same progress bar, implement one accessible `Progress` primitive and compose both features from it.

### 4.15 Premium Quality

Finished work includes loading, empty, error, disabled, success, long-content, and interrupted states where relevant. “Golden path only” is not premium quality.

**Example:** An AI Coach message list must define streaming, retry, failure, long response, keyboard, and offline states—not only the successful response mockup.

### 4.16 Ask, Don't Assume

Ask when a missing answer would materially alter product behavior, architecture, data, security, or approved design. Do not use clarification as a substitute for reading the repository.

**Example:** Ask whether AI Coach advice is stored and synchronized because that affects privacy and data architecture. Do not ask where shared UI lives when the repository can answer it.

### 4.17 Preserve Context

Read current project context, recent reports, affected code, and existing uncommitted changes. Treat unrelated changes as user-owned and preserve them.

**Example:** If a target file already contains uncommitted edits, understand and work around them. Never discard them with a reset or checkout.

### 4.18 Performance First

Avoid unnecessary client components, rerenders, layout shifts, large bundles, blocking requests, unbounded queries, and decorative animation. Preserve the documented performance targets.

| Metric | Target |
|---|---:|
| Largest Contentful Paint | `< 2.5 s` on mobile 4G |
| Interaction response | `< 100 ms` target for immediate interactions |
| Cumulative Layout Shift | `< 0.1` |

**Example:** Fetch initial page data in a Server Component instead of shipping a client fetch effect solely for convenience.

### 4.19 Think Before Coding

Do not begin with edits. Read guidance, inspect the live implementation, identify affected boundaries and risks, define validation, and then implement the smallest correct change.

**Example:** Before changing workout-session UI, inspect the provider, router, views, overlays, QA report, route layout, translations, and persistence rules.

## 5. Workflow

The official delivery workflow is:

```text
+----------------+
|      Task      |
+-------+--------+
        |
        v
+----------------+
|    Analysis    |
+-------+--------+
        |
        v
+----------------+
| Implementation |
+-------+--------+
        |
        v
+----------------+
|   Validation   |
+-------+--------+
        |
        v
+----------------+
|     Report     |
+-------+--------+
        |
        v
+----------------+
|     Review     |
+-------+--------+
        |
        v
+----------------+
|     Commit     |
+----------------+
```

### Workflow stages

| Stage | Required activity | Exit condition |
|---|---|---|
| **Task** | Confirm objective, scope, constraints, required output, and acceptance criteria. | The requested outcome is unambiguous enough to analyze safely. |
| **Analysis** | Read required docs and affected live code; inspect dependencies, current changes, architecture, UX, and risk. | A bounded implementation approach and validation plan exist. |
| **Implementation** | Make the smallest approved change; preserve unrelated work; communicate material decisions. | Requested behavior and required documentation are implemented. |
| **Validation** | Run lint, TypeScript, relevant tests/builds, and manual QA for golden path and edge cases. | Required checks pass and evidence is recorded. |
| **Report** | Create the dated task report with files, decisions, tests, status, and remaining issues. | Report accurately matches the final working tree and command results. |
| **Review** | Product Owner/Human evaluates scope, UX, architecture, QA evidence, and risks. | Work is approved or revision is requested. |
| **Commit** | Commit only the task's files with a meaningful message after review/authorization. | One coherent commit represents the approved task. |

> [!WARNING]
> Do not skip from Task directly to Implementation. Do not describe unrun validation as passed. Do not commit unrelated user changes.

### Rework loop

```text
Review finds a defect
        |
        v
Analysis -> Implementation -> Validation -> Report update -> Review
```

## 6. Reports

Every task must create:

```text
docs/reports/YYYY-MM-DD-task-name.md
```

Use lowercase kebab-case for `task-name`. If the same task name would collide on the same date, append a 24-hour timestamp before the task name:

```text
docs/reports/YYYY-MM-DD-HHMM-task-name.md
```

The report is an implementation record, not a plan or marketing summary. It must reflect the repository after validation.

### Standard report template

```markdown
# <Task Name>

**Date:** YYYY-MM-DD
**Status:** Complete | Incomplete | Blocked

## Summary

<What was requested and what was delivered.>

## Files Created

- `path/to/file`

## Files Modified

- `path/to/file`

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

<Important context for the next developer or reviewer.>
```

Reports must never claim `PASS` based on expectation. Record the exact command result. If a check is not relevant or cannot run, explain why and leave the task incomplete unless the Product Owner approves the exception.

## 7. Validation

The mandatory baseline validation commands are:

```bash
npm run lint
npx tsc --noEmit
```

A task is **not complete** until both commands pass.

`npm run type-check` may also be used because the current package script invokes `tsc --noEmit`, but the report must still show the actual command that was run.

Additional validation depends on impact:

| Change type | Additional required validation |
|---|---|
| Server Action or form boundary | Confirm Zod schema executes before mutation; test invalid and valid inputs. |
| Database or migration | Review RLS, ownership, indexes, rollback implications, and generated types. |
| UI component | Keyboard, focus, screen reader semantics, contrast, touch targets, reduced motion, mobile reflow. |
| i18n copy | Keys exist in `ro`, `en`, and `es`; test long translations and interpolation. |
| Workout session | Start, log set, rest, pause/resume, transition, finish, summary, background/resume, error path. |
| Performance-sensitive work | Bundle/render/query review and relevant Lighthouse or profiling evidence. |
| Release-impacting work | `npm run build` and supported-browser/device QA. |

> [!CAUTION]
> Do not fix unrelated validation failures silently. Prove whether the failure predates the task, report it, and ask whether remediation should be a separate task.

## 8. Design System

Every UI component must follow the official MundoFit Design System and approved premium mockups.

Authoritative design references include:

- `docs/design/MundoFit_V3_Design_System.md`
- `docs/design/mundofit-v3-design-system.png`
- `docs/reports/2026-07-06-design-system-analysis.md`
- Any newer Product Owner-approved design specification or mockup

Rules:

- No generic redesigns.
- No visual changes without Product Owner approval.
- No alternative color, typography, radius, spacing, shadow, or motion systems.
- Dark mode remains the approved product direction unless explicitly changed.
- The workout session remains a focused, chrome-free experience.
- Accessibility behavior is part of the design system.
- When the design system lacks a required primitive, propose or implement an approved extension; do not bypass the system locally.

**Approved dependency direction:**

```text
Design tokens
    -> UI primitives
        -> shared composites
            -> feature components
                -> route screens
```

## 9. Component Rules

| Rule | Required practice | Prohibited example |
|---|---|---|
| **Reuse before create** | Search `components/ui`, layout, feature UI, hooks, and utilities first. | Creating `GoalButton` when the shared `Button` contract already covers it. |
| **No duplicated UI** | Extract a shared primitive when the same interaction and visual contract appears across features. | Copying a modal implementation into three feature folders. |
| **No hardcoded colors** | Use approved semantic color tokens or documented data-series/category tokens. | `text-[#aaff00]` in new feature code when `text-accent` is available. |
| **No hardcoded spacing** | Use approved spacing/layout tokens and shared recipes. | Repeating arbitrary `17px` padding across cards. |
| **Use design tokens** | Consume semantic tokens for color, typography, radius, elevation, spacing, motion, and z-index. | Adding a local CSS variable that duplicates an existing global token. |
| **Accessibility** | Components own semantics, states, focus behavior, touch size, reduced motion, and accessible naming. | Requiring each feature to remember its own dialog focus trap. |
| **Typed APIs** | Props express valid variants and states; avoid loosely typed style escape hatches. | Accepting arbitrary variant strings or `any`. |
| **Composition** | Prefer slots/children and small focused components over large conditional components. | A single component containing data fetching, modal state, chart config, and form mutation. |
| **Localization** | Reusable components accept translated content; feature copy uses `next-intl`. | Hardcoded English labels inside a shared component. |
| **Server/client discipline** | Keep primitives server-compatible unless browser state or motion requires a Client Component. | Adding `'use client'` to a static Card component. |

Escape hatches such as `className` do not authorize bypassing the design system. Any intentional exception must be documented in the component and task report.

## 10. Git Rules

1. Keep commits small and coherent.
2. One task equals one commit.
3. Use meaningful imperative commit messages.
4. Never mix unrelated changes.
5. Never discard or rewrite user-owned work.
6. Do not use destructive Git commands without explicit Human approval.
7. Review `git status` and the task diff before reporting or committing.
8. Commit only after review/authorization in the official workflow.

### Commit message examples

```text
docs: add official development handbook
feat(workouts): add accessible rest timer controls
fix(dashboard): correct scheduled workout progress
refactor(ui): migrate sheets to shared dialog primitive
```

Avoid vague messages:

```text
updates
fix stuff
changes
wip
```

If one task produces unrelated formatting, dependency, refactor, and feature changes, the task is too broad or the diff is contaminated. Separate the work before review.

## 11. Documentation Rules

- Every architectural decision must be documented in the relevant architecture record or approved project document.
- Every architecture change requires Product Owner approval before implementation.
- Every new reusable component must document purpose, variants, states, accessibility behavior, and usage examples.
- Every sprint must produce a report.
- Every completed task must produce a task report.
- Documentation must match live code; update stale paths, commands, and constraints as part of the owning task.
- Do not duplicate authoritative content across documents when a link and concise summary are sufficient.
- Use professional Markdown, descriptive headings, tables for structured rules, diagrams for flows, and callouts for critical constraints.
- Mark proposals as proposals. Do not present unapproved plans as implemented architecture.

> [!IMPORTANT]
> Documentation changes that redefine authority, architecture, security, data ownership, or product behavior require the same review as code changes.

## 12. AI Behaviour

Codex must never redesign MundoFit.

Codex may:

- identify defects and inconsistencies;
- suggest improvements with evidence and tradeoffs;
- propose a safer or simpler implementation;
- ask for missing product or architecture decisions;
- implement approved work and validate it rigorously.

Codex must not:

- change product decisions;
- reprioritize the roadmap;
- introduce unrequested features;
- change architecture without approval;
- replace the design language with personal preferences;
- claim checks passed when they were not run;
- hide risks, limitations, or unrelated working-tree changes;
- assume authority to commit, deploy, publish, delete, or contact external parties beyond the task.

If unsure: **ask**. Never assume when the answer changes scope, architecture, security, data, or product behavior.

The AI should remain autonomous on discoverable, reversible implementation details. It should read the code and make reasonable local decisions rather than interrupting the Human for facts already present in the repository.

## 13. Coding Standards

### TypeScript

- Keep strict TypeScript enabled.
- Do not introduce `any` without an explicit, documented boundary reason.
- Prefer discriminated unions for state and Server Action results.
- Validate runtime input with Zod; TypeScript types alone do not validate external input.
- Keep shared domain types in approved type modules and avoid parallel definitions.

### React and Next.js

- Prefer Server Components for data loading and static composition.
- Add `'use client'` only for state, effects, browser APIs, event handling, or client-only animation.
- Keep data access out of presentation primitives.
- Avoid effect-driven data fetching when server rendering or a Server Action is the established pattern.
- Preserve route-group responsibilities and locale routing.

### Functions and logic

- Keep functions small, named, and single-purpose.
- Prefer pure helpers for calculations and transformations.
- Avoid duplicated business logic; centralize one authoritative implementation.
- Avoid unnecessary abstraction. Extract after identifying a stable shared contract, not merely similar syntax.
- Make error paths explicit and do not expose raw database errors to clients.

### Data and security

- All mutations use Server Actions.
- Validate before mutation.
- Enable and verify RLS for every user-owned table.
- Scope reads and writes to the authenticated user.
- Never put secrets in client code, logs, reports, or committed configuration.
- Store weight in kilograms and height in centimeters; convert only for display/input boundaries.

### Internationalization

- No hardcoded user-facing copy in components.
- Add every key to Romanian, English, and Spanish together.
- Format dates, numbers, units, and pluralization by locale.
- Test layout with the longest translation, not only English.

### Quality

- Prefer reusable components and avoid duplicated logic.
- Include loading, empty, error, disabled, and recovery states where applicable.
- Comments explain why, constraints, or non-obvious behavior; they do not narrate obvious syntax.
- Remove dead code introduced by the task, but do not perform unrelated cleanup.

## 14. Future Compatibility

MundoFit targets the following mobile ecosystems:

| Priority | Platform | Engineering expectation |
|---|---|---|
| **Primary** | Android | Touch-first behavior, responsive mobile layouts, Chrome/WebView compatibility, safe performance on mid-range devices. |
| **Primary** | iOS | Safari/WebView compatibility, dynamic viewport and safe-area handling, virtual keyboard behavior, background/resume correctness. |
| **Future** | Huawei | Avoid unnecessary dependency on Google-only services; keep platform integrations behind interfaces that can support Huawei alternatives. |

Future compatibility rules:

- Keep core fitness logic, validation, and data contracts platform-neutral.
- Isolate platform capabilities such as health data, notifications, haptics, camera, storage, authentication, and billing behind explicit adapters.
- Do not make Apple Health, Google Fit/Health Connect, Firebase, or another vendor a hidden requirement for core workflows.
- Use web standards and progressive enhancement where possible.
- Preserve metric canonical storage and locale/unit rendering boundaries.
- Treat offline, background/resume, permissions, safe areas, and constrained connectivity as normal mobile conditions.
- Require Product Owner approval before selecting a native wrapper, PWA strategy, health integration, notification provider, or app-store architecture.

“AI Ready” follows the same rule: core UI and domain behavior should not depend directly on one model vendor. AI provider, safety, persistence, privacy, and streaming architecture require explicit approval.

## 15. Final Checklist

Execute this checklist before declaring any task complete:

- [ ] Requirements satisfied
- [ ] Scope contains no feature creep
- [ ] Current architecture respected
- [ ] Design respected
- [ ] MundoFit identity preserved
- [ ] Mobile behavior checked
- [ ] Accessibility checked
- [ ] No duplicated code or UI introduced
- [ ] No hardcoded user-facing copy introduced
- [ ] Design tokens and shared components used
- [ ] Zod validation checked for changed input boundaries
- [ ] RLS/security implications checked where relevant
- [ ] Romanian, English, and Spanish checked where relevant
- [ ] Golden path and relevant edge cases tested
- [ ] Report generated
- [ ] Lint PASS — `npm run lint`
- [ ] TypeScript PASS — `npx tsc --noEmit`
- [ ] Working tree reviewed for unrelated changes
- [ ] Ready for Product Owner review

If any mandatory item is unchecked, the task is not complete. Record the gap honestly and continue the workflow or request direction.

---

## Maintenance

Update this handbook when an approved engineering rule changes. Keep rules concise, link to authoritative specialist documents, and record handbook changes in a dated report. Changes to authority, workflow, validation, architecture governance, or product identity require Product Owner and Human review.
