# `atl install`

Mevcut projeye bir takım kurar.

## Kullanım

```bash
atl install <takım>
```

`<takım>` şu biçimlerden biri olabilir:

- **Registry kısa adı** — `software-project-team`
- **Registry adı + versiyon** — `software-project-team@^1.2.0` (caret, tilde veya tam pin)
- **GitHub `owner/repo` kısayolu** — `agentteamland/starter-extended`
- **Git URL** — `https://github.com/sen/takım.git`, `git@github.com:sen/takım.git`, `ssh://...`, `file:///abs/path.git`
- **Yerel dosya sistemi yolu** — `./my-team`, `~/projects/my-team`, `/abs/path/to/team` (atl ≥ 0.1.4; path kökünde `team.json` ve `.git/` olan bir dizin olmalı)

## Örnekler

### Registry (public, onaylı)

```bash
atl install software-project-team
atl install software-project-team@^1.2.0
```

### GitHub kısayolu

```bash
atl install agentteamland/starter-extended
```

### Tam Git URL'si (public veya private)

```bash
atl install https://github.com/acme/acme-starter.git
atl install git@github.com:sen/private-team.git          # SSH, git credentials'ın kullanılır
atl install https://gitea.example.com/sen/takım.git      # self-hosted
```

### Yerel dosya sistemi — remote şart değil (atl ≥ 0.1.4)

Private-local iş akışı: laptop'unda takım geliştir, hiçbir git server'a push'lamadan kendi projene kur.

```bash
# Tek seferlik: takımı git repo olarak kur
cd ~/projects/my-team
git init -b main && git add . && git commit -m "init"

# Herhangi bir projeye kur:
cd ~/projects/some-app
atl install ~/projects/my-team                   # mutlak path
atl install ./my-team                            # göreli path
atl install file:///Users/sen/projects/my-team   # explicit file:// URL
```

Üç form da aynı şekilde çalışır. Kaynak, `team.json` içeren bir dizin ve git repo olmalı (en az bir commit). Tam walkthrough: [Takım oluşturma](/tr/authoring/creating-a-team).

## Birden fazla takım kurulumu

Aynı projede birden fazla takım yan yana yaşayabilir — `atl` v0.1.2+ bunu doğal olarak destekler. Her iki takımın agent, skill ve rule'ları aynı `.claude/` dizinine sembolik link ile bağlanır.

```bash
atl install software-project-team
atl install design-system-team

atl list
# ✓ software-project-team@1.1.0
# ✓ design-system-team@0.3.1
```

İki takım aynı isimli bir öğe declare ederse (örn. ikisinde de `code-reviewer` agent varsa), en son yüklenen kazanır. atl tek satır uyarı yazdırır:

```
⚠ overriding agent "code-reviewer" (was from team-a, now from team-b)
```

Bu npm / pip / GNU Stow konvansiyonlarıyla aynı. Bir takımı kaldırmak güvenli — `atl remove` o takımın sembolik linklerini siler ve kalan takımların linklerini orijinal kurulum sırasına göre yeniden çalar; böylece kaldırılan takımın çakışma ile "kazandığı" öğeler doğru sahibine geri döner.

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
