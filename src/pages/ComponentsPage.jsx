import { useState, useMemo } from 'react';
import SEO from '../components/ui/SEO';

// ===== USER / ORG COMPONENTS =====
const USER_COMPONENTS = [
  { id: 'u1', title: 'GitHub Stats Card', desc: 'Detailed stats: stars, commits, PRs, issues, contributions.', code: '![{{username}} Stats](https://github-readme-stats.vercel.app/api?username={{username}}&show_icons=true&theme=dark&bg_color=1B1B1B&border_color=3a3a3a&icon_color=00bf63&title_color=00bf63&text_color=ffffff)' },
  { id: 'u2', title: 'Streak Stats', desc: 'Current streak, longest streak, total contributions.', code: '![Streak](https://streak-stats.demolab.com?user={{username}}&theme=dark&background=1B1B1B&border=3a3a3a&ring=00bf63&fire=00bf63&currStreakLabel=00bf63)' },
  { id: 'u3', title: 'Top Languages (Compact)', desc: 'Most used languages across all repos.', code: '![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username={{username}}&layout=compact&theme=dark&bg_color=1B1B1B&border_color=3a3a3a&title_color=00bf63)' },
  { id: 'u4', title: 'Top Languages (Pie)', desc: 'Language breakdown in donut chart.', code: '![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username={{username}}&layout=donut&theme=dark&bg_color=1B1B1B&border_color=3a3a3a&title_color=00bf63)' },
  { id: 'u5', title: 'Profile Trophy', desc: 'Dynamic GitHub achievements and trophies.', code: '![Trophy](https://github-profile-trophy.vercel.app/?username={{username}}&theme=darkhub&no-bg=true&no-frame=true&margin-w=10&column=7)' },
  { id: 'u6', title: 'Activity Graph', desc: 'Contribution activity graph for the last 31 days.', code: '![Activity](https://github-readme-activity-graph.vercel.app/graph?username={{username}}&theme=github-dark&bg_color=1B1B1B&color=00bf63&line=00bf63&point=ffffff&area=true&hide_border=true)' },
  { id: 'u7', title: 'Profile Views Counter', desc: 'Track how many people view your profile.', code: '![Views](https://komarev.com/ghpvc/?username={{username}}&color=00bf63&style=for-the-badge&label=PROFILE+VIEWS)' },
  { id: 'u8', title: 'Typing SVG', desc: 'Animated typing text for your profile.', code: '[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=24&pause=1000&color=00BF63&width=500&lines=Hello+World!+I\'m+{{username}};Full+Stack+Developer;Open+Source+Contributor)](https://git.io/typing-svg)' },
  { id: 'u9', title: 'GitHub Followers Badge', desc: 'Show follower count as badge.', code: '![Followers](https://img.shields.io/github/followers/{{username}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B&logo=github)' },
  { id: 'u10', title: 'GitHub Stars Badge', desc: 'Total stars across all repos.', code: '![Stars](https://img.shields.io/github/stars/{{username}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B&logo=github&label=Total%20Stars&affiliations=OWNER)' },
  { id: 'u11', title: 'Snake Contribution Graph', desc: 'Animated snake eating your contribution graph.', code: '![Snake](https://raw.githubusercontent.com/{{username}}/{{username}}/output/github-contribution-grid-snake-dark.svg)' },
  { id: 'u12', title: 'Summary Card', desc: 'GitHub profile summary with stats.', code: '![Summary](https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username={{username}}&theme=github_dark)' },
  { id: 'u13', title: 'Productive Time', desc: 'Shows when you commit most often.', code: '![Productive Time](https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username={{username}}&theme=github_dark&utcOffset=0)' },
  { id: 'u14', title: 'Stats by Repo', desc: 'Commits per repo breakdown.', code: '![Repos](https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username={{username}}&theme=github_dark)' },
  { id: 'u15', title: 'Social Badges', desc: 'GitHub + Twitter + Portfolio links as badges.', code: '[![GitHub](https://img.shields.io/badge/GitHub-{{username}}-00bf63?style=for-the-badge&logo=github&logoColor=white)](https://github.com/{{username}}) [![Twitter](https://img.shields.io/badge/Twitter-{{username}}-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/{{username}})' },
];

// ===== REPOSITORY COMPONENTS =====
const REPO_COMPONENTS = [
  { id: 'r1', title: 'Star History Chart', desc: 'Star growth over time as an SVG chart.', code: '[![Star History](https://api.star-history.com/svg?repos={{owner}}/{{repo}}&type=Date&theme=dark)](https://star-history.com/#{{owner}}/{{repo}}&Date)' },
  { id: 'r2', title: 'Stars Badge', desc: 'Stars count shield badge.', code: '![Stars](https://img.shields.io/github/stars/{{owner}}/{{repo}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B)' },
  { id: 'r3', title: 'Forks Badge', desc: 'Fork count shield badge.', code: '![Forks](https://img.shields.io/github/forks/{{owner}}/{{repo}}?style=for-the-badge&color=3b82f6&labelColor=1B1B1B)' },
  { id: 'r4', title: 'Issues Badge', desc: 'Open issues count badge.', code: '![Issues](https://img.shields.io/github/issues/{{owner}}/{{repo}}?style=for-the-badge&color=f59e0b&labelColor=1B1B1B)' },
  { id: 'r5', title: 'License Badge', desc: 'License type badge.', code: '![License](https://img.shields.io/github/license/{{owner}}/{{repo}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B)' },
  { id: 'r6', title: 'Last Commit', desc: 'Time since last commit.', code: '![Last Commit](https://img.shields.io/github/last-commit/{{owner}}/{{repo}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B)' },
  { id: 'r7', title: 'Repo Size', desc: 'Repository size badge.', code: '![Size](https://img.shields.io/github/repo-size/{{owner}}/{{repo}}?style=for-the-badge&color=8b5cf6&labelColor=1B1B1B)' },
  { id: 'r8', title: 'Top Language', desc: 'Primary language of the repo.', code: '![Language](https://img.shields.io/github/languages/top/{{owner}}/{{repo}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B)' },
  { id: 'r9', title: 'Contributors Count', desc: 'Number of contributors.', code: '![Contributors](https://img.shields.io/github/contributors/{{owner}}/{{repo}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B)' },
  { id: 'r10', title: 'Release Version', desc: 'Latest release version badge.', code: '![Release](https://img.shields.io/github/v/release/{{owner}}/{{repo}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B)' },
  { id: 'r11', title: 'Downloads Count', desc: 'Total downloads for releases.', code: '![Downloads](https://img.shields.io/github/downloads/{{owner}}/{{repo}}/total?style=for-the-badge&color=00bf63&labelColor=1B1B1B)' },
  { id: 'r12', title: 'Build Status (Actions)', desc: 'GitHub Actions workflow status.', code: '![Build](https://img.shields.io/github/actions/workflow/status/{{owner}}/{{repo}}/ci.yml?style=for-the-badge&labelColor=1B1B1B)' },
  { id: 'r13', title: 'Open PRs', desc: 'Open pull requests count.', code: '![PRs](https://img.shields.io/github/issues-pr/{{owner}}/{{repo}}?style=for-the-badge&color=8b5cf6&labelColor=1B1B1B&label=PRs)' },
  { id: 'r14', title: 'Repo Card (Pin)', desc: 'Embeddable repo card for READMEs.', code: '[![{{repo}}](https://github-readme-stats.vercel.app/api/pin/?username={{owner}}&repo={{repo}}&theme=dark&bg_color=1B1B1B&border_color=3a3a3a&icon_color=00bf63&title_color=00bf63)](https://github.com/{{owner}}/{{repo}})' },
  { id: 'r15', title: 'Commit Activity', desc: 'Commits per week sparkline.', code: '![Commits](https://img.shields.io/github/commit-activity/w/{{owner}}/{{repo}}?style=for-the-badge&color=00bf63&labelColor=1B1B1B&label=Commits/Week)' },
];

export default function ComponentsPage() {
  const [tab, setTab] = useState('user');
  const [username, setUsername] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [copied, setCopied] = useState('');

  const components = tab === 'user' ? USER_COMPONENTS : REPO_COMPONENTS;

  const renderCode = (code) => {
    if (tab === 'user') return code.replace(/\{\{username\}\}/g, username || '{{username}}');
    return code.replace(/\{\{owner\}\}/g, owner || '{{owner}}').replace(/\{\{repo\}\}/g, repo || '{{repo}}');
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(renderCode(code));
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const getPreviewUrl = (code) => {
    const rendered = renderCode(code);
    const match = rendered.match(/\(([^)]+)\)/);
    return match?.[1];
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title="README Components" description="Copy-paste GitHub README components for profiles and repositories" canonical="/components" />

      <div className="mb-8">
        <h1 className="section-title">README Components</h1>
        <p className="text-sm text-gray-400 mt-1">Hardcoded, ready-to-copy components for your GitHub README. Enter your details below.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 border-b border-white/[0.06] mb-6">
        <button onClick={() => setTab('user')} className={`px-4 py-3 text-sm ${tab === 'user' ? 'tab-active' : 'tab-inactive'}`}>
          User / Org <span className="text-[10px] ml-1 bg-gray-700/60 px-1.5 py-0.5 rounded-full">{USER_COMPONENTS.length}</span>
        </button>
        <button onClick={() => setTab('repo')} className={`px-4 py-3 text-sm ${tab === 'repo' ? 'tab-active' : 'tab-inactive'}`}>
          Repository <span className="text-[10px] ml-1 bg-gray-700/60 px-1.5 py-0.5 rounded-full">{REPO_COMPONENTS.length}</span>
        </button>
      </div>

      {/* Input header */}
      {tab === 'user' ? (
        <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="text-sm font-medium text-gray-300 flex-shrink-0">GitHub Username:</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. truehannan" className="input-field text-sm flex-1 max-w-xs" />
          <code className="text-[11px] text-gray-500 bg-primary-dark px-2 py-1 rounded">{'{{username}}'} → {username || '...'}</code>
        </div>
      ) : (
        <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <label className="text-sm font-medium text-gray-300 flex-shrink-0">Repository:</label>
          <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="owner" className="input-field text-sm w-36" />
          <span className="text-gray-500">/</span>
          <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="repo" className="input-field text-sm w-36" />
          <code className="text-[11px] text-gray-500 bg-primary-dark px-2 py-1 rounded">{'{{owner}}/{{repo}}'} → {owner || '...'}/{repo || '...'}</code>
        </div>
      )}

      {/* Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {components.map(comp => {
          const previewUrl = getPreviewUrl(comp.code);
          const hasValues = tab === 'user' ? !!username : (!!owner && !!repo);
          return (
            <div key={comp.id} className="card">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">{comp.title}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">{comp.desc}</p>
              </div>

              {/* Preview image */}
              {hasValues && previewUrl && !previewUrl.includes('{{') && (
                <div className="mb-3 rounded-lg overflow-hidden bg-primary-dark border border-gray-800/40 p-2">
                  <img src={previewUrl} alt={comp.title} className="max-w-full h-auto" onError={e => { e.target.style.display = 'none'; }} loading="lazy" />
                </div>
              )}

              {/* Code block */}
              <div className="bg-primary-dark rounded-xl border border-gray-800/40 p-3 mb-3 overflow-x-auto">
                <pre className="text-[11px] font-mono text-gray-400 whitespace-pre-wrap break-all">{renderCode(comp.code)}</pre>
              </div>

              <button onClick={() => copyCode(comp.code, comp.id)} className={`w-full py-2 rounded-xl text-xs font-medium transition-all ${copied === comp.id ? 'bg-secondary/10 text-secondary border border-secondary/30' : 'bg-white/[0.03] text-gray-400 border border-gray-700 hover:border-secondary/30 hover:text-white'}`}>
                {copied === comp.id ? '✓ Copied!' : 'Copy Markdown'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
