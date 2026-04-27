# design-system-team

> Herhangi bir projenin içinde design system'ler ve UI prototype'ları — local, dosya tabanlı, tarayıcıda görüntülenebilir.

**Son sürüm:** `0.7.0`
**Status:** Onaylı
**Repository:** [github.com/agentteamland/design-system-team](https://github.com/agentteamland/design-system-team)

## Ne yapar

Claude Design tarzı design-system + ekran prototype çalışmasını her projeye natif olarak getirir — harici bir uygulama, API key veya daemon gerektirmeden. Tüm LLM çalışması senin kendi Claude Code oturumunda olur (mevcut Pro/Max aboneliğini kullanarak); çıktılar JSON state + Tailwind-render HTML olarak projenin `.dst/` dizinine düşer ve herhangi bir tarayıcıda açılır.

## Yükle

```bash
cd your-project
atl install design-system-team
```

[`atl`](/tr/cli/overview) ≥ 0.1.3 gerektirir.

## Hızlı başlangıç

```bash
# 1. .dst/'i mevcut projede kur
/dst-init

# 2. Bir design system oluştur (interaktif Q&A)
/dst-new-ds primary

# 3. O design system'e bağlı bir prototype oluştur
/dst-new-prototype --ds primary login-screen

# 4. Tarayıcıda her şeyi gör
/dst-open
```

## Düzen

`/dst-init` sonrası proje şunları kazanır:

```
.dst/
  index.html               ← studio landing (tarayıcıda aç)
  styles.css               ← paylaşımlı Tailwind helper'ları
  state.json               ← hafif manifest

  design-systems/
    primary/
      ds.json              ← palette, typography, spacing, component'ler, brand, voice
      detail.html          ← bu DS'in zengin görsel sayfası
      assets/              ← logo'lar, icon'lar

  prototypes/
    login-screen/
      prototype.json       ← ekran state'i (bir DS'e bağlı)
      preview.html         ← multi-state görsel (idle/loading/error/success)
      handoff.zip          ← opsiyonel export bundle
```

`.dst/` git-dostu — commit et, ücretsiz tasarım geçmişi al.

## Agent'lar (2)

- **ds-architect-agent** — Kapsamlı design system'ler tasarlar (palette theory, typography ramp, spacing, component'ler, brand identity, voice). 7 children dosyası schema, palette theory, typography, spacing, component'ler, brand, proje context okuma ve template render'ı kapsar.
- **prototype-agent** — Seçilen DS'in token'larına kesin uyan ekran prototype'ları tasarlar (token fidelity, state coverage, accessibility — taviz yok). 7 children dosyası.

## Skill'ler (10)

| Skill | Amacı |
|-------|-------|
| `/dst-init` | Mevcut projede `.dst/` kur veya tazele (self-healing) |
| `/dst-new-ds <name>` | İnteraktif Q&A ile yeni design system oluştur |
| `/dst-edit-ds <name> "<change>"` | Metinsel değişiklik uygula; yapısal değişiklikse bağlı prototype'lara cascade |
| `/dst-delete-ds <name>` | DS'i kaldır (bağımlı prototype varsa reddeder; `--force` ile orphan eder) |
| `/dst-new-prototype --ds <name> <prototype>` | DS'e bağlı ekran prototype'ı oluştur |
| `/dst-edit-prototype <name> "<change>"` | Metinsel değişiklik uygula, token fidelity'yi koru |
| `/dst-delete-prototype <name>` | Bir prototype'ı kaldır |
| `/dst-open` | `.dst/index.html`'i varsayılan tarayıcıda aç |
| `/dst-handoff <prototype> [--target …]` | Prototype + DS + asset'leri paketle, flutter-agent / react-agent'ı kaynak koda entegre etmesi için brief'le |
| `/dst-questions [init\|sync\|add\|resolve\|list]` | `.claude/wiki/open-questions.md`'i yönet (ekran çalışmasını blokluyan sorular); aktif listeyi `CLAUDE.md`'ye otomatik pin'le |

## Neden var

Nisan 2026'da üç güç birleşti:

1. Claude Design'ın rate limit'leri Pro/Max planlarda bile sıkıştırıyor.
2. Anthropic, üçüncü-parti uygulamaların Pro/Max OAuth kullanmasını engelledi ([17 Nisan enforcement'ı](https://venturebeat.com/technology/anthropic-cuts-off-the-ability-to-use-claude-subscriptions-with-openclaw-and-third-party-ai-agents)).
3. MCP sampling (sunucuların LLM çağrısı delegate etmesinin resmi yolu) Claude Code'da henüz uygulanmadı.

Pivot: **ayrı bir uygulama yapma**. Bir takım yap. Skill'ler tüm LLM işini in-session yapar. Çıktılar statik dosya. App-vari değer ayrı bir process üzerinden değil, dosya + tarayıcı üzerinden.

## İyi anlaşır

- [`software-project-team`](/tr/teams/software-project-team) — `/dst-*` skill'leriyle tasarla, flutter-agent / react-agent / api-agent ile implement et.

## Yayınlananlar

- **v0.4.0** — `dst-init` self-healing oldu (mevcut `.dst/`'ler güvenle yükseltilebilir, JSON state korunarak HTML/CSS yeniden render edilir); `dst-handoff` skill (tek komutla design→code, flutter-agent / react-agent üzerinden); prototype `target` alanı
- **v0.5.0** — dark-mode token coverage + first-prototype pipeline iyileştirmeleri
- **v0.6.0** — partial bazlı template mimarisi (bir component = bir dosya, 600 satırlık monolith bitti); katalog **7 grupta 57 component**'e büyüdü (Charts 7. grup olarak eklendi + 12 Tier 1 primitive)
- **v0.7.0** — `/dst-questions` skill + `open-questions-pinning` rule: ekran çalışmasını blokluyan ürün sorularına standart bir yer + `CLAUDE.md`'ye auto-pin (`brainstorm@1.1.0` pin pattern'i mirror'lar)

## Sıradaki (spekülatif)

- live-reload (file-watcher → SSE ile tarayıcıda auto-refresh)
- cross-project DS paylaşımı için `/dst-export` / `/dst-import`
