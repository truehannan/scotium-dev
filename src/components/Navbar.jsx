import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, login, logout, loading } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const onSearch = (e) => { e.preventDefault(); if (search.trim()) { navigate(`/search?q=${encodeURIComponent(search.trim())}`); setSearch(''); } };

  return (
    <nav className="sticky top-0 z-50 bg-primary-dark/90 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Scotium" className="h-6 w-auto" />
        </Link>

        {/* Search */}
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search repos, users..." className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary/40 focus:bg-white/[0.05] transition-all" />
          </div>
        </form>

        {/* Right */}
        <div className="flex items-center gap-3">
          {loading ? <div className="w-7 h-7 rounded-full bg-gray-700 animate-pulse" /> : user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-secondary/40 transition-all">
                <img src={user.avatar_url} alt={user.login} className="w-7 h-7 rounded-full" />
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-primary-light border border-gray-700/60 rounded-xl shadow-2xl py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-gray-800"><p className="text-sm font-medium">{user.name || user.login}</p><p className="text-[11px] text-gray-500">@{user.login}</p></div>
                  <Link to={`/${user.login}`} onClick={() => setDropdown(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-secondary hover:bg-white/[0.03]">Profile</Link>
                  <Link to="/dashboard" onClick={() => setDropdown(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-secondary hover:bg-white/[0.03]">Dashboard</Link>
                  <button onClick={() => { logout(); setDropdown(false); }} className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-white/[0.03]">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={login} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
