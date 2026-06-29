import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrendingRepos, LANGUAGES } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/RepoCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const { token } = useAuth();
  const [language, setLanguage] = useState('');
  const [since, setSince] = useState('weekly');
  const [sort, setSort] = useState('stars');

  const { data, isLoading, error } = useQuery({
    queryKey: ['trending', language, since, sort],
    queryFn: () => fetchTrendingRepos({ language, since, sort, token }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Discover <span className="text-secondary">Trending</span> Repositories
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Find the most popular open source projects on GitHub. Explore trending repos by language, timeframe, and more.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card sticky top-20">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>

            {/* Time Range */}
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Time Range</label>
              <div className="flex flex-col gap-1">
                {[
                  { value: 'daily', label: 'Today' },
                  { value: 'weekly', label: 'This Week' },
                  { value: 'monthly', label: 'This Month' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSince(option.value)}
                    className={`text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                      since === option.value
                        ? 'bg-secondary/10 text-secondary font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Sort By</label>
              <div className="flex flex-col gap-1">
                {[
                  { value: 'stars', label: 'Stars' },
                  { value: 'forks', label: 'Forks' },
                  { value: 'updated', label: 'Recently Updated' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                      sort === option.value
                        ? 'bg-secondary/10 text-secondary font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Language</label>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                <button
                  onClick={() => setLanguage('')}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                    language === ''
                      ? 'bg-secondary/10 text-secondary font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-primary'
                  }`}
                >
                  All Languages
                </button>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                      language === lang
                        ? 'bg-secondary/10 text-secondary font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-primary'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {isLoading && <LoadingSpinner text="Fetching trending repos..." />}

          {error && (
            <div className="card text-center py-8">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-gray-400">Failed to load repositories. Please try again.</p>
              <p className="text-xs text-gray-500 mt-1">GitHub API rate limit may have been reached.</p>
            </div>
          )}

          {data && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  Showing <span className="text-white font-medium">{data.items?.length || 0}</span> of{' '}
                  <span className="text-white font-medium">{data.total_count?.toLocaleString()}</span> results
                </p>
              </div>
              <div className="grid gap-4">
                {data.items?.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
