<p align="center">
  <img src="public/logo.png" alt="Scotium" height="40" />
</p>

<p align="center">
  <strong>The GitHub Power-User Platform</strong><br/>
  Analyze repos, compare projects, discover trends, and contribute — all in one place.
</p>

<p align="center">
  <a href="https://scotium.pages.dev">Live Demo</a> &bull;
  <a href="https://scotium.pages.dev/about">About</a> &bull;
  <a href="https://scotium.pages.dev/components">Components</a> &bull;
  <a href="https://scotium.pages.dev/compare">Compare</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-00bf63?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-00bf63?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-00bf63?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Cloudflare_Pages-Deployed-00bf63?style=flat-square&logo=cloudflarepages" alt="Cloudflare" />
</p>

---

## What is Scotium?

Scotium is not another GitHub clone. It's a **power-user dashboard** that gives you tools and insights GitHub doesn't surface easily:

- **Repository Health Scores** — Instant 0-100 health assessment for any repo
- **Side-by-side Comparisons** — Compare repos or users with visual metrics
- **README Component Marketplace** — 30 ready-to-copy components for your profile
- **Built-in Code Editor** — Edit files, create branches, and open PRs directly
- **Discovery Engine** — Find rising stars, undiscovered gems, and active forks
- **CMS-powered Ads** — Managed announcement bars, banners, and sponsored repos

---

## Features

### Homepage
- Full-screen **Matrix Rain** hero (Canvas 2D, green code cascade with hover spotlight)
- **Peekaboo-style** trending repos carousel
- **Popular developers** horizontal scroll
- **Discovery Tools**: Rising Stars, Undiscovered Gems, Most Forked, Active Giants
- CMS-managed announcements, banners, sponsored repos

### Repository Detail (`/:owner/:repo`)
- **12 Analysis Tools** as horizontal slider (mobile) or sidebar (desktop):
  - Health Score, Stars, Last Commit, PR Merge Speed, Issue Health
  - Bus Factor, Releases, Fork Activity, License, Repo Size, Tech Stack, Dependencies
- File tree browser with folder/file icons
- GitHub-styled README rendering (headings, code blocks, tables, images, badges)
- Tabs: Code, Issues, Pull Requests, Discussions, Actions, Releases, Insights, Security
- Copy-paste README badges
- "Open in Editor" button

### Code Editor (`/:owner/:repo/editor`)
- Browse repository file tree
- Select or create branches
- Edit files with syntax highlighting (JS, TS, Python, Rust, Go, Java, C++, HTML, CSS, JSON)
- Commit changes with message
- Create Pull Requests with title and description
- Full diff awareness (modified indicator)

### User Profiles (`/:username`)
- **8 Profile Analysis Tools**: Total Stars, Forks, Follower Ratio, Account Age, Repos, Orgs, Top Repo, Top Languages
- Profile README (fetched from `username/username` repo)
- Tabs: Overview (README) + Repositories
- Organization memberships

### Compare Page (`/compare`)
- **Repo vs Repo**: Stars, Forks, Issues, Watchers, Size, Contributors, Languages — with visual progress bars
- **User vs User**: Followers, Following, Public Repos, Gists — with winner highlights

### Components Marketplace (`/components`)
- **15 User/Org components**: Stats Card, Streak, Top Languages, Trophy, Activity Graph, Profile Views, Typing SVG, Snake Graph, Summary Cards, Social Badges, and more
- **15 Repository components**: Star History, Badges (stars/forks/issues/license/size/commits), Repo Pin Card, Build Status, Downloads, and more
- `{{username}}` and `{{owner}}/{{repo}}` placeholder system
- Live image preview
- One-click copy to clipboard

### Dashboard (`/dashboard`) — Authenticated
- All repositories including **private repos**
- Total stars, forks, private repo count
- Language distribution chart
- Organization switcher
- Tabs: Repos, Activity, Issues, Top Repos, **Tools**
- Dashboard Tools: Repo Health Summary table, Stale Repos Alert, Open PR Tracker, Star Leaders

### CMS Admin (`/admin/cms`) — Admin Only
- Manage top announcements (colored gradient bars)
- Manage between-section banner ads (image + text with gradient fade)
- Manage sponsored repository cards
- All images via URL links (no uploads)
- Overview analytics (D1-connected)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5 |
| Styling | TailwindCSS 3 (dark mode only) |
| Animations | Framer Motion |
| Data | TanStack Query (React Query) |
| Editor | CodeMirror 6 (lazy-loaded) |
| Routing | React Router 6 |
| SEO | react-helmet-async |
| Hosting | Cloudflare Pages |
| Backend | Cloudflare Functions (serverless) |
| Database | Cloudflare D1 (SQLite) |
| Auth | GitHub OAuth |

---

## Design

- **Brand Colors**: `#1B1B1B` (primary) + `#00bf63` (accent green)
- **Dark mode only** — no light theme
- **Font**: Inter (UI) + JetBrains Mono (code/headings)
- **Hero**: Matrix Digital Rain with hover spotlight reveal
- **Cards**: Glassmorphism with subtle borders
- **Responsive**: Mobile-first, tools as horizontal sliders on small screens

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, trending, discovery, contributors |
| `/explore` | Explore with language/time/sort filters + pagination |
| `/search` | Full search page for repos and users |
| `/components` | README component marketplace (30 components) |
| `/compare` | Side-by-side comparison tool |
| `/dashboard` | Authenticated user dashboard |
| `/about` | Platform introduction and features |
| `/support` | Contact and social links |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/admin/cms` | CMS admin panel (admin-only) |
| `/:username` | User profile with README + repos |
| `/orgs/:orgname` | Organization page with README + repos |
| `/:owner/:repo` | Repository detail with 12 analysis tools |
| `/:owner/:repo/editor` | Code editor with PR creation |

---

## Quick Start

```bash
git clone https://github.com/truehannan/scotium-dev.git
cd scotium-dev
npm install
```

Create `.env.local`:
```env
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
```

Run locally:
```bash
npm run dev
```

Build:
```bash
npm run build
```

---

## Deploy to Cloudflare Pages

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
6. Run D1 migration: `wrangler d1 migrations apply scotium`

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_GITHUB_CLIENT_ID` | Frontend (.env) | GitHub OAuth App Client ID |
| `VITE_GITHUB_REDIRECT_URI` | Frontend (.env) | OAuth callback URL |
| `GITHUB_CLIENT_ID` | Cloudflare (wrangler.toml) | Same Client ID for Functions |
| `GITHUB_CLIENT_SECRET` | Cloudflare (dashboard) | OAuth App Secret (never commit!) |

---

## Database

Cloudflare D1 with tables:
- `users` — OAuth sessions
- `favorites` — Saved repositories
- `cms_announcements` — Top bar announcements
- `cms_banners` — Section banner ads
- `cms_sponsored_repos` — Sponsored repo cards
- `components` — User-submitted README components

---

## For AI Agents

Scotium is a React SPA that wraps the GitHub REST API with added analysis tools. Key points:

- All data comes from `https://api.github.com` endpoints
- Authentication is optional (increases rate limit from 60 to 5000 req/hour)
- The `/about` page explains all features in plain text
- Routes follow GitHub's URL structure (`/:owner/:repo`)
- No server-side rendering — pure client-side React
- Cloudflare Functions handle only OAuth token exchange and CMS data

---

## License

MIT

---

<p align="center">
  Built by <a href="https://hannan.page.dev"><strong>Hannan</strong></a>
</p>
