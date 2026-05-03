# `atl remove`

Mevcut projeden bir takımı kaldır.

## Kullanım

```bash
atl remove <takım>             # interactive — lokal değişiklikleri silmeden önce sorar (atl ≥ 1.0.0)
atl remove <takım> --force     # non-interactive — onay sormayı atlar
```

`<takım>` takımın registry adıdır (URL değil). Yüklü adları `atl list` ile görebilirsin.

## Örnek

```bash
atl remove starter-extended
```

## Ne olur

1. Takım `.claude/.team-installs.json`'da bulunur.
2. `.claude/agents/`, `.claude/skills/`, `.claude/rules/` altında bu takımın yüklediği her project-local copy, manifest'in per-resource SHA-256 baseline'larına bakılarak tespit edilir.
3. **Modification check**: her resource'un mevcut SHA-256'sı install-time baseline ile karşılaştırılır. Bir resource lokal olarak modifiye edilmişse CLI `⚠ N kaynakta lokal değişiklik var` özetini basar ve onay ister. `--force` prompt'u atlar.
4. **Manifest-driven allowlist**: yalnızca bu takımın register ettiği dosyalar silinir. `.claude/` altındaki kullanıcı-yazımı dosyalar (otomatik büyüyen `children/`, `learnings/`, custom skill'ler, journal entry'leri, wiki sayfaları dahil) **korunur** — atl ile register edilmedikleri için uninstall'dan sağ çıkarlar.
5. `.claude/.team-installs.json` atomik (tmp + rename) olarak güncellenir.
6. Shared cache'e **dokunulmaz**. Takımın Git clone'u tekrar kullanım için `~/.claude/repos/agentteamland/` altında kalır. Disk geri kazanmak için cache klasörünü manuel sil.

::: warning Inheritance kaldırma sırasında zorlanmaz
`atl remove`, başka bir yüklü takımın `extends` yoluyla referans verdiği bir takımı kaldırmayı **reddetmez**. Bir child takım hâlâ parent'ı referans ederken parent'ı kaldırırsan, child'ın effective resource set'i bir sonraki `atl update` veya `atl list`'te tutarsız hale gelir. Önce `atl list` çalıştırıp inheritance chain'i gör — child'ları parent'lardan önce kaldır.
:::

## Bayraklar

| Bayrak | Etki |
|---|---|
| `--force` | Lokal modifikasyonu olan projeler için modification-check onay prompt'unu atla. CI / scripted teardown için kullanışlı. |

## Örnek — CI'da zorla kaldırma

```bash
atl remove software-project-team --force
```

`--force`'u non-interactive bağlamlar (CI, scripted teardown) için kullan. Interactive kullanımda default'u tercih et — prompt seni saatlerce `/save-learnings`'le büyümüş içeriği veya elle düzenlemeleri yanlışlıkla silmekten korur.

## v1.0.0-öncesinden davranış değişiklikleri

`atl v1.0.0`'dan önce `atl remove` heuristik kullanırdı ve takımın resource'larıyla birlikte kullanıcı-yazımı dosyaları yanlışlıkla silebilirdi. v1.0.0 manifest-driven allowlist o latent bug'ı kapattı — silinen her dosya takımın açıkça yüklediği bir dosya.

Interactive onay prompt'u + `--force` bayrağı da v1.0.0'da geldi (öncesinde koşulsuz destructive idi).

## İlgili

- [`atl list`](/tr/cli/list) — neyi kaldırabilirsin gör.
- [`atl install`](/tr/cli/install) — fikir değişirse yeniden yükle.
- [`atl update`](/tr/cli/update) — modifiye edilmemiş kopyaları otomatik refresh eder; `--force` remove olup olmayacağına karar verirken alaka.
