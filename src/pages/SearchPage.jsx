import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchRepos, searchUsers } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/RepoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState('repositories');
  const [sort, setSort] = useState('best-match');

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const { data: repoData, isLoading: reposLoading } = useQuery({
    queryKey: ['search-repos', searchQuery, sort],
    queryFn: () => searchRepos(searchQuery, sort === 'best-match' ? '' : sort, 1, 30, token),
    enabled: !!searchQuery && tab === 'repositories',
  });

  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: () => searchUsers(searchQuery, 1, 30, token),
    enabled: !!searchQuery && tab === 'users',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Search GitHub</h1>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories, users..."
            className="input-field flex-1 text-base"
          />
          <button type="submit" className="btn-primary px-6">
            Search
          </button>
        </form>
      </div>

      {searchQuery && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-800 mb-6">
            <TabButton active={tab === 'repositories'} onClick={() => setTab('repositories')}>
              Repositories
              {repoData && <span className="ml-1.5 text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">{repoData.total_count?.toLocaleString()}</span>}
            </TabButton>
            <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
              Users
              {userData && <span className="ml-1.5 text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">{userData.total_count?.toLocaleString()}</span>}
            </TabButton>
          </div>

          {/* Sort (for repos) */}
          {tab === 'repositories' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field text-sm py-1.5"
              >
                <option value="best-match">Best Match</option>
                <option value="stars">Stars</option>
                <option value="forks">Forks</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          )}

          {/* Results */}
          {tab === 'repositories' && (
            <>
              {reposLoading && <LoadingSpinner text="Searching repositories..." />}
              {repoData && (
                <div className="grid gap-4">
                  {repoData.items?.length === 0 && (
                    <div className="card text-center py-8">
                      <p className="text-gray-400">No repositories found for "{searchQuery}"</p>
                    </div>
                  )}
                  {repoData.items?.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'users' && (
            <>
              {usersLoading && <LoadingSpinner text="Searching users..." />}
              {userData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.items?.length === 0 && (
                    <div className="card text-center py-8 col-span-full">
                      <p className="text-gray-400">No users found for "{searchQuery}"</p>
                    </div>
                  )}
                  {userData.items?.map((user) => (
                    <Link key={user.id} to={`/${user.login}`} className="card flex items-center gap-3 hover:border-secondary/50">
                      <img src={user.avatar_url} alt={user.login} className="w-12 h-12 rounded-full" />
                      <div>
                        <p className="font-medium text-white">{user.login}</p>
                        <p className="text-xs text-gray-400">View profile</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {!searchQuery && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-xl text-gray-300 mb-2">Search GitHub</h2>
          <p className="text-gray-500">Find repositories, users, and code across all of GitHub</p>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
        active
          ? 'border-secondary text-secondary'
          : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
