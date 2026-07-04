# AGENTS.md — MundoFit Tracker V2

Read this file before implementing any feature or making any non-trivial change.

---

## AI Workflow

Two separate AI roles collaborate on this project. Do not blur them.

### ChatGPT
- Product Owner
- Technical Lead
- Architecture
- Roadmap
- QA

### AI Coding Agent (Claude / Codex)
- Implementation
- Refactoring
- Tests
- Documentation
- Reports

The coding agent executes within the architecture and roadmap that ChatGPT (Product Owner / Technical Lead) has set. It does not originate architecture decisions, redefine scope, or reprioritize the roadmap — it implements, documents, and reports back.

---

## Rules

- Never change architecture without approval.
- Always read AGENTS.md first.
- Always validate TypeScript and Zod.
- Always generate a report.
- Never skip QA before closing a feature.

---

## Pre-Implementation Checklist

Before writing any code for a feature or fix:

1. Read `AGENTS.md` (this file).
2. Read `docs/ROADMAP.md` — confirm the work matches the current phase and exit criteria.
3. Read `docs/PROJECT_CONTEXT.md` — confirm current focus and any active constraints.
4. Analyze the affected module — read the actual current code, not memory of it. Do not assume prior audits or reports still reflect the live state.
5. Never modify architecture (route groups, data model, state-management pattern, RLS model, server/client boundary) without explicit approval. If a task seems to require an architecture change, stop and ask before proceeding.
6. Validate TypeScript: `npm run type-check` must pass with no new errors.
7. Validate Zod: any new or changed input boundary (forms, Server Action parameters) must have a corresponding Zod schema in `lib/validations/`, and it must actually run before the mutation executes.
8. Generate a report in `docs/reports/` (see Reporting below) — and never close out a feature without a QA pass over the change (manual verification of the golden path + edge cases, or the `/code-review` / `/verify` skills where applicable).

---

## Reporting Convention

After every completed development task:

1. Get the current time: `date +%H%M`.
2. Save a report to `docs/reports/YYYY-MM-DD-HHMM-<short-task-name>.md` with sections: Summary, Files Created, Files Modified, Files Deleted, Architecture Changes, Decisions Made, Remaining TODOs, Known Issues, Testing Checklist, Build Status (TypeScript / ESLint / Production Build), Notes.
2. Post a short Executive Summary in chat (≤ 15 lines) pointing to the saved report. Full detail belongs in the report file, not in chat.

---

## Reference Docs

- `docs/ARCHITECTURE.md` — stack, routing, auth flow, i18n, data flow, RLS conventions.
- `docs/DATABASE.md` — full schema, RLS policies, triggers.
- `docs/ROADMAP.md` — phased delivery plan and exit criteria.
- `docs/PROJECT_CONTEXT.md` — current focus, in-flight modules, non-obvious constraints.
- `docs/qa/` — QA audits of specific subsystems.
- `docs/reports/` — dated implementation reports (history of what was actually built, by whom, when).
