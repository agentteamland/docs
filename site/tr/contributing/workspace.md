# Workspace — maintainer hub'ı

[`agentteamland/workspace`](https://github.com/agentteamland/workspace) repo'su AgentTeamLand ekosisteminin **maintainer hub**'ıdır. Meta-repo: clone'layıp tek script çalıştırınca her peer repo (cli, core, registry, software-project-team, vb.) tek bir ağaç altında `./repos/` içinde checked-out olur. Platformun her hareketli parçası bir `cd repos/<name>` uzaklıkta.

Workspace'i **birden fazla repo'yu kapsayan maintenance işi** yaparken kullan: cross-repo refactor, multi-PR rollout, governance audit, ya da sadece 14 ayrı `cd` komutu olmadan org genelinde `git status`.

Sadece atl KULLANMAK istiyorsan (kendi projelerine takım kurmak), workspace gerekmez — `brew install agentteamland/tap/atl` yeterli. Workspace ekosistem-tarafı iş için.

## Bootstrap

```bash
git clone https://github.com/agentteamland/workspace.git
cd workspace
./scripts/sync.sh
```

`sync.sh` `agentteamland/` altındaki her peer repo'yu `./repos/<name>/`'e clone'lar. Idempotent — yeniden çalıştırma var olan clone'ları fast-forward-pull eder, son run'dan beri org'a eklenmiş yeni repo'ları clone'lar.

Sync sonrası `./repos/` tam org snapshot'ını içerir (2026-05-03 itibarıyla 16 repo):

```
repos/
├── cli/                       # atl binary (Go) — kullanıcıların kurduğu CLI
├── core/                      # global skill'ler + rule'lar + JSON schema'lar
├── brainstorm/                # /brainstorm skill + rule
├── rule/                      # /rule + /rule-wizard skill'leri
├── team-manager/              # bootstrap install.sh (post-v1.0.0 atl'ye delege)
├── software-project-team/     # 13 agent + 3 skill (.NET + Flutter + React stack)
├── design-system-team/        # 2 agent + 10 /dst-* skill (native design + prototype)
├── starter-extended/          # inheritance örnek takımı
├── create-project/            # DEPRECATED — scaffolder takımlara taşındı
├── registry/                  # teams.json — kanonik takım kataloğu
├── docs/                      # bu docs site (VitePress, EN + TR)
├── homebrew-tap/              # goreleaser tarafından otomatik yönetilir
├── scoop-bucket/              # goreleaser tarafından otomatik yönetilir
├── winget-pkgs/               # microsoft/winget-pkgs fork'u
└── .github/                   # organization profile
```

## Günlük komutlar

Workspace `./scripts/` altında üç script ile gelir:

```bash
./scripts/sync.sh         # eksik repo'ları clone et; var olanları fast-forward pull et
./scripts/status.sh       # tabular özet — kim dirty, ahead, behind
./scripts/push-all.sh     # unpushed commit'lerin dry-run listesi (push için --force)
```

`status.sh` her repo için tek satırlık tablo basar — branch, ahead/behind sayıları, dirty marker. Org'un mevcut state'ini bir bakışta görmek için her session başında çalıştır.

`push-all.sh` default dry-run — NE push edileceğini gösterir, push ETMEZ. Gerçekten push etmek için `--force` geç. ("force" adı dry-run override etmeye işaret eder, `git push --force` değil — gerçek push normal git semantiğini kullanır.)

## Bir peer repo'da çalışma

```bash
cd repos/<repo-name>
# Değişikliklerini yap, team-repo-maintenance disiplinini izle
git checkout -b <type>/<short-description>
# ... dosyaları edit et ...
git add <files> && git commit -m "<conventional message>"
git push -u origin <branch-name>
gh pr create
# Maintainer'ın review + merge'ünü bekle
```

Her peer repo kendi remote'una sahip kendi git clone'u. 16'nın 12'si üzerinde branch protection (release-pipeline + .github hariç) PR akışını enforce eder. Tam disiplin için bkz. [Team-repo maintenance](../authoring/team-repo-maintenance).

## Workspace'i Claude Code ile kullanma

Workspace kökünde Claude Code aç:

```bash
cd ~/projects/my/agentteamland/workspace
claude    # veya Claude Code'u nasıl invoke ediyorsan
```

Claude Code burada başladığında otomatik şunları görür:

- **`./repos/` altındaki her peer repo** doğrudan edit için — ayrı `cd` gerekmez
- **Tüm aktif brainstorm'lar** ([brainstorm rule](https://github.com/agentteamland/brainstorm/blob/main/rules/brainstorm.md) gereği `CLAUDE.md`'de auto-pinned)
- **Workspace `CLAUDE.md`** — platform-seviye orientation document
- **Final kararlar** `.claude/docs/` içinde (tamamlanmış brainstorm'lardan türeyen settled architecture decisions)
- **Wiki + journal** `.claude/wiki/` ve `.claude/journal/` içinde ([knowledge system](../guide/knowledge-system) gereği)

Cross-repo iş için doğal kurulum: Claude'un working set'i tüm org.

## Bilgi haritası

Workspace'in `CLAUDE.md`'si Claude'un context'ine her wiki sayfasının title + summary'sini auto-load eden `<!-- wiki:index -->` marker bloğu taşır. Marker bloğunun nasıl çalıştığı ve neden var olduğu için bkz. [Claude Code conventions](../guide/claude-code-conventions).

Wiki'nin kendisi (`.claude/wiki/*.md`) maintainer'ın cross-repo concern'ler üzerinde çalışırken elinde olması gereken platform-wide pattern'ler, konvansiyonlar, keşifler, anti-pattern'lerin kanonik kaydı. Sayfalar güncel tutulur — [knowledge system](../guide/knowledge-system) güncel gerçek için replace-style, history için append-only journal.

## Session sonu

Toparlarken:

```bash
./scripts/status.sh        # her şeyin main'de + clean olduğunu doğrula
./scripts/push-all.sh      # unpushed ne var bak
```

Daha kapsamlı session-end pass için, [`/repo-cleanup`](https://github.com/agentteamland/workspace/blob/main/.claude/skills/repo-cleanup/skill.md) şunları otomatize eder: save-learnings → branch + commit + push + PR + auto-merge → tag + registry + branch prune. Workspace'te Claude Code'un içinden çalıştır.

## İlgili

- [`atl` CLI'yi kur](../guide/install) — sadece atl KULLANMAK istiyorsan workspace'i atla
- [Team-repo maintenance](../authoring/team-repo-maintenance) — her peer-repo PR'ının izlediği disiplin
- [Governance](../guide/governance) — branch protection + team-repo-maintenance rule pair
- [Knowledge system](../guide/knowledge-system) — workspace'in `.claude/` dizininin kullandığı journal + wiki katmanları
