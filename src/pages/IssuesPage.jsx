import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchIssues, fetchIssueComments, formatDate } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import LoadingSpinner from '../components/LoadingSpinner';

export default function IssuesPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('reactions');
  const [expandedIssue, setExpandedIssue] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['issues-search', searchTerm, sort],
    queryFn: () => searchIssues(searchTerm, sort, 1, 30, token),
    enabled: !!searchTerm,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) setSearchTerm(query.trim());
  };

  // Bookmarks from localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('issue_bookmarks') || '[]'); }
    catch { return []; }
  });

  const toggleBookmark = (issue) => {
    const exists = bookmarks.find((b) => b.id === issue.id);
    let updated;
    if (exists) {
      updated = bookmarks.filter((b) => b.id !== issue.id);
    } else {
      updated = [...bookmarks, { id: issue.id, title: issue.title, url: issue.html_url, repo: issue.repository_url?.split('/').slice(-2).join('/') }];
    }
    setBookmarks(updated);
    localStorage.setItem('issue_bookmarks', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SEO title="Issue Browser" description="Search and browse GitHub issues with threaded comments" canonical="/issues" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Issue Browser</h1>
        <p className="text-gray-400">Search and browse GitHub issues across repositories</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issues... (e.g., 'bug react', 'help wanted')"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {/* Sort & Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field text-sm py-1.5">
          <option value="reactions">Most Reactions</option>
          <option value="created">Newest</option>
          <option value="updated">Recently Updated</option>
          <option value="comments">Most Comments</option>
        </select>
        {bookmarks.length > 0 && (
          <span className="text-sm text-gray-400">{bookmarks.length} bookmarked</span>
        )}
      </div>

      {/* Bookmarks Section */}
      {bookmarks.length > 0 && !searchTerm && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Bookmarked Issues</h2>
          <div className="space-y-2">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="card flex items-center justify-between">
                <div>
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-secondary">
                    {bm.title}
                  </a>
                  <p className="text-xs text-gray-500">{bm.repo}</p>
                </div>
                <button
                  onClick={() => toggleBookmark(bm)}
                  className="text-yellow-400 hover:text-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.568L24 9.306l-6 5.862 1.416 8.245L12 19.446l-7.416 3.967L6 15.168 0 9.306l8.332-1.151z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading && <LoadingSpinner text="Searching issues..." />}

      {data && (
        <div className="space-y-3">
          {data.items?.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-gray-400">No issues found for "{searchTerm}"</p>
            </div>
          )}
          {data.items?.map((issue) => (
            <IssueThread
              key={issue.id}
              issue={issue}
              token={token}
              isExpanded={expandedIssue === issue.id}
              onToggle={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              isBookmarked={bookmarks.some((b) => b.id === issue.id)}
              onBookmark={() => toggleBookmark(issue)}
            />
          ))}
        </div>
      )}

      {!searchTerm && bookmarks.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl text-gray-300 mb-2">Browse GitHub Issues</h2>
          <p className="text-gray-500">Search for issues across repos with threaded comments</p>
        </div>
      )}
    </div>
  );
}

function IssueThread({ issue, token, isExpanded, onToggle, isBookmarked, onBookmark }) {
  const repoName = issue.repository_url?.split('/').slice(-2).join('/') || '';
  const [owner, repo] = repoName.split('/');

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['issue-comments', owner, repo, issue.number],
    queryFn: () => fetchIssueComments(owner, repo, issue.number, token),
    enabled: isExpanded && !!owner && !!repo,
  });

  return (
    <div className="card">
      {/* Issue Header */}
      <div className="flex items-start gap-3">
        <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-secondary transition-colors">
                {issue.title}
              </a>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <span className="text-xs text-gray-500">{repoName} #{issue.number}</span>
                <span className="text-xs text-gray-500">by {issue.user?.login}</span>
                <span className="text-xs text-gray-500">{formatDate(issue.created_at)}</span>
                {issue.reactions?.total_count > 0 && (
                  <span className="text-xs text-gray-400">👍 {issue.reactions.total_count}</span>
                )}
                {issue.comments > 0 && (
                  <span className="text-xs text-gray-400">💬 {issue.comments}</span>
                )}
              </div>
              {issue.labels?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {issue.labels.slice(0, 5).map((label) => (
                    <span key={label.id} className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}>
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onBookmark}
                className={`p-1 rounded transition-colors ${isBookmarked ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              {issue.comments > 0 && (
                <button
                  onClick={onToggle}
                  className="p-1 text-gray-500 hover:text-secondary transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand comments'}
                >
                  <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Body (truncated) */}
      {issue.body && (
        <div className="mt-3 ml-7 p-3 bg-primary rounded-lg border border-gray-800">
          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono overflow-hidden max-h-24">
            {issue.body.slice(0, 500)}{issue.body.length > 500 ? '...' : ''}
          </pre>
        </div>
      )}

      {/* Comments Thread */}
      {isExpanded && (
        <div className="mt-4 ml-7 space-y-3 border-l-2 border-gray-700 pl-4">
          {commentsLoading && <LoadingSpinner size="sm" text="Loading comments..." />}
          {comments?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-primary-light rounded-lg border border-gray-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src={comment.user?.avatar_url} alt={comment.user?.login} className="w-5 h-5 rounded-full" />
          <span className="text-xs font-medium text-gray-300">{comment.user?.login}</span>
          <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-xs text-gray-500 hover:text-gray-300">
          {collapsed ? '[+]' : '[-]'}
        </button>
      </div>
      {!collapsed && (
        <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono overflow-hidden max-h-40">
          {comment.body?.slice(0, 800)}{comment.body?.length > 800 ? '...' : ''}
        </pre>
      )}
      {comment.reactions?.total_count > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          👍 {comment.reactions['+1'] || 0} 👎 {comment.reactions['-1'] || 0} ❤️ {comment.reactions.heart || 0}
        </div>
      )}
    </div>
  );
}
