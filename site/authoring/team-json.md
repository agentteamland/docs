# `team.json`

Every team is a Git repository with a `team.json` at its root. That file is the entire contract: what the team is called, what it ships, what it depends on.

## Minimal example

```json
{
  "schemaVersion": 1,
  "name": "my-team",
  "version": "0.1.0",
  "description": "A starter team for small Next.js projects.",
  "agents": [
    { "name": "web-agent", "description": "Next.js + Tailwind reviewer and builder." }
  ]
}
```

That's enough to install. The CLI will clone the repo, symlink `agents/web-agent.md` (or `agents/web-agent/agent.md`) into `.claude/agents/`, and record the install.

## Full field reference

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | integer | ✅ | Currently `1`. Bumped on breaking schema changes. |
| `name` | string | ✅ | Registry name. Lowercase, kebab-case. Must match the directory name in the registry. |
| `version` | semver string | ✅ | SemVer 2.0.0 (`1.2.3`, `1.2.3-beta.1`). |
| `description` | string | ✅ | One-sentence pitch. Shows up in `atl search`. |
| `author` | string | — | `"Your Name <email@example.com>"` format recommended. |
| `license` | SPDX string | — | `"MIT"`, `"Apache-2.0"`, etc. Defaults to `"MIT"` if omitted. |
| `keywords` | string[] | — | For search matching. `["nextjs", "tailwind", "blog"]`. |
| `repository` | string | — | Git URL. If omitted, the CLI uses the clone origin. |
| `homepage` | string | — | Docs / landing URL. |
| `agents` | object[] | — | Each: `{ name, description }`. Names must match files under `agents/`. |
| `skills` | object[] | — | Each: `{ name, description }`. Names must match directories under `skills/`. |
| `rules` | object[] | — | Each: `{ name, description }`. Names must match files under `rules/`. |
| `extends` | string | — | Parent team spec: `"name"` or `"name@version-constraint"`. See [Inheritance](./inheritance). |
| `excludes` | string[] | — | Names (agent/skill/rule) from inherited parents to drop. |
| `dependencies` | object | — | Map of `team-name → version-constraint` for additional teams the CLI must install alongside. |
| `requires.atl` | string | — | Minimum `atl` version. E.g. `">=0.1.0"`. |

## Version constraints

The `extends` and `dependencies` fields accept standard SemVer range syntax:

| Syntax | Meaning |
|---|---|
| `^1.2.3` | `>=1.2.3 <2.0.0` (caret — default recommended) |
| `~1.2.3` | `>=1.2.3 <1.3.0` (tilde) |
| `1.2.3` | Exact pin |
| `>=1.2.0` | Open-ended minimum |

Caret (`^`) is the default recommendation — it gets patch and minor updates, blocks breaking major bumps.

## Directory conventions

`atl` discovers your bundled files by reading `team.json` and looking for matching paths:

```
my-team/
├── team.json
├── agents/
│   ├── web-agent.md             ← simple agent (single file)
│   └── db-agent/
│       ├── agent.md             ← complex agent (children pattern)
│       └── children/
│           ├── migrations.md
│           └── rls.md
├── skills/
│   └── create-new-project/
│       └── skill.md
└── rules/
    └── commit-style.md
```

Every entry in `team.json` (under `agents[]`, `skills[]`, `rules[]`) must correspond to an actual file or directory. Missing entries fail validation.

## Validation in CI

Every team repo ships with a GitHub Action that validates `team.json` on every push and PR, using the schema at [`agentteamland/core/schemas/team.schema.json`](https://github.com/agentteamland/core/blob/main/schemas/team.schema.json). Copy that workflow from one of the existing teams to get this for free.

## Next

- **[Creating a team](./creating-a-team)** — step by step.
- **[Inheritance](./inheritance)** — `extends`, `excludes`, override rules.
- **[Schema reference](/reference/schema)** — machine-readable contract.
