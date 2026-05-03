# `/brainstorm`

Brainstorming oturumlarını başlat ve tamamla. Brainstorm'lar, kod yazılmadan önce non-trivial bir kararı düşünmenin kanonik yeri — sonuçta oluşan dosya tarihsel kayıt + konuyu sonradan ele alacak herhangi bir session için handoff olur.

İki mod: `start` yeni bir brainstorm açar; `done` aktif brainstorm'u tamamlar ve kararlarını doküman zincirine yayar.

Global skill olarak [brainstorm](https://github.com/agentteamland/brainstorm)'da gelir.

## Üç scope

Brainstorm üç seviyeden birinde yaşar — *kimin* karara önem vereceğine göre scope seç:

| Flag | Hedef dizin | Ne zaman |
|---|---|---|
| *(yok)* | `.claude/brain-storms/` | Projeye özel konular (default) |
| `--global` | `~/.claude/brain-storms/` | Cross-project, kişisel konular |
| `--team` | `~/.claude/repos/agentteamland/{team}/brain-storms/` | Team repo ile ilgili konular (agent kuralları, takım stratejisi, contributor governance) |

`--team` için, aktif takım installed `.claude/agents/` symlink'lerinden detect edilir. Tek takım → otomatik kullanılır; birden fazla takım → skill `AskUserQuestion` ile sorar; takım kurulu değil → `/team install` ipucuyla error.

## `start` modu

```
/brainstorm start [--global|--team] <konuyu açıklayan ilk mesaj>
```

Akış:

1. **Topic'i çıkar** kullanıcının mesajından — kebab-case bir filename türet. Kullanıcı filename SUPPLY ETMEZ.
2. **Scope'u belirle** flag'den (veya project'e default).
3. **Dizini oluştur** yoksa (`{scope-base}/brain-storms/`).
4. **Brainstorm dosyasını oluştur** frontmatter (`status: active`, `scope`, `team`, `date`, `participants`) + Context + Discussion + Open Items bölümleriyle.
5. **Brainstorm'u scope'un `CLAUDE.md` / `README.md`'sine pinle** bir `<!-- brainstorm:active -->` marker bloğu üzerinden. Bu, aktif brainstorm'un bir sonraki session'da kaçırılmasını imkansız kılar — proje context ile auto-load olur.
6. **Kullanıcıyı bilgilendir**: filename, scope, pinlenen yer, sonra konuya dal.

### Active-brainstorm pin

Her aktif brainstorm kendini scope'un `CLAUDE.md` (veya team `README.md`)'sine `<!-- brainstorm:active:start --> ... <!-- brainstorm:active:end -->` bloğu içinde pinler:

```markdown
<!-- brainstorm:active:start -->
## ⚠️ Active brainstorms

These topics have an in-progress brainstorm — read the file before making any decision on them.

- **[docs-sync-automation](.claude/brain-storms/docs-sync-automation.md)** (project, 2026-05-03) — closing the README + docs-site drift gap
<!-- brainstorm:active:end -->
```

Birden fazla aktif brainstorm aynı blokta bullet olarak yan yana yaşar. `brainstorm@1.1.0`'da geldi.

### Brainstorm'u canlı tutma (her mesaj döngüsünde)

Bir brainstorm aktifken, her mesajda:

- **Yanıt vermeden önce** — brainstorm dosyasını oku (context'i hatırla)
- **Yanıt verdikten sonra** — yeni fikirleri, kararları, reddedilen alternatifleri + nedenlerini, kullanıcının önemli noktalardaki birebir ifadelerini, açık soruları, kronolojik akışı yaz

Dosya **yeterince detaylı** olmalı ki yeni bir context'te onu okuyan bir Claude orijinal konuşmada bulunmuş gibi devam edebilsin.

## `done` modu

```
/brainstorm done
```

Akış:

1. **Aktif brainstorm'u bul.** Üç scope'u da arar (`.claude/brain-storms/`, `~/.claude/brain-storms/`, `~/.claude/repos/agentteamland/*/brain-storms/`). Birden fazlaysa scope'larıyla birlikte listeler ve hangisinin tamamlanacağını sorar.
2. **Brainstorm dosyasını tamamla.** `status: active` → `status: completed`. Final notları append. Open Items'ı güncelle (çözülmemişler kalır). Final Decisions bölümü ekle.
3. **Docs dosyasını oluştur veya güncelle.** Settled kararlar gider:
   - **Project brainstorm** → `.claude/docs/`
   - **Global brainstorm** → `~/.claude/docs/`
   - **Team brainstorm** → `~/.claude/repos/agentteamland/{team}/docs/`
4. **CLAUDE.md / README'yi güncelle.** İki şey olur:
   - Tamamlanmış-brainstorm özetini uygun bölüme append et
   - Bu brainstorm'un bullet'ını `<!-- brainstorm:active -->` marker bloğundan kaldır. Liste boş kalırsa, tüm bloğu (H2 başlık dahil) kaldır — geride boş "Active brainstorms" başlığı kalmasın.
5. **Team brainstorm'ları doğrudan push değil, PR ile ship et.** Team brainstorm'ları takımın lokal clone'unda yaşar ve team repo'lar branch-protected. `done` akışı dosyayı lokalde yazar ve kullanıcıya bir PR açmasını söyler (manuel veya [`/create-pr`](/tr/skills/create-pr) ile).

## Doküman zinciri

Her tartışma ve karar üç katmandan akar:

```
brain-storms/ (süreç) → docs/ (sonuç) → CLAUDE.md (özet)
                     \
                       backlog.md (ertelenen item'lar)
```

- Brainstorm olmadan karar verilmez.
- Brainstorm dosyaları **asla silinmez** — tarihsel kayıt.
- Kararlar değişirse YENİ brainstorm açılır ve eskisine `superseded by X` notu eklenir.

## Backlog disiplini

Brainstorm sırasında "şimdi yapılmayacak, sonra" işaretlenen her item `.claude/backlog.md`'ye yansır:

- **Prepend** (en yenisi en üstte)
- Her item için: tarih + kategori başlığı + context link + detaylı topic açıklama + "ne zaman gündeme gelir" notu + ilgili kaynaklar
- `/brainstorm done` sırasında brainstorm'daki her "deferred" notu backlog'a karşı kontrol edilir — eksik olanlar brainstorm kapanmadan önce eklenir
- Bir deferred item daha sonra implement edildiğinde, backlog'dan **silinir** (done işaretlenip bırakılmaz)

## Önemli kurallar

1. **Birden fazla aktif brainstorm var olabilir.** Her biri kendi dosyasında yaşar. Scope'lar arası eşzamanlı aktif olabilirler.
2. **Context kırılmalarına dayanıklılık.** Brainstorm dosyası kalıcı state. Yeni bir session aktif brainstorm'ları marker bloğu + dizin tarama ile detect eder ve dosyayı okuyarak devam eder.
3. **Filename kullanıcıdan istenmez.** Mesajdan çıkarılır ve uygun kebab-case isim atanır.
4. **Brainstorm dosyaları asla silinmez.** Tarihsel kayıt.
5. **Her brainstorm tek konuya odaklanır.** Farklı konular → farklı dosyalar.
6. **Aktif brainstorm araması üç location'ı da kapsar.** `done` modunda project + global + tüm team dizinleri taranır.
7. **Scope frontmatter'da.** `scope: project|global|team`, `team: {ad}` — `done`-mode hedeflerini belirler.
8. **Team brainstorm'lar PR ile ship edilir, doğrudan push ile değil.** Team repo'lar branch-protected; `done` akışı lokalde yazar ve PR oluşturmaya işaret eder.

## İlgili

- [`/save-learnings`](/tr/skills/save-learnings) — periyodik öğrenme yakalama (brainstorm'a paralel; brainstorm'lar deliberate, learning'ler spontane)
- [`/create-pr`](/tr/skills/create-pr) — bir team brainstorm değişikliğini PR olarak paketler
- [Kavramlar: Skill](/tr/guide/concepts#skill) — brainstorm'lar bilgi modelinde nereye oturur

## Kaynak

- Spec: [brainstorm/skills/brainstorm/skill.md](https://github.com/agentteamland/brainstorm/blob/main/skills/brainstorm/skill.md)
- Rule: [brainstorm/rules/brainstorm.md](https://github.com/agentteamland/brainstorm/blob/main/rules/brainstorm.md)
