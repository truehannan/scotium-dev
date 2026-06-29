import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRepo, fetchRepoReadme, fetchRepoContents, fetchRepoIssues, fetchRepoPulls, formatNum, formatDate, LANG_COLORS } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function RepoDetailPage() {
  const { owner, repo, tab } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const activeTab = tab || 'code';

  const { data: repoData, isLoading, error } = useQuery({
    queryKey: ['repo', owner, repo],
    queryFn: () => fetchRepo(owner, repo, token),
  });

  const { data: readme } = useQuery({
    queryKey: ['repo-readme', owner, repo],
    queryFn: () => fetchRepoReadme(owner, repo, token),
    enabled: activeTab === 'code',
  });

  const { data: contents } = useQuery({
    queryKey: ['repo-contents', owner, repo],
    queryFn: () => fetchRepoContents(owner, repo, '', '', token),
    enabled: activeTab === 'code',
  });

  const { data: issues } = useQuery({
    queryKey: ['repo-issues', owner, repo],
    queryFn: () => fetchRepoIssues(owner, repo, 'open', 1, token),
    enabled: activeTab === 'issues',
  });

  const { data: pulls } = useQuery({
    queryKey: ['repo-pulls', owner, repo],
    queryFn: () => fetchRepoPulls(owner, repo, 'open', 1, token),
    enabled: activeTab === 'pulls',
  });

  if (isLoading) return <LoadingSpinner text={`Loading ${owner}/${repo}...`} />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-white">Repository not found</h2><p className="text-gray-400 mt-2">{owner}/{repo} doesn't exist or is private.</p></div>;

  const tabs = [
    { key: 'code', label: 'Code' },
    { key: 'issues', label: 'Issues', count: repoData.open_issues_count },
    { key: 'pulls', label: 'Pull Requests' },
    { key: 'pulse', label: 'Pulse', special: true },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <SEO title={`${owner}/${repo}`} description={repoData.description || `${repo} repository on Scotium`} canonical={`/${owner}/${repo}`} />

      {/* Repo Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <img src={repoData.owner.avatar_url} alt="" className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/${owner}`} className="text-gray-400 hover:text-secondary text-sm">{owner}</Link>
              <span className="text-gray-600">/</span>
              <h1 className="text-xl font-bold text-white">{repo}</h1>
              {repoData.private && <span className="badge bg-yellow-500/10 text-yellow-400">Private</span>}
              {repoData.fork && <span className="badge bg-blue-500/10 text-blue-400">Fork</span>}
            </div>
            {repoData.description && <p className="text-sm text-gray-400 mt-1">{repoData.description}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">★ {formatNum(repoData.stargazers_count)}</span>
              <span className="flex items-center gap-1">⑂ {formatNum(repoData.forks_count)}</span>
              <span className="flex items-center gap-1">👁 {formatNum(repoData.watchers_count)}</span>
              {repoData.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[repoData.language] }} />{repoData.language}</span>}
              {repoData.license?.spdx_id && <span>{repoData.license.spdx_id}</span>}
              <span>Updated {formatDate(repoData.updated_at)}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/${owner}/${repo}/editor`} className="btn-primary text-xs py-2 px-3">Open in Editor</Link>
            <a href={repoData.html_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-2 px-3">GitHub →</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-white/[0.06] mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => t.special ? navigate(`/${owner}/${repo}/pulse`) : navigate(`/${owner}/${repo}/${t.key === 'code' ? '' : t.key}`)} className={`px-4 py-3 text-sm whitespace-nowrap flex items-center gap-1.5 ${activeTab === t.key ? 'tab-active' : 'tab-inactive'}`}>
            {t.label}
            {t.count !== undefined && <span className="text-[10px] bg-gray-700/60 px-1.5 py-0.5 rounded-full">{formatNum(t.count)}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* File tree */}
            {contents && Array.isArray(contents) && (
              <div className="card mb-4">
                <div className="space-y-0.5">
                  {contents.sort((a, b) => (a.type === 'dir' ? -1 : 1) - (b.type === 'dir' ? -1 : 1) || a.name.localeCompare(b.name)).map(item => (
                    <div key={item.sha} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.02] text-sm">
                      {item.type === 'dir' ? (
                        <svg className="w-4 h-4 text-accent-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      )}
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* README */}
            {readme && (
              <div className="card prose prose-invert max-w-none prose-sm prose-headings:text-white prose-a:text-secondary prose-code:text-secondary-light prose-pre:bg-primary-dark prose-pre:border prose-pre:border-gray-800">
                <div dangerouslySetInnerHTML={{ __html: readme }} />
              </div>
            )}
          </div>
          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">About</h3>
              {repoData.homepage && <a href={repoData.homepage} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline block mb-2">{repoData.homepage}</a>}
              <div className="space-y-2 text-xs text-gray-400">
                <div>Created {formatDate(repoData.created_at)}</div>
                <div>Default branch: <code className="text-secondary">{repoData.default_branch}</code></div>
                {repoData.topics?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{repoData.topics.map(t => <span key={t} className="badge bg-secondary/10 text-secondary">{t}</span>)}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-2">
          {issues?.filter(i => !i.pull_request).map(issue => (
            <a key={issue.id} href={issue.html_url} target="_blank" rel="noopener noreferrer" className="card flex items-start gap-3 group">
              <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-secondary truncate">{issue.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">#{issue.number} • {issue.user.login} • {formatDate(issue.created_at)} • {issue.comments} comments</p>
              </div>
            </a>
          ))}
          {(!issues || issues.filter(i => !i.pull_request).length === 0) && <div className="card text-center py-8 text-gray-400 text-sm">No open issues</div>}
        </div>
      )}

      {activeTab === 'pulls' && (
        <div className="space-y-2">
          {pulls?.map(pr => (
            <a key={pr.id} href={pr.html_url} target="_blank" rel="noopener noreferrer" className="card flex items-start gap-3 group">
              <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${pr.state === 'open' ? 'bg-green-500' : 'bg-purple-500'}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-secondary truncate">{pr.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">#{pr.number} • {pr.user.login} • {formatDate(pr.created_at)}</p>
              </div>
            </a>
          ))}
          {(!pulls || pulls.length === 0) && <div className="card text-center py-8 text-gray-400 text-sm">No open pull requests</div>}
        </div>
      )}
    </div>
  );
}
