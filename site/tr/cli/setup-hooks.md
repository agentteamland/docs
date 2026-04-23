# `atl setup-hooks`

Takımların, global repo'ların (core, brainstorm, rule, team-manager) ve `atl` binary'sinin hepsinin otomatik güncelleme kontrolünde tutulması için Claude Code hook'larını yapılandırır — senden manuel hiçbir şey beklemeden.

`atl` ≥ 0.1.5 gerekir.

## Kullanım

```bash
atl setup-hooks                    # 30m throttle ile kur (önerilen default)
atl setup-hooks --throttle=5m      # daha agresif (her 5 dk aktivitede kontrol)
atl setup-hooks --throttle=1h      # daha az sık
atl setup-hooks --remove           # atl hook'larını kaldır
```

İlk `atl install`'da bunu otomatik aç/kapat diye soruluyor. Evet dersen senin yerine `atl setup-hooks` çalıştırılıyor. Reddettiysen veya sonradan açmak istiyorsan elle çalıştır.

## Ne yapar

`~/.claude/settings.json`'a iki giriş ekler:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [
          { "type": "command", "command": "atl update --silent-if-clean" }
      ]}
    ],
    "UserPromptSubmit": [
      { "hooks": [
          { "type": "command", "command": "atl update --silent-if-clean --throttle=30m" }
      ]}
    ]
  }
}
```

Claude Code bunları otomatik çalıştırır:

- **`SessionStart`** — yeni Claude Code session açtığında bir kez. Başlangıçta taze kaynak.
- **`UserPromptSubmit`** — Claude'a mesaj göndermeden önce her defa. `<duration>`'da bir kez throttle'lı (default 30m). Yani per-message maliyet bir tek file-stat çağrısı (~1ms). Slow-path (gerçek git fetch + pull) saatte en fazla iki kez.

Bir şey değiştiğinde Claude context'inde `🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)` gibi bir satır görür ve istersen kullanıcıya kısaca bahseder. Hiçbir şey değişmediğinde hiçbir şey görmezsin.

## İki hook neden

- `SessionStart` "Sabah sıfırdan Claude Code açıyorum, ne değişmiş?"i yakalar.
- `UserPromptSubmit` "4 saattir bu session'dayım, yeni release çıkmış mı?"yı yakalar.

`UserPromptSubmit` olmadan uzun oturumlar gün içi release'leri kaçırır. `SessionStart` olmadan kısa oturumlar ilk mesaj throttle gate'ine takılır.

## Idempotent — yeniden çalıştırmak güvenli

Merge, diğer hook'larını korur. `atl setup-hooks`'u yeniden çalıştırmak sadece atl'ye ait girişleri (command prefix'i `atl update --silent-if-clean` olan) değiştirir. `settings.json`'daki diğer hook'lar, permissions, model settings, `extraKnownMarketplaces` — hepsine dokunulmaz.

`--remove` de aynı şekilde sadece atl-owned hook entry'lerini çıkarır, diğer her şeyi yerinde bırakır.

## Ne zaman çalıştırmalı

- **İnteraktif Claude Code kullanıcıları için her zaman tavsiye edilir.**
- **CI / scriptli `atl install` için önerilmez** (hook CI'da tetiklenir ve gereksiz fetch yapar). İlk-install opt-in prompt'u non-interactive context'te zaten atlıyor.

## Tam olarak ne kontrol edilir

Her `atl update --silent-if-clean` çalıştırması:

1. `~/.claude/repos/agentteamland/*/` — her cache'lenmiş git repo'yu dolaşır.
2. Her biri için `git fetch origin main` paralel çalışır (toplam zaman ≈ tek roundtrip, N × roundtrip değil).
3. Local remote'un gerisindeyse fast-forward `git pull`.
4. Öncesi + sonrası `team.json` parse edilip `<oldVer> → <newVer>` satırı yazılır.
5. GitHub Releases API (`github.com/agentteamland/cli/releases/latest`) atl self-check — ama 24h'de bir kez (ayrı throttle).

Slow-path toplam iş: tipik kurulumlar için (5-10 cache'lenmiş repo) ~2-3s. Fast-path: ~1ms (sadece file-stat).

## Offline davranış

Offline'sın, her repo'nun `git fetch`'i sessizce fail eder, o repo için bir `⚠` warning satırı (silent olmadığı zaman) çıkar ve diğerleri devam eder. Claude Code'un prompt'u yine normal işler — hook fail ederse işin bloklanmaz.

## İlgili

- [`atl update`](/tr/cli/update) — manuel update (hook'lar bunu sessizce çağırır)
- [`atl install`](/tr/cli/install) — ilk kurulum (opt-in prompt'u dahil)
- [CLI kurulumu](/tr/guide/install) — makinene atl al
