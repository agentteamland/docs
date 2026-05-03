# CLI genel bakış

`atl`'nin sekiz komutu var. Beş **kullanıcı komutu** **mevcut proje** üzerinde (yani `atl`'yi çalıştırdığın dizinde) çalışır — aksi belirtilmedikçe. Üç **otomasyon komutu** ise tipik olarak Claude Code hook'larına bağlanır ve gözetimsiz çalışır — manuel olarak genelde yalnızca kurulum veya troubleshooting için çalıştırırsın.

## Kullanıcı komutları

| Komut | Ne yapar |
|---|---|
| [`atl install`](/tr/cli/install) | Registry adı veya Git URL ile bir takım kurar. |
| [`atl list`](/tr/cli/list) | Bu projede kurulu takımları gösterir. |
| [`atl remove`](/tr/cli/remove) | Takımı kaldırır. |
| [`atl update`](/tr/cli/update) | Bir veya tüm takımların son sürümünü çeker. |
| [`atl search`](/tr/cli/search) | Herkese açık registry'de arar. |

## Otomasyon komutları

| Komut | Ne yapar |
|---|---|
| [`atl setup-hooks`](/tr/cli/setup-hooks) | Auto-update + learning capture'ı bağlayan Claude Code hook'larını (`SessionStart`, `UserPromptSubmit`) tek seferlik kurar/kaldırır. |
| `atl session-start` | `SessionStart` hook'u tarafından çağrılan composite boot-time wrapper (cache pull + symlink→kopya migration + auto-refresh + önceki transkript marker taraması + atl self-version kontrolü). Normal şartlarda elle çalıştırılmaz. |
| [`atl learning-capture`](/tr/cli/learning-capture) | Claude Code transkriptlerini `<!-- learning -->` marker'ları için tarar. `SessionStart` wrapper tarafından çağrılır; test veya backfill için manuel de çalıştırılabilir. |

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
    ├── agents/                   ← takım agent'larına kopya
    ├── skills/                   ← takım skill'lerine kopya
    ├── rules/                    ← takım rule'larına kopya
    └── ...
```

Kopyalar, paylaşımlı önbelleği işaret eder. `atl update`'in aynı anda tüm projelerde etkili olmasının nedeni budur: projeyi değil önbelleği güncellersin.

## Çıkış kodları

| Kod | Anlamı |
|---|---|
| `0` | Başarılı. |
| `1` | Genel hata (geçersiz arg, takım bulunamadı, ağ). |
| `2` | Validation hatası (`team.json` schema'ya uymadı). |
| `3` | Miras hatası (circular chain, eksik parent). |

## Felsefe

- **Deterministik.** Aynı girdi, aynı kopyalar. Gizli state yok.
- **Idempotent.** Zaten kurulu bir takım için `atl install`'u yeniden çalıştırmak no-op'tur (ya da pull).
- **Görünür.** Her eylem ne yaptığını yazar. Spinner yerine çıktıyı kullan.

## Sıradaki

- **[`atl install`](/tr/cli/install)** — en sık çalıştıracağın komut.
- **[`atl search`](/tr/cli/search)** — registry'de ne var keşfet.
