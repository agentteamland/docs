# `/wiki`

Proje bilgi tabanı — yaşayan, çapraz-referanslı, daima güncel. Initialize, yeni bilgi ingest, var olanı sorgu, eskime için lint.

Wiki şu soruyu yanıtlar: **"Bu projede X hakkındaki güncel gerçek nedir?"** Journal entry'lerin (append-only tarihsel narrative) ya da settled-decision dokümanlarının (statik kayıtlar) aksine, wiki sayfaları **aktif olarak bakılır** — bilgi değişince eski gerçek değiştirilir, yan yana yığılmaz.

Global skill olarak [core](https://github.com/agentteamland/core)'da gelir.

## Wiki nerede yaşar

```
.claude/wiki/
├── index.md                ← Otomatik bakılan içindekiler tablosu
├── {topic-1}.md            ← Bilgi sayfaları (kebab-case, sayfa başına tek kavram)
├── {topic-2}.md
└── ...
```

Sayfalar projenin kök `CLAUDE.md`'sinde de bir `<!-- wiki:index -->` marker bloğu üzerinden indekslenir — [`/save-learnings`](/tr/skills/save-learnings) tarafından auto-rebuild edilir, böylece her Claude session başlangıçta wiki haritasını yükler.

## Dört mod

### `init` — boş wiki kur

```
/wiki init
```

`.claude/wiki/` ve `index.md` template oluşturur. Idempotent — zaten initialize edilmiş wiki üzerinde tekrar çalıştırmak no-op (`wiki: already initialized (N pages)`).

`init`, bir projenin ilk session'ında `atl setup-hooks` configure edilmiş ama `.claude/wiki/` henüz yoksa otomatik tetiklenir.

### `ingest` — proje kaynaklarından bilgiyi wiki sayfalarına çek

```
/wiki ingest
```

Her proje bilgi kaynağını tarar ve wiki sayfalarını günceller:

| Kaynak | Önemi |
|---|---|
| Mevcut session transkriptindeki `<!-- learning -->` marker'ları | Birincil kaynak — canlı konuşma bilgisi |
| `.claude/journal/*.md` | Per-agent, per-tarih learning kaydı (post-Q4 single layer) |
| `.claude/docs/*.md` | Tamamlanmış brainstorm'lardan settled-decision dokümanlar |
| `.claude/brain-storms/*.md` (yalnızca status: completed) | Karar bağlamı |
| Yakın konuşma context'i | Az önce ne tartışıldı / inşa edildi |

Her bilgi parçası için: topic'i belirler, wiki sayfasını bulur veya oluşturur, **çelişkileri çözerek yeni bilgiyi merge eder**, çapraz referansları ve `index.md`'yi günceller.

> Wiki sayfaları **güncel gerçeği** yansıtır. Eski memory "X pattern'i kullanıyoruz" diyorsa ama daha sonraki memory "X sorun çıkardı, Y'ye geçtik" diyorsa, wiki sayfası "Y kullanıyoruz" der — ikisi birden değil.

### `query` — bir soru için wiki'de ara

```
/wiki query bu projede caching nasıl çalışır?
```

`index.md`'yi okur ilgili sayfaları bulmak için, o sayfaları okur, kaynak sayfalara atıfla bir cevap sentezler.

Şu durumlarda yararlı:

- Yeni bir geliştirici (veya yeni bir Claude session) tüm repo'yu yeniden okumadan bir konuyu anlamak istiyor
- Bir şeyin nasıl karara bağlandığını / uygulandığını unuttun
- Bir değişiklik yapmadan önce hızlı bir özet istiyorsun

### `lint` — tüm wiki'yi sağlık check

```
/wiki lint
```

Yapılan kontroller:

| Kontrol | Aksiyon |
|---|---|
| Eski sayfalar (>30 gün, kaynak dosyalar bu arada değişmiş) | Review için flag |
| Sayfalar arası çelişki | Çözüm için flag |
| Orphan sayfalar (gelen link yok) | Bağlantılar öner |
| Eksik sayfalar (referans var ama dosya yok) | Oluşturma öner; stub oluştur |
| Duplicate topic'ler | Merge öner |
| Index sync (`index.md` ↔ asıl dosyalar) | Out-of-sync ise auto-fix |

Auto-fixable issue'lar sessizce düzeltilir. Çelişkiler ve eski içerik insan review'ı için raporlanır.

Örnek çıktı:

```
Wiki Health Report:
──────────────────────────
📊 Total pages: 12
✅ Healthy: 9
⚠️  Stale (>30 days): 2 (caching-patterns.md, email-setup.md)
❌ Contradiction found: auth.md says "15min token" but jwt-config.md says "30min token"
🔗 Orphan: database-indexes.md (no incoming links)
📝 Missing: "rate-limiting" referenced in api-endpoints.md but no page exists
──────────────────────────

Fixing automatically...
✅ index.md synced
✅ Created rate-limiting.md (stub)
⚠️  Review needed: auth.md vs jwt-config.md contradiction
⚠️  Review needed: 2 stale pages
```

## Sayfa formatı

Wiki sayfaları tutarlı bir yapı izler — hem insanlar hem agent'lar hızlıca okuyabilsin diye:

```markdown
# {Topic Title}

> Last updated: {date}
> Sources: [journal](../journal/...), [brainstorm](../brain-storms/...)

## Summary
{2-3 cümle özet}

## Current State
{ŞU AN doğru olan — tarih değil, plan değil, sadece güncel gerçek}

## Key Decisions
{Bu konuda alınmış önemli kararlar, kısa gerekçesiyle}

## Patterns & Rules
{Bu konu için yerleşik konvansiyonlar}

## Known Issues
{Mevcut problem veya kısıtlar}

## Related
- [{related-topic-1}]({related-topic-1}.md)
- [{related-topic-2}]({related-topic-2}.md)
```

## Diğer skill'lerle nasıl etkileşir

Wiki çoğunlukla **otomatik bakılır** — insanlar sayfaları nadiren elle düzenler. `atl setup-hooks` configure edildiğinde normal akış:

1. Claude konuşma sırasında inline `<!-- learning topic=... -->` marker'ları düşürür ([learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) gereği)
2. **Bir sonraki session'ın SessionStart'ı** → `atl session-start` çalışır, `atl learning-capture --previous-transcripts` ile marker'ları tarar
3. Marker bulunursa → Claude [`/save-learnings --from-markers`](/tr/skills/save-learnings)'ı çağırır
4. `/save-learnings` `journal/`, agent `children/`, skill `learnings/` ve **wiki sayfalarını** günceller (replace / update)

Örnek marker propagation:

```
<!-- learning topic: redis-cache; body: TTL 30 dk olmalı, 15 değil -->
  → journal/{tarih}_{agent}.md: tarih ile birlikte tarihsel not append
  → wiki/redis-cache.md: UPDATE "TTL 30 dakika" (eski "15 dakika"yı replace)
  → (domain-specific ise) agents/{agent}/children/redis-cache.md
```

[`/brainstorm done`](/tr/skills/brainstorm) benzer şekilde, brainstorm tamamlandığında kararlarını wiki'ye ingest eder.

Marker (veya hook) olmadan, `/wiki ingest` ve `/save-learnings` (manuel mod) hâlâ çalışır — ikisi de doğrudan çağrılabilir.

## Önemli kurallar

1. **Wiki = güncel gerçek.** Tarih değil, plan değil. ŞU AN doğru olan.
2. **Update et, append etme.** Bir gerçek değişince eski versiyon değiştirilir.
3. **Daima cross-reference.** Her sayfa ilgili sayfalara link verir. Orphan'lar `lint` tarafından flag'lenir.
4. **Auto-maintained.** İnsanlar wiki'yi nadiren elle düzenler — `/save-learnings`, `/brainstorm done`, ve `/wiki ingest` güncel tutar.
5. **Agent-okunabilir.** Sayfalar hem insan hem AI için yapılandırılmış — net bölümler, belirsizlik yok.
6. **Topic tabanlı, tarih tabanlı değil.** Journal'ın (tarih tabanlı) aksine wiki topic'e göre düzenlidir. Kavram başına bir sayfa.
7. **Düzenli lint.** `/wiki lint`'i periyodik çalıştır (aylık veya bir şey eğri gözüktüğünde).

## İlgili

- [`/save-learnings`](/tr/skills/save-learnings) — bu skill'in sorgu/lint ettiği wiki sayfalarını yazar
- [`/brainstorm`](/tr/skills/brainstorm) — `done` modu kararları wiki'ye ingest eder
- [Kavramlar: Skill](/tr/guide/concepts#skill) — wiki vs journal vs settled docs

## Kaynak

- Spec: [core/skills/wiki/skill.md](https://github.com/agentteamland/core/blob/main/skills/wiki/skill.md)
