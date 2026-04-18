# `atl search`

Herkese açık registry'de arama yapar.

## Kullanım

```bash
atl search <sorgu>
```

`<sorgu>`; takımın adı, açıklaması ve anahtar kelimeleriyle eşleşir. Büyük/küçük duyarlılığı yok, substring bazlı; regex değil.

## Örnek

```bash
atl search dotnet
```

```
AD                     DURUM      AÇIKLAMA
─────────────────────────────────────────────────────────────────────────
software-project-team  verified   .NET 9 API + Flutter + React + tam Docker stack
```

Durum etiketleri:

- **`verified`** — AgentTeamLand bakımcıları tarafından incelendi. Temiz kurulması ve konvansiyonlara uyması beklenir.
- **`community`** — registry'de listeli, henüz incelenmemiş. Çalışır, ama riski sana ait.
- **`deprecated`** — hâlâ kurulabilir ama artık bakılmıyor. Uygun zamanda göç et.

## Boş sorgu

Sorgu vermeden `atl search` çalıştırmak registry'nin tamamını alfabetik olarak yazar.

## Çevrimdışı davranış

İlk çekimden sonra registry yerel olarak önbelleğe alınır. `atl search` çevrimdışı da çalışır; sonuçların bayat olabileceğini açıkça yazar.

## Sonuç yok mu?

Registry PR ile yönetilen genç bir yapı — domain'in henüz kapsanmamış olabilir. Seçenekler:

- Git URL'yi doğrudan kullan: `atl install https://github.com/sen/takimin.git`
- Kendi takımını yayınla: [Takım oluşturma](/tr/authoring/creating-a-team)
- Registry'ye gönder: [Registry başvurusu](/tr/authoring/registry-submission)

## İlgili

- [`atl install`](/tr/cli/install) — bulduğun takımı kur.
- [Registry başvurusu](/tr/authoring/registry-submission) — takımını listele.
