# `atl list`

Show the teams installed in the current project.

## Usage

```bash
atl list
```

## Output

```
TEAM                    VERSION    AGENTS  SKILLS  RULES  EXTENDS
─────────────────────────────────────────────────────────────────
software-project-team   1.0.0      13      2       1      —
starter-extended        0.2.0      12      2       1      software-project-team@^1.0.0
```

Columns:

- **TEAM** — installed team name (from `team.json`).
- **VERSION** — installed version.
- **AGENTS / SKILLS / RULES** — *effective* counts after inheritance resolution (parent + child, minus excludes, child overrides collapsed).
- **EXTENDS** — parent team and version constraint, if any.

## Flags

| Flag | Effect |
|---|---|
| `--json` | Emit the listing as JSON for scripting. |
| `--chain` | Print the full inheritance chain per team, one per row. |

## JSON output

```bash
atl list --json
```

```json
[
  {
    "name": "software-project-team",
    "version": "1.0.0",
    "effective": { "agents": 13, "skills": 2, "rules": 1 },
    "extends": null
  },
  {
    "name": "starter-extended",
    "version": "0.2.0",
    "effective": { "agents": 12, "skills": 2, "rules": 1 },
    "extends": "software-project-team@^1.0.0"
  }
]
```

## When the project has no teams

```
No teams installed in this project.
Run `atl search <keyword>` to discover one, or `atl install <team>`.
```

## Related

- [`atl install`](/cli/install)
- [`atl remove`](/cli/remove)
- [Inheritance](/authoring/inheritance)
