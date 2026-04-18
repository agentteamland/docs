# `team.json`

Her takım; kök dizininde `team.json` bulunan bir Git reposudur. Bu dosya tam sözleşmedir: takımın adı, içindekiler, bağımlılıkları.

## Minimum örnek

```json
{
  "schemaVersion": 1,
  "name": "my-team",
  "version": "0.1.0",
  "description": "Küçük Next.js projeleri için starter takım.",
  "agents": [
    { "name": "web-agent", "description": "Next.js + Tailwind reviewer ve builder." }
  ]
}
```

Kurulum için bu kadarı yeter. CLI; repo'yu klonlar, `agents/web-agent.md`'yi (veya `agents/web-agent/agent.md`'yi) `.claude/agents/` altına sembolik link ile bağlar ve kurulumu kaydeder.

## Tam alan referansı

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `schemaVersion` | integer | ✅ | Şu an `1`. Breaking schema değişimlerinde bump edilir. |
| `name` | string | ✅ | Registry adı. Küçük harf, kebab-case. Registry'deki dizin adıyla uyuşmalı. |
| `version` | semver string | ✅ | SemVer 2.0.0 (`1.2.3`, `1.2.3-beta.1`). |
| `description` | string | ✅ | Tek cümlelik tanıtım. `atl search`'te görünür. |
| `author` | string | — | `"Ad <email@example.com>"` formatı önerilir. |
| `license` | SPDX string | — | `"MIT"`, `"Apache-2.0"`, vb. Yoksa `"MIT"` varsayılır. |
| `keywords` | string[] | — | Arama eşleşmesi için. `["nextjs", "tailwind", "blog"]`. |
| `repository` | string | — | Git URL. Yoksa CLI clone origin'i kullanır. |
| `homepage` | string | — | Dokümantasyon / landing URL. |
| `agents` | object[] | — | Her biri: `{ name, description }`. Adlar `agents/` altındaki dosyalarla eşleşmeli. |
| `skills` | object[] | — | Her biri: `{ name, description }`. Adlar `skills/` altındaki dizinlerle eşleşmeli. |
| `rules` | object[] | — | Her biri: `{ name, description }`. Adlar `rules/` altındaki dosyalarla eşleşmeli. |
| `extends` | string | — | Parent takım: `"name"` veya `"name@version-constraint"`. Bakınız [Miras](./inheritance). |
| `excludes` | string[] | — | Parent'tan gelen düşürülecek agent/skill/rule adları. |
| `dependencies` | object | — | `takım-adı → version-constraint` haritası; CLI yanında kuracaktır. |
| `requires.atl` | string | — | Minimum `atl` versiyonu. Örn. `">=0.1.0"`. |

## Version constraint'ler

`extends` ve `dependencies` alanları standart SemVer aralık sözdizimini kabul eder:

| Sözdizim | Anlamı |
|---|---|
| `^1.2.3` | `>=1.2.3 <2.0.0` (caret — önerilen varsayılan) |
| `~1.2.3` | `>=1.2.3 <1.3.0` (tilde) |
| `1.2.3` | Tam pin |
| `>=1.2.0` | Açık uçlu minimum |

Caret (`^`) önerilen varsayılandır — patch ve minor alır, breaking major'ı engeller.

## Dizin konvansiyonları

`atl`, paketlediğin dosyaları `team.json`'u okuyup eşleşen yollara bakarak keşfeder:

```
my-team/
├── team.json
├── agents/
│   ├── web-agent.md             ← basit agent (tek dosya)
│   └── db-agent/
│       ├── agent.md             ← karmaşık agent (children pattern)
│       └── children/
│           ├── migrations.md
│           └── rls.md
├── skills/
│   └── create-new-project/
│       └── skill.md
└── rules/
    └── commit-style.md
```

`team.json`'daki her kayıt (`agents[]`, `skills[]`, `rules[]` altında) gerçek bir dosya veya dizine karşılık gelmeli. Eksik kayıtlar validation'da fail eder.

## CI'da validation

Her takım repo'su; her push ve PR'da `team.json`'u [`agentteamland/core/schemas/team.schema.json`](https://github.com/agentteamland/core/blob/main/schemas/team.schema.json) şemasına karşı doğrulayan bir GitHub Action ile gelir. Mevcut takımlardan birinden o workflow'u kopyalayarak bunu bedavaya alabilirsin.

## Sıradaki

- **[Takım oluşturma](./creating-a-team)** — adım adım.
- **[Miras](./inheritance)** — `extends`, `excludes`, override.
- **[Schema referansı](/tr/reference/schema)** — makine-okunabilir sözleşme.
