import { Link } from 'react-router-dom';
import { formatDate, formatNumber, LANGUAGE_COLORS } from '../utils/github';

export default function RepoCard({ repo }) {
  const langColor = LANGUAGE_COLORS[repo.language] || '#6b7280';

  return (
    <div className="card group">
      <div className="flex items-start gap-3">
        <img
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          className="w-10 h-10 rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link
              to={`/${repo.owner.login}`}
              className="text-sm text-gray-400 hover:text-secondary transition-colors"
            >
              {repo.owner.login}
            </Link>
            <span className="text-gray-600">/</span>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-secondary hover:text-secondary-light transition-colors truncate"
            >
              {repo.name}
            </a>
          </div>

          {repo.description && (
            <p className="mt-1.5 text-sm text-gray-400 line-clamp-2">
              {repo.description}
            </p>
          )}

          <div className="flex items-center flex-wrap gap-4 mt-3">
            {repo.language && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: langColor }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .587l3.668 7.568L24 9.306l-6 5.862 1.416 8.245L12 19.446l-7.416 3.967L6 15.168 0 9.306l8.332-1.151z" />
              </svg>
              {formatNumber(repo.stargazers_count)}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {formatNumber(repo.forks_count)}
            </span>
            <span className="text-xs text-gray-500">
              Updated {formatDate(repo.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
