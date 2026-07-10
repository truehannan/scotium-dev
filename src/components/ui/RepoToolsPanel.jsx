import { useMemo } from 'react';
import { VscHeart, VscStarFull, VscGitCommit, VscSymbolEvent, VscBug, VscOrganization, VscTag, VscRepoForked, VscLaw, VscDatabase, VscLayers, VscFile } from 'react-icons/vsc';
import { formatNum } from '../../utils/github';

export default function RepoToolsPanel({ repoData, commits, contributors, issues, pulls, releases, languages }) {
  const tools = useMemo(() => computeTools(repoData, commits, contributors, issues, pulls, releases, languages), [repoData, commits, contributors, issues, pulls, releases, languages]);

  return (
    <>
      <div className="lg:hidden mb-4 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {tools.map(t => (
            <div key={t.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-light/80 border border-white/[0.04] flex-shrink-0">
              <t.icon className={`w-3 h-3 ${t.color}`} />
              <span className="text-[10px] text-gray-500">{t.label}</span>
              <span className={`text-[11px] font-bold ${t.color}`}>{t.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden lg:grid grid-cols-4 gap-1.5 mb-4">
        {tools.map(t => (
          <div key={t.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
            <t.icon className={`w-3.5 h-3.5 flex-shrink-0 ${t.color}`} />
            <div className="min-w-0">
              <p className={`text-xs font-bold ${t.color} truncate`}>{t.value}</p>
              <p className="text-[9px] text-gray-500 truncate">{t.label}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function computeTools(repo, commits, contributors, issues, pulls, releases, languages) {
  if (!repo) return [];
  const stars = repo.stargazers_count || 0;
  const daysSinceCommit = commits?.[0] ? Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000) : null;
  const commitLabel = daysSinceCommit === null ? 'N/A' : daysSinceCommit === 0 ? 'Today' : `${daysSinceCommit}d`;
  const openIssues = repo.open_issues_count || 0;
  const contribCount = contributors?.length || 0;
  const busFactor = contribCount >= 10 ? 'Low' : contribCount >= 5 ? 'Med' : contribCount >= 2 ? 'High' : 'Crit';
  const busColor = contribCount >= 10 ? 'text-green-400' : contribCount >= 5 ? 'text-yellow-400' : 'text-red-400';
  const releaseCount = releases?.length || 0;
  const forks = repo.forks_count || 0;
  const license = repo.license?.spdx_id || 'None';
  const sizeKB = repo.size || 0;
  const sizeLabel = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)}MB` : `${sizeKB}KB`;
  const langKeys = languages ? Object.keys(languages) : [];
  const techStack = langKeys.slice(0, 3).join(', ') || '—';
  const healthScore = calcHealth(daysSinceCommit, contribCount, openIssues, releaseCount, stars);

  return [
    { id: 'health', icon: VscHeart, label: 'Health', value: `${healthScore}/100`, color: healthScore >= 70 ? 'text-green-400' : healthScore >= 40 ? 'text-yellow-400' : 'text-red-400' },
    { id: 'stars', icon: VscStarFull, label: 'Stars', value: formatNum(stars), color: 'text-yellow-400' },
    { id: 'commits', icon: VscGitCommit, label: 'Last Commit', value: commitLabel, color: daysSinceCommit !== null && daysSinceCommit < 7 ? 'text-green-400' : 'text-yellow-400' },
    { id: 'pr-speed', icon: VscSymbolEvent, label: 'PR Speed', value: 'N/A', color: 'text-accent-cyan' },
    { id: 'issues', icon: VscBug, label: 'Issues', value: `${openIssues}`, color: openIssues < 10 ? 'text-green-400' : 'text-yellow-400' },
    { id: 'bus', icon: VscOrganization, label: 'Bus Factor', value: busFactor, color: busColor },
    { id: 'releases', icon: VscTag, label: 'Releases', value: `${releaseCount}`, color: releaseCount > 0 ? 'text-green-400' : 'text-gray-400' },
    { id: 'forks', icon: VscRepoForked, label: 'Forks', value: formatNum(forks), color: 'text-accent-blue' },
    { id: 'license', icon: VscLaw, label: 'License', value: license, color: license !== 'None' ? 'text-green-400' : 'text-red-400' },
    { id: 'size', icon: VscDatabase, label: 'Size', value: sizeLabel, color: 'text-accent-purple' },
    { id: 'stack', icon: VscLayers, label: 'Stack', value: techStack, color: 'text-white' },
    { id: 'deps', icon: VscFile, label: 'Langs', value: `${langKeys.length}`, color: 'text-gray-300' },
  ];
}

function calcHealth(days, contribs, issues, releases, stars) {
  let s = 0;
  s += Math.max(0, 25 - (days || 30));
  s += Math.min(25, contribs * 3);
  s += Math.max(0, 25 - issues * 0.5);
  s += releases > 0 ? 15 : 0;
  s += Math.min(10, Math.log10(Math.max(stars, 1)) * 3);
  return Math.min(100, Math.max(0, Math.round(s)));
}
