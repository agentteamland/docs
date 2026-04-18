# `atl update`

Pull the latest version of one or all installed teams.

## Usage

```bash
atl update              # update every installed team
atl update <team>       # update just one team
```

## What happens

For each team being updated:

1. The cached Git repo is fetched and fast-forwarded.
2. `team.json` is re-validated against the schema.
3. Inheritance is re-resolved (parents updated too, if they're out of date).
4. Symlinks in `.claude/` are rebuilt to reflect any changes (new agents added, removed ones cleaned up).
5. `.claude/.team-installs.json` records the new resolved version.

## Example

```bash
atl update
```

```
Updating 2 teams...
  software-project-team  1.0.0 → 1.1.0  ✓
  starter-extended       0.2.0 → 0.3.0  ✓

2 teams updated. Symlinks refreshed.
```

## Version constraints are honored

If you installed `software-project-team@^1.0.0`, `atl update` will pull up to the latest `1.x.x` — **not** `2.0.0`. Breaking upgrades require an explicit `atl install software-project-team@^2.0.0`.

## Offline behavior

If the network is unreachable, `atl update` logs a warning and leaves the cache alone. Your symlinks still work.

## Related

- [`atl install`](/cli/install) — initial install.
- [Version constraints](/authoring/team-json#version-constraints) — how `^`, `~`, and exact pins are resolved.
