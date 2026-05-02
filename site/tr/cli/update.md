# `atl update`

Bir veya tüm yüklü / cache'lenmiş agentteamland repo'larının son sürümünü pull et, **ve** lokal modifiye edilmemiş project copy'leri otomatik refresh et.

## Kullanım

```bash
atl update                          # her cache'lenmiş repo'yu güncelle + modifiye olmayan kopyaları auto-refresh et
atl update <takım>                  # sadece bir takımın chain'ini güncelle (legacy)
atl update --silent-if-clean        # bir şey değişmediyse output yok (hook'ların kullandığı)
atl update --check-only             # dry-run: ne güncellenecek göster, hiçbir şey çekme
atl update --throttle=30m           # son başarılı çalıştırma <30m önceyse atla
atl update --skip-self-check        # yeni atl release kontrolü yapma
atl update -v                       # verbose (her git komutunu yazdır)
```

## Neyi günceller

Takım adı vermeden `atl update` üç adım yapar:

1. **Cache pull.** `~/.claude/repos/agentteamland/` altındaki her git repo'yu (`core`, `brainstorm`, `rule`, `team-manager`, her yüklü takım) dolaşır — `git fetch origin main` → geride kalmışsa fast-forward `git pull` → güncelse no-op.
2. **Sessiz sembolik link → kopya migration (atl ≥ 1.0.0).** Per-project, `.claude/agents/` ve `.claude/rules/` altındaki global cache'i işaret eden v1.0.0-öncesi sembolik linkler project-local kopyalarla değiştirilir. Per-project tek info satırı olarak yansır; non-destructive (önce sembolik link'in target'ı okunur, sonra link aynı içeriği taşıyan gerçek dosyayla değiştirilir).
3. **Modifiye olmayan kopyaların auto-refresh'i (atl ≥ 1.0.0).** Her yüklü takım için her project-local agent/rule/skill resource kopyası, three-way SHA-256 karşılaştırmasıyla check edilir:
   - **install-time baseline** (install'da `.team-installs.json`'a kaydedilen)
   - **mevcut project copy** (şu an `.claude/...`'da olan)
   - **mevcut cache içeriği** (az önce pull edilen)

   `current project = baseline ≠ cache` olduğunda resource lokal olarak modifiye edilmemiş → sessizce yeni cache içeriği ile overwrite edilir. `current project ≠ baseline` olduğunda kullanıcı edit etmiş → atlanır, per-team hint `atl install <takım> --refresh`'e işaret eder explicit force-overwrite için.

Ayrıca yeni `atl` binary release kontrolü yapar (GitHub Releases API, 24h'a throttle):

```
⬆  atl 1.1.1 → 1.1.2 available — run: brew upgrade atl
```

Binary otomatik upgrade EDİLMEZ — mesaj atl'yi nasıl yüklediğine göre doğru package-manager komutuna işaret eder.

## Örnek — silent-if-clean (hook'larda kullanılan)

Hiçbir şey değişmedi:

```bash
$ atl update --silent-if-clean
$                               # sıfır output, exit 0
```

Bir şey değişti:

```bash
$ atl update --silent-if-clean
🔄 software-project-team 1.2.0 → 1.2.1 (auto-updated)
🔄 core 1.8.0 → 1.9.0 (auto-updated)
   ↪ refreshed 14 unmodified copies in current project
```

## Örnek — dry-run

```bash
$ atl update --check-only
🔄 software-project-team 1.2.0 → 1.2.1 (auto-updated)
   ↪ would refresh 14 unmodified copies in current project
   ↪ would skip 2 modified copies (run: atl install software-project-team --refresh)
```

Ne güncellenecek basar; git pull yapmaz, kopyalara dokunmaz.

## Hook'larla otomatik update (önerilen)

Bir kez kur, sonsuza kadar unut:

```bash
atl setup-hooks                 # default: UserPromptSubmit 30m'a throttle
atl setup-hooks --throttle=5m   # daha agresif
atl setup-hooks --remove        # kapat
```

Bu, `~/.claude/settings.json`'a iki Claude Code hook'u ekler:

- `SessionStart` → `atl session-start --silent-if-clean` (composite: update + previous-transcript marker scan + atl self-check)
- `UserPromptSubmit` → `atl update --silent-if-clean --throttle=30m` (per-message refresh, throttle'lı)

Claude Code session açtığında veya bir prompt gönderdiğinde, hook her cache'lenmiş repo'yu sessizce refresh eder + modifiye olmayan project kopyalarını auto-refresh eder. Bir şey değiştiyse Claude tek `🔄` satırı görür ve update üzerine aksiyon alır. Hiçbir şey değişmemişse hook anında döner (~1ms, sadece file-stat check).

İlk `atl install`'da bunu açmak isteyip istemediğin sorulur. Evet de; istediğin zaman `atl setup-hooks --remove` ile geri al.

Detaylar için bkz. [`atl setup-hooks`](/tr/cli/setup-hooks).

## Versiyon constraint'leri (per-team) hâlâ honorlanır

`software-project-team@^1.0.0` yüklediysen, `atl update` en son `1.x.x`'e kadar pull eder — `2.0.0` DEĞİL. Major bump'lar için explicit `atl install software-project-team@^2.0.0` gerekir.

## Throttle internals

İki timestamp dosyası şurada yaşar:

- `~/.claude/cache/atl-last-repo-check` — repo-fetch throttle
- `~/.claude/cache/atl-last-self-check` — atl-release-API throttle (24h, sabit)

`--throttle=<dur>` repo-fetch timestamp'ini check eder. Dosyanın modify time'ı `<dur>` içindeyse, repo scan tamamen atlanır (fast path ~1ms). Aksi takdirde scan çalışır, başarıda dosyayı stamp'ler. Fail olursa (örn. offline) stamp güncellenmez, sonraki çağrı tekrar dener.

## Offline davranışı

Network erişilemezse, individual `git fetch` çağrıları sessizce fail eder ve o repo `⚠ <name>: fetch: <error>` olarak raporlanır (`--silent-if-clean` ile sessizleştirilmez — bilmek istersin). Geri kalan check devam eder. Project kopyaları offline run'larda asla touch edilmez.

## İlgili

- [`atl install`](/tr/cli/install) — ilk install (opt-in auto-update prompt'u ile)
- [`atl install <takım> --refresh`](/tr/cli/install#idempotency-atl-v100) — bir proje için explicit force-overwrite (lokal mod yüzünden auto-refresh seni atladığında)
- [`atl setup-hooks`](/tr/cli/setup-hooks) — hook'ları manuel yapılandır
- [`atl list`](/tr/cli/list) — yüklü ne var bak
- [Versiyon constraint'leri](/tr/authoring/team-json#version-constraints) — `^`, `~`, exact pin'ler nasıl resolve olur
