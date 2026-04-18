# Registry başvurusu

Takımını herkese açık registry'de listelemek, ona kısa ad verir (`atl install takim-adin` — URL ile değil). Registry, PR ile bakılan tek bir JSON dosyasıdır.

## Registry nedir?

[`agentteamland/registry`](https://github.com/agentteamland/registry) tek bir dosya tutar: `teams.json`. Her kayıt; kısa adı bir Git URL'i ve metadata'ya eşler:

```json
{
  "teams": [
    {
      "name": "software-project-team",
      "url": "https://github.com/agentteamland/software-project-team",
      "status": "verified",
      "description": ".NET 9 API + Flutter + React + tam Docker stack",
      "keywords": ["dotnet", "flutter", "react", "docker"]
    }
  ]
}
```

## Başvurmadan önce

Takımın şunlar olmalı:

1. **Git URL'den kurulabilir** — `atl install https://github.com/sen/takimin.git` uçtan uca çalışıyor.
2. **Schema geçerli** — `team.json` validation'dan geçiyor. [Takım oluşturma](./creating-a-team)'yı izlediysen her repo bu kontrolü CI'da zaten alıyor.
3. **Belgeli** — repo'nun `README.md`'si kullanıcıya takımın ne için olduğunu ve nasıl kullanılacağını anlatıyor.
4. **Tag'li** — en az bir SemVer tag (`v0.1.0` veya üstü).

## Adımlar

1. `agentteamland/registry` repo'sunu **fork et**.

2. `teams.json` içindeki `teams` dizisine kaydını **ekle**. Dizi `name` alanına göre alfabetik olsun.

   ```json
   {
     "name": "takimin",
     "url": "https://github.com/sen/takimin",
     "status": "community",
     "description": "Tek cümlelik tanıtım. atl search'te görünür.",
     "keywords": ["ne", "hakkinda"]
   }
   ```

   Alanlar:
   - `name` — `team.json`'daki `name` ile uyuşmalı.
   - `url` — Git HTTPS URL'i (`.git` son eki şart değil).
   - `status` — yeni başvurular `"community"` ile başlar. Bakımcılar inceleme sonrası `"verified"`'a yükseltir.
   - `description` — kullanıcı-yüzlü tek cümle (`team.json` `description` ile aynı).
   - `keywords` — `atl search` eşleşmesi için.

3. **PR aç.** CI doğrulayacaklar:
   - JSON schema uyumu
   - `url`'nin `team.json`'u 200 ile getirdiği
   - Getirilen `team.json`'un takım schema'sına uygun olduğu
   - `name` benzersizliği (registry'de çift yok)

4. **İncelemeyi bekle.** Bakımcılar, takımın var olduğunu, kurulduğunu ve söylediğini yaptığını kontrol eder. Verified statüsü inceleme sonrası verilir.

## Statü yaşam döngüsü

- **`community`** — listeli ve kurulabilir, henüz incelenmemiş. Her başvuru buradan başlar.
- **`verified`** — AgentTeamLand bakımcıları tarafından incelendi; temiz kurulması ve konvansiyonlara uyması beklenir. Bakımcılar takip eden bir PR ile yükseltir.
- **`deprecated`** — artık bakılmıyor. Hâlâ kurulabilir, ama kullanıcılar uyarı görür. Tipik olarak takım yazarı repo'yu arşivlediğinde veya takım yeniden yazımla değiştirildiğinde.

## Takımı kaldırma

Takımının registry'den çıkarılmasını istiyorsan, kaydını silen bir PR aç. Zaten kurmuş olanlar Git URL'i ile devam edebilir.

## Kaydı güncelleme

Registry PR'larına yalnızca metadata değişiklikleri girer — **versiyon değil**. Versiyon çözümü dinamiktir: `atl`, kurulum/güncelleme anında takımın kendi tag'lerini okur. Registry PR'ı yalnızca description, keywords, URL veya status değiştiğinde gerekir.

## Sorular?

[`agentteamland/registry` issues](https://github.com/agentteamland/registry/issues) açılır.

## İlgili

- **[Takım oluşturma](./creating-a-team)** — registry öncesi checklist.
- **[team.json](./team-json)** — registry'nin karşı-doğrulama yaptığı schema.
