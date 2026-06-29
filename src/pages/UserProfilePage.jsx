import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUser, fetchUserRepos, fetchUserOrgs, formatNumber } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/RepoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function UserProfilePage() {
  const { username } = useParams();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'repositories';

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username, token),
  });

  const { data: repos } = useQuery({
    queryKey: ['user-repos', username],
    queryFn: () => fetchUserRepos(username, 1, 30, 'updated', token),
    enabled: tab === 'repositories',
  });

  const { data: orgs } = useQuery({
    queryKey: ['user-orgs', username],
    queryFn: () => fetchUserOrgs(username, token),
  });

  if (isLoading) return <LoadingSpinner text={`Loading ${username}'s profile...`} />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">User not found</h2>
        <p className="text-gray-400">Could not find a user named "{username}"</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <aside className="lg:w-80 flex-shrink-0">
          <ProfileCard user={user} orgs={orgs} />
        </aside>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-3">
            <TabLink to={`/${username}?tab=repositories`} active={tab === 'repositories'}>
              Repositories
            </TabLink>
          </div>
          {tab === 'repositories' && repos && (
            <div className="grid gap-4">
              {repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



function ProfileCard({ user, orgs }) {
  return (
    <div className="card">
      <div className="text-center lg:text-left">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-32 h-32 rounded-full mx-auto lg:mx-0 ring-4 ring-secondary/20"
        />
        <div className="mt-4">
          <h1 className="text-xl font-bold text-white">{user.name || user.login}</h1>
          <p className="text-gray-400">@{user.login}</p>
        </div>
        {user.bio && <p className="mt-3 text-sm text-gray-300">{user.bio}</p>}

        <div className="flex items-center gap-4 mt-4 justify-center lg:justify-start">
          <span className="text-sm text-gray-400">
            <span className="font-medium text-white">{formatNumber(user.followers)}</span> followers
          </span>
          <span className="text-sm text-gray-400">
            <span className="font-medium text-white">{formatNumber(user.following)}</span> following
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-400">
          {user.company && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {user.company}
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.location}
            </div>
          )}
          {user.blog && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline truncate">
                {user.blog}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {user.public_repos} public repos
          </div>
        </div>

        {/* Organizations */}
        {orgs && orgs.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-700">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Organizations</h3>
            <div className="flex flex-wrap gap-2">
              {orgs.map((org) => (
                <Link key={org.id} to={`/orgs/${org.login}`} title={org.login}>
                  <img src={org.avatar_url} alt={org.login} className="w-8 h-8 rounded-md hover:ring-2 hover:ring-secondary transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active ? 'bg-secondary/10 text-secondary' : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}
