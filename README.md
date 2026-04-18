# AgentTeamLand Docs

Source for [**agentteamland.github.io/docs**](https://agentteamland.github.io/docs/) (→ `docs.agentteamland.com` once the domain is active).

Built with [VitePress](https://vitepress.dev). Bilingual: English (canonical, served at `/`) and Turkish (`/tr/`).

## Local development

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # build to site/.vitepress/dist
npm run preview       # serve the built site
```

## Directory layout

```
site/
├── .vitepress/config.ts       # nav, sidebar, i18n, theme
├── index.md                   # EN landing
├── guide/ cli/ authoring/ reference/
└── tr/                        # Turkish mirror (same page tree)
```

## Content rule

**English is canonical.** When content changes, update EN first, then TR. Never let TR drift — port additions immediately or leave a `<!-- TODO: translate -->` marker.

## Deploy

Automatic on push to `main` via `.github/workflows/deploy.yml` → GitHub Pages.

Force a rebuild without a commit:

```bash
gh workflow run deploy.yml --repo agentteamland/docs
```

## License

MIT — see [LICENSE](LICENSE).
