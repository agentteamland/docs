import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AgentTeamLand',
  description: 'AI agent teams, installed like packages.',

  // Served from github.com/agentteamland/docs → agentteamland.github.io/docs/
  // When the docs.agentteamland.com custom domain is wired up, change to '/'.
  base: '/docs/',

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#3b6df7' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'AgentTeamLand' }],
    ['meta', { property: 'og:description', content: 'AI agent teams, installed like packages.' }],
    ['meta', { property: 'og:image', content: 'https://raw.githubusercontent.com/agentteamland/workspace/main/assets/demo.gif' }]
  ],

  // ---------------------------------------------------------------------------
  // i18n — English is canonical at /, Turkish at /tr/
  // ---------------------------------------------------------------------------
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/what-is-atl', activeMatch: '/guide/' },
          { text: 'CLI', link: '/cli/overview', activeMatch: '/cli/' },
          { text: 'Teams', link: '/teams/', activeMatch: '/teams/' },
          { text: 'Team Authoring', link: '/authoring/team-json', activeMatch: '/authoring/' },
          { text: 'Reference', link: '/reference/faq', activeMatch: '/reference/' },
          {
            text: 'Ecosystem',
            items: [
              { text: 'GitHub org', link: 'https://github.com/agentteamland' },
              { text: 'CLI repo', link: 'https://github.com/agentteamland/cli' },
              { text: 'Registry', link: 'https://github.com/agentteamland/registry' },
              { text: 'Workspace', link: 'https://github.com/agentteamland/workspace' }
            ]
          }
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'What is atl?', link: '/guide/what-is-atl' },
                { text: 'Install', link: '/guide/install' },
                { text: 'Quickstart', link: '/guide/quickstart' },
                { text: 'Concepts', link: '/guide/concepts' }
              ]
            }
          ],
          '/cli/': [
            {
              text: 'CLI Reference',
              items: [
                { text: 'Overview', link: '/cli/overview' },
                { text: 'atl install', link: '/cli/install' },
                { text: 'atl list', link: '/cli/list' },
                { text: 'atl remove', link: '/cli/remove' },
                { text: 'atl update', link: '/cli/update' },
                { text: 'atl search', link: '/cli/search' },
                { text: 'atl setup-hooks', link: '/cli/setup-hooks' }
              ]
            }
          ],
          '/teams/': [
            {
              text: 'Verified Teams',
              items: [
                { text: 'Browse', link: '/teams/' },
                { text: 'software-project-team', link: '/teams/software-project-team' },
                { text: 'design-system-team', link: '/teams/design-system-team' }
              ]
            }
          ],
          '/authoring/': [
            {
              text: 'Team Authoring',
              items: [
                { text: 'team.json', link: '/authoring/team-json' },
                { text: 'Creating a team', link: '/authoring/creating-a-team' },
                { text: 'Inheritance', link: '/authoring/inheritance' },
                { text: 'Scaffolder spec', link: '/authoring/scaffolder-spec' },
                { text: 'Registry submission', link: '/authoring/registry-submission' }
              ]
            }
          ],
          '/reference/': [
            {
              text: 'Reference',
              items: [
                { text: 'Schema', link: '/reference/schema' },
                { text: 'Glossary', link: '/reference/glossary' },
                { text: 'FAQ', link: '/reference/faq' }
              ]
            }
          ]
        }
      }
    },
    tr: {
      label: 'Türkçe',
      lang: 'tr',
      link: '/tr/',
      themeConfig: {
        nav: [
          { text: 'Rehber', link: '/tr/guide/what-is-atl', activeMatch: '/tr/guide/' },
          { text: 'CLI', link: '/tr/cli/overview', activeMatch: '/tr/cli/' },
          { text: 'Takımlar', link: '/tr/teams/', activeMatch: '/tr/teams/' },
          { text: 'Takım Yazımı', link: '/tr/authoring/team-json', activeMatch: '/tr/authoring/' },
          { text: 'Başvuru', link: '/tr/reference/faq', activeMatch: '/tr/reference/' },
          {
            text: 'Ekosistem',
            items: [
              { text: 'GitHub org', link: 'https://github.com/agentteamland' },
              { text: 'CLI repo', link: 'https://github.com/agentteamland/cli' },
              { text: 'Registry', link: 'https://github.com/agentteamland/registry' },
              { text: 'Workspace', link: 'https://github.com/agentteamland/workspace' }
            ]
          }
        ],
        sidebar: {
          '/tr/guide/': [
            {
              text: 'Rehber',
              items: [
                { text: 'atl nedir?', link: '/tr/guide/what-is-atl' },
                { text: 'Kurulum', link: '/tr/guide/install' },
                { text: 'Hızlı başlangıç', link: '/tr/guide/quickstart' },
                { text: 'Kavramlar', link: '/tr/guide/concepts' }
              ]
            }
          ],
          '/tr/cli/': [
            {
              text: 'CLI Başvuru',
              items: [
                { text: 'Genel bakış', link: '/tr/cli/overview' },
                { text: 'atl install', link: '/tr/cli/install' },
                { text: 'atl list', link: '/tr/cli/list' },
                { text: 'atl remove', link: '/tr/cli/remove' },
                { text: 'atl update', link: '/tr/cli/update' },
                { text: 'atl search', link: '/tr/cli/search' },
                { text: 'atl setup-hooks', link: '/tr/cli/setup-hooks' }
              ]
            }
          ],
          '/tr/teams/': [
            {
              text: 'Onaylı Takımlar',
              items: [
                { text: 'Göz at', link: '/tr/teams/' },
                { text: 'software-project-team', link: '/tr/teams/software-project-team' },
                { text: 'design-system-team', link: '/tr/teams/design-system-team' }
              ]
            }
          ],
          '/tr/authoring/': [
            {
              text: 'Takım Yazımı',
              items: [
                { text: 'team.json', link: '/tr/authoring/team-json' },
                { text: 'Takım oluşturma', link: '/tr/authoring/creating-a-team' },
                { text: 'Miras (inheritance)', link: '/tr/authoring/inheritance' },
                { text: 'Scaffolder spec', link: '/tr/authoring/scaffolder-spec' },
                { text: 'Registry başvurusu', link: '/tr/authoring/registry-submission' }
              ]
            }
          ],
          '/tr/reference/': [
            {
              text: 'Başvuru',
              items: [
                { text: 'Şema', link: '/tr/reference/schema' },
                { text: 'Sözlük', link: '/tr/reference/glossary' },
                { text: 'SSS', link: '/tr/reference/faq' }
              ]
            }
          ]
        },
        outline: { label: 'Bu sayfada' },
        docFooter: { prev: 'Önceki', next: 'Sonraki' },
        lastUpdatedText: 'Son güncelleme',
        darkModeSwitchLabel: 'Tema',
        lightModeSwitchTitle: 'Açık temaya geç',
        darkModeSwitchTitle: 'Koyu temaya geç',
        sidebarMenuLabel: 'Menü',
        returnToTopLabel: 'Başa dön',
        externalLinkIcon: true
      }
    }
  },

  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24, alt: 'AgentTeamLand' },
    siteTitle: 'AgentTeamLand',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/agentteamland' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          tr: {
            translations: {
              button: { buttonText: 'Ara', buttonAriaLabel: 'Ara' },
              modal: {
                displayDetails: 'Ayrıntıları göster',
                resetButtonTitle: 'Sorguyu temizle',
                backButtonTitle: 'Aramayı kapat',
                noResultsText: 'Sonuç bulunamadı',
                footer: {
                  selectText: 'seç',
                  navigateText: 'gez',
                  closeText: 'kapat'
                }
              }
            }
          }
        }
      }
    },

    editLink: {
      pattern: 'https://github.com/agentteamland/docs/edit/main/site/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 AgentTeamLand'
    }
  }
})
