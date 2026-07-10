import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchAuthRepos, fetchUserEvents, fetchUserIssues, fetchUserOrgs, fetchOrgRepos, formatNum, formatDate, LANG_COLORS } from '../utils/github';
import RepoCard from '../components/ui/RepoCard';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link, Navigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [activeOrg, setActiveOrg] = useState(null);
  const [tab, setTab] = useState('repos');

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ['dash-repos', user?.login, activeOrg],
    queryFn: () => activeOrg ? fetchOrgRepos(activeOrg, 1, 50, token) : fetchAuthRepos('updated', 1, 50, token),
    enabled: !!user,
  });
  const { data: events } = useQuery({ queryKey: ['dash-events', user?.login], queryFn: () => fetchUserEvents(user.login, 1, token), enabled: !!user });
  const { data: issues } = useQuery({ queryKey: ['dash-issues'], queryFn: () => fetchUserIssues(token), enabled: !!user });
  const { data: orgs } = useQuery({ queryKey: ['dash-orgs', user?.login], queryFn: () => fetchUserOrgs(user.login, token), enabled: !!user });

  if (authLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/" replace />;

  const allRepos = repos || [];
  const topRepos = [...allRepos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
  const totalStars = allRepos.reduce((a, r) => a + r.stargazers_count, 0);
  const totalForks = allRepos.reduce((a, r) => a + r.forks_count, 0);
  const privateCount = allRepos.filter(r => r.private).length;

  // Language distribution
  const langCount = {};
  allRepos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title="Dashboard" canonical="/dashboard" />

      {/* Profile + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-glass flex flex-col items-center py-6">
          <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full ring-2 ring-secondary/20" />
          <h2 className="text-lg font-bold text-white mt-3">{user.name || user.login}</h2>
          <p className="text-xs text-gray-500">@{user.login}</p>
          {user.bio && <p className="text-[11px] text-gray-400 text-center mt-2 max-w-[200px]">{user.bio}</p>}
        </div>
        <StatCard label="Total Stars" value={formatNum(totalStars)} icon="★" color="text-yellow-400" />
        <StatCard label="Total Forks" value={formatNum(totalForks)} icon="⑂" color="text-blue-400" />
        <StatCard label="Private Repos" value={privateCount} icon="" color="text-purple-400" />
      </div>

      {/* Language Breakdown */}
      {topLangs.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Languages</h3>
          <div className="flex rounded-full h-2.5 overflow-hidden mb-2">
            {topLangs.map(([lang, count]) => (
              <div key={lang} style={{ width: `${(count / allRepos.length) * 100}%`, backgroundColor: LANG_COLORS[lang] || '#6b7280' }} title={lang} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
            {topLangs.map(([lang, count]) => (
              <span key={lang} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[lang] || '#6b7280' }} />{lang} ({count})</span>
            ))}
          </div>
        </div>
      )}

      {/* Org Switcher */}
      {orgs && orgs.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setActiveOrg(null)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${!activeOrg ? 'bg-secondary/10 text-secondary border-secondary/30' : 'text-gray-400 border-gray-700 hover:border-gray-600'}`}>
            <img src={user.avatar_url} alt="" className="w-4 h-4 rounded" /> My Repos
          </button>
          {orgs.map(org => (
            <button key={org.id} onClick={() => setActiveOrg(org.login)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${activeOrg === org.login ? 'bg-secondary/10 text-secondary border-secondary/30' : 'text-gray-400 border-gray-700 hover:border-gray-600'}`}>
              <img src={org.avatar_url} alt="" className="w-4 h-4 rounded" /> {org.login}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-white/[0.06] mb-6">
        {['repos', 'activity', 'issues', 'top', 'tools'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}>{t === 'top' ? 'Top Repos' : t}</button>
        ))}
      </div>

      {/* Content */}
      {tab === 'repos' && (
        reposLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allRepos.map(r => <RepoCard key={r.id} repo={r} />)}
          </div>
        )
      )}
      {tab === 'activity' && (
        <div className="space-y-2">
          {(events || []).slice(0, 15).map((e, i) => (
            <div key={`${e.id}-${i}`} className="card flex items-start gap-3">
              <span className="text-base">{e.type.replace('Event', '')}</span>
              <div><p className="text-sm text-white"><span className="font-medium">{e.type.replace('Event', '')}</span>{e.repo && <span className="text-gray-400 ml-1">in <Link to={`/${e.repo.name}`} className="text-secondary">{e.repo.name}</Link></span>}</p><p className="text-[11px] text-gray-500">{formatDate(e.created_at)}</p></div>
            </div>
          ))}
        </div>
      )}
      {tab === 'issues' && (
        <div className="space-y-2">
          {(issues || []).map(issue => (
            <a key={issue.id} href={issue.html_url} target="_blank" rel="noopener noreferrer" className="card flex items-start gap-3 group">
              <span className="w-3 h-3 rounded-full mt-1 bg-green-500 flex-shrink-0" />
              <div><p className="text-sm font-medium text-white group-hover:text-secondary">{issue.title}</p><p className="text-[11px] text-gray-500">#{issue.number} • {formatDate(issue.updated_at)}</p></div>
            </a>
          ))}
        </div>
      )}
      {tab === 'top' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{topRepos.map(r => <RepoCard key={r.id} repo={r} />)}</div>}

      {/* TOOLS TAB */}
      {tab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Repo Health Summary */}
          <div className="card col-span-full">
            <h3 className="text-sm font-semibold text-white mb-3">Repo Health Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 text-left"><th className="pb-2">Repo</th><th className="pb-2">Stars</th><th className="pb-2">Issues</th><th className="pb-2">Language</th><th className="pb-2">Updated</th></tr></thead>
                <tbody>
                  {allRepos.slice(0, 10).map(r => (
                    <tr key={r.id} className="border-t border-gray-800/40">
                      <td className="py-2"><Link to={`/${r.full_name}`} className="text-secondary hover:underline">{r.name}</Link>{r.private && <span className="ml-1 text-[9px] text-yellow-400"></span>}</td>
                      <td className="py-2 text-gray-400">★ {formatNum(r.stargazers_count)}</td>
                      <td className="py-2 text-gray-400">{r.open_issues_count}</td>
                      <td className="py-2 text-gray-400">{r.language || '—'}</td>
                      <td className="py-2 text-gray-500">{formatDate(r.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stale Repos Alert */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Stale Repos</h3>
            <p className="text-[10px] text-gray-500 mb-2">Repos with no updates in 90+ days</p>
            {(() => {
              const stale = allRepos.filter(r => (Date.now() - new Date(r.pushed_at)) / 86400000 > 90);
              return stale.length > 0 ? (
                <div className="space-y-1.5">{stale.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <Link to={`/${r.full_name}`} className="text-xs text-gray-300 hover:text-secondary">{r.name}</Link>
                    <span className="text-[10px] text-red-400">{Math.floor((Date.now() - new Date(r.pushed_at)) / 86400000)}d inactive</span>
                  </div>
                ))}</div>
              ) : <p className="text-xs text-green-400">✓ All repos are active!</p>;
            })()}
          </div>

          {/* Open PR Tracker */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Open PRs</h3>
            <p className="text-[10px] text-gray-500 mb-2">Your open pull requests across repos</p>
            {issues?.filter(i => i.pull_request).length > 0 ? (
              <div className="space-y-1.5">{issues.filter(i => i.pull_request).slice(0, 5).map(pr => (
                <a key={pr.id} href={pr.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.03] group">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-300 group-hover:text-secondary truncate">{pr.title}</span>
                </a>
              ))}</div>
            ) : <p className="text-xs text-gray-500">No open PRs</p>}
          </div>

          {/* Star Trends */}
          <div className="card col-span-full">
            <h3 className="text-sm font-semibold text-white mb-3">Star Leaders</h3>
            <p className="text-[10px] text-gray-500 mb-2">Your repos ranked by stars</p>
            <div className="space-y-1.5">
              {topRepos.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-gray-500 font-bold w-5">#{i + 1}</span>
                  <Link to={`/${r.full_name}`} className="text-xs text-gray-300 hover:text-secondary flex-1 truncate">{r.name}</Link>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: `${(r.stargazers_count / Math.max(topRepos[0]?.stargazers_count || 1, 1)) * 100}%` }} /></div>
                    <span className="text-[10px] text-yellow-400 w-10 text-right">★ {formatNum(r.stargazers_count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card-glass flex flex-col items-center justify-center py-6">
      <span className={`text-2xl ${color}`}>{icon}</span>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}
