import { Link } from 'react-router-dom';
import SEO from '../components/ui/SEO';

const FEATURES = [
  {
    icon: 'chart',
    title: 'Repository Analysis',
    desc: '12 analysis tools for any GitHub repository — Health Score, Bus Factor, PR Merge Speed, Issue Health, Tech Stack detection, and more. Instantly understand any project\'s health.',
    link: null,
  },
  {
    icon: 'user',
    title: 'Profile Insights',
    desc: '8 tools for GitHub profiles — Total Stars, Follower Ratio, Account Age, Top Languages, Organization memberships. See any developer at a glance.',
    link: null,
  },
  {
    icon: 'compare',
    title: 'Compare',
    desc: 'Side-by-side comparison of repositories or users. Visual progress bars show who wins on stars, forks, contributors, and more.',
    link: '/compare',
  },
  {
    icon: 'puzzle',
    title: 'README Components',
    desc: '30 ready-to-copy components for your GitHub README — stats cards, streak counters, trophies, activity graphs, badges. Just enter your username and copy.',
    link: '/components',
  },
  {
    icon: 'edit',
    title: 'Code Editor',
    desc: 'Browse any repository\'s files, edit code with syntax highlighting, create branches, commit changes, and open Pull Requests — all without leaving Scotium.',
    link: null,
  },
  {
    icon: 'search',
    title: 'Discovery Engine',
    desc: 'Find Rising Stars (new repos gaining traction), Undiscovered Gems (active but low-star repos), Most Forked projects, and recently active popular repos.',
    link: '/',
  },
  {
    icon: 'trending',
    title: 'Dashboard',
    desc: 'Your personal GitHub command center. View all repos (including private), track stale repos, monitor open PRs, and see star rankings across your projects.',
    link: '/dashboard',
  },
  {
    icon: 'find',
    title: 'Smart Search',
    desc: 'Cmd+K search modal with live results as you type. Find repositories and users instantly without leaving the current page.',
    link: null,
  },
];

const PAGES = [
  { route: '/', name: 'Homepage', desc: 'Trending repos, discovery tools, popular developers' },
  { route: '/explore', name: 'Explore', desc: 'Filter repos by language, time range, and sort order' },
  { route: '/components', name: 'Components', desc: '30 README components with live preview' },
  { route: '/compare', name: 'Compare', desc: 'Repo vs Repo, User vs User comparisons' },
  { route: '/dashboard', name: 'Dashboard', desc: 'Your repos, stats, activity, and tools (auth required)' },
  { route: '/:username', name: 'User Profile', desc: 'Profile README, repos, orgs, analysis tools' },
  { route: '/:owner/:repo', name: 'Repo Detail', desc: '12 analysis tools, file tree, README, issues, PRs' },
  { route: '/:owner/:repo/editor', name: 'Code Editor', desc: 'Edit files, create branches, commit, open PRs' },
  { route: '/search', name: 'Search', desc: 'Full search results page for repos and users' },
  { route: '/support', name: 'Support', desc: 'Contact and social links' },
];

export default function AboutPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="About Scotium - The GitHub Power-User Platform"
        description="Scotium is a GitHub wrapper that adds analysis tools, health scores, README components, a code editor, comparison tools, and discovery features to any GitHub repository or profile."
        canonical="/about"
      />

      {/* Hero */}
      <div className="text-center mb-16">
        <img src="/logo.png" alt="Scotium" className="h-8 mx-auto mb-6 opacity-80" />
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono leading-tight">
          The GitHub<br />Power-User Platform
        </h1>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto leading-relaxed">
          Scotium wraps the GitHub API with analysis tools, health scores, README components,
          a built-in code editor, comparison tools, and a discovery engine.
          It gives you insights and utilities that GitHub doesn't surface natively.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary text-sm">Explore Repos</Link>
          <Link to="/components" className="btn-outline text-sm">README Components</Link>
        </div>
      </div>

      {/* What Scotium Does */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6 text-center">What Scotium Does</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card group">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold flex-shrink-0">{f.icon[0].toUpperCase()}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-secondary transition-colors">
                    {f.link ? <Link to={f.link}>{f.title}</Link> : f.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6 text-center">How It Works</h2>
        <div className="card-glass p-6">
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <p>
              Scotium is a <strong className="text-white">client-side React application</strong> that communicates
              directly with the <strong className="text-white">GitHub REST API</strong>. It adds a layer of
              analysis, visualization, and tools on top of raw GitHub data.
            </p>
            <p>
              <strong className="text-white">No account required</strong> for browsing public data.
              Sign in with GitHub OAuth to access private repos, the dashboard, and the code editor
              (which requires write permissions to create commits and PRs).
            </p>
            <p>
              <strong className="text-white">For AI agents and automated tools:</strong> Scotium is a
              single-page application (SPA) deployed on Cloudflare Pages. All data is fetched from
              <code className="text-secondary mx-1">api.github.com</code> endpoints. Routes follow
              GitHub's URL structure. The <code className="text-secondary mx-1">/about</code> page
              (this page) provides a complete overview of all features and capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* All Pages */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6 text-center">All Pages</h2>
        <div className="space-y-2">
          {PAGES.map(p => (
            <div key={p.route} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
              <code className="text-xs text-secondary font-mono w-40 flex-shrink-0 truncate">{p.route}</code>
              <div className="min-w-0">
                <span className="text-sm text-white font-medium">{p.name}</span>
                <span className="text-xs text-gray-500 ml-2">{p.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis Tools Summary */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6 text-center">34 Built-in Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ToolGroup title="Repo Analysis (12)" items={['Health Score', 'Stars', 'Last Commit', 'PR Merge Speed', 'Issue Health', 'Bus Factor', 'Releases', 'Fork Activity', 'License', 'Repo Size', 'Tech Stack', 'Dependencies']} />
          <ToolGroup title="Profile Analysis (8)" items={['Total Stars', 'Total Forks', 'Follower Ratio', 'Account Age', 'Repositories', 'Organizations', 'Top Repo', 'Top Languages']} />
          <ToolGroup title="Discovery + Dashboard (10)" items={['Rising Stars', 'Undiscovered Gems', 'Most Forked', 'Active Giants', 'Repo Health Table', 'Stale Repos Alert', 'Open PR Tracker', 'Star Leaders', 'Repo vs Repo', 'User vs User']} />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {['React 18', 'Vite 5', 'TailwindCSS', 'Framer Motion', 'CodeMirror', 'TanStack Query', 'React Router', 'Cloudflare Pages', 'Cloudflare D1', 'GitHub OAuth'].map(t => (
            <span key={t} className="badge bg-secondary/10 text-secondary text-xs px-3 py-1.5">{t}</span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-white/[0.04]">
        <p className="text-sm text-gray-500">
          Built by <a href="https://hannan.page.dev" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-medium">Hannan</a>
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
          <a href="https://github.com/truehannan/scotium-dev" target="_blank" rel="noopener noreferrer" className="hover:text-secondary">Source Code</a>
          <Link to="/support" className="hover:text-secondary">Contact</Link>
          <Link to="/privacy" className="hover:text-secondary">Privacy</Link>
          <Link to="/terms" className="hover:text-secondary">Terms</Link>
        </div>
      </div>
    </div>
  );
}

function ToolGroup({ title, items }) {
  return (
    <div className="card">
      <h3 className="text-xs font-semibold text-white mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item} className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-secondary flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
