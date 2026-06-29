import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrendingRepos, LANGUAGES } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/RepoCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ExplorePage() {
  const { token } = useAuth();
  const [language, setLanguage] = useState('');
  const [since, setSince] = useState('monthly');
  const [sort, setSort] = useState('stars');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['explore', language, since, sort, page],
    queryFn: () => fetchTrendingRepos({ language, since, sort, page, perPage: 30, token }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Repositories</h1>
        <p className="text-gray-400">Discover interesting projects across all of GitHub</p>
      </div>

      {/* Filters Bar */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400">Language:</label>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5"
            >
              <option value="">All</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400">Time:</label>
            <select
              value={since}
              onChange={(e) => { setSince(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5"
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400">Sort:</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5"
            >
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="updated">Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && <LoadingSpinner text="Exploring repositories..." />}

      {error && (
        <div className="card text-center py-8">
          <p className="text-gray-400">Failed to load repositories. Please try again later.</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 mb-8">
            {data.items?.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.items || data.items.length < 30}
              className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
