# `atl update`

Bir veya tüm kurulu / cache'lenmiş agentteamland repo'larının son sürümünü çeker.

## Kullanım

```bash
atl update                          # her cache'lenmiş repo'yu güncelle (takımlar + global)
atl update <takım>                  # sadece o takımın zincirini güncelle (legacy)
atl update --silent-if-clean        # hiçbir şey değişmediyse çıktı yok (hook'lar kullanır)
atl update --check-only             # dry-run: ne değişirdi raporla, pull'lama
atl update --throttle=30m           # son başarılı çalışma <30m önce ise atla
atl update --skip-self-check        # atl release kontrolü yapma
atl update -v                       # verbose (her git komutunu yaz)
```

## Neleri günceller

Takım adı verilmeyince `atl update` `~/.claude/repos/agentteamland/` altındaki her git repo'yu döner:

- **Global repo'lar:** `core`, `brainstorm`, `rule`, `team-manager`
- **Her kurulu takım:** `software-project-team`, `design-system-team`, senin private takımların

Tümü aynı pull mekanizmasını paylaşır: `git fetch origin main` → geriyse fast-forward `git pull` → taze ise no-op.

Ayrıca yeni bir `atl` binary release'i var mı diye bakar (GitHub Releases API, 24h throttle):

```
⬆  atl 0.1.4 → 0.1.5 available — run: brew upgrade atl
```

Binary otomatik YÜKSELTİLMEZ — mesaj, atl'yi nasıl kurduğuna göre doğru paket yöneticisi komutunu gösterir.

## Örnek — silent-if-clean (hook'ların kullandığı)

Hiçbir şey değişmediyse:

```bash
$ atl update --silent-if-clean
$                               # sıfır çıktı, exit 0
```

Değişiklik varsa:

```bash
$ atl update --silent-if-clean
🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)
🔄 core 1.1.0 → 1.2.0 (auto-updated)
```

## Örnek — dry-run

```bash
$ atl update --check-only
🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)
```

Ne güncelleneceğini yazar; git pull çalıştırmaz.

## Hook'larla otomatik güncellemeler (önerilen)

Bir kez kur, hep unut:

```bash
atl setup-hooks                 # default: UserPromptSubmit 30m throttle
atl setup-hooks --throttle=5m   # daha agresif
atl setup-hooks --remove        # devre dışı
```

Bu, `~/.claude/settings.json`'a iki Claude Code hook'u yükler:

- `SessionStart` → `atl update --silent-if-clean` (session açıldığında her zaman çalışır)
- `UserPromptSubmit` → `atl update --silent-if-clean --throttle=30m` (her mesajda, throttle'lı)

Claude Code yeni session başlatıldığında veya prompt gönderdiğinde hook sessizce tüm cache'lenmiş repo'ları tazeler. Bir şey değiştiyse Claude tek `🔄` satırı görür ve güncellemeye göre davranır. Değişmediyse hook anında döner (~1ms, sadece file-stat).

İlk `atl install`'da bunu açmak ister misin diye sorulur. Evet de; `atl setup-hooks --remove` ile istediğin zaman geri alabilirsin.

Detay: [`atl setup-hooks`](/tr/cli/setup-hooks).

## Version constraint'ler (her takım için) hâlâ saygı görür

`software-project-team@^1.0.0` olarak kurduysan, `atl update` en çok `1.x.x`'e çeker — `2.0.0`'a **değil**. Major bump'lar için açıkça `atl install software-project-team@^2.0.0` gerekir.

## Throttle iç işleyişi

İki timestamp dosyası:

- `~/.claude/cache/atl-last-repo-check` — repo fetch throttle
- `~/.claude/cache/atl-last-self-check` — atl release API throttle (24h, sabit)

`--throttle=<dur>` repo-fetch timestamp'ini kontrol eder. Dosyanın mtime'ı `<dur>` içindeyse repo taraması tamamen atlanır (fast-path ~1ms). Değilse tarama çalışır, başarılıysa dosyayı stamp'ler. Fail ederse (örn. offline) stamp güncellenmez, bir sonraki çağrı tekrar dener.

## Çevrimdışı davranış

Ağ yoksa her repo'nun `git fetch`'i sessizce fail eder ve o repo `⚠ <name>: fetch: <error>` olarak raporlanır (`--silent-if-clean` onu sustur**maz** — bilmen gerekiyor). Diğerleri devam eder. Sembolik linkler hiç dokunulmaz.

## İlgili

- [`atl install`](/tr/cli/install) — ilk kurulum (opt-in auto-update prompt'u ile)
- [`atl setup-hooks`](/tr/cli/setup-hooks) — hook'ları manuel yapılandır
- [`atl list`](/tr/cli/list) — ne kurulu gör
- [Version constraint'ler](/tr/authoring/team-json#version-constraint-ler) — `^`, `~`, exact pin nasıl çözülür
