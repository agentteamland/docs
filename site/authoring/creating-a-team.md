# Creating a team

Building a team from scratch takes about ten minutes. This page walks through it end to end.

## 1. Create a Git repo

```bash
mkdir my-team && cd my-team
git init -b main
```

Name it whatever you like — the **registry name** (set in `team.json` below) is what users will type, not the repo name. But keeping them the same is friendlier.

## 2. Write `team.json`

```json
{
  "schemaVersion": 1,
  "name": "my-team",
  "version": "0.1.0",
  "description": "Opinionated setup for Next.js + Tailwind projects.",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "keywords": ["nextjs", "tailwind", "typescript"],
  "agents": [
    { "name": "web-agent", "description": "Reviews and builds Next.js pages." }
  ]
}
```

Full field reference: [team.json](./team-json).

## 3. Add your content

```
my-team/
├── team.json
├── agents/
│   └── web-agent.md
├── skills/
├── rules/
└── README.md
```

For a simple single-agent team, `agents/web-agent.md` is a plain Markdown file with the agent's instructions. For a complex agent, use the [**children pattern**](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md):

```
agents/web-agent/
├── agent.md             ← short: identity, scope, principles
└── children/
    ├── routing.md
    ├── data-fetching.md
    └── testing.md
```

## 4. Add schema validation in CI

Drop this into `.github/workflows/validate.yml`:

```yaml
name: Validate team.json
on:
  push:
  pull_request:
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install -g ajv-cli
      - name: Download schema
        run: curl -sSfL https://raw.githubusercontent.com/agentteamland/core/main/schemas/team.schema.json -o team.schema.json
      - name: Validate
        run: ajv -s team.schema.json -d team.json --strict=false
```

This way, a malformed `team.json` never gets merged.

## 5. Push to GitHub

```bash
git add .
git commit -m "feat: initial team"
git remote add origin https://github.com/you/my-team.git
git push -u origin main
```

## 6. Tag a release

```bash
git tag v0.1.0
git push origin v0.1.0
```

Tags follow SemVer (`vX.Y.Z`). The `v` prefix is optional but conventional.

## 7. Test-install it locally

```bash
mkdir /tmp/test-project && cd /tmp/test-project
atl install https://github.com/you/my-team.git
atl list
ls .claude/agents/
```

You should see `web-agent.md` symlinked in.

## 8. (Optional) Submit to the registry

Only once the team is stable and you want others to discover it by short name. See [Registry submission](./registry-submission).

## 9. Next steps

- **Extend an existing team** instead of starting from scratch — see [Inheritance](./inheritance).
- **Add a scaffolder skill** so users can spin up a project on your stack — see [Scaffolder spec](./scaffolder-spec).
- **Publish updates** by bumping `version` in `team.json`, committing, and tagging. Users get the update with `atl update`.

## Tips

- **Start small.** A team with one agent is a valid team. Ship it, iterate.
- **Document the team's boundaries.** The `README.md` should say "this team is for X, not Y" so users install it for the right reasons.
- **Pin carefully.** If your team extends another, use caret ranges (`^1.0.0`) — not exact pins — so you get upstream fixes.
