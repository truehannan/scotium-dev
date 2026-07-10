import { Star, GitFork, BarChart3, Calendar, Package, Building, Trophy, Code } from 'lucide-react';
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
  const mostStarred = allRepos.length ? [...allRepos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0] : null;

  const tools = [
    { Icon: Star, label: 'Total Stars', value: formatNum(totalStars), color: 'text-yellow-400' },
    { Icon: GitFork, label: 'Total Forks', value: formatNum(totalForks), color: 'text-accent-blue' },
    { Icon: BarChart3, label: 'Follower Ratio', value: `${ratio}x`, color: parseFloat(ratio) >= 2 ? 'text-green-400' : 'text-gray-300' },
    { Icon: Calendar, label: 'Account Age', value: `${accountAge}y`, color: 'text-accent-purple' },
    { Icon: Package, label: 'Repositories', value: String(user.public_repos), color: 'text-white' },
    { Icon: Building, label: 'Organizations', value: String(orgs?.length || 0), color: 'text-accent-cyan' },
    { Icon: Trophy, label: 'Top Repo', value: mostStarred?.name?.slice(0, 12) || 'N/A', color: 'text-secondary' },
    { Icon: Code, label: 'Top Lang', value: topLangs[0]?.[0] || 'N/A', color: 'text-white' },
  ];

  return (
    <>
      <div className="lg:hidden mb-4 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {tools.map(t => (
            <div key={t.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-light/80 border border-white/[0.04] flex-shrink-0">
              <t.Icon className={`w-3 h-3 ${t.color}`} />
              <span className="text-[10px] text-gray-500">{t.label}</span>
              <span className={`text-[11px] font-bold ${t.color}`}>{t.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden lg:grid grid-cols-2 gap-1.5 mt-4">
        {tools.map(t => (
          <div key={t.label} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
            <t.Icon className={`w-3.5 h-3.5 ${t.color}`} />
            <div className="min-w-0">
              <p className={`text-[11px] font-bold ${t.color} truncate`}>{t.value}</p>
              <p className="text-[9px] text-gray-500">{t.label}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
