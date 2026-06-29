import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUser, fetchUserRepos, fetchUserOrgs, fetchRepoReadme, formatNum } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/ui/RepoCard';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function UserProfilePage() {
  const { username } = useParams();
  const { token } = useAuth();
  const [tab, setTab] = useState('overview');

  const { data: user, isLoading, error } = useQuery({ queryKey: ['user', username], queryFn: () => fetchUser(username, token) });
  const { data: repos } = useQuery({ queryKey: ['user-repos', username], queryFn: () => fetchUserRepos(username, 'updated', 1, 30, token), enabled: !!user });
  const { data: orgs } = useQuery({ queryKey: ['user-orgs', username], queryFn: () => fetchUserOrgs(username, token), enabled: !!user });
  // Profile README: fetched from username/username repo
  const { data: profileReadme } = useQuery({
    queryKey: ['user-readme', username],
    queryFn: () => fetchRepoReadme(username, username, token),
    enabled: !!user,
  });

  if (isLoading) return <LoadingSpinner text={`Loading ${username}...`} />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-white">User not found</h2></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title={`${user.name || user.login} - GitHub Profile`} canonical={`/${username}`} />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="card-glass text-center lg:text-left">
            <img src={user.avatar_url} alt="" className="w-28 h-28 rounded-full mx-auto lg:mx-0 ring-4 ring-secondary/10" />
            <h1 className="text-xl font-bold text-white mt-4">{user.name || user.login}</h1>
            <p className="text-sm text-gray-500">@{user.login}</p>
            {user.bio && <p className="text-xs text-gray-400 mt-2">{user.bio}</p>}
            <div className="flex gap-4 mt-3 justify-center lg:justify-start text-xs text-gray-400">
              <span><span className="font-bold text-white">{formatNum(user.followers)}</span> followers</span>
              <span><span className="font-bold text-white">{formatNum(user.following)}</span> following</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-gray-400">
              {user.company && <p>🏢 {user.company}</p>}
              {user.location && <p>📍 {user.location}</p>}
              {user.blog && <p><a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">{user.blog}</a></p>}
              <p>📦 {user.public_repos} repos</p>
            </div>
            {orgs?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase mb-2">Organizations</p>
                <div className="flex flex-wrap gap-1.5">{orgs.map(o => <Link key={o.id} to={`/orgs/${o.login}`}><img src={o.avatar_url} alt={o.login} className="w-7 h-7 rounded-md hover:ring-2 hover:ring-secondary/30" title={o.login} /></Link>)}</div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content with tabs */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-0.5 border-b border-white/[0.06] mb-6">
            <button onClick={() => setTab('overview')} className={`px-4 py-3 text-sm ${tab === 'overview' ? 'tab-active' : 'tab-inactive'}`}>Overview</button>
            <button onClick={() => setTab('repositories')} className={`px-4 py-3 text-sm ${tab === 'repositories' ? 'tab-active' : 'tab-inactive'}`}>Repositories <span className="text-[10px] bg-gray-700/60 px-1.5 py-0.5 rounded-full ml-1">{user.public_repos}</span></button>
          </div>

          {/* Overview/README tab */}
          {tab === 'overview' && (
            <div>
              {profileReadme ? (
                <div className="card prose prose-invert max-w-none prose-sm prose-headings:text-white prose-a:text-secondary prose-code:text-secondary-light prose-pre:bg-primary-dark prose-pre:border prose-pre:border-gray-800 mb-6">
                  <div dangerouslySetInnerHTML={{ __html: profileReadme }} />
                </div>
              ) : (
                <div className="card text-center py-8 mb-6">
                  <p className="text-gray-500 text-sm">No profile README found.</p>
                  <p className="text-[11px] text-gray-600 mt-1">Create a repo named <code className="text-secondary">{username}/{username}</code> with a README.md</p>
                </div>
              )}
              {/* Pinned repos (first 6) */}
              {repos?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Popular repositories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {repos.slice(0, 6).map(r => <RepoCard key={r.id} repo={r} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Repositories tab */}
          {tab === 'repositories' && (
            <div className="grid gap-3">
              {repos?.map(r => <RepoCard key={r.id} repo={r} />)}
              {(!repos || repos.length === 0) && <div className="card text-center py-8 text-gray-400 text-sm">No repositories</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
