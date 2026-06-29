import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchAuthUserRepos, fetchUserEvents, fetchUserIssues, fetchUserOrgs, fetchOrgReposAuth, formatNumber, formatDate } from '../utils/github';
import SEO from '../components/SEO';
import LoadingSpinner from '../components/LoadingSpinner';
import RepoCard from '../components/RepoCard';
import { Link, Navigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [activeOrg, setActiveOrg] = useState(null);
  const [tab, setTab] = useState('repos');

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ['dashboard-repos', user?.login, activeOrg],
    queryFn: () => activeOrg
      ? fetchOrgReposAuth(activeOrg, 'updated', 1, 30, token)
      : fetchAuthUserRepos('updated', 1, 30, token),
    enabled: !!user,
  });

  const { data: events } = useQuery({
    queryKey: ['dashboard-events', user?.login],
    queryFn: () => fetchUserEvents(user.login, 1, token),
    enabled: !!user,
  });

  const { data: issues } = useQuery({
    queryKey: ['dashboard-issues'],
    queryFn: () => fetchUserIssues(token),
    enabled: !!user,
  });

  const { data: orgs } = useQuery({
    queryKey: ['dashboard-orgs', user?.login],
    queryFn: () => fetchUserOrgs(user.login, token),
    enabled: !!user,
  });

  if (authLoading) return <LoadingSpinner text="Checking authentication..." />;
  if (!user) return <Navigate to="/" replace />;

  const topRepos = repos?.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5) || [];
  const recentActivity = events?.slice(0, 10) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SEO title="Dashboard" description="Your GitHub dashboard - repos, activity, and issues" canonical="/dashboard" />

      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img src={user.avatar_url} alt={user.login} className="w-20 h-20 rounded-full ring-4 ring-secondary/20" />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white">{user.name || user.login}</h1>
            <p className="text-gray-400">@{user.login}</p>
            {user.bio && <p className="text-sm text-gray-300 mt-1">{user.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 justify-center sm:justify-start">
              <Stat label="Repos" value={user.public_repos + (user.total_private_repos || 0)} />
              <Stat label="Followers" value={user.followers} />
              <Stat label="Following" value={user.following} />
              <Stat label="Gists" value={user.public_gists} />
            </div>
          </div>
        </div>
      </div>

      {/* Org Switcher */}
      {orgs && orgs.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveOrg(null)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0
              ${!activeOrg ? 'bg-secondary/10 text-secondary border border-secondary/30' : 'bg-primary-light text-gray-400 border border-gray-700 hover:border-gray-600'}`}
          >
            <img src={user.avatar_url} alt={user.login} className="w-5 h-5 rounded" />
            My Repos
          </button>
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => setActiveOrg(org.login)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0
                ${activeOrg === org.login ? 'bg-secondary/10 text-secondary border border-secondary/30' : 'bg-primary-light text-gray-400 border border-gray-700 hover:border-gray-600'}`}
            >
              <img src={org.avatar_url} alt={org.login} className="w-5 h-5 rounded" />
              {org.login}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-800 mb-6">
        <TabBtn active={tab === 'repos'} onClick={() => setTab('repos')}>Repositories</TabBtn>
        <TabBtn active={tab === 'activity'} onClick={() => setTab('activity')}>Activity</TabBtn>
        <TabBtn active={tab === 'issues'} onClick={() => setTab('issues')}>Open Issues</TabBtn>
        <TabBtn active={tab === 'top'} onClick={() => setTab('top')}>Top Repos</TabBtn>
      </div>

      {/* Tab Content */}
      {tab === 'repos' && (
        <div>
          {reposLoading ? (
            <LoadingSpinner text="Loading repositories..." />
          ) : (
            <div className="grid gap-4">
              {repos?.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
              {repos?.length === 0 && (
                <div className="card text-center py-8">
                  <p className="text-gray-400">No repositories found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="space-y-3">
          {recentActivity.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-gray-400">No recent activity.</p>
            </div>
          )}
          {recentActivity.map((event, i) => (
            <ActivityItem key={`${event.id}-${i}`} event={event} />
          ))}
        </div>
      )}

      {tab === 'issues' && (
        <div className="space-y-3">
          {!issues || issues.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-400">No open issues.</p>
            </div>
          ) : (
            issues.map((issue) => <IssueItem key={issue.id} issue={issue} />)
          )}
        </div>
      )}

      {tab === 'top' && (
        <div className="grid gap-4">
          {topRepos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <span className="text-lg font-bold text-white">{formatNumber(value)}</span>
      <span className="text-xs text-gray-500 ml-1">{label}</span>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
        active ? 'border-secondary text-secondary' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

function ActivityItem({ event }) {
  const icons = {
    PushEvent: '📝',
    WatchEvent: '⭐',
    CreateEvent: '🆕',
    ForkEvent: '🔀',
    IssuesEvent: '🐛',
    PullRequestEvent: '🔃',
    IssueCommentEvent: '💬',
    DeleteEvent: '🗑️',
    ReleaseEvent: '🚀',
  };

  return (
    <div className="card flex items-start gap-3">
      <span className="text-lg flex-shrink-0">{icons[event.type] || '📌'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">
          <span className="font-medium">{event.type.replace('Event', '')}</span>
          {event.repo && (
            <span className="text-gray-400 ml-1">
              in <Link to={`/${event.repo.name.split('/')[0]}`} className="text-secondary hover:underline">{event.repo.name}</Link>
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.created_at)}</p>
      </div>
    </div>
  );
}

function IssueItem({ issue }) {
  const repoName = issue.repository_url?.split('/').slice(-2).join('/') || '';
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${issue.pull_request ? 'bg-purple-500' : 'bg-green-500'}`} />
        <div className="flex-1 min-w-0">
          <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-secondary transition-colors">
            {issue.title}
          </a>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{repoName}</span>
            <span>#{issue.number}</span>
            <span>{formatDate(issue.updated_at)}</span>
            {issue.labels?.slice(0, 3).map((label) => (
              <span key={label.id} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}>
                {label.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
