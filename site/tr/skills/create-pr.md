# `/create-pr`

Working-tree değişikliklerini al (uncommitted veya yakın zamanda default branch'e commit edilmiş), diff'ten uygun bir branch adı + commit mesajı + PR title türet, [`/save-learnings`](/tr/skills/save-learnings) çalıştır wisdom aynı PR'da yolculuk yapsın diye, AI review chain çalıştır (generic baseline + team-declared specialist'ler), commit + push, PR aç. Opsiyonel olarak GitHub auto-merge'i bounded polling + auto-fix loop ile aç. Daima end-of-work'te kullanıcıyı target branch'e döndür.

Bu skill, deterministik "bir parça işi ship et" akışı — `team-repo-maintenance`, `branch-hygiene`, `learning-capture`, `docs-sync` ve `karpathy-guidelines` ile tanımlı disiplinleri tüketir, kullanıcı her PR'da bunları yeniden türetmek zorunda kalmasın diye.

Global skill olarak [core](https://github.com/agentteamland/core)'da `core@1.4.0`'dan beri gelir.

## Flag'ler

| Flag | Default | Etki |
|---|---|---|
| `--auto-merge` | OFF | GitHub auto-merge'i aç (`gh pr merge --auto --merge`); merge edilene veya terminal failure'a kadar poll + auto-fix |
| `--no-review` | OFF (review on) | Tüm review chain'i atla (generic + her team reviewer) |
| `--no-auto-fix` | OFF (fix on) | Polling loop sırasında CI/merge failure'larını fix etmeye çalışma; kullanıcıya yüzeye çıkar |
| `--no-learning` | OFF (learning on) | `/save-learnings` + doc-impact pipeline'ını atla |
| `--timeout {min}` | 10 | Polling timeout dakika; 1-dakika interval, hem `--auto-merge` hem manual-merge wait için geçerli |

## Akış

Akış sıralı çalışır. Her adımın net bir precondition ve postcondition'ı var; precondition fail olursa, skill yüzeye çıkarır ve durur — devam etmez.

### Adım 1 — Pre-check'ler

- Mevcut dizin git repo'su içinde
- Working tree'de değişiklik VAR veya mevcut branch'in unpushed commit'leri var
- Repo'nun default branch'ini belirle (`main`/`master`)

### Adım 2 — Target branch'i belirle

"Target branch" PR'ın merge olacağı VE end-of-work'te kullanıcının döneceği branch.

- **Default branch'teyse** → target = default branch.
- **Non-default branch'teyse** → `AskUserQuestion` üç seçenekle: upper branch (auto-detect), default branch, veya free-text Other.

### Adım 3 — Branch adı + commit mesajı üret

Staged + unstaged + untracked değişiklikleri analiz et:

- **Type** — `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `style` arası (diff'ten heuristic-derived: `skills/agents/rules/` altında yeni dosya → `feat`; bug-fix dili → `fix`; sadece `*.md` → `docs`; vb.)
- **Scope** — değişikliği kapsayan en spesifik scope (skill adı, rule adı, agent adı, CLI komut, repo alanı)
- **Slug** — kebab-case, ≤ 50 karakter, ASCII

Çıktılar:

- **Branch adı** — `{type}/{slug}` (örn. `feat/create-pr-skill`, `fix/winget-403`, `docs/translate-trk-en`)
- **Commit subject** — `{type}({scope}): {one-line summary}` 70 karakter altı
- **Commit body** — değişikliği açıklayan 2–4 bullet. Team-repo context'inde çağrılıyorsa son satır "Discovered via" context'i ([team-repo-maintenance §3](https://github.com/agentteamland/core/blob/main/rules/team-repo-maintenance.md) gereği)

Skill kullanıcıya isim onayı için **sormaz** — üretir ve devam eder.

### Adım 4 — Save learnings (`--no-learning` yoksa)

[`/save-learnings`](/tr/skills/save-learnings)'i manuel modda çağırır (canlı konuşmayı analiz eder):

- Wiki / journal / agent children / skill learnings güncellemelerini yazar (project-local)
- Her `<!-- learning doc-impact: readme/docs/breaking -->` marker'ı için bir doc draft hazırlar
- Her draft kullanıcıya inline accept / reject / edit için sunulur:

```
📝 Doc draft for README.md:
<diff>
Accept? (y/n/edit)
```

Kabul edilen draft'lar staged olur; reddedilen draft'lar atılır.

### Adım 5 — Review chain (`--no-review` yoksa)

İki katman, sıralı çalıştırılır:

**5a — Generic reviewer (daima)**

Fresh-context bir sub-agent (`subagent_type: general-purpose`) çağırır Karpathy-grounded review prompt ile:

- Think Before Coding (varsayımlar net mi?)
- Simplicity First (over-engineering var mı?)
- Surgical Changes (drive-by edit'ler? orphan'lar?)
- Goal-Driven Execution (hedefe karşı doğrulanıyor mu? success kriterleri?)

Plus genel kod kalitesi (naming, scope creep, security smell'ler, dead code, test coverage). 🔴 Issues / 🟡 Concerns / 🟢 Looks good olarak raporlar.

**5b — Team reviewer'lar (kurulu takım başına)**

Her kurulu takım için skill `team.json`'ı okur ve `capabilities.review`'a bakar:

- Declared ise (örn. `capabilities.review: "code-reviewer"`), adı verilen team agent aynı diff'e karşı çalışır ve domain-specific review üretir
- Declared değilse, sessizce atlanır — takım başına fallback yok. Generic reviewer platform-wide baseline.

Konsolide rapor kullanıcıya gösterilir. Continue / abort / edit.

### Adım 6 — Commit + push

```bash
git checkout -b {branch-name}
git add -A
git commit -m "{commit-subject}

{commit-body}

{discovered-via-line if applicable}"

git push -u origin {branch-name}
```

### Adım 7 — PR aç

```bash
gh pr create \
  --base {target-branch} \
  --title "{commit-subject}" \
  --body "..."
```

Body'de Summary, Discovered via, Version bump (uygulanabildiyse), Test plan var. [team-repo-maintenance §4](https://github.com/agentteamland/core/blob/main/rules/team-repo-maintenance.md) gereği skill `--assignee` veya `--reviewer` **geçirmez**.

### Adım 8 — `--auto-merge` polling (yalnızca flag set ise)

```bash
gh pr merge {N} --auto --merge
```

Bu, **tüm skill setindeki tek izinli merge invocation.** Hemen merge etmez — GitHub required check'leri bekler sonra otomatik merge eder. Branch protection'ın check gate'i korunur.

### Adım 9 — Polling + auto-fix loop (eğer `--auto-merge`)

PR state'ini 1-dakika interval'larında, `{timeout}` deneme'ye kadar (default 10) poll eder. State machine:

| State | Aksiyon |
|---|---|
| `MERGED` | Başarı — end-of-work'e geç |
| `CLOSED` | Kullanıcı merge etmeden kapattı — temiz çık, end-of-work yok |
| `*CLEAN` / `*HAS_HOOKS` | Sağlıklı state, sadece check'leri bekliyor — polling'e devam |
| `*BLOCKED` / `*UNSTABLE` / `*DIRTY` / `*BEHIND` | CI failure veya merge conflict — `handle_failure` |

#### `handle_failure` sınıflandırması

**In-scope (auto-fix denenir):**

- Merge conflict'ler — latest target'ı fetch et, 3-way merge dene
- Lint / format failure'lar — projenin formatter'ını çalıştır (auto-detect: `package.json scripts.lint`, `.prettierrc`, `gofmt`, `cargo fmt`, vb.)
- Trivial type error / missing import — compiler-suggested fix'leri uygula

**Out-of-scope (bilgi ver ve dur):**

- Gerçek test failure'ları (assertion'lar, mevcut testlerde regression)
- Non-trivial build error'lar
- Infrastructure / CI config issue'ları
- Missing required review'lar (insan reviewer'lar blocking)

3 in-scope fix denemesinden sonra skill durur ve raporlar.

### Adım 10 — Manual-merge polling (yalnızca `--auto-merge` SET DEĞİLSE)

Skill yine de merge için poll eder — kullanıcı `{timeout}` dakika içinde manuel merge edebilir. Aynı MERGED / CLOSED / timeout exit'leri.

### Adım 11 — End-of-work (universal)

Yalnızca PR başarıyla merge edildiyse erişilir:

```bash
git checkout {target-branch}
git pull origin {target-branch}
```

Kullanıcı skill'i target branch'te bitirir, merge edilmiş değişiklik dahil, sıradaki task için hazır.

### Adım 12 — Final rapor

```
✅ /create-pr complete
   Branch:      feat/create-pr-skill
   PR:          https://github.com/.../pull/N
   Review:      generic + 1 team reviewer (software-project-team)
                3 issues, 1 concern, all addressed
   Learnings:   /save-learnings ran — 2 wiki pages updated, 1 README draft accepted
   Auto-merge:  enabled, merged after 4 min (1 auto-fix: prettier formatting)
   End-of-work: returned to main, pulled latest
```

## Önemli constraint'ler

1. **Asla doğrudan merge etme.** Bu skill `gh pr merge --auto --merge`'i (auto-merge enable) yalnızca `--auto-merge` flag verildiğinde kullanır. Doğrudan merge (`--merge`/`--squash`/`--rebase` `--auto` olmadan) **daima yasaktır** — bkz. [team-repo-maintenance "PR merge discipline"](https://github.com/agentteamland/core/blob/main/rules/team-repo-maintenance.md). Kullanıcı flag'i yazarak auto-merge'i explicit yetkilendirdi; bu belgelenmiş istisna.
2. **Discovered-via context.** Shared / team repo'da çağrılırsa, skill team-repo-maintenance disiplinine uyar: PR body'de "Discovered via", versiyon bump, conventional commit. Detection: cwd `~/.claude/repos/agentteamland/` altında veya bilinen shared-repo pattern ile eşleşiyor.
3. **Idempotent save-learnings.** Burada `/save-learnings`'i tekrar çalıştırmak güvenli — append eder, dedup eder ve sadece taze content'i işler.
4. **Schema validation.** Staged diff bir `team.json`'a dokunuyorsa, push'tan önce validator çalışır (`~/.claude/repos/agentteamland/core/scripts/validate-team-json.sh`).
5. **Branch hygiene başlamadan önce.** Yeni branch türetmeden önce skill lokal default branch'in origin ile current olduğunu doğrular. Değilse önce fast-forward.
6. **Sessiz partial failure yok.** Herhangi bir adım fail olursa skill durur ve raporlar.

## İlgili

- [`/save-learnings`](/tr/skills/save-learnings) — Adım 4'te çağrılır
- [team-repo-maintenance rule](https://github.com/agentteamland/core/blob/main/rules/team-repo-maintenance.md) — shared repo'lar için governance
- [karpathy-guidelines rule](https://github.com/agentteamland/core/blob/main/rules/karpathy-guidelines.md) — review prompt'unun temeli

## Gelecek evrim (v2)

- **Domain-aware review routing** — her team agent `domains: ["*.tsx", ...]` glob declare eder; skill diff'in file type'larını eşler ve sadece ilgili agent'ları çağırır
- **Parallel team review** — team reviewer'ları concurrent çalıştır
- **Auto-fix scope expansion** — in-scope'u test failure'lara genişlet (testin aynı diff'te eklendiği — Claude testi yanlış yazmış)

## Kaynak

- Spec: [core/skills/create-pr/skill.md](https://github.com/agentteamland/core/blob/main/skills/create-pr/skill.md)
