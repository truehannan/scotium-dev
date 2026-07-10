import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { VscRocket, VscLightbulb, VscRepoForked, VscFlame } from 'react-icons/vsc';
import { formatNum, LANG_COLORS } from '../../utils/github';
import axios from 'axios';

const API = 'https://api.github.com';
const hdrs = (t) => ({ Accept: 'application/vnd.github.v3+json', ...(t ? { Authorization: `Bearer ${t}` } : {}) });

export default function DiscoveryTools({ token }) {
  const { data: rising } = useQuery({ queryKey: ['discovery-rising'], queryFn: async () => { const d = new Date(); d.setDate(d.getDate() - 7); return (await axios.get(`${API}/search/repositories`, { params: { q: `created:>${d.toISOString().split('T')[0]} stars:>50`, sort: 'stars', order: 'desc', per_page: 6 }, headers: hdrs(token) })).data.items || []; } });
  const { data: gems } = useQuery({ queryKey: ['discovery-gems'], queryFn: async () => { const d = new Date(); d.setDate(d.getDate() - 3); return (await axios.get(`${API}/search/repositories`, { params: { q: `stars:10..200 pushed:>${d.toISOString().split('T')[0]}`, sort: 'updated', order: 'desc', per_page: 6 }, headers: hdrs(token) })).data.items || []; } });
  const { data: forked } = useQuery({ queryKey: ['discovery-forked'], queryFn: async () => { const d = new Date(); d.setDate(d.getDate() - 7); return (await axios.get(`${API}/search/repositories`, { params: { q: `created:>${d.toISOString().split('T')[0]} forks:>5`, sort: 'forks', order: 'desc', per_page: 6 }, headers: hdrs(token) })).data.items || []; } });
  const { data: released } = useQuery({ queryKey: ['discovery-released'], queryFn: async () => { const d = new Date(); d.setDate(d.getDate() - 3); return (await axios.get(`${API}/search/repositories`, { params: { q: `stars:>1000 pushed:>${d.toISOString().split('T')[0]}`, sort: 'updated', order: 'desc', per_page: 6 }, headers: hdrs(token) })).data.items || []; } });

  return (
    <section className="px-4 sm:px-6 py-8">
      <h2 className="section-title mb-6">Discovery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiscoveryCard Icon={VscRocket} title="Rising Stars" subtitle="New repos gaining stars this week" repos={rising} />
        <DiscoveryCard Icon={VscLightbulb} title="Undiscovered Gems" subtitle="Active repos with <200 stars" repos={gems} />
        <DiscoveryCard Icon={VscRepoForked} title="Most Forked" subtitle="New repos people are forking" repos={forked} />
        <DiscoveryCard Icon={VscFlame} title="Active Giants" subtitle="Popular repos updated recently" repos={released} />
      </div>
    </section>
  );
}

function DiscoveryCard({ Icon, title, subtitle, repos }) {
  if (!repos || repos.length === 0) return null;
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-secondary" />
        <div><h3 className="text-sm font-semibold text-white">{title}</h3><p className="text-[10px] text-gray-500">{subtitle}</p></div>
      </div>
      <div className="space-y-1.5">
        {repos.slice(0, 4).map(r => (
          <Link key={r.id} to={`/${r.full_name}`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] group">
            <img src={r.owner.avatar_url} alt="" className="w-5 h-5 rounded-md flex-shrink-0" />
            <p className="text-[11px] text-gray-300 group-hover:text-secondary truncate flex-1">{r.full_name}</p>
            <span className="text-[10px] text-gray-500">+{formatNum(r.stargazers_count)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
