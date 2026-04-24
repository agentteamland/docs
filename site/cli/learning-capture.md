# `atl learning-capture`

Scan the current Claude Code session transcript for inline `<!-- learning ... -->` markers dropped by Claude during the conversation, and print a short report that the next turn (or next session) can act on.

Driven by Claude Code hooks (SessionEnd, PreCompact) installed by [`atl setup-hooks`](/cli/setup-hooks). Can also be invoked manually for testing or ad-hoc scans.

Requires `atl` ≥ 0.2.0.

## Why this exists

Without an automated capture step, two kinds of knowledge always slip away:

1. **Learnings go un-saved.** Users forget to run `/save-learnings`, and the agent doesn't always volunteer. Decisions, bug fixes, and discoveries vanish with the conversation.
2. **Docs go stale.** When a feature ships or a behavior changes, the README / doc site often lag by days or weeks — or forever.

`atl learning-capture` + two paired core rules ([learning-capture](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) + [docs-sync](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md)) close both gaps:

- Claude drops an inline `<!-- learning -->` marker each time a real learning moment happens during the conversation. Markers are ~50 tokens, HTML-commented (invisible in rendered output), and free to ignore when a session has nothing interesting in it.
- At session end and before context compaction, the harness runs `atl learning-capture`. It scans the transcript, finds markers, and injects a short report into Claude's context.
- The next turn (or next session), `/save-learnings --from-markers` processes the markers into wiki + memory + journal — AND prepares draft README / doc-site changes for any marker with `doc-impact` set.

Nothing pushes to public repos automatically. You or Claude review the drafts.

## Usage

```bash
# Automatic (via hooks — recommended)
atl setup-hooks                                  # installs the 4-hook setup
# From here on, learning-capture runs silently on SessionEnd + PreCompact.

# Manual (for testing or one-off scans)
atl learning-capture --transcript-path /path/to/transcript.jsonl
atl learning-capture --silent-if-empty --transcript-path X
```

When invoked via hook, Claude Code pipes a JSON payload on stdin:

```json
{"session_id": "...", "transcript_path": "/path/to/transcript.jsonl", "cwd": "..."}
```

The command reads `transcript_path` from that payload — you don't need `--transcript-path` in hook mode.

## Marker format

Markers are inline HTML comments containing loose YAML fields:

```
<!-- learning
topic: auth-refresh
kind: decision
doc-impact: readme
body: 7-day JWT refresh chosen because we want long sessions; user logs in once a week max.
-->
```

| Field | Required | Allowed values | Purpose |
|---|---|---|---|
| `topic` | yes | kebab-case string | Becomes the wiki page name (`wiki/auth-refresh.md`) |
| `kind` | yes | `bug-fix`, `decision`, `pattern`, `anti-pattern`, `discovery`, `convention` | Categorizes the learning |
| `doc-impact` | no | `none`, `readme`, `docs`, `both`, `breaking` | Triggers doc-sync drafts when ≠ `none` |
| `body` | yes | one or more sentences | The actual learning content — ALWAYS include the WHY |

HTML comments are invisible in rendered markdown output, so markers don't pollute the conversation UI; they live in the transcript where only the scanner sees them.

## Output

### Empty session (common case)

```
(exits silently when --silent-if-empty is passed; zero tokens consumed)
```

Without `--silent-if-empty`:

```
📝 learning-capture: no markers found in this session (0 cost)
```

### Session with markers

```
📝 learning-capture: 3 markers detected
  1. [decision] auth-refresh (doc-impact: readme)
  2. [bug-fix] redis-connection (doc-impact: none)
  3. [discovery] setup-hooks-sessionend (doc-impact: docs)

→ Run /save-learnings --from-markers to process these into wiki + memory.
  2 markers require doc drafts (README / doc site) — see docs-sync rule.
```

Claude Code injects this report into context. On the next turn (or next session), the `learning-capture` core rule instructs Claude to run `/save-learnings --from-markers`, which reads the markers and performs:

- Wiki page updates (replace/update current truth)
- Agent-memory append (historical record with date)
- Journal entry (cross-agent signals)
- Doc drafts for `doc-impact` markers (presented for review, not auto-pushed)

## Flags

| Flag | Default | Purpose |
|---|---|---|
| `--silent-if-empty` | `false` | Produce no output when no markers are found (for hooks) |
| `--transcript-path <path>` | (from stdin JSON) | Explicit transcript path, bypassing stdin |
| `--help` | — | Show command help |

## Cost model

| Scenario | Token cost to Claude | Time cost |
|---|---|---|
| Empty session, `--silent-if-empty` | 0 | ~5ms (file read + regex scan) |
| Empty session, verbose | ~15 tokens (one status line) | ~5ms |
| Session with N markers | ~50 × N tokens already in transcript + ~100 tokens for report | ~5ms per MB of transcript |
| `/save-learnings --from-markers` (processing) | proportional to marker count, not transcript size | seconds |

The design deliberately makes boring sessions free. Only real learnings cost anything, and the cost scales with what was actually learned — never with conversation length.

## Manual testing

```bash
# Create a synthetic transcript with one marker
cat > /tmp/test.jsonl <<'EOF'
{"role":"assistant","content":"<!-- learning\ntopic: my-topic\nkind: decision\ndoc-impact: none\nbody: test.\n-->"}
EOF

# Scan it
atl learning-capture --transcript-path /tmp/test.jsonl
```

Expected output:

```
📝 learning-capture: 1 marker detected
  1. [decision] my-topic (doc-impact: none)

→ Run /save-learnings --from-markers to process these into wiki + memory.
```

## Related

- [`atl setup-hooks`](/cli/setup-hooks) — installs SessionEnd + PreCompact hooks that drive this command
- [`atl update`](/cli/update) — the other half of the hook system (auto-update)
- [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) — behavior spec for when Claude should drop markers
- [docs-sync rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md) — paired rule for proactive doc updates (uses `doc-impact` field)
- [`/save-learnings` skill](https://github.com/agentteamland/core/blob/main/skills/save-learnings/skill.md) — processing half of the system
