# Sözlük

**Agent** — Claude Code için uzmanlaşmış rol tanımlayan Markdown dosyası. Takımın parçası olarak yayımlanır. Takım reposunda `agents/` altında yaşar; projede `.claude/agents/` altına kopya olur.

**atl** — CLI (`atl install`, `atl list`, …). Takımları projeye kurar. Go binary'si.

**Önbellek (cache)** — `atl`'nin klonlanmış takım repolarını tuttuğu paylaşımlı disk dizini. Makine başına bir tane: `~/.claude/repos/agentteamland/`. Projeler buraya kopya yapar.

**Children pattern** — karmaşık agent'lar için konvansiyon: üst seviye `agent.md` kısa kalır (kimlik, sorumluluk, ilkeler, Knowledge Base); detaylı bilgi `children/` altında konu-başına-dosya olarak yaşar. Her child dosyası, `/save-learnings`'in parent agent.md'nin Knowledge Base section'ını otomatik rebuild etmek için kullandığı `knowledge-base-summary` frontmatter alanını taşır. Skill'lerde `learnings/` olarak mirror'lanır (skill.md'nin Accumulated Learnings section'ını otomatik rebuild eder).

**Circular chain** — bir takımın `extends` zincirinin kendine dönmesi (`A → B → A`). Kurulumda yakalanır; CLI tam zinciri yazarak fail eder.

**Dependencies (bağımlılıklar)** — bir takımın ihtiyaç duyduğu ek takımlar; `team.json`'daki `dependencies` alanıyla belirtilir. Takımla birlikte çözümlenip kurulur.

**`excludes`** — `team.json`'da, child'ın kopya'e dönüşmesini istemediği parent-sağlanan agent/skill/rule adlarının listesi. Parent kurulduktan sonra etki eder.

**`extends`** — tek-parent inheritance. `extends: "parent@^1.0.0"` olan bir takım; önce parent'ı kurar, kendi içeriğini üstüne koyar.

**Override** — child takım, parent'taki bir öğeyle aynı ada sahip bir öğe getirirse child'ınki kazanır. Tam replace, merging yok.

**Proje** — `atl`'yi çalıştırdığın dizin. Kurulu takımlara ait kopyalarle dolu bir `.claude/` alt dizini alır.

**Registry** — takımların herkese açık kataloğu. [`agentteamland/registry`](https://github.com/agentteamland/registry)'deki tek `teams.json`. PR-tabanlı, schema ile doğrulanır.

**Rule** — Claude Code tarafından her zaman yüklenen Markdown dosyası (çağrılmayı bekleyen skill'den farklı). Takımın `rules/` dizinindedir; `.claude/rules/` altına kopya olur.

**Scaffolder** — takımın stack'inde yeni proje başlatan, `/create-new-project` adlı takım-özel skill. [Scaffolder spec](/tr/authoring/scaffolder-spec)'e uymalı.

**SemVer constraint** — `extends` ve `dependencies`'te kullanılan version aralık sözdizimi. `^1.0.0` (caret), `~1.2.0` (tilde), `1.2.3` (tam), `>=1.2.0` (açık uçlu).

**Skill** — kullanıcı çağırmalı slash komut (örn. `/verify-system`). Kök dizininde `skill.md` olan bir dizin. Global skill'ler `~/.claude/skills/` altında yaşar; takım-özel skill'ler takımla gelir ve kurulumdan sonra `.claude/skills/` altında görünür.

**Status (durum)** — bir takımın registry'deki durumu: `verified`, `community` veya `deprecated`.

**Takım (team)** — kök dizininde `team.json` bulunan bir Git reposu; belirli bir tür iş için agent, skill ve rule'ları bir arada paketler.

**team.json** — her takım reposunun kökündeki manifest dosyası. Adı, versiyonu, açıklamayı, içerikleri, extend edileni ve dışlananları bildirir.

**Workspace** — `agentteamland/workspace`, tüm peer repo'ların geliştirme için bir araya getirildiği bakımcı hub'ı. AgentTeamLand'i kullanmak için gerekli değil; yalnızca platforma katkı veriyorsan ilgilendirir.

**Journal** — `.claude/journal/{date}_{agent}.md` altında kronolojik per-agent learning kaydı. Retire edilen `agent-memory/` katmanını değiştirir. `/save-learnings` tarafından yazılır; agent startup sırasında [knowledge-system rule](https://github.com/agentteamland/core/blob/main/rules/knowledge-system.md)'a göre Claude tarafından okunur.

**knowledge-base-summary** — her `children/{topic}.md` (ve `learnings/{topic}.md`) dosyasında zorunlu YAML frontmatter alanı. `/save-learnings`'in parent agent.md'nin Knowledge Base (veya skill.md'nin Accumulated Learnings) section'ını rebuild ederken extract ettiği bir-üç satırlık özet. Source-of-truth — rebuild edilmiş section'a yapılan elle düzenlemeler bir sonraki save-learnings çalıştırmasında overwrite edilir.

**knowledge-system** — iki katmanlı bilgi modelini (`journal/` + `wiki/`) tanımlayan core rule. agent-memory katmanı journal'a merge edildikten sonra `core@1.8.0`'da `memory-system`'den rename'lendi.

**learnings/** — agent'ların `children/`'ını mirror'layan per-skill subdir. Her `learnings/{topic}.md`, `knowledge-base-summary` frontmatter taşır; skill'in `## Accumulated Learnings` section'ı bunlardan auto-rebuild edilir.

**Learning marker** — bir learning moment olduğunda Claude'un sohbet sırasında bıraktığı inline HTML comment. Format: `<!-- learning topic: ... kind: ... doc-impact: ... body: ... -->`. Bir sonraki session'ın `SessionStart`'ında `atl learning-capture` tarafından taranır ve `/save-learnings --from-markers` tarafından işlenir.

**Wiki** — `.claude/wiki/{topic}.md` altındaki konu-organize current-truth bilgi. Truth değiştiğinde değiştirilir (append edilmez); CLAUDE.md'deki `<!-- wiki:index -->` marker block her session start'ında live index'i Claude'a görünür kılar.
