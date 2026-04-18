# Install

`atl` ships as a single static Go binary (~7 MB, zero runtime dependencies). Pick the channel that matches your platform.

## macOS / Linux — Homebrew (recommended)

```bash
brew install agentteamland/tap/atl
```

Equivalent two-step form:

```bash
brew tap agentteamland/tap
brew install atl
```

Upgrading:

```bash
brew update && brew upgrade atl
```

## Windows — Scoop (recommended)

```powershell
scoop bucket add agentteamland https://github.com/agentteamland/scoop-bucket
scoop install atl
```

Upgrading:

```powershell
scoop update atl
```

## Windows — winget

```powershell
winget install agentteamland.atl
```

::: info First-time review pending
The first winget submission goes through a manual review by Microsoft (typically 1–2 weeks). Once approved, future releases land automatically. Until then, use Scoop or the direct download.
:::

## Manual download

Grab a pre-built binary from [**GitHub Releases**](https://github.com/agentteamland/cli/releases/latest). Artifacts ship for:

- `darwin` (macOS): `amd64`, `arm64`
- `linux`: `amd64`, `arm64`
- `windows`: `amd64`, `arm64`

Extract, drop `atl` somewhere on your `PATH`, and you're done.

## Verify

```bash
atl --version
atl --help
```

You should see the installed version and the command list (`install`, `list`, `remove`, `update`, `search`).

## What got installed

A single binary. `atl` keeps its team cache under:

- macOS / Linux: `~/.claude/repos/agentteamland/`
- Windows: `%USERPROFILE%\.claude\repos\agentteamland\`

Installed teams live as cloned Git repos under that cache and are symlinked into each project's `.claude/` directory.

## Next

- **[Quickstart](/guide/quickstart)** — install your first team.
- **[Concepts](/guide/concepts)** — teams, agents, skills, rules, inheritance.
