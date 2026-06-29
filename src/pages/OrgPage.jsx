import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrg, fetchOrgRepos, fetchOrgMembers, formatNum } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import RepoCard from '../components/ui/RepoCard';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function OrgPage() {
  const { orgname } = useParams();
  const { token } = useAuth();
  const { data: org, isLoading, error } = useQuery({ queryKey: ['org', orgname], queryFn: () => fetchOrg(orgname, token) });
  const { data: repos } = useQuery({ queryKey: ['org-repos', orgname], queryFn: () => fetchOrgRepos(orgname, 1, 30, token), enabled: !!org });
  const { data: members } = useQuery({ queryKey: ['org-members', orgname], queryFn: () => fetchOrgMembers(orgname, token), enabled: !!org });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-16"><h2 className="text-2xl font-bold text-white">Organization not found</h2></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title={`${org.name || orgname} - Organization`} canonical={`/orgs/${orgname}`} />
      <div className="card mb-6 flex items-center gap-5">
        <img src={org.avatar_url} alt="" className="w-16 h-16 rounded-xl" />
        <div>
          <h1 className="text-xl font-bold text-white">{org.name || orgname}</h1>
          {org.description && <p className="text-sm text-gray-400 mt-0.5">{org.description}</p>}
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            {org.location && <span>📍 {org.location}</span>}
            <span>{formatNum(org.public_repos)} repos</span>
            {members && <span>{members.length} members</span>}
          </div>
        </div>
      </div>
      {members?.length > 0 && (
        <div className="mb-6"><h2 className="text-sm font-semibold text-white mb-3">Members</h2><div className="flex flex-wrap gap-2">{members.slice(0, 20).map(m => <Link key={m.id} to={`/${m.login}`}><img src={m.avatar_url} alt={m.login} className="w-8 h-8 rounded-full hover:ring-2 hover:ring-secondary/30" title={m.login} /></Link>)}</div></div>
      )}
      <h2 className="text-lg font-semibold text-white mb-4">Repositories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{repos?.map(r => <RepoCard key={r.id} repo={r} />)}</div>
    </div>
  );
}
