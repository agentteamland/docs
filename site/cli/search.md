# `atl search`

Search the public registry.

## Usage

```bash
atl search <query>
```

`<query>` matches against team names, descriptions, and keywords. It's case-insensitive and substring-based; no regex.

## Example

```bash
atl search dotnet
```

```
NAME                    STATUS     DESCRIPTION
─────────────────────────────────────────────────────────────────────────
software-project-team   verified   .NET 9 API + Flutter + React + full Docker stack
```

Status badges:

- **`verified`** — reviewed by AgentTeamLand maintainers. Expected to install cleanly and follow conventions.
- **`community`** — listed in the registry, not yet reviewed. Works, but use at your own risk.
- **`deprecated`** — still installable, but no longer maintained. Migrate when convenient.

## Empty query

`atl search` with no query prints the entire registry, sorted alphabetically.

## Offline behavior

The registry is cached locally after the first fetch. `atl search` works offline using the cached copy; it prints a note so you know the results may be stale.

## No results?

The registry is PR-driven and young — if your domain isn't covered, that's likely just "not yet." Consider:

- Using a Git URL directly: `atl install https://github.com/you/your-team.git`
- Publishing your own team: [Creating a team](/authoring/creating-a-team)
- Submitting it to the registry: [Registry submission](/authoring/registry-submission)

## Related

- [`atl install`](/cli/install) — install what you find.
- [Registry submission](/authoring/registry-submission) — get your team listed.
