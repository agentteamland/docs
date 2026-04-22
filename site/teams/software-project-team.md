# software-project-team

> 13 specialized agents for production-grade full-stack software projects.

**Latest version:** `1.1.0`
**Status:** Verified
**Repository:** [github.com/agentteamland/software-project-team](https://github.com/agentteamland/software-project-team)

## Install

```bash
cd your-project
atl install software-project-team
```

## Stack

- **API**: .NET 9, Minimal API, [martinothamar/Mediator](https://github.com/martinothamar/Mediator) (source generator), FluentValidation
- **Database**: PostgreSQL 17, EF Core 9
- **Messaging**: RabbitMQ 3 (fanout exchanges)
- **Cache**: Redis 7
- **Logging**: Serilog → RMQ → Elasticsearch 8 + Kibana
- **Email**: MailSender consumer → Mailpit (dev)
- **Auth**: JWT HS256, BCrypt, X-Internal-Token
- **Storage**: MinIO (dev) / S3 (prod)
- **Mobile**: Flutter (Riverpod, go_router)
- **Web**: React + TypeScript + Vite (or Next.js)
- **Infra**: Docker Compose, dotnet watch

## Agents (13)

| Agent | Role |
|-------|------|
| `api-agent` | .NET Minimal API specialist (Vertical Slice + Clean Arch + Mediator) |
| `socket-agent` | SignalR bridge (real-time WebSocket + JWT) |
| `worker-agent` | Cronos-driven background jobs |
| `flutter-agent` | Mobile/tablet specialist (Riverpod + go_router + dio + i18n) |
| `react-agent` | Web UI specialist (Tailwind + Zustand + React Query + i18next) |
| `infra-agent` | Docker Compose topology, healthchecks, env wiring |
| `database-agent` | PostgreSQL + EF Core 9 specialist |
| `redis-agent` | Refresh tokens, cache, idempotency, dynamic settings |
| `rmq-agent` | Fanout exchanges, DLX topology, consumer patterns |
| `code-reviewer` | Pre-merge code review |
| `project-reviewer` | Cross-cutting project review |
| `design-system-agent` | Design tokens, component library, theming |
| `ux-agent` | User experience, flows, accessibility, microcopy |

## Skills

- `/create-new-project [Name]` — 5-phase scaffolder (gather info → create structure → build → `/verify-system` → git init)
- `/verify-system` — 4-level end-to-end health check (containers, ports, app health, pipelines)
- `/design-screen` — Claude Design loop orchestrator (visual prototype phase between flow specs and code)

## Settled architectural patterns

The team enforces these systemic capabilities across all generated code:

- **UI-only i18n** (1.0.3+) — Backend is English-only. UI apps localize via `messageKey + placeholders + fallback` envelope. Emails + push notifications localized via per-locale templates in MailSender.
- **Claude Design integration** (1.1.0+) — Optional visual-prototype phase via `/design-screen`. Per-agent handoff playbooks for flutter / react / design-system / ux.

Full details in the [team's README](https://github.com/agentteamland/software-project-team) and `agent.md` files.

## Used in

- A reference test project — validated end-to-end (`/create-new-project` + `/verify-system` all-pass) before each release.
