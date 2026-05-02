# Miras (inheritance)

Bir takım başka takımı extend edebilir. Mevcut bir takımın işini fork etmeden yeniden kullanmanın yolu budur.

## Temeller

```json
{
  "name": "my-team",
  "version": "0.1.0",
  "extends": "software-project-team@^1.0.0"
}
```

Hepsi bu kadar. Biri `atl install my-team` çalıştırdığında:

1. `atl` parent'ı çözümler (`software-project-team@^1.0.0`).
2. Parent rekürsif olarak kurulur (kendi `extends` zinciri de çözümlenir).
3. Child'ın kendi agent/skill/rule'ları parent'ın üzerine kurulur.

Kullanıcı; parent'tan gelen **ve** child'dan gelen tüm agent'larla kalır.

## Ad bazında override

Child; parent'taki bir agent ile aynı ada sahip bir agent getirirse child kazanır. Dosya birleştirme yok — tam replace.

```json
{
  "extends": "software-project-team@^1.0.0",
  "agents": [
    { "name": "api-agent", "description": "Stack'imiz için özel API konvansiyonları." }
  ]
}
```

Kurulumda, child'daki `agents/api-agent.md`; parent kopyasına işaret eden kopyain üzerine yazılır.

Aynı kural skill ve rule için de geçerli: ad çakışması ⇒ child kazanır.

## İstemediklerini exclude et

```json
{
  "extends": "software-project-team@^1.0.0",
  "excludes": ["ux-agent"]
}
```

Parent'taki `ux-agent` hiç kopya'e dönüşmez. Parent dosyası önbellekte durmaya devam eder (parent takım normal şekilde kurulu) — child sadece onu yüzeye çıkarmamayı seçer.

Agent'ları, skill'leri veya rule'ları ad bazında exclude edebilirsin.

## Sınırsız derinlik

Zincirler istediğin kadar derin olabilir:

```
grandchild-team
  └─ extends  child-team@^1.0.0
      └─ extends  software-project-team@^1.0.0
```

Kurulumda load order **en derin ancestor önce, mevcut takım en sonda** — sana en yakın takım her ad çakışmasını kazanır. Class inheritance ile aynı zihinsel model.

## Circular detection

`A extends B extends A`; kurulumda yakalanır ve tam zinciri hata mesajında yazarak fail eder. Sessiz sonsuz döngü yok.

## Sadece tek parent

Bir takımın en fazla bir `extends`'i olabilir. Multiple inheritance yok, diamond problem yok. İki takımdan parçalar istiyorsan her ikisini kur — veya birini `extends` et, diğerini `dependencies` altında tanımla.

## Version constraint'ler

`extends` değeri; `name` veya `name@version-constraint` biçimindedir. Desteklenen:

| Sözdizim | Eşleşir |
|---|---|
| `software-project-team` | en son |
| `software-project-team@^1.0.0` | `>=1.0.0 <2.0.0` — **önerilen** |
| `software-project-team@~1.2.0` | `>=1.2.0 <1.3.0` |
| `software-project-team@1.2.3` | tam olarak `1.2.3` |

Caret önerilen varsayılandır — patch düzeltmelerini ve yeni minor'ları alırsın, breaking `2.0.0` sinsice gelmez.

## Önceliklendirme sırası

`atl install` kopyalari çözerken, sonraki girişler öncekileri override eder:

1. Ancestor'lar (en derin önce, en yakın sonra).
2. Mevcut takım.
3. Uygulanan excludes (listedekiler düşer).

## Uygulamalı örnek

Parent `software-project-team@1.0.0`:

```
agents: api-agent, flutter-agent, react-agent, ux-agent, ...
skills: create-new-project, verify-system
rules:  commit-style
```

Child `my-team@0.1.0`:

```json
{
  "extends": "software-project-team@^1.0.0",
  "excludes": ["ux-agent"],
  "agents": [
    { "name": "api-agent", "description": "Override — kendi API konvansiyonlarımız." },
    { "name": "analytics-agent", "description": "Yeni — Mixpanel + GA enstrümantasyonu." }
  ]
}
```

`atl install my-team` sonrası:

```
.claude/agents/
├── api-agent.md         → my-team/agents/api-agent.md         (override)
├── flutter-agent.md     → software-project-team/agents/flutter-agent.md
├── react-agent.md       → software-project-team/agents/react-agent.md
├── analytics-agent.md   → my-team/agents/analytics-agent.md   (yeni)
└── (ux-agent yok)                                             (excluded)
```

Skill ve rule da aynı süreci izler.

## Extend mi fork mu?

- Parent'ın kararlarının %70+'ına katılıyorsan ve upstream güncellemeleri istiyorsan **extend et**.
- Temel kararlara katılmıyorsan (farklı dil, farklı mimari) **fork et** — bu noktada extend etmek tasarruf ettirdiğinden fazla maliyet getirir.

## Sıradaki

- **[team.json referansı](./team-json)** — her alan.
- **[Takım oluşturma](./creating-a-team)** — tam yürüyüş.
