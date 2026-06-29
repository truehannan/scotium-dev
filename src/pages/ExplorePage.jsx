import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrending, LANGUAGES } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/ui/RepoCard';
import BannerAd from '../components/ui/BannerAd';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ExplorePage() {
  const { token } = useAuth();
  const [language, setLanguage] = useState('');
  const [since, setSince] = useState('monthly');
  const [sort, setSort] = useState('stars');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['explore', language, since, sort, page],
    queryFn: () => fetchTrending({ language, since, sort, page, perPage: 30, token }),
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title="Explore GitHub Trending Repos" canonical="/explore" />
      <h1 className="section-title mb-6">Explore Repositories</h1>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap items-center gap-3">
        <select value={language} onChange={e => { setLanguage(e.target.value); setPage(1); }} className="input-field text-xs py-1.5 w-36">
          <option value="">All Languages</option>
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={since} onChange={e => { setSince(e.target.value); setPage(1); }} className="input-field text-xs py-1.5 w-32">
          <option value="daily">Today</option><option value="weekly">This Week</option><option value="monthly">This Month</option>
        </select>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="input-field text-xs py-1.5 w-28">
          <option value="stars">Stars</option><option value="forks">Forks</option><option value="updated">Updated</option>
        </select>
      </div>

      <BannerAd slot="explore-top" />

      {isLoading && <LoadingSpinner />}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {data.items?.map(r => <RepoCard key={r.id} repo={r} />)}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <span className="text-xs text-gray-500">Page {page}</span>
            <button onClick={() => setPage(page + 1)} disabled={!data.items?.length || data.items.length < 30} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
