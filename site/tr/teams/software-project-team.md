# software-project-team

> Production-grade full-stack yazılım projeleri için 13 uzmanlaşmış agent.

**Son sürüm:** `1.1.4`
**Status:** Onaylı
**Repository:** [github.com/agentteamland/software-project-team](https://github.com/agentteamland/software-project-team)

## Yükle

```bash
cd your-project
atl install software-project-team
```

## Stack

- **API**: .NET 9, Minimal API, [martinothamar/Mediator](https://github.com/martinothamar/Mediator) (source generator), FluentValidation
- **Veritabanı**: PostgreSQL 17, EF Core 9
- **Mesajlaşma**: RabbitMQ 3 (fanout exchange'ler)
- **Cache**: Redis 7
- **Loglama**: Serilog → RMQ → Elasticsearch 8 + Kibana
- **E-posta**: MailSender consumer → Mailpit (dev)
- **Auth**: JWT HS256, BCrypt, X-Internal-Token
- **Depolama**: MinIO (dev) / S3 (prod)
- **Mobil**: Flutter (Riverpod, go_router)
- **Web**: React + TypeScript + Vite (veya Next.js)
- **Altyapı**: Docker Compose, dotnet watch

## Agent'lar (13)

| Agent | Rol |
|-------|-----|
| `api-agent` | .NET Minimal API uzmanı (Vertical Slice + Clean Arch + Mediator) |
| `socket-agent` | SignalR köprüsü (real-time WebSocket + JWT) |
| `worker-agent` | Cronos-driven background job'lar |
| `flutter-agent` | Mobil/tablet uzmanı (Riverpod + go_router + dio + i18n) |
| `react-agent` | Web UI uzmanı (Tailwind + Zustand + React Query + i18next) |
| `infra-agent` | Docker Compose topolojisi, healthcheck'ler, env wiring |
| `database-agent` | PostgreSQL + EF Core 9 uzmanı |
| `redis-agent` | Refresh token, cache, idempotency, dynamic settings |
| `rmq-agent` | Fanout exchange'ler, DLX topolojisi, consumer pattern'leri |
| `code-reviewer` | Pre-merge code review |
| `project-reviewer` | Cross-cutting project review |
| `design-system-agent` | Design token'ları, component kütüphanesi, theming |
| `ux-agent` | Kullanıcı deneyimi, akışlar, accessibility, microcopy |

## Skill'ler

- `/create-new-project [Name]` — 5 fazlı scaffolder (bilgi topla → yapıyı oluştur → build → `/verify-system` → git init)
- `/verify-system` — 4 seviyeli end-to-end sağlık kontrolü (container'lar, port'lar, app health, pipeline'lar)
- `/design-screen` — Claude Design loop orkestratörü (akış spec'i ile kod arasında görsel-prototype fazı)

## Yerleşik mimari pattern'leri

Takım, ürettiği tüm kodda şu sistemik kabiliyetleri uygular:

- **UI-only i18n** (1.0.3+) — Backend sadece İngilizce. UI uygulamaları `messageKey + placeholders + fallback` zarfı üzerinden yerelleştirir. Email + push notification, MailSender'daki per-locale template'lerle yerelleştirilir.
- **Claude Design entegrasyonu** (1.1.0+) — `/design-screen` üzerinden opsiyonel görsel-prototype fazı. Per-agent handoff playbook'ları flutter / react / design-system / ux için.
- **DST handoff bilgisi** (1.1.3+) — `flutter-agent` ve `react-agent`, design-system-team bundle yapısını ve prototype'ları kaynak koda entegre etmeden önceki zorunlu theme-sync adımını biliyor.
- **Cold-build scaffold disiplini** (1.1.4+) — `/create-new-project` Phase 2.2, fresh build'lerin manuel csproj düzeltmesi olmadan ilk denemede `/verify-system`'i yeşil geçmesini sağlamak için dört zorunlu csproj/migration gereksinimi (Infrastructure `<FrameworkReference Include="Microsoft.AspNetCore.App"/>`, Api `Microsoft.EntityFrameworkCore.Design`, Worker / LogIngest / MailSender `Microsoft.Extensions.Hosting`, initial EF migration) uygular. Tam discovery context: `agents/api-agent/children/known-issues.md`.

Tam detaylar için [takımın README'sine](https://github.com/agentteamland/software-project-team) ve `agent.md` dosyalarına bak.

## Kullanıldığı yer

- Bir referans test projesi — her sürümden önce uçtan uca doğrulama (`/create-new-project` + `/verify-system` all-pass) için kullanılır.
