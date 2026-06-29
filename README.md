# Scotium

Discover trending GitHub repositories, explore open source projects, and connect with developers.

## Features

- Trending repos feed with language/time filters
- User profile pages with repos and org memberships
- Organization pages with members and repos
- Search across GitHub repos and users
- GitHub OAuth for accessing private repos
- Dark mode design (black + green theme)
- Deployed on Cloudflare Pages

## Tech Stack

- React 18 + Vite
- TailwindCSS (dark mode only)
- React Router v6
- TanStack Query (React Query)
- Axios
- Cloudflare Pages + Functions
- D1 Database

## Quick Start

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Deploy

Push to GitHub and connect to Cloudflare Pages:
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variables in Cloudflare dashboard

## Pages

| Route | Description |
|-------|-------------|
| `/` | Trending repos feed |
| `/explore` | Extended explore with filters |
| `/search` | Search repos and users |
| `/:username` | User profile + repos |
| `/orgs/:orgname` | Organization page |
| `/support` | Contact & support |
| `/auth/callback` | OAuth handler |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## License

MIT
