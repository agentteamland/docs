# `atl list`

Mevcut projede kurulu takımları gösterir.

## Kullanım

```bash
atl list
```

## Çıktı

```
Installed teams in /home/you/projects/your-app:

  ✓ software-project-team@1.2.1
     effective: 13 agents, 3 skills, 1 rules

  ↑ starter-extended@0.2.0 [community]  (latest: 0.3.0)
     extends: software-project-team@^1.0.0
     effective: 12 agents, 2 skills, 1 rules
```

Takım başına format:

- **`✓`** — bilinen son sürümde kurulu (yeşil tik).
- **`↑`** — kurulu ama registry'de daha yeni bir sürüm var (sarı yukarı-ok). En son sürüm parantezde; `atl update` ile yenile.
- **`name@version`** — kurulu takımın adı ve sürümü (`team.json`'dan).
- **`[community]`** — takım community-status (henüz verified değil) ise rozetlenir. Verified takımlarda rozet yok.
- **`extends:`** — yalnızca takımın bir parent'ı varsa basılır. Inheritance chain'i gösterir (root → ... → yüklü takım).
- **`effective:`** — inheritance resolution sonrası sayılar: parent + child resource'ları, eksi `excludes`, child-override collision'ları birleştirilmiş.

## Kurulu takım yoksa

```
No teams installed in this project.
Run: atl install <team-name>
```

## Notlar

- `atl list`, `.claude/.team-installs.json` ve global registry cache'inden okur. Steady-state'te ağa gitmez — outdated detection (`↑`) cached registry kopyasını kullanır, o da `atl update` ile yenilenir.
- Komutun şu an hiç flag'i yok. Önceki docs `--json` ve `--chain` flag'lerinden bahsediyordu; o flag'ler hiç implement edilmedi. Scriptable output gerekirse `.claude/.team-installs.json`'u doğrudan parse et — stabil JSON: `name`, `version`, `extendsChain`, `effective` alanlarına sahip.

## İlgili

- [`atl install`](/tr/cli/install)
- [`atl remove`](/tr/cli/remove)
- [`atl update`](/tr/cli/update)
- [Miras](/tr/authoring/inheritance)
