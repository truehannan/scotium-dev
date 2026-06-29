import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRepo, fetchRepoCommits, fetchRepoContributors, fetchRepoIssues, fetchRepoPulls, fetchRepoLanguages, fetchRepoReadme, fetchRepoReleases, formatNum, formatDate } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useState } from 'react';

export default function RepoPulsePage() {
  const { owner, repo } = useParams();
  const { token } = useAuth();
  const [copiedBadge, setCopiedBadge] = useState('');

  const { data: repoData, isLoading } = useQuery({ queryKey: ['repo', owner, repo], queryFn: () => fetchRepo(owner, repo, token) });
  const { data: commits } = useQuery({ queryKey: ['pulse-commits', owner, repo], queryFn: () => fetchRepoCommits(owner, repo, 1, token), enabled: !!repoData });
  const { data: contributors } = useQuery({ queryKey: ['pulse-contributors', owner, repo], queryFn: () => fetchRepoContributors(owner, repo, token), enabled: !!repoData });
  const { data: issues } = useQuery({ queryKey: ['pulse-issues', owner, repo], queryFn: () => fetchRepoIssues(owner, repo, 'all', 1, token), enabled: !!repoData });
  const { data: pulls } = useQuery({ queryKey: ['pulse-pulls', owner, repo], queryFn: () => fetchRepoPulls(owner, repo, 'all', 1, token), enabled: !!repoData });
  const { data: languages } = useQuery({ queryKey: ['pulse-langs', owner, repo], queryFn: () => fetchRepoLanguages(owner, repo, token), enabled: !!repoData });
  const { data: readme } = useQuery({ queryKey: ['pulse-readme', owner, repo], queryFn: () => fetchRepoReadme(owner, repo, token), enabled: !!repoData });
  const { data: releases } = useQuery({ queryKey: ['pulse-releases', owner, repo], queryFn: () => fetchRepoReleases(owner, repo, token), enabled: !!repoData });

  if (isLoading) return <LoadingSpinner text="Analyzing repository health..." />;
  if (!repoData) return <div className="text-center py-16 text-gray-400">Repository not found</div>;

  // Calculate health metrics
  const now = Date.now();
  const daysSinceLastCommit = commits?.[0] ? Math.floor((now - new Date(commits[0].commit.date || commits[0].commit.author.date)) / 86400000) : 999;
  const commitFrequencyScore = Math.max(0, 100 - daysSinceLastCommit * 3);
  const hasRelease = releases?.length > 0;
  const releaseScore = hasRelease ? 80 : 30;
  const contributorCount = contributors?.length || 1;
  const busFactor = contributorCount >= 5 ? 90 : contributorCount >= 3 ? 70 : contributorCount >= 2 ? 50 : 20;
  const openIssues = repoData.open_issues_count || 0;
  const issueScore = openIssues < 5 ? 90 : openIssues < 20 ? 70 : openIssues < 100 ? 50 : 30;
  const readmeScore = readme ? (readme.length > 2000 ? 90 : readme.length > 500 ? 70 : 50) : 10;
  const starsScore = Math.min(100, Math.floor(Math.log10(Math.max(repoData.stargazers_count, 1)) * 25));

  const healthScore = Math.round((commitFrequencyScore + releaseScore + busFactor + issueScore + readmeScore + starsScore) / 6);
  const scoreColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

  // Language breakdown
  const totalBytes = languages ? Object.values(languages).reduce((a, b) => a + b, 0) : 0;
  const langBreakdown = languages ? Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 6) : [];

  // Badge markdown
  const badges = [
    { label: 'Health Score', md: `![Health Score](https://img.shields.io/badge/Health_Score-${healthScore}%25-${healthScore >= 75 ? 'brightgreen' : healthScore >= 50 ? 'yellow' : 'red'}?style=for-the-badge)` },
    { label: 'Stars', md: `![Stars](https://img.shields.io/github/stars/${owner}/${repo}?style=for-the-badge&color=10b981)` },
    { label: 'Forks', md: `![Forks](https://img.shields.io/github/forks/${owner}/${repo}?style=for-the-badge&color=3b82f6)` },
    { label: 'Issues', md: `![Issues](https://img.shields.io/github/issues/${owner}/${repo}?style=for-the-badge)` },
    { label: 'License', md: `![License](https://img.shields.io/github/license/${owner}/${repo}?style=for-the-badge)` },
  ];

  const copyBadge = (md, label) => { navigator.clipboard.writeText(md); setCopiedBadge(label); setTimeout(() => setCopiedBadge(''), 1500); };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <SEO title={`${owner}/${repo} - Repo Pulse`} description={`Health analysis for ${owner}/${repo}`} canonical={`/${owner}/${repo}/pulse`} />

      {/* Back link */}
      <Link to={`/${owner}/${repo}`} className="text-sm text-gray-500 hover:text-secondary mb-4 inline-flex items-center gap-1">← Back to {repo}</Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={repoData.owner.avatar_url} alt="" className="w-10 h-10 rounded-xl" />
        <div>
          <h1 className="text-2xl font-bold text-white">{owner}/{repo}</h1>
          <p className="text-sm text-gray-400">Repository Health & Pulse Analysis</p>
        </div>
      </div>

      {/* Health Score Main */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-glass col-span-1 flex flex-col items-center justify-center py-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${healthScore * 2.64} 264`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: scoreColor }}>{healthScore}</span>
              <span className="text-[10px] text-gray-500 uppercase">Health</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: scoreColor }}>
            {healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs Attention'}
          </p>
        </div>

        <div className="col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard label="Commit Activity" score={commitFrequencyScore} detail={daysSinceLastCommit === 0 ? 'Today' : `${daysSinceLastCommit}d ago`} />
          <MetricCard label="Bus Factor" score={busFactor} detail={`${contributorCount} contributors`} />
          <MetricCard label="Issue Health" score={issueScore} detail={`${openIssues} open issues`} />
          <MetricCard label="README Quality" score={readmeScore} detail={readme ? `${(readme.length / 1000).toFixed(1)}k chars` : 'Missing'} />
          <MetricCard label="Releases" score={releaseScore} detail={hasRelease ? `${releases.length} releases` : 'No releases'} />
          <MetricCard label="Community" score={starsScore} detail={`${formatNum(repoData.stargazers_count)} stars`} />
        </div>
      </div>

      {/* Language Breakdown */}
      {langBreakdown.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Language Breakdown</h3>
          <div className="flex rounded-full h-3 overflow-hidden mb-3">
            {langBreakdown.map(([lang, bytes]) => (
              <div key={lang} style={{ width: `${(bytes / totalBytes) * 100}%`, backgroundColor: ({ JavaScript: '#f1e05a', Python: '#3572A5', TypeScript: '#3178c6', Go: '#00ADD8', Rust: '#dea584', Java: '#b07219' })[lang] || '#6b7280' }} title={`${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            {langBreakdown.map(([lang, bytes]) => (
              <span key={lang}>{lang} {((bytes / totalBytes) * 100).toFixed(1)}%</span>
            ))}
          </div>
        </div>
      )}

      {/* Contributors */}
      {contributors && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Top Contributors</h3>
          <div className="flex flex-wrap gap-2">
            {contributors.slice(0, 20).map(c => (
              <Link key={c.id} to={`/${c.login}`} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors" title={`${c.login}: ${c.contributions} commits`}>
                <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                <span className="text-xs text-gray-300">{c.login}</span>
                <span className="text-[10px] text-gray-500">{c.contributions}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Copy-Paste Badges */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-3">README Badges (copy & paste)</h3>
        <div className="space-y-2">
          {badges.map(b => (
            <div key={b.label} className="flex items-center justify-between gap-3 p-2 bg-primary rounded-lg border border-gray-800/40">
              <code className="text-[11px] text-gray-400 font-mono truncate flex-1">{b.md}</code>
              <button onClick={() => copyBadge(b.md, b.label)} className={`text-xs px-2 py-1 rounded font-medium transition-all ${copiedBadge === b.label ? 'bg-secondary/20 text-secondary' : 'text-gray-500 hover:text-white'}`}>
                {copiedBadge === b.label ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, score, detail }) {
  const color = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="card-glass">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{score}<span className="text-sm text-gray-600">/100</span></p>
      <p className="text-[11px] text-gray-500 mt-0.5">{detail}</p>
    </div>
  );
}
