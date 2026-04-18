# `atl remove`

Mevcut projeden bir takımı kaldırır.

## Kullanım

```bash
atl remove <takım>
```

`<takım>`, takımın registry adıdır (URL değil). Kurulu adları `atl list` ile görebilirsin.

## Örnek

```bash
atl remove starter-extended
```

## Ne olur?

1. Takım, `.claude/.team-installs.json`'da bulunur.
2. `.claude/agents/`, `.claude/skills/`, `.claude/rules/` altında bu takımın önbelleğine işaret eden her sembolik link silinir.
3. Eğer bu takım, başka bir kurulu takımın parent'ı ise (via `extends`), `atl remove` varsayılan olarak reddeder — parent'ı kaldırmak child'ı kırar. Yine de kaldırmak için `--force` gerekir.
4. `.claude/.team-installs.json` güncellenir.
5. Paylaşımlı önbellek **dokunulmaz**. Takımın Git klonu `~/.claude/repos/agentteamland/`'de durmaya devam eder (yeniden kullanım için). Diski geri kazanmak için o dizini elle silebilirsin.

## Flag'ler

| Flag | Etkisi |
|---|---|
| `--force` | Bu takım başka bir kurulu takımın parent'ı olsa bile kaldır. Child daha sonra kırık kalır — önce child'ı kaldırmalısın. |

## Örnek — zorla kaldırma

```bash
atl remove software-project-team --force
```

Bunu seyrek kullan. Genelde önce child'ı kaldır.

## İlgili

- [`atl list`](/tr/cli/list) — ne kaldırabileceğini gör.
- [`atl install`](/tr/cli/install) — fikrini değiştirirsen geri kur.
