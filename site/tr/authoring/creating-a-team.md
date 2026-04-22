# Takım oluşturma

Bir takım, `atl install` ile projene kurduğun **agent**, **skill** ve **rule**'lardan oluşan, yeniden kullanılabilir bir paket. Bu sayfa boş bir dizinden kurulu-çalışır takıma kadar ihtiyacın olan her şeyi anlatır — "Laptop'umda deniyorum, henüz hiçbir yere push'lamadım" senaryosu da dahil.

## Takım nedir (ne değildir)

Takım, aslında bir `team.json` dosyası ve biraz Markdown içeren bir git deposudur. `atl install` çalıştırdığında CLI, o repo'yu yerel cache'ine klonlar ve içeriklerini projenin `.claude/` dizinine symlink'ler. Hepsi bu — plugin sistemi yok, JavaScript runtime yok, custom binary yok. Her şey metin dosyaları ve symlink.

Bir takım şunlardan oluşabilir:

- **Tek bir agent** (Claude'un takip ettiği tek bir Markdown dosyası)
- **Bir veya daha fazla skill** (Claude'un çağırabileceği slash komutları)
- **Rule'lar** (global yüklenen, davranışı şekillendiren talimatlar)
- **Bunların herhangi bir kombinasyonu**
- **Başka bir takımın uzantısı** (tüm parçaları devralır, belirli öğeleri ezer veya hariç tutar) — bkz. [Miras (inheritance)](./inheritance)

Bir takımı şuradan kurabilirsin:

1. Herkese açık **AgentTeamLand registry'si** (`atl install software-project-team`)
2. Herhangi bir **GitHub repo'su** (`atl install agentteamland/starter-extended` veya tam URL)
3. **Herhangi bir git URL'si** — GitHub, GitLab, Bitbucket, self-hosted (public veya SSH key ile private)
4. **Kendi yerel dosya sistemin** (`atl install ./my-team` veya mutlak yol) — remote gerektirmez, takım dizininde `git init` yeter

Sonuncusu — kendi takımını yazan çoğu insanın ilk uzanacağı yol. Aşağıda detaylı anlatılıyor.

---

## Bölüm 1 — Uçtan uca walkthrough

Hiç yoktan küçük bir gerçek takım yaratalım. Makinende bir `my-team` dizini oluşturacak, bir agent ekleyecek ve test bir projeye kuracaksın — hiç git server'a push'lamadan.

### Adım 1 — Takım dizinini oluştur

```bash
mkdir ~/projects/my-team
cd ~/projects/my-team

git init -b main                    # atl install pipeline'ı git repo gerektirir
```

Herhangi bir konum olur. Klasör adının takımın registry adıyla eşleşmesi ŞART değil — o `team.json`'da aşağıda ayarlanıyor.

### Adım 2 — `team.json` yaz

Takımın manifest'i. Minimum şekli:

```json
{
  "schemaVersion": 1,
  "name": "my-team",
  "version": "0.1.0",
  "description": "Next.js + Tailwind projeleri için görüşlü kurulum.",
  "author": { "name": "Senin Adın", "url": "https://github.com/sen" },
  "license": "MIT",
  "keywords": ["nextjs", "tailwind", "typescript"],
  "agents": [
    { "name": "web-agent", "description": "Next.js sayfalarını inceler ve oluşturur." }
  ],
  "skills": [],
  "rules": [],
  "extends": null,
  "excludes": []
}
```

Tüm alanlar: [team.json](./team-json).

**Dikkat edilmesi gereken tuzaklar:**

- `name` **registry short-name**'dir. Bir kere belirlendiğinde değiştirme — kullanıcılar buna göre referans verir. Kebab-case olmalı (küçük harfler, rakamlar, tireler).
- `version` SemVer (major.minor.patch). Değişiklik yayınladığında — lokal iterasyonda bile — arttır. `atl update` buna bakarak pull edip etmeyeceğine karar verir.
- `author` **obje**, string değil. Minimum `{ "name": "Senin Adın" }`. Registry'ye göndereceksen `url` de lazım.
- `agents` metadata dizisidir, agent içeriği değil. Asıl agent Markdown'ı `agents/<name>/agent.md`'de yaşar (Adım 3).

### Adım 3 — Agent'ını ekle

`team.json`'ın deklare ettiği her agent, `agents/` altında **children pattern** ile bir dizin gerektirir:

```
my-team/
├── team.json
└── agents/
    └── web-agent/
        ├── agent.md              ← kısa: kimlik, kapsam, ilkeler (<300 satır)
        └── children/             ← opsiyonel: detaylı konular
            ├── routing.md
            ├── data-fetching.md
            └── testing.md
```

`agent.md` giriş noktasıdır — Claude her çağrımda okur. Kısa tut. Detaylı desenleri `children/*.md`'ye koy; agent'ın `## Knowledge Base` bölümü bunlara link verir, Claude ihtiyaç olduğunda okur.

Minimum `agent.md`:

```markdown
---
name: web-agent
description: "Next.js sayfalarını inceler ve oluşturur."
---

# Web Agent

## Identity
Bu projede Next.js sayfalarını inşa ediyor ve inceliyorum.

## Area of Responsibility (Positive List)
Sadece şunlara dokunurum:
- `app/` — Next.js App Router sayfaları + layout'lar + route'lar
- `components/` — ortak UI ilkelleri
- `lib/` — data-fetching + utility fonksiyonları

Şunlara DOKUNMAM:
- `api/` — backend'in işi
- Build config (`next.config.js`, `tsconfig.json`) açık onay olmadan

## Core Principles
1. Varsayılan server component; client component sadece interaktif olanlar için.
2. Stili componentle birlikte koy; global CSS yok.
3. Her async boundary için loading UI.
```

İşte çalışan bir agent. Büyüdükçe `children/`'a detay ekle.

> 📘 **Detaylı:** children pattern `agentteamland/core`'daki [agent-structure rule](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md)'de anlatılıyor. Ana fikir: `agent.md` kısa kalır, konu bazlı detay `children/*.md`'de her konu ayrı dosyada.

### Adım 4 — Commit

atl install pipeline'ı altında `git clone` kullanır, o yüzden takım dizini en az bir commit'li git repo olmalı:

```bash
git add .
git commit -m "feat: initial team"
```

Bu noktada remote şart değil.

### Adım 5 — Test projesine kur

```bash
mkdir /tmp/demo-app && cd /tmp/demo-app
atl install ~/projects/my-team         # mutlak yol ✓
# ya da:  atl install ../my-team       # göreli yol ✓
# ya da:  atl install file:///Users/sen/projects/my-team   # explicit file:// URL ✓

atl list
# → my-team@0.1.0    (effective: 1 agents, 0 skills, 0 rules)

ls -la .claude/agents/
# → web-agent.md → ~/.claude/repos/agentteamland/my-team/agents/web-agent/agent.md
```

Çıktı böyleyse, takımın kuruldu. Artık agent `/tmp/demo-app/`'de Claude için kullanılabilir.

> 💡 **"agentteamland" neden private takımımın cache path'inde?**  atl tek bir ortak yerel cache dizini kullanır, takım nereden gelirse gelsin. Senin private takımın, public olanların yanında `~/.claude/repos/agentteamland/`'de oturur; ayırt eden `team.json`'daki `name`'dir. Bu takımının org'a push'landığı anlamına GELMEZ — sadece cache konvansiyonu.

### Adım 6 — İterasyon

`~/projects/my-team/` altında düzenle, commit'le (atl commit okur, working tree okumaz), sonra kurulu takımı yenile:

```bash
cd ~/projects/my-team
vim agents/web-agent/agent.md           # veya başka bir düzenleme
git commit -am "web-agent rehberini iyileştir"

cd /tmp/demo-app
atl update my-team
# → atl tekrar pull'lar, symlink'leri yeniler
```

Gidiş-dönüş ~1 saniye. Test projeye karşı hızla iterate edebilirsin.

### Adım 7 — (Opsiyonel) Skill ve rule ekle

**Skill**'ler slash komutlarıdır. Her biri frontmatter'lı bir `skills/<skill-name>/skill.md` dosyası:

```markdown
---
name: lint-page
description: "/lint-page <path> — projenin lint config'iyle bir Next.js sayfa dosyasını denetler."
argument-hint: "<path-to-page>"
---

# /lint-page Skill

## Purpose
Projenin ESLint + Prettier'ıyla tek bir Next.js sayfa dosyasını lint eder.

## Flow
1. Path'in var olduğunu ve `app/**/*.tsx` ya da `pages/**/*.tsx`'e uyduğunu doğrula.
2. `npm run lint -- --file <path>` çalıştır.
3. Çıktıyı parse et; violation varsa file:line:column atıflarıyla yazdır.
4. Güvenli olduğu yerde auto-fix teklif et.
```

`team.json`'a deklare et:

```json
"skills": [
  { "name": "lint-page", "description": "/lint-page <path> — sayfa dosyasına karşı lint çalıştırır." }
]
```

**Rule**'lar global yüklenen Markdown dosyalarıdır; Claude'un davranışını şekillendirirler. `rules/<rule-name>.md`'ye koy:

```markdown
# React 19 varsayılanları

- İnteraktiflik gerekmedikçe server component
- Paylaşılan bir lib'in tepesine `"use client"` asla koyma
- `useActionState` manuel form-state boilerplate'ini değiştirir
```

Deklare et:

```json
"rules": [
  { "name": "react-19-defaults", "description": "Server component varsayılanı; client boundary sızıntısından kaçın." }
]
```

Herhangi bir değişiklik sonrası — agent, skill veya rule — commit + test projede `atl update`.

### Adım 8 — Sıradaki adımlar

Artık takımın lokalde çalışıyor:

- **Private tut.** Böyle sonsuza kadar kullanabilirsin — `atl install`'u yerel path'ine yönlendir veya private git server'a push'la (GitHub private, GitLab, self-hosted Gitea). Submit şart değil.
- **Bir takımla paylaş.** Private repo'ya push'la ve arkadaşlarına URL'yi ver: `atl install git@github.com:your-org/your-team.git`. SSH ile kurarlar (registry işin içinde değil).
- **Var olan bir takımı genişlet.** Bkz. [Miras (inheritance)](./inheritance) — `"extends": "software-project-team@^1.1.0"` ile o takımın agent'larını devral, sonra belirli öğeleri ezer veya çıkarırsın.
- **Public registry'ye gönder.** Sadece başkaları short-name ile keşfetsin istersen. Bkz. [Registry başvurusu](./registry-submission).
- **Scaffolder skill'i ekle.** Takımın yeni proje kurma amaçlıysa `/create-*` skill'i ekle. Bkz. [Scaffolder spec](./scaffolder-spec).

---

## Bölüm 2 — Install modları

Hepsi çalışır. Takımın nerede yaşadığına göre uygun olanı seç.

### Registry (public, onaylı)

```bash
atl install software-project-team
```

Short-name [public registry](https://github.com/agentteamland/registry)'de aranır. Sadece submit edilmiş ve onaylanmış takımlar için çalışır.

### GitHub `owner/repo` kısayolu

```bash
atl install agentteamland/starter-extended
```

`https://github.com/agentteamland/starter-extended.git`'e genişler. Registry'de olmayan public GitHub takımları için kolay.

### Tam git URL'si (herhangi bir host, public veya private)

```bash
atl install https://github.com/sen/takımın.git      # public, HTTPS
atl install git@github.com:sen/takımın.git          # private, SSH
atl install ssh://git@gitlab.com/sen/takım.git      # GitLab SSH
atl install https://gitea.example.com/sen/takım.git # self-hosted Gitea
```

Private repo'lar için host'ta git credentials / SSH key'ler kurulu olmalı (atl `git clone`'a shell out yapar, o da git config'ini kullanır). atl'e özel authentication yok.

### Yerel dosya sistemi (remote gerektirmez)

```bash
atl install ~/projects/my-team                   # mutlak veya home path
atl install ./my-team                            # göreli
atl install file:///Users/sen/projects/my-team   # explicit file:// URL
```

Gerektirir:
- Hedef, kökünde `team.json` içeren bir dizin olmalı
- Dizin en az bir commit'li bir git repo olmalı (`git init` + `git add . && git commit` yeter)

Push gerekmez. Yerel iterasyon, private takımlar veya henüz paylaşmaya hazır olmadığın takımlar için ideal.

> ⚠️ **Versiyon:** yerel filesystem kurulumu için `atl` ≥ 0.1.4 gerekir. Eski versiyonlar sadece URL kabul ediyordu.

---

## Bölüm 3 — Takım layout referansı

```
my-team/
├── team.json                      ← manifest (zorunlu)
├── README.md                      ← takım dokümantasyonu (şiddetle tavsiye edilir)
├── LICENSE                        ← genelde MIT
│
├── agents/                        ← agent başına bir dizin
│   ├── web-agent/
│   │   ├── agent.md              ← kısa: kimlik + kapsam + ilkeler + knowledge-base indeksi
│   │   └── children/             ← opsiyonel: detay konuları
│   │       ├── routing.md
│   │       ├── data-fetching.md
│   │       └── testing.md
│   └── api-agent/
│       ├── agent.md
│       └── children/ ...
│
├── skills/                        ← skill başına bir dizin
│   ├── lint-page/
│   │   └── skill.md              ← frontmatter (name, description, argument-hint) + içerik
│   └── run-e2e/
│       └── skill.md
│
├── rules/                         ← rule başına bir .md (düz, dizin değil)
│   ├── react-19-defaults.md
│   └── file-naming.md
│
├── schemas/                       ← opsiyonel: takımın validate ettiği JSON şemalar
│   └── config.schema.json
│
└── .github/workflows/
    └── validate.yml               ← her push'ta team.json'ı schema-validate et
```

`team.json`'ın listelediği `agents/`, `skills/`, ve `rules/` altındaki her dosya, kurulum sırasında tüketicinin `.claude/`'una symlink olarak gelir. Listelenmeyen dosyalar yok sayılır.

---

## Bölüm 4 — CI'da schema doğrulama (tavsiye edilir)

`.github/workflows/validate.yml`'ye bunu ekle; bozuk bir `team.json` kuruluma gitmeden PR'da yakalanır:

```yaml
name: Validate team.json
on:
  push:
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm install -g ajv-cli

      - name: Download schema
        run: curl -sSfL https://raw.githubusercontent.com/agentteamland/core/main/schemas/team.schema.json -o team.schema.json

      - name: Validate
        run: ajv -s team.schema.json -d team.json --strict=false
```

Opsiyonel ama `team.json` hatalarının çoğunu install sırasında değil PR sırasında yakalar.

---

## Bölüm 5 — Private takım akışları

Üç tür "private takım" var; her birinin en temiz yolu farklı:

### 🟢 (a) Tamamen lokal, sadece ben

Tek kullanıcı sensin. Takım laptop'unda yaşıyor.

```bash
# Yaz:
mkdir ~/projects/my-team && cd ~/projects/my-team
git init -b main
vim team.json agents/main-agent/agent.md
git add . && git commit -m "init"

# Herhangi bir projeye kur:
cd ~/projects/gerçek-app
atl install ~/projects/my-team

# İterate et (edit → commit → refresh):
cd ~/projects/my-team
vim agents/main-agent/agent.md
git commit -am "kapsamı daralt"

cd ~/projects/gerçek-app
atl update my-team
```

Tüm akış bu. Remote işin içinde değil.

### 🟡 (b) Birkaç takım arkadaşıyla paylaşılan

2–10 kişi kurmalı ama public OLMAMALI.

```bash
# Private GitHub (veya GitLab / Gitea) repo'ya push'la:
gh repo create sen/takımın --private --source=. --push

# Takım arkadaşları SSH ile kursun (SSH key'leri repoya eklenmeli):
atl install git@github.com:sen/takımın.git

# Güncellemeler:
atl update takımın
```

Registry submit yok; yabancıların keşfi yok. SSH tüm modern git host'larında çalışır.

### 🔵 (c) Şirket içi / kurumsal, self-hosted git server'ın arkasında

(b) ile aynı, URL self-hosted Git'i gösterir:

```bash
atl install git@git.şirketin.com:platform/takım.git
```

atl host'u umursamaz; `git clone` authentication'ı senin kurduğun SSH key'ler veya credential helper'larla halleder.

### 🟣 (d) Dünyaya açık

Herkes `atl install takımın` desin diye [AgentTeamLand registry](https://github.com/agentteamland/registry)'sine gönder. Bkz. [Registry başvurusu](./registry-submission).

---

## Bölüm 6 — Sık yapılan hatalar

**`atl install ./my-team` diyor ki "takım bulunamadı"**
→ `./my-team` yerel path olarak tanınmadı. Kontrol et: dizin mi? `team.json` içeriyor mu? `atl` versiyonu ≥ 0.1.4 mü? (`atl --version`)

**`Error: agent source missing: .../agents/foo/agent.md`**
→ `team.json`'ında `agents: [{"name": "foo"}]` yazıyor ama dosya sisteminde `agents/foo.md` (düz) var, `agents/foo/agent.md` (children pattern) değil. atl children-pattern yapısını gerektirir.

**`Error: parse team.json: json: cannot unmarshal string into Go struct field TeamManifest.author`**
→ `author` obje olmalı, string değil. `"author": "Sen"` yerine `"author": { "name": "Sen" }`.

**Takımı düzenledim `atl update` çalıştırdım, etki yok**
→ Commit'ledin mi? `atl update` git'ten pull'lar, uncommitted düzenlemeler akmaz. Takımı commit'le, sonra `atl update`.

**Takımı temizce silmek istiyorum**
→ Projede `atl remove my-team` symlink'leri `.claude/`'dan kaldırır ama cache'lenmiş repo'yu bırakır. Cache'i de silmek için: `rm -rf ~/.claude/repos/agentteamland/my-team`.

**Takım `extends` kullanıyor, lokalde parent'ı değiştirdim ama `atl install` yanlış parent'ı çekiyor**
→ `extends`, child'ın `team.json`'ındaki registry / URL spec'ine göre çözülür. Child'ın `extends`'i lokal path'i göstermedikçe senin lokal parent'ını okumaz. Tam lokal zincirler için `"extends": "/abs/path/to/parent-team"` gibi lokal path'le pin'le.

---

## Bölüm 7 — SSS

**Kullanmak için takımı bir yere push'lamak zorunda mıyım?**
Hayır. `atl install`'u lokal path'ine yönlendir (atl ≥ 0.1.4). Lokal git repo'nda commit'ler yeter.

**Registry'ye submit etmek zorunda mıyım?**
Hayır. Registry sadece short-name ile keşfedilebilirlik için. Çoğu private / internal takım hiç submit etmez.

**Tek projede birden fazla takım kullanabilir miyim?**
Evet — `atl install a && atl install b && atl install c`. Her takımın öğeleri ortak `.claude/`'a symlink olur. İsimler çakışırsa atl uyarır (child takım parent'ı ezer; sonraki install öncekini ezer).

**atl hangi Markdown formatını kullanır?**
Düz Markdown, opsiyonel YAML frontmatter. Claude'un agent ve skill formatı doğrudan desteklenir.

**Skill'leri takımdan bağımsız versiyonlayabilir miyim?**
Bugün hayır. Versiyonlama takım seviyesinde `team.json.version` ile. Per-skill versiyonlama önerilen bir gelecek özelliği.

**Boyut sınırı var mı?**
Sert limit yok. Pratikte takım repo'ları 10 MB altı. Büyük binary'ler (CSS bundle, SVG sprite) gömüyorsan README'de bahset ki kullanıcı ne çektiğini bilsin.

---

## Ayrıca

- [team.json alan referansı](./team-json)
- [Miras (inheritance)](./inheritance) — var olan bir takımı genişletme
- [Scaffolder spec](./scaffolder-spec) — `/create-new-*` skill'i ekleme
- [Registry başvurusu](./registry-submission) — public yayınlama
- [`atl install` komutu](../cli/install) — tam CLI referansı
- [Referans schema](../reference/schema) — `team.json` için JSON Schema
