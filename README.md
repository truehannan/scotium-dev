<p align="center">
  <img src="public/favicon.ico" alt="Scotium" width="48" height="48" />
</p>

<h1 align="center">Scotium</h1>

<p align="center">
  <strong>The GitHub Power-User Platform</strong>
</p>

<p align="center">
  <a href="https://scotium.pages.dev">
    <img src="https://img.shields.io/badge/Live-scotium.pages.dev-00bf63?style=for-the-badge&logo=cloudflarepages&logoColor=white" alt="Live" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white" />
  <img src="https://img.shields.io/badge/D1-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-00bf63?style=flat-square" />
</p>

<p align="center">
  <a href="https://scotium.pages.dev/about">About</a> &nbsp;&bull;&nbsp;
  <a href="https://scotium.pages.dev/components">Components</a> &nbsp;&bull;&nbsp;
  <a href="https://scotium.pages.dev/compare">Compare</a> &nbsp;&bull;&nbsp;
  <a href="https://scotium.pages.dev/explore">Explore</a>
</p>

---

<p align="center">
  <img src="public/screenshot.png" alt="Scotium Screenshot" width="800" />
</p>

---

## Why Scotium?

GitHub shows you data. **Scotium gives you insights.**

| GitHub | Scotium |
|--------|---------|
| Raw star count | Health Score (0-100) combining 6 metrics |
| Contributor list | Bus Factor risk analysis |
| Issue count | Issue resolution rate + response time |
| No comparison tool | Side-by-side Repo vs Repo, User vs User |
| No README builder | 30 ready-to-copy profile components |
| Basic code view | Built-in editor with PR creation |
| No discovery engine | Rising Stars, Gems, Fork Radar |

---

## Features

```
34 Analysis Tools  ·  30 README Components  ·  Built-in Code Editor
Discovery Engine   ·  Compare Tool          ·  CMS Admin Panel
```

### Repository Analysis (12 tools)

> Horizontal slider on mobile, sidebar on desktop

```
Health Score  ·  Stars  ·  Last Commit  ·  PR Merge Speed
Issue Health  ·  Bus Factor  ·  Releases  ·  Fork Activity
License  ·  Repo Size  ·  Tech Stack  ·  Dependencies
```

### Profile Analysis (8 tools)

```
Total Stars  ·  Total Forks  ·  Follower Ratio  ·  Account Age
Repositories  ·  Organizations  ·  Top Repo  ·  Top Languages
```

### Discovery (4 engines)

```
🚀 Rising Stars — new repos gaining traction this week
💎 Undiscovered Gems — active repos with <200 stars
🔀 Most Forked — new repos being forked rapidly
🔥 Active Giants — popular repos with recent commits
```

### Dashboard Tools (4)

```
📊 Repo Health Summary — all your repos scored in a table
⚠️ Stale Repos Alert — repos inactive 90+ days
🔃 Open PR Tracker — all your PRs across repos
⭐ Star Leaders — ranked repos with sparkbars
```

---

## README Components

**30 hardcoded components** split into two categories:

| User / Org (15) | Repository (15) |
|-----------------|-----------------|
| Stats Card | Star History Chart |
| Streak Stats | Stars Badge |
| Top Languages (compact) | Forks Badge |
| Top Languages (pie) | Issues Badge |
| Profile Trophy | License Badge |
| Activity Graph | Last Commit |
| Profile Views | Repo Size |
| Typing SVG | Top Language |
| Followers Badge | Contributors |
| Stars Badge | Release Version |
| Snake Contribution | Downloads |
| Summary Card | Build Status |
| Productive Time | Open PRs |
| Stats by Repo | Repo Pin Card |
| Social Badges | Commit Activity |

Enter your `{{username}}` or `{{owner}}/{{repo}}` and copy instantly.

---

## Tech Stack

| | Technology | Purpose |
|-|-----------|---------|
| ⚛️ | React 18 | UI framework |
| ⚡ | Vite 5 | Build tool |
| 🎨 | TailwindCSS 3 | Styling (dark mode only) |
| 🎬 | Framer Motion | Animations |
| ✏️ | CodeMirror 6 | Code editor (lazy-loaded) |
| 📡 | TanStack Query | Data fetching + caching |
| 🛣️ | React Router 6 | Client-side routing |
| ☁️ | Cloudflare Pages | Hosting + CDN |
| ⚙️ | Cloudflare Functions | Auth + D1 access |
| 🗃️ | Cloudflare D1 | Database (SQLite) |
| 🔐 | GitHub OAuth | Authentication |

---

## Design

```
Primary:   #1B1B1B (dark)
Accent:    #00bf63 (green)
Font UI:   Inter
Font Code: JetBrains Mono
Hero:      Matrix Digital Rain (Canvas 2D) + hover spotlight
Theme:     Dark only — no light mode
```

---

## Routes

| Route | Page |
|-------|------|
| `/` | Homepage — Matrix Rain hero, trending, discovery |
| `/explore` | Filter by language, time, sort |
| `/components` | 30 README components |
| `/compare` | Repo vs Repo, User vs User |
| `/about` | Platform introduction |
| `/dashboard` | Your repos + tools (auth) |
| `/search` | Full search results |
| `/:username` | User profile + README + tools |
| `/orgs/:orgname` | Org profile + README |
| `/:owner/:repo` | Repo detail + 12 tools |
| `/:owner/:repo/editor` | Code editor + PR creation |
| `/admin/cms` | CMS admin (admin-only) |

---

## Cloudflare Functions

Only **critical server-side functions** that require secrets or D1:

| Function | Purpose |
|----------|---------|
| `auth/github.js` | OAuth token exchange (needs CLIENT_SECRET) |
| `cms/public.js` | Read announcements/banners/sponsored from D1 |
| `cms/manage.js` | Admin CRUD for CMS content (D1 writes) |
| `favorites/add.js` | Save favorite repos to D1 |
| `favorites/list.js` | Get user's favorites from D1 |
| `favorites/remove.js` | Remove favorite from D1 |

All GitHub API calls run **client-side** — no unnecessary workers.

---

## Quick Start

```bash
git clone https://github.com/truehannan/scotium-dev.git
cd scotium-dev
npm install
cp .env.example .env.local   # add your GitHub OAuth credentials
npm run dev
```

## Deploy

```bash
npm run build               # outputs to dist/
wrangler pages deploy dist  # deploy to Cloudflare
```

Environment variables (set in Cloudflare dashboard):
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

---

## Database

```sql
-- Run migration
wrangler d1 migrations apply scotium
```

Tables: `users`, `favorites`, `cms_announcements`, `cms_banners`, `cms_sponsored_repos`, `components`

---

<p align="center">
  Built with 💚 by <a href="https://hannan.page.dev"><strong>Hannan</strong></a>
</p>
