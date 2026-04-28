# `atl install`

Install a team into the current project.

## Usage

```bash
atl install <team>
```

`<team>` can be:

- A **registry short name** — `software-project-team`
- A **registry name with version** — `software-project-team@^1.2.0` (caret, tilde, or exact pin)
- A **GitHub `owner/repo` shorthand** — `agentteamland/starter-extended`
- A **Git URL** — `https://github.com/you/your-team.git`, `git@github.com:you/team.git`, `ssh://...`, `file:///abs/path.git`
- A **local filesystem path** — `./my-team`, `~/projects/my-team`, `/abs/path/to/team` (atl ≥ 0.1.4; the path must be a directory with `team.json` at its root AND a `.git/`)

## Examples

### Registry (public, verified)

```bash
atl install software-project-team
atl install software-project-team@^1.2.0
```

### GitHub shorthand

```bash
atl install agentteamland/starter-extended
```

### Full Git URL (public or private)

```bash
atl install https://github.com/acme/acme-starter.git
atl install git@github.com:you/private-team.git          # SSH, uses your git credentials
atl install https://gitea.example.com/you/team.git       # self-hosted
```

### Local filesystem — no remote required (atl ≥ 0.1.4)

The private-local workflow: build a team on your laptop, install it into your own project without pushing to any git server.

```bash
# One-time: set up the team as a git repo
cd ~/projects/my-team
git init -b main && git add . && git commit -m "init"

# Install into any project:
cd ~/projects/some-app
atl install ~/projects/my-team                   # absolute path
atl install ./my-team                            # relative path
atl install file:///Users/you/projects/my-team   # explicit file:// URL
```

All three forms work identically. The source must be a directory containing `team.json` and must be a git repo (at least one commit). See [Creating a team](/authoring/creating-a-team) for the full walk-through.

## Multi-team installation

Multiple teams can coexist in the same project — `atl` v0.1.2+ supports this natively. Both teams' agents and rules are symlinked into the same `.claude/` directory; skills are copied (per-skill directories with real files — `v0.3.0+` workaround for Claude Code's skill-loader symlink limitation).

```bash
atl install software-project-team
atl install design-system-team

atl list
# ✓ software-project-team@1.1.0
# ✓ design-system-team@0.3.1
```

When two teams declare an item with the same name (e.g., both have a `code-reviewer` agent), the most recently installed one wins. atl prints a one-line warning:

```
⚠ overriding agent "code-reviewer" (was from team-a, now from team-b)
```

This mirrors npm / pip / GNU Stow conventions. Removing a team is safe — `atl remove` wipes its symlinks (agents + rules) AND its copied skill directories, then replays the remaining teams. Any item the removed team was "winning" by collision falls back to its original owner correctly.

## What happens

1. **Resolve.** Registry names are looked up in [`teams.json`](https://github.com/agentteamland/registry/blob/main/teams.json); URLs are used directly.
2. **Clone or pull.** If the team isn't in the shared cache, it's cloned. If it is, the cache is fast-forwarded.
3. **Resolve inheritance.** If `team.json` has an `extends` field, the parent is installed (recursively) before the child.
4. **Validate.** `team.json` is checked against the [schema](/reference/schema). Invalid teams fail here.
5. **Materialize.** Agents and rules are **symlinked** into `.claude/agents/` and `.claude/rules/`. Skills are **copied** (recursively) into `.claude/skills/` as real directories. Precedence applies (child wins, excludes drop). The asymmetry is a Claude Code workaround — see § "Why skills are copied, not symlinked" below.
6. **Record.** `.claude/.team-installs.json` is updated with the installed team, version, and chain.

## Why skills are copied, not symlinked

`v0.3.0+`: Claude Code's project-level skill loader does **not** follow symlinks under `.claude/skills/`. A symlinked skill directory is invisible to the Skill tool's discovery list (returns `Unknown skill: <name>`), even though runtime reads of the skill body do follow the symlink. The validation/discovery pass that builds the available-skills list does not resolve symlinks. This is inconsistent with `.claude/rules/`, which DOES support symlinks.

Tracking upstream: [anthropics/claude-code#14836](https://github.com/anthropics/claude-code/issues/14836), [#25367](https://github.com/anthropics/claude-code/issues/25367), [#37590](https://github.com/anthropics/claude-code/issues/37590).

When the upstream behavior is fixed, atl can revert skills to symlinks for parity with agents and rules.

**Trade-off:** `atl update` only refreshes the cached source under `~/.claude/repos/agentteamland/<team>/`. Projects with copied skills become **stale** relative to the cache after the pull. To pick up updates, re-run `atl install <team>` in the project (re-copies the latest cached content).

## Re-running

Running `atl install <team>` a second time is safe: the CLI checks the cache, pulls any updates, and rebuilds agents+rules symlinks + re-copies skills. Use this as a "reload" when you've edited a team locally OR when you want a project to pick up changes after `atl update`.

## Offline behavior

If the network is unreachable, `atl install` falls back to the shared cache. You'll get whatever version was last pulled. The CLI logs this explicitly — no silent staleness.

## Troubleshooting

- **"team not found"** — the name isn't in the registry. Try `atl search`.
- **"circular extends chain"** — a team in the chain extends an ancestor. The error prints the full chain.
- **"schema validation failed"** — the team's `team.json` is malformed. Ask the author to fix it, or pin to an earlier version.

## Related

- [`atl search`](/cli/search) — find a team's name.
- [`atl list`](/cli/list) — see what's installed.
- [Inheritance](/authoring/inheritance) — how `extends` resolves.
