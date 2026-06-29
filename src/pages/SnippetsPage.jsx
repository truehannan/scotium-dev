import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCode, LANGUAGES } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import LoadingSpinner from '../components/LoadingSpinner';

const COLLECTIONS = [
  { label: 'React Hooks', query: 'useEffect useState filename:*.tsx' },
  { label: 'Python Async', query: 'async await filename:*.py' },
  { label: 'Go Concurrency', query: 'goroutine channel filename:*.go' },
  { label: 'Rust Error Handling', query: 'Result<> unwrap filename:*.rs' },
  { label: 'Node.js APIs', query: 'express router filename:*.js' },
  { label: 'TypeScript Types', query: 'interface extends filename:*.ts' },
];

export default function SnippetsPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);

  // Saved snippets from localStorage
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saved_snippets') || '[]'); }
    catch { return []; }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['code-search', searchTerm, language, page],
    queryFn: () => searchCode(searchTerm, language, page, 30, token),
    enabled: !!searchTerm,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTerm(query.trim());
      setPage(1);
    }
  };

  const handleCollectionClick = (collectionQuery) => {
    setQuery(collectionQuery);
    setSearchTerm(collectionQuery);
    setPage(1);
  };

  const saveSnippet = (item) => {
    const snippet = {
      id: item.sha,
      name: item.name,
      path: item.path,
      repo: item.repository?.full_name,
      url: item.html_url,
      savedAt: new Date().toISOString(),
    };
    const exists = saved.find((s) => s.id === item.sha);
    let updated;
    if (exists) {
      updated = saved.filter((s) => s.id !== item.sha);
    } else {
      updated = [...saved, snippet];
    }
    setSaved(updated);
    localStorage.setItem('saved_snippets', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SEO title="Code Search & Snippets" description="Search code snippets across GitHub repositories" canonical="/snippets" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Code Search & Snippets</h1>
        <p className="text-gray-400">Search code across GitHub repositories by language and pattern</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code... (e.g., 'fetch api filename:*.js')"
          className="input-field flex-1"
        />
        <select
          value={language}
          onChange={(e) => { setLanguage(e.target.value); if (searchTerm) setPage(1); }}
          className="input-field w-40"
        >
          <option value="">All Languages</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {/* Note about auth */}
      {!token && (
        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-400">
            Note: Code search requires authentication for higher rate limits. Sign in for best results.
          </p>
        </div>
      )}

      {/* Collections */}
      {!searchTerm && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Popular Patterns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COLLECTIONS.map((col) => (
              <button
                key={col.label}
                onClick={() => handleCollectionClick(col.query)}
                className="card text-left hover:border-secondary/50"
              >
                <h3 className="text-sm font-medium text-white">{col.label}</h3>
                <p className="text-xs text-gray-500 mt-1 font-mono truncate">{col.query}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Snippets */}
      {saved.length > 0 && !searchTerm && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Saved Snippets ({saved.length})</h2>
          <div className="grid gap-2">
            {saved.map((s) => (
              <div key={s.id} className="card flex items-center justify-between">
                <div className="min-w-0">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-secondary truncate block">
                    {s.name}
                  </a>
                  <p className="text-xs text-gray-500">{s.repo} / {s.path}</p>
                </div>
                <button onClick={() => saveSnippet(s)} className="text-red-400 hover:text-red-300 text-xs flex-shrink-0 ml-2">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading && <LoadingSpinner text="Searching code..." />}

      {error && (
        <div className="card text-center py-8">
          <p className="text-gray-400">Code search requires authentication or the query is invalid.</p>
          <p className="text-xs text-gray-500 mt-1">Try signing in or modifying your search query.</p>
        </div>
      )}

      {data && (
        <>
          <p className="text-sm text-gray-400 mb-4">
            Found <span className="text-white font-medium">{data.total_count?.toLocaleString()}</span> code results
          </p>
          <div className="space-y-3">
            {data.items?.map((item) => (
              <CodeResult
                key={item.sha}
                item={item}
                isSaved={saved.some((s) => s.id === item.sha)}
                onSave={() => saveSnippet(item)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-8">
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

function CodeResult({ item, isSaved, onSave }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={item.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-secondary hover:text-secondary-light transition-colors truncate"
            >
              {item.name}
            </a>
          </div>
          <p className="text-xs text-gray-500 mb-2 truncate">
            {item.repository?.full_name} / {item.path}
          </p>

          {/* Code Preview */}
          {item.text_matches && item.text_matches.length > 0 && (
            <div className="bg-primary rounded-lg border border-gray-800 p-3 overflow-x-auto">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {item.text_matches[0]?.fragment?.slice(0, 300)}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={onSave}
          className={`p-1.5 rounded transition-colors flex-shrink-0 ${
            isSaved ? 'text-secondary bg-secondary/10' : 'text-gray-500 hover:text-secondary'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save snippet'}
        >
          <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
