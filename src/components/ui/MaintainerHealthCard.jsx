import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/github';

export default function MaintainerHealthCard({ owner, repo }) {
  const { token, user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['maintainer-health', owner, repo],
    queryFn: async () => {
      const res = await fetch('/api/analyze/maintainer-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ owner, repo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Analysis failed');
      }
      return res.json();
    },
    enabled: !!owner && !!repo,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded bg-gray-700" />
          <div className="w-32 h-3 rounded bg-gray-700" />
        </div>
        <div className="w-16 h-6 rounded bg-gray-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">Maintainer Health</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">{error.message?.includes('limit') ? 'Rate limit reached (3/day)' : 'Sign in to analyze'}</p>
      </div>
    );
  }

  if (!data) return null;

  const score = data.score || 0;
  const trend = data.trend || 'stable';
  const burnout = data.burnout_risk || false;
  const commits = data.commits || [];
  const positiveRatio = data.positive_ratio || 0;

  const scoreColor = score >= 7 ? 'text-green-400' : score >= 4 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = score >= 7 ? 'bg-green-400/10 border-green-400/20' : score >= 4 ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-red-400/10 border-red-400/20';
  const TrendIcon = trend === 'rising' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'rising' ? 'text-green-400' : trend === 'declining' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className={`rounded-xl border p-4 ${scoreBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${scoreColor}`} />
          <span className="text-xs font-medium text-gray-300">Maintainer Health</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`text-lg font-black ${scoreColor}`}>{score}</span>
          <span className="text-[10px] text-gray-500">/10</span>
        </div>
      </div>

      {/* Burnout warning */}
      {burnout && (
        <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-red-400 font-medium">Burnout risk detected</span>
        </div>
      )}

      {/* Quick stats */}
      <div className="flex items-center gap-3 mt-2.5 text-[10px] text-gray-500">
        <span>Sentiment: {Math.round(positiveRatio * 100)}% positive</span>
        <span>Trend: {trend}</span>
        <span>{data.commit_count || 0} commits (90d)</span>
      </div>

      {/* Expand toggle */}
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 hover:text-secondary transition-colors">
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Hide' : 'Show'} commit sentiments
      </button>

      {/* Expanded: commit list with sentiments */}
      {expanded && commits.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-white/[0.04] pt-3">
          {commits.slice(0, 10).map((c, i) => {
            const SentIcon = c.sentiment === 'positive' ? ThumbsUp : c.sentiment === 'negative' ? ThumbsDown : Meh;
            const sentColor = c.sentiment === 'positive' ? 'text-green-400' : c.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400';
            return (
              <div key={i} className="flex items-start gap-2 py-1">
                <SentIcon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${sentColor}`} />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-300 truncate">{c.message}</p>
                  <p className="text-[9px] text-gray-600">{c.date ? formatDate(c.date) : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
