# `atl learning-capture`

Mevcut Claude Code session transcript'inde sohbet sırasında Claude'un bıraktığı inline `<!-- learning ... -->` marker'larını tarar ve bir sonraki turda (veya session'da) işlenebilecek kısa bir rapor yazdırır.

[`atl setup-hooks`](/tr/cli/setup-hooks) tarafından kurulan Claude Code hook'ları (SessionEnd, PreCompact) tarafından sürülür. Test veya ad-hoc scan için manuel de çağrılabilir.

`atl` ≥ 0.2.0 gerekir.

## Bu neden var

Otomatik bir capture adımı olmadan iki tür bilgi her zaman kaçar:

1. **Öğrenmeler kaydedilmez.** Kullanıcılar `/save-learnings` çalıştırmayı unutur, agent da her zaman kendi önermez. Kararlar, bug fix'ler, keşifler konuşma ile birlikte kaybolur.
2. **Dokümanlar bayatlar.** Bir özellik shiplendiğinde veya bir davranış değiştiğinde, README / doc site günler haftalarca geri kalır — veya sonsuza kadar.

`atl learning-capture` + iki eşli core rule ([learning-capture](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) + [docs-sync](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md)) bu boşlukları kapatır:

- Claude, sohbette gerçek bir öğrenme anı olduğunda inline `<!-- learning -->` marker'ı bırakır. Marker'lar ~50 token, HTML-commented (render edilmiş çıktıda görünmez), ve bir session'da ilginç bir şey yoksa ücretsiz görmezden gelinir.
- Session sonu ve context compaction öncesi, harness `atl learning-capture` çalıştırır. Transcript'i tarar, marker'ları bulur ve Claude'un context'ine kısa bir rapor enjekte eder.
- Bir sonraki turda (veya session'da) `/save-learnings --from-markers` marker'ları wiki + memory + journal'a işler — VE `doc-impact` işaretli her marker için README / doc-site draft değişikliği hazırlar.

Hiçbir şey otomatik olarak public repo'lara push'lanmaz. Draft'ları sen veya Claude review eder.

## Kullanım

```bash
# Otomatik (hook'larla — önerilen)
atl setup-hooks                                  # 4-hook kurulumu yapar
# Buradan sonra, learning-capture SessionEnd + PreCompact'ta sessizce çalışır.

# Manuel (test veya tek seferlik scan için)
atl learning-capture --transcript-path /yol/to/transcript.jsonl
atl learning-capture --silent-if-empty --transcript-path X
```

Hook üzerinden çağrıldığında, Claude Code stdin'e JSON payload verir:

```json
{"session_id": "...", "transcript_path": "/yol/to/transcript.jsonl", "cwd": "..."}
```

Komut `transcript_path`'i bu payload'dan okur — hook modunda `--transcript-path` gerekmez.

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
| `topic` | evet | kebab-case string | Wiki sayfasının adı olur (`wiki/auth-refresh.md`) |
| `kind` | evet | `bug-fix`, `decision`, `pattern`, `anti-pattern`, `discovery`, `convention` | Öğrenmenin kategorisi |
| `doc-impact` | hayır | `none`, `readme`, `docs`, `both`, `breaking` | `none` olmadığında docs-sync draft'ları tetikler |
| `body` | evet | bir veya daha fazla cümle | Öğrenmenin kendi içeriği — HER ZAMAN SEBEBİ (WHY) koy |

HTML yorumları render edilmiş markdown çıktısında görünmez, bu yüzden marker'lar sohbet UI'sını kirletmez; sadece scanner'ın gördüğü transcript'te yaşar.

## Çıktı

### Boş session (yaygın durum)

```
(--silent-if-empty verildiğinde sessiz çıkar; sıfır token tüketilir)
```

`--silent-if-empty` olmadan:

```
📝 learning-capture: no markers found in this session (0 cost)
```

### Marker'lı session

```
📝 learning-capture: 3 markers detected
  1. [decision] auth-refresh (doc-impact: readme)
  2. [bug-fix] redis-connection (doc-impact: none)
  3. [discovery] setup-hooks-sessionend (doc-impact: docs)

→ Run /save-learnings --from-markers to process these into wiki + memory.
  2 markers require doc drafts (README / doc site) — see docs-sync rule.
```

Claude Code bu raporu context'e enjekte eder. Bir sonraki turda (veya session'da) `learning-capture` core rule, Claude'a `/save-learnings --from-markers` çalıştırmasını söyler. Bu da marker'ları okuyup şunları yapar:

- Wiki sayfası güncellemeleri (replace/update — current truth)
- Agent-memory append (tarih başlıklı tarihsel kayıt)
- Journal entry (cross-agent sinyal)
- `doc-impact` marker'ları için doc draft'ları (review için sunulur, otomatik push'lanmaz)

## Flag'ler

| Flag | Default | Amacı |
|---|---|---|
| `--silent-if-empty` | `false` | Marker bulunmadığında hiç çıktı verme (hook'lar için) |
| `--transcript-path <path>` | (stdin JSON'dan) | Stdin'i bypass ederek açık transcript path'i |
| `--help` | — | Komut yardımı |

## Maliyet modeli

| Senaryo | Claude'a token maliyeti | Zaman maliyeti |
|---|---|---|
| Boş session, `--silent-if-empty` | 0 | ~5ms (file read + regex scan) |
| Boş session, verbose | ~15 token (tek status satırı) | ~5ms |
| N marker'lı session | ~50 × N token transcript'te zaten var + ~100 token rapor | MB transcript başına ~5ms |
| `/save-learnings --from-markers` (processing) | marker sayısına orantılı, transcript boyutuna değil | saniyeler |

Tasarım bilinçli olarak boş session'ları ücretsiz kılıyor. Sadece gerçek öğrenmelerin maliyeti var ve maliyet gerçekten öğrenilenle orantılı — asla konuşma uzunluğuyla değil.

## Manuel test

```bash
# Bir marker'lı synthetic transcript oluştur
cat > /tmp/test.jsonl <<'EOF'
{"role":"assistant","content":"<!-- learning\ntopic: my-topic\nkind: decision\ndoc-impact: none\nbody: test.\n-->"}
EOF

# Tara
atl learning-capture --transcript-path /tmp/test.jsonl
```

Beklenen çıktı:

```
📝 learning-capture: 1 marker detected
  1. [decision] my-topic (doc-impact: none)

→ Run /save-learnings --from-markers to process these into wiki + memory.
```

## İlgili

- [`atl setup-hooks`](/tr/cli/setup-hooks) — bu komutu süren SessionEnd + PreCompact hook'larını kurar
- [`atl update`](/tr/cli/update) — hook sisteminin diğer yarısı (auto-update)
- [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) — Claude'un ne zaman marker bırakacağına dair davranış spesifikasyonu
- [docs-sync rule](https://github.com/agentteamland/core/blob/main/rules/docs-sync.md) — proaktif doc güncellemeleri için eşli kural (`doc-impact` alanını kullanır)
- [`/save-learnings` skill](https://github.com/agentteamland/core/blob/main/skills/save-learnings/skill.md) — sistemin processing yarısı
