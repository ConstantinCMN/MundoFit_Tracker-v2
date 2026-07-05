# MundoFit Multi-Agent System — `.claude/agents/`

**Date:** 2026-07-05 10:20
**Task:** Design a production-quality, complementary multi-agent system for Claude Code, specific to MundoFit Tracker V2, following `AGENTS.md`.

---

## Summary

Created `.claude/agents/` with six agent definitions. Each contains the required sections (Purpose, Responsibilities, Scope, What CAN modify, What MUST NEVER modify, Required workflow, Coding standards, Communication style, Definition of Done) plus YAML frontmatter (`name`, `description`, `tools`) so Claude Code can route to them automatically. All six explicitly defer to `AGENTS.md` for the pre-implementation checklist and reporting convention rather than restating it. Project-specific knowledge (stack, schema, design tokens, roadmap state, non-obvious constraints) lives exclusively in `mundofit-expert.md`; the other five are pure role/process definitions with zero MundoFit-specific facts, making them reusable as-is in future versions of the product.

## Files Created

| File | Role |
|---|---|
| `.claude/agents/mundofit-expert.md` | Project knowledge base and Q&A oracle |
| `.claude/agents/developer.md` | Feature implementation |
| `.claude/agents/architect.md` | Architecture analysis, planning, approval gating |
| `.claude/agents/ui-designer.md` | Visual/interaction layer, design-system stewardship |
| `.claude/agents/qa-engineer.md` | Verification and findings reporting |
| `.claude/agents/documentation.md` | Reference-doc upkeep |
| `docs/reports/claude-agents-system.md` | This report |

## Purpose of Each Agent

**`mundofit-expert`** — Holds every MundoFit-specific fact (Next.js/Supabase/next-intl stack, route groups, schema, RLS/cascade behavior, design tokens, i18n rules, roadmap position, and the documented non-obvious constraints and known gaps) so the other five agents never have to re-derive or duplicate it. Read-only over the codebase (tools: `Read, Grep, Glob, Edit`) — the only file it can write is itself, and only to correct drift once verified against the live repo. Not an implementation agent.

**`developer`** — Implements features, fixes, and refactors inside the existing architecture, existing design tokens, and existing data model. Owns `app/`, `components/`, `lib/`, `data/exercises/`, `messages/*.json`, and additive-only migrations. Cannot originate architecture changes, redefine visual design, or author QA findings.

**`architect`** — Analyzes structural questions (schema, RLS, route-group boundaries, state-management patterns, the three coexisting Server Action return conventions) and produces written, tradeoff-explicit plans — mirroring the standard already set by `docs/reports/exercise-library-migration-plan.md`. Never originates a final decision or executes anything destructive without explicit recorded approval, per `AGENTS.md`'s "never change architecture without approval" rule.

**`ui-designer`** — Owns the visual/interaction layer against `docs/design/MundoFit_V3_Design_System.md`: styling, layout, motion, token compliance, accessibility, route-group chrome correctness. Also the sole owner of the design-system documentation itself (`docs/design/**`, `UI_UX.md`, `UI-Guidelines.md`). Does not touch data-fetching/mutation logic.

**`qa-engineer`** — Verifies golden paths and edge cases before a feature is considered done, re-checks prior audit findings against current code rather than trusting them at face value, and produces severity-ranked (Critical/High/Medium/Low) findings with concrete reproduction evidence. Reports defects; does not fix them unless explicitly asked in the same task. Sole owner of `docs/qa/**`.

**`documentation`** — Keeps `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/ROADMAP.md`, `docs/PROJECT_CONTEXT.md`, `docs/Coding-Standards.md`, `docs/Changelog.md`, and `docs/releases/**` synchronized with verified live-repo state, preserving the existing "known gap, not silently resolved" documentation voice. Records architecture decisions once approved and shipped; does not make them.

## How the Agents Complement Each Other (no overlap)

| Domain | Owner |
|---|---|
| MundoFit facts/knowledge | `mundofit-expert` |
| Feature code (`app/`, `components/`, `lib/`, `data/`) | `developer` |
| Schema/RLS/state-pattern decisions | `architect` |
| Visual/motion/design-token code + design-system docs | `ui-designer` |
| Verification, findings, `docs/qa/**` | `qa-engineer` |
| Reference docs (`ARCHITECTURE.md`, `DATABASE.md`, `ROADMAP.md`, `PROJECT_CONTEXT.md`, `Coding-Standards.md`, `Changelog.md`, `docs/releases/**`) | `documentation` |
| `AGENTS.md` and every other agent's own `.md` file | No agent — human/Product-Owner territory in all six files |

Each file's "MUST NEVER modify" section explicitly names the other five agents' domains, so the boundaries are enforced by cross-reference rather than by accident.

## Recommendations

- **No `CLAUDE.md` exists at the repo root.** Consider running `/init` to codify house-wide conventions there; the six agents already point to `AGENTS.md` and `docs/Coding-Standards.md` as authoritative, so a `CLAUDE.md` would sit above both without conflicting, but that decision belongs to the human/Product-Owner role.
- **`mundofit-expert.md`'s knowledge base will drift over time** (it says so explicitly: "Last verified: 2026-07-05"). Whoever picks up a task that leans on it should let it re-verify anything load-bearing rather than trusting the snapshot indefinitely — this is by design, not an oversight.
- **The exercise library migration (truncate + reseed, pre-beta) is still pending execution.** `architect.md` is the right agent to hold the gate on actually running it once the team is ready, per the already-approved plan in `docs/reports/exercise-library-migration-plan.md`.
- **Test-framework absence is a known gap, not a convention.** If a future task wants automated tests, that decision should route through `architect.md` (it's explicitly framed as an architecture-level choice in `mundofit-expert.md`'s knowledge base).
- Consider periodically running `qa-engineer` against `mundofit-expert.md` itself — i.e., spot-checking the knowledge base's claims against the live repo — the same way any other documentation gets audited for drift.

## How to Use Each Agent

- **Ask a MundoFit fact** ("what return shape does `sessions.ts` use?", "is the exercise library seeded in prod?") → `mundofit-expert`.
- **Build/fix a feature** ("add a delete-with-undo flow to Goals") → `developer`.
- **Propose a structural change** ("should we truncate and reseed exercises?", "should we unify the three Server Action conventions?") → `architect` for the plan; execution only after approval.
- **Anything about how something looks/animates** ("restyle the workout card", "add a motion transition to the rest overlay") → `ui-designer`.
- **Gate a feature before calling it done** ("verify the session-recovery flow works after a refresh") → `qa-engineer`.
- **Keep the docs honest** ("update `PROJECT_CONTEXT.md` now that the exercise library is complete") → `documentation`.

## Validation

- All six frontmatter blocks are valid YAML with `name` matching the filename.
- Each file contains all nine required sections.
- Cross-checked "CAN modify" / "MUST NEVER modify" sections across all six files for overlap or contradiction — none found; every file domain (docs/qa, docs/design, docs/architecture, the reference docs, application code, `AGENTS.md`, the agent files themselves) has exactly one owning agent or is explicitly out of scope for all six (`AGENTS.md`).
- Fixed one internal inconsistency during review: `mundofit-expert.md` claimed it could edit its own file but was scoped to read-only tools (`Read, Grep, Glob`) — added `Edit` to its tool list so the claim is actionable.
- No project-specific fact (stack version, file path, schema detail, design token, roadmap state) appears outside `mundofit-expert.md` in any of the other five files — confirmed by review pass.
