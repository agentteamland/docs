# SSS

### `atl` neyin kısaltması?

**A**gent**T**eam**L**and. CLI, org ve ekosistem aynı adı paylaşır.

### `atl`, Claude Code'un yerine geçer mi?

Hayır. `atl`; Claude Code'un `.claude/`'tan zaten okuduğu dosyalar için bir dağıtım katmanıdır. Claude Code'u eskisi gibi çalıştırırsın; `atl` sadece sağlam bir konfigürasyona hızlı ulaşmanı sağlar.

### Bu, sadece dosyaları projeler arası kopyalamaktan nasıl farklı?

Üç şekilde:

1. **Versiyonlama.** Takımlar SemVer tag'ler. Versiyona pin'lersin; güncellemeler `atl update` ile opt-in.
2. **Miras.** Başkasının takımını fork etmeden üzerine inşa edebilirsin. Onlar iyileştirme yayınladığında sen de alırsın.
3. **Erişim.** Bir takımı bir kez yayımlamak; onu `atl install takimin` çalıştıran her Claude Code kullanıcısına ulaştırır.

### Claude Code kullanmak için `atl` zorunlu mu?

Hayır. Claude Code `atl` olmadan da çalışır. `atl`'yi, tekrarlanabilir ve paylaşılabilir bir kurulum istediğinde kullan — elle düzenlenmiş `.claude/` ile tek kişilik projeler hâlâ son derece geçerli.

### Aynı projede birden fazla takım kurabilir miyim?

Evet. Her kurulum kendi kopyalarini `.claude/` altına ekler. İki takım aynı adla bir agent sunuyorsa **ikinci kurulan** takımın versiyonu kazanır (ilk kopyain üzerine yazılır). Her kopyai hangi takımın sahiplendiğini `atl list` ile görebilirsin.

### Private Git repo'larından takım kurabilir miyim?

Evet — Git client'ın repo'yu klonlayabildiği sürece (SSH key, PAT, vb.). `atl`; Git kimlik bilgilerini kendi yönetmez, shell'in Git kurulumuna delege eder.

### `atl` versiyonum bir takım için çok eski ise?

Takımın `team.json`'u `requires.atl` minimumu belirtebilir. Kurulu `atl`'n daha eskiyse yükseltmeni söyleyen net bir hata alırsın. Kurulum kanalına göre `brew upgrade atl` ya da benzerini çalıştır.

### Bir takımı nasıl eski sürüme indiririm?

```bash
atl install takim-adi@1.2.0   # belirli versiyonu kur
```

Bu, kurulu olanı pin'lenen sürümle değiştirir.

### Bir projeyi silersem önbelleğe ne olur?

Hiçbir şey — önbellek (`~/.claude/repos/agentteamland/`) projeler arasında paylaşılır. Diğer projeler çalışmaya devam eder. Artık kimsenin kullanmadığından eminsen belirli takımın önbellek dizinini elle silerek disk geri alabilirsin.

### Takımı `atl` olmadan elle kurabilir miyim?

Evet. Takım reposunu `~/.claude/repos/agentteamland/<takım-adı>/` altına klonla ve kopyalari `.claude/` altında sen oluştur. CLI; bunu artı miras/excludes çözümünü otomatikleştirmek için var; çıktısında büyülü bir şey yok.

### `atl`, kurulu takımlar listesini nerede tutar?

Her projede: `.claude/.team-installs.json`. İnsan-okunabilir JSON. Ne yaptığını biliyorsan düzenleyebilirsin — ama `atl install` / `atl remove` her zaman daha güvenlidir.

### `atl` telemetri gönderiyor mu?

Hayır. `atl` yerel bir araç: GitHub'dan klonlar, registry'yi çeker, kopya yazar. Phone-home yok.

### Bu bir Anthropic ürünü mü?

Hayır. AgentTeamLand; Anthropic'in Claude Code'u ile çalışan bağımsız bir açık kaynak projedir. MIT lisanslı. Ticari bağlantı yok.

### Nasıl katkı verebilirim?

- Registry'ye **takım yayımla** — [Registry başvurusu](/tr/authoring/registry-submission).
- **CLI'yı geliştir** — PR'lar [`agentteamland/cli`](https://github.com/agentteamland/cli)'de.
- **Bu dokümanları geliştir** — PR'lar [`agentteamland/docs`](https://github.com/agentteamland/docs)'da. Her sayfanın "Edit this page on GitHub" linki var.
- **Issue aç** — hata raporu ve özellik isteği ilgili repo'ya.

### Sorum burada yok.

[`agentteamland/docs` issues](https://github.com/agentteamland/docs/issues) üzerine `faq` etiketiyle issue aç. Yaygın bir soruysa bu sayfaya eklenir.
