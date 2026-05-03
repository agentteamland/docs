# Worked example: `starter-extended`

[`agentteamland/starter-extended`](https://github.com/agentteamland/starter-extended) [inheritance](inheritance) mekanizmasını uçtan uca demonstrate eden minimal bir örnek takım. Kendi extension takımını author etmek üzereysen ve en küçük geçerli örneğin nasıl göründüğünü görmek istiyorsan bu sayfayı oku.

Inheritance mekanizmasının kendisi (extends, excludes, override semantiği, load order) için önce [Inheritance](inheritance) sayfasına bak.

## `starter-extended` ne gösterir

~50 satırlık bir repo'da:

- **`extends`** — `team.json`'da parent takım declare etme (`extends: software-project-team@^1.0.0`)
- **`excludes`** — miras alınan üyeyi ada göre çıkarma (`excludes: ["ux-agent"]`)
- **Ekleme** — parent'ın üzerine kendi yeni agent'ını ekleme (`stripe-agent`)
- Kanonik agent layout'u ([`agent-structure.md`](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md) gereği) — Identity / Area of Responsibility / Core Principles / Knowledge Base, her topic `children/` altında ayrı dosya + `knowledge-base-summary` frontmatter

Toplam: 1 `team.json` + 1 agent (`stripe-agent`, 1 child dosya ile).

## Repo layout

```
starter-extended/
├── README.md                                # stub — bu docs sayfasına işaret eder
├── LICENSE                                  # MIT
├── team.json                                # declare eder: extends + excludes + yeni agent
└── agents/
    └── stripe-agent/
        ├── agent.md                         # Identity, Responsibility, Core Principles, Knowledge Base
        └── children/
            └── webhook-topology.md          # knowledge-base-summary frontmatter ile
```

## `team.json`

```json
{
  "name": "starter-extended",
  "version": "0.2.0",
  "description": "Minimal example team — software-project-team'i extend etmeyi, ux-agent'ı exclude etmeyi ve stripe-agent eklemeyi demonstrate eder.",
  "author": "agentteamland",
  "license": "MIT",
  "extends": "software-project-team@^1.0.0",
  "excludes": ["ux-agent"],
  "agents": [
    {
      "name": "stripe-agent",
      "description": "Stripe billing integration: webhook topology, idempotency, refund flows.",
      "path": "agents/stripe-agent/"
    }
  ]
}
```

Birisi `atl install starter-extended` çalıştırdığında:

1. `atl` parent'ı (`software-project-team@^1.0.0`) registry'den resolve eder → 13 agent + 3 skill kurar
2. `excludes: ["ux-agent"]` kuralı `ux-agent`'ı kurulmuş set'ten çıkarır → 12 agent + 3 skill kalır
3. Child takımın kendi agent'ı (`stripe-agent`) üzerine kurulur → toplam 13 agent + 3 skill

Kullanıcı, parent'ın full stack'i eksi ux-agent + custom Stripe-focused agent ile biter. Bu en yaygın "software-project-team'in çoğunu istiyorum ama kendi twist'imle" pattern'i.

## Agent (`stripe-agent`)

`agents/stripe-agent/agent.md` kanonik yapıyı izler ([`agent-structure.md`](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md) gereği):

```markdown
# Stripe Agent

## Identity
Stripe billing integration uzmanı. Webhook event'leri, idempotency,
refund'lar, dispute akışları ve Stripe-specific error semantiklerini
ele alır.

## Area of Responsibility
- Stripe webhook endpoint design + signature verification
- Webhook idempotency (event ID dedup, replay protection)
- Refund + partial-refund akışları
- Dispute handling
- Stripe-specific error'ları internal exception'lara mapping

## Core Principles
- Webhook payload'larına signature verification olmadan asla güvenme
- Daima idempotent — Stripe agresif retry yapar
- Refund logic API'da yaşar; Stripe SDK call'ları dedicated bir service üzerinden geçer

## Knowledge Base

(/save-learnings tarafından children/*.md frontmatter'ından auto-rebuilt.)

### Webhook Topology
Stripe'ın webhook event taxonomy'si + event'leri consumer'lara fan
out etmek için kullandığımız exchange/queue topology. Idempotency
event-ID seviyesinde Redis SETNX ile 7-günlük TTL üzerinden enforce
edilir.
→ [Details](children/webhook-topology.md)
```

`children/webhook-topology.md` dosyası kanonik `knowledge-base-summary` frontmatter taşır:

```markdown
---
knowledge-base-summary: "Stripe'ın webhook event taxonomy'si + event'leri consumer'lara fan out etmek için kullandığımız exchange/queue topology. Idempotency event-ID seviyesinde Redis SETNX ile 7-günlük TTL üzerinden enforce edilir."
---

# Webhook Topology

(Detaylı içerik: full schema'lar, naming convention'ları, retry behavior, ...)
```

Bu [Children + learnings](../guide/children-and-learnings) pattern'inin uygulamada görünüşü — parent `agent.md`'nin Knowledge Base bölümü her child dosyasının frontmatter'ından auto-rebuild edilir.

## Template olarak kullan

Repo GitHub Template olarak kuruldu. Kendi extension takımını bootstrap'la:

```bash
gh repo create your-org/your-extension-team --template agentteamland/starter-extended
```

Sonra `team.json`'u edit et:

- Farklı parent seç (`extends: design-system-team@^0.8.0`, vb.)
- İstemediğin üyeleri çıkarmak için `excludes`'i ayarla
- `agents/`, skills under `skills/`, rules under `rules/` altına kendi agent'larını ekle

Push etmeden önce lokalde validate et:

```bash
~/.claude/repos/agentteamland/core/scripts/validate-team-json.sh team.json
```

Veya validator'ı git push'a bağla (önerilen):

```bash
git config core.hooksPath .githooks    # her clone başına tek seferlik (.githooks'u da kopyaladıysan)
```

Validation geçtikten sonra push, tag, ve eğer short-name install istiyorsan [registry](registry-submission)'ye submit et.

## Ne zaman extend, ne zaman sıfırdan author

Şunlarda extend et:

- Parent takımın mimari seçimleriyle (i18n, Mediator, Docker-first, vb.) hemfikirsen ve sadece üzerine specialty agent'lar eklemek istiyorsan
- Update'lerin parent'tan akmasını istiyorsan — `software-project-team` v1.3.0 ship ettiğinde, extension'ın `^1.0.0` constraint gereği parent update'lerini otomatik alır
- Küçük, odaklı codebase istiyorsan (takımının repo'su sadece delta'ları içerir)

Şunlarda sıfırdan author et:

- Stack'in fundamental olarak farklıysa (farklı dil, farklı pattern'ler, farklı infrastructure)
- Hiçbir miras yüzey olmadan tam kontrol istiyorsan
- Farklı bir platform hedefliyorsan (örn. Rust service'leri için AgentTeamLand-style takım)

"Küçük specialty addition" case için extension dramatik şekilde daha az iş. `starter-extended` kendisi toplam ~50 satır repo — bu ".NET stack ama stripe-agent eklenmiş"in tüm maliyeti.

## İlgili

- [Inheritance](inheritance) — bu örneğin demonstrate ettiği mekanizma
- [Takım oluşturma](creating-a-team) — sıfırdan path
- [Children + learnings](../guide/children-and-learnings) — burada kullanılan agent.md / children/ layout'u
- [Registry submission](registry-submission) — takımının kısa adını catalog'a sokma

## Tarihçe

- `v0.1.0` (2026-04-17) — inheritance demonstrate eden ilk örnek
- `v0.2.0` (2026-05-02) — platform-wide review sırasında rescued (Phase 2.B/2.C migration uygulandı: agent.md sections kanonik schema'ya rename edildi + Knowledge Base bölümü eklendi; children dosyalarına `knowledge-base-summary` frontmatter eklendi; LICENSE + README eklendi)
