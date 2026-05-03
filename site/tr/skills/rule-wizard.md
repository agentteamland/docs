# `/rule-wizard`

Bir kural eklemeden önce **option-based Q&A round'ları** kullanan clarification wizard. [`/rule`](/tr/skills/rule)'u doğrudan kullanırken kolayca gözden kaçan detayları yakalar — edge case'ler, istisnalar, alternatif formülasyonlar, scope, motivation, örnek varyantları — ve konuşmanın aslında *birden fazla* kuralla ilgili olduğunu dinamik olarak detect eder.

Tartışma tamamlanınca, wizard finalize edilen metni `/rule`'a verir kuralı doğru dosyaya yazsın diye.

Global skill olarak [rule](https://github.com/agentteamland/rule)'da gelir.

## Hangi durumda hangisi

| Skill | Ne zaman |
|---|---|
| [`/rule`](/tr/skills/rule) | Kural net; tek cümlede, bilinen scope ve bilinen why ile ifade edebiliyorsun. |
| `/rule-wizard` | Kural muğlak. Alanı biliyorsun ama tam wording'i bilmiyorsun. Bir istisnayı, ilgili bir kuralı kaçırmadığından veya aslında *iki* kuralın tek şemsiyenin altına gizlendiğinden emin olmak istiyorsun. |

## Zorunlu argüman

`/rule-wizard` bir **context** ister — topic, ilk fikir veya karşılaşılan problemi açıklayan kısa bir metin (herhangi bir dil):

- ✅ `/rule-wizard API'de logging kullanımı`
- ✅ `/rule-wizard Worker doğrudan DB'ye bağlanmamalı`
- ✅ `/rule-wizard Controller'lar try-catch yazmamalı; global handler devralır`
- ❌ `/rule-wizard` — context olmadan çağrıldı, wizard reddeder ve context ister

## Üç scope

[`/rule`](/tr/skills/rule#üç-scope) ile aynı: project (default), `--global`, `--team`. Flag verilmişse wizard scope sorusunu atlar.

## Faz 1 — anlama ve hazırlık

### 1.1 Mevcut kuralları oku (zorunlu)

Soru sormadan **önce** oku:

- `.claude/rules/coding-common.md`
- `.claude/docs/coding-standards/` altındaki tüm `.md` dosyaları (dinamik listele)

Amaç:

- **Duplication önleme** — aynı veya çok benzer bir kural zaten var mı?
- **Conflict detection** — yeni kural mevcut bir kuralla çelişiyor mu?
- **Extension fırsatı** — mevcut bir kurala bullet olarak eklenebilir mi?
- **Cross-reference** — final `Related` alanını besleyecek kural ID'leri

### 1.2 Context'i analiz et (sessizce)

Kullanıcının context'inden içsel olarak türet:

- Olası scope (hangi app(ler)? ortak mı tek mi?)
- Olası intent (mandatory `must` / prohibitive `must not` / advisory `should`?)
- Etkilenen katmanlar (Controller, Service, Repository, Consumer, Hub, Job?)
- `Apply when`, `Why`, `Examples` için ilk hipotezler
- 1.1'den benzer mevcut kuralların ID'leri

### 1.3 Analiz özetini sun

Kullanıcıya kısa bir paragraf:

> "Anladığım kadarıyla API controller'ların try-catch bloğu içermesini istemiyorsun ve error handling'in üst katmandaki global handler'a delege edilmesini istiyorsun. Bu `coding-standards/api.md` scope'una düşüyor ve mevcut `no-logic-in-bridges` kuralını tamamlıyor. Şimdi birkaç soruyla detayları netleştireceğim."

Sonra Faz 2'ye geç.

## Faz 2 — option-based questioning

### Temel ilkeler (hepsi bağlayıcı)

1. **Her soru `AskUserQuestion` kullanır.** Düz-metin açık-uçlu soru yok.
2. **Her sorunun 2–4 seçeneği var.** Platform limit 4. Daha fazla makul seçenek varsa, soruyu **böl**; "en iyi 4" ile sınırlama.
3. **"Other" seçeneği otomatik.** Tool ekler; explicit yazma.
4. **Önerilen seçenek varsa önce yerleştir** label'da `(Recommended)` ve `description`'da kısa neden.
5. **Sorular ve seçenekler için kullanıcının dilini eşle.** `/rule` final adımda İngilizce'ye çevirecek — wizard kullanıcının dilini aynalar.
6. **Round başına maksimum 4 soru.** 4'ten fazlaysa → round'lara böl; sonraki round'lar önceki cevapları kullanabilir.
7. **Context'ten net türetilen alanları yeniden sorma.** Bunun yerine confirmation sorusu: "X olarak anladım — doğru mu?" (binary).
8. **Seçenekler distinct ve net olmalı.** İki seçenek neredeyse aynıysa birini kaldır.

### Kapsanacak alanlar

Her kural için (Q&A ile) netleştir:

#### A) Scope — nereye yazılsın?

(`--global` veya `--team` set ise atlanır.)

Project scope seçilirse alt-soru: hangi uygulama? (mevcut `.claude/docs/coding-standards/{app}.md` dosyalarını dinamik listeler + bir "common" seçeneği).

Team scope seçilirse alt-soru: hangi agent'ın knowledge base'i? (kurulu takım agent'larını listeler + "team-wide rule" seçeneği).

#### B) Tek-cümle kural ifadesi

Context'ten 3 alternatif formülasyon, her biri farklı tonda / kısıtlamada:

- **Strict prohibition** ("X asla yapılmamalı")
- **Advisory** ("X için Y kullan")
- **Conditional** ("X yalnızca Y olduğunda yapılabilir")

Kullanıcı kendi cümlesini "Other" üzerinden yazabilir.

#### C) Motivation (Why)

Context-driven listeden multi-select: geçmiş hatadan ders (specify), mimari tutarlılık, testability, performans, güvenlik, okunabilirlik, regulation. Birincil motivation önce.

#### D) Apply when (trigger koşulları)

Context'ten 2–4 specific trigger. Her seçenek **somut bir file path veya code pattern** içerir (örn. controller action'lar için `api/Controllers/*.cs`). Trigger'lar üst üste binebiliyorsa multi-select.

#### E) Don't apply when (istisnalar, opsiyonel)

Seçenekler: istisna yok / test code muaf / legacy veya generated code muaf / Other. "İstisna yok" seçilirse alan final kuraldan çıkarılır.

#### F) Examples

İki soru: ✅ doğru örnek + ❌ yanlış örnek. Her biri 2–3 kısa senaryo sunar; kullanıcı birini seçer veya kendi yazar.

#### G) İlgili kurallar (opsiyonel)

Faz 1.1'de bulunan benzer-kural ID'lerini + bir "None" seçeneği listeler.

### Önerilen round'lar

- **Round 1 (temeller):** Scope + Rule statement + Motivation — 3 soru
- **Round 2 (davranış):** Apply when + Exception + ✅ Example — 3 soru
- **Round 3 (cila):** ❌ Example + Related + (gerekirse) edge case — 2–3 soru

Alanlar net türetildiğinde round'lar küçülür; belirsizlik sürdüğünde ekstra sorular eklenir. Kullanıcı bir round'da aynı cevabı iki kez vermek zorunda kalmaz.

## Faz 3 — dinamik çoklu-kural detection

Wizard **tek-kural varsayımıyla başlar.** Ama questioning sırasında şu sinyallerden biri görülürse, hemen kullanıcıya bir distinction sorusu sor:

| Sinyal | Önerdiği |
|---|---|
| Scope'ta iki farklı uygulama seçildi ve doğaları farklı | Tek görünüp aslında iki kural |
| Apply-when trigger'ları iki ilgisiz kod katmanına işaret ediyor | İki kural |
| Rule ifadesi iki bağımsız yasak içeriyor ("X yapılmamalı, Y de yapılmamalı") | İki kural |
| Örnekler tek bir kuralla açıklanamıyor | İki kural |
| Motivation multi-select'inde iki bağımsız gerekçe seçildi | İki kural |

### Distinction sorusu

```
"Bu context aslında iki farklı kural gibi görünüyor. Nasıl ilerleyelim?"
```

Seçenekler:

- **(Recommended)** İki ayrı kural olarak ekle — her birini ayrı ayrı netleştirelim
- Tek kural olarak tut — Rule ifadesini iki maddeyi de kapsayacak şekilde genişlet
- Şimdilik birine odaklan, diğerini sonra ele al
- Misidentified — bu aslında tek kural

### Karar sonrası akış

- **İki ayrı kural** → her biri için Faz 2'yi bağımsız tekrarla. Soru round'larını karıştırma.
- **Tek kural olarak tut** → Rule ifadesi sorusunu iki maddeyi de birleştiren formülasyonlarla yeniden sor.
- **Sadece birine odaklan** → Faz 4 sonunda "Diğer kuralı şimdi ele alalım mı?" teklif et.
- **Misidentified** → normal akışa dön, sinyali yoksay.

## Faz 4 — konsolidasyon ve final onay

### 4.1 Final kural metnini üret

Toplanan cevaplardan kullanıcının dilinde **doğal-dil** kural metni oluştur. Bu metin **`/rule` skill için input** olur — `/rule` İngilizce çevirisi + structured-format parsing'i yapar.

Metin `/rule`'un parse edeceği her şeyi içermeli: Scope, Rule, Why, Apply when, Don't apply when (uygulanabildiyse), Examples (✅ + ❌), Related (uygulanabildiyse).

Örnek (TR-language wizard, English-final-rule):

> "Controller actions in the API project should not write try-catch blocks — error handling must be delegated to the global exception handler at the upper layer. This rule exists to preserve architectural consistency and to keep controllers as thin bridges; try-catch is the responsibility of services or the global handler. Applies to: all controller actions in `.cs` files under `api/Controllers/`. Test code is exempt. Correct example: `[HttpPost] public async Task<IActionResult> Create(CreateProductRequest req) { var result = await _productService.CreateAsync(req); return Ok(result); }` — no try-catch. Wrong example: writing `try { ... } catch (Exception ex) { return BadRequest(ex.Message); }` inside a controller. Related rule: `no-logic-in-bridges`."

### 4.2 Kullanıcıya göster, onay al

Final-rule metnini göster ve `AskUserQuestion` ile sor:

```
"Bu metin kuralın final versiyonu mu? Şimdi /rule ile ekleyeyim mi?"
```

Seçenekler:

- **(Recommended)** Evet, `/rule` ile ekle
- Metnin bir kısmını düzeltmem lazım — hangi kısım söyleyeyim
- Eksik bir alan var sanırım — başka bir soru round'u yapalım
- İptal et, şimdilik ekleme

### 4.3 `/rule`'u çağır

Kullanıcı onay verince:

- **Tek kural** → `/rule <final text>` çağır.
- **Birden fazla kural** → her birini **sırayla** çağır, kısa progress notification ile: "Birinci kural yazıldı (`{id}` → `{file}`). Şimdi ikinci kurala geçiyorum."
- Her `/rule` çağrısından sonra sonucu özetle.

Kullanıcı düzeltme isterse → ilgili soruyu yeniden sor, final metni güncelle, 4.2'ye dön.

Kullanıcı ek round isterse → eksik alan için bir soru round'u çalıştır, 4.1'e dön.

Kullanıcı iptal ederse → temiz şekilde sonlandır. Hiçbir dosyaya yazma. Bilgilendir: "Kural yazılmadı. İstediğin zaman `/rule-wizard` ile yeniden başlayabilirsin."

### 4.4 Final özet

Sonda tek mesaj:

- Kaç kural yazıldı
- Her kuralın ID + dosyası
- İlgili olarak işaretlenen mevcut kurallar (varsa)
- Faz 3'te sonraya bırakılan deferred kural varsa hatırlatma

## Kritik ilkeler

1. **Context zorunlu.** Skill argümansız çalışmaz.
2. **Her sorunun seçeneği var.** Sadece `AskUserQuestion`.
3. **4 seçenek yetmiyorsa böl.** Asla "en iyi 4" ile sınırlama.
4. **Mevcut kuralları önce oku.** Zorunlu prerequisite.
5. **Asla varsayma.** Context'ten net türetilmemiş her alan soru gerektirir.
6. **Çoklu kuralları dinamik detect et.** Tek başla, divergence sinyalleri görünce sor.
7. **Final metin kullanıcının dilinde.** `/rule` İngilizce'ye çevirir.
8. **Onay olmadan `/rule` çağrılmaz.** Kullanıcı final metni görür ve onaylar.
9. **Eksik alan, var olmayan alandan kötüdür.** Zorunlu alanlar (Rule, Why, Apply when, Examples) tam temsil edilmeli.
10. **Skill birden fazla kural için tekrar tekrar çalışabilir.** Faz 3'te split mode seçilirse, her kural Faz 2–4 döngüsünden ayrı geçer.

## İlgili

- [`/rule`](/tr/skills/rule) — Faz 4'te finalize edilen kuralı yazmak için çağrılır
- [Kavramlar: Rule](/tr/guide/concepts#rule) — rule'lar nedir ve nasıl yüklenir

## Kaynak

- Spec: [rule/skills/rule-wizard/skill.md](https://github.com/agentteamland/rule/blob/main/skills/rule-wizard/skill.md)
