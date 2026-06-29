import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUser, fetchUserRepos, fetchUserOrgs, formatNum } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/ui/RepoCard';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function UserProfilePage() {
  const { username } = useParams();
  const { token } = useAuth();

  const { data: user, isLoading, error } = useQuery({ queryKey: ['user', username], queryFn: () => fetchUser(username, token) });
  const { data: repos } = useQuery({ queryKey: ['user-repos', username], queryFn: () => fetchUserRepos(username, 'updated', 1, 30, token), enabled: !!user });
  const { data: orgs } = useQuery({ queryKey: ['user-orgs', username], queryFn: () => fetchUserOrgs(username, token), enabled: !!user });

  if (isLoading) return <LoadingSpinner text={`Loading ${username}...`} />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-white">User not found</h2></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title={`${user.name || user.login} - GitHub Profile`} canonical={`/${username}`} />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile */}
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
        {/* Repos */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white mb-4">Repositories</h2>
          <div className="grid gap-3">{repos?.map(r => <RepoCard key={r.id} repo={r} />)}</div>
        </div>
      </div>
    </div>
  );
}
