# Karpathy guidelines

Platform tarafından her Claude Code session'ına yüklenen davranış rehberleri. Yaygın LLM kodlama hatalarını azaltır — gizlenen varsayımlar, overengineering, drive-by edit'ler ve muğlak execution.

2026-04-22'de AgentTeamLand `core@1.1.0`'a platform-wide rule olarak eklendi, böylece her mevcut ve gelecekteki takım otomatik miras alır (per-team duplication yok). Kaynak: [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) — [Andrej Karpathy'nin LLM kodlama tuzakları üzerine gözlemlerinden](https://x.com/karpathy/status/2015883857489522876) türetildi. MIT-licensed.

## Neden platform seviyesinde bir kural

Kendi haline bırakılan LLM'ler şunları yapma eğiliminde:

- **Confusion'larını gizlerler** sormak yerine ("birini seçeyim")
- **Overengineer ederler** ("ileride lazım olur diye esnek bir abstraction")
- **Drive-by edit yaparlar** istenen değişikliği yaparken yan koddaki şeyleri de düzenlerler
- **Muğlak execute ederler** net success kriteri olmadan

Bu dört pattern observable failure mode — vibe değil. Karpathy'nin ilkeleri bunları doğrudan hedefler. Her session'a yüklemek friction'ı kaydırır: trivial task'larda biraz hız maliyeti getirir ama non-trivial olanlarda gerçek zaman kazandırır (daha az rewrite, daha az scope creep, daha az "dur, neden o dosyayı da değiştirdin?" anı).

> **Tradeoff:** Bu rehberler hıza karşı dikkati öne çıkarır. Trivial task'lar için yargı kullan.

## Dört ilke

### 1. Think Before Coding

> **Varsayma. Confusion'ı gizleme. Tradeoff'ları yüzeye çıkar.**

Implement etmeden önce:

- Varsayımlarını açıkça belirt. Emin değilsen sor.
- Birden fazla yorum varsa, sun — sessizce seçme.
- Daha basit bir yaklaşım varsa, söyle. Gerektiğinde push back et.
- Bir şey net değilse, dur. Neyin kafa karıştırıcı olduğunu adlandır. Sor.

### 2. Simplicity First

> **Problemi çözen minimum kod. Speculative hiçbir şey.**

- İstenen ötesinde feature yok.
- Tek-kullanımlık kod için abstraction yok.
- İstenmemiş "esneklik" veya "configurability" yok.
- İmkansız senaryolar için error handling yok.
- 200 satır yazıyorsan ve 50 olabilirse, yeniden yaz.

Self-test: "Senior engineer bunu overcomplicated bulur muydu?" Evet ise, basitleştir.

### 3. Surgical Changes

> **Yalnızca dokunman gerekene dokun. Sadece kendi pisliğini temizle.**

Mevcut kodu düzenlerken:

- Yan koda, comment'lara veya formatting'e "iyileştirme" yapma.
- Bozuk olmayan şeyleri refactor etme.
- Sen farklı yapardın bile olsa mevcut style'ı eşle.
- İlgisiz dead code görürsen, bahset — silme.

Değişikliklerin orphan yarattığında:

- SENİN değişikliklerinin kullanılmaz hale getirdiği import / variable / function'ları kaldır.
- İstenmedikçe önceden var olan dead code'u kaldırma.

Test: değişen her satır kullanıcının request'ine doğrudan trace etmeli.

### 4. Goal-Driven Execution

> **Success kriteri tanımla. Doğrulanana kadar loop'la.**

Task'ları doğrulanabilir hedeflere dönüştür:

| Muğlak | Goal-driven |
|---|---|
| "Validation ekle" | "Geçersiz input için test yaz, sonra geçir" |
| "Bug'ı düzelt" | "Bug'ı reproduce eden test yaz, sonra geçir" |
| "X'i refactor et" | "Önce ve sonra test'lerin geçtiğini garanti et" |

Çok-adımlı task'lar için kısa bir plan belirt:

```
1. [Adım] → doğrulama: [check]
2. [Adım] → doğrulama: [check]
3. [Adım] → doğrulama: [check]
```

Güçlü success kriterleri agent'ın bağımsız loop'lamasına izin verir. Zayıf kriterler ("çalıştır işte") sürekli netleştirme gerektirir.

## Çalışma sinyalleri

Bu rehberlerin etkili olduğunu şuradan anlarsın:

- **Diff'ler küçülür.** PR başına daha az gereksiz değişiklik.
- **Rewrite'lar kaybolur.** "Aslında, basitleştir lütfen"den daha az gidip-gel.
- **Netleştirme soruları** öne gelir, yanlış implementation'dan sonra değil.

Atlandığını şuradan anlarsın:

- Agent varsayım yapar ve sonra özür diler.
- Agent tek call site'lı bir abstraction ship eder.
- Agent'ın diff'i ilgisiz formatting değişiklikleri içerir.
- Agent'ın planı "yol giderken çözerim".

## Projene nasıl ulaşır

Kural [`core/rules/karpathy-guidelines.md`](https://github.com/agentteamland/core/blob/main/rules/karpathy-guidelines.md)'de yaşar. [`atl install`](/tr/cli/install) çalıştırmış her proje (herhangi bir takım) `core` cache üzerinden auto-install alır, ve `atl update` [project-local copy refresh modeli](/tr/cli/update#neyi-g%C3%BCnceller) üzerinden günceli tutar.

Kural her session başında Claude'un context'ine yüklenir ([knowledge-system architecture](https://github.com/agentteamland/core/blob/main/rules/knowledge-system.md) gereği) — per-prompt invocation gerekmez.

## Daha derinlere

- Upstream paired examples (her ilke için yan-yana wrong/right kod): [EXAMPLES.md](https://github.com/forrestchang/andrej-karpathy-skills/blob/main/EXAMPLES.md)
- Orijinal Karpathy thread: [@karpathy on X](https://x.com/karpathy/status/2015883857489522876)
- Kuralın source-of-truth'ı (session'larına yüklenen): [core/rules/karpathy-guidelines.md](https://github.com/agentteamland/core/blob/main/rules/karpathy-guidelines.md)

## İlgili

- [team-repo-maintenance](/tr/authoring/team-repo-maintenance) — shared repo work'ünde bu kodlama rehberleriyle eşleşen governance disiplini
- [Kavramlar: Rule](/tr/guide/concepts#rule) — rule'lar nedir ve nasıl yüklenir
