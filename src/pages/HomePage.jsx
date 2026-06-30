import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrending } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import Hero3D from '../components/Hero3D';
import TabNav from '../components/TabNav';
import { PeekabooRepos, PeekabooContributors } from '../components/PeekabooSection';
import RepoCard from '../components/ui/RepoCard';
import BannerAd from '../components/ui/BannerAd';
import SponsoredRepos from '../components/ui/SponsoredRepos';
import SEO from '../components/ui/SEO';
import DiscoveryTools from '../components/ui/DiscoveryTools';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function HomePage() {
  const { token, user } = useAuth();
  const [filters, setFilters] = useState({ language: '', since: 'weekly', sort: 'stars' });

  const { data, isLoading } = useQuery({
    queryKey: ['trending', filters],
    queryFn: () => fetchTrending({ ...filters, token }),
  });

  const repos = data?.items || [];
  const peekabooRepos = repos.slice(0, 10);
  const listRepos = repos.slice(10);

  // Extract unique contributors from trending repos
  const contributors = useMemo(() => {
    const seen = new Set();
    return repos.slice(0, 20).map(r => r.owner).filter(o => { if (seen.has(o.id)) return false; seen.add(o.id); return true; }).slice(0, 12);
  }, [repos]);

  return (
    <>
      <SEO title="Scotium - Discover Trending GitHub Repos" canonical="/" />

      {/* Full-screen 3D Hero */}
      <Hero3D />

      {/* Upper Tabs */}
      <TabNav filters={filters} onFilterChange={setFilters} user={user} />

      <div className="max-w-[1400px] mx-auto">
        {/* Sponsored repos */}
        <div className="px-4 sm:px-6 pt-8">
          <SponsoredRepos />
        </div>

        {/* Peekaboo Trending */}
        {peekabooRepos.length > 0 && (
          <PeekabooRepos repos={peekabooRepos} title="Trending This Week" />
        )}

        {/* Banner Ad slot */}
        <div className="px-4 sm:px-6">
          <BannerAd slot="home-mid" />
        </div>

        {/* Discovery Tools */}
        <DiscoveryTools token={token} />

        {/* Famous Contributors */}
        {contributors.length > 0 && (
          <PeekabooContributors users={contributors} title="Popular Developers" />
        )}

        {/* Main repo list */}
        <section className="px-4 sm:px-6 py-8">
          <h2 className="section-title mb-6">All Trending</h2>
          {isLoading && <LoadingSpinner text="Fetching trending repos..." />}
          {listRepos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {listRepos.map(repo => <RepoCard key={repo.id} repo={repo} />)}
            </div>
          )}
          {!isLoading && repos.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-400">No repositories found. Try adjusting filters.</p>
            </div>
          )}
        </section>

        {/* Bottom banner */}
        <div className="px-4 sm:px-6 pb-8">
          <BannerAd slot="home-bottom" />
        </div>
      </div>
    </>
  );
}
