import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrg, fetchOrgRepos, fetchOrgMembers, formatNumber } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/RepoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function OrgPage() {
  const { orgname } = useParams();
  const { token } = useAuth();

  const { data: org, isLoading, error } = useQuery({
    queryKey: ['org', orgname],
    queryFn: () => fetchOrg(orgname, token),
  });

  const { data: repos } = useQuery({
    queryKey: ['org-repos', orgname],
    queryFn: () => fetchOrgRepos(orgname, 1, 30, token),
    enabled: !!org,
  });

  const { data: members } = useQuery({
    queryKey: ['org-members', orgname],
    queryFn: () => fetchOrgMembers(orgname, token),
    enabled: !!org,
  });

  if (isLoading) return <LoadingSpinner text={`Loading ${orgname}...`} />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Organization not found</h2>
        <p className="text-gray-400">Could not find "{orgname}"</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Org Header */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img src={org.avatar_url} alt={org.login} className="w-24 h-24 rounded-xl" />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">{org.name || org.login}</h1>
            {org.description && <p className="text-gray-400 mt-1">{org.description}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 justify-center sm:justify-start">
              {org.location && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {org.location}
                </span>
              )}
              <span className="text-sm text-gray-400">{formatNumber(org.public_repos)} repos</span>
              {members && <span className="text-sm text-gray-400">{members.length} members</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      {members && members.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Members</h2>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 20).map((member) => (
              <Link key={member.id} to={`/${member.login}`} title={member.login}>
                <img
                  src={member.avatar_url}
                  alt={member.login}
                  className="w-10 h-10 rounded-full hover:ring-2 hover:ring-secondary transition-all"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Repos */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Repositories</h2>
        <div className="grid gap-4">
          {repos?.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
        </div>
      </div>
    </div>
  );
}
