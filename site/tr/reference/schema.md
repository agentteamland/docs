# Şema

`team.json` schema'sı şurada yayımlanır:

**[`agentteamland/core/schemas/team.schema.json`](https://github.com/agentteamland/core/blob/main/schemas/team.schema.json)**

**JSON Schema Draft 2020-12** izlenir.

## Hızlı referans

| Alan | Tip | Zorunlu | Default | Not |
|---|---|---|---|---|
| `schemaVersion` | integer | ✅ | — | Şu an `1`. |
| `name` | string | ✅ | — | Küçük harf kebab-case. Registry'de benzersiz olmalı. |
| `version` | string | ✅ | — | SemVer 2.0.0. |
| `description` | string | ✅ | — | Tek cümlelik özet. |
| `author` | string | — | — | `"Ad <email>"` formatı önerilir. |
| `license` | string | — | `"MIT"` | SPDX tanımlayıcısı. |
| `keywords` | string[] | — | `[]` | `atl search` için. |
| `repository` | string | — | — | Git URL. |
| `homepage` | string | — | — | Dokümantasyon / landing. |
| `agents` | object[] | — | `[]` | Her biri: `{ name: string, description: string }`. |
| `skills` | object[] | — | `[]` | `agents` ile aynı şekil. |
| `rules` | object[] | — | `[]` | `agents` ile aynı şekil. |
| `extends` | string | — | — | `"takım-adı"` veya `"takım-adı@constraint"`. |
| `excludes` | string[] | — | `[]` | Parent item adları (düşürülecek). |
| `dependencies` | object | — | `{}` | `"takım-adı"` → `"version-constraint"` haritası. |
| `requires` | object | — | `{}` | `{ atl: string }` — minimum CLI versiyonu. |

## CI'da schema kullanımı

Herhangi bir JSON Schema validator çalışır. [Takım oluşturma](/tr/authoring/creating-a-team) sayfasındaki `ajv-cli` GitHub Actions workflow'u tam örnek. Kısa sürüm:

```bash
npm install -g ajv-cli
curl -sSfL https://raw.githubusercontent.com/agentteamland/core/main/schemas/team.schema.json -o team.schema.json
ajv -s team.schema.json -d team.json --strict=false
```

## Editor entegrasyonu

Editor'ün `$schema` üzerinden JSON Schema'yı destekliyorsa `team.json`'un en üstüne şunu ekle:

```json
{
  "$schema": "https://raw.githubusercontent.com/agentteamland/core/main/schemas/team.schema.json",
  "schemaVersion": 1,
  ...
}
```

VS Code, JetBrains ve çoğu JSON editor otomatik tamamlama ve inline validation verir.

## Schema versiyonlama

- **Additive değişiklikler** (yeni opsiyonel alan) → bump yok.
- **Breaking değişiklikler** (alan sil, tip değiştir, required set sıkılaştır) → `schemaVersion` `2`'ye çıkar. CLI eski `schemaVersion` değerlerini en az iki minor CLI versiyonu boyunca kabul etmeye devam eder.

Mevcut schema `schemaVersion: 1`.

## İlgili

- **[team.json](/tr/authoring/team-json)** — insan-odaklı, örnekli referans.
- **[Sözlük](./glossary)** — schema terimleri.
