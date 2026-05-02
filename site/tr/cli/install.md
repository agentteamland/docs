# `atl install`

Mevcut projeye bir takım yükle.

## Kullanım

```bash
atl install <takım>                # idempotent ilk-yükleme-only no-op (atl ≥ 1.0.0)
atl install <takım> --refresh      # zorla üzerine yaz (lokal değişiklikleri uyarıyla siler)
```

`<takım>` şu olabilir:

- **Registry kısa adı** — `software-project-team`
- **Registry adı + versiyon** — `software-project-team@^1.2.0` (caret, tilde veya tam pin)
- **GitHub `owner/repo` kısayolu** — `agentteamland/starter-extended`
- **Git URL** — `https://github.com/sen/takımın.git`, `git@github.com:sen/team.git`, `ssh://...`, `file:///abs/path.git`
- **Local filesystem yolu** — `./my-team`, `~/projects/my-team`, `/abs/path/to/team` (atl ≥ 0.1.4; yol `team.json` içeren VE `.git/` içeren bir klasör olmalı)

## Örnekler

### Registry (public, doğrulanmış)

```bash
atl install software-project-team
atl install software-project-team@^1.2.0
```

### GitHub kısayolu

```bash
atl install agentteamland/starter-extended
```

### Tam Git URL (public veya private)

```bash
atl install https://github.com/acme/acme-starter.git
atl install git@github.com:sen/private-team.git          # SSH, git credential'larını kullanır
atl install https://gitea.example.com/sen/team.git       # self-hosted
```

### Local filesystem — remote gerektirmez (atl ≥ 0.1.4)

Private-local workflow: laptopunda bir takım kur, herhangi bir git server'a push etmeden kendi projene yükle.

```bash
# Bir kerelik: takımı git repo olarak kur
cd ~/projects/my-team
git init -b main && git add . && git commit -m "init"

# Herhangi bir projeye yükle:
cd ~/projects/some-app
atl install ~/projects/my-team                   # absolute yol
atl install ./my-team                            # relative yol
atl install file:///Users/sen/projects/my-team   # explicit file:// URL
```

Her üç form aynı şekilde çalışır. Kaynak `team.json` içeren bir klasör ve git repo (en az bir commit) olmalı. Tam yürüyüş için bkz. [Bir takım oluşturma](/tr/authoring/creating-a-team).

## Çoklu takım yüklemesi

Birden fazla takım aynı projede birarada yaşayabilir — `atl` v0.1.2+ bunu native destekler. Her resource (agent, rule, skill) projenin `.claude/` dizinine **kopyalanır**; `~/.claude/repos/agentteamland/{takım}/` adresindeki global cache source-of-truth olarak kalır ve `atl update` modifiye edilmemiş kopyaları senkron tutar.

```bash
atl install software-project-team
atl install design-system-team

atl list
# ✓ software-project-team@1.2.1
# ✓ design-system-team@0.8.1
```

İki takım aynı isimde bir item declare ettiğinde (örn. ikisinde de `code-reviewer` agent), en son yüklenen kazanır. atl tek satırlık uyarı basar:

```
⚠ overriding agent "code-reviewer" (was from team-a, now from team-b)
```

Bu npm / pip / GNU Stow konvansiyonlarına benzer. Bir takımı kaldırmak güvenlidir — `atl remove` o takımın kopyalanmış resource'larını siler ve geri kalan takımların kopyalarını replay eder. Kaldırılan takımın çakışmayla "kazandığı" item'lar doğru şekilde orijinal sahibine geri düşer.

## Project-local copy install (atl v1.0.0+)

Her takım resource'u — agent, rule, skill — `<project>/.claude/` altında **project-local copy** olarak yüklenir. `~/.claude/repos/agentteamland/{takım}/` adresindeki global cache, makinedeki tüm projeler arasında paylaşılan source-of-truth'dir; her proje kendi self-contained kopyasını tutar.

Bu, [install-mechanism-redesign kararının](https://github.com/agentteamland/workspace/blob/main/.claude/docs/install-mechanism-redesign.md) seçtiği topology — v1.0.0-öncesi karışım (agent + rule için sembolik link, skill için kopya) yerine. İki sebep değişikliği yönlendirdi:

1. **Mutation'lar local kalır.** `/save-learnings` ve [self-updating learning loop](https://github.com/agentteamland/workspace/blob/main/.claude/docs/self-updating-learning-loop.md)'tan otomatik büyüyen `children/` ve `learnings/` dizinleri projenin `.claude/`'ına yazar. Sembolik linklerle bu yazımlar global cache'i kirletir ve sonraki `atl update` pull'unda çakışırdı. Kopyalarla mutation'lar onları üreten projeye izole kalır.
2. **Claude Code'un skill loader'ı.** Topology kararından bağımsız olarak, Claude Code'un proje-seviye skill loader'ı `.claude/skills/` altında sembolik linkleri takip ETMEZ (upstream issue'lar [#14836](https://github.com/anthropics/claude-code/issues/14836), [#25367](https://github.com/anthropics/claude-code/issues/25367), [#37590](https://github.com/anthropics/claude-code/issues/37590)). Skill'ler zaten kopyalanmak zorundaydı; v1.0.0 redesign bunu tüm resource'lara genelleştirdi.

`atl update` senkronizasyon mekanizmasıdır — aşağı bak.

## Idempotency (atl v1.0.0+)

Zaten yüklü bir takımda `atl install <takım>`'ı ikinci kez çalıştırmak — bir bilgi mesajıyla **no-op** olur, eskiden olduğu gibi sessiz reinstall değil. v1.0.0-öncesi her install lokal edit'leri sessizce overwrite ederdi; v1.0.0+ bunu yapmak için `--refresh` ister.

```bash
atl install software-project-team           # ilk kez → yükler
atl install software-project-team           # tekrar → no-op + bilgi satırı
atl install software-project-team --refresh # zorla reinstall (lokal edit varsa uyarır)
```

Bu, `atl install`'ı tekrar çalıştırmanın script'lerde bile güvenli olduğu anlamına gelir. Yüklü bir takım için upstream değişiklikleri almak istiyorsan `atl update` kullan (modifiye edilmemiş kopyaları otomatik refresh eder).

## Ne olur

1. **Resolve.** Registry adları [`teams.json`](https://github.com/agentteamland/registry/blob/main/teams.json)'da aranır; URL'ler doğrudan kullanılır.
2. **Clone veya pull.** Takım shared cache'te yoksa clone'lanır. Varsa cache fast-forward edilir.
3. **Inheritance resolve.** `team.json`'da `extends` alanı varsa, parent (recursive olarak) child'dan önce yüklenir.
4. **Validate.** `team.json` [şemaya](/tr/reference/schema) karşı kontrol edilir. Geçersiz takımlar burada fail eder.
5. **Materialize.** Agent'lar, rule'lar ve skill'ler `.claude/agents/`, `.claude/rules/`, `.claude/skills/`'e **kopyalanır**. Precedence uygulanır (child kazanır, exclude'lar düşer). Mevcut proje kopyaları korunur (idempotent default); overwrite için `--refresh` kullan.
6. **Record.** `.claude/.team-installs.json` atomik (tmp + rename) olarak güncellenir — yüklenen takım, versiyon, chain ve `atl update`'in auto-refresh'inin kullandığı per-resource SHA-256 baseline'ları ile.

## Offline davranışı

Network erişilemezse `atl install` shared cache'e fallback eder. En son pull edilen versiyon ne ise onu alırsın. CLI bunu açıkça loglar — sessiz staleness yoktur.

## Sorun giderme

- **"team not found"** — isim registry'de yok. `atl search` dene.
- **"circular extends chain"** — chain'deki bir takım atasını extend ediyor. Hata tüm chain'i basar.
- **"schema validation failed"** — takımın `team.json`'u bozuk. Yazara fix ettirt veya daha eski versiyona pin'le.
- **"invalid team slug"** — isim safety regex'inden geçemeyen bir slug'a resolve oldu (örn. `-` ile başlıyor). Takımı `owner/repo` formunda pass et veya Git URL kullan.

## İlgili

- [`atl search`](/tr/cli/search) — bir takımın adını bul.
- [`atl list`](/tr/cli/list) — yüklü ne var bak.
- [`atl update`](/tr/cli/update) — cache pull'undan sonra modifiye edilmemiş kopyaları refresh et.
- [`atl remove`](/tr/cli/remove) — kaldır (non-interactive için `--force`).
- [Inheritance](/tr/authoring/inheritance) — `extends` nasıl resolve olur.
