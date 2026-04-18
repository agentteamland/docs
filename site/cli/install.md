# `atl install`

Install a team into the current project.

## Usage

```bash
atl install <team>
```

`<team>` can be:

- A **registry short name** — `software-project-team`
- A **Git URL** — `https://github.com/youruser/your-team.git`
- A **registry name with version** — `software-project-team@^1.2.0` (caret, tilde, or exact pin)

## Examples

Install the reference team from the registry:

```bash
atl install software-project-team
```

Install a specific version:

```bash
atl install software-project-team@^1.2.0
```

Install directly from a Git URL (no registry lookup):

```bash
atl install https://github.com/acme/acme-starter.git
```

## What happens

1. **Resolve.** Registry names are looked up in [`teams.json`](https://github.com/agentteamland/registry/blob/main/teams.json); URLs are used directly.
2. **Clone or pull.** If the team isn't in the shared cache, it's cloned. If it is, the cache is fast-forwarded.
3. **Resolve inheritance.** If `team.json` has an `extends` field, the parent is installed (recursively) before the child.
4. **Validate.** `team.json` is checked against the [schema](/reference/schema). Invalid teams fail here.
5. **Symlink.** Agents, skills, and rules are symlinked into `.claude/` with the right precedence (child wins, excludes drop).
6. **Record.** `.claude/.team-installs.json` is updated with the installed team, version, and chain.

## Re-running

Running `atl install <team>` a second time is safe: the CLI checks the cache, pulls any updates, and rebuilds the symlinks. Use this as a poor man's "reload" when you've edited a team locally.

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
