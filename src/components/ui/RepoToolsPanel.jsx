import { useMemo } from 'react';
import { formatNum, formatDate } from '../../utils/github';

export default function RepoToolsPanel({ repoData, commits, contributors, issues, pulls, releases, languages }) {
  const tools = useMemo(() => computeTools(repoData, commits, contributors, issues, pulls, releases, languages), [repoData, commits, contributors, issues, pulls, releases, languages]);

  return (
    <>
      {/* Mobile: horizontal slider at TOP */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-3 pb-3 min-w-max">
          {tools.map(tool => (
            <div key={tool.id} className="w-[200px] flex-shrink-0 card-glass p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{tool.icon}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{tool.label}</span>
              </div>
              <p className={`text-lg font-bold ${tool.color}`}>{tool.value}</p>
              {tool.detail && <p className="text-[10px] text-gray-500 mt-0.5">{tool.detail}</p>}
              {tool.bar !== undefined && (
                <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, tool.bar)}%`, backgroundColor: tool.barColor || '#00bf63' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: vertical cards in sidebar */}
      <div className="hidden lg:block space-y-3">
        {tools.map(tool => (
          <div key={tool.id} className="card-glass p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{tool.icon}</span>
                <span className="text-[11px] text-gray-400 font-medium">{tool.label}</span>
              </div>
              <span className={`text-sm font-bold ${tool.color}`}>{tool.value}</span>
            </div>
            {tool.detail && <p className="text-[10px] text-gray-500 mt-1 ml-7">{tool.detail}</p>}
            {tool.bar !== undefined && (
              <div className="mt-2 ml-7 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, tool.bar)}%`, backgroundColor: tool.barColor || '#00bf63' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function computeTools(repo, commits, contributors, issues, pulls, releases, languages) {
  if (!repo) return [];

  // 1. Star History (total)
  const stars = repo.stargazers_count || 0;

  // 2. Commit Frequency
  const daysSinceCommit = commits?.[0]
    ? Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000)
    : null;
  const commitFreqLabel = daysSinceCommit === null ? 'N/A' : daysSinceCommit === 0 ? 'Today' : daysSinceCommit === 1 ? 'Yesterday' : `${daysSinceCommit}d ago`;

  // 3. PR Merge Speed (estimate from closed PRs)
  const mergedPulls = pulls?.filter(p => p.merged_at) || [];
  const avgMergeHours = mergedPulls.length > 0
    ? Math.round(mergedPulls.slice(0, 10).reduce((sum, p) => sum + (new Date(p.merged_at) - new Date(p.created_at)) / 3600000, 0) / Math.min(mergedPulls.length, 10))
    : null;

  // 4. Issue Response (estimate)
  const openIssues = repo.open_issues_count || 0;
  const totalIssues = issues?.length || 0;
  const closedRatio = totalIssues > 0 ? ((totalIssues - openIssues) / totalIssues * 100) : 0;

  // 5. Bus Factor
  const contribCount = contributors?.length || 0;
  const topContrib = contributors?.[0]?.contributions || 0;
  const totalContribs = contributors?.reduce((s, c) => s + c.contributions, 0) || 1;
  const topPercent = Math.round((topContrib / totalContribs) * 100);
  const busFactor = contribCount >= 10 ? 'Low Risk' : contribCount >= 5 ? 'Medium' : contribCount >= 2 ? 'High Risk' : 'Critical';
  const busColor = contribCount >= 10 ? 'text-green-400' : contribCount >= 5 ? 'text-yellow-400' : 'text-red-400';

  // 6. Release Cadence
  const releaseCount = releases?.length || 0;
  const lastRelease = releases?.[0];
  const daysSinceRelease = lastRelease ? Math.floor((Date.now() - new Date(lastRelease.published_at)) / 86400000) : null;

  // 7. README Quality
  const hasReadme = true; // We're on code tab so readme exists
  const readmeQuality = repo.description ? 'Good' : 'Basic';

  // 8. Tech Stack
  const langKeys = languages ? Object.keys(languages) : [];
  const techStack = langKeys.slice(0, 4).join(', ') || 'Unknown';

  // 9. License
  const license = repo.license?.spdx_id || 'None';
  const licenseColor = license !== 'None' ? 'text-green-400' : 'text-red-400';

  // 10. Fork Activity
  const forks = repo.forks_count || 0;

  // 11. File Size
  const sizeKB = repo.size || 0;
  const sizeLabel = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

  // 12. Dependency Count (estimate from language)
  const hasPkgJson = langKeys.includes('JavaScript') || langKeys.includes('TypeScript');
  const depEstimate = hasPkgJson ? 'Check package.json' : langKeys.includes('Python') ? 'Check requirements.txt' : langKeys.includes('Rust') ? 'Check Cargo.toml' : 'N/A';

  return [
    { id: 'health', icon: '💚', label: 'Health Score', value: calcHealthScore(daysSinceCommit, contribCount, openIssues, releaseCount, stars) + '/100', color: 'text-green-400', bar: calcHealthScore(daysSinceCommit, contribCount, openIssues, releaseCount, stars), barColor: '#00bf63' },
    { id: 'stars', icon: '⭐', label: 'Stars', value: formatNum(stars), color: 'text-yellow-400', detail: `${formatNum(repo.watchers_count)} watchers` },
    { id: 'commits', icon: '📝', label: 'Last Commit', value: commitFreqLabel, color: daysSinceCommit !== null && daysSinceCommit < 7 ? 'text-green-400' : 'text-yellow-400', detail: commits?.[0]?.commit.message?.slice(0, 50) },
    { id: 'pr-speed', icon: '⚡', label: 'PR Merge Speed', value: avgMergeHours !== null ? `${avgMergeHours}h avg` : 'N/A', color: 'text-accent-cyan', detail: avgMergeHours !== null ? 'Avg time to merge PRs' : 'No merged PRs found' },
    { id: 'issues', icon: '🐛', label: 'Issue Health', value: `${openIssues} open`, color: openIssues < 10 ? 'text-green-400' : 'text-yellow-400', bar: Math.max(0, 100 - openIssues), detail: `Resolution rate: ${closedRatio.toFixed(0)}%` },
    { id: 'bus', icon: '🚌', label: 'Bus Factor', value: busFactor, color: busColor, detail: `${contribCount} contributors, top: ${topPercent}%`, bar: Math.min(100, contribCount * 10) },
    { id: 'releases', icon: '🏷️', label: 'Releases', value: releaseCount > 0 ? `${releaseCount} releases` : 'None', color: releaseCount > 0 ? 'text-green-400' : 'text-gray-400', detail: daysSinceRelease !== null ? `Last: ${daysSinceRelease}d ago` : 'No releases yet' },
    { id: 'forks', icon: '🔀', label: 'Fork Activity', value: formatNum(forks), color: 'text-accent-blue', detail: forks > 100 ? 'High fork activity' : 'Normal fork rate' },
    { id: 'license', icon: '📜', label: 'License', value: license, color: licenseColor, detail: license !== 'None' ? 'Open source' : 'No license detected' },
    { id: 'size', icon: '📦', label: 'Repo Size', value: sizeLabel, color: 'text-accent-purple', detail: `${langKeys.length} languages detected` },
    { id: 'stack', icon: '🛠️', label: 'Tech Stack', value: techStack.length > 20 ? techStack.slice(0, 18) + '...' : techStack, color: 'text-white', detail: `${langKeys.length} languages total` },
    { id: 'deps', icon: '📋', label: 'Dependencies', value: depEstimate.length > 18 ? depEstimate.slice(0, 16) + '...' : depEstimate, color: 'text-gray-300', detail: 'Based on detected language' },
  ];
}

function calcHealthScore(daysSinceCommit, contribs, openIssues, releases, stars) {
  let score = 0;
  score += Math.max(0, 25 - (daysSinceCommit || 30)); // commit recency (max 25)
  score += Math.min(25, contribs * 3); // contributors (max 25)
  score += Math.max(0, 25 - openIssues * 0.5); // issue health (max 25)
  score += releases > 0 ? 15 : 0; // has releases (15)
  score += Math.min(10, Math.log10(Math.max(stars, 1)) * 3); // stars (max 10)
  return Math.min(100, Math.max(0, Math.round(score)));
}
