# CLI genel bakış

`atl`'nin beş komutu var. Hepsi **mevcut proje** üzerinde (yani `atl`'yi çalıştırdığın dizinde) çalışır — aksi belirtilmedikçe.

| Komut | Ne yapar |
|---|---|
| [`atl install`](/tr/cli/install) | Registry adı veya Git URL ile bir takım kurar. |
| [`atl list`](/tr/cli/list) | Bu projede kurulu takımları gösterir. |
| [`atl remove`](/tr/cli/remove) | Takımı kaldırır. |
| [`atl update`](/tr/cli/update) | Bir veya tüm takımların son sürümünü çeker. |
| [`atl search`](/tr/cli/search) | Herkese açık registry'de arar. |

## Global flag'ler

| Flag | Etkisi |
|---|---|
| `--help`, `-h` | Kullanımı yazıp çıkar. |
| `--version`, `-v` | Kurulu `atl` versiyonunu yazar. |

Her komutun kendi `--help` sayfası var: `atl install --help`, `atl search --help`, vb.

## `atl` hangi durumu tutar?

**Paylaşımlı önbellek** (makine başına):

```
~/.claude/repos/agentteamland/
└── <takım-adı>/          ← klonlanmış Git repo, tüm projeler paylaşır
```

**Proje başına durum** (çalıştığın dizin):

```
<proje>/
└── .claude/
    ├── .team-installs.json       ← hangi takımlar kurulu, hangi versiyonda
    ├── agents/                   ← takım agent'larına sembolik link
    ├── skills/                   ← takım skill'lerine sembolik link
    ├── rules/                    ← takım rule'larına sembolik link
    └── ...
```

Sembolik linkler, paylaşımlı önbelleği işaret eder. `atl update`'in aynı anda tüm projelerde etkili olmasının nedeni budur: projeyi değil önbelleği güncellersin.

## Çıkış kodları

| Kod | Anlamı |
|---|---|
| `0` | Başarılı. |
| `1` | Genel hata (geçersiz arg, takım bulunamadı, ağ). |
| `2` | Validation hatası (`team.json` schema'ya uymadı). |
| `3` | Miras hatası (circular chain, eksik parent). |

## Felsefe

- **Deterministik.** Aynı girdi, aynı sembolik linkler. Gizli state yok.
- **Idempotent.** Zaten kurulu bir takım için `atl install`'u yeniden çalıştırmak no-op'tur (ya da pull).
- **Görünür.** Her eylem ne yaptığını yazar. Spinner yerine çıktıyı kullan.

## Sıradaki

- **[`atl install`](/tr/cli/install)** — en sık çalıştıracağın komut.
- **[`atl search`](/tr/cli/search)** — registry'de ne var keşfet.
