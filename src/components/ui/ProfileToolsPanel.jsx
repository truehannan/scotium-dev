import { formatNum } from '../../utils/github';

export default function ProfileToolsPanel({ user, repos, orgs }) {
  if (!user) return null;

  const allRepos = repos || [];
  const totalStars = allRepos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = allRepos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const languages = {};
  allRepos.forEach(r => { if (r.language) languages[r.language] = (languages[r.language] || 0) + 1; });
  const topLangs = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const ratio = user.followers && user.following ? (user.followers / Math.max(user.following, 1)).toFixed(1) : '0';
  const accountAge = Math.floor((Date.now() - new Date(user.created_at)) / (86400000 * 365));
  const avgStars = allRepos.length ? Math.round(totalStars / allRepos.length) : 0;
  const mostStarred = allRepos.length ? allRepos.sort((a, b) => b.stargazers_count - a.stargazers_count)[0] : null;

  const tools = [
    { icon: '⭐', label: 'Total Stars', value: formatNum(totalStars), color: 'text-yellow-400', detail: `Avg ${avgStars} per repo` },
    { icon: '🔀', label: 'Total Forks', value: formatNum(totalForks), color: 'text-accent-blue' },
    { icon: '📊', label: 'Follower Ratio', value: `${ratio}x`, color: parseFloat(ratio) >= 2 ? 'text-green-400' : 'text-gray-300', detail: `${formatNum(user.followers)} followers / ${formatNum(user.following)} following` },
    { icon: '📅', label: 'Account Age', value: `${accountAge}y`, color: 'text-accent-purple', detail: `Joined ${new Date(user.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}` },
    { icon: '📦', label: 'Repositories', value: user.public_repos + (user.total_private_repos || 0), color: 'text-white', detail: `${user.public_repos} public${user.total_private_repos ? `, ${user.total_private_repos} private` : ''}` },
    { icon: '🏢', label: 'Organizations', value: orgs?.length || 0, color: 'text-accent-cyan' },
    { icon: '🏆', label: 'Top Repo', value: mostStarred?.name || 'N/A', color: 'text-secondary', detail: mostStarred ? `★ ${formatNum(mostStarred.stargazers_count)}` : '' },
    { icon: '💻', label: 'Top Languages', value: topLangs.length > 0 ? topLangs[0][0] : 'N/A', color: 'text-white', detail: topLangs.slice(1, 4).map(l => l[0]).join(', ') },
  ];

  return (
    <>
      {/* Mobile: horizontal slider */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-3 pb-3 min-w-max">
          {tools.map(t => (
            <div key={t.label} className="w-[180px] flex-shrink-0 card-glass p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{t.icon}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t.label}</span>
              </div>
              <p className={`text-lg font-bold ${t.color}`}>{t.value}</p>
              {t.detail && <p className="text-[10px] text-gray-500 mt-0.5">{t.detail}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid below profile card */}
      <div className="hidden lg:grid grid-cols-2 gap-2 mt-4">
        {tools.map(t => (
          <div key={t.label} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
            <span className="text-sm">{t.icon}</span>
            <div className="min-w-0">
              <p className={`text-xs font-bold ${t.color} truncate`}>{t.value}</p>
              <p className="text-[9px] text-gray-500">{t.label}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
