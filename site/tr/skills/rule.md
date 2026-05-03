# `/rule`

Bir kodlama veya mimari kuralı ekle. Kullanıcı kuralı doğal dilde (herhangi bir dil) açıklar; skill bunu doğru dosyaya **İngilizce yapılandırılmış formatta** yazar.

Birden fazla formülasyonun mümkün olduğu kompleks veya belirsiz kurallar için doğrudan [`/rule-wizard`](/tr/skills/rule-wizard) kullan — option-based Q&A round'larından geçer ve sonunda final formu yazmak için `/rule`'u çağırır.

Global skill olarak [rule](https://github.com/agentteamland/rule)'da gelir.

## Üç scope

| Flag | Hedef | Ne zaman |
|---|---|---|
| *(yok)* | Proje `.claude/` dosyaları | Bu projeye özel kurallar (default) |
| `--global` | `~/.claude/rules/` | Her projeye uygulanan kişisel kurallar |
| `--team` | `~/.claude/repos/agentteamland/{team}/` dosyaları | Team repo'da agent veya team-rule dosyaları |

`--team` için aktif takım installed `.claude/agents/` symlink'lerinden detect edilir. Tek takım → otomatik kullanılır; birden fazla takım → `AskUserQuestion` ile sorar.

## Akış

### 1. Kuralı analiz et

Kullanıcının doğal-dil ifadesinden çıkar:

- **Topic** — kodlama, mimari, naming, error handling, vb.
- **Scope** — hangi uygulama(lar)ı etkiler
- **Motivation** — bu kuralın *neden*i (söylenmemişse makul bir Why türet; emin değilsen sor)

### 2. Hedef dosyayı belirle

**Project scope (default):**

| Uygulanabilirlik | Dosya |
|---|---|
| Tüm uygulamalar için ortak | `.claude/rules/coding-common.md` |
| Belirli bir uygulama | `.claude/docs/coding-standards/{app}.md` (mevcut dosyalardan seç) |

**Global scope (`--global`):**

| Uygulanabilirlik | Dosya |
|---|---|
| Genel kural | `~/.claude/rules/{topic}.md` (varsa append, yoksa create) |

**Team scope (`--team`):**

| İlgili alan | Dosya |
|---|---|
| Bir agent'ın knowledge base | `~/.claude/repos/agentteamland/{team}/agents/{agent}.md` |
| Team-wide rule | `~/.claude/repos/agentteamland/{team}/rules/{topic}.md` |

Birden fazlasına ama hepsine değil uygulanırsa, skill sorar.

### 3. Mevcut kuralları kontrol et

Hedef dosyayı **daima oku.** Üç durum mümkün:

- **Tamamen yeni kural** → yeni section olarak ekle
- **Var olan kuralı genişletme / güncelleme** → in-place update; duplicate yapma
- **Çelişki** (iki kural birbiriyle çelişiyor) → kullanıcıya sor; varsayma

### 4. Yapılandırılmış formatta yaz

Detaylı ve net, İngilizce. **Eksik bir kural, var olmayan bir kuraldan daha tehlikelidir.**

```markdown
### {kebab-case-rule-id}
**Rule:** {Kuralın net, tek-cümle ifadesi}

**Why:** {Motivation. Neyi önler? Hangi prensibi destekler?
Geçmiş hatalardan dersler varsa ekle. Bu alan boş veya muğlak bırakılamaz.}

**Apply when:** {Hangi koşullarda — file path'ler, code pattern'leri,
ne tür değişiklikler? Spesifik ol.}

**Don't apply when:** {(Opsiyonel) İstisnaları açıkça belirt.}

**Examples:**
- ✅ Correct: {kod örneği veya somut senaryo}
- ❌ Wrong: {kod örneği veya somut senaryo}

**Related:** {(Opsiyonel) İlgili kural ID'leri}
```

### 5. Kural yazımı (kritik)

- **Asla varsayma.** Bilgi eksikse sor.
- **Kısa tutma — açıkla.** Atlanan detay = uygulanmayan kural.
- **Edge case'leri yakala.** Uygulanabildiğinde `Don't apply when` ekle.
- **Örnek ver.** Hem ✅ hem ❌.
- **Unique ID ata.** Çakışma önlemek için önce dosyayı oku.

### 6. Yaz ve doğrula

Hedef dosyayı `Edit` ile güncelle. Kullanıcıya kısa özet ver: hangi dosya ve hangi ID.

### 7. Team-scope kuralları persist etme

Team kuralları takımın lokal clone'unda yaşar. Her public `agentteamland/{team}` repo branch-protected, dolayısıyla `origin/main`'e doğrudan push reddedilir. Bunun yerine PR aç:

```bash
cd ~/.claude/repos/agentteamland/{team-name}
git checkout -b rule/{kebab-case-rule-id}
git add rules/{file}.md team.json
git commit -m "rule: {kebab-case-rule-id}"
git push -u origin rule/{kebab-case-rule-id}
gh pr create --fill
```

[`/create-pr`](/tr/skills/create-pr) bunu kuruluysa otomatize eder.

## Önemli kurallar

1. **Dil:** Kullanıcı skill'i herhangi bir dilde çağırabilir; skill kuralı **daima İngilizce yazar**.
2. **Eksik bilgide sor.** Boşlukları kendi başına doldurma.
3. **Duplicate yapma.** Mevcut kuralları önce oku.
4. **File path'leri doğrula.** Yanlış scope → yanlış dosya.
5. **Format sapması yok.** Tüm zorunlu alanlar dolu: Rule, Why, Apply when, Examples.
6. **Team-scope kurallar PR ile ship edilir, doğrudan push ile değil.** Branch-protected; skill lokalde yazar ve PR oluşturmaya işaret eder.

## İlgili

- [`/rule-wizard`](/tr/skills/rule-wizard) — belirsiz kurallar için option-based clarification wizard; sonunda `/rule` çağırır
- [Kavramlar: Rule](/tr/guide/concepts#rule) — rule'lar nedir ve nasıl yüklenir
- [team-repo-maintenance rule](https://github.com/agentteamland/core/blob/main/rules/team-repo-maintenance.md) — kural değişikliklerini upstream'e gönderme disiplini

## Kaynak

- Spec: [rule/skills/rule/skill.md](https://github.com/agentteamland/rule/blob/main/skills/rule/skill.md)
