import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatNum, LANG_COLORS } from '../../utils/github';
import axios from 'axios';

const API = 'https://api.github.com';
const headers = (t) => ({ Accept: 'application/vnd.github.v3+json', ...(t ? { Authorization: `Bearer ${t}` } : {}) });

export default function DiscoveryTools({ token }) {
  // Rising Stars: repos created this week with fastest star growth
  const { data: rising } = useQuery({
    queryKey: ['discovery-rising'],
    queryFn: async () => {
      const d = new Date(); d.setDate(d.getDate() - 7);
      const res = await axios.get(`${API}/search/repositories`, { params: { q: `created:>${d.toISOString().split('T')[0]} stars:>50`, sort: 'stars', order: 'desc', per_page: 6 }, headers: headers(token) });
      return res.data.items || [];
    },
  });

  // Undiscovered Gems: <200 stars but pushed in last 3 days
  const { data: gems } = useQuery({
    queryKey: ['discovery-gems'],
    queryFn: async () => {
      const d = new Date(); d.setDate(d.getDate() - 3);
      const res = await axios.get(`${API}/search/repositories`, { params: { q: `stars:10..200 pushed:>${d.toISOString().split('T')[0]}`, sort: 'updated', order: 'desc', per_page: 6 }, headers: headers(token) });
      return res.data.items || [];
    },
  });

  // Most Forked This Week
  const { data: forked } = useQuery({
    queryKey: ['discovery-forked'],
    queryFn: async () => {
      const d = new Date(); d.setDate(d.getDate() - 7);
      const res = await axios.get(`${API}/search/repositories`, { params: { q: `created:>${d.toISOString().split('T')[0]} forks:>5`, sort: 'forks', order: 'desc', per_page: 6 }, headers: headers(token) });
      return res.data.items || [];
    },
  });

  // Recently Released (popular repos with recent activity)
  const { data: released } = useQuery({
    queryKey: ['discovery-released'],
    queryFn: async () => {
      const d = new Date(); d.setDate(d.getDate() - 3);
      const res = await axios.get(`${API}/search/repositories`, { params: { q: `stars:>1000 pushed:>${d.toISOString().split('T')[0]}`, sort: 'updated', order: 'desc', per_page: 6 }, headers: headers(token) });
      return res.data.items || [];
    },
  });

  return (
    <section className="px-4 sm:px-6 py-8">
      <h2 className="section-title mb-6">Discovery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DiscoveryCard title="🚀 Rising Stars" subtitle="New repos gaining stars this week" repos={rising} />
        <DiscoveryCard title="💎 Undiscovered Gems" subtitle="Active repos with <200 stars" repos={gems} />
        <DiscoveryCard title="🔀 Most Forked" subtitle="New repos people are forking" repos={forked} />
        <DiscoveryCard title="🔥 Active Giants" subtitle="Popular repos updated recently" repos={released} />
      </div>
    </section>
  );
}

function DiscoveryCard({ title, subtitle, repos }) {
  if (!repos || repos.length === 0) return null;
  return (
    <div className="card">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-[10px] text-gray-500">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {repos.slice(0, 4).map(r => (
          <Link key={r.id} to={`/${r.full_name}`} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
            <img src={r.owner.avatar_url} alt="" className="w-6 h-6 rounded-md flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-200 group-hover:text-secondary truncate">{r.full_name}</p>
              <p className="text-[10px] text-gray-500 truncate">{r.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-gray-500">
              {r.language && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LANG_COLORS[r.language] || '#666' }} />{r.language}</span>}
              <span>★{formatNum(r.stargazers_count)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
