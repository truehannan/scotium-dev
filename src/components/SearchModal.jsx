import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchRepos, searchUsers } from '../utils/github';
import { useAuth } from '../context/AuthContext';

export default function SearchModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const { data: repos } = useQuery({
    queryKey: ['search-modal-repos', debouncedQuery],
    queryFn: () => searchRepos(debouncedQuery, 'stars', 1, 5, token),
    enabled: debouncedQuery.length >= 2,
  });

  const { data: users } = useQuery({
    queryKey: ['search-modal-users', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery, 1, 5, token),
    enabled: debouncedQuery.length >= 2,
  });

  const goTo = (path) => { navigate(path); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 bg-primary-light border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-gray-800/60">
          <svg className="w-5 h-5 text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search repositories, users..."
            className="flex-1 bg-transparent text-white text-base placeholder-gray-500 outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] text-gray-500 border border-gray-700 rounded px-1.5 py-0.5">ESC</kbd>
        </form>

        {/* Results */}
        {debouncedQuery.length >= 2 && (
          <div className="max-h-[50vh] overflow-y-auto p-3">
            {/* Repos */}
            {repos?.items?.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider px-2 mb-1.5">Repositories</p>
                {repos.items.map(r => (
                  <button key={r.id} onClick={() => goTo(`/${r.full_name}`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-left transition-colors">
                    <img src={r.owner.avatar_url} alt="" className="w-7 h-7 rounded-lg" />
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{r.full_name}</p>
                      {r.description && <p className="text-[11px] text-gray-500 truncate">{r.description}</p>}
                    </div>
                    <span className="text-[10px] text-gray-500 ml-auto flex-shrink-0">★ {r.stargazers_count}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Users */}
            {users?.items?.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider px-2 mb-1.5">Users</p>
                {users.items.map(u => (
                  <button key={u.id} onClick={() => goTo(`/${u.login}`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-left transition-colors">
                    <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                    <p className="text-sm text-white">{u.login}</p>
                  </button>
                ))}
              </div>
            )}
            {/* No results */}
            {repos?.items?.length === 0 && users?.items?.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">No results for "{debouncedQuery}"</p>
            )}
          </div>
        )}

        {/* Empty state */}
        {debouncedQuery.length < 2 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Start typing to search repositories and users across GitHub
          </div>
        )}
      </div>
    </div>
  );
}
