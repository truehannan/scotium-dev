import { useCMS } from '../../context/CMSContext';
import { Link } from 'react-router-dom';

export default function SponsoredRepos() {
  const { sponsoredRepos } = useCMS();
  const active = sponsoredRepos.filter(s => s.active);
  if (!active.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsored</span>
        <span className="badge bg-accent-purple/10 text-accent-purple text-[10px]">Ad</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {active.map(s => (
          <Link key={s.id} to={s.repoPath} className="card-glass hover:border-accent-purple/30 transition-all group">
            <div className="flex items-center gap-3">
              {s.avatarUrl && <img src={s.avatarUrl} alt="" className="w-8 h-8 rounded-lg" />}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-accent-purple truncate">{s.name}</p>
                {s.description && <p className="text-[11px] text-gray-500 truncate">{s.description}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
