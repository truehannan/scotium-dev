import { Link } from 'react-router-dom';
import { formatDate, formatNum, LANG_COLORS } from '../../utils/github';

export default function RepoCard({ repo }) {
  return (
    <Link to={`/${repo.full_name || `${repo.owner.login}/${repo.name}`}`} className="card group block">
      <div className="flex items-start gap-3">
        <img src={repo.owner.avatar_url} alt="" className="w-9 h-9 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{repo.owner.login}</span>
            <span className="text-gray-700">/</span>
            <span className="text-sm font-semibold text-secondary group-hover:text-secondary-light truncate">{repo.name}</span>
            {repo.private && <span className="badge bg-yellow-500/10 text-yellow-400 text-[10px]">Private</span>}
          </div>
          {repo.description && <p className="mt-1 text-xs text-gray-400 line-clamp-2">{repo.description}</p>}
          <div className="flex items-center flex-wrap gap-3 mt-2.5">
            {repo.language && (
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || '#6b7280' }} />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-gray-400">★ {formatNum(repo.stargazers_count)}</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">⑂ {formatNum(repo.forks_count)}</span>
            <span className="text-[11px] text-gray-500">{formatDate(repo.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
