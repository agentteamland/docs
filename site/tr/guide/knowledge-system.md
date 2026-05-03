# Knowledge system

`atl` kullanan bir projede bilginin nasıl organize edildiği. İki katman: **journal** (tarih-tabanlı tarihsel kayıt) ve **wiki** (topic-tabanlı güncel gerçek). Hepsi bu. İki katman. Daha fazla ekleme.

Kanonik kural [`core/rules/knowledge-system.md`](https://github.com/agentteamland/core/blob/main/rules/knowledge-system.md)'de yaşar. Bu sayfa kullanıcıya yönelik özet.

(`core@1.8.0`'da `memory-system`'den yeniden adlandırıldı, post-Q4 gerçeğini yansıtmak için: artık ayrı bir "memory" katmanı yok. İki tarih-tabanlı katman — agent memory + journal — [self-updating-learning-loop](https://github.com/agentteamland/workspace/blob/main/.claude/docs/self-updating-learning-loop.md) Q4'te tek bir `journal/` katmanına merge edildi. Önceki dosya adı yanıltıcıydı.)

## İki katman bir bakışta

| Katman | Yer | Amaç | Update style |
|---|---|---|---|
| **Journal** | `.claude/journal/{YYYY-MM-DD}_{agent}.md` | Tarih-tabanlı tarihsel kayıt. Per-agent learning history VE inter-agent sinyaller (Q4'te merge edildi — pratikte redundant). | Append-only |
| **Wiki** | `.claude/wiki/{topic}.md` | Topic-tabanlı güncel gerçek. ŞU AN doğru olanı yansıtır; eski gerçekler değiştirilir, append edilmez. | Replace / update |

Farklı paradigmalar, farklı amaçlar:

- **Journal** "zaman içinde ne oldu?" sorusunu yanıtlar (kronolojik narrative)
- **Wiki** "şu an ne doğru?" sorusunu yanıtlar (topic-tabanlı snapshot)

İkisini de okuyabilirsin; mutually exclusive değiller. Ama farklı yazılırlar.

## Journal — append, asla edit etme

Filename: `{YYYY-MM-DD}_{agent-name}.md`. Aynı tarihte birden fazla agent → birden fazla dosya. Aynı agent günde birden fazla → tek dosya, sub-heading'lerle.

Buraya gider:

- Olanların tarih-stamped narrative'i: keşifler, kararlar, bug fix'ler, ne çalıştı, ne çalışmadı
- Cross-agent notları ("X'e bir sonra dokunan için: …")
- Auto-created artifact listeleri ("bu session wiki sayfası Y, agent children dosyası Z oluşturdu")
- User-approved structural değişiklikler (yeni skill / rule / agent kararları ve red'leri)

Kurallar:

- **Append-only.** Mevcut entry'ler edit edilmez; yeni entry'ler sona gider.
- **Idempotency:** [`/save-learnings`](/tr/skills/save-learnings) bir journal bullet yazdığında, `(kind + topic + body)`'yi hash'ler ve aynı tarihteki diğer `.claude/journal/*.md` dosyalarında zaten olan duplicate'leri atlar.
- **Asla silinmez** (tarihsel kayıt).
- **`*.local.md` filename pattern gitignored** — gerçekten private content için kullan (uncommon).

Journal katmanı, `.claude/agent-memory/`'nin OLDUĞU şey (per-agent history) ARTI orijinal journal katmanının olduğu şey (cross-agent sinyaller). Q4 of self-updating-learning-loop bunları merge etti çünkü pratikte iki katmanın da formatı aynıydı (date + agent + narrative) ve sıkça birbirini cite ediyorlardı.

## Wiki — replace, sadece güncel gerçek

Filename: `{topic}.md` (kebab-case, sayfa başına bir kavram).

Projenin yaşayan bilgi tabanı. Journal'ın (tarihsel kayıt) aksine, wiki **güncel gerçeği** yansıtır — bir gerçek değişince sayfa update edilir, append edilmez.

Kurallar:

- **Topic'e göre düzenli, tarihe göre değil** (kavram başına bir sayfa)
- **`<!-- learning -->` marker'larından update edilir** [`/save-learnings`](/tr/skills/save-learnings) üzerinden, veya doğrudan [`/wiki ingest`](/tr/skills/wiki) üzerinden
- **Sayfalar ŞU AN doğru olanı yansıtır** — eski info değiştirilir, append edilmez
- **Cross-referenced:** ilgili sayfalar birbirine link verir
- **`index.md` auto-maintained** içindekiler tablosu olarak
- **`CLAUDE.md`'nin tepesinde `<!-- wiki:index -->` marker bloğu** topic listesini auto-aggregate eder ([self-updating-learning-loop Q5](https://github.com/agentteamland/workspace/blob/main/.claude/docs/self-updating-learning-loop.md) gereği)
- **Bootstrap:** `.claude/wiki/`'si olmayan bir projede [`/wiki init`](/tr/skills/wiki) çalıştır kurmak için
- **Lint** [`/wiki lint`](/tr/skills/wiki) ile periyodik

## Agent başlangıç rutini

Her konuşmanın başında, agent okur (uygulanabildiyse):

1. **Kendi agent dosyası** — takımdan, project-local copy üzerinden. `agent.md` `children/*.md` frontmatter'ından auto-aggregated bir Knowledge Base bölümüyle gelir ([Children + learnings](/tr/guide/children-and-learnings) gereği).
2. **`CLAUDE.md` `<!-- wiki:index -->` bloğu** — auto-loaded; sıfır maliyetle bilgi haritası verir. Agent'lar `.claude/wiki/`'yi doğrudan taramak yerine bu listeden ilgili wiki sayfalarını keşfeder.
3. **Yakın journal entry'leri** task önceki çalışmayla overlap ediyorsa — `.claude/journal/` (son birkaç entry genellikle yeterli).
4. **Project-specific rule'lar** `.claude/docs/coding-standards/{app}.md`'de varsa.

Agent TÜM wiki sayfalarını okumaz. Index'i okur (auto-loaded), ve sadece task o domain'e dokununca detail page'lere link'i takip eder. Bu context'i sıkı tutar discoverability'yi koruyarak.

## Konuşma sonu rutini — SessionStart üzerinden auto-trigger

"Save at session end" semantiği **scan-on-next-session-start** olarak implement edilmiş çünkü Claude Code'un `SessionEnd` hook çıktısı bir sonraki session Claude'una asla ulaşmaz ([Learning marker lifecycle](/tr/guide/learning-marker-lifecycle) sayfasına bakın). Auto-trigger akışı:

- **Konuşma sırasında:** learning anları olduğunda `<!-- learning -->` marker'ları düşür. Marker formatı ve disiplin için [marker lifecycle sayfasına](/tr/guide/learning-marker-lifecycle) bak.
- **Bir sonraki session başında:** [`atl session-start`](/tr/cli/setup-hooks) wrapper → [`atl learning-capture --previous-transcripts`](/tr/cli/learning-capture) → çıktı additionalContext'te görünür → [`/save-learnings --from-markers --transcripts ...`](/tr/skills/save-learnings) çağırırsın → loop kapanır.
- **Bir değişiklik user-facing olduğunda:** değişikliğin yapıldığı aynı turda, eşleşen README / docs-site sayfasını da update et. [`docs-sync` rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md)'a bak.

`atl setup-hooks` kurulu değilse, marker'lar yine de transkriptte birikir ve manuel `/save-learnings` invocation için müsait kalır. Hook akışı otomasyon; marker disiplini + manuel invocation temel.

## Neden iki katman, üç değil

Bu kuralın daha eski versiyonları üç katman tanımlıyordu: **memory** (per-project, per-agent, append-only history), **journal** (per-project, cross-agent sinyaller, append-only), **wiki** (per-project, topic-tabanlı, replace/update).

İlk ikisi de tarih-tabanlı, append-only, narrative-shaped'di. Her workspace'te birbirini cross-reference ediyorlardı veya aynı olayları redundant şekilde yakalıyorlardı. "Agent'ın private memory'si vs. başkalarına broadcast" ayrımı asla enforce edilmedi — herkes ikisini de okuyabiliyordu.

Q4 of self-updating-learning-loop bunları merge etti çünkü:

- Aynı format → semantik ayrım yok
- Aynı audience (tüm agent'lar ikisini de okur)
- Aynı write pattern (tarih ile append)
- Split, farklı içerik üretmeden cognitive overhead ekledi ("bu benim için mi, başkaları için mi?")

Merge edilen katman sadece `journal/`. Wiki ayrı kalıyor çünkü paradigması (topic-tabanlı current truth) journal'ınkinden (tarih-tabanlı history) gerçekten farklı.

## Per-team / per-project ayna'lar

Aynı iki-katman sistem hem kullanıcı projesinin içinde (`.claude/journal/`, `.claude/wiki/`) hem cross-project bilgi için team-repo tarafında uygulanır:

- **Agent children dosyaları** (`children/{topic}.md` team repo'nun agent dizininde) wiki'nin team-side eşdeğeri — topic-tabanlı, replace/update, agent için cross-project domain knowledge.
- **Skill learnings dosyaları** (`learnings/{topic}.md` team repo'nun skill dizininde) per-skill eşdeğer — aynı şekil, skill'e scoped.

İkisinin de `knowledge-base-summary:` frontmatter alanı vardır, `agent.md` (Knowledge Base bölümü) veya `skill.md` (Accumulated Learnings bölümü)'ne auto-aggregate olur. Tam pattern için [Children + learnings](/tr/guide/children-and-learnings)'e bak.

## İlgili

- [`/save-learnings`](/tr/skills/save-learnings) — journal entry'leri ve wiki sayfaları yazar
- [`/wiki`](/tr/skills/wiki) — wiki bakım (init / ingest / query / lint)
- [Children + learnings](/tr/guide/children-and-learnings) — bu pattern'in team-side aynası
- [Learning marker lifecycle](/tr/guide/learning-marker-lifecycle) — bilginin konuşma → marker → journal/wiki'ye nasıl aktığı
- Kanonik rule: [`core/rules/knowledge-system.md`](https://github.com/agentteamland/core/blob/main/rules/knowledge-system.md)
