# Hızlı başlangıç

Sıfırdan üretime hazır bir agent takımına bir dakikadan az sürede.

## 1. `atl`'yi kur

```bash
# macOS / Linux
brew install agentteamland/tap/atl
```

```powershell
# Windows (PowerShell; paket yöneticisi şart değil)
irm https://raw.githubusercontent.com/agentteamland/cli/main/scripts/install.ps1 | iex
```

Tüm alternatifler (scoop, winget, manuel ZIP, one-liner fallback): [Kurulum rehberi](/tr/guide/install).

## 2. Proje dizini oluştur

```bash
mkdir my-new-app && cd my-new-app
```

`atl`, bir projenin içinde çalışmayı bekler — burada takımın agent, skill ve rule'ları için bir `.claude/` dizini yaratacak.

## 3. Bir takım keşfet

```bash
atl search dotnet
```

Herkese açık [registry](https://github.com/agentteamland/registry)'den eşleşen kayıtları görürsün — bunların arasında `software-project-team` de var.

## 4. Takımı kur

```bash
atl install software-project-team
```

Birkaç saniye içinde:

- Takım, paylaşımlı önbelleğe klonlanır (ilk seferinde).
- 13 agent ve 3 skill (`create-new-project`, `verify-system`, `design-screen`) `.claude/` altına kopya ile yerleşir.
- `.claude/.team-installs.json` içinde hangi takımların kurulu olduğu kayda geçer.

Artık projenle tam bir .NET + Flutter + React + Docker agent takımı bağlanmış durumda.

## 5. Ne kurulduğunu gör

```bash
atl list
```

Bu projede kurulu takımları, efektif agent sayılarını ve miras zincirini gösterir.

## 6. Claude Code'da kullan

Bu dizinde Claude Code'u aç. Takımın skill'leri slash komut olarak hazır:

- `/create-new-project MyApp` — tam bir stack'i iskele olarak kur (Aşama 1–5: gather → scaffold → build → verify → commit).
- `/verify-system` — container, port, uygulama ve pipeline'lar üzerinde uçtan uca sağlık kontrolü.

Ve her agent (api-agent, socket-agent, worker-agent, flutter-agent, react-agent, database-agent, redis-agent, rmq-agent, infra-agent, code-reviewer, project-reviewer, design-system-agent, ux-agent) Claude'un delege edebileceği şekilde kullanımda.

## 7. Güncel kal

Takımın yazarı iyileştirmeler yayınladığında:

```bash
atl update
```

Kurulu tüm takımlar pull edilir, bağımlılıklar çözülür, kopyalar yenilenir. Projenin kodunda hiçbir şey değişmez.

## Ne oldu?

Tek komutla; önceden seçilmiş, versiyonlanmış ve bağımlılıkları çözümlenmiş bir agent kümesini bir projeye kurdun. Aynı takımı kuran her proje; aynı konfigürasyonu ve yazar yeni sürüm yayınladığında aynı güncellemeleri alır.

## Yanına design araçları ekle (opsiyonel)

Design system + ekran prototype araçları da istiyorsan `design-system-team`'i de yükle:

```bash
atl install design-system-team
```

Sonra Claude Code chat'inde:

```
/dst-init
/dst-new-ds primary
/dst-new-prototype --ds primary login-screen
/dst-open
```

Token-uyumlu design system'ler ve multi-state HTML prototype'ları `.dst/` altında oluşur, her tarayıcıda açılır. Tam skill listesi için [design-system-team](/tr/teams/design-system-team) sayfasına bak.

## Sıradaki

- **[Takımlara göz at](/tr/teams/)** — registry'deki onaylı takımlar.
- **[Kavramlar](/tr/guide/concepts)** — takım, agent, skill, rule arkasındaki zihinsel model.
- **[CLI başvuru](/tr/cli/overview)** — her komut detaylı.
- **[Kendi takımını yaz](/tr/authoring/creating-a-team)** — takımını registry'ye gönder.
