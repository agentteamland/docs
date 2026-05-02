# Kurulum

`atl`; tek static Go binary'si olarak gelir (~7 MB, sıfır runtime bağımlılığı). Platformuna uygun kanalı seç.

---

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

### macOS / Linux — one-liner fallback

brew yoksa (veya saf stdlib kurulum istiyorsan):

```bash
curl -fsSL https://raw.githubusercontent.com/agentteamland/cli/main/scripts/install.sh | sh
```

En son `atl` binary'sini indirir, açar ve `/usr/local/bin/atl`'a taşır (gerekirse sudo sorar). sudo'suz kurulum için: `ATL_INSTALL_DIR=$HOME/.local/bin`.

---

## Windows — PowerShell one-liner (önerilen)

```powershell
irm https://raw.githubusercontent.com/agentteamland/cli/main/scripts/install.ps1 | iex
```

Hepsi bu. PowerShell aç, yapıştır, Enter. Script:

- GitHub Releases'ten en son `atl.exe`'yi indirir
- `%LOCALAPPDATA%\Programs\atl\`'a kurar (admin gerekmez)
- O dizini **user PATH**'e ekler
- `atl --version` çalıştırarak kurulumu doğrular

Admin hakları yok, paket yöneticisi ön-koşulu yok, bomboş bir Windows makinesinde çalışır.

::: tip Neden scoop/winget yerine bunu?
Paket yöneticisine alışıksan aşağıdaki scoop / winget de iyi. Ama scoop veya winget config'lenmemişse (çoğu "vibe coding" yapan kullanıcı bunlara sahip değil), one-liner o rabbit hole'u atlatır.
:::

Güncelleme: aynı komutu tekrar çalıştır. Her zaman latest'i çeker.

Belirli sürüme pin'lemek:

```powershell
$env:ATL_VERSION = 'v0.1.5'
irm https://raw.githubusercontent.com/agentteamland/cli/main/scripts/install.ps1 | iex
```

### Windows — Scoop

Scoop zaten kurulu olan kullanıcılar için:

```powershell
scoop bucket add agentteamland https://github.com/agentteamland/scoop-bucket
scoop install atl
```

Güncelleme:

```powershell
scoop update atl
```

Scoop'un yoksa yukarıdaki PowerShell one-liner'ı kullan — scoop'u önce kurmaktan çok daha basit.

### Windows — winget

```powershell
winget install agentteamland.atl
```

::: tip En son sürümün biraz gerisinde olabilir
`atl` 2026-04-24 itibarıyla winget kataloğunda. Her yeni release `microsoft/winget-pkgs` üzerinde manuel bir review sürecinden geçiyor, bu yüzden winget en son `v*` tag'in bir-iki sürüm gerisinde olabilir. Mutlak en son sürüme ihtiyacın varsa yukarıdaki PowerShell one-liner veya scoop'u kullan.
:::

### Windows — Manuel ZIP

En hands-on yol, hiç otomasyon yok, her yerde çalışır:

1. [**GitHub Releases**](https://github.com/agentteamland/cli/releases/latest) → `atl_<version>_windows_amd64.zip` (veya `arm64`) indir.
2. ZIP'i kontrol ettiğin bir dizine aç, örn. `C:\Users\<sen>\tools\atl\`.
3. O dizini user PATH'ine ekle: **Ayarlar → Sistem → Hakkında → Gelişmiş sistem ayarları → Ortam Değişkenleri → Path → Düzenle → Yeni**, dizin yolunu yapıştır, Tamam.
4. Yeni PowerShell / cmd penceresi aç → `atl --version` → versiyonu yazdırmalı.

PowerShell script'inin kısıtlandığı kurumsal makineler için uygundur.

---

## Manuel indirme (her platform)

[**GitHub Releases**](https://github.com/agentteamland/cli/releases/latest) üzerinden önceden derlenmiş binary'yi indir. Dağıtım:

- `darwin` (macOS): `amd64`, `arm64`
- `linux`: `amd64`, `arm64`
- `windows`: `amd64`, `arm64`

Aç, `atl`'yi `PATH` üzerinde bir dizine koy, kurulum biter.

---

## Doğrula

```bash
atl --version
atl --help
```

Kurulu versiyonu ve komut listesini (`install`, `list`, `remove`, `update`, `search`, `setup-hooks`) görmelisin.

## Ne kuruldu?

Tek bir binary. `atl`, takım önbelleğini şurada tutar:

- macOS / Linux: `~/.claude/repos/agentteamland/`
- Windows: `%USERPROFILE%\.claude\repos\agentteamland\`

Kurulu takımlar bu önbellekte klonlanmış Git repoları olarak yaşar ve her projenin `.claude/` dizinine kopya ile bağlanır.

## Önerilen sıradaki adım — auto-update hook'ları

`atl` PATH'te çalışır hale geldiğinde:

```bash
atl setup-hooks
```

Bu komut Claude Code'un SessionStart + UserPromptSubmit hook'larını bağlar — her session (ve her mesaj, 30 dakikada bir throttle'lı) arka planda takım / core / `atl` güncellemelerini sessizce kontrol eder. `atl update`'i elle çalıştırmana gerek kalmaz — takımların otomatik güncel kalır. Detay: [`atl setup-hooks`](/tr/cli/setup-hooks).

## Sıradaki

- **[Hızlı başlangıç](/tr/guide/quickstart)** — ilk takımı kur.
- **[Kavramlar](/tr/guide/concepts)** — takım, agent, skill, rule, miras.
- **[Takım oluşturma](/tr/authoring/creating-a-team)** — kendi takımını yaz (public, private veya lokal).
