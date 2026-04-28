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

Aynı projede birden fazla takım yan yana yaşayabilir — `atl` v0.1.2+ bunu doğal olarak destekler. Her iki takımın agent ve rule'ları aynı `.claude/` dizinine sembolik link ile bağlanır; skill'ler ise kopyalanır (per-skill dizinler gerçek dosyalarla — `v0.3.0+` Claude Code'un skill-loader sembolik link kısıtı için workaround).

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

Bu npm / pip / GNU Stow konvansiyonlarıyla aynı. Bir takımı kaldırmak güvenli — `atl remove` o takımın sembolik linklerini (agents + rules) VE kopyalanmış skill dizinlerini siler, kalan takımları yeniden çalar; böylece kaldırılan takımın çakışma ile "kazandığı" öğeler doğru sahibine geri döner.

## Ne olur?

1. **Çözümleme.** Registry adları [`teams.json`](https://github.com/agentteamland/registry/blob/main/teams.json)'da aranır; URL'ler doğrudan kullanılır.
2. **Clone ya da pull.** Takım paylaşımlı önbellekte yoksa klonlanır. Varsa fast-forward edilir.
3. **Miras çözümü.** `team.json`'da `extends` varsa, child'dan önce parent rekürsif olarak kurulur.
4. **Validation.** `team.json` [schema](/tr/reference/schema)'ya karşı kontrol edilir. Geçersiz takımlar burada fail eder.
5. **Materialize.** Agent ve rule'lar `.claude/agents/` ve `.claude/rules/`'a **sembolik link** olur. Skill'ler `.claude/skills/`'e gerçek dizinler olarak **kopyalanır** (rekürsif). Öncelik (child kazanır, excludes düşer) uygulanır. Asimetri Claude Code workaround'u — aşağıdaki "Skill'ler neden kopyalanıyor" bölümüne bak.
6. **Kayıt.** `.claude/.team-installs.json`; kurulu takım, versiyon ve zincirle güncellenir.

## Skill'ler neden kopyalanıyor, sembolik link değil

`v0.3.0+`: Claude Code'un proje seviyesi skill loader'ı `.claude/skills/` altındaki sembolik linkleri **takip etmiyor**. Sembolik link ile bağlanmış bir skill dizini Skill tool'un discovery listesinde görünmez (`Unknown skill: <name>` döner), runtime'da skill body'sini okuma sembolik linki takip etse de. Validation/discovery pass sembolik linkleri çözmüyor. `.claude/rules/` ile tutarsız — orada sembolik linkler ÇALIŞIYOR.

Upstream takip: [anthropics/claude-code#14836](https://github.com/anthropics/claude-code/issues/14836), [#25367](https://github.com/anthropics/claude-code/issues/25367), [#37590](https://github.com/anthropics/claude-code/issues/37590).

Upstream davranışı düzelince atl, agents ve rules ile parite için skill'leri tekrar sembolik link yapabilir.

**Trade-off:** `atl update` sadece `~/.claude/repos/agentteamland/<team>/` altındaki cached source'u tazeler. Skill'leri kopyalanmış projeler pull'dan sonra cache'e göre **bayatlar**. Güncellemeleri almak için: o projede `atl install <team>`'i yeniden çalıştır (en güncel cached içeriği yeniden kopyalar).

## Yeniden çalıştırma

Aynı `atl install <takım>`'u yeniden çalıştırmak güvenlidir: CLI önbelleği kontrol eder, güncelleme varsa çeker, agent+rule sembolik linklerini yeniden kurar + skill'leri yeniden kopyalar. Yerel düzenleme sonrası VEYA `atl update` sonrası projenin değişiklikleri almasını istediğinde "reload" olarak kullanabilirsin.

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
