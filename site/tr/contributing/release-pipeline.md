# Release pipeline (goreleaser → brew + scoop + winget)

`atl` release'leri [`agentteamland/cli`](https://github.com/agentteamland/cli)'daki bir git tag'inden her desteklenen platformda `brew install` / `scoop install` / `winget install` ready-to-use binary'ye nasıl ulaşıyor.

Bu sayfa **maintainer'lar için**. Sadece atl kurmak istiyorsan bkz. [Install](../guide/install).

## Pipeline bir bakışta

```
[cli repo'ya tag push edildi]              git tag v1.1.4 && git push origin v1.1.4
        ↓
[GitHub Actions workflow tetiklendi]       .github/workflows/release.yml
        ↓
[goreleaser 6 binary build eder]           darwin/amd64, darwin/arm64,
                                           linux/amd64, linux/arm64,
                                           windows/amd64, windows/arm64
        ↓
[goreleaser her kanal için publish eder]
   ├── GitHub Release (artifact'ler attach)
   ├── homebrew-tap repo (Formula/atl.rb auto-bump + force-push)
   ├── scoop-bucket repo (atl.json manifest auto-bump)
   └── winget-pkgs FORK (manifests/a/AgentTeamLand/atl/<version>/ eklenir)
        ↓
[manuel upstream PR — sadece winget]       bkz. /tr/contributing/winget-process
```

Her diğer kanal (brew + scoop) tam otomatize. winget, version'un upstream catalog'a gerçekten görünmesi için `microsoft/winget-pkgs`'a manuel PR gerektirir.

## Nasıl tag'leniyor

Versiyonlar `cli`'ın `internal/config/config.go`'sunda yönetilir:

```go
// internal/config/config.go
const Version = "0.1.0-dev"  // build sırasında ldflags ile override edilir
```

`dev` suffix'i working-tree default'u. Goreleaser build ettiğinde git tag adı kullanarak ldflags ile override eder:

```bash
go build -ldflags "-X 'github.com/agentteamland/cli/internal/config.Version=v1.1.4'"
```

Yani `atl --version` build edildiği tag'den whatever'ı basar.

## Tag → release akışı

Release-worthy bir PR merge ettikten sonra:

```bash
cd repos/cli
git checkout main && git pull
git tag v1.1.4         # merge sonrası main'in config.go'sundaki versiyonu kullan
git push origin v1.1.4 # .github/workflows/release.yml'i tetikler
```

Tag push:

1. `cli` üzerinde GitHub Actions tetikler
2. goreleaser 6 binary cross-compile eder
3. Auto-generated changelog (commit title'larından) ile birlikte binary'leri içeren GitHub Release publish eder
4. [`agentteamland/homebrew-tap`](https://github.com/agentteamland/homebrew-tap)'a Formula update'leri force-push eder
5. [`agentteamland/scoop-bucket`](https://github.com/agentteamland/scoop-bucket)'a manifest update'leri force-push eder
6. [winget-pkgs fork'umuza](https://github.com/agentteamland/winget-pkgs) yeni manifest'ler ekler

Tag push'tan sonraki ~5 dakika içinde, `brew upgrade atl` ve `scoop update atl` yeni versiyonu çekecek. winget kanalı upstream PR ister (aşağıya bak).

## Kanal: Homebrew (macOS + Linux)

[`agentteamland/homebrew-tap`](https://github.com/agentteamland/homebrew-tap) `Formula/atl.rb`'de tek bir Ruby Formula tutar. Goreleaser her tag'de Formula'yı değiştirir — manuel edit gerekmez.

Branch protection burada bilerek uygulanmaz (goreleaser'ın force-push'ını blok ederdi).

`Formula/atl.rb` taşır:
- Mevcut version
- Per-platform binary URL'leri (cli repo'nun GitHub Release artifact'lerini işaret eder)
- Per-platform SHA-256 checksum'ları

Şu komutla kuran kullanıcı:

```bash
brew install agentteamland/tap/atl
```

tap repo'sunu clone'lar, `Formula/atl.rb`'yi okur, kendi platformunun binary'sini cli repo'nun GitHub Release'inden indirir, checksum doğrular, `/opt/homebrew/bin/atl`'a kurar (Intel mac'lerde / Linuxbrew'da `/usr/local/bin/atl`).

> **Brew tap stale formula caveat'ı:** `brew upgrade atl` üçüncü-parti tap clone'unu auto-refresh ETMEZ — sadece homebrew-core'un merkezi index'i auto-refresh edilir. `brew update && brew upgrade atl` kullan (veya 24h throttle'ı kapatmak için `HOMEBREW_AUTO_UPDATE_SECS=1` set et). Bu gotcha'nın detaylı tarihi için [brew-tap-stale-formula](https://github.com/agentteamland/workspace/blob/main/.claude/wiki/brew-tap-stale-formula.md) wiki entry'sine bak.

## Kanal: Scoop (Windows)

[`agentteamland/scoop-bucket`](https://github.com/agentteamland/scoop-bucket) `bucket/atl.json`'da tek bir JSON manifest tutar. Aynı auto-update mekanizması Homebrew gibi — goreleaser her tag'de overwrite eder.

Şu komutla kuran kullanıcı:

```powershell
scoop bucket add agentteamland https://github.com/agentteamland/scoop-bucket
scoop install atl
```

bucket'ı remote olarak ekler, `atl.json`'u indirir, Windows binary'sini cli GitHub Release'den fetch eder, `~/scoop/apps/atl/`'a kurar.

Branch protection: uygulanmaz (Homebrew tap ile aynı sebep).

## Kanal: winget (Windows, resmi catalog)

[`agentteamland/winget-pkgs`](https://github.com/agentteamland/winget-pkgs) [`microsoft/winget-pkgs`](https://github.com/microsoft/winget-pkgs) **fork**'u. winget diğer kanalların aksine arbitrary repo'lardan PULL ETMEZ — paketler Microsoft'un resmi catalog'unda olmalı.

Akış:

1. **Goreleaser auto-push** yeni manifest'leri FORK'umuzun `manifests/a/AgentTeamLand/atl/<version>/` dizinine push eder
2. **Manuel upstream PR** gerekir: fork'umuzdan `microsoft/winget-pkgs:master`'a PR aç
3. Microsoft'un validation pipeline'ı koşar (cert check, MSIX/MSI/EXE format check, hash verification, vb.)
4. Microsoft reviewer merge eder (tipik olarak birkaç gün içinde)
5. Merge sonrası `winget upgrade atl` yeni versiyonu çeker

Upstream PR adımı [winget upstream-PR process](winget-process)'te detaylı. Upstream PR merge olana kadar winget kullanıcıları önceki versiyonu görür — tipik lag bir-iki `v*` tag.

İlk üç winget release:

- v0.1.1 — [PR #361975](https://github.com/microsoft/winget-pkgs/pull/361975), 2026-04-24'te merged
- v0.2.0 — [PR #364841](https://github.com/microsoft/winget-pkgs/pull/364841), 2026-04-25'te merged
- v1.1.4 — [PR #367931](https://github.com/microsoft/winget-pkgs/pull/367931), review bekliyor (intermediate v0.3.0 / v1.0.0 / v1.1.0 / v1.1.1 / v1.1.2 / v1.1.3 manifest'leri fork'umuzun branch'lerinde korundu ama winget convention gereği ayrı back-PR yapılmadı).

## Neden böyle kurulu

Üç-kanal split **cross-platform CLI'lar için standart**. Her platformun kendi dominant package manager'ı var ve kullanıcılar tanıdık tool'larıyla kurmayı bekliyor. Goreleaser orchestrator — tek config (`cli` repo'sundaki `.goreleaser.yaml`), bir tag üçü birden tetikler.

İki otomatize kanal (brew + scoop) bakım maliyetini ~sıfırda tutar. winget kanalı release başına manuel PR ister çünkü Microsoft öyle istiyor — bu, resmi Windows catalog'da olmanın maliyeti.

Release-pipeline repo'ları (`homebrew-tap`, `scoop-bucket`, `winget-pkgs`) bilerek branch-protected DEĞİL. Goreleaser force-push yapar; protection blok ederdi. Hangi repo'ların korunduğu/korunmadığı için bkz. [Governance](../guide/governance).

## İlgili

- [`atl`'yi kur](../guide/install) — üç kanal için kullanıcıya yönelik kurulum talimatları
- [winget upstream-PR process](winget-process) — winget pipeline'ındaki manuel adım
- [Governance](../guide/governance) — org genelinde branch protection
- cli repo'nun [`.goreleaser.yaml`](https://github.com/agentteamland/cli/blob/main/.goreleaser.yaml)'si — tüm bu pipeline'ı orchestrate eden goreleaser config'i
