import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchRepos, searchUsers } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/ui/RepoCard';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SearchPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState('repos');
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => { setQuery(searchParams.get('q') || ''); }, [searchParams]);

  const { data: repoData, isLoading: rl } = useQuery({ queryKey: ['s-repos', searchQuery], queryFn: () => searchRepos(searchQuery, 'stars', 1, 30, token), enabled: !!searchQuery && tab === 'repos' });
  const { data: userData, isLoading: ul } = useQuery({ queryKey: ['s-users', searchQuery], queryFn: () => searchUsers(searchQuery, 1, 30, token), enabled: !!searchQuery && tab === 'users' });

  const handleSearch = (e) => { e.preventDefault(); if (query.trim()) setSearchParams({ q: query.trim() }); };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title="Search GitHub" canonical="/search" />
      <h1 className="section-title mb-6">Search GitHub</h1>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search repositories, users..." className="input-field flex-1" />
        <button type="submit" className="btn-primary text-sm">Search</button>
      </form>

      {searchQuery && (
        <>
          <div className="flex gap-0.5 border-b border-white/[0.06] mb-6">
            <button onClick={() => setTab('repos')} className={`px-4 py-3 text-sm ${tab === 'repos' ? 'tab-active' : 'tab-inactive'}`}>Repos {repoData && <span className="text-[10px] ml-1 bg-gray-700/60 px-1.5 py-0.5 rounded-full">{repoData.total_count?.toLocaleString()}</span>}</button>
            <button onClick={() => setTab('users')} className={`px-4 py-3 text-sm ${tab === 'users' ? 'tab-active' : 'tab-inactive'}`}>Users {userData && <span className="text-[10px] ml-1 bg-gray-700/60 px-1.5 py-0.5 rounded-full">{userData.total_count?.toLocaleString()}</span>}</button>
          </div>

          {tab === 'repos' && (rl ? <LoadingSpinner /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{repoData?.items?.map(r => <RepoCard key={r.id} repo={r} />)}</div>)}
          {tab === 'users' && (ul ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userData?.items?.map(u => (
                <Link key={u.id} to={`/${u.login}`} className="card flex items-center gap-3 hover:border-secondary/30">
                  <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  <div><p className="text-sm font-medium text-white">{u.login}</p><p className="text-[11px] text-gray-500">View profile</p></div>
                </Link>
              ))}
            </div>
          ))}
        </>
      )}
      {!searchQuery && <div className="text-center py-16 text-gray-500 text-sm">Search for repositories and users across GitHub</div>}
    </div>
  );
}
