# Scaffolder spec

**Scaffolder**; takımın stack'inde yeni proje başlatan, `/create-new-project` adındaki takıma-özel skill'dir. Bu sayfa, her scaffolder'ın uyması gereken standart şekli tanımlar.

::: tip Kaynak
Bu spec'in yetkili sürümü [`agentteamland/core/docs/scaffolder-spec.md`](https://github.com/agentteamland/core/blob/main/docs/scaffolder-spec.md) altında yaşar. Bu sayfa onu yansıtır; ayrıştıkları olursa `core` kazanır.
:::

## Neden spec?

Farklı takımlar çok farklı scaffolder'lar üretecek (.NET + Docker stack'i vs. Next.js + Sanity blog'u vs. Python + Jupyter veri projesi). Ama UX'in **şekli** tutarlı olmalı. Bir takımın scaffolder'ını öğrenen kullanıcı, başkasını kullanırken de evindeymiş gibi hissetmeli.

## Skill konumu

Takım reposunda:

```
{team-repo}/skills/create-new-project/skill.md
```

Ve `team.json` içinde:

```json
{
  "skills": [
    { "name": "create-new-project", "description": "Bu takımın stack'inde yeni proje başlat." }
  ]
}
```

`atl install <team>` ile skill otomatik olarak `.claude/skills/` altına bağlanır.

## Beş faz

Her scaffolder bu beş fazı sırayla yürütmek ZORUNDADIR:

### Faz 1 — Bilgi topla

Gerekenleri `AskUserQuestion` tool'u ile topla. Tipik sorular:

- Proje adı (argüman olarak verildiyse sormayı atla)
- Hangi uygulamalar / modüller / özellikler
- Deploy hedefleri, port offset'leri
- Lisans seçimi
- Stack'e özel toggle'lar (SaaS? Multi-tenant? Framework versiyonu?)

**Kurallar:**

- Soruları odaklı tut — 4–6 yeterli.
- Makul default'lar koy; en üstteki opsiyonu "Önerilen" olarak işaretle.
- Argümanın cevapladığı soruyu sorma.

### Faz 2 — Projeyi iskelele

Yeni projenin ihtiyacı olan her dosyayı yaz. Büyük scaffold'lar için paralel sub-agent'lara delege et — her biri bir ana konuya (API, frontend, infra, mobile, vb.).

**Checklist:**

- Kök dosyalar (`README.md`, `.gitignore`, dil-özgü lockfile'lar)
- Proje konfigürasyonu (`CLAUDE.md`, `.mcp.json`, `.env.example`)
- `.claude/` proje dizini (`agents/`, `skills/`, `rules/`, `docs/`, `brain-storms/`, `wiki/`, `journal/`, `backlog.md`)
- Source tree (uygulamayı gerçekten çalıştıran her şey)
- Container / deploy konfigürasyonu (varsa)

### Faz 3 — Build ve başlat (opsiyonel)

Stack'ta build adımı varsa (compile, `npm install`, `docker compose up`) onu koş:

- Compile et; hatada yüksek sesle fail et.
- Yerel servisleri başlat.
- Health check'lerin geçmesini bekle (30–60 saniye tipik).

Sadece template scaffolder'lar için bu fazı atla.

### Faz 4 — Doğrula (ZORUNLU)

`/verify-system`'i `Skill` tool çağrısı ile çalıştır. **Pazarlık yok.**

```
Skill(skill="verify-system")
```

Aynı takım, stack'i uçtan uca test etmeyi bilen kendi `/verify-system`'ini sunar. Scaffolder:

1. Skill'i `Skill` tool ile çağırmalı (inline bash ile değil).
2. Sonucu beklemeli.
3. Doğrulama geçmezse görünür biçimde fail etmeli.

### Faz 5 — Commit

Doğrulama geçtikten sonra:

```bash
git init -b main
git add .
git commit -m "chore: initial scaffold via create-new-project"
```

Remote'u ayarlama — remote'a push kullanıcının kararıdır.

## Çıktı sözleşmesi

Başarılı bir koşunun sonunda kullanıcı şunları içeren **final rapor** görür:

- Proje yolu
- Ne oluşturuldu (sayılar: dosya, servis, agent, skill, rule)
- Doğrulama sonucu (✅ geçti / ❌ ne fail etti)
- Sonraki adımlar (projeyi nasıl açacak, nasıl çalıştıracak, dokümanlar nerede)

## Fail modları

- **Faz 1 iptal** — kullanıcı ortada vazgeçer. Temiz çıkış, dosya yazılmaz.
- **Faz 2 hatası** — kısmi scaffold. Skill; ya geri dönmeli ya da kısmi tree'yi açık bir notla bırakmalı.
- **Faz 3 build hatası** — scaffold yerinde kalır; build hatası raporlanır; Faz 4'e **geçilmez**.
- **Faz 4 doğrulama hatası** — scaffold durur; kullanıcı neyin fail ettiği ve nasıl düzelteceği konusunda net bilgi alır.

## Onboarding UX

Hiç takım kurmadan `/create-new-project` yazan ilk-kullanıcı şunu görür:

```
Skill not found: create-new-project
```

Bu kasıtlı. `/create-new-project` her zaman stack-özeldir; dolayısıyla global jenerik sürümü yoktur. Kullanıcı önce takım kurması gerektiğini öğrenir — `npm create react-app` öncesi npm gerektirmesi gibi.

İleriki iş: `atl new-project <takım> <ad>` — önceden proje dizini gerektirmeden takımın scaffolder'ına dispatch edecek.

## İlgili

- **[Takım oluşturma](./creating-a-team)** — scaffolder skill'leri nerede yaşar.
- **[team.json](./team-json)** — skill'i nasıl kaydedersin.
- **[Kavramlar](/tr/guide/concepts)** — skill nedir.
