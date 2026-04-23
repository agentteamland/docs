# `atl setup-hooks`

Configure Claude Code hooks so that teams, global repos (core, brainstorm, rule, team-manager), and the `atl` binary all stay auto-checked for updates — with no manual action from you.

Requires `atl` ≥ 0.1.5.

## Usage

```bash
atl setup-hooks                    # install with 30m throttle (recommended default)
atl setup-hooks --throttle=5m      # more aggressive (check every 5 minutes of activity)
atl setup-hooks --throttle=1h      # less aggressive
atl setup-hooks --remove           # uninstall the atl hooks
```

On first `atl install`, you're asked whether to enable this automatically. Saying yes runs `atl setup-hooks` for you. If you declined then, or are opting in later, run it manually.

## What it does

Writes two entries into `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [
          { "type": "command", "command": "atl update --silent-if-clean" }
      ]}
    ],
    "UserPromptSubmit": [
      { "hooks": [
          { "type": "command", "command": "atl update --silent-if-clean --throttle=30m" }
      ]}
    ]
  }
}
```

Claude Code runs these automatically:

- **`SessionStart`** — once, whenever you open a new Claude Code session. Always fresh on startup.
- **`UserPromptSubmit`** — before every message you send to Claude. Throttled to once per `<duration>` (30m default) so the per-message cost is a single file-stat call (~1ms). Slow path (actual git fetch + pull) runs at most twice an hour.

When something changed, Claude sees a line like `🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)` in its context and can mention it briefly. When nothing changed, you see nothing.

## Why two hooks

- `SessionStart` catches "I'm just opening Claude Code fresh this morning, what changed?"
- `UserPromptSubmit` catches "I've been working in this session for 4 hours, is there a newer release?"

Without `UserPromptSubmit`, long sessions miss mid-day releases. Without `SessionStart`, short sessions never trigger the throttle gate at their first message.

## Idempotency — safe to re-run

The merge preserves any other hooks you have. Re-running `atl setup-hooks` only touches the atl-owned entries (identified by the `atl update --silent-if-clean` prefix). All other hooks, permissions, model settings, and `extraKnownMarketplaces` in `settings.json` are left untouched.

`--remove` similarly only strips atl-owned hook entries, leaving everything else in place.

## When you should run this

- **Always recommended** for interactive Claude Code users.
- **Not recommended** for CI / scripted `atl install` (the hook would fire in CI and fetch repos unnecessarily). The first-install opt-in prompt already skips in non-interactive contexts.

## What exactly gets checked

Each run of `atl update --silent-if-clean` does:

1. Iterate `~/.claude/repos/agentteamland/*/` — every cached git repo.
2. For each, `git fetch origin main` in parallel (so total time ≈ one roundtrip, not N × roundtrip).
3. If local is behind remote, fast-forward `git pull`.
4. Parse `team.json` before + after to show a `<oldVer> → <newVer>` line.
5. Hit GitHub Releases API (`github.com/agentteamland/cli/releases/latest`) for atl self-check — but only once per 24h (separate throttle).

Total work on the slow path: ~2-3s for typical setups (5-10 cached repos). Fast path: ~1ms (just a file-stat).

## Offline behavior

If you're offline, each repo's `git fetch` fails silently, that repo gets a `⚠` warning line (if not silenced), and the rest continue. Claude Code's prompt still proceeds normally — the hook failing doesn't block your work.

## Related

- [`atl update`](/cli/update) — manual update (what the hooks call silently)
- [`atl install`](/cli/install) — first install (includes opt-in prompt)
- [Install the CLI](/guide/install) — getting atl on your machine
