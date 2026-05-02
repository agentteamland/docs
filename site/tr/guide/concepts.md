# Kavramlar

AgentTeamLand'i oluşturan parçalar ve nasıl bir araya geldikleri.

## Takım

**Takım** bir pakettir. Claude Code ile belirli bir tür işi yapmak için gereken her şeyi bir arada sunar:

- **Agent'lar** — kendi bağlamı ve sorumluluk alanı olan uzmanlaşmış karakterler.
- **Skill'ler** — Claude Code'da kullanılabilir (slash) komutlar.
- **Rule'lar** — her oturumda otomatik yüklenen davranış kuralları ve konvansiyonlar.

Bir takım; kök dizininde `team.json` bulunan bir Git reposunda yaşar. Bu dosya takımı tanımlar: adı, versiyonu, içerdikleri, bağımlılıkları, extend ettiği parent.

Takımı bir projeye kurduğunda içeriği `.claude/` altında kopyalar olarak görünür. Claude Code bunu hemen görür.

## Agent

Agent, bir rolü tanımlayan Markdown dosyasıdır. `api-agent.md`, `flutter-agent.md`, `code-reviewer-agent.md` — her biri, kendine özgü sorumluluk alanı ve bilgi tabanı olan odaklı bir kişilik.

Karmaşık agent'lar için konvansiyon **children pattern**'idir: üst düzey `agent.md` kısa kalır (kimlik, sorumluluk, ilkeler) ve detaylı bilgi `children/` altında konu-başına-dosya olarak yaşar. Bu, üst dosyayı sıkı tutar ve tek bir konuyu güncellerken diğerlerine dokunmama maliyetini düşürür.

## Skill

Skill, kullanıcı tarafından çağrılan bir slash komutudur. `/create-new-project`, `/verify-system`, `/save-learnings`. Skill'ler; kök dizininde `skill.md` dosyası bulunan bir dizin olarak yayılır; bu dosya skill'in ne zaman ve nasıl kullanılacağını açıklar.

Skill'ler **global** (bootstrap ile gelir) veya **takıma özel** (belirli bir takımla gelir, sadece o takım kurulduğunda görünür) olabilir. `/create-new-project` ve `/verify-system` takıma özeldir çünkü yaptıkları iş her zaman stack'e özgüdür. `/brainstorm`, `/rule`, `/save-learnings`, `/wiki` globaldir çünkü her yerde geçerlidir.

## Rule

Rule, her Claude Code oturumuna otomatik yüklenen Markdown dosyasıdır. Skill'ten (çağrılmayı bekler) farklı olarak rule daima aktiftir — daha sen soru sormadan Claude'un projeyi nasıl düşüneceğini şekillendirir.

Global rule'lar `~/.claude/rules/` altında yaşar. Takımın sağladığı rule'lar, takım kurulduğunda projenin `.claude/rules/` dizinine kopya ile yerleşir.

## Registry

**Registry**; [`agentteamland/registry`](https://github.com/agentteamland/registry) adresindeki tek bir JSON dosyasıdır; takımların kısa adlarını Git URL'lerine eşler. `atl install software-project-team` çalıştırdığında, ad aranır, URL bulunur, kurulum oradan yapılır.

Registry'ye başvurular PR ile olur. CI her kaydı JSON schema'ya karşı doğrular, URL erişilebilirliğini denetler ve ad çakışmalarını işaretler.

## Miras (inheritance)

Bir takım başka bir takımı **extend edebilir**. Child, parent'ın agent, skill ve rule'larını miras alır; ad bazında **override** edebilir ve istemediklerini **exclude** edebilir.

```json
{
  "name": "my-team",
  "extends": "software-project-team@^1.0.0",
  "excludes": ["ux-agent"],
  "agents": [
    { "name": "api-agent", "description": "API konvansiyonlarımızı yansıtan özel agent." }
  ]
}
```

Kısıtlar:

- **Tek parent** — multiple inheritance yok.
- **Derinlik sınırsız** — zincirler istediği kadar uzun olabilir.
- **Circular detection** — `A extends B extends A` tam zincirle hata vererek fail eder.
- **Load order** — en derin ancestor önce, mevcut takım en sonda. Sana en yakın kazanır.

Tamamı: [Miras](/tr/authoring/inheritance).

## CLI

`atl`; kullanıcının yüzleştiği araçtır. Beş iş yapar:

- `atl install [team]` — mevcut projeye takım kur (registry adı veya Git URL ile).
- `atl list` — burada ne kurulu göster.
- `atl remove [team]` — kaldır.
- `atl update [team]` — bir veya tüm takımların son sürümünü çek.
- `atl search [query]` — registry'de ara.

Bakınız: [CLI genel bakış](/tr/cli/overview).

## Dizinler

**Proje**; `atl`'yi çalıştırdığın bir dizindir. İçine kurulan takımlara ait kopyalarle dolu bir `.claude/` alt dizini edinir.

**Önbellek** (`~/.claude/repos/agentteamland/`); gerçek takım repo'larını tutar — bir kez klonlanır, aynı takımı kuran her projede yeniden kullanılır. Önbelleği silmek güvenlidir; `atl update` onu yeniden doldurur.

## Claude Code ile ilişki

Claude Code, her oturum başında `.claude/` dizinini okur. Takımın buraya katkısı ne ise o an görünür hale gelir: delege edilebilir agent'lar, slash komut olarak skill'ler, her prompt'a yüklenen rule'lar.

AgentTeamLand, Claude Code'u ne değiştirir ne genişletir. O; Claude Code'un zaten okuduğu dosyalar için bir dağıtım katmanıdır, paket yönetimi katmanıdır.
