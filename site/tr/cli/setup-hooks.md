# `atl setup-hooks`

Takımların, global repo'ların (core, brainstorm, rule, team-manager) ve `atl` binary'sinin hepsinin otomatik güncelleme kontrolünde tutulması için Claude Code hook'larını yapılandırır — AYRICA sohbet sırasında bırakılan inline learning marker'ların *bir sonraki* session başında yakalanmasını sağlar.

Hepsi senden manuel hiçbir şey beklenmeden.

`atl` ≥ 1.1.0 gerekir.

## Kullanım

```bash
atl setup-hooks                    # 30m throttle ile kur (önerilen default)
atl setup-hooks --throttle=5m      # daha agresif update kontrolü (her 5 dk aktivitede)
atl setup-hooks --throttle=1h      # daha az sık update kontrolü
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
          { "type": "command", "command": "atl session-start --silent-if-clean" }
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

Dört giriş kaydeden v1.1.0-öncesi kurulumlardaki eski `SessionEnd` ve `PreCompact` atl girdileri, sonraki `atl setup-hooks` çalıştırmasında sessizce silinir. Komutları eski yapıda çalışmaya devam ediyordu ama çıktıları Claude'a hiç ulaşmıyordu (bkz. [aşağıdaki tarihçe notu](#history-from-four-hooks-to-two)) — silmek güvenli ve kayıpsız.

Claude Code bunları otomatik çalıştırır:

### `SessionStart` — composite boot-time wrapper (v1.1.0'da gelen yeni şekil)

Yeni bir Claude Code session açtığında bir kez çalışır. Tek komut `atl session-start` üç boot-time görevini sırayla yapar:

1. **Auto-update**: `atl update --silent-if-clean` — `~/.claude/repos/agentteamland/` altındaki her cached repo'yu pull eder. Güncellemeler, Claude'un `additionalContext`'ine `🔄 <team> <oldVer> → <newVer>` satırı olarak yansır.
2. **Önceki transcript marker taraması**: `atl learning-capture --previous-transcripts` — bu projenin son başarılı `/save-learnings` çalıştırmasından sonra modify olan tüm transcript dosyalarını tarar (state `~/.claude/state/learning-capture-state.json`'da tutulur, ilk kullanımda 7 günle sınırlı). Marker bulunduğunda tek bir `🧠 learning-capture: N unprocessed markers across M transcripts → /save-learnings --from-markers --transcripts ...` bloğu basar.
3. **atl version check**: GitHub Releases API'sine 24 saatte en fazla bir kez sorgu atar. Yeni bir atl varsa `⬆ atl X.Y.Z → X.Y.Z+1 available` satırı çıkar.

Hiçbir şey değişmemiş ve marker yoksa çıktı boş olur (sıfır token maliyeti).

### `UserPromptSubmit` — throttle'lı per-message refresh

Claude'a gönderdiğin her mesajdan önce çalışır. `<duration>` başına bir kere (default 30m) throttle'lı, böylece per-mesaj maliyet tek bir file-stat çağrısı (~1ms). Yavaş yol (gerçek git fetch + pull) saatte en fazla iki kere çalışır.

Bir şey değiştiğinde Claude aynı `🔄 <team> ...` satırını context'inde görür ve kısaca anabilir. Hiçbir şey değişmediyse hiçbir şey görmezsin.

## Marker-driven learning processing Claude'a nasıl ulaşır

Akış uçtan uca otomatiktir, yalnızca tek bir Claude turn'ü manueldir:

```
[session N'i kapatırsın]   marker'lar transcript dosyasında durur
        ↓
[session N+1 açılır]
        ↓
SessionStart hook tetiklenir → atl session-start --silent-if-clean
        ↓
   adım 2: atl learning-capture --previous-transcripts
        → ~/.claude/state/learning-capture-state.json okur
        → cutoff'tan sonra modify olan proje transcript'lerini listeler
        → <!-- learning --> blokları için grep tarar (yalnızca assistant-role)
        → `🧠 learning-capture: N markers ... → Run: /save-learnings ...` basar
        ↓
Claude Code stdout'u Claude'un ilk additionalContext'ine enjekte eder
        ↓
[session N+1'in ilk turn'ü]
        ↓
Claude raporu görür, /save-learnings --from-markers --transcripts <paths> çağırır
        ↓
/save-learnings marker'ları journal + wiki + agent children + skill learnings'e
        kaydeder + state dosyasının lastProcessedAt'ini ilerletir → bir sonraki
        session 0 marker görür
```

Marker formatı ve noise-filter detayları için [`atl learning-capture`](/tr/cli/learning-capture) sayfasına bak. Davranış spesifikasyonu için core'daki [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) ve [docs-sync rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md) dosyalarına bak.

## Neden iki hook (dört değil)

| Hook | Yanıtladığı soru |
|---|---|
| `SessionStart` (`atl session-start` üzerinden) | "Claude Code'u taze açıyorum, upstream'de ne değişti + önceki session ne öğrenme bıraktı + yeni atl var mı?" |
| `UserPromptSubmit` (`atl update` üzerinden) | "Saatlerdir bu session'dayım, yeni release var mı?" |

İki hook tüm garantiyi karşılıyor. v1.1.0-öncesi 4-hook tasarımı update ile learning-capture'ı `SessionStart` / `SessionEnd` / `PreCompact` arasında ayırıyordu, ama `SessionEnd` ve `PreCompact` hook stdout'unu Claude'un `additionalContext`'ine ulaştırmıyordu — bkz. [aşağıdaki tarihçe notu](#history-from-four-hooks-to-two). Her şeyi composite wrapper ile `SessionStart`'a toplamak tüm davranışı koruyup çıktının gerçekten Claude'a ulaşmasını sağlıyor.

## Idempotency — yeniden çalıştırması güvenli

Merge, sahip olduğun diğer hook'ları korur. `atl setup-hooks` yeniden çalıştırıldığında sadece atl-owned girişlere (komutu `atl ` ile başlayan herhangi bir şey) dokunur. `settings.json`'daki diğer tüm hook'lar, permission'lar, model ayarları, `extraKnownMarketplaces` el değmemiş kalır.

`--remove` benzer şekilde sadece atl-owned hook girdilerini söker, geri kalanı yerinde bırakır. İki komut da önceki kurulumlardan kalma legacy `SessionEnd` / `PreCompact` atl girdilerini düşürür.

## Ne zaman çalıştırmalı

- **Her zaman önerilir** interaktif Claude Code kullanıcıları için.
- **Önerilmez** CI / scripted `atl install` için (hook'lar CI'da gereksiz tetiklenir). İlk-install opt-in prompt'u zaten non-interactive bağlamlarda atlanır.

## Tam olarak ne kontrol ediliyor

### Her `atl session-start` çalıştırması

1. **Auto-update** (adım 1): `~/.claude/repos/agentteamland/*/`'i dolaşır, paralel `git fetch origin main`, geride kaldıysa fast-forward pull, `team.json`'u önce+sonra parse edip `<oldVer> → <newVer>` çıkarır.
2. **Marker scan** (adım 2): `~/.claude/state/learning-capture-state.json`'dan per-project `lastProcessedAt` cutoff'unu okur (veya ilk run'da son 7 gün), o cutoff'tan sonra modify olan transcript'leri listeler, sadece assistant turn'lerinden çıkan `<!-- learning -->` blokları için tarar (v1.1.1 noise filter prose mentions, tool input/output, summary event, kebab-case regex'i geçemeyen topic'leri reddeder). Network çağrısı yok.
3. **atl self-check** (adım 3): `api.github.com/repos/agentteamland/cli/releases/latest`'a tek HTTPS GET, 24 saatte bir throttle. Yeni release varsa `⬆` satırı çıkar.

Yavaş yol: tipik kurulumlar (5-10 cached repo) için ~2-3s. Hızlı yol (throttle penceresi geçmemiş + transcript değişmemiş): ~1ms.

### Her `atl update --silent-if-clean --throttle=30m` çalıştırması

`atl session-start`'ın 1. adımıyla aynı, ama son başarılı çalıştırma 30 dakikadan az önceyse atlanır (`--throttle` ile yapılandırılabilir).

## Offline davranışı

Offline'sansa, her repo'nun `git fetch`'i sessizce başarısız olur, o repo `⚠` uyarı satırı alır (silenced değilse), gerisi devam eder. Marker tarama hiç network gerektirmez — sadece local dosya okur. Claude Code'un prompt'u normal şekilde işlemeye devam eder; hook fail olmak işini bloklamaz.

## Tarihçe — dört hook'tan iki hook'a {#history-from-four-hooks-to-two}

`atl v0.2.0` (2026-04-24) dört hook gönderdi: `SessionStart` + `UserPromptSubmit` auto-update için, `SessionEnd` + `PreCompact` learning-capture için. Capture yarısı **çalışıyor gibi görünüyordu** (binary çalıştı, marker'ları taradı, raporları bastı) ama Claude Code v2.1.x'e göre `SessionEnd` ve `PreCompact` hook stdout'u Claude'un `additionalContext`'ine ulaşmıyor. v0.2.0'dan sonraki ay maintainer-workspace'inde 9 session boyunca 324 marker **sıfır** otomatik işleme üretti — gerçek `/save-learnings` çalıştırmaları manuel kullanıcı çağrısından geldi.

`atl v1.1.0` (2026-05-02) akışı yeniden yapılandırdı:

- Yeni `atl session-start` composite wrapper update + previous-transcript marker scan + atl self-check'i birleştiriyor.
- Yeni `atl learning-capture --previous-transcripts` modu state-file cutoff'undan sonra modify olan transcript'leri okuyor (mevcut session'ın `SessionEnd`'inin tetiklenmesine ihtiyaç duymadan).
- `atl setup-hooks` v1.1.0 önceki kurulumlardan kalma legacy `SessionEnd` / `PreCompact` atl girdilerini sessizce düşürüyor. Başkalarının o event'lerdeki hook'larına dokunulmaz.

Marker protokolünün kendisi değişmedi — v0.2.0 marker formatı hâlâ çalışır. Sadece trigger yolu taşındı.

`atl v1.1.1` (2026-05-02) marker scanner'ına noise filter ekledi: yalnızca assistant-role + kebab-case topic regex. SessionStart over-report bug'ını kapatıyor — marker formatını *tartışan* bir session bir sonraki session'ın sayısını 10-25× şişiriyordu (validation sweep'inde 5 workspace transcript'i için 149 raw substring hit → 16 gerçek marker).

## İlgili

- [`atl update`](/tr/cli/update) — manuel update (auto-update hook'unun sessizce çağırdığı şey)
- [`atl learning-capture`](/tr/cli/learning-capture) — manuel scanner (`atl session-start`'ın sessizce çağırdığı şey)
- [`atl install`](/tr/cli/install) — ilk install (opt-in prompt'unu içerir)
- [CLI'yi yükle](/tr/guide/install) — atl'yi makinene almak
