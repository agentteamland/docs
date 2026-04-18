# CLI Overview

`atl` has five commands. All of them operate on the **current project** (the directory you ran `atl` in) unless otherwise noted.

| Command | What it does |
|---|---|
| [`atl install`](/cli/install) | Install a team by registry name or Git URL. |
| [`atl list`](/cli/list) | Show teams installed in this project. |
| [`atl remove`](/cli/remove) | Uninstall a team. |
| [`atl update`](/cli/update) | Pull latest for one or all installed teams. |
| [`atl search`](/cli/search) | Search the public registry. |

## Global flags

| Flag | Effect |
|---|---|
| `--help`, `-h` | Print usage and exit. |
| `--version`, `-v` | Print the installed `atl` version. |

Each command has its own `--help` page: `atl install --help`, `atl search --help`, and so on.

## State `atl` keeps

**Shared cache** (one per machine):

```
~/.claude/repos/agentteamland/
└── <team-name>/          ← cloned Git repo, reused across all projects
```

**Per-project state** (per directory you run `atl` in):

```
<project>/
└── .claude/
    ├── .team-installs.json       ← which teams are installed, at what versions
    ├── agents/                   ← symlinks to team-provided agents
    ├── skills/                   ← symlinks to team-provided skills
    ├── rules/                    ← symlinks to team-provided rules
    └── ...
```

The symlinks point into the shared cache. That's why `atl update` takes effect in every project at once: you update the cache, not the project.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success. |
| `1` | General error (invalid args, team not found, network). |
| `2` | Validation failure (`team.json` didn't match the schema). |
| `3` | Inheritance error (circular chain, missing parent). |

## Philosophy

- **Deterministic.** Same inputs, same symlinks. No hidden state.
- **Idempotent.** Re-running `atl install` on an already-installed team is a no-op (or a pull).
- **Observable.** Every action prints what it did. Use the output, not a spinner.

## Next

- **[`atl install`](/cli/install)** — the command you'll run most.
- **[`atl search`](/cli/search)** — discover what's in the registry.
