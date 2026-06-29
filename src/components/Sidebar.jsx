import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../utils/github';

const NAV_ITEMS = [
  { path: '/', label: 'Trending', icon: FireIcon },
  { path: '/explore', label: 'Explore', icon: CompassIcon },
  { path: '/search', label: 'Search', icon: SearchIcon },
  { path: '/issues', label: 'Issues', icon: IssueIcon },
  { path: '/snippets', label: 'Code Search', icon: CodeIcon },
  { path: '/editor', label: 'Editor', icon: EditorIcon },
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon, auth: true },
];

const FEATURED = [
  { label: 'Trending This Week', path: '/?since=weekly' },
  { label: 'Trending This Month', path: '/?since=monthly' },
  { label: 'Most Forked', path: '/explore?sort=forks' },
];

export default function Sidebar() {
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-primary-dark border-r border-gray-800/50 z-40 transition-all duration-300 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isMinimized ? 'w-16' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full py-4">
          {/* Minimize toggle (desktop only) */}
          <button
            onClick={toggleMinimize}
            className="hidden lg:flex items-center justify-center w-full px-3 mb-3 text-gray-500 hover:text-secondary transition-colors"
            title={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`w-5 h-5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              if (item.auth && !user) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive ? 'bg-secondary/10 text-secondary' : 'text-gray-400 hover:text-white hover:bg-primary-light'}
                    ${isMinimized ? 'justify-center' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isMinimized && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Featured section */}
          {!isMinimized && (
            <div className="px-3 mt-4 pt-4 border-t border-gray-800/50">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Featured</h4>
              {FEATURED.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  className="block px-2 py-1.5 text-xs text-gray-400 hover:text-secondary transition-colors rounded"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Top Languages */}
          {!isMinimized && (
            <div className="px-3 mt-4 pt-4 border-t border-gray-800/50">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Languages</h4>
              <div className="flex flex-wrap gap-1 px-2">
                {LANGUAGES.slice(0, 8).map((lang) => (
                  <Link
                    key={lang}
                    to={`/explore?language=${lang}`}
                    onClick={close}
                    className="text-xs px-2 py-1 bg-primary-light text-gray-400 hover:text-secondary hover:border-secondary/30 rounded border border-gray-700/50 transition-colors"
                  >
                    {lang}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {!isMinimized && (
            <div className="px-3 mt-4 pt-4 border-t border-gray-800/50">
              <Link
                to="/support"
                onClick={close}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:text-secondary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings & Support
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// Icon Components
function FireIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function CompassIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c0 1.657-4.03 3-9 3s-9-1.343-9-3m18 0c0-1.657-4.03-3-9-3s-9 1.343-9 3m9 9a9 9 0 01-9-9m9 9c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IssueIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CodeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function EditorIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}
