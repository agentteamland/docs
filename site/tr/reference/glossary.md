# Sözlük

**Agent** — Claude Code için uzmanlaşmış rol tanımlayan Markdown dosyası. Takımın parçası olarak yayımlanır. Takım reposunda `agents/` altında yaşar; projede `.claude/agents/` altına sembolik link olur.

**atl** — CLI (`atl install`, `atl list`, …). Takımları projeye kurar. Go binary'si.

**Önbellek (cache)** — `atl`'nin klonlanmış takım repolarını tuttuğu paylaşımlı disk dizini. Makine başına bir tane: `~/.claude/repos/agentteamland/`. Projeler buraya sembolik link yapar.

**Children pattern** — karmaşık agent'lar için konvansiyon: üst seviye `agent.md` kısa kalır (kimlik, sorumluluk, ilkeler); detaylı bilgi `children/` altında konu-başına-dosya olarak yaşar.

**Circular chain** — bir takımın `extends` zincirinin kendine dönmesi (`A → B → A`). Kurulumda yakalanır; CLI tam zinciri yazarak fail eder.

**Dependencies (bağımlılıklar)** — bir takımın ihtiyaç duyduğu ek takımlar; `team.json`'daki `dependencies` alanıyla belirtilir. Takımla birlikte çözümlenip kurulur.

**`excludes`** — `team.json`'da, child'ın sembolik link'e dönüşmesini istemediği parent-sağlanan agent/skill/rule adlarının listesi. Parent kurulduktan sonra etki eder.

**`extends`** — tek-parent inheritance. `extends: "parent@^1.0.0"` olan bir takım; önce parent'ı kurar, kendi içeriğini üstüne koyar.

**Override** — child takım, parent'taki bir öğeyle aynı ada sahip bir öğe getirirse child'ınki kazanır. Tam replace, merging yok.

**Proje** — `atl`'yi çalıştırdığın dizin. Kurulu takımlara ait sembolik linklerle dolu bir `.claude/` alt dizini alır.

**Registry** — takımların herkese açık kataloğu. [`agentteamland/registry`](https://github.com/agentteamland/registry)'deki tek `teams.json`. PR-tabanlı, schema ile doğrulanır.

**Rule** — Claude Code tarafından her zaman yüklenen Markdown dosyası (çağrılmayı bekleyen skill'den farklı). Takımın `rules/` dizinindedir; `.claude/rules/` altına sembolik link olur.

**Scaffolder** — takımın stack'inde yeni proje başlatan, `/create-new-project` adlı takım-özel skill. [Scaffolder spec](/tr/authoring/scaffolder-spec)'e uymalı.

**SemVer constraint** — `extends` ve `dependencies`'te kullanılan version aralık sözdizimi. `^1.0.0` (caret), `~1.2.0` (tilde), `1.2.3` (tam), `>=1.2.0` (açık uçlu).

**Skill** — kullanıcı çağırmalı slash komut (örn. `/verify-system`). Kök dizininde `skill.md` olan bir dizin. Global skill'ler `~/.claude/skills/` altında yaşar; takım-özel skill'ler takımla gelir ve kurulumdan sonra `.claude/skills/` altında görünür.

**Status (durum)** — bir takımın registry'deki durumu: `verified`, `community` veya `deprecated`.

**Takım (team)** — kök dizininde `team.json` bulunan bir Git reposu; belirli bir tür iş için agent, skill ve rule'ları bir arada paketler.

**team.json** — her takım reposunun kökündeki manifest dosyası. Adı, versiyonu, açıklamayı, içerikleri, extend edileni ve dışlananları bildirir.

**Workspace** — `agentteamland/workspace`, tüm peer repo'ların geliştirme için bir araya getirildiği bakımcı hub'ı. AgentTeamLand'i kullanmak için gerekli değil; yalnızca platforma katkı veriyorsan ilgilendirir.
