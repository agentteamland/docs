# `atl install`

Mevcut projeye bir takım kurar.

## Kullanım

```bash
atl install <takım>
```

`<takım>` şu biçimlerden biri olabilir:

- **Registry kısa adı** — `software-project-team`
- **Git URL** — `https://github.com/kullanici/takim.git`
- **Adı + versiyon** — `software-project-team@^1.2.0` (caret, tilde veya tam pin)

## Örnekler

Referans takımı registry'den kur:

```bash
atl install software-project-team
```

Belirli bir versiyon:

```bash
atl install software-project-team@^1.2.0
```

Doğrudan Git URL'den (registry bakmadan):

```bash
atl install https://github.com/acme/acme-starter.git
```

## Ne olur?

1. **Çözümleme.** Registry adları [`teams.json`](https://github.com/agentteamland/registry/blob/main/teams.json)'da aranır; URL'ler doğrudan kullanılır.
2. **Clone ya da pull.** Takım paylaşımlı önbellekte yoksa klonlanır. Varsa fast-forward edilir.
3. **Miras çözümü.** `team.json`'da `extends` varsa, child'dan önce parent rekürsif olarak kurulur.
4. **Validation.** `team.json` [schema](/tr/reference/schema)'ya karşı kontrol edilir. Geçersiz takımlar burada fail eder.
5. **Sembolik link.** Agent, skill ve rule'lar doğru öncelikle `.claude/`'a bağlanır (child kazanır, excludes düşer).
6. **Kayıt.** `.claude/.team-installs.json`; kurulu takım, versiyon ve zincirle güncellenir.

## Yeniden çalıştırma

Aynı `atl install <takım>`'u yeniden çalıştırmak güvenlidir: CLI önbelleği kontrol eder, güncelleme varsa çeker, sembolik linkleri yeniden kurar. Takımı yerel düzenlerken "reload" olarak kullanabilirsin.

## Çevrimdışı davranış

Ağ erişilemezse `atl install` paylaşımlı önbelleğe düşer. Son çekilen versiyonu alırsın. CLI bunu açıkça bildirir — sessiz bayatlık yok.

## Sorun giderme

- **"team not found"** — ad registry'de değil. `atl search`'ü dene.
- **"circular extends chain"** — zincirdeki bir takım bir ancestor'ı extend ediyor. Hata zinciri tam olarak yazar.
- **"schema validation failed"** — takımın `team.json`'u bozuk. Yazara ilet veya eski bir versiyona pinle.

## İlgili

- [`atl search`](/tr/cli/search) — takım adını bul.
- [`atl list`](/tr/cli/list) — ne kurulu gör.
- [Miras](/tr/authoring/inheritance) — `extends` nasıl çözümlenir.
