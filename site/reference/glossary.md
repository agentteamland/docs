# Glossary

**Agent** — a Markdown file defining a specialized role for Claude Code. Shipped as part of a team. Lives in `agents/` in a team repo; symlinked into `.claude/agents/` in a project.

**atl** — the CLI (`atl install`, `atl list`, …). Installs teams into a project. Go binary.

**Cache** — the shared on-disk directory where `atl` stores cloned team repos. One per machine: `~/.claude/repos/agentteamland/`. Projects symlink into it.

**Children pattern** — a convention for complex agents: top-level `agent.md` stays short (identity, scope, principles); detailed knowledge lives as topic-per-file under `children/`.

**Circular chain** — when a team's `extends` chain loops back on itself (`A → B → A`). Detected at install time; the CLI fails with the full chain printed.

**Dependencies** — additional teams a team requires, specified via the `dependencies` field in `team.json`. Resolved and installed at the same time as the team itself.

**`excludes`** — list in `team.json` of parent-provided agent/skill/rule names that the child does **not** want symlinked. Takes effect after the parent is installed.

**`extends`** — single-parent inheritance. A team with `extends: "parent@^1.0.0"` installs the parent first and layers its own content on top.

**Override** — when a child team ships an item with the same name as a parent's item, the child's version wins. Full replace, no merging.

**Project** — a directory you run `atl` in. Gets a `.claude/` subdirectory populated with symlinks to installed teams.

**Registry** — the public catalog of teams. A single `teams.json` file at [`agentteamland/registry`](https://github.com/agentteamland/registry). PR-driven, schema-validated.

**Rule** — a Markdown file that's always loaded by Claude Code (unlike skills, which must be invoked). Shipped as part of a team in `rules/`; symlinked into `.claude/rules/`.

**Scaffolder** — team-scoped skill named `/create-new-project` that bootstraps a new project on the team's stack. Must follow the [Scaffolder spec](/authoring/scaffolder-spec).

**SemVer constraint** — version range syntax used in `extends` and `dependencies`. `^1.0.0` (caret), `~1.2.0` (tilde), `1.2.3` (exact), `>=1.2.0` (open-ended).

**Skill** — a user-invocable slash command (e.g. `/verify-system`). Shipped as a directory with `skill.md` at its root. Global skills live in `~/.claude/skills/`; team-scoped skills ship with a team and appear in `.claude/skills/` after install.

**Status** — a team's state in the registry: `verified`, `community`, or `deprecated`.

**Team** — a Git repository with `team.json` at its root, bundling agents, skills, and rules for a specific kind of work.

**team.json** — the manifest file at the root of every team repo. Declares name, version, description, what's bundled, what's extended, what's excluded.

**Workspace** — `agentteamland/workspace`, the maintainer hub repo where all peer repos are aggregated for development. Not needed to use AgentTeamLand; only relevant if you're contributing to the platform itself.
