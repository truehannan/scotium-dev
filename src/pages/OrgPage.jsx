import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrg, fetchOrgRepos, fetchOrgMembers, fetchRepoReadme, formatNum } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/ui/RepoCard';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MarkdownReadme from '../components/ui/MarkdownReadme';

export default function OrgPage() {
  const { orgname } = useParams();
  const { token } = useAuth();
  const [tab, setTab] = useState('overview');

  const { data: org, isLoading, error } = useQuery({ queryKey: ['org', orgname], queryFn: () => fetchOrg(orgname, token) });
  const { data: repos } = useQuery({ queryKey: ['org-repos', orgname], queryFn: () => fetchOrgRepos(orgname, 1, 30, token), enabled: !!org });
  const { data: members } = useQuery({ queryKey: ['org-members', orgname], queryFn: () => fetchOrgMembers(orgname, token), enabled: !!org });
  // Org profile README: from .github repo
  const { data: orgReadme } = useQuery({
    queryKey: ['org-readme', orgname],
    queryFn: () => fetchRepoReadme(orgname, '.github', token),
    enabled: !!org,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-16"><h2 className="text-2xl font-bold text-white">Organization not found</h2></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title={`${org.name || orgname} - Organization`} canonical={`/orgs/${orgname}`} />

      {/* Org Header */}
      <div className="card mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <img src={org.avatar_url} alt="" className="w-16 h-16 rounded-xl" />
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold text-white">{org.name || orgname}</h1>
          {org.description && <p className="text-sm text-gray-400 mt-0.5">{org.description}</p>}
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 justify-center sm:justify-start">
            {org.location && <span>{org.location}</span>}
            <span>{formatNum(org.public_repos)} repos</span>
            {members && <span>{members.length} members</span>}
            {org.blog && <a href={org.blog.startsWith('http') ? org.blog : `https://${org.blog}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">{org.blog}</a>}
          </div>
        </div>
      </div>

      {/* Members */}
      {members?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">Members</h2>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 24).map(m => (
              <Link key={m.id} to={`/${m.login}`} title={m.login}>
                <img src={m.avatar_url} alt={m.login} className="w-8 h-8 rounded-full hover:ring-2 hover:ring-secondary/30" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-white/[0.06] mb-6">
        <button onClick={() => setTab('overview')} className={`px-4 py-3 text-sm ${tab === 'overview' ? 'tab-active' : 'tab-inactive'}`}>Overview</button>
        <button onClick={() => setTab('repositories')} className={`px-4 py-3 text-sm ${tab === 'repositories' ? 'tab-active' : 'tab-inactive'}`}>Repositories <span className="text-[10px] bg-gray-700/60 px-1.5 py-0.5 rounded-full ml-1">{org.public_repos}</span></button>
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          {orgReadme ? (
            <div className="mb-6"><MarkdownReadme html={orgReadme} /></div>
          ) : (
            <div className="card text-center py-8 mb-6">
              <p className="text-gray-500 text-sm">No organization README found.</p>
              <p className="text-[11px] text-gray-600 mt-1">Create a <code className="text-secondary">.github</code> repo with a README.md</p>
            </div>
          )}
          {repos?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Popular repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {repos.slice(0, 6).map(r => <RepoCard key={r.id} repo={r} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Repositories */}
      {tab === 'repositories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {repos?.map(r => <RepoCard key={r.id} repo={r} />)}
        </div>
      )}
    </div>
  );
}
