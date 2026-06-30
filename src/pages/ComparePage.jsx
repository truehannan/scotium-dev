import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRepo, fetchUser, fetchRepoContributors, fetchRepoLanguages, formatNum } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/ui/SEO';

export default function ComparePage() {
  const { token } = useAuth();
  const [mode, setMode] = useState('repos');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const compare = () => { if (left.trim() && right.trim()) setSubmitted({ left: left.trim(), right: right.trim(), mode }); };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title="Compare" description="Compare GitHub repos or users side-by-side" canonical="/compare" />

      <div className="mb-8">
        <h1 className="section-title">Compare</h1>
        <p className="text-sm text-gray-400 mt-1">Side-by-side comparison of repositories or users</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-0.5 border-b border-white/[0.06] mb-6">
        <button onClick={() => { setMode('repos'); setSubmitted(null); }} className={`px-4 py-3 text-sm ${mode === 'repos' ? 'tab-active' : 'tab-inactive'}`}>Repo vs Repo</button>
        <button onClick={() => { setMode('users'); setSubmitted(null); }} className={`px-4 py-3 text-sm ${mode === 'users' ? 'tab-active' : 'tab-inactive'}`}>User vs User</button>
      </div>

      {/* Input */}
      <div className="card mb-6 flex flex-col sm:flex-row items-end gap-3">
        <div className="flex-1 w-full">
          <label className="text-[11px] text-gray-500 uppercase mb-1 block">{mode === 'repos' ? 'owner/repo' : 'username'}</label>
          <input value={left} onChange={e => setLeft(e.target.value)} placeholder={mode === 'repos' ? 'e.g. facebook/react' : 'e.g. torvalds'} className="input-field w-full text-sm" />
        </div>
        <span className="text-gray-500 font-bold text-lg pb-2">vs</span>
        <div className="flex-1 w-full">
          <label className="text-[11px] text-gray-500 uppercase mb-1 block">{mode === 'repos' ? 'owner/repo' : 'username'}</label>
          <input value={right} onChange={e => setRight(e.target.value)} placeholder={mode === 'repos' ? 'e.g. vuejs/vue' : 'e.g. gaearon'} className="input-field w-full text-sm" />
        </div>
        <button onClick={compare} className="btn-primary text-sm whitespace-nowrap">Compare</button>
      </div>

      {/* Results */}
      {submitted && submitted.mode === 'repos' && <RepoComparison left={submitted.left} right={submitted.right} token={token} />}
      {submitted && submitted.mode === 'users' && <UserComparison left={submitted.left} right={submitted.right} token={token} />}
    </div>
  );
}

function RepoComparison({ left, right, token }) {
  const [lo, lr] = left.split('/');
  const [ro, rr] = right.split('/');

  const { data: leftRepo, isLoading: ll } = useQuery({ queryKey: ['cmp-repo', left], queryFn: () => fetchRepo(lo, lr, token), enabled: !!lo && !!lr });
  const { data: rightRepo, isLoading: rl } = useQuery({ queryKey: ['cmp-repo', right], queryFn: () => fetchRepo(ro, rr, token), enabled: !!ro && !!rr });
  const { data: leftLangs } = useQuery({ queryKey: ['cmp-langs', left], queryFn: () => fetchRepoLanguages(lo, lr, token), enabled: !!leftRepo });
  const { data: rightLangs } = useQuery({ queryKey: ['cmp-langs', right], queryFn: () => fetchRepoLanguages(ro, rr, token), enabled: !!rightRepo });
  const { data: leftContribs } = useQuery({ queryKey: ['cmp-contribs', left], queryFn: () => fetchRepoContributors(lo, lr, token), enabled: !!leftRepo });
  const { data: rightContribs } = useQuery({ queryKey: ['cmp-contribs', right], queryFn: () => fetchRepoContributors(ro, rr, token), enabled: !!rightRepo });

  if (ll || rl) return <div className="text-center py-8 text-gray-500 text-sm">Loading comparison...</div>;
  if (!leftRepo || !rightRepo) return <div className="card text-center py-8 text-red-400 text-sm">One or both repositories not found. Use format: owner/repo</div>;

  const metrics = [
    { label: 'Stars', left: leftRepo.stargazers_count, right: rightRepo.stargazers_count },
    { label: 'Forks', left: leftRepo.forks_count, right: rightRepo.forks_count },
    { label: 'Open Issues', left: leftRepo.open_issues_count, right: rightRepo.open_issues_count, lowerBetter: true },
    { label: 'Watchers', left: leftRepo.watchers_count, right: rightRepo.watchers_count },
    { label: 'Size (KB)', left: leftRepo.size, right: rightRepo.size },
    { label: 'Contributors', left: leftContribs?.length || 0, right: rightContribs?.length || 0 },
    { label: 'Languages', left: leftLangs ? Object.keys(leftLangs).length : 0, right: rightLangs ? Object.keys(rightLangs).length : 0 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="card-glass text-center p-4">
          <img src={leftRepo.owner.avatar_url} alt="" className="w-10 h-10 rounded-lg mx-auto mb-2" />
          <p className="text-sm font-bold text-white truncate">{left}</p>
          <p className="text-[10px] text-gray-500">{leftRepo.language}</p>
        </div>
        <div className="flex items-center justify-center text-2xl text-gray-600 font-bold">VS</div>
        <div className="card-glass text-center p-4">
          <img src={rightRepo.owner.avatar_url} alt="" className="w-10 h-10 rounded-lg mx-auto mb-2" />
          <p className="text-sm font-bold text-white truncate">{right}</p>
          <p className="text-[10px] text-gray-500">{rightRepo.language}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {metrics.map(m => {
          const leftWins = m.lowerBetter ? m.left < m.right : m.left > m.right;
          const rightWins = m.lowerBetter ? m.right < m.left : m.right > m.left;
          const total = Math.max(m.left + m.right, 1);
          return (
            <div key={m.label} className="card p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${leftWins ? 'text-green-400' : 'text-gray-400'}`}>{formatNum(m.left)}</span>
                <span className="text-[10px] text-gray-500 uppercase">{m.label}</span>
                <span className={`text-xs font-bold ${rightWins ? 'text-green-400' : 'text-gray-400'}`}>{formatNum(m.right)}</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
                <div className="h-full bg-secondary transition-all" style={{ width: `${(m.left / total) * 100}%` }} />
                <div className="h-full bg-accent-blue transition-all" style={{ width: `${(m.right / total) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserComparison({ left, right, token }) {
  const { data: leftUser, isLoading: ll } = useQuery({ queryKey: ['cmp-user', left], queryFn: () => fetchUser(left, token) });
  const { data: rightUser, isLoading: rl } = useQuery({ queryKey: ['cmp-user', right], queryFn: () => fetchUser(right, token) });

  if (ll || rl) return <div className="text-center py-8 text-gray-500 text-sm">Loading comparison...</div>;
  if (!leftUser || !rightUser) return <div className="card text-center py-8 text-red-400 text-sm">One or both users not found.</div>;

  const metrics = [
    { label: 'Followers', left: leftUser.followers, right: rightUser.followers },
    { label: 'Following', left: leftUser.following, right: rightUser.following },
    { label: 'Public Repos', left: leftUser.public_repos, right: rightUser.public_repos },
    { label: 'Public Gists', left: leftUser.public_gists, right: rightUser.public_gists },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="card-glass text-center p-4">
          <img src={leftUser.avatar_url} alt="" className="w-12 h-12 rounded-full mx-auto mb-2" />
          <p className="text-sm font-bold text-white">{leftUser.name || leftUser.login}</p>
          <p className="text-[10px] text-gray-500">@{leftUser.login}</p>
        </div>
        <div className="flex items-center justify-center text-2xl text-gray-600 font-bold">VS</div>
        <div className="card-glass text-center p-4">
          <img src={rightUser.avatar_url} alt="" className="w-12 h-12 rounded-full mx-auto mb-2" />
          <p className="text-sm font-bold text-white">{rightUser.name || rightUser.login}</p>
          <p className="text-[10px] text-gray-500">@{rightUser.login}</p>
        </div>
      </div>
      <div className="space-y-2">
        {metrics.map(m => {
          const total = Math.max(m.left + m.right, 1);
          const leftWins = m.left > m.right;
          const rightWins = m.right > m.left;
          return (
            <div key={m.label} className="card p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${leftWins ? 'text-green-400' : 'text-gray-400'}`}>{formatNum(m.left)}</span>
                <span className="text-[10px] text-gray-500 uppercase">{m.label}</span>
                <span className={`text-xs font-bold ${rightWins ? 'text-green-400' : 'text-gray-400'}`}>{formatNum(m.right)}</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
                <div className="h-full bg-secondary" style={{ width: `${(m.left / total) * 100}%` }} />
                <div className="h-full bg-accent-blue" style={{ width: `${(m.right / total) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
