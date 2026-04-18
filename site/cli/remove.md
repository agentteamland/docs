# `atl remove`

Uninstall a team from the current project.

## Usage

```bash
atl remove <team>
```

`<team>` is the team's registry name (not a URL). You can see installed names via `atl list`.

## Example

```bash
atl remove starter-extended
```

## What happens

1. The team is located in `.claude/.team-installs.json`.
2. Every symlink in `.claude/agents/`, `.claude/skills/`, `.claude/rules/` pointing into this team's cache is removed.
3. If the team was a parent of another installed team (via `extends`), `atl remove` refuses unless you pass `--force` — removing a parent would break the child.
4. `.claude/.team-installs.json` is updated.
5. The shared cache is **not** touched. The team's Git clone stays in `~/.claude/repos/agentteamland/` for reuse. To reclaim disk, delete the cache directory manually.

## Flags

| Flag | Effect |
|---|---|
| `--force` | Remove even if this team is a parent of another installed team. The child will then be broken — you should remove the child first. |

## Example — forced removal

```bash
atl remove software-project-team --force
```

Use this sparingly. In most cases, remove children before parents.

## Related

- [`atl list`](/cli/list) — see what you can remove.
- [`atl install`](/cli/install) — reinstall if you change your mind.
