# Team-repo maintenance

**Shared `agentteamland/` public repo'larında** değişiklikler için governance — team repo'lar (cli, core, brainstorm, rule, team-manager, software-project-team, design-system-team, registry, docs, starter-extended, create-project, workspace, .github). Kural, 2026-04-24'te tüm public repo'lara branch protection eklenmeden önce var olan disiplin gap'ini kapsar.

Branch protection **safety net** — org'daki her public repo'da `main`'e doğrudan commit'i reddeder. Bu kural **method**: safety net'i tatmin eden VE git log'u okuyan sonraki maintainer'a faydalı olan temiz bir değişiklik nasıl üretilir.

Kanonik kural [`core/rules/team-repo-maintenance.md`](https://github.com/agentteamland/core/blob/main/rules/team-repo-maintenance.md)'de yaşar. Bu sayfa kullanıcıya yönelik özet.

## Ne zaman uygulanır

Sen (veya senin adına Claude) `~/.claude/repos/agentteamland/{team}/` altındaki cached agentteamland repo'sundaki bir dosyayı değiştirdiğinde. Hem team repo'ları (software-project-team, design-system-team, vb.) hem global repo'ları (core, brainstorm, rule, team-manager, cli, docs, registry, workspace) içerir.

**Şuna uygulanmaz:**

- Kendi lokal projenin `.claude/` dizini (proje memory'si, shared değil)
- `homebrew-tap` / `scoop-bucket` / `winget-pkgs` (goreleaser-managed; release pipeline için doğrudan push'a izin var)

## Beş sabit adım

Her shared-repo değişikliği aynı beş adımı izler. Sıralı — her biri öncekinin üzerine inşa edilir.

### 0. PR açmadan önce `/save-learnings` çalıştır

1–4 adımlarından önce, **feature branch'in son commit'i olarak** [`/save-learnings`](/tr/skills/save-learnings) çalıştır. Bu, ship olmak üzere olan iş'ten wisdom'ı yakalar ve aynı PR'da yolculuk yapmasına izin verir.

Bu timing'in nedeni:

- PR boundary doğal bir kristalleşme anı — kararlar somut
- `save-learnings`'in **mevcut PR'ın repo'suna** dokunan çıktıları (agent.md güncellemeleri, README doc-impact taslakları, yeni children dosyaları, known-issues entry'leri) feature branch'te otomatik commit olur ve PR'da ship olur
- Review hem işi HEM de çıkarılan wisdom'ı tek atomik birimde kapsar

Multi-repo caveat'i: `/save-learnings` genellikle repo'lar arası yayılan çıktılar üretir. Sadece **mevcut PR'ın repo'suna** dokunan çıktılar yolculuk yapar; diğer-repo çıktıları yine kendi PR akışlarına ihtiyaç duyar.

Bu kural inline `<!-- learning -->` marker + `SessionStart` hook ile eşlidir (bkz. [learning-capture rule](https://github.com/agentteamland/core/blob/main/rules/learning-capture.md)). PR-zamanı `/save-learnings` ship olmak üzere olan işten kristalleşmiş learning'leri yakalar; *sonraki* session'da SessionStart hook zaten ship olmuş işten marker'ları yakalar (review feedback, conflict-resolution insight'ları, post-merge keşifler). Tamamlayıcı, redundant değil — ikisini de tut.

### 1. Versiyonu bump et (takımlar için `team.json`; CLI için `internal/config.Version`)

Strict SemVer'i izle:

| Bump | Ne zaman | Örnek |
|---|---|---|
| **Patch** (0.4.1 → 0.4.2) | Bug fix, API değişikliği yok, davranış advertised'a restore | `fix(dst-new-ds): Q3 cap` |
| **Minor** (0.4.2 → 0.5.0) | Yeni skill / agent / rule / komut, backward-compatible | `feat(core): new rule learning-capture` |
| **Major** (0.4.2 → 1.0.0) | Breaking: kaldırılan/yeniden adlandırılan komut, incompatible config, kullanıcıların bağımlı olduğu davranış değişikliği | `feat(cli)!: rename atl install-team → atl install` |

CLI için versiyon `internal/config/config.go`'da yaşar (build sırasında goreleaser tag ile ldflags override). Takımlar için versiyon `team.json`'da.

**Asla** versiyon bump'sız bir davranış değişikliği ship etme — `atl update`'in `X → Y` notification'ını sessizce bozar, tüm update pipeline'ını boşa çıkarır.

#### Bump etmemen gereken durum

Gerçekten docs-only PR'lar (çeviri, typo fix, README güncelleme, comment değişiklikleri) davranış delta'sı taşımaz ve `atl update`'in `X → Y` notification'ında yüzeye çıkmasına gerek yok. `main` `team.json`'da pre-existing schema violation'ları taşıyorsa (en sık 200-char description tavanı), bump aynı-PR trim'i zorlar ve scope'u şişirir. Pragmatik hareket:

1. **Bump'ı atla** docs-only PR'da.
2. **Atlamayı PR body'sinde explicit not et** — örn. "Version bump: skipped — `main` carries pre-existing description-length violations; will be addressed in a follow-up `chore: trim ...` PR."
3. **Adanmış bir** `chore: trim team.json descriptions` PR aç bump ile.

"Her değişiklik için versiyon bump" kuralı, kullanıcıların anlamlı davranış delta'larını görmesini sağlamak içindir — kozmetik edit'lerde törensel cadence için değil.

#### `team.json` format konvansiyonları

`team.json`'ı düzenlerken:

1. **Pretty-print, multi-line object'ler** 2-space indent ile. Her agent / skill / keyword kendi satırında.
2. **Description string'lerinde em-dash karakterler için `—` Unicode escape** (literal `—` yerine).

Reformat:

```bash
python3 -m json.tool team.json > tmp && mv tmp team.json
```

Bir feature branch ve main her ikisi de `team.json`'ı düzenler ve format üzerinde çakışırsa (örn. compact vs pretty-print), **main'in formatını benimse ve feature branch'in içeriğini üzerine yeniden uygula**. Konvansiyonla savaşma — içine kat.

#### `team.json`'u push'tan ÖNCE doğrula — non-negotiable

Schema constraint'leri ([`core/schemas/team.schema.json`](https://github.com/agentteamland/core/blob/main/schemas/team.schema.json)'da tanımlı):

| Alan | Kural |
|---|---|
| `description` (top-level) | 10–200 karakter |
| `agents[*].description`, `skills[*].description`, `rules[*].description` | max 200 karakter |
| `name` (top-level + agents/skills/rules) | kebab-case pattern `^[a-z][a-z0-9-]*$` |
| `keywords[*]` | 1–40 karakter, max 20 keyword, unique |
| `version` | strict SemVer `MAJOR.MINOR.PATCH` |

200-char description maxLength production'da üç kez ısırdı. Her seferinde düzeltme bir follow-up "trim description" commit oldu. **Daha fazla yok.**

`team.json`'a dokunan her push'tan önce:

```bash
~/.claude/repos/agentteamland/core/scripts/validate-team-json.sh path/to/team.json
```

Veya core repo'nun içinden:

```bash
./scripts/validate-team-json.sh team.json
```

Script sadece Python stdlib kullanan hızlı bir length check yapar VE, `ajv-cli` PATH'te ise, CI'nin koştuğu tam `ajv validate`'i çalıştırır — böylece GitHub Actions'ın kontrol edeceği şeyle parite alırsın. Kaçırılan length check'inde CI failure 2-saniyelik lokal koşturmadan daha pahalı.

ajv olmadan bile, script'in Python length check'i tarihsel olarak fail eden constraint'i yakalar. Çalıştır. Daima.

### 2. Conventional commit format

```
<type>(<scope>): <70 karakter altı tek-satır özet>

<body — değişikliğin NEDEN'i, NE'si değil (NE'yi diff gösterir)>
<context — hangi proje / session ihtiyacı ortaya çıkardı>

<footer — co-author, issue ref'leri, breaking-change notları>
```

Type'lar: `fix`, `feat`, `docs`, `chore`, `style`, `refactor`, `test`, `perf`. Breaking için type'tan sonra `!`: `feat(cli)!: …`.

Scope değişen alt-modüldür (agent adı, skill adı, CLI komut, repo alanı).

### 3. Body'de "Discovered via" context'i

Shared repo'ya bir fix farklı bir proje üzerinde çalışırken bulundu ise, **daima** o context'i yüzeye çıkar:

```
Discovered while scaffolding a design system for a downstream project.
The bug is not project-specific; every project running /dst-new-ds
hits the same wall.
```

Bu audit trail, gelecek-sen'in (veya başka bir maintainer'ın) motivasyonu hafızadan reconstruct etmek zorunda kalmadan anlamasını sağlar. Team repo git log'u self-documenting hale gelir.

### 4. PR akışı (default, branch protection ile enforce)

Tüm public `agentteamland/` repo'ları `main`'e merge için pull request gerektirir. Doğrudan push'lar branch protection tarafından reddedilir.

```bash
cd ~/.claude/repos/agentteamland/{team}
git checkout -b <fix|feat|chore>/<short-description>
# … değişiklikleri yap, versiyon bump et …
git add <files>
git commit -m "<conventional message>"
git push -u origin <branch-name>
gh pr create \
  --title "<type>(<scope>): <summary>" \
  --body  "<aşağıdaki PR body template'ine bak>"
```

**Kendi PR'larında `--assignee` veya `--reviewer` EKLEME.** Mevcut solo-maintainer setup'ında, Claude maintainer'ın GitHub hesabı altında push eder, bu da maintainer'ı otomatik PR author yapar:

- Author alanı zaten PR'ı maintainer'ın "Created by me" / "Involves me" dashboard'larında yüzeye çıkarır
- Explicit `--assignee @me` redundant (author == assignee) ve "Assigned to me" kuyruğunu kirletir
- GitHub PR author'dan review istemeyi blok eder, dolayısıyla `--add-reviewer mkurak` kendi PR'larda sessizce fail olur

(Eğer / ne zaman Claude'un push'ları için ayrı bir bot hesabı kurulursa — author ≠ maintainer olunca — `--reviewer mkurak` mümkün ve uygun olur.)

#### PR body template'i

```markdown
## Summary
<Ne değişti ve neden — 2-4 bullet>

## Discovered via
<Hangi proje / session / senaryo bunu ortaya çıkardı>

## Version bump
<version: X.Y.Z → X.Y.Z+1> (patch | minor | major — gerekçe)

## Test plan
- [ ] <fix'in çalıştığını nasıl doğrularsın>
- [ ] <regression check>
```

Solo maintainer flow için onay gerekmez (count: 0) — PR external gate olarak değil **ceremony + audit trail** olarak vardır.

## 🚫 PR merge disiplini — mutlak, istisnasız

**Claude pull request'leri asla merge etmez.** Bu non-negotiable ve scope limit'i yok.

Yasak `main`'e PR landing herhangi bir aksiyonu kapsar:

- `gh pr merge` herhangi bir formda (`--squash`, `--rebase`, `--merge`)
- `gh pr review --approve`
- Herhangi bir MCP-driven browser üzerinden "Merge pull request" tıklama
- GitHub REST / GraphQL API üzerinden eşdeğer server-side aksiyon

Şu durumlarda bile:

- PR trivial (tek-satır typo, formatting fix, broken link)
- `required_approving_review_count` 0 (solo maintainer)
- PR Claude tarafından author'lı
- Konuşmada daha önce kullanıcı "push this" veya "let's do it" dedi
- Branch protection admin bypass'a izin verir
- Maintainer ulaşılamaz ve hotfix urgent hissediliyor

→ Cevap **yine hayır**. Merge etmek insan reviewer'a aittir. Bir şey gerçekten urgent ise, PR URL'sini yüzeye çıkar ve kullanıcıya açıkça blocking olduğunu söyle — 10 saniyede merge'e tıklarlar.

### PR'larda NE'YE izin var

- `gh pr create` — PR aç
- `gh pr edit` — title/body'de typo düzelt, label add/remove
- `gh pr list` / `gh pr view` / `gh pr diff` / `gh pr checkout` — read-only inspection
- `gh pr review --comment` — feedback comment bırak (approve DEĞİL, request-changes DEĞİL)

### NE'YE izin YOK

- Merge etme (yukarıya bak)
- Approve etme (`--approve`)
- Başkasının PR'ında changes isteme (`--request-changes`)
- Close etme (`gh pr close`) — destructive; PR'ı sadece author veya kullanıcı kapatır
- Explicit kullanıcı talimatı olmadan kapalı PR'ı reopen etme

### İstisna: tooling üzerinden GitHub native auto-merge

**Bir** narrow istisna var: kullanıcı tooling üzerinden auto-merge'i explicit yetkilendirdiğinde — en sık [`/create-pr --auto-merge`](/tr/skills/create-pr) — Claude GitHub'ın native auto-merge'ini açmak için `gh pr merge --auto --merge` çalıştırabilir.

Bu istisna bounded:

- **Flag aynı turda kullanıcıdan gelmeli.** "Önceki yetkilendirme" veya "broad authorization" SAYILMAZ. Kullanıcı `--auto-merge` (veya eşdeğer explicit talimat) yazması gate'tir.
- **`--auto` zorunlu.** Anında merge eden herhangi bir şey (`gh pr merge` `--auto` olmadan) hâlâ yasak.
- **Branch protection'ın check gate'i korunur.** GitHub merge etmeden önce required check'leri bekler; check'ler fail olursa merge olmaz. "Review gate" CI'a delegate edilir — atlanmaz.
- **`--approve`, `--auto`'suz `--squash` veya başka bir merge varyantı için istisna yok.** Sadece `gh pr merge --auto --merge` (veya repo'nun ayarları öyle dikte ederse `--auto --squash` / `--auto --rebase`) kapsamında.

Kullanıcı tooling üzerinden explicit auto-merge flag'i geçmediyse, orijinal yasak geçerlidir: PR URL'sini yüzeye çıkar ve dur.

### PR açtıktan sonra handoff

`gh pr create` başarılı olduktan sonra, URL'yi yüzeye çıkar ve o PR'da dur:

> PR opened: https://github.com/.../pull/N — let me know once you've reviewed and merged, and I'll continue.

CI'nin green'de auto-merge etmesini bekleme. Self-approve etme. "5 dakikadır bir şey olmadığı için" `gh pr merge`'i yeniden invoke etme. Merge aksiyonu kullanıcının review ettiğine dair sinyal; o sinyali atlamak gate'i yok eder.

## Kaçış kapakları (yalnızca doğrudan push, asla auto-merge)

### Doğrudan push için admin bypass (yalnızca acil)

Branch protection `enforce_admins` false (default'umuz) iken admin'in doğrudan push etmesine izin verir. Bu PR-flow bypass'ın **tek** formu — ve commit push eder, merge değil. Sadece şu durumlarda kullan:

- Release-pipeline-breaking issue `brew upgrade atl` / `scoop install atl`'ı blok ediyor
- Public regression'ı durdurmak için bir revert dakikalar içinde land etmeli
- Maintainer explicit talimat veriyor: "doğrudan push et, PR yok"

Bunu kullanırken, hâlâ:

- Versiyonu bump et
- Conventional commit kullan
- Bir retrospective ile takip et: `chore(postmortem): ...` commit veya issue

User-side beklenti: admin bypass **onların** tool'u. Claude initiate etmez.

### Trivial değişiklikler bile PR'dan geçer

En küçük değişiklik için bile — bir typo, broken link, `gofmt` çalıştırma — yol:

1. Feature branch → commit → push → `gh pr create`
2. Kullanıcı review eder, merge'e tıklar

"PR için çok küçük" kategorisi yok. PR ceremony cheap (30 saniye iş); review gate trivial görünen ama olmayan hataları yakalar.

## Bu kuralın KAPSAMADIĞI şeyler

- **Private project repo'lar** — kendi projenin git workflow'u sana ait. Bu kural özellikle `agentteamland/` public repo'lar için.
- **Release-pipeline repo'lar** (`homebrew-tap`, `scoop-bucket`, `winget-pkgs`) — goreleaser auto-push yapar; branch protection bilerek uygulanmaz.
- **Tag-based release'ler** — `cli v0.2.1` tag'lerken, tag push goreleaser'ı tetikler. Tag oluşturulması için PR gerekmez (zaten merge edilmiş bir commit'i main'de işaret eder).

## İlgili

- [`/create-pr`](/tr/skills/create-pr) — bu disiplini otomatize eden skill
- [`/save-learnings`](/tr/skills/save-learnings) — Adım 0 invocation
- [karpathy-guidelines](/tr/guide/karpathy-guidelines) — bu governance kuralının kodlama-rehberi karşılığı
- Kanonik kaynak: [`core/rules/team-repo-maintenance.md`](https://github.com/agentteamland/core/blob/main/rules/team-repo-maintenance.md)

## Tarihçe

2026-04-24 öncesi, `/save-learnings` üzerinden team-repo yazımları doğrudan `main`'e ad-hoc commit mesajıyla land edebiliyordu. Bu gerçek bug fix'lerin hızlıca ship olmasına izin verdi ama versiyon bump'larının sıkça unutulmasına (bozarak `atl update`'in diff notification'ını) ve commit-mesaj disiplininin klavyede kim olursa ona bağlı olmasına da yol açtı.

2026-04-24'te maintainer org'daki her public repo'ya branch protection ekledi ve principled bir workflow istedi; bu kural o workflow. Doğrudan push enforcement-refused; PR ceremony hafif (solo maintainer için external onay gerekmez) ama zorunlu — her team-repo değişikliğinin versiyon bump, conventional message ve "Discovered via" context'i olmasını garanti eder.
