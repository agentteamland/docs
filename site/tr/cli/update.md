# `atl update`

Bir veya tüm kurulu takımların son sürümünü çeker.

## Kullanım

```bash
atl update              # tüm takımları güncelle
atl update <takım>      # yalnızca belirli takımı güncelle
```

## Ne olur?

Güncellenen her takım için:

1. Önbellekteki Git repo fetch + fast-forward edilir.
2. `team.json` schema'ya karşı yeniden doğrulanır.
3. Miras yeniden çözümlenir (parent'lar güncel değilse onlar da güncellenir).
4. `.claude/` altındaki sembolik linkler yeniden kurulur (yeni agent eklendiyse eklenir, silindiyse temizlenir).
5. `.claude/.team-installs.json` yeni çözülen versiyonu kaydeder.

## Örnek

```bash
atl update
```

```
2 takım güncelleniyor...
  software-project-team  1.0.0 → 1.1.0  ✓
  starter-extended       0.2.0 → 0.3.0  ✓

2 takım güncellendi. Sembolik linkler yenilendi.
```

## Version constraint'ler saygı görür

Takımı `software-project-team@^1.0.0` olarak kurduysan, `atl update` en çok `1.x.x`'in son sürümüne çeker — `2.0.0`'a **değil**. Breaking major yükseltme için açıkça `atl install software-project-team@^2.0.0` gerekir.

## Çevrimdışı davranış

Ağ erişilemezse `atl update` uyarı yazar ve önbelleği olduğu gibi bırakır. Sembolik linklerin çalışmaya devam eder.

## İlgili

- [`atl install`](/tr/cli/install) — ilk kurulum.
- [Version constraint'ler](/tr/authoring/team-json#version-constraint-ler) — `^`, `~`, tam pin nasıl çözülür.
