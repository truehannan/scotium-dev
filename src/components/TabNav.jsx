import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LANGUAGES } from '../utils/github';

const TABS = [
  { path: '/', label: 'Trending' },
  { path: '/explore', label: 'Explore' },
  { path: '/search', label: 'Search' },
  { path: '/dashboard', label: 'Dashboard', auth: true },
];

export default function TabNav({ onFilterChange, filters, showFilters = true, user }) {
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="sticky top-14 z-40 bg-primary/95 backdrop-blur-lg border-b border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-12">
          {/* Tabs */}
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {TABS.filter(t => !t.auth || user).map(t => (
              <Link key={t.path} to={t.path} className={`px-3 py-3 text-sm whitespace-nowrap ${location.pathname === t.path ? 'tab-active' : 'tab-inactive'}`}>
                {t.label}
              </Link>
            ))}
          </div>

          {/* Filter button */}
          {showFilters && (
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-ghost text-xs flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              Filters
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        {filtersOpen && showFilters && (
          <div className="pb-4 pt-2 border-t border-white/[0.04]">
            <div className="flex flex-wrap items-center gap-3">
              <select value={filters?.language || ''} onChange={e => onFilterChange?.({ ...filters, language: e.target.value })} className="input-field text-xs py-1.5 w-36">
                <option value="">All Languages</option>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={filters?.since || 'weekly'} onChange={e => onFilterChange?.({ ...filters, since: e.target.value })} className="input-field text-xs py-1.5 w-32">
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
              <select value={filters?.sort || 'stars'} onChange={e => onFilterChange?.({ ...filters, sort: e.target.value })} className="input-field text-xs py-1.5 w-32">
                <option value="stars">Stars</option>
                <option value="forks">Forks</option>
                <option value="updated">Updated</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
