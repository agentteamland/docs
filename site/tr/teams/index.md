# Onaylı Takımlar

AgentTeamLand resmi registry'si şu an **2 onaylı takım** içeriyor. Her takım bağımsız versiyonlanıyor, topluluk katkısına açık ve [team.json şemasına](/tr/authoring/team-json) uyuyor.

> **Onaylı (verified) statüsü** AgentTeamLand maintainer'ların takımı kalite, kapsam ve bağımlılık hijyeni açısından gözden geçirdiğini ifade eder. Topluluk katkısı takımlar (status: `community`) install sırasında uyarı ile gelir.

## Göz at

| Takım | Versiyon | Açıklama |
|-------|----------|----------|
| [`software-project-team`](/tr/teams/software-project-team) | 1.1.0 | Full-stack yazılım projeleri için 13 uzmanlaşmış agent (.NET 9 + Flutter + React + Postgres + RabbitMQ + Redis + Elasticsearch + MinIO). |
| [`design-system-team`](/tr/teams/design-system-team) | 0.3.1 | Herhangi bir projenin içinde design system'ler ve UI prototype'ları — local, dosya tabanlı, tarayıcıda görüntülenebilir. `/dst-*` skill'leri JSON state + Tailwind-render HTML üretir, `.dst/` altına yazar. |

## Herhangi bir takımı yükle

```bash
atl install <takim-adi>
```

Yukarıdaki her iki takım da kısa isimle yüklenebilir. atl ismi public registry'den çözer, depoyu paylaşımlı cache'e (`~/.claude/repos/agentteamland/`) klonlar.

## Tek projeye birden fazla takım yükle

İki takım aynı projede temiz şekilde bir arada yaşar — `atl` v0.1.2+ multi-team install destekler, çakışma uyarılarıyla (iki takım aynı isimli bir öğeyi declare ederse en son yüklenen kazanır, tek satır uyarı verilir).

```bash
cd your-project
atl install software-project-team       # full-stack agent'lar + scaffolder
atl install design-system-team          # design-system + prototype araçları ekle

atl list
# ✓ software-project-team@1.1.0    13 agents, 3 skills
# ✓ design-system-team@0.3.1        2 agents, 8 skills (dst-*)
```

İkisi birbirini tamamlar: `/dst-*` skill'leri ile tasarla, software-project-team agent'ları (flutter-agent, react-agent, vs.) ile implement et.

## Bir takım katkıda bulun

Kendi takımını yayınlamak ister misin? [Takım yazımı rehberine](/tr/authoring/creating-a-team) bak — bir `team.json` yaz, public bir git repo'ya push et, [registry](https://github.com/agentteamland/registry)'e PR aç.
