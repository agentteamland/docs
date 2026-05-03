# Children + learnings

Karmaşık agent'lar ve skill'lerin birikmiş domain bilgisi için kullandığı şekil: kısa bir top-level dosya artı topic-per-file detail page'lerinin bir dizini, her biri parent dosyanın index bölümünü auto-rebuild eden tek-satır bir `knowledge-base-summary` frontmatter taşır.

Aynı pattern, iki isim — agent'lar için **`children/`**, skill'ler için **`learnings/`**. İkisi arasında tek mental model.

Kanonik kural [`core/rules/agent-structure.md`](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md)'de yaşar. Bu sayfa kullanıcıya yönelik özet.

## Bu pattern neden var

Bu olmadan, karmaşık agent'lar ve skill'ler iki anti-shape'den birinde son bulur:

1. **Monolithic dosyalar** — her şey tek bir `agent.md` veya `skill.md`'ye yığılmış. Bir parçayı diğerlerine dokunmadan update etmek zor. Diff'ler gürültülü. Re-read'ler token yakar.
2. **Hand-curated index bölümleri** — bir insanın topic dosyaları yanında bakım yaptığı ayrı bir `agent.md` içindekiler tablosu. Birinin update etmeyi unuttuğu an drift eder.

Children + learnings pattern ikisini de çözer:

- **Topic-per-file** — bir parçayı diğerlerine dokunmadan update et
- **Auto-rebuilt index** — top-level dosyanın "Knowledge Base" / "Accumulated Learnings" bölümü her [`/save-learnings`](/tr/skills/save-learnings) çalıştırmasında frontmatter'dan yeniden inşa edilir. Hand edit'ler üzerine yazılır — source of truth her child'ın frontmatter'ı.

Sonuç: bilgi sürtünmesiz birikir, top-level dosya sıkı kalır, ve index asla bayatlamaz.

## Children — agent'lar için

Her karmaşık agent şöyle organize:

```
~/.claude/repos/agentteamland/{team}/agents/{agent-name}/
├── agent.md              ← Identity, sorumluluk alanı, core principles (kısa, embedded)
└── children/             ← Detaylı bilgi, pattern'ler, stratejiler (her topic ayrı dosyada)
    ├── topic-1.md
    ├── topic-2.md
    └── ...
```

[`atl install`](/tr/cli/install) sonrası, aynı yapı projene `.claude/agents/{agent-name}/`'e kopyalanır.

### Kurallar

1. **`agent.md` kısa kalır.** Sadece: identity, sorumluluk alanı (positive list), core principles (değişmeyen, kısa bullet'lar), Knowledge Base bölümü (auto-aggregated), "read children/" talimatı.
2. **Detaylı her şey `children/` altına gider.** Stratejiler, pattern'ler, workflow'lar, konvansiyonlar — her biri ayrı `.md` dosyada.
3. **Yeni topic = yeni dosya.** `agent.md`'ye elle dokunmadan, `children/` altına bir `.md` dosyası ekle. Knowledge Base bölümü `/save-learnings` tarafından frontmatter'dan otomatik yeniden inşa edilir.
4. **Update = tek dosya.** Bir topic'i update etmek için sadece ilgili `children/` dosyasına dokunulur.
5. **Monolithic agent dosyaları yasak.**
6. **Bu pattern tüm agent'lara uygulanır.** API, Socket, Worker, Flutter, React, Mail, Log, Infra — hepsi aynı yapıyı izler.

## Learnings — skill'ler için

Her karmaşık skill agent şeklini aynalar. İki location önemli:

```
# Source-of-truth (team / core repo, atl tarafından serve edilir):
~/.claude/repos/agentteamland/{team-or-core}/skills/{skill-name}/
├── skill.md              ← Skill'in prosedürü (adımlar, identity, akış). Kısa kalır.
└── learnings/            ← Birikmiş edge case'ler, başarılı pattern'ler, anti-pattern'ler
    ├── topic-1.md
    ├── topic-2.md
    └── ...

# Project-local copy (post-atl-v1.0.0 install topology):
{project}/.claude/skills/{skill-name}/
├── skill.md              ← Aynı kopya, modify edilmemişse `atl update` ile refresh
└── learnings/            ← Aynı pattern; auto-grown kopyalar
```

[`atl install`](/tr/cli/install) skill'leri (ve agent'ları + rule'ları) projeye kopyalar. [`atl update`](/tr/cli/update) modify edilmemiş kopyaları three-way SHA-256 karşılaştırması ile refresh eder. `/save-learnings` önce project-local kopyaya yazar; auto-update akışı kullanıcı team-repo maintainer ise değişiklikleri upstream'e yayar.

Aynı şekil, aynı kurallar, aynı `knowledge-base-summary` frontmatter konvansiyonu. Skill'in `skill.md`'si `learnings/*.md` frontmatter'ından auto-aggregated bir "Accumulated Learnings" bölümüyle gelir — `agent.md`'nin Knowledge Base'iyle aynı mekanizma.

**Skill'leri agent'lar üzerine neden aynalayalım?** "Self-improving skill" framing'i, skill'i çağırırken agent'ların (Claude) görebileceği accumulated wisdom için yapılandırılmış bir yer'den faydalanır. `learnings/` olmadan, her skill kullanımı önceki çalışmalarda ortaya çıkmış edge case'lerde sıfırdan başlar.

## Frontmatter sözleşmesi

Her `children/*.md` ve `learnings/*.md` dosyası `knowledge-base-summary` frontmatter alanı taşımak ZORUNDA:

```markdown
---
knowledge-base-summary: "<auto-rebuild edilen index bölümünde kullanılan bir-üç satır özet>"
---

# <Topic Title>

<asıl içerik — pattern'ler, stratejiler, örnekler — gerektiği kadar uzun>
```

Bu özet parent dosyanın Knowledge Base / Accumulated Learnings bölümünü besleyendir. Bu olmadan, `/save-learnings` ya rebuild'de topic'i atlar YA DA (kendi oluşturduğu yeni dosyalar için) alanı generate edilmiş bir özet ile yazar; ikisinde de dosyada bir tane olmalı.

## Auto-rebuilt index bölümleri

`/save-learnings` çalıştığında, parent dosyanın index bölümünü her `children/*.md` (agent'lar için) veya `learnings/*.md` (skill'ler için) frontmatter'ından yeniden inşa eder. Şekil ikisi için de aynı:

```markdown
## Knowledge Base                     ← (skill'ler için "Accumulated Learnings")

### <Topic 1 (filename'den heading-cased)>
<knowledge-base-summary>
→ [Details](children/topic-1.md)     ← (skill'ler için learnings/topic-1.md)

### <Topic 2>
<knowledge-base-summary>
→ [Details](children/topic-2.md)

...
```

Bu bölüme yapılan hand edit'ler bir sonraki `/save-learnings` çalıştırmasında **üzerine yazılır** — source of truth her child dosyasının frontmatter'ı. `agent.md` / `skill.md`'nin geri kalanı (identity, sorumluluk, principles, akış) rebuild tarafından **dokunulmaz**.

## Üç update katmanı

Split, "knowledge accumulates"in otomatik ve sürtünmesiz olmasına izin verirken top-level dosyanın identity'sini drift'ten korur:

| Katman | Ne değişir | Nasıl |
|---|---|---|
| **A — auto** | Bir `children/{topic}.md` veya `learnings/{topic}.md` dosyası oluşturulur veya update edilir. | `/save-learnings` doğrudan yazar. Prompt yok. |
| **B — auto** | Parent'ın Knowledge Base / Accumulated Learnings bölümü yeni frontmatter set'inden yeniden inşa edilir. | `/save-learnings` rebuild eder. Prompt yok. |
| **C — gated** | Parent'ın identity / sorumluluk / principles / skill akışının değişmesi gerekir. | `/save-learnings` bir `AskUserQuestion` gate çıkarır. Kullanıcı onaylar; dosya update edilir. Kullanıcı reddeder; öneri journal'a "rejected" olarak loglanır. |

C-katmanı top-level identity'yi otomatik drift'ten korur. Kullanıcı bir değişikliği onayladıktan sonra, dosya update edilir.

## Blueprint pattern (sadece agent'lar)

Her agent'ın bir **primary production unit** vardır — tekrar tekrar yarattığı ana şey. Bu unit `children/`'da bir blueprint dosyası içermeli ki şunları içersin:

1. **Template** — production unit'in yapısal iskeleti (kod scaffold)
2. **Checklist** — unit tamamlanmadan önce doğrulanması gereken her şey
3. **Naming conventions** — dosyalar, sınıflar, method'lar nasıl adlandırılır
4. **Lifecycle** — creation → registration → testing akışı

Agent production unit'inin yeni bir instance'ını oluşturması gerektiğinde, blueprint'i okur ve adım adım takip eder.

| Agent | Primary production unit | Blueprint dosyası |
|---|---|---|
| API Agent | Feature (Command/Query/Handler/Validator) | `children/workflows.md` |
| Socket Agent | Hub method + Event | `children/hub-method-blueprint.md` |
| Worker Agent | Scheduled Job | `children/job-blueprint.md` |
| Flutter Agent | Screen / Widget | `children/screen-blueprint.md` |
| React Agent | Component / Page | `children/component-blueprint.md` |

Blueprint olmadan, agent yeni unit'leri nasıl oluşturacağını tahmin eder. Blueprint ile:

- Her unit aynı yapıyı izler
- Hiçbir şey unutulmaz (checklist completeness garantisi verir)
- Yeni team üyeleri (veya yeni Claude session'ları) tutarlı çıktı üretir
- Kalite tekrarlanabilir, kazara değil

(Skill'lerin blueprint pattern'i yok — skill IS prosedürün kendisi, template-driven bir unit değil. Accumulated Learnings bölümü skill'in blueprint checklist eşdeğeri: hatırlanacak şeyler, dikkat edilecek edge case'ler.)

## İlgili

- [Knowledge system](/tr/guide/knowledge-system) — bu team-side pattern'in project-side aynası (journal + wiki)
- [`/save-learnings`](/tr/skills/save-learnings) — children/ ve learnings/ dosyalarını yazar; parent index bölümlerini rebuild eder
- [Kavramlar: Skill](/tr/guide/concepts#skill) — learnings/ pattern'inin nereye oturduğu
- Kanonik rule: [`core/rules/agent-structure.md`](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md)

## Tarihçe

- `core@1.0.0`: agent children pattern tanıtıldı. Knowledge Base bölümü hand-maintained'di.
- `core@1.8.0`: [self-updating-learning-loop](https://github.com/agentteamland/workspace/blob/main/.claude/docs/self-updating-learning-loop.md)'un Q3'ü children pattern'ini skill'lere genişletti (`learnings/` `children/`'in aynası). Knowledge Base + Accumulated Learnings bölümleri frontmatter'dan auto-rebuild oldu. Identity / core değişiklikleri için C-katmanı onay gate'i kuralın bir parçası olarak resmileşti. "Agent Configuration Rules"dan "Agent + skill structure rules"a yeniden adlandırıldı, daha geniş scope'u yansıtmak için.
