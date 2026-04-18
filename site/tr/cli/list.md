# `atl list`

Mevcut projede kurulu takımları gösterir.

## Kullanım

```bash
atl list
```

## Çıktı

```
TAKIM                   VERSIYON   AGENT   SKILL   RULE   EXTENDS
─────────────────────────────────────────────────────────────────
software-project-team   1.0.0      13      2       1      —
starter-extended        0.2.0      12      2       1      software-project-team@^1.0.0
```

Sütunlar:

- **TAKIM** — kurulu takımın adı (`team.json`'dan).
- **VERSIYON** — kurulu versiyon.
- **AGENT / SKILL / RULE** — miras çözümü sonrası *efektif* sayılar (parent + child, excludes düşülmüş, child override'ları birleştirilmiş).
- **EXTENDS** — parent takım ve version constraint (varsa).

## Flag'ler

| Flag | Etkisi |
|---|---|
| `--json` | Listeyi JSON olarak yaz (script için). |
| `--chain` | Her takımın tam miras zincirini yazdır (satır-başına-takım). |

## JSON çıktı

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

## Kurulu takım yoksa

```
Bu projede kurulu takım yok.
Keşfetmek için `atl search <anahtar>`, kurmak için `atl install <takım>` çalıştır.
```

## İlgili

- [`atl install`](/tr/cli/install)
- [`atl remove`](/tr/cli/remove)
- [Miras](/tr/authoring/inheritance)
