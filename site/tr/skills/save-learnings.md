# `/save-learnings`

Bir konuşmadan (veya birden fazla transkriptin marker'lı bölgelerinden) öğrenilenleri journal, wiki, agent `children/` ve skill `learnings/` katmanlarına kalıcı hale getirir. Sonra state file'ı günceller, böylece bir sonraki oturum aynı marker'ları tekrar işlemez.

Bu skill, otomatik öğrenme döngüsünün **işleme yarısı**:

```
[atl session-start hook] → işlenmemiş marker'ları raporlar
        ↓
[Sonraki turda Claude] → /save-learnings --from-markers --transcripts ... çağırır
        ↓
[skill] → marker'lar journal / wiki / agent children / skill learnings'e iner
        ↓
[skill döngüyü kapatır] → atl learning-capture --commit-from-transcripts
```

Global skill olarak [core](https://github.com/agentteamland/core)'da gelir (`core@1.0.0` itibarıyla). `core@1.8.0`'da SessionStart-driven hook akışı + otomatik `children/` + `learnings/` büyütmeyi destekleyecek şekilde yeniden yazıldı.

## Üç çağırma modu

| Mod | Çağırma | Ne zaman |
|---|---|---|
| **Hook modu** (auto-trigger) | `/save-learnings --from-markers --transcripts a.jsonl,b.jsonl` | En yaygın yol. `atl session-start` marker'ları raporlar; Claude bir sonraki turda bunu çağırır. |
| **Tek-transkript modu** | `/save-learnings --from-markers` | Legacy: yalnızca mevcut session'ın kendi transkriptini tarar. Hook akışı geldiğinden beri nadiren gerekir. |
| **Manuel mod** | `/save-learnings [agent-adı]` | Kullanıcı doğrudan çağırır; marker gerekmez. Canlı konuşmayı analiz eder. |

## Ne yazar

Yazımların çoğu sessizce olur — kullanıcı her yazım için değil, sadece son özeti görür. `AskUserQuestion` ile geçen beş istisna (run başına TEK prompt'ta toplanır):

1. **Yeni skill oluşturma** (bir workflow pattern'i 2+ kez tekrarlandı)
2. **Yeni rule oluşturma** (net bir "her zaman X" / "asla Y" konvansiyonu kristalleşti)
3. **Yeni agent oluşturma** (bir alan açıkça ayrı bir agent)
4. **Mevcut agent kimlik değişikliği** (sorumluluk / ilkeler değişmesi gerekiyor)
5. **Mevcut skill core değişikliği** (skill'in adımları değişmesi gerekiyor)

Geri kalan her şey — journal, wiki, agent `children/`, skill `learnings/`, Knowledge Base + Accumulated Learnings auto-rebuild'leri — hiçbir prompt olmadan olur.

### Per-learning hedef matrisi

Her learning'in *şekli* nereye ineceğini belirler. Kategorizasyon marker'ın `kind` alanından otomatik (manuel modda konuşma incelenerek):

| Learning şekli | Hedef |
|---|---|
| Time-stamped narrative ("X denedik, sonra Y, sonunda Z çalıştı") | Sadece journal entry |
| Topic-shaped current truth ("auth'un doğru yolu …") | Wiki sayfası (varsa replace) + journal entry |
| Belirli bir agent için domain knowledge | Agent'ın `children/{topic}.md` + journal entry |
| Belirli bir skill için domain knowledge | Skill'in `learnings/{topic}.md` + journal entry |
| Tekrarlayan workflow (2+ instance) | **AskUserQuestion → yeni skill** |
| Kristalleşmiş konvansiyon ("asla X", "her zaman Y") | **AskUserQuestion → `/rule` üzerinden yeni rule** |
| Sahibi olmayan domain alanı | **AskUserQuestion → yeni agent** |
| Mevcut agent'ın kimliği genişledi | **AskUserQuestion → agent.md core update** |
| Mevcut skill'in core flow'u değişmesi gerekiyor | **AskUserQuestion → skill.md core update** |

## Neye dokunur

| Yüzey | Ne değişir | Format |
|---|---|---|
| `.claude/journal/{YYYY-MM-DD}_{agent}.md` | Agent + tarih başına bir entry. Varsa append, hash ile dedup. | Frontmatter (`date`, `agent`, `tags`) + `## Summary` + `## Learnings` + `## Auto-Created` + `## User-Approved Structural Changes` + `## Notes for Other Agents`. |
| `.claude/wiki/{topic}.md` | Current truth için replace-style update. Yeni topic ise template'ten yeni sayfa. | Standart wiki sayfa formatı (Last updated / Current state / Sources). |
| `CLAUDE.md` | `<!-- wiki:index -->` marker bloğunu mevcut wiki sayfa setinden yeniden inşa eder. | Filename'e göre sıralı; sayfa başına tek satır özet. |
| Agent `children/{topic}.md` | Zorunlu `knowledge-base-summary` frontmatter ile append-or-create. | Frontmatter + body. |
| Agent `agent.md` Knowledge Base bölümü | Her child dosyasının `knowledge-base-summary` frontmatter'ından otomatik yeniden inşa. Bu bölümdeki elle düzenlemeler üzerine yazılır. | Auto-rebuild bloğu ile aynı şekil — bkz. [agent-structure rule](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md). |
| Skill `learnings/{topic}.md` | Agent children/ pattern'inin aynası — aynı frontmatter sözleşmesi. | Frontmatter + body. |
| Skill `skill.md` Accumulated Learnings bölümü | Her learnings dosyasının frontmatter'ından otomatik yeniden inşa. | Agent KB ile aynı şekil. |

Her başarılı çalışma sonrası skill, marker hash'lerini `~/.claude/state/learning-capture-state.json`'a (FIFO-cap 5000) kaydetmek için `atl learning-capture --commit-from-transcripts` çağırır. Döngüyü kapatan budur — bir sonraki [`atl session-start`](/tr/cli/setup-hooks) yeni bir şey yokken sıfır marker raporlar.

## Hook-mode örneği

Yeni session açılır. `atl session-start`, SessionStart hook olarak çalışır, önceki session'ın transkriptlerinde 5 işlenmemiş marker görür ve (Claude'un `additionalContext`'ine) basar:

```
🧠 learning-capture: 5 unprocessed markers across 4 transcripts
  by kind: 1 convention, 1 decision, 2 discovery, 1 pattern

→ Run: /save-learnings --from-markers --transcripts <path1>,<path2>,<path3>,<path4>
```

Claude bunu okur, skill'i aynen çağırır, ve skill:

1. Transkriptlerden her `<!-- learning -->` bloğunu çıkarır
2. `(topic, body)` ile hash'ler ve aynı tarihte journal'da olanları atlar
3. Her learning'i `kind` + body şekli ile kategorize eder
4. Uygun şekilde journal + wiki + children + learnings yazar
5. (5 gated değişiklikten herhangi biri önerilirse) tek bir `AskUserQuestion`'a toplar
6. State file'ı ilerletmek için `atl learning-capture --commit-from-transcripts` çalıştırır
7. Tek bir özet bloğu raporlar

Sıkıcı session'lar (marker yok) sıfır token harcar — hook hiçbir şey basmaz, skill asla çağrılmaz.

## Manuel mod örneği

```
/save-learnings api-agent
```

İnline marker düşürülmemiş hands-on bir kodlama konuşmasının sonunda kullanılır. Skill canlı konuşmayı learning'ler için tarar (pattern'ler, konvansiyonlar, kararlar, keşifler) ve hook moduyla aynı hedef matrisini uygular. State file ilerletilmez — manuel mod marker-state-file sözleşmesine bağlı değil.

## Marker formatı

İnline marker'lar assistant turn'lerine gömülü HTML yorumlarıdır. Render edilmiş çıktıda görünmez, transkriptte korunur, ~40 token:

```html
<!-- learning
topic: auth-refresh
kind: decision
doc-impact: readme
body: 7 günlük JWT refresh seçildi çünkü uzun session istiyoruz; kullanıcı haftada en fazla bir kez login.
-->
```

Zorunlu alanlar:

- `topic` — kebab-case, tek kavram (wiki sayfa adı olur)
- `kind` — `bug-fix | decision | pattern | anti-pattern | discovery | convention` arası
- `doc-impact` — `none | readme | docs | both | breaking` arası (default `none`)
- `body` — 1–3 cümle. **Daima NEDEN'i içer.**

Tam marker spec için [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md) ve marker'ları yüzeye çıkaran scanner için [`atl learning-capture`](/tr/cli/learning-capture) sayfasına bakın.

## Önemli kurallar

1. **Non-structural yazımlar için onay yok.** Memory / journal / wiki / agent children / skill learnings hepsi sessizce olur.
2. **AskUserQuestion SADECE yeni yapı veya kimlik değişiklikleri için.** Yeni skill, yeni rule, yeni agent, agent kimliği, skill core.
3. **State file yazımı kapanış parantezi.** State file güncellenene kadar marker'lar işlenmemiş kalır ve bir sonraki SessionStart'ta tekrar raporlanır.
4. **Hassas bilgi filtresi.** Şifreler, token'lar, API key'ler journal / wiki / team repo'lara ASLA yazılmaz. Şüpheli credential'lar redakte edilir.
5. **Her yerde idempotent.** Aynı marker'lar üzerinde tekrar çalıştırma incremental değişiklik üretmez (hash ile dedup, replace-with-same no-op, KB rebuild deterministik).
6. **Team repo push maintainer'lar için otomatik, kullanıcılar için graceful fail.** Push permission olmayan kullanıcılar değişiklikleri lokal tutar; upstream-contribution akışı eninde sonunda PR olarak paketler.
7. **Approval-gate batching.** Birden fazla structural change tek bir `AskUserQuestion`'da multi-select ile, N ayrı prompt değil.
8. **Skill creation eşiği = 2 instance.** Tek bir workflow oluşumunda otomatik yeni skill önerme.
9. **Rule creation kriteri = net "her zaman X" / "asla Y" ifadesi.** Belirsiz ifade ("muhtemelen X yapmalıyız") wiki'ye gider, rule'a değil.

## İlgili

- [`atl learning-capture`](/tr/cli/learning-capture) — marker'ları yüzeye çıkaran ve state'e hash commit eden CLI scanner
- [`atl setup-hooks`](/tr/cli/setup-hooks) — bu skill'i tetikleyen SessionStart hook'unu bağlar
- [Kavramlar: Skill](/tr/guide/concepts#skill) — bu skill'in koruduğu `learnings/` pattern'i
- [`/wiki`](/tr/skills/wiki) — eşlik eden bilgi tabanı skill'i (bu skill wiki sayfaları yazar; `/wiki` onları sorgular / lint eder)

## Kaynak

- Spec: [core/skills/save-learnings/skill.md](https://github.com/agentteamland/core/blob/main/skills/save-learnings/skill.md)
- Rule: [core/rules/learning-capture.md](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md)
- Rule: [core/rules/agent-structure.md](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md)
