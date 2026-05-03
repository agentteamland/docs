# `atl learning-capture`

Önceki sohbetlerde Claude'un bıraktığı inline `<!-- learning ... -->` marker'larını Claude Code transkriptlerinde tarar ve bir sonraki session'ın ilk turunda işlenebilecek kısa bir rapor yazdırır.

[`atl setup-hooks`](/tr/cli/setup-hooks) tarafından kurulan `SessionStart` hook'u tarafından sürülür — `atl session-start` composite komutunun içine sarılmıştır. Test veya ad-hoc tarama için manuel de çağrılabilir.

`atl` ≥ 1.1.0 gerekir.

## Bu neden var

Otomatik bir capture adımı olmadan iki tür bilgi her zaman kaçar:

1. **Öğrenmeler kaydedilmez.** Kullanıcılar `/save-learnings` çalıştırmayı unutur, agent da her zaman kendi önermez. Kararlar, bug fix'ler, keşifler konuşma ile birlikte kaybolur.
2. **Dokümanlar bayatlar.** Bir özellik shiplendiğinde veya bir davranış değiştiğinde, README / doc site günler haftalarca geri kalır — veya sonsuza kadar.

`atl learning-capture` + iki eşli core rule ([learning-capture](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) + [docs-sync](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md)) bu boşlukları kapatır:

- Claude, sohbette gerçek bir öğrenme anı olduğunda inline `<!-- learning -->` marker'ı bırakır. Marker'lar ~50 token, HTML-commented (render edilmiş çıktıda görünmez), ve bir session'da ilginç bir şey yoksa ücretsiz görmezden gelinir.
- *Bir sonraki* session'ın başlangıcında harness `atl session-start` çalıştırır; o da `atl learning-capture --previous-transcripts`'i çağırır. Son başarılı `/save-learnings` koşusundan beri modifiye edilmiş her proje transkriptini tarar, marker'ları bulur ve stdout'a kısa bir rapor basar — `SessionStart` bu çıktıyı doğru şekilde Claude'un `additionalContext`'ine teslim eder.
- Claude'un ilk turu `/save-learnings --from-markers --transcripts <paths>` çağırır; bu marker'ları journal + wiki + agent children + skill learnings'e işler — VE `doc-impact` set olan her marker için README / doc-site draft değişiklikleri hazırlar.

Hiçbir şey otomatik olarak public repo'lara push'lanmaz. Draft'ları sen veya Claude review eder.

## Modlar

| Mod | Çağrım | Ne zaman |
|---|---|---|
| **Previous-transcripts** (önerilen) | `atl learning-capture --previous-transcripts` | `SessionStart` hook tetiklendiğinde `atl session-start` tarafından kullanılır. Multi-transcript tarama, state-file-driven cutoff. |
| **Single-transcript** (legacy) | `atl learning-capture --transcript-path <path>` | Belirli bir transkript dosyasının manuel taraması. |
| **Stdin payload** (legacy) | `atl learning-capture < hook-stdin.json` | `transcript_path`'i Claude Code hook'unun stdin JSON payload'undan okur. v0.2.0 SessionEnd / PreCompact kayıtları ile uyumluluk için tutuluyor (bu event'ler hiç stdout'u Claude'a teslim etmedi — bkz. [setup-hooks history](/tr/cli/setup-hooks#tarihce-dort-hook-tan-iki-hook-a) — ama binary çağrıyı hâlâ kabul ediyor). |

## Previous-transcripts modu

`atl session-start`'ın çağırdığı budur. State `~/.claude/state/learning-capture-state.json`'da tutulur:

```json
{
  "projects": {
    "-Users-you-projects-my-app": {
      "lastProcessedAt": "2026-05-02T14:00:31Z"
    }
  }
}
```

Slug; cwd path'inin `/` karakterlerinin `-` ile değiştirilmiş halidir. Her koşuda komut:

1. State file'dan slug'ın `lastProcessedAt`'ini okur (ilk kullanımda "7 gün önce"e default olur).
2. `~/.claude/projects/{slug}/*.jsonl` altında o cutoff'tan sonra modifiye edilmiş her transkript dosyasını listeler.
3. Her birini `<!-- learning -->` blokları için tarar (v1.1.1 noise filter ile — aşağı bak).
4. Marker bulunduğunda stdout'a tek bir konsolide rapor basar; bulunamadığında sessizdir.

State file başarılı bir `/save-learnings` koşusundan sonra yazılır. CLI doğrudan asla yazmaz — bu, çakılmış bir tarama'nın partial-write corruption'ından kaçınır.

## Marker formatı

Marker'lar loose YAML alanları içeren inline HTML yorumlarıdır:

```
<!-- learning
topic: auth-refresh
kind: decision
doc-impact: readme
body: 7-day JWT refresh chosen because we want long sessions; user logs in once a week max.
-->
```

| Alan | Zorunlu | İzin verilen değerler | Amacı |
|---|---|---|---|
| `topic` | evet | kebab-case (küçük harf / rakam, ayraç olarak hyphen veya nokta) | Wiki / children / learnings sayfa adı olur |
| `kind` | evet | `bug-fix`, `decision`, `pattern`, `anti-pattern`, `discovery`, `convention` | Öğrenmeyi kategorize eder |
| `doc-impact` | hayır | `none`, `readme`, `docs`, `both`, `breaking` | `none` olmadığında doc-sync draft'larını tetikler |
| `body` | evet | bir veya daha fazla cümle | Asıl öğrenme içeriği — HER ZAMAN SEBEBİ (WHY) koy |

HTML yorumları render edilmiş markdown çıktısında görünmez, bu yüzden marker'lar sohbet UI'sını kirletmez; sadece scanner'ın gördüğü transkriptte yaşar.

## v1.1.1 noise filter

Önceki scanner versiyonları transkriptin herhangi bir yerindeki çıplak `<!-- learning` substring'ini eşleştiriyordu. Marker formatını *tartışan* session'lar — rule yeniden yazımları, skill yeniden yazımları, learning capture hakkındaki brainstorm'lar — bir sonraki session'ın sayısını 10-25× şişiriyordu çünkü tool-output text'leri okudukları her marker fragment'ını tekrarlıyordu. v1.1.1 filter şunları reddeder:

- Non-assistant turn'leri (tool-use input, tool-result output, kullanıcı mesajları, summary event'leri). Yalnızca `message.role == "assistant"` text content taranır.
- Kebab-case topic'i olmayan marker'lar. Regex `^[a-z0-9]+([-.][a-z0-9]+)*$` — uppercase, boşluk, ellipsis placeholder'larını (`topic: ... doc-impact ...`) ve literal field-spec string'i `bug-fix | decision | pattern | ...`'i reddeder.

Validation sweep'i: 5 workspace transkripti boyunca 149 raw substring hit → filtre sonrası 16 gerçek marker. Kalan 133'ü format dokümantasyonu, prose mention'ları ve tool quoting idi.

## Çıktı

### Boş (modifiye edilmiş transkript yok veya marker bulunamadı)

```
(--silent-if-empty geçildiğinde sessiz — SessionStart hook yolu bunu kullanır)
```

`--silent-if-empty` olmadan:

```
📝 learning-capture: scanned 3 transcripts, no markers found
```

### Marker bulundu

```
🧠 learning-capture: 7 unprocessed markers across 2 transcripts
  by kind: 3 decision, 2 pattern, 1 discovery, 1 bug-fix
  3 markers require doc drafts (README / doc site) — see docs-sync rule

→ Run: /save-learnings --from-markers --transcripts <path1>,<path2>
```

`SessionStart` bunu stdout üzerinden Claude'un `additionalContext`'ine enjekte eder. `learning-capture` core rule'u, Claude'a ilk turda belirtilen `/save-learnings` komutunu çağırmasını söyler; bu komut da marker'ları şunlara işler:

- **journal/{date}\_{agent}.md** entry'leri (kronolojik per-agent kayıt)
- **wiki/{topic}.md** güncellemeleri (current truth, replace-style)
- **agents/{agent}/children/{topic}.md** otomatik büyüyen içerik (`knowledge-base-summary` frontmatter ile; agent.md Knowledge Base section'ı otomatik rebuild edilir)
- **skills/{skill}/learnings/{topic}.md** otomatik büyüyen içerik (skill.md Accumulated Learnings section'ı otomatik rebuild edilir)
- `doc-impact` marker'ları için **doc draft'ları** (review için sunulur, otomatik push'lanmaz)

Başarılı işleme sonrası `/save-learnings` state file'ın `lastProcessedAt`'ini ilerletir, böylece aynı marker'lar bir sonraki `SessionStart`'ta tekrar raporlanmaz.

## Bayraklar

| Bayrak | Default | Amacı |
|---|---|---|
| `--previous-transcripts` | (off) | State file tarafından sürülen multi-transcript tarama (`atl session-start` tarafından kullanılır) |
| `--silent-if-empty` | `false` | Marker bulunmadığında hiç çıktı verme (hook'lar için) |
| `--transcript-path <path>` | (stdin JSON'dan) | Açık single-file tarama; hem state file'ı hem de stdin payload'unu bypass eder |
| `--help` | — | Komut yardımı |

## Maliyet modeli

| Senaryo | Claude'a token maliyeti | Zaman maliyeti |
|---|---|---|
| `--previous-transcripts` ve modifiye edilmiş transkript yok | 0 | <1ms (tek stat çağrısı) |
| `--previous-transcripts` ve N transkript, marker yok | 0 (silent-if-empty) | transkript MB başına ~10ms |
| `--previous-transcripts` ve N marker | rapor için ~80 token | transkript MB başına ~10ms |
| `/save-learnings --from-markers` (processing) | marker sayısına orantılı, transkript boyutuna değil | saniyeler |

Tasarım bilinçli olarak boş session'ları ücretsiz kılıyor. Sadece gerçek öğrenmelerin maliyeti var ve maliyet gerçekten öğrenilenle orantılı — asla konuşma uzunluğuyla değil.

## Manuel test

```bash
# Bir assistant marker'lı synthetic transkript oluştur (role+content shape'ine dikkat)
cat > /tmp/test.jsonl <<'EOF'
{"message":{"role":"assistant","content":[{"type":"text","text":"<!-- learning\ntopic: my-topic\nkind: decision\ndoc-impact: none\nbody: test.\n-->"}]}}
EOF

# Tara
atl learning-capture --transcript-path /tmp/test.jsonl
```

Beklenen çıktı:

```
🧠 learning-capture: 1 unprocessed marker across 1 transcript
  by kind: 1 decision

→ Run: /save-learnings --from-markers --transcripts /tmp/test.jsonl
```

## Tarihçe

`atl v0.2.0` (2026-04-24) marker protokolünü `SessionEnd` ve `PreCompact` hook'ları ile tanıttı. Claude Code v2.1.x'e göre, o hook'lar stdout'u Claude'un `additionalContext`'ine teslim ETMEZ. v0.2.0 sonrası bir ay boyunca 9 maintainer-workspace session'ında 324 marker'ın **sıfırı** otomatik işlendi — her gerçek `/save-learnings` koşusu manuel çağrımdan geldi. Capture binary çalışıyordu; trigger yolu yanlıştı.

`atl v1.1.0` (2026-05-02) `--previous-transcripts` modunu, `~/.claude/state/learning-capture-state.json` state file'ını ve bu komutu `SessionStart` hook'undan çağıran `atl session-start` composite wrapper'ı tanıttı (stdout'u Claude'a güvenilir şekilde teslim eden *tek* hook event'i). Marker protokolü değişmedi.

`atl v1.1.1` (2026-05-02) noise filter'ı ekledi (assistant-role + kebab-case topic).

## İlgili

- [`atl setup-hooks`](/tr/cli/setup-hooks) — bu komutu `atl session-start` üzerinden süren `SessionStart` hook'unu kurar
- [`atl update`](/tr/cli/update) — `atl session-start` tarafından çağrılan diğer parça
- [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) — Claude'un ne zaman marker bırakacağına dair davranış spesifikasyonu
- [docs-sync rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md) — proaktif doc güncellemeleri için eşli kural (`doc-impact` alanını kullanır)
- [`/save-learnings` skill](https://github.com/agentteamland/core/blob/main/skills/save-learnings/skill.md) — sistemin processing yarısı
