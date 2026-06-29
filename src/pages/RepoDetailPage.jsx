import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRepo, fetchRepoReadme, fetchRepoContents, fetchRepoIssues, fetchRepoPulls, fetchRepoContributors, fetchRepoLanguages, fetchRepoReleases, fetchRepoCommits, formatNum, formatDate, LANG_COLORS } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MarkdownReadme from '../components/ui/MarkdownReadme';
import { useState } from 'react';

export default function RepoDetailPage() {
  const { owner, repo, tab } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const activeTab = tab || 'code';
  const [copiedBadge, setCopiedBadge] = useState('');

  const { data: repoData, isLoading, error } = useQuery({ queryKey: ['repo', owner, repo], queryFn: () => fetchRepo(owner, repo, token) });
  const { data: readme } = useQuery({ queryKey: ['repo-readme', owner, repo], queryFn: () => fetchRepoReadme(owner, repo, token), enabled: activeTab === 'code' });
  const { data: contents } = useQuery({ queryKey: ['repo-contents', owner, repo], queryFn: () => fetchRepoContents(owner, repo, '', '', token), enabled: activeTab === 'code' });
  const { data: issues } = useQuery({ queryKey: ['repo-issues', owner, repo], queryFn: () => fetchRepoIssues(owner, repo, 'open', 1, token), enabled: activeTab === 'issues' });
  const { data: pulls } = useQuery({ queryKey: ['repo-pulls', owner, repo], queryFn: () => fetchRepoPulls(owner, repo, 'open', 1, token), enabled: activeTab === 'pulls' });
  const { data: contributors } = useQuery({ queryKey: ['repo-contributors', owner, repo], queryFn: () => fetchRepoContributors(owner, repo, token), enabled: activeTab === 'code' || activeTab === 'insights' });
  const { data: languages } = useQuery({ queryKey: ['repo-langs', owner, repo], queryFn: () => fetchRepoLanguages(owner, repo, token), enabled: activeTab === 'code' || activeTab === 'insights' });
  const { data: releases } = useQuery({ queryKey: ['repo-releases', owner, repo], queryFn: () => fetchRepoReleases(owner, repo, token), enabled: activeTab === 'releases' });
  const { data: commits } = useQuery({ queryKey: ['repo-commits', owner, repo], queryFn: () => fetchRepoCommits(owner, repo, 1, token), enabled: activeTab === 'code' || activeTab === 'insights' });

  if (isLoading) return <LoadingSpinner text={`Loading ${owner}/${repo}...`} />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-white">Repository not found</h2><p className="text-gray-400 mt-2">{owner}/{repo} doesn't exist or is private.</p></div>;

  const tabs = [
    { key: 'code', label: 'Code', icon: '📄' },
    { key: 'issues', label: 'Issues', count: repoData.open_issues_count, icon: '🔵' },
    { key: 'pulls', label: 'Pull Requests', icon: '🔃' },
    { key: 'discussions', label: 'Discussions', icon: '💬' },
    { key: 'actions', label: 'Actions', icon: '▶️' },
    { key: 'releases', label: 'Releases', icon: '🏷️' },
    { key: 'insights', label: 'Insights', icon: '📊' },
    { key: 'security', label: 'Security', icon: '🔒' },
  ];

  // Health Score calculation (merged Pulse)
  const daysSinceCommit = commits?.[0] ? Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000) : 999;
  const commitScore = Math.max(0, 100 - daysSinceCommit * 3);
  const contribCount = contributors?.length || 1;
  const busFactor = contribCount >= 5 ? 90 : contribCount >= 3 ? 70 : contribCount >= 2 ? 50 : 20;
  const issueScore = (repoData.open_issues_count || 0) < 5 ? 90 : repoData.open_issues_count < 20 ? 70 : repoData.open_issues_count < 100 ? 50 : 30;
  const readmeScore = readme ? (readme.length > 2000 ? 90 : readme.length > 500 ? 70 : 50) : 10;
  const releaseScore = releases?.length > 0 ? 80 : 30;
  const starsScore = Math.min(100, Math.floor(Math.log10(Math.max(repoData.stargazers_count, 1)) * 25));
  const healthScore = Math.round((commitScore + busFactor + issueScore + readmeScore + releaseScore + starsScore) / 6);
  const scoreColor = healthScore >= 75 ? '#00bf63' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

  const totalBytes = languages ? Object.values(languages).reduce((a, b) => a + b, 0) : 0;
  const langBreakdown = languages ? Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 6) : [];

  const copyBadge = (md) => { navigator.clipboard.writeText(md); setCopiedBadge(md); setTimeout(() => setCopiedBadge(''), 1500); };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <SEO title={`${owner}/${repo}`} description={repoData.description || `${repo} on Scotium`} canonical={`/${owner}/${repo}`} />

      {/* Repo Header */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <img src={repoData.owner.avatar_url} alt="" className="w-11 h-11 rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/${owner}`} className="text-gray-400 hover:text-secondary text-sm">{owner}</Link>
              <span className="text-gray-600">/</span>
              <h1 className="text-xl font-bold text-white">{repo}</h1>
              {repoData.private && <span className="badge bg-yellow-500/10 text-yellow-400">Private</span>}
              {repoData.fork && <span className="badge bg-blue-500/10 text-blue-400">Fork</span>}
            </div>
            {repoData.description && <p className="text-sm text-gray-400 mt-1">{repoData.description}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              <span>★ {formatNum(repoData.stargazers_count)}</span>
              <span>⑂ {formatNum(repoData.forks_count)}</span>
              <span>👁 {formatNum(repoData.watchers_count)}</span>
              {repoData.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[repoData.language] }} />{repoData.language}</span>}
              {repoData.license?.spdx_id && <span>📜 {repoData.license.spdx_id}</span>}
              <span>Updated {formatDate(repoData.updated_at)}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/${owner}/${repo}/editor`} className="btn-primary text-xs py-2 px-3">Open in Editor</Link>
            <a href={repoData.html_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-2 px-3">GitHub →</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-white/[0.06] mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => navigate(`/${owner}/${repo}${t.key === 'code' ? '' : '/' + t.key}`)} className={`px-3 py-3 text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5 ${activeTab === t.key ? 'tab-active' : 'tab-inactive'}`}>
            <span className="hidden sm:inline">{t.icon}</span> {t.label}
            {t.count !== undefined && <span className="text-[10px] bg-gray-700/60 px-1.5 py-0.5 rounded-full">{formatNum(t.count)}</span>}
          </button>
        ))}
      </div>

      {/* CODE TAB (includes health pulse) */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* File tree */}
            {contents && Array.isArray(contents) && (
              <div className="card">
                <div className="space-y-0.5">
                  {contents.sort((a, b) => (a.type === 'dir' ? -1 : 1) - (b.type === 'dir' ? -1 : 1) || a.name.localeCompare(b.name)).map(item => (
                    <div key={item.sha} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.02] text-sm">
                      {item.type === 'dir' ? <span className="text-accent-blue">📁</span> : <span className="text-gray-500">📄</span>}
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* README */}
            {readme && <MarkdownReadme html={readme} />}
          </div>

          {/* Right sidebar: Health Pulse + Info */}
          <div className="space-y-4">
            {/* Health Score */}
            <div className="card-glass text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Health Score</p>
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${healthScore * 2.51} 251`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black" style={{ color: scoreColor }}>{healthScore}</span>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: scoreColor }}>{healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs Work'}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                <MiniMetric label="Commits" value={commitScore} />
                <MiniMetric label="Bus Factor" value={busFactor} />
                <MiniMetric label="Issues" value={issueScore} />
                <MiniMetric label="README" value={readmeScore} />
              </div>
            </div>

            {/* Languages */}
            {langBreakdown.length > 0 && (
              <div className="card">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Languages</h3>
                <div className="flex rounded-full h-2 overflow-hidden mb-2">
                  {langBreakdown.map(([lang, bytes]) => (
                    <div key={lang} style={{ width: `${(bytes / totalBytes) * 100}%`, backgroundColor: LANG_COLORS[lang] || '#6b7280' }} title={lang} />
                  ))}
                </div>
                <div className="space-y-1">
                  {langBreakdown.map(([lang, bytes]) => (
                    <div key={lang} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[lang] || '#6b7280' }} />{lang}</span>
                      <span className="text-gray-500">{((bytes / totalBytes) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">About</h3>
              <div className="space-y-1.5 text-xs text-gray-400">
                {repoData.homepage && <a href={repoData.homepage} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline block truncate">{repoData.homepage}</a>}
                <div>Branch: <code className="text-secondary">{repoData.default_branch}</code></div>
                <div>Created {formatDate(repoData.created_at)}</div>
                {repoData.topics?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{repoData.topics.map(t => <span key={t} className="badge bg-secondary/10 text-secondary">{t}</span>)}</div>}
              </div>
            </div>

            {/* Contributors */}
            {contributors?.length > 0 && (
              <div className="card">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Contributors</h3>
                <div className="flex flex-wrap gap-1">
                  {contributors.slice(0, 12).map(c => (
                    <Link key={c.id} to={`/${c.login}`} title={`${c.login} (${c.contributions})`}>
                      <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full hover:ring-2 hover:ring-secondary/30" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">README Badges</h3>
              <div className="space-y-1.5">
                {[
                  `![Stars](https://img.shields.io/github/stars/${owner}/${repo}?style=flat-square&color=00bf63)`,
                  `![Issues](https://img.shields.io/github/issues/${owner}/${repo}?style=flat-square)`,
                  `![License](https://img.shields.io/github/license/${owner}/${repo}?style=flat-square)`,
                ].map(md => (
                  <button key={md} onClick={() => copyBadge(md)} className={`w-full text-left p-1.5 rounded bg-primary border border-gray-800/40 text-[10px] font-mono text-gray-500 truncate hover:text-gray-300 transition-colors ${copiedBadge === md ? 'border-secondary/40 text-secondary' : ''}`}>
                    {copiedBadge === md ? '✓ Copied!' : md.slice(0, 60) + '...'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISSUES TAB */}
      {activeTab === 'issues' && (
        <div className="space-y-2">
          {issues?.filter(i => !i.pull_request).map(issue => (
            <a key={issue.id} href={issue.html_url} target="_blank" rel="noopener noreferrer" className="card flex items-start gap-3 group">
              <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white group-hover:text-secondary truncate">{issue.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                  <span>#{issue.number}</span><span>{issue.user.login}</span><span>{formatDate(issue.created_at)}</span><span>💬 {issue.comments}</span>
                </div>
                {issue.labels?.length > 0 && <div className="flex gap-1 mt-1">{issue.labels.slice(0, 4).map(l => <span key={l.id} className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `#${l.color}20`, color: `#${l.color}` }}>{l.name}</span>)}</div>}
              </div>
            </a>
          ))}
          {(!issues || issues.filter(i => !i.pull_request).length === 0) && <div className="card text-center py-8 text-gray-400 text-sm">No open issues</div>}
        </div>
      )}

      {/* PULL REQUESTS TAB */}
      {activeTab === 'pulls' && (
        <div className="space-y-2">
          {pulls?.map(pr => (
            <a key={pr.id} href={pr.html_url} target="_blank" rel="noopener noreferrer" className="card flex items-start gap-3 group">
              <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0 bg-green-500" />
              <div className="min-w-0"><p className="text-sm font-medium text-white group-hover:text-secondary truncate">{pr.title}</p><p className="text-[11px] text-gray-500 mt-0.5">#{pr.number} • {pr.user.login} • {formatDate(pr.created_at)}</p></div>
            </a>
          ))}
          {(!pulls || pulls.length === 0) && <div className="card text-center py-8 text-gray-400 text-sm">No open pull requests</div>}
        </div>
      )}

      {/* RELEASES TAB */}
      {activeTab === 'releases' && (
        <div className="space-y-3">
          {releases?.map(r => (
            <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer" className="card group">
              <div className="flex items-center gap-3">
                <span className="text-lg">🏷️</span>
                <div><p className="text-sm font-semibold text-white group-hover:text-secondary">{r.name || r.tag_name}</p><p className="text-[11px] text-gray-500">{r.tag_name} • {formatDate(r.published_at)} {r.prerelease && <span className="badge bg-yellow-500/10 text-yellow-400 ml-1">Pre-release</span>}</p></div>
              </div>
            </a>
          ))}
          {(!releases || releases.length === 0) && <div className="card text-center py-8 text-gray-400 text-sm">No releases</div>}
        </div>
      )}

      {/* INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-glass text-center py-8">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="8" /><circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${healthScore * 2.51} 251`} /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black" style={{ color: scoreColor }}>{healthScore}</span><span className="text-[9px] text-gray-500">HEALTH</span></div>
            </div>
          </div>
          <div className="card grid grid-cols-2 gap-3">
            <MiniMetricFull label="Commit Activity" value={commitScore} detail={`${daysSinceCommit}d since last`} />
            <MiniMetricFull label="Bus Factor" value={busFactor} detail={`${contribCount} contributors`} />
            <MiniMetricFull label="Issue Health" value={issueScore} detail={`${repoData.open_issues_count} open`} />
            <MiniMetricFull label="Documentation" value={readmeScore} detail={readme ? 'Has README' : 'Missing'} />
          </div>
          {contributors?.length > 0 && (
            <div className="card col-span-full">
              <h3 className="text-sm font-semibold text-white mb-3">Top Contributors</h3>
              <div className="flex flex-wrap gap-2">
                {contributors.slice(0, 20).map(c => (
                  <Link key={c.id} to={`/${c.login}`} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-xs text-gray-300">
                    <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-full" />{c.login}<span className="text-gray-500 text-[10px]">({c.contributions})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PLACEHOLDER TABS */}
      {['discussions', 'actions', 'security'].includes(activeTab) && (
        <div className="card text-center py-12">
          <p className="text-lg text-gray-300 font-medium mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
          <p className="text-sm text-gray-500">View on <a href={`${repoData.html_url}/${activeTab === 'security' ? 'security' : activeTab}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">GitHub</a></p>
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value }) {
  const color = value >= 75 ? 'text-green-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400';
  return <div className="text-center"><p className={`text-sm font-bold ${color}`}>{value}</p><p className="text-[9px] text-gray-500">{label}</p></div>;
}

function MiniMetricFull({ label, value, detail }) {
  const color = value >= 75 ? 'text-green-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400';
  return <div><p className="text-[10px] text-gray-500 uppercase">{label}</p><p className={`text-xl font-bold ${color}`}>{value}<span className="text-xs text-gray-600">/100</span></p><p className="text-[10px] text-gray-500">{detail}</p></div>;
}
