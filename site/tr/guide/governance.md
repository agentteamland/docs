# Governance

Shared `agentteamland/` repo'larının nasıl governance ettiği: GitHub seviyesinde branch protection + agent seviyesinde [team-repo-maintenance kuralı](/tr/authoring/team-repo-maintenance). Birlikte, shared repo'ya her değişikliğin versiyon bump, conventional commit, "Discovered via" context taşıdığını ve bir PR'dan geçtiğini garanti ederler — memory veya goodwill'e bağlı kalmadan.

Bu high-level "policy" view. Procedural detay (PR'ı gerçekten nasıl açacağın, commit mesajının nasıl görüneceği) için [`team-repo-maintenance`](/tr/authoring/team-repo-maintenance)'a bak.

## İki katman

| Katman | Ne | Neden |
|---|---|---|
| **Branch protection** | Server'da bad shape'i reddeder | Safety net — kuralı hatırlamaya bağlı değil |
| **`team-repo-maintenance` rule** | Lokalde good shape üretir | Method — Claude'a PR-ready bir change'i nasıl yazacağını söyler |

İkisi tek başına yeterli değil:

- **Rule olmadan protection** → Claude doğrudan push dener, git reddeder, kullanıcı neden olduğunu debug etmek ve Claude'a her seferinde PR akışını öğretmek zorunda kalır
- **Protection olmadan rule** → Claude kuralı izler ta ki izlemeyince; ilk kaçırılan adım main'e bad commit ship eder

Birlikte: rule commit'i doğru kurar, protection ne olursa olsun PR'dan geçtiğini garanti eder.

## Branch protection — 12 production repo'ya uygulandı

GitHub branch-protection kuralları `agentteamland/` org'daki her public production repo'ya uygulandı:

**Korunan** (PR gerekli, doğrudan push reddedilir):

- Code repo'lar: `core`, `cli`, `docs`, `brainstorm`, `rule`, `team-manager`, `registry`, `create-project`, `workspace`, `.github`
- Team repo'lar: `software-project-team`, `design-system-team`, `starter-extended`

**Korunmayan** (goreleaser auto-push yapar; protection release pipeline'ını bozar):

- Release-pipeline repo'lar: `homebrew-tap`, `scoop-bucket`, `winget-pkgs`

### Ayarlar

| Ayar | Değer | Neden |
|---|---|---|
| `required_approving_review_count` | `0` | Solo maintainer — PR external gate olarak değil ceremony + audit trail olarak vardır. (İkinci maintainer katılırsa `1`'e bump'la.) |
| `enforce_admins` | `false` | Admin (maintainer) genuine emergency'de bypass edebilir (release-pipeline break, urgent revert). |
| `allow_force_pushes` | `false` | History rewrite yok. |
| `allow_deletions` | `false` | Branch deletion yok. |

GitHub branch-protection API üzerinden uygulandı. Uygulandıktan sonra, `main`'e her doğrudan push server seviyesinde reddedilir — Claude'un takdirinde değil.

## Kural — beş sabit adım

[`team-repo-maintenance`](/tr/authoring/team-repo-maintenance) kuralı Claude (veya başkası) cached shared repo'yu edit ettiğinde beş adımı zorunlu kılar:

0. **PR açmadan önce `/save-learnings` çalıştır** — ship olmak üzere olan iş'ten wisdom'ı yakala; aynı PR'da yolculuk yapsın.
1. **Versiyonu bump et** (takımlar için `team.json`; CLI için `internal/config.Version`) strict SemVer izleyerek.
2. **Conventional commit** format: `type(scope): summary` body'de *neden*'i açıklayarak.
3. **Body'de "Discovered via" context** — hangi proje/session ihtiyacı ortaya çıkardı, böylece team-repo log'u self-documenting olur.
4. **PR akışı** (default, branch protection ile enforce): feature branch → push → `gh pr create` → kullanıcı review eder + merge'e tıklar.

Her adımın detayı için [team-repo-maintenance sayfasına](/tr/authoring/team-repo-maintenance) bak, `team.json` validation contract'ı ve mutlak NEVER-MERGE disiplini dahil.

## İki mutlak constraint

Beş sabit adımın ötesinde, iki constraint non-negotiable:

### 1. Claude PR'ları asla merge etmez

İstisna yok. Trivial değişiklikler için değil, "0 required approvals" ceremony için değil, self-authored PR'lar için değil, hotfix'ler için değil. **Merge etmek insan reviewer'a aittir.**

Tek narrow istisna: kullanıcı tooling üzerinden auto-merge'i explicit yetkilendirdiğinde — en sık [`/create-pr --auto-merge`](/tr/skills/create-pr) — Claude GitHub'ın native auto-merge'ini açmak için `gh pr merge --auto --merge` çalıştırabilir. Branch protection'ın check gate'i korunur (GitHub merge etmeden önce required check'leri bekler). Tam yasak + istisna spec'i için [team-repo-maintenance "PR merge discipline" bölümüne](/tr/authoring/team-repo-maintenance#-pr-merge-disiplini-mutlak-i-stisnas-z) bak.

Genuine emergency'ler için doğrudan-push bypass kalır (admin doğrudan commit edebilir), çünkü o farklı bir operation — ama Claude initiate etmez; kullanıcı eder.

### 2. Claude'un kendi PR'larında `--assignee` veya `--reviewer` yok

Mevcut solo-maintainer setup'ında, Claude maintainer'ın kendi GitHub hesabı altında push eder, bu da maintainer'ı otomatik PR author yapar:

- Author alanı zaten PR'ı maintainer'ın "Created by me" / "Involves me" dashboard'larında yüzeye çıkarır
- Explicit `--assignee @me` redundant (author == assignee) ve "Assigned to me" kuyruğunu kirletir
- GitHub PR author'dan review istemeyi blok eder, dolayısıyla `--add-reviewer mkurak` kendi PR'larda sessizce fail olur

(Claude'un push'ları için ayrı bir bot hesabı provision edildiğinde — author ≠ maintainer olunca — `--reviewer mkurak` mümkün ve uygun olur. Bu future work, current policy değil.)

## Solo-maintainer considerations

**Neden `required_approving_review_count = 0`?** Çünkü tek aktif maintainer ile, external bir approver istemek her PR'ı 24 saatlik bir blok yapar (başka bir hesabın approve etmesini bekle). Sıfır approval = PR documentation olarak vardır, ama maintainer self-merge edebilir. İkinci maintainer katılırsa, 1'e bump'la.

**Neden admin bypass'a izin?** Release-pipeline breakage, urgent revert veya PR ceremony'sini beklemenin gerçek user-facing zaman maliyeti olduğu durum. Kullanıldığında, commit hâlâ conventional format izler ve bir retrospective ile eşleşmeli.

**Solo vs team tradeoff:** Bazı governance puristleri ikinci bir machine/identity'den bile approval ister. Bu ekosistem için bu aşamada, bu over-engineering. Branch protection + rule kombinasyonu %95 case'i (commit hygiene, version bump'lar, audit trail) yakalar ve %5 (self-review kalitesi) solo maintainer'ın disiplinle sahiplenmesi gereken bir şey.

## Bu governance'ın KAPSAMADIĞI şeyler

- **Private project repo'lar** — kendi projenin git workflow'u sana ait. Bu governance özellikle `agentteamland/` public repo'lar için.
- **Release-pipeline repo'lar** (`homebrew-tap`, `scoop-bucket`, `winget-pkgs`) — goreleaser auto-push yapar; branch protection bilerek uygulanmaz.
- **Tag-based release'ler** — `cli v0.2.1` tag'lerken, tag push goreleaser'ı tetikler. Tag oluşturulması için PR gerekmez (zaten merge edilmiş bir commit'i main'de işaret eder).

## Rollout

2026-04-24'te uygulandı:

1. **GitHub API branch protection** 13 repo'ya (12 production + workspace) — anında etki
2. **`core@1.3.1` PR**: [feat(core): team-repo-maintenance rule](https://github.com/agentteamland/core/pull/1) — yeni akıştan geçen ilk değişiklik
3. **`design-system-team@0.4.2` PR**: [fix(dst-new-ds): Q3 single-select](https://github.com/agentteamland/design-system-team/pull/1) — yeni akışın eşzamanlı first-customer'ı
4. **Workspace `CLAUDE.md` state snapshot** + [settled-decision doc](https://github.com/agentteamland/workspace/blob/main/.claude/docs/branch-protection-and-team-repo-governance.md) — yeni normal'i yansıtmak için güncellendi

## İlgili

- [Team-repo maintenance](/tr/authoring/team-repo-maintenance) — procedural detay (PR'ı gerçekten nasıl açacağın, commit mesajının nasıl görüneceği)
- [`/create-pr`](/tr/skills/create-pr) — bu disiplini otomatize eden skill
- [Karpathy guidelines](/tr/guide/karpathy-guidelines) — bu governance'ın coding-guideline counterpart'ı
- Settled-decision doc: [branch-protection-and-team-repo-governance.md](https://github.com/agentteamland/workspace/blob/main/.claude/docs/branch-protection-and-team-repo-governance.md)
- Branch-protection API reference: [docs.github.com/en/rest/branches/branch-protection](https://docs.github.com/en/rest/branches/branch-protection)
