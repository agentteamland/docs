# Learning marker lifecycle

Bilginin bir konuşmadan projenin bilgi tabanına nasıl aktığının end-to-end resmi. Pattern: **inline marker'lar + bir sonraki session başında scan** — yazması ucuz, işlemesi otomatik.

Kanonik kural [`core/rules/learning-capture.md`](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md)'de yaşar. Bu sayfa kullanıcıya yönelik özet.

## Akış bir bakışta

```
[Session N]                                    Claude konuştukça inline
                                               <!-- learning --> marker'ları düşürür.
                                               Tool call yok, ekstra maliyet yok.
        ↓
[Session N biter]                              Marker'lar transkriptte oturur.
                                               Session sonunda hiçbir hook fire etmez.
        ↓
[Session N+1 başlar]                           SessionStart hook fire eder:
                                               atl session-start --silent-if-clean
        ↓
   step 3: atl learning-capture                ~/.claude/state/
           --previous-transcripts              learning-capture-state.json'u okur,
                                               cutoff'tan sonra modify edilen project
                                               transkriptlerini enumerate eder,
                                               marker bloklarını grep-tarar.
        ↓
[Çıktı Claude'a ulaşır]                        🧠 learning-capture: N markers
                                               → Run: /save-learnings ...
        ↓
[Claude'un ilk turu]                           /save-learnings çağırır
                                               --from-markers --transcripts ...
        ↓
[/save-learnings persist eder]                 Journal entry, wiki sayfa(lar)ı,
                                               agent children, skill learnings.
                                               State file'ı ilerletmek için
                                               atl learning-capture
                                               --commit-from-transcripts çağırır.
        ↓
[Loop kapandı]                                 Bir sonraki SessionStart sıfır
                                               işlenmemiş marker görür.
```

End-to-end otomatik **iki insan touch point** dışında:

1. **Sen (agent)** additionalContext recommendation'ını gördükten sonra `/save-learnings --from-markers --transcripts ...` çağırırsın. Maintainer'ın tasarımı gereği, bu tek bir command call — manuel marker-by-marker review yok.
2. **Kullanıcı** yeni yapılar (skill / rule / agent / identity / skill core değişikliği) önerildiğinde AskUserQuestion gate'ini cevaplar. Run başına bir multi-select prompt.

Geri kalan her şey (journal, wiki, children, learnings, KB rebuild'leri, state advance) sessizce olur.

## Learning anı ne sayılır

Bunlardan herhangi biri, bir konuşma sırasında olduğunda, learning anıdır:

- **Bug fix** — gerçek bir bug reproduce edildi ve düzeltildi
- **Decision** — alternatifler arasında seçim yapıldı (JWT vs session, Redis vs memcached, 7d vs 15d refresh)
- **Pattern** — bir yaklaşım temiz ve reusable çıktı
- **Anti-pattern** — bir şey denendi, fail oldu, neden olduğunu biliyoruz
- **Discovery** — sistem, library veya external service hakkında non-obvious bir gerçek
- **Convention** — "şu andan itibaren, daima / asla X yapmayız"

Routine Q&A, file lookup'lar ve mekanik edit'ler learning anı DEĞİL. Her response'u marker'lama.

## Marker formatı

Bir learning anı olduğunda response text'inde bir HTML comment düşür. Render edilmiş çıktıda görünmez, hook'un taradığı transkriptte korunur, ~40 token:

```html
<!-- learning
topic: auth-refresh
kind: decision
doc-impact: readme
body: 7-day JWT refresh seçildi çünkü uzun session istiyoruz; user haftada en fazla bir kez login.
-->
```

### Alanlar

| Alan | Required | Açıklama |
|---|---|---|
| `topic` | ✅ | kebab-case, tek kavram (wiki sayfa adı olur). Örnek: `auth-refresh`, `redis-ttl`, `build-pipeline`. |
| `kind` | ✅ | `bug-fix \| decision \| pattern \| anti-pattern \| discovery \| convention` arası. |
| `doc-impact` | ✅ | `none \| readme \| docs \| both \| breaking` arası. Emin değilsen default `none`. [docs-sync rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md)'ı tetikler. |
| `body` | ✅ | Bir-üç cümle. **Daima NEDEN'i içer.** 6-ay-eski "X seçtik" gerekçesi olmadan kullanışsız. |

### Response başına birden fazla marker

Birden fazla learning olduğunda iyi. İlişkisiz learning'leri tek marker'a bundle ETME — her topic kendi marker'ını hak eder.

## Neden inline marker, tool call değil

Learning başına bir tool call token cost'u ikiye katlar ve konuşmayı yavaşlatır. Inline marker'lar agent'ın zaten üretmek üzere olduğu text'e gömülü. Grep-level bir hook bunları ~0 cost'ta bulur; AI-heavy `/save-learnings` işi sadece marker var olduğunda çalışır — sıkıcı session'lar serbest kalır.

## Ne zaman marker'lamayı atla

- Pure conversational turn'ler (selamlaşma, netleştirme, status soruları)
- Bir dosyayı okuyup içeriği özetlemek (decision yok, discovery yok)
- Hiçbir şeyin sürpriz olmadığı routine edit'ler
- Aynı session'da yakın bir marker tarafından zaten yakalanmış learning (duplicate yapma)

## Adım-adım altta

### 1. SessionStart hook

Hook ([`atl setup-hooks`](/tr/cli/setup-hooks) kurar) wiring:

```
SessionStart → atl session-start --silent-if-clean
```

`atl session-start` üç boot-time task'ı sırayla çalıştırır:

1. **Auto-update**: cached her agentteamland repo'sunu pull et
2. **Previous-transcript marker scan**: işlenmemiş learning'leri yüzeye çıkaran adım
3. **`atl` self-version check**: GitHub Releases API, 24h'a throttle

### 2. Marker scan

`atl session-start` içindeki marker scan tam olarak:

```
atl learning-capture --previous-transcripts
```

Ne yapar:

- `~/.claude/state/learning-capture-state.json`'u per-project `lastProcessedAt` cutoff için okur (ilk run'da son 7 gün)
- O cutoff'tan sonra modify edilen transkriptleri enumerate eder
- Sadece **assistant** turn'leri tarafından emit edilen `<!-- learning -->` blokları için grep-tarar (v1.1.1 noise filter prose mention'ları, tool input/output'ları, summary event'leri ve kebab-case regex'i geçemeyen topic'leri reddeder)
- State file'ın `processedMarkers` set'ine karşı per-marker hash dedup (FIFO-cap 5000 entry) — bu `atl v1.1.3` + `core@1.10.0`'da düzeltilen long-session re-report bug'ını kapatır
- Compact bir rapor basar

### 3. Çıktı Claude'a ulaşır

`SessionStart` ve `UserPromptSubmit` stdout'u Claude'un `additionalContext`'ine ulaşan tek Claude Code hook'u ([Claude Code v2.1.x docs](https://docs.claude.com/en/docs/claude-code/hooks) gereği). Önceki v0.2.0 tasarımı `SessionEnd` + `PreCompact`'i marker scanning için kullanıyordu — ve ~7 hafta boyunca sessizce çıktı kaybetti çünkü o event'ler additionalContext'e deliver etmiyor.

Mevcut SessionStart-only tasarımı bu gap'i düzeltir. Tam migration story için [`atl setup-hooks` History note'una](/tr/cli/setup-hooks#history-from-four-hooks-to-two) bak.

### 4. `/save-learnings` işler

Agent (sen) additionalContext rapor'unu okur ve çağırır:

```
/save-learnings --from-markers --transcripts <path1>,<path2>,...
```

Skill:

1. Listelenen transkriptlerden her `<!-- learning -->` bloğunu çıkarır
2. `(kind + topic + body)` ile hash'ler ve aynı tarihte journal'da olanları atlar
3. Her learning'i `kind` + body şekli ile kategorize eder
4. Uygun şekilde journal + wiki + agent children + skill learnings yazar
5. (5 gated değişiklikten herhangi biri önerilirse) bir `AskUserQuestion`'a toplar
6. State file'a per-marker hash kaydetmek için `atl learning-capture --commit-from-transcripts` çağırır
7. Tek bir özet bloğu raporlar

### 5. State ilerler; loop kapanır

Adım 6'daki state-file write loop'u kapatandır. Bir sonraki `atl session-start` aynı state'i okur ve yeni bir şey olmadığında sıfır işlenmemiş marker görür. Sıkıcı session'lar serbest kalır.

`/save-learnings` yarı yolda fail olursa, state file güncellenmez — marker'lar bir sonraki session'da tekrar raporlanır ve işleme retry olur. Failure mode'lar veri kaybetmez.

## Hook kurulu olmadığında

Marker'lar processing hook olmadan zararsız — HTML comment'lar, render edilmiş çıktıda görünmez, text olarak inert. Capture alışkanlığı yine değerli (marker'lar transkriptin insan okuyucu'su için bile legible).

Otomatik processing için kullanıcı `atl setup-hooks` çalıştırır. Bu hook'lar olmadan, kullanıcı session sınırlarında `/save-learnings`'i manuel çağırmalı; marker'lar hâlâ transkriptlerde birikir ve processing ne zaman olursa olsun müsait kalır.

## Tarihçe

Bu kural üç şekilden geçti:

1. **Orijinal (pre-`atl` versiyonları):** "Claude her session sonunda proactively learning'leri save etmeli." Bazen çalıştı; Claude'un bir prose talimatını hatırlamasına bağlı. Güvenilmez.
2. **İlk `atl` versiyonu (v0.2.0 — `core@1.3.0`):** Inline marker'lar + `atl learning-capture` `SessionEnd` ve `PreCompact` hook'larında kayıtlı. **Sessizce broken** — o event'ler hook stdout'unu Claude'un additionalContext'ine deliver etmiyor. Maintainer workspace'inde 9 session boyunca 324 marker production'da olduğu ay süresince **sıfır** auto-processing üretti. O dönemde tüm gerçek `/save-learnings` işi manuel kullanıcı invocation tarafından tetiklendi, hook çıktısı tarafından değil.
3. **Mevcut (v1.1.0+ — `core@1.8.0`):** Hook yeni `atl session-start` wrapper üzerinden `SessionStart`'a taşındı, önceki session'ın transkriptlerini yeni `--previous-transcripts` modu ile tarayarak. Çıktı additionalContext'e ulaşır. State file per-project `lastProcessedAt` ve per-marker hash'leri takip eder (sonuncusu `atl v1.1.3` + `core@1.10.0`'da long-session re-report bug'ını düzeltmek için ship oldu). Loop deterministik kapanır.

## İlgili

- [`atl learning-capture`](/tr/cli/learning-capture) — CLI scanner
- [`atl setup-hooks`](/tr/cli/setup-hooks) — SessionStart hook'unu bağlar
- [`/save-learnings`](/tr/skills/save-learnings) — marker'ları işler
- [Knowledge system](/tr/guide/knowledge-system) — journal ve wiki nerede yaşar
- [Children + learnings](/tr/guide/children-and-learnings) — agent / skill domain knowledge nereye iner
- [Claude Code conventions](/tr/guide/claude-code-conventions) — boyunca kullanılan marker block konvansiyonları
- Kanonik rule: [`core/rules/learning-capture.md`](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md)
