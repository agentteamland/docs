# winget upstream-PR süreci

AgentTeamLand yeni `atl` versiyonlarını [`microsoft/winget-pkgs`](https://github.com/microsoft/winget-pkgs)'taki resmi Windows Package Manager catalog'una nasıl publish ediyor.

Bu sayfa **maintainer'lar için**. Son kullanıcılar release upstream catalog'a indikten sonra `winget install AgentTeamLand.atl` ile kurar.

## Neden manuel

Diğer iki distribution kanalı (Homebrew + Scoop) goreleaser tarafından tam otomatize — [`agentteamland/cli`](https://github.com/agentteamland/cli)'daki her git tag, org'umuzun tap + bucket repo'larındaki formula / manifest'i ~5 dakika içinde auto-bump'lar.

winget farklı. Microsoft'un resmi catalog'u winget'in okuduğu **tek** yer — Scoop'taki gibi "custom bucket ekle" mekanizması yok. Catalog'a publish için fork'undan `microsoft/winget-pkgs:master`'a PR açarsın, Microsoft'un validation pipeline'ı koşar, Microsoft reviewer merge eder. **Bu gate'i bypass eden otomasyon yok.**

Yani pipeline'ımızın iki fazı var:

1. **Auto** — goreleaser yeni manifest'leri FORK'umuza [`agentteamland/winget-pkgs`](https://github.com/agentteamland/winget-pkgs) push eder
2. **Manuel** — fork'umuzdan `microsoft/winget-pkgs:master`'a PR aç

Bu sayfa faz 2'yi kapsar.

## Goreleaser fork'umuza ne koyar

Tag'lenmiş her `atl` release için goreleaser fork'umuzun master branch'ine `manifests/a/AgentTeamLand/atl/<version>/` altında bir dizin ekler. Dizin winget manifest schema'sına göre üç YAML dosya içerir:

```
manifests/a/AgentTeamLand/atl/1.1.4/
├── AgentTeamLand.atl.yaml              # version manifest
├── AgentTeamLand.atl.installer.yaml    # installer metadata + URL'ler + SHA-256
└── AgentTeamLand.atl.locale.en-US.yaml # description, license, package name (en-US)
```

Bu dosyalar şunları açıklar: hangi version, installer'ı nereden indir (cli GitHub Release artifact'lerini işaret eder), SHA-256 nedir, license info, package name.

Goreleaser bu dosyaları her tag'de fork'umuzun master branch'ine otomatik commit + force-push eder. **Bu noktada upstream catalog hâlâ versiyondan haberdar değil.**

## Upstream PR'ı açma

```bash
cd repos/winget-pkgs   # workspace'in FORK'umuza clone'u

# Fork'umuzun master'ının goreleaser'ın push ettiğiyle current olduğundan emin ol:
git checkout master
git pull origin master

# PR branch oluştur:
git checkout -b atl-<version>
# (edit gerekmez — goreleaser zaten master'a manifest'leri commit etti)

# Branch'i push et:
git push -u origin atl-<version>

# Upstream microsoft/winget-pkgs'a PR aç:
gh pr create \
  --repo microsoft/winget-pkgs \
  --base master \
  --head agentteamland:atl-<version> \
  --title "New version: AgentTeamLand.atl version <X.Y.Z>" \
  --body "Adds manifests for AgentTeamLand.atl <X.Y.Z>"
```

Microsoft'un validation pipeline'ı hemen devreye girer. Yaygın check'ler:

- Manifest schema validation
- Hash verification (installer URL'sini yeniden indirir, SHA-256 hesaplar, karşılaştırır)
- Installer format check (MSIX, MSI, APPX, MSIXBundle, APPXBundle veya .exe olmalı)
- Tüm URL'lerin reachability'si
- License compatibility
- Package metadata sanity

Validation geçerse Microsoft reviewer bakar (tipik olarak 24-72h içinde). Merge eder → version Microsoft'un CDN'i propagate ettiğinde (genellikle merge'den sonraki dakikalar içinde) `winget install AgentTeamLand.atl` ile available olur.

## Validation fail olursa ne olur

Validation bot fail sebebiyle PR'a comment bırakır. Yaygın olanlar:

- **Hash mismatch** — installer manifest'indeki SHA-256'nın goreleaser'ın hesapladığıyla eşleştiğini re-check et. Genellikle goreleaser'ın fork'umuzun manifest'i commit edildikten sonra yüklediği anlamına gelir; fork'umuzun master'ını taze pull et, re-PR.
- **Unreachable URL** — cli GitHub Release'in beklenen filename ile var olduğunu check et. Bazen goreleaser tüm artifact'ler upload bitmeden manifest'i upload eder.
- **MSIX/EXE rejection** — `.exe` desteklenir ama installer [winget'in installer requirement'larını](https://github.com/microsoft/winget-pkgs/blob/master/doc/manifest/schema/1.6.0/singleton.md) karşılamalı. `atl` için temiz validation'dan geçen portable `.exe` ship ediyoruz; gelecekte installer format değişirse validation yakalar.

Fix gerekirse fork'umuzun branch'indeki manifest'leri edit et, push et, bot otomatik re-validate eder.

## cli release ile winget availability arası lag

Tipik: cli tag'inden winget catalog görünürlüğüne 1-3 gün.

Detaylı timeline:

1. **t = 0**: cli repo'ya tag push edildi
2. **t + 5dk**: goreleaser tamamladı; manifest'ler fork'umuzun master branch'inde; brew + scoop zaten güncellendi
3. **t + 10dk**: maintainer upstream PR açar (manuel adım)
4. **t + 10dk - 24h**: Microsoft validation pipeline koşar
5. **t + 24h - 72h**: Microsoft reviewer merge eder (queue'ya bağlı bazen daha hızlı, bazen daha yavaş)
6. **t + ~72h**: `winget upgrade atl` yeni versiyonu çeker

Bu lag **beklenen ve dokümante** [Install sayfasında](../guide/install) — docs explicit olarak "winget bir-iki `v*` tag gerisinde olabilir" der. Mutlak en son'a ihtiyacı olan kullanıcılar PowerShell one-liner veya scoop'a yönlendirilir.

## Tarihçe — geçmiş upstream PR'lar

| atl version | PR | Status | Notlar |
|---|---|---|---|
| v0.1.1 | [#361975](https://github.com/microsoft/winget-pkgs/pull/361975) | 2026-04-24'te merged | Catalog'daki ilk release |
| v0.2.0 | [#364841](https://github.com/microsoft/winget-pkgs/pull/364841) | 2026-04-25'te merged | İkinci release |
| v0.3.0 / v1.0.0 / v1.1.0 / v1.1.1 / v1.1.2 / v1.1.3 | _(ayrı back-PR yapılmadı)_ | fork'ta korundu | winget convention gereği intermediate version'lar fork'un branch'lerinde tutulur ama ayrı upstream'e PR yapılmaz — sıradaki "real" upstream PR onları örtük taşır |
| v1.1.4 | [#367931](https://github.com/microsoft/winget-pkgs/pull/367931) | review bekliyor | Upstream catalog'u current shipping version'a yetiştirir |

## İlgili

- [Release pipeline](release-pipeline) — full goreleaser akışı (brew + scoop + winget)
- [`atl`'yi kur](../guide/install) — kullanıcıya yönelik talimatlar, "winget gerisinde olabilir" notu dahil
- [Microsoft'un winget-pkgs README'si](https://github.com/microsoft/winget-pkgs) — upstream kuralları ve format
- [winget-cli releases](https://github.com/microsoft/winget-cli/releases) — catalog'tan pull eden client tarafı
