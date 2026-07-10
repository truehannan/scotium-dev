import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { fetchRepoCommits, formatDate } from '../../utils/github';
import { useAuth } from '../../context/AuthContext';

export default function MaintainerHealthCard({ owner, repo, repoData, contributors }) {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState(null);

  const { data: commits } = useQuery({
    queryKey: ['health-commits', owner, repo],
    queryFn: () => fetchRepoCommits(owner, repo, 1, token),
    enabled: !!owner && !!repo,
  });

  // Fake analysis delay (2-3s)
  useEffect(() => {
    if (!commits || !repoData) return;
    const delay = 2000 + Math.random() * 1000;
    const timer = setTimeout(() => {
      setResult(generateAnalysis(repoData, commits, contributors));
      setAnalyzing(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [commits, repoData, contributors]);

  if (!commits && !analyzing) return null;

  if (analyzing) {
    return (
      <div className="rounded-xl border border-secondary/20 bg-secondary/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin" />
          <div>
            <p className="text-sm font-medium text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              Analyzing maintainer patterns...
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Evaluating commit frequency, sentiment patterns, and project health</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor = result.score >= 7 ? 'text-green-400' : result.score >= 4 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = result.score >= 7 ? 'border-green-400/20 bg-green-400/[0.03]' : result.score >= 4 ? 'border-yellow-400/20 bg-yellow-400/[0.03]' : 'border-red-400/20 bg-red-400/[0.03]';
  const TrendIcon = result.trend === 'rising' ? TrendingUp : result.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = result.trend === 'rising' ? 'text-green-400' : result.trend === 'declining' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className={`rounded-xl border p-4 ${scoreBg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${scoreColor}`} />
          <span className="text-xs font-medium text-gray-300">Maintainer Health</span>
          <span className="text-[9px] text-gray-600 bg-white/[0.04] px-1.5 py-0.5 rounded">Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`text-lg font-black ${scoreColor}`}>{result.score}</span>
          <span className="text-[10px] text-gray-500">/10</span>
        </div>
      </div>

      {result.burnout && (
        <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-red-400 font-medium">Burnout risk indicators detected</span>
        </div>
      )}

      {/* AI-style insights */}
      <div className="mt-3 space-y-1.5">
        {result.insights.map((insight, i) => (
          <p key={i} className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
            {insight}
          </p>
        ))}
      </div>

      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-3 text-[10px] text-gray-500 hover:text-secondary transition-colors">
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Hide details' : 'View commit analysis'}
      </button>

      {expanded && result.commitAnalysis.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-white/[0.04] pt-3">
          {result.commitAnalysis.slice(0, 8).map((c, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.tone === 'positive' ? 'bg-green-400' : c.tone === 'negative' ? 'bg-red-400' : 'bg-gray-500'}`} />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 truncate">{c.message}</p>
                <p className="text-[9px] text-gray-600">{c.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === ANALYSIS ENGINE (client-side, no AI) ===

function generateAnalysis(repo, commits, contributors) {
  const now = Date.now();
  const daysSince = commits?.[0] ? Math.floor((now - new Date(commits[0].commit.author.date)) / 86400000) : 999;
  const commitCount = commits?.length || 0;
  const contribCount = contributors?.length || 0;
  const stars = repo.stargazers_count || 0;
  const issues = repo.open_issues_count || 0;
  const forks = repo.forks_count || 0;

  // Classify commit messages
  const commitAnalysis = (commits || []).slice(0, 15).map(c => {
    const msg = c.commit.message.split('\n')[0];
    return { message: msg, tone: classifyTone(msg), date: formatDate(c.commit.author.date) };
  });

  const positiveCount = commitAnalysis.filter(c => c.tone === 'positive').length;
  const negativeCount = commitAnalysis.filter(c => c.tone === 'negative').length;
  const positiveRatio = commitAnalysis.length > 0 ? positiveCount / commitAnalysis.length : 0.5;

  // Determine trend
  const midpoint = Math.floor(commitCount / 2);
  const recentHalf = commits?.slice(0, midpoint) || [];
  const olderHalf = commits?.slice(midpoint) || [];
  const trend = recentHalf.length > olderHalf.length * 1.2 ? 'rising' : recentHalf.length < olderHalf.length * 0.7 ? 'declining' : 'stable';

  // Score calculation
  let score = 5;
  score += (positiveRatio - 0.5) * 3;
  score += trend === 'rising' ? 1.5 : trend === 'declining' ? -1.5 : 0;
  score += daysSince < 3 ? 1.5 : daysSince < 7 ? 0.5 : daysSince < 30 ? -0.5 : -2;
  score += commitCount > 25 ? 1 : commitCount < 5 ? -1 : 0;
  score = Math.max(1, Math.min(10, Math.round(score)));

  const burnout = score <= 3 || (trend === 'declining' && negativeCount > positiveCount);

  // Generate insights from pools
  const insights = selectInsights(score, trend, daysSince, commitCount, contribCount, stars, issues, forks, positiveRatio, burnout);

  return { score, trend, burnout, insights, commitAnalysis };
}

function classifyTone(msg) {
  const l = msg.toLowerCase();
  const neg = ['fix', 'bug', 'broken', 'hack', 'workaround', 'revert', 'hotfix', 'urgent', 'crash', 'fail', 'error', 'issue', 'patch', 'temp', 'todo', 'wip'];
  const pos = ['feat', 'add', 'implement', 'improve', 'enhance', 'update', 'refactor', 'clean', 'optimize', 'complete', 'release', 'new', 'support', 'upgrade'];
  const hasNeg = neg.some(w => l.includes(w));
  const hasPos = pos.some(w => l.includes(w));
  if (hasPos && !hasNeg) return 'positive';
  if (hasNeg && !hasPos) return 'negative';
  return 'neutral';
}

function selectInsights(score, trend, daysSince, commits, contribs, stars, issues, forks, posRatio, burnout) {
  const pool = [];

  // Commit frequency insights
  if (daysSince < 3) pool.push(...pick([
    'Maintainer is actively committing — last contribution was within 3 days.',
    'High recent activity indicates an engaged and responsive maintainer.',
    'This project shows consistent daily development momentum.',
  ], 1));
  else if (daysSince < 14) pool.push(...pick([
    'Commit frequency is moderate — last activity within two weeks.',
    'Development pace suggests a stable maintenance cadence.',
    'The maintainer appears to work on this project regularly.',
  ], 1));
  else if (daysSince < 60) pool.push(...pick([
    'Activity has slowed — no commits in over two weeks.',
    'The project may be in a lower-activity maintenance phase.',
    'Commit gap suggests the maintainer may have competing priorities.',
  ], 1));
  else pool.push(...pick([
    'No commits in 60+ days — this project may be unmaintained.',
    'Extended inactivity raises concerns about long-term maintenance.',
    'Consider checking if there are active forks with more recent development.',
  ], 1));

  // Trend insights
  if (trend === 'rising') pool.push(...pick([
    'Commit velocity is accelerating — more recent commits than earlier in the period.',
    'Development momentum is increasing, suggesting growing maintainer investment.',
    'Rising activity pattern indicates this project is gaining development focus.',
  ], 1));
  else if (trend === 'declining') pool.push(...pick([
    'Commit frequency is declining compared to earlier months.',
    'Decreasing activity may indicate maintainer fatigue or shifting priorities.',
    'The declining trend could signal a transition to maintenance-only mode.',
  ], 1));
  else pool.push(...pick([
    'Development pace is consistent and stable over the analysis period.',
    'Steady commit cadence suggests reliable, sustainable maintenance.',
  ], 1));

  // Sentiment-based
  if (posRatio > 0.6) pool.push(...pick([
    'Commit messages show predominantly constructive language — features and improvements.',
    'Message sentiment is positive, indicating forward-looking development.',
    'The nature of recent changes suggests healthy feature progression.',
  ], 1));
  else if (posRatio < 0.35) pool.push(...pick([
    'Higher proportion of fix-related commits may indicate technical debt accumulation.',
    'Frequent bug-fix commits suggest the codebase may need architectural attention.',
    'Reactive commit patterns (fixes, patches) outweigh proactive development.',
  ], 1));

  // Community context
  if (contribs > 10) pool.push(...pick([
    `Strong contributor base (${contribs}+) reduces single-maintainer dependency risk.`,
    'Multiple active contributors provide resilience against individual burnout.',
  ], 1));
  else if (contribs <= 2) pool.push(...pick([
    'Limited contributor count increases bus-factor risk for this project.',
    'Single or dual maintainer setup — sustainability depends heavily on key individuals.',
  ], 1));

  // Burnout warning
  if (burnout) pool.push(...pick([
    'Patterns suggest potential maintainer fatigue — declining output with reactive fixes.',
    'Risk indicators present: reduced frequency combined with debt-focused commits.',
  ], 1));

  // Ensure exactly 3 insights
  while (pool.length < 3) {
    pool.push(...pick([
      `This repository has ${commits} commits in the analysis window with ${contribs} contributors.`,
      `Community engagement metrics: ${stars} stars, ${forks} forks, ${issues} open issues.`,
      'Overall project health assessment is based on commit patterns and contribution trends.',
      'Analysis considers frequency, sentiment, contributor distribution, and recency.',
    ], 1));
  }

  return pool.slice(0, 3);
}

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
