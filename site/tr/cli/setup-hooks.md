# `atl setup-hooks`

Takımların, global repo'ların (core, brainstorm, rule, team-manager) ve `atl` binary'sinin hepsinin otomatik güncelleme kontrolünde tutulması için Claude Code hook'larını yapılandırır — AYRICA sohbet sırasında bırakılan inline learning marker'ların session sonunda veya context compact edilmeden önce yakalanmasını sağlar.

Hepsi senden manuel hiçbir şey beklenmeden.

`atl` ≥ 0.2.0 gerekir.

## Kullanım

```bash
atl setup-hooks                    # 30m throttle ile kur (önerilen default)
atl setup-hooks --throttle=5m      # daha agresif update kontrolü (her 5 dk aktivitede)
atl setup-hooks --throttle=1h      # daha az sık update kontrolü
atl setup-hooks --remove           # atl hook'larını kaldır
```

İlk `atl install`'da bunu otomatik aç/kapat diye soruluyor. Evet dersen senin yerine `atl setup-hooks` çalıştırılıyor. Reddettiysen veya sonradan açmak istiyorsan elle çalıştır.

## Ne yapar

`~/.claude/settings.json`'a dört giriş ekler:

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
    ],
    "SessionEnd": [
      { "hooks": [
          { "type": "command", "command": "atl learning-capture --silent-if-empty" }
      ]}
    ],
    "PreCompact": [
      { "hooks": [
          { "type": "command", "command": "atl learning-capture --silent-if-empty" }
      ]}
    ]
  }
}
```

Claude Code bunları otomatik çalıştırır:

### Auto-update hook'ları

- **`SessionStart`** — yeni Claude Code session açtığında bir kez. Başlangıçta taze kaynak.
- **`UserPromptSubmit`** — Claude'a mesaj göndermeden önce her defa. `<duration>`'da bir kez throttle'lı (default 30m). Yani per-message maliyet bir tek file-stat çağrısı (~1ms). Slow-path (gerçek git fetch + pull) saatte en fazla iki kez.

Bir şey değiştiğinde Claude context'inde `🔄 software-project-team 1.1.1 → 1.1.2 (auto-updated)` gibi bir satır görür ve istersen kullanıcıya kısaca bahseder. Hiçbir şey değişmediğinde hiçbir şey görmezsin.

### Learning-capture hook'ları (0.2.0 ile yeni)

- **`SessionEnd`** — session'ı kapatırken çalışır. Transcript'te sohbet sırasında Claude'un bıraktığı inline `<!-- learning ... -->` marker'larını tarar. Marker bulunursa context'e kısa bir rapor enjekte edilir; bir sonraki Claude Code session'u bunu yakalayıp `/save-learnings --from-markers` çalıştırarak marker'ları wiki + memory + doc draft'larına işler. Marker yoksa hook sessizce çıkar — sıfır token, sıfır maliyet.
- **`PreCompact`** — Claude Code uzun bir konuşmayı compact etmeden hemen önce çalışır. Aynı scanner — marker'lar summarization'a kaybolmasın diye.

Marker bulunduğunda context'e böyle bir rapor gelir:

```
📝 learning-capture: 3 markers detected
  1. [decision] auth-refresh (doc-impact: readme)
  2. [bug-fix] redis-connection (doc-impact: none)
  3. [discovery] setup-hooks-sessionend (doc-impact: docs)

→ Run /save-learnings --from-markers to process these into wiki + memory.
  2 markers require doc drafts (README / doc site) — see docs-sync rule.
```

Tam marker formatı ve akışı için [`learning-capture`](/tr/cli/learning-capture) sayfasına bak; davranış spesifikasyonu core'da [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) ve [docs-sync rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md) olarak yaşıyor.

## Neden dört hook

| Hook | Ne sorusunu cevaplar |
|---|---|
| `SessionStart` | "Sabah Claude Code'u sıfırdan açıyorum, upstream ne değişmiş?" |
| `UserPromptSubmit` | "4 saattir bu session'dayım, yeni release var mı?" |
| `SessionEnd` | "Bu session'da bir şeyler öğrendim — bir kısmı context'in dışında yaşayacak mı?" |
| `PreCompact` | "Claude Code konuşmayı compact etmek üzere. Summarize edilecek olanı şimdi sakla." |

Bu dördünün birini çıkardığında garanti zincirinden bir halka düşer. Birlikte end-to-end auto-freshness + auto-preservation sistemini oluştururlar.

## Idempotent — yeniden çalıştırmak güvenli

Merge, diğer hook'larını korur. `atl setup-hooks`'u yeniden çalıştırmak sadece atl'ye ait girişleri (command prefix'i `atl ` olan) değiştirir. `settings.json`'daki diğer hook'lar, permissions, model settings, `extraKnownMarketplaces` — hepsine dokunulmaz.

`--remove` de aynı şekilde sadece atl-owned hook entry'lerini çıkarır, diğer her şeyi yerinde bırakır.

## Ne zaman çalıştırmalı

- **İnteraktif Claude Code kullanıcıları için her zaman tavsiye edilir.**
- **CI / scriptli `atl install` için önerilmez** (hook'lar CI'da gereksiz tetiklenir). İlk-install opt-in prompt'u non-interactive context'te zaten atlıyor.

## Tam olarak ne kontrol edilir

### Her `atl update --silent-if-clean` çalıştırması

1. `~/.claude/repos/agentteamland/*/` — her cache'lenmiş git repo'yu dolaşır.
2. Her biri için `git fetch origin main` paralel çalışır (toplam zaman ≈ tek roundtrip, N × roundtrip değil).
3. Local remote'un gerisindeyse fast-forward `git pull`.
4. Öncesi + sonrası `team.json` parse edilip `<oldVer> → <newVer>` satırı yazılır.
5. GitHub Releases API (`github.com/agentteamland/cli/releases/latest`) atl self-check — ama 24h'de bir kez (ayrı throttle).

Slow-path toplam iş: tipik kurulumlar için (5-10 cache'lenmiş repo) ~2-3s. Fast-path: ~1ms (sadece file-stat).

### Her `atl learning-capture --silent-if-empty` çalıştırması

1. Hook'un stdin JSON payload'ından transcript yolunu okur.
2. JSONL transcript'i `<!-- learning ... -->` blokları için grep-scan eder.
3. Her marker'ın alanlarını (topic, kind, doc-impact, body) parse eder.
4. Sıfır marker'sa sessiz çıkış. Aksi halde kısa formatlı rapor yazdırır.

Sıfır-marker maliyeti: ~5ms (file read + regex scan). Marker maliyeti: transcript boyutuyla orantılı, çok düşük.

## Offline davranış

Offline'san, her repo'nun `git fetch`'i sessizce fail eder, o repo için bir `⚠` warning satırı (silent olmadığında) çıkar ve diğerleri devam eder. Learning-capture zaten network istemez — sadece local dosya okur. Claude Code'un prompt'u yine normal işler; hook fail ederse işin bloklanmaz.

## İlgili

- [`atl update`](/tr/cli/update) — manuel update (auto-update hook'ları bunu sessizce çağırır)
- [`atl learning-capture`](/tr/cli/learning-capture) — manuel scanner (learning-capture hook'ları bunu sessizce çağırır)
- [`atl install`](/tr/cli/install) — ilk kurulum (opt-in prompt'u dahil)
- [CLI kurulumu](/tr/guide/install) — makinene atl al
