# `atl update`

Pull the latest version of one or all installed / cached agentteamland repos.

## Usage

```bash
atl update                          # update every cached repo (teams + global)
atl update <team>                   # update just one team's chain (legacy)
atl update --silent-if-clean        # no output if nothing changed (used by hooks)
atl update --check-only             # dry-run: report what WOULD update, pull nothing
atl update --throttle=30m           # skip if last successful run was <30m ago
atl update --skip-self-check        # don't check for a newer atl release
atl update -v                       # verbose (print each git command)
```

## What it updates

With no team name, `atl update` iterates every git repo under `~/.claude/repos/agentteamland/`:

- **Global repos:** `core`, `brainstorm`, `rule`, `team-manager`
- **Every installed team:** `software-project-team`, `design-system-team`, your own private teams

All share one pull mechanism: `git fetch origin main` → fast-forward `git pull` if behind → no-op if current.

It also checks for a newer `atl` binary release (GitHub Releases API, throttled to 24h):

```
⬆  atl 0.1.4 → 0.1.5 available — run: brew upgrade atl
```

The binary is NOT auto-upgraded — the message points at the right package-manager command based on how you installed atl.

## Example — silent-if-clean (used by hooks)

Nothing changed:

```bash
$ atl update --silent-if-clean
$                               # zero output, exit 0
```

Something changed:

```bash
$ atl update --silent-if-clean
🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)
🔄 core 1.1.0 → 1.2.0 (auto-updated)
```

## Example — dry-run

```bash
$ atl update --check-only
🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)
```

Prints what would update; no git pull executed.

## Automatic updates via hooks (recommended)

Set up once, forget forever:

```bash
atl setup-hooks                 # default: UserPromptSubmit throttled to 30m
atl setup-hooks --throttle=5m   # more aggressive
atl setup-hooks --remove        # disable
```

This installs two Claude Code hooks in `~/.claude/settings.json`:

- `SessionStart` → `atl update --silent-if-clean` (always runs when a session opens)
- `UserPromptSubmit` → `atl update --silent-if-clean --throttle=30m` (runs on every message, throttled)

When Claude Code starts a session or you send a prompt, the hook silently refreshes every cached repo. If something changed, Claude sees a single `🔄` line and acts on the update. If nothing changed, the hook returns instantly (~1ms, just a file-stat check).

On first `atl install`, you're asked whether to enable this. Say yes; you can reverse any time with `atl setup-hooks --remove`.

See [`atl setup-hooks`](/cli/setup-hooks) for details.

## Version constraints (per-team) still honored

If you installed `software-project-team@^1.0.0`, `atl update` pulls up to the latest `1.x.x` — **not** `2.0.0`. Major bumps require explicit `atl install software-project-team@^2.0.0`.

## Throttle internals

Two timestamp files live at:

- `~/.claude/cache/atl-last-repo-check` — repo-fetch throttle
- `~/.claude/cache/atl-last-self-check` — atl-release-API throttle (24h, fixed)

`--throttle=<dur>` checks the repo-fetch timestamp. If the file's modified time is within `<dur>`, the repo scan is skipped entirely (fast path ~1ms). Otherwise, the scan runs, stamps the file on success. On failure (e.g., offline), the stamp is NOT updated, so the next call retries.

## Offline behavior

If the network is unreachable, individual `git fetch` calls fail silently and that repo is reported as `⚠ <name>: fetch: <error>` (not silenced by `--silent-if-clean` — you want to know). The rest of the check continues. Symlinks are never touched.

## Related

- [`atl install`](/cli/install) — first install (with opt-in auto-update prompt)
- [`atl setup-hooks`](/cli/setup-hooks) — configure the hooks manually
- [`atl list`](/cli/list) — see what's installed
- [Version constraints](/authoring/team-json#version-constraints) — how `^`, `~`, exact pins resolve
