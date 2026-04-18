# Kurulum

`atl`; tek static Go binary'si olarak gelir (~7 MB, sıfır runtime bağımlılığı). Platformuna uygun kanalı seç.

## macOS / Linux — Homebrew (önerilen)

```bash
brew install agentteamland/tap/atl
```

İki adımlı alternatif:

```bash
brew tap agentteamland/tap
brew install atl
```

Güncelleme:

```bash
brew update && brew upgrade atl
```

## Windows — Scoop (önerilen)

```powershell
scoop bucket add agentteamland https://github.com/agentteamland/scoop-bucket
scoop install atl
```

Güncelleme:

```powershell
scoop update atl
```

## Windows — winget

```powershell
winget install agentteamland.atl
```

::: info İlk inceleme bekleniyor
İlk winget başvurusu Microsoft tarafından manuel incelemeden geçer (genelde 1–2 hafta). Onaylandıktan sonra sonraki sürümler otomatik yayımlanır. O güne kadar Scoop veya doğrudan indirmeyi kullanın.
:::

## Manuel indirme

[**GitHub Releases**](https://github.com/agentteamland/cli/releases/latest) üzerinden önceden derlenmiş binary'yi indir. Dağıtım:

- `darwin` (macOS): `amd64`, `arm64`
- `linux`: `amd64`, `arm64`
- `windows`: `amd64`, `arm64`

Aç, `atl`'yi `PATH` üzerinde bir dizine koy, kurulum biter.

## Doğrula

```bash
atl --version
atl --help
```

Kurulu versiyonu ve komut listesini (`install`, `list`, `remove`, `update`, `search`) görmelisin.

## Ne kuruldu?

Tek bir binary. `atl`, takım önbelleğini şurada tutar:

- macOS / Linux: `~/.claude/repos/agentteamland/`
- Windows: `%USERPROFILE%\.claude\repos\agentteamland\`

Kurulu takımlar bu önbellekte klonlanmış Git repoları olarak yaşar ve her projenin `.claude/` dizinine sembolik link ile bağlanır.

## Sıradaki

- **[Hızlı başlangıç](/tr/guide/quickstart)** — ilk takımı kur.
- **[Kavramlar](/tr/guide/concepts)** — takım, agent, skill, rule, miras.
