# `atl remove`

Uninstall a team from the current project.

## Usage

```bash
atl remove <team>             # interactive — prompts before destroying local modifications (atl ≥ 1.0.0)
atl remove <team> --force     # non-interactive — skips the confirmation prompt
```

`<team>` is the team's registry name (not a URL). You can see installed names via `atl list`.

## Example

```bash
atl remove starter-extended
```

## What happens

1. The team is located in `.claude/.team-installs.json`.
2. Every project-local copy under `.claude/agents/`, `.claude/skills/`, `.claude/rules/` that this team installed is identified by consulting the manifest's per-resource SHA-256 baselines.
3. **Modification check**: each resource's current SHA-256 is compared with the install-time baseline. If any resource has been locally modified, the CLI prints a `⚠ N resources have local modifications` summary and prompts for confirmation. `--force` bypasses the prompt.
4. **Manifest-driven allowlist**: only files this team registered are removed. Any user-authored files under `.claude/` (including auto-grown `children/`, `learnings/`, custom skills, journal entries, wiki pages) are **preserved** — they were never registered with `atl`, so they survive the uninstall.
5. **Inheritance protection**: if the team was a parent of another installed team (via `extends`), `atl remove` refuses unless you pass `--force` — removing a parent would break the child.
6. `.claude/.team-installs.json` is updated atomically (tmp + rename).
7. The shared cache is **not** touched. The team's Git clone stays in `~/.claude/repos/agentteamland/` for reuse. To reclaim disk, delete the cache directory manually.

## Flags

| Flag | Effect |
|---|---|
| `--force` | Skip the modification-check confirmation prompt AND remove even if this team is a parent of another installed team. |

## Example — forced removal in CI

```bash
atl remove software-project-team --force
```

Use `--force` for non-interactive contexts (CI, scripted teardown). In interactive use, prefer the default — the prompt protects you from accidentally discarding hours of `/save-learnings`-grown content or hand edits.

## Behavior changes from pre-v1.0.0

Pre-`atl v1.0.0`, `atl remove` used a heuristic that could accidentally delete user-authored files alongside the team's resources. The v1.0.0 manifest-driven allowlist closes that latent bug — every removed file is one the team explicitly installed.

The interactive confirmation prompt + `--force` flag also arrived in v1.0.0 (was unconditionally destructive before).

## Related

- [`atl list`](/cli/list) — see what you can remove.
- [`atl install`](/cli/install) — reinstall if you change your mind.
- [`atl update`](/cli/update) — auto-refreshes unmodified copies; relevant when deciding whether to `--force` remove (you may not realize a copy is unmodified if you have not touched it in a while).
