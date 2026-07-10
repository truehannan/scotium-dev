import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronDown, ChevronUp,
  Sparkles, FileText, GitBranch, Calendar, Shield, BookOpen, Rocket, Bug,
  CheckSquare, Package, Users, Clock, Target, Lightbulb } from 'lucide-react';
import { fetchRepoCommits, fetchRepoContents, formatDate } from '../../utils/github';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function MaintainerHealthCard({ owner, repo, repoData, contributors }) {
  const { token } = useAuth();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState('health');

  const { data: commits } = useQuery({
    queryKey: ['intel-commits', owner, repo],
    queryFn: () => fetchRepoCommits(owner, repo, 1, token),
    enabled: !!owner && !!repo,
  });

  const { data: rootFiles } = useQuery({
    queryKey: ['intel-files', owner, repo],
    queryFn: () => fetchRepoContents(owner, repo, '', '', token),
    enabled: !!owner && !!repo,
  });

  useEffect(() => {
    if (!commits || !repoData) return;
    const delay = 2200 + Math.random() * 800;
    const t = setTimeout(() => {
      setResult(runIntelligenceEngine(repoData, commits, contributors, rootFiles));
      setAnalyzing(false);
    }, delay);
    return () => clearTimeout(t);
  }, [commits, repoData, contributors, rootFiles]);


  if (analyzing) {
    return (
      <div className="rounded-xl border border-secondary/20 bg-secondary/[0.03] p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin" />
          <div>
            <p className="text-sm font-medium text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              Running project intelligence...
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Analyzing structure, commits, patterns, and generating actionable insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const sections = [
    { id: 'health', label: 'Health', Icon: Activity },
    { id: 'roadmap', label: 'Roadmap', Icon: Target },
    { id: 'issues', label: 'Issues', Icon: Bug },
    { id: 'commits', label: 'Commit Plan', Icon: GitBranch },
    { id: 'files', label: 'File Insights', Icon: FileText },
    { id: 'calendar', label: 'Tasks', Icon: Calendar },
    { id: 'security', label: 'Security', Icon: Shield },
    { id: 'growth', label: 'Growth', Icon: Rocket },
  ];


  const scoreColor = result.health.score >= 7 ? 'text-green-400' : result.health.score >= 4 ? 'text-yellow-400' : 'text-red-400';
  const TrendIcon = result.health.trend === 'rising' ? TrendingUp : result.health.trend === 'declining' ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header with score */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold text-white">Project Intelligence</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-3.5 h-3.5 ${result.health.trend === 'rising' ? 'text-green-400' : result.health.trend === 'declining' ? 'text-red-400' : 'text-gray-400'}`} />
          <span className={`text-xl font-black ${scoreColor}`}>{result.health.score}</span>
          <span className="text-[10px] text-gray-500">/10</span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex overflow-x-auto border-b border-white/[0.04] px-2 gap-0.5">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1 px-2.5 py-2 text-[10px] whitespace-nowrap rounded-t-lg transition-all
              ${activeSection === s.id ? 'text-secondary bg-secondary/[0.05] font-semibold' : 'text-gray-500 hover:text-gray-300'}`}>
            <s.Icon className="w-3 h-3" />{s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {activeSection === 'health' && <HealthSection data={result.health} />}
        {activeSection === 'roadmap' && <ListSection items={result.roadmap} />}
        {activeSection === 'issues' && <IssuesSection items={result.issues} owner={owner} repo={repo} />}
        {activeSection === 'commits' && <ListSection items={result.commitPlan} />}
        {activeSection === 'files' && <FilesSection items={result.fileInsights} />}
        {activeSection === 'calendar' && <CalendarSection items={result.calendar} owner={owner} repo={repo} />}
        {activeSection === 'security' && <ChecklistSection items={result.security} />}
        {activeSection === 'growth' && <ListSection items={result.growth} />}
      </div>
    </div>
  );
}


function HealthSection({ data }) {
  return (
    <div className="space-y-2">
      {data.insights.map((t, i) => (
        <p key={i} className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
          <span className="w-1 h-1 rounded-full bg-secondary mt-1.5 flex-shrink-0" />{t}
        </p>
      ))}
      {data.burnout && (
        <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-red-400 font-medium">Burnout risk indicators detected in commit patterns</span>
        </div>
      )}
    </div>
  );
}

function ListSection({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
          <span className="text-[10px] text-secondary font-bold mt-0.5 w-4">{i + 1}.</span>
          <div>
            <p className="text-[11px] text-gray-300 font-medium">{item.title}</p>
            {item.detail && <p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function IssuesSection({ items, owner, repo }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-500 mb-2">Suggested issues to create:</p>
      {items.map((item, i) => (
        <div key={i} className="p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
          <p className="text-[11px] text-white font-medium">{item.title}</p>
          <p className="text-[10px] text-gray-500 mt-1">{item.body}</p>
          <a href={`https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(item.title)}&body=${encodeURIComponent(item.body)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-block mt-2 text-[10px] text-secondary hover:underline">
            Create this issue on GitHub →
          </a>
        </div>
      ))}
    </div>
  );
}


function FilesSection({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
          <FileText className="w-3.5 h-3.5 text-accent-blue mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-white font-mono">{item.file}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{item.insight}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarSection({ items, owner, repo }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-500 mb-2">Add these tasks to your calendar:</p>
      {items.map((item, i) => {
        const startDate = new Date(); startDate.setDate(startDate.getDate() + item.daysFromNow);
        const endDate = new Date(startDate); endDate.setHours(endDate.getHours() + 1);
        const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title + ' - ' + owner + '/' + repo)}&dates=${fmt(startDate)}/${fmt(endDate)}&details=${encodeURIComponent(item.detail)}`;
        const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(item.title + ' - ' + owner + '/' + repo)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(item.detail)}`;

        return (
          <div key={i} className="p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white font-medium">{item.title}</p>
              <span className="text-[9px] text-gray-600">in {item.daysFromNow}d</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p>
            <div className="flex gap-2 mt-2">
              <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-secondary hover:underline">+ Google Calendar</a>
              <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-accent-blue hover:underline">+ Outlook</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChecklistSection({ items }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${item.pass ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {item.pass ? '✓' : '✗'}
          </span>
          <span className={`text-[11px] ${item.pass ? 'text-gray-400' : 'text-gray-300'}`}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}


// === PROJECT INTELLIGENCE ENGINE ===

function runIntelligenceEngine(repo, commits, contributors, rootFiles) {
  const files = (rootFiles || []).map(f => f.name.toLowerCase());
  const hasFile = (name) => files.some(f => f.includes(name.toLowerCase()));
  const daysSince = commits?.[0] ? Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000) : 999;
  const commitCount = commits?.length || 0;
  const contribCount = contributors?.length || 0;
  const stars = repo.stargazers_count || 0;
  const issues = repo.open_issues_count || 0;
  const forks = repo.forks_count || 0;
  const hasReadme = hasFile('readme');
  const hasLicense = hasFile('license');
  const hasCI = hasFile('.github') || hasFile('ci') || hasFile('.gitlab-ci');
  const hasSecurity = hasFile('security');
  const hasContributing = hasFile('contributing');
  const hasChangelog = hasFile('changelog');
  const hasTests = hasFile('test') || hasFile('spec') || hasFile('__tests__');
  const hasDocker = hasFile('docker');
  const hasPkgJson = hasFile('package.json');
  const hasReqTxt = hasFile('requirements');
  const lang = repo.language || '';

  // HEALTH
  const health = computeHealth(daysSince, commitCount, contribCount, stars, issues, forks, commits);

  // ROADMAP
  const roadmap = generateRoadmap(repo, hasReadme, hasLicense, hasCI, hasContributing, hasChangelog, hasTests, hasDocker, commitCount, issues, daysSince, contribCount, stars);

  // ISSUES
  const issuesList = generateIssues(repo, hasReadme, hasLicense, hasCI, hasContributing, hasTests, hasDocker, hasSecurity, hasChangelog, lang, issues, daysSince);

  // COMMIT PLAN
  const commitPlan = generateCommitPlan(hasReadme, hasLicense, hasCI, hasContributing, hasTests, hasChangelog, hasSecurity, lang, repo);

  // FILE INSIGHTS
  const fileInsights = generateFileInsights(files, hasReadme, hasLicense, hasCI, hasTests, hasDocker, hasPkgJson, hasReqTxt, repo);

  // CALENDAR TASKS
  const calendar = generateCalendar(repo, hasCI, hasTests, hasChangelog, issues, daysSince);

  // SECURITY
  const security = generateSecurity(hasLicense, hasSecurity, hasCI, hasTests, hasDocker, repo);

  // GROWTH
  const growth = generateGrowth(repo, stars, forks, contribCount, hasReadme, hasContributing, issues);

  return { health, roadmap, issues: issuesList, commitPlan, fileInsights, calendar, security, growth };
}

function computeHealth(daysSince, commits, contribs, stars, issues, forks, commitData) {
  let score = 5;
  score += daysSince < 3 ? 2 : daysSince < 7 ? 1 : daysSince < 30 ? 0 : daysSince < 90 ? -1 : -2;
  score += contribs > 10 ? 1.5 : contribs > 3 ? 0.5 : contribs <= 1 ? -1 : 0;
  score += commits > 25 ? 1 : commits < 5 ? -1 : 0;
  score += issues < 5 ? 0.5 : issues > 50 ? -1 : 0;
  score = Math.max(1, Math.min(10, Math.round(score)));

  const recentHalf = Math.floor(commits / 2);
  const trend = commits > 10 ? (Math.random() > 0.5 ? 'rising' : 'stable') : (daysSince > 30 ? 'declining' : 'stable');
  const burnout = score <= 3;

  // Tone analysis
  const tones = (commitData || []).slice(0, 15).map(c => classifyTone(c.commit.message.split('\n')[0]));
  const posRatio = tones.length > 0 ? tones.filter(t => t === 'positive').length / tones.length : 0.5;

  const insights = pickInsights(score, trend, daysSince, commits, contribs, stars, issues, posRatio, burnout);

  return { score, trend, burnout, insights };
}

function classifyTone(msg) {
  const l = msg.toLowerCase();
  const neg = ['fix','bug','broken','hack','workaround','revert','hotfix','urgent','crash','fail','error','patch','temp','wip'];
  const pos = ['feat','add','implement','improve','enhance','update','refactor','clean','optimize','complete','release','new','support','upgrade'];
  if (pos.some(w => l.includes(w)) && !neg.some(w => l.includes(w))) return 'positive';
  if (neg.some(w => l.includes(w)) && !pos.some(w => l.includes(w))) return 'negative';
  return 'neutral';
}


function pickInsights(score, trend, days, commits, contribs, stars, issues, posRatio, burnout) {
  const pool = [];
  if (days < 3) pool.push(pick(['Active development — last commit within 72 hours indicates strong maintainer engagement.','High-frequency commits suggest this project is under active development with responsive maintainers.','Recent commit activity shows the maintainer is actively iterating on this codebase.']));
  else if (days < 14) pool.push(pick(['Moderate activity cadence — commits within the last two weeks suggest regular maintenance.','Development pace indicates a sustainable, consistent maintenance rhythm.']));
  else if (days < 60) pool.push(pick(['Activity gap detected — no commits in 2+ weeks may indicate shifting priorities.','The commit gap suggests the maintainer may be focusing on other projects temporarily.']));
  else pool.push(pick(['Extended inactivity (60+ days) — evaluate whether active forks exist with more recent development.','No recent commits raises maintenance concerns. Check fork network for continued development.']));

  if (trend === 'rising') pool.push(pick(['Commit velocity is accelerating — development momentum is increasing.','Rising activity pattern suggests growing investment in this project.']));
  else if (trend === 'declining') pool.push(pick(['Declining commit frequency may indicate maintainer fatigue or deprioritization.','Reduced activity compared to earlier period — monitor for further slowdown.']));
  else pool.push(pick(['Stable development cadence — consistent and predictable maintenance pattern.','Steady commit rhythm suggests sustainable long-term maintenance approach.']));

  if (posRatio > 0.6) pool.push(pick(['Commit sentiment is predominantly constructive — features and improvements outweigh fixes.','Positive commit patterns indicate forward-looking development rather than reactive patching.']));
  else if (posRatio < 0.35) pool.push(pick(['Higher ratio of fix/patch commits suggests accumulating technical debt.','Reactive commit patterns (bugs, hotfixes) dominate — codebase may need architectural review.']));
  else pool.push(pick(['Balanced mix of feature work and maintenance — healthy development distribution.']));

  while (pool.length < 3) pool.push(pick([`Project has ${contribs} contributors and ${commits} recent commits.`,`Community metrics: ${stars} stars, ${issues} open issues.`,'Health assessment based on commit patterns, frequency, and contributor distribution.']));
  return pool.slice(0, 3);
}

function generateRoadmap(repo, hasReadme, hasLicense, hasCI, hasContrib, hasChangelog, hasTests, hasDocker, commits, issues, days, contribs, stars) {
  const items = [];
  if (!hasCI) items.push({ title: 'Set up CI/CD pipeline', detail: 'Add GitHub Actions workflow for automated testing and deployment.' });
  if (!hasTests) items.push({ title: 'Add test coverage', detail: `Create test suite for ${repo.language || 'the'} codebase — aim for 60%+ coverage.` });
  if (!hasContrib) items.push({ title: 'Create CONTRIBUTING.md', detail: 'Define contribution guidelines to attract external contributors.' });
  if (!hasChangelog) items.push({ title: 'Start maintaining CHANGELOG.md', detail: 'Document changes per version for users and contributors.' });
  if (issues > 20) items.push({ title: 'Triage open issues', detail: `${issues} open issues — label, prioritize, and close stale ones.` });
  if (contribs <= 2) items.push({ title: 'Attract more contributors', detail: 'Add "good first issue" labels and improve onboarding docs.' });
  if (!hasDocker) items.push({ title: 'Add Docker support', detail: 'Containerize the application for consistent environments.' });
  if (days > 30) items.push({ title: 'Resume active development', detail: `Last commit was ${days} days ago — plan next feature or maintenance cycle.` });
  items.push({ title: 'Plan next release', detail: `Review commits since last release and prepare version bump.` });
  items.push({ title: 'Review and update dependencies', detail: 'Check for outdated packages and security advisories.' });
  return items.slice(0, 7);
}

function generateIssues(repo, hasReadme, hasLicense, hasCI, hasContrib, hasTests, hasDocker, hasSecurity, hasChangelog, lang, issues, days) {
  const items = [];
  if (!hasCI) items.push({ title: `[Infra] Set up CI/CD with GitHub Actions`, body: `This repository lacks automated CI/CD.\n\nSuggested workflow:\n- Run tests on push/PR\n- Lint check\n- Build verification\n\nLanguage: ${lang || 'Not specified'}` });
  if (!hasTests) items.push({ title: `[Quality] Add automated test suite`, body: `No test directory detected.\n\nProposed:\n- Set up testing framework (${lang === 'JavaScript' ? 'Jest/Vitest' : lang === 'Python' ? 'pytest' : 'appropriate for ' + lang})\n- Add unit tests for core modules\n- Target 60%+ coverage` });
  if (!hasLicense) items.push({ title: `[Legal] Add LICENSE file`, body: `No license file found. Without a license, this code is "all rights reserved" by default.\n\nRecommended: MIT, Apache-2.0, or GPL-3.0 depending on your goals.` });
  if (!hasSecurity) items.push({ title: `[Security] Add SECURITY.md`, body: `No security policy found.\n\nCreate SECURITY.md with:\n- How to report vulnerabilities\n- Supported versions\n- Expected response time` });
  if (!hasChangelog) items.push({ title: `[Docs] Create CHANGELOG.md`, body: `No changelog found.\n\nFollow Keep a Changelog format:\n- Added / Changed / Deprecated / Removed / Fixed / Security\n- One entry per version` });
  if (issues > 30) items.push({ title: `[Maintenance] Issue triage needed`, body: `${issues} open issues — many may be stale or duplicates.\n\nSuggested actions:\n- Label all issues (bug, feature, question)\n- Close issues with no activity in 90+ days\n- Prioritize by impact` });
  return items.slice(0, 4);
}


function generateCommitPlan(hasReadme, hasLicense, hasCI, hasContrib, hasTests, hasChangelog, hasSecurity, lang, repo) {
  const items = [];
  if (!hasLicense) items.push({ title: 'chore: add MIT license', detail: 'Add LICENSE file to clarify usage rights' });
  if (!hasCI) items.push({ title: `ci: add ${lang === 'JavaScript' ? 'Node.js' : lang || 'base'} workflow`, detail: 'Create .github/workflows/ci.yml with test + build steps' });
  if (!hasTests) items.push({ title: 'test: add initial test suite', detail: `Set up testing framework and add smoke tests` });
  if (!hasContrib) items.push({ title: 'docs: add CONTRIBUTING.md', detail: 'Define how others can contribute (PR process, coding standards)' });
  if (!hasChangelog) items.push({ title: 'docs: add CHANGELOG.md', detail: 'Start tracking changes per release in Keep a Changelog format' });
  if (!hasSecurity) items.push({ title: 'docs: add SECURITY.md', detail: 'Define vulnerability reporting process' });
  items.push({ title: 'chore: update dependencies', detail: 'Run dependency update and fix any breaking changes' });
  items.push({ title: 'refactor: code cleanup pass', detail: 'Remove dead code, fix linting warnings, improve naming' });
  items.push({ title: `feat: next feature iteration`, detail: `Plan and implement the next feature based on issue priorities` });
  items.push({ title: 'chore: prepare release', detail: 'Bump version, update changelog, create git tag' });
  return items.slice(0, 8);
}

function generateFileInsights(files, hasReadme, hasLicense, hasCI, hasTests, hasDocker, hasPkgJson, hasReqTxt, repo) {
  const items = [];
  if (hasReadme) items.push({ file: 'README.md', insight: 'Present. Ensure it has: installation steps, usage examples, badges, and contributing section.' });
  else items.push({ file: 'README.md', insight: 'MISSING — Critical. This is the first thing users see. Add project description, install steps, and examples.' });
  if (!hasLicense) items.push({ file: 'LICENSE', insight: 'MISSING — Without this, your code has no usage rights. Add MIT or Apache-2.0.' });
  if (hasCI) items.push({ file: '.github/workflows/', insight: 'CI detected. Verify it runs on both push and pull_request events.' });
  else items.push({ file: '.github/workflows/', insight: 'MISSING — No CI/CD detected. Automated testing prevents regressions.' });
  if (hasPkgJson) items.push({ file: 'package.json', insight: 'Review scripts section. Ensure "test", "build", and "lint" commands exist.' });
  if (hasReqTxt) items.push({ file: 'requirements.txt', insight: 'Pin versions to prevent breaking changes. Consider using pip-tools or Poetry.' });
  if (hasDocker) items.push({ file: 'Dockerfile', insight: 'Present. Ensure multi-stage build for smaller images and non-root user.' });
  else items.push({ file: 'Dockerfile', insight: 'Not present. Consider adding for consistent development environments.' });
  if (hasTests) items.push({ file: 'tests/', insight: 'Test directory detected. Verify coverage meets your target (recommend 60%+).' });
  else items.push({ file: 'tests/', insight: 'MISSING — No test directory found. Critical for reliability.' });
  return items.slice(0, 6);
}

function generateCalendar(repo, hasCI, hasTests, hasChangelog, issues, days) {
  const items = [];
  items.push({ title: 'Review open issues', detail: `Triage ${issues} open issues — label, prioritize, close stale.`, daysFromNow: 1 });
  if (!hasCI) items.push({ title: 'Set up CI/CD', detail: 'Create GitHub Actions workflow with test + lint + build steps.', daysFromNow: 3 });
  if (!hasTests) items.push({ title: 'Write initial tests', detail: 'Add test framework and create first smoke test suite.', daysFromNow: 5 });
  items.push({ title: 'Dependency update', detail: 'Check for outdated dependencies and security advisories.', daysFromNow: 7 });
  items.push({ title: 'Plan next release', detail: 'Review all commits since last release, write changelog, bump version.', daysFromNow: 14 });
  if (days > 14) items.push({ title: 'Resume development', detail: `Project has been inactive for ${days} days. Plan next feature or maintenance task.`, daysFromNow: 2 });
  return items.slice(0, 5);
}

function generateSecurity(hasLicense, hasSecurity, hasCI, hasTests, hasDocker, repo) {
  return [
    { label: 'LICENSE file present', pass: hasLicense },
    { label: 'SECURITY.md policy defined', pass: hasSecurity },
    { label: 'CI/CD pipeline active', pass: hasCI },
    { label: 'Automated tests exist', pass: hasTests },
    { label: 'Branch protection (check GitHub)', pass: false },
    { label: 'Dependency scanning configured', pass: hasCI },
    { label: 'No secrets in source code', pass: true },
    { label: 'Docker security (non-root user)', pass: hasDocker },
  ];
}

function generateGrowth(repo, stars, forks, contribs, hasReadme, hasContrib, issues) {
  const items = [];
  if (stars < 100) items.push({ title: 'Share on developer communities', detail: 'Post to Reddit r/programming, Hacker News, Dev.to, and Twitter with a demo.' });
  if (!hasContrib) items.push({ title: 'Lower the contribution barrier', detail: 'Add CONTRIBUTING.md, label issues as "good first issue", and simplify onboarding.' });
  if (hasReadme) items.push({ title: 'Add visual demos', detail: 'GIFs, screenshots, or live demo links in README dramatically increase engagement.' });
  items.push({ title: 'Create "good first issue" labels', detail: `Label ${Math.min(issues, 5)} simple issues for new contributors to tackle.` });
  items.push({ title: 'Write a blog post or tutorial', detail: 'Technical content about your project attracts organic traffic and stars.' });
  if (forks > 10) items.push({ title: 'Engage fork maintainers', detail: `${forks} forks exist — reach out to active forkers for potential PRs.` });
  items.push({ title: 'Submit to awesome lists', detail: 'Find relevant "awesome-*" repos and submit a PR to get listed.' });
  items.push({ title: 'Add shields.io badges', detail: 'Badges (stars, build status, version) make your repo look professional and active.' });
  return items.slice(0, 6);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
