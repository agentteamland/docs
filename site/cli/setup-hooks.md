# `atl setup-hooks`

Configure Claude Code hooks so that teams, global repos (core, brainstorm, rule, team-manager), and the `atl` binary stay auto-checked for updates — AND so that inline learning markers dropped during a conversation get captured at session end or before compaction.

All with zero manual action from you.

Requires `atl` ≥ 0.2.0.

## Usage

```bash
atl setup-hooks                    # install with 30m throttle (recommended default)
atl setup-hooks --throttle=5m      # more aggressive update check (every 5 minutes of activity)
atl setup-hooks --throttle=1h      # less aggressive update check
atl setup-hooks --remove           # uninstall the atl hooks
```

On first `atl install`, you're asked whether to enable this automatically. Saying yes runs `atl setup-hooks` for you. If you declined then, or are opting in later, run it manually.

## What it does

Writes four entries into `~/.claude/settings.json`:

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
    ],
    "SessionEnd": [
      { "hooks": [
          { "type": "command", "command": "atl learning-capture --silent-if-empty" }
      ]}
    ],
    "PreCompact": [
      { "hooks": [
          { "type": "command", "command": "atl learning-capture --silent-if-empty" }
      ]}
    ]
  }
}
```

Claude Code runs these automatically:

### Auto-update hooks

- **`SessionStart`** — runs once when you open a new Claude Code session. Always fresh on startup.
- **`UserPromptSubmit`** — runs before every message you send to Claude. Throttled to once per `<duration>` (30m default) so the per-message cost is a single file-stat call (~1ms). Slow path (actual git fetch + pull) runs at most twice an hour.

When something changed, Claude sees a line like `🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)` in its context and can mention it briefly. When nothing changed, you see nothing.

### Learning-capture hooks (new in 0.2.0)

- **`SessionEnd`** — runs when you close a session. Scans the transcript for inline `<!-- learning ... -->` markers dropped by Claude during the conversation. If any are found, a short report is injected into the final message; the next Claude Code session picks it up and runs `/save-learnings --from-markers` to process the markers into wiki + memory + doc drafts. If no markers exist, the hook exits silently — zero tokens, zero cost.
- **`PreCompact`** — runs right before Claude Code compacts a long conversation. Same scanner as above, so markers aren't lost to summarization.

When markers are found, a report like this shows up in the context:

```
📝 learning-capture: 3 markers detected
  1. [decision] auth-refresh (doc-impact: readme)
  2. [bug-fix] redis-connection (doc-impact: none)
  3. [discovery] setup-hooks-sessionend (doc-impact: docs)

→ Run /save-learnings --from-markers to process these into wiki + memory.
  2 markers require doc drafts (README / doc site) — see docs-sync rule.
```

See [`learning-capture`](/cli/learning-capture) for the full marker format and flow, and the [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) / [docs-sync rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md) in core for the behavior spec.

## Why four hooks

| Hook | Answers |
|---|---|
| `SessionStart` | "I'm just opening Claude Code fresh this morning, what changed upstream?" |
| `UserPromptSubmit` | "I've been in this session for 4 hours, is there a newer release?" |
| `SessionEnd` | "I learned things this session — did any of it survive beyond my context?" |
| `PreCompact` | "Claude Code is about to compact the conversation. Save what would otherwise get summarized away." |

Drop any of these four and you lose a piece of the guarantee. Together they form the end-to-end auto-freshness + auto-preservation system.

## Idempotency — safe to re-run

The merge preserves any other hooks you have. Re-running `atl setup-hooks` only touches atl-owned entries (any command prefixed with `atl `). All other hooks, permissions, model settings, and `extraKnownMarketplaces` in `settings.json` are left untouched.

`--remove` similarly only strips atl-owned hook entries, leaving everything else in place.

## When you should run this

- **Always recommended** for interactive Claude Code users.
- **Not recommended** for CI / scripted `atl install` (the hooks would fire in CI unnecessarily). The first-install opt-in prompt already skips in non-interactive contexts.

## What exactly gets checked

### Each `atl update --silent-if-clean` run

1. Iterates `~/.claude/repos/agentteamland/*/` — every cached git repo.
2. For each, `git fetch origin main` in parallel (total time ≈ one roundtrip, not N × roundtrip).
3. If local is behind remote, fast-forward `git pull`.
4. Parses `team.json` before + after to show a `<oldVer> → <newVer>` line.
5. Hits GitHub Releases API (`github.com/agentteamland/cli/releases/latest`) for atl self-check — but only once per 24h (separate throttle).

Slow path: ~2-3s for typical setups (5-10 cached repos). Fast path: ~1ms (just a file-stat).

### Each `atl learning-capture --silent-if-empty` run

1. Reads the transcript path from the hook's stdin JSON payload.
2. Grep-scans the JSONL transcript for `<!-- learning ... -->` blocks.
3. Parses each marker's fields (topic, kind, doc-impact, body).
4. Silent exit if zero markers. Otherwise prints a short formatted report.

Zero-marker cost: ~5ms (just a file read + regex scan). Marker cost: negligible, proportional to transcript size.

## Offline behavior

If you're offline, each repo's `git fetch` fails silently, that repo gets a `⚠` warning line (if not silenced), and the rest continue. Learning-capture doesn't need the network at all — it just reads local files. Claude Code's prompt still proceeds normally; hooks failing don't block your work.

## Related

- [`atl update`](/cli/update) — manual update (what the auto-update hooks call silently)
- [`atl learning-capture`](/cli/learning-capture) — manual scanner (what the learning-capture hooks call silently)
- [`atl install`](/cli/install) — first install (includes opt-in prompt)
- [Install the CLI](/guide/install) — getting atl on your machine
