# atl nedir?

`atl`, **AI agent takımlarını** bir projeye kuran komut satırı aracıdır — tıpkı `npm`'in JavaScript paketlerini veya `brew`'un Unix binary'lerini kurması gibi.

## Problem

Claude Code'u iyi kullanmak için konfigürasyon gerekir: modelin senin kod tabanın hakkında nasıl düşündüğünü şekillendiren agent'lar, skill'ler ve rule'lar. Bu dosyaları projeler arasında kopyalamaya başlıyorsun, başkasının kurulumunu fork ediyorsun ve zamanla hepsinin birbirinden uzaklaştığını görüyorsun. Her yeni proje, bir öncekinin zaten çözdüğü sorunları tekrar çözüyor.

## Cevap

Bir **takım**; belirli bir tür iş etrafında organize edilmiş agent, skill ve rule paketidir. Bir takım; Docker Compose üretim düzeniyle bir .NET + Flutter + React stack'ine yönelik olabilir. Başka biri; Next.js + Sanity + Vercel blog stack'ine yönelik. Üçüncüsü; Airflow ve dbt ile veri pipeline'larına.

`atl install some-team` takımı indirir, önbelleğe alır ve içindeki agent/skill/rule'ları bulunduğun projenin `.claude/` dizinine sembolik link ile bağlar. Editor'ü açtığın an Claude Code takımı görür.

Takımın yazarı bir düzeltme yayımladığında `atl update` çalıştırırsın ve o takımı kullanan her proje değişikliği alır. Projelerin birbirinden ayrışmayı bırakır.

## Fork değil

Takımlar başka takımları **extend edebilir**. `software-project-team`'in %95'ini istiyor ama bir agent'ı farklı olsun ve bir skill daha eklemek istiyorsan, onu `extends` eden ufak bir takım yazarsın, o bir agent'ı override edersin, skill'i eklersin. Parent kendi repo'sunda gelişmeye devam eder; child bedava güncellenir.

## Kapalı bahçe de değil

Her takım; kök dizininde `team.json` dosyası bulunan bir Git reposundan ibaret. Takımların `software-project-team` gibi kısa adlara kavuşması için herkese açık bir [registry](https://github.com/agentteamland/registry) var, ama istediğin herhangi bir Git URL'inden de kurabilirsin. Schema herkese açık. CLI, MIT lisanslı Go ile yazıldı. Spec burada belgeli.

## Kim için?

- Her proje için `.claude/` dizinini sıfırdan düzenlemek istemeyen **geliştiriciler**.
- Şirketlerinin Claude kullanımını tüm repo'larda standartlaştırmak ve yeni mühendisleri dakikalar içinde onboard etmek isteyen **takım liderleri**.
- Framework yazarlarının bugün CLI yayınladığı gibi, fikri olan agent takımları yayınlamak isteyen **stack yazarları**.

## Mevcut durum

`atl` **v0.1.x**'te — erken ama gerçek. Bir takım (`software-project-team`) üretim düzeyinde 13 agent'lık bir paket sunuyor ve en az bir gerçek ürünün yapımında kullanılıyor. Ekosistem MIT lisanslı ve PR'lara açık.

Sıradakiler:
- **[`atl`'yi kur](/tr/guide/install)**
- **[Hızlı başlangıç — 60 saniyede çalışan bir takım](/tr/guide/quickstart)**
