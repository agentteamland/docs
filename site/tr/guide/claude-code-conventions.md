# Claude Code conventions

`atl` ve kardeş skill'lerin session'lar arası state'i koordine etmek için `CLAUDE.md` içinde kullandığı marker-block konvansiyonları. Bunlar Claude Code'un project-instruction mekanizması tarafından auto-loaded HTML-comment-delimited bloklar — render edilmiş Markdown'da görünmez, Claude dosyayı okuduğunda kaçırılması imkansız.

Aynı pattern'i kendi `CLAUDE.md` dosyalarında da kullanabilirsin. Bloklar sadece konvansiyon — özel parser yok. Comment delimiter'ları onları programatik olarak find/update/remove için güvenli yapar.

## Üç blok

| Blok | Yazan | Amaç |
|---|---|---|
| `<!-- wiki:index -->` | [`/save-learnings`](/tr/skills/save-learnings) | `.claude/wiki/` sayfaları için auto-rebuilt içindekiler tablosu. Project context ile yüklenir, Claude'a sıfır cost'ta bilgi haritası verir. |
| `<!-- brainstorm:active -->` | [`/brainstorm start`](/tr/skills/brainstorm) ve [`/brainstorm done`](/tr/skills/brainstorm) | Aktif brainstorm topic'lerini project context'e pin'ler ki bir sonraki session kaçırmasın. |
| `<!-- pending-implementation -->` | Brainstorm `done` akışı | Bir brainstorm'un X'i decide ettiği ama implementation'ın henüz ship etmediği bir sonraki session'a hatırlatır. |

Üçü de aynı `<!-- block:start --> ... <!-- block:end -->` delimiter pattern'ini kullanır. Strict anlamda hiçbirinin parser'ı yok — konvansiyon, syntax değil. Ama konvansiyon basit `sed`/regex ile find/update/remove için yeterince tutarlı.

## `<!-- wiki:index -->` — bilgi haritası

`.claude/wiki/`'deki her değişiklikten sonra `/save-learnings` tarafından auto-rebuilt. `CLAUDE.md`'nin tepesine yakın yaşar, H1 + intro'dan sonra:

```markdown
<!-- wiki:index:start -->
## 📚 Knowledge map

Knowledge lives in `.claude/wiki/` (current truth, topic-organized) and `.claude/journal/` (historical record, date-based). Before working on a topic, scan this list — if a page looks relevant, read it before deciding.

**Wiki topics:**
- [docs-audit-false-positive-rate](.claude/wiki/docs-audit-false-positive-rate.md) — ~40% of multi-agent docs-drift audit reports include hallucinated findings
- [pr-merge-discipline](.claude/wiki/pr-merge-discipline.md) — never `gh pr merge` from Claude; surface URL and stop
- [save-learnings-timing](.claude/wiki/save-learnings-timing.md) — run before PR creation as feature branch's last commit
- ...

**Discipline:** Before working on a topic, scan this list. If a topic looks relevant, read the page.
<!-- wiki:index:end -->
```

Her entry tek satır: `- [topic](.claude/wiki/topic.md) — one-line summary` (filename'e göre alfabetik sıralı). Özet her wiki sayfasının ilk non-frontmatter, non-heading satırından gelir.

**Neden marker block, sadece normal section değil:** blok programatik olarak rebuild ediliyor. Marker'ların içine yapılan hand-edit'ler bir sonraki `/save-learnings` çalıştırmasında üzerine yazılır. Bir topic eklemek için: `CLAUDE.md`'yi doğrudan edit ETME — wiki sayfasını topic title ile oluştur, sonra `/save-learnings` index'i rebuild eder.

## `<!-- brainstorm:active -->` — aktif topic pin

`/brainstorm start` tarafından yazılır, `/brainstorm done` tarafından kaldırılır. Scope'un `CLAUDE.md`'sinin (project) veya `~/.claude/CLAUDE.md`'sinin (global) veya team `README.md`'sinin (team-scope) tepesine yakın yaşar:

```markdown
<!-- brainstorm:active:start -->
## ⚠️ Active brainstorms

These topics have an in-progress brainstorm — read the file before making any decision on them.

- **[docs-sync-automation](.claude/brain-storms/docs-sync-automation.md)** (project, 2026-05-03) — closing the README + docs-site drift gap; save-learnings extension vs. /docs-sync skill vs. doc-agent
<!-- brainstorm:active:end -->
```

Birden fazla aktif brainstorm aynı blokta bullet olarak yan yana yaşar. `done` akışı sadece tamamlanan brainstorm için bullet'ı kaldırır; bullet listesi boşalırsa, tüm blok kaldırılır (geride bayatlamış "Active brainstorms" başlığı kalmaz).

**Bu konvansiyon neden var:** brainstorm rule'unun "her session başında `.claude/brain-storms/`'u `status: active` dosyalar için tara" adımı Claude'un her session başında bunu yapmayı hatırlamasına bağlıydı. Aktif brainstorm'u `CLAUDE.md`'ye pin'lemek auto-load yapar — kaçırılması imkansız. Directory scan artık bir redundancy mekanizması, primary signal değil.

`brainstorm@1.1.0`'da ship oldu.

## `<!-- pending-implementation -->` — decided-but-unshipped hatırlatma

Bir brainstorm'un `done` akışı henüz implement edilmemiş bir değişikliğe karar verdiğinde yazılır. Bir sonraki session'a kararın var olduğunu ve işin sıraya alındığını hatırlatır:

```markdown
<!-- pending-implementation:start -->
## 🚧 Pending implementation

Brainstorms have decided these but the work hasn't shipped yet:

- **[install-mechanism-redesign](.claude/docs/install-mechanism-redesign.md)** — symlink → project-local copy migration. Atomic write helper + auto-refresh logic queued for `atl v1.0.0`.
<!-- pending-implementation:end -->
```

Implementation land ettiğinde kaldırılır (tipik olarak değişikliği ship eden PR tarafından).

**Bu neden önemli:** hatırlatma olmadan, tamamlanmış brainstorm'lar `.claude/docs/`'de haftalarca otururken implementation diğer iş'in arkasında sıraya alınır. Pin sırayı görünür tutar.

## Bloklar nerede yaşar

Bir projenin kök `CLAUDE.md`'sinde:

```markdown
# Project Name

Kısa intro paragrafı.

<!-- brainstorm:active:start -->
## ⚠️ Active brainstorms
...
<!-- brainstorm:active:end -->

<!-- pending-implementation:start -->
## 🚧 Pending implementation
...
<!-- pending-implementation:end -->

<!-- wiki:index:start -->
## 📚 Knowledge map
...
<!-- wiki:index:end -->

## What this is
... (normal CLAUDE.md content'in geri kalanı)
```

Sıra visual hierarchy için önemli (en urgent aktif brainstorm → pending implementation queue → genel knowledge map → free-form content), ama parser sıraya aldırış etmez — sadece comment delimiter'larına.

Team repo'larda (`~/.claude/repos/agentteamland/{team}/`), aynı bloklar `CLAUDE.md` yerine `README.md`'de yaşayabilir (team `README.md`, team-scope iş için aynı loaded-by-Claude rolünü oynar).

## Kendi marker block'unu ekle

Pattern sadece konvansiyon. Kendi otomatize bölümünü eklemek için:

1. Unique bir blok adı seç (örn. `<!-- ci-status -->`).
2. Auto-rebuilt content'ini `<!-- block:start --> ... <!-- block:end -->`'a sar.
3. Script'inin her rebuild'de bloğu find/replace etmesini sağla.

Örneğin, basit bir "current sprint" bloğu:

```markdown
<!-- sprint:start -->
## 🏃 Current sprint

Sprint 5 — Phase 1.D-η — concept pages.
- [ ] knowledge-system page (EN + TR)
- [ ] children-and-learnings page (EN + TR)
- ...
<!-- sprint:end -->
```

Sprint adı + checklist input olarak alan ve `CLAUDE.md`'deki blok content'ini değiştiren bir script ile update et. Project context ile otomatik yüklenir.

## Neden HTML comment

Plain markdown başlıkları (`## Active brainstorms`) visual section olarak çalışırdı, ama:

- İçinde hand-edit yapmak auto-rebuild'i bozabilir
- Bir regex find/replace heading-aware olmak zorunda kalır (kırılgan)
- Kullanıcı related-but-different content ile gerçek bir "Active brainstorms" section yazabilir

HTML comment'lar:

- Render edilmiş Markdown'da görünmez (blok boş / ilgili olmadığında visual clutter yok)
- Basit regex ile find/update/remove kolay (heading-parser gerekmez)
- İnsan tarafından yazılan section'lardan ayrı (namespace çakışması yok)
- Claude Code'un project-instruction mekanizması tarafından auto-loaded (Claude `<!-- -->` framing'ine rağmen okur)

## İlgili

- [`/brainstorm`](/tr/skills/brainstorm) — `<!-- brainstorm:active -->` bloğunu yazar/kaldırır
- [`/save-learnings`](/tr/skills/save-learnings) — `<!-- wiki:index -->` bloğunu yazar
- [Knowledge system](/tr/guide/knowledge-system) — wiki:index bloğunun ne'yi index'lediği
- [Kavramlar: Skill](/tr/guide/concepts#skill) — bu konvansiyonların geniş resme nereye oturduğu
