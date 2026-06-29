import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatNum, LANG_COLORS } from '../utils/github';

export function PeekabooRepos({ repos, title }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-6">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 snap-x snap-mandatory scrollbar-hide">
        {repos?.map((repo, i) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="snap-start flex-shrink-0"
          >
            <Link to={`/${repo.full_name}`} className="block w-[300px] card-glass hover:border-secondary/20 transition-all group">
              <div className="flex items-center gap-2.5 mb-3">
                <img src={repo.owner.avatar_url} alt="" className="w-8 h-8 rounded-lg" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-secondary">{repo.name}</p>
                  <p className="text-[11px] text-gray-500">{repo.owner.login}</p>
                </div>
              </div>
              {repo.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{repo.description}</p>}
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || '#666' }} />{repo.language}</span>}
                <span>★ {formatNum(repo.stargazers_count)}</span>
                <span>⑂ {formatNum(repo.forks_count)}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function PeekabooContributors({ users, title }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-6">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 snap-x snap-mandatory">
        {users?.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="snap-start flex-shrink-0"
          >
            <Link to={`/${user.login}`} className="block w-[180px] card-glass text-center hover:border-secondary/20 transition-all group p-5">
              <img src={user.avatar_url} alt={user.login} className="w-14 h-14 rounded-full mx-auto ring-2 ring-white/5 group-hover:ring-secondary/30 transition-all" />
              <p className="text-sm font-semibold text-white mt-3 truncate group-hover:text-secondary">{user.login}</p>
              {user.type === 'User' && <p className="text-[11px] text-gray-500 mt-0.5">Developer</p>}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
