# Takım oluşturma

Sıfırdan bir takım kurmak yaklaşık on dakika sürer. Bu sayfa uçtan uca yürütür.

## 1. Git repo oluştur

```bash
mkdir my-team && cd my-team
git init -b main
```

Repo adı ne olursa olsun olabilir — kullanıcıların yazacağı **registry adı** (aşağıdaki `team.json`'da ayarlanır), repo adı değil. Ama aynı tutmak daha dost.

## 2. `team.json` yaz

```json
{
  "schemaVersion": 1,
  "name": "my-team",
  "version": "0.1.0",
  "description": "Next.js + Tailwind projeleri için görüşlü kurulum.",
  "author": "Sen <sen@example.com>",
  "license": "MIT",
  "keywords": ["nextjs", "tailwind", "typescript"],
  "agents": [
    { "name": "web-agent", "description": "Next.js sayfalarını inceler ve oluşturur." }
  ]
}
```

Tüm alanlar: [team.json](./team-json).

## 3. İçerikleri ekle

```
my-team/
├── team.json
├── agents/
│   └── web-agent.md
├── skills/
├── rules/
└── README.md
```

Tek-agent'lı basit bir takım için `agents/web-agent.md`; içinde agent talimatları olan düz bir Markdown dosyasıdır. Karmaşık bir agent için [**children pattern**](https://github.com/agentteamland/core/blob/main/rules/agent-structure.md) kullan:

```
agents/web-agent/
├── agent.md             ← kısa: kimlik, sorumluluk, ilkeler
└── children/
    ├── routing.md
    ├── data-fetching.md
    └── testing.md
```

## 4. CI'da schema validation ekle

`.github/workflows/validate.yml` dosyasına bunu koy:

```yaml
name: team.json doğrula
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
      - name: Schema'yı indir
        run: curl -sSfL https://raw.githubusercontent.com/agentteamland/core/main/schemas/team.schema.json -o team.schema.json
      - name: Doğrula
        run: ajv -s team.schema.json -d team.json --strict=false
```

Böylece bozuk `team.json` asla merge olmaz.

## 5. GitHub'a push et

```bash
git add .
git commit -m "feat: initial team"
git remote add origin https://github.com/sen/my-team.git
git push -u origin main
```

## 6. Bir release tagle

```bash
git tag v0.1.0
git push origin v0.1.0
```

Tag'ler SemVer'dir (`vX.Y.Z`). `v` öneki opsiyonel ama konvansiyon.

## 7. Yerel kurulumla test et

```bash
mkdir /tmp/test-project && cd /tmp/test-project
atl install https://github.com/sen/my-team.git
atl list
ls .claude/agents/
```

`web-agent.md`'yi sembolik link olarak orada görmelisin.

## 8. (Opsiyonel) Registry'ye gönder

Ancak takım stabil olduğunda ve başkalarının kısa adla keşfetmesini istediğinde. Bakınız: [Registry başvurusu](./registry-submission).

## 9. Sıradaki

- Sıfırdan yerine **mevcut bir takımı extend et** — [Miras](./inheritance).
- Kullanıcıların stack'inle proje başlatabilmesi için **scaffolder skill** ekle — [Scaffolder spec](./scaffolder-spec).
- `team.json` içindeki `version`'ı bump edip commit'leyip tag'leyerek **güncelleme yayımla**. Kullanıcılar `atl update` ile alır.

## İpuçları

- **Küçük başla.** Tek agent'lı takım da geçerli takımdır. Yayımla, geliştir.
- **Takımın sınırlarını belgele.** `README.md`; "bu takım X için, Y için değil" demeli ki kullanıcılar doğru nedenle kursun.
- **Pin'leme dikkatli.** Takımın başka takımı extend ediyorsa caret aralıkları (`^1.0.0`) kullan — tam pin değil — böylece upstream düzeltmeleri alırsın.
