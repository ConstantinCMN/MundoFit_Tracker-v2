# Official Project Rules

**Date:** 2026-07-06  
**Status:** Complete

## Summary

Created `docs/PROJECT_RULES.md` as the official operating manual and engineering constitution for MundoFit Tracker V2. The manual consolidates product mission and exclusions, product vision, role authority, permanent development rules, design governance, workflow, documentation ownership, reporting, validation, design-system rules, coding standards, and the mandatory completion checklist.

## Files Created

- `docs/PROJECT_RULES.md`
- `docs/reports/2026-07-06-project-rules.md`

## Files Modified

- None

## Files Deleted

- None

## Architecture Changes

- None. This task changed documentation only.

## Decisions Made

- Defined `docs/PROJECT_RULES.md` as the consolidated standing authority for future AI and human work.
- Preserved `docs/DEVELOPMENT_RULES.md` as an earlier handbook while stating that `PROJECT_RULES.md` governs overlapping or conflicting operating rules.
- Made the non-lifestyle product boundary explicit, including prohibited sleep, water, step, and generic wellness tracking.
- Preserved the current `docs/Changelog.md` path while documenting the requested `CHANGELOG.md` responsibility, avoiding an unapproved filename migration or duplicate document.
- Kept future platforms and exercise categories as compatibility requirements, not authorization to implement roadmap features prematurely.

## Validation

| Check | Command | Result |
|---|---|---|
| ESLint | `npm run lint` (executed through `npm.cmd run lint`) | PASS — no warnings or errors |
| TypeScript | `npx tsc --noEmit` (executed through `npx.cmd`) | PASS |
| Documentation scope | Final task-file and working-tree review | PASS — task changes are documentation only |
| Production build | `npm run build` | NOT RUN — not required for documentation-only work |

## Testing Checklist

- [x] Requested sections and product boundaries included
- [x] Team authority and approval flow documented
- [x] Design authority and protected design areas documented
- [x] Workflow, report template, validation, and final checklist included
- [x] Documentation-only scope maintained during implementation
- [x] Mandatory validation commands pass
- [x] Final task diff and working tree reviewed

## Remaining TODOs

- None.

## Known Issues

- None identified in the task-owned documentation.

## Notes

The required source documents were read before drafting. Pre-existing untracked files were treated as user-owned and were not modified.

PowerShell initially blocked `npm.ps1` under the machine execution policy. Running the same npm and npx commands through their Windows `.cmd` shims avoided that shell-only restriction. Lint then required permission to write its cache under `.next`; after permission was granted, it completed successfully. The lint script also reports that `next lint` is deprecated for Next.js 16, but this does not affect the passing result for the current project.
