# Development Rules Handbook

**Date:** 2026-07-06  
**Status:** Complete

## Summary

Created the official engineering handbook for MundoFit Tracker V2. The handbook defines project philosophy, team authority, development rules, delivery workflow, reporting, validation, design-system governance, component standards, Git practices, documentation requirements, AI behavior, coding standards, mobile-platform compatibility, and the mandatory task-completion checklist.

The handbook was aligned with `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/reports/2026-07-06-design-system-analysis.md`. No application source code was changed.

## Files Created

- `docs/DEVELOPMENT_RULES.md`
- `docs/reports/2026-07-06-development-rules.md`

## Files Modified

- None

## Files Deleted

- None

## Architecture Changes

- None.
- The handbook documents existing architecture and approval boundaries; it does not alter route groups, data flow, state ownership, RLS, authentication, or server/client boundaries.

## Decisions Made

- Defined the Human as final product/business authority, ChatGPT as Product Owner/Technical Lead, and Codex as the implementing Developer.
- Required all tasks to follow `Task → Analysis → Implementation → Validation → Report → Review → Commit`.
- Established `docs/reports/YYYY-MM-DD-task-name.md` as the standard report name, with an optional `HHMM` collision suffix for repeated same-day task names.
- Reconciled TypeScript validation guidance by requiring `npx tsc --noEmit` and noting that `npm run type-check` currently invokes the same compiler check.
- Made lint and TypeScript passing mandatory before a task can be marked complete.
- Preserved current architecture rules: Server Components by default, Server Actions for mutations, Zod validation, RLS, locale parity, canonical metric storage, and a chrome-free workout session.
- Limited future Android, iOS, Huawei, and AI readiness guidance to platform-neutral boundaries; no native or AI-provider architecture was selected.
- Specified that committing occurs only after review/authorization, preventing the workflow from implicitly authorizing unrequested Git changes.

## Validation

| Check | Command | Result |
|---|---|---|
| ESLint | `npm.cmd run lint` (Windows equivalent of `npm run lint`) | PASS — no warnings or errors |
| TypeScript | `npx.cmd tsc --noEmit` (Windows equivalent of `npx tsc --noEmit`) | PASS |
| Markdown structure | Required heading and content inspection | PASS |
| Production build | Not run | Not required for documentation-only changes |

The first PowerShell invocation of `npm run lint` was blocked by the system execution policy for `npm.ps1`. Running the Windows command shim reached the project script. The sandboxed run then could not write the Next.js ESLint cache, so the mandatory check was rerun with approved filesystem access and passed. Next.js also emitted a deprecation notice for `next lint`; migrating the package script to the ESLint CLI should be handled as a separate approved tooling task.

## Testing Checklist

- [x] All 15 requested handbook sections are present.
- [x] Required role responsibilities are documented.
- [x] Every development rule is expanded with practical guidance or an example.
- [x] Workflow and escalation diagrams are included.
- [x] Standard report template is included.
- [x] Mandatory validation commands and completion rule are included.
- [x] Design-system, component, accessibility, and MundoFit identity rules are included.
- [x] Android, iOS, and future Huawei compatibility are documented.
- [x] Final completion checklist is included.
- [x] No application source code was modified.

## Remaining TODOs

- Consider migrating the deprecated `next lint` package script to the ESLint CLI in a separate tooling task.
- Consider updating `AGENTS.md` in a separately approved governance task if a single report naming convention is desired across both documents.

## Known Issues

- The existing `npm run lint` script uses deprecated `next lint`, although it currently passes.
- Windows PowerShell execution policy blocks the `npm.ps1` shim in this environment; `npm.cmd` and `npx.cmd` work.

## Notes

- The handbook intentionally distinguishes approved rules from future platform decisions.
- Existing unrelated untracked workspace content was preserved.
