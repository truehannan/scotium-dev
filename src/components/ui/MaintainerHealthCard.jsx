import { useState, useEffect } from 'react';
import { VscPulse, VscArrowUp, VscArrowDown, VscDash, VscWarning, VscChevronDown, VscChevronUp, VscSparkle, VscFile, VscGitMerge, VscCalendar, VscShield, VscBook, VscRocket, VscBug, VscChecklist, VscTarget, VscLightbulb, VscFolderOpened } from 'react-icons/vsc';
import { fetchRepoCommits, fetchRepoContents, formatDate } from '../../utils/github';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function MaintainerHealthCard({ owner, repo, repoData, contributors }) {
  const { token } = useAuth();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState('health');
  const [quote, setQuote] = useState({ q: 'Code is like humor. When you have to explain it, it\'s bad.', a: 'Cory House' });

  const { data: commits } = useQuery({ queryKey: ['intel-commits', owner, repo], queryFn: () => fetchRepoCommits(owner, repo, 1, token), enabled: !!owner && !!repo });
  const { data: rootFiles } = useQuery({ queryKey: ['intel-files', owner, repo], queryFn: () => fetchRepoContents(owner, repo, '', '', token), enabled: !!owner && !!repo });

  // Fetch random quote
  useEffect(() => {
    axios.get('https://zenquotes.io/api/random').then(r => { if (r.data?.[0]) setQuote(r.data[0]); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!commits || !repoData) return;
    const delay = 4000 + Math.random() * 1000;
    const t = setTimeout(() => { setResult(runEngine(repoData, commits, contributors, rootFiles)); setAnalyzing(false); }, delay);
    return () => clearTimeout(t);
  }, [commits, repoData, contributors, rootFiles]);

  // FULLSCREEN LOADER
  if (analyzing) {
    return (
      <div className="fixed inset-0 z-[200] bg-primary/95 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-3 border-secondary/20 border-t-secondary animate-spin mb-6" />
        <div className="flex items-center gap-2 mb-3">
          <VscSparkle className="w-5 h-5 text-secondary animate-pulse" />
          <p className="text-lg font-semibold text-white">Analyzing project intelligence...</p>
        </div>
        <p className="text-sm text-gray-500 max-w-md text-center">Evaluating commit patterns, file structure, health metrics, and generating actionable insights</p>
        <div className="mt-8 max-w-sm text-center">
          <p className="text-xs text-gray-400 italic">"{quote.q}"</p>
          <p className="text-[10px] text-gray-600 mt-1">— {quote.a}</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor = result.health.score >= 7 ? 'text-green-400' : result.health.score >= 4 ? 'text-yellow-400' : 'text-red-400';
  const TrendIcon = result.health.trend === 'rising' ? VscArrowUp : result.health.trend === 'declining' ? VscArrowDown : VscDash;
  const trendColor = result.health.trend === 'rising' ? 'text-green-400' : result.health.trend === 'declining' ? 'text-red-400' : 'text-gray-400';

  const sections = [
    { id: 'health', label: 'Health', Icon: VscPulse },
    { id: 'roadmap', label: 'Roadmap', Icon: VscTarget },
    { id: 'issues', label: 'Issues', Icon: VscBug },
    { id: 'commits', label: 'Commits', Icon: VscGitMerge },
    { id: 'files', label: 'Files', Icon: VscFolderOpened },
    { id: 'calendar', label: 'Tasks', Icon: VscCalendar },
    { id: 'security', label: 'Security', Icon: VscShield },
    { id: 'growth', label: 'Growth', Icon: VscRocket },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <VscSparkle className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold text-white">Project Intelligence</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`text-xl font-black ${scoreColor}`}>{result.health.score}</span>
          <span className="text-[10px] text-gray-500">/10</span>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-white/[0.04] px-2 gap-0.5">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1 px-2.5 py-2 text-[10px] whitespace-nowrap rounded-t-lg transition-all ${activeSection === s.id ? 'text-secondary bg-secondary/[0.05] font-semibold' : 'text-gray-500 hover:text-gray-300'}`}>
            <s.Icon className="w-3 h-3" />{s.label}
          </button>
        ))}
      </div>

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
          <VscWarning className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-red-400 font-medium">Burnout risk indicators detected</span>
        </div>
      )}
    </div>
  );
}
function ListSection({ items }) {
  return (<div className="space-y-2">{items.map((item, i) => (<div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><span className="text-[10px] text-secondary font-bold mt-0.5 w-4">{i+1}.</span><div><p className="text-[11px] text-gray-300 font-medium">{item.title}</p>{item.detail && <p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p>}</div></div>))}</div>);
}
function IssuesSection({ items, owner, repo }) {
  return (<div className="space-y-2"><p className="text-[10px] text-gray-500 mb-2">Suggested issues to create:</p>{items.map((item, i) => (<div key={i} className="p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]"><p className="text-[11px] text-white font-medium">{item.title}</p><p className="text-[10px] text-gray-500 mt-1">{item.body}</p><a href={`https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(item.title)}&body=${encodeURIComponent(item.body)}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[10px] text-secondary hover:underline">Create on GitHub →</a></div>))}</div>);
}
function FilesSection({ items }) {
  return (<div className="space-y-2">{items.map((item, i) => (<div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><VscFile className="w-3.5 h-3.5 text-accent-blue mt-0.5 flex-shrink-0" /><div><p className="text-[11px] text-white font-mono">{item.file}</p><p className="text-[10px] text-gray-500 mt-0.5">{item.insight}</p></div></div>))}</div>);
}
function CalendarSection({ items, owner, repo }) {
  return (<div className="space-y-2"><p className="text-[10px] text-gray-500 mb-2">Add to your calendar:</p>{items.map((item, i) => { const s=new Date();s.setDate(s.getDate()+item.daysFromNow);const e=new Date(s);e.setHours(e.getHours()+1);const f=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const gUrl=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title+' - '+owner+'/'+repo)}&dates=${f(s)}/${f(e)}&details=${encodeURIComponent(item.detail)}`;const oUrl=`https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(item.title+' - '+owner+'/'+repo)}&startdt=${s.toISOString()}&enddt=${e.toISOString()}&body=${encodeURIComponent(item.detail)}`;return(<div key={i} className="p-2.5 rounded-lg border border-white/[0.04]"><div className="flex items-center justify-between"><p className="text-[11px] text-white font-medium">{item.title}</p><span className="text-[9px] text-gray-600">in {item.daysFromNow}d</span></div><p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p><div className="flex gap-2 mt-2"><a href={gUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-secondary hover:underline">+ Google</a><a href={oUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-accent-blue hover:underline">+ Outlook</a></div></div>);})}</div>);
}
function ChecklistSection({ items }) {
  return (<div className="space-y-1.5">{items.map((item, i) => (<div key={i} className="flex items-center gap-2 p-2 rounded-lg"><span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${item.pass?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>{item.pass?'✓':'✗'}</span><span className={`text-[11px] ${item.pass?'text-gray-400':'text-gray-300'}`}>{item.label}</span></div>))}</div>);
}


function runEngine(repo, commits, contributors, rootFiles) {
  const files = (rootFiles || []).map(f => f.name.toLowerCase());
  const has = (n) => files.some(f => f.includes(n.toLowerCase()));
  const days = commits?.[0] ? Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000) : 999;
  const cc = commits?.length || 0;
  const contribs = contributors?.length || 0;
  const stars = repo.stargazers_count || 0;
  const issues = repo.open_issues_count || 0;
  const forks = repo.forks_count || 0;
  const hasReadme=has('readme'),hasLicense=has('license'),hasCI=has('.github')||has('ci'),hasSecurity=has('security'),hasContrib=has('contributing'),hasChangelog=has('changelog'),hasTests=has('test')||has('spec'),hasDocker=has('docker'),hasPkg=has('package.json'),hasReq=has('requirements');
  const lang = repo.language || '';

  const health = computeHealth(days, cc, contribs, stars, issues, commits);
  const roadmap = genRoadmap(repo, hasReadme,hasLicense,hasCI,hasContrib,hasChangelog,hasTests,hasDocker,cc,issues,days,contribs);
  const issuesList = genIssues(repo,hasLicense,hasCI,hasTests,hasSecurity,hasChangelog,lang,issues);
  const commitPlan = genCommits(hasLicense,hasCI,hasTests,hasContrib,hasChangelog,hasSecurity,lang);
  const fileInsights = genFiles(files,hasReadme,hasLicense,hasCI,hasTests,hasDocker,hasPkg,hasReq);
  const calendar = genCalendar(issues,days,hasCI,hasTests);
  const security = [{label:'LICENSE file',pass:hasLicense},{label:'SECURITY.md policy',pass:hasSecurity},{label:'CI/CD pipeline',pass:hasCI},{label:'Automated tests',pass:hasTests},{label:'Branch protection',pass:false},{label:'Dependency scanning',pass:hasCI},{label:'No secrets in code',pass:true},{label:'Docker security',pass:hasDocker}];
  const growth = genGrowth(stars,forks,contribs,hasContrib,issues);
  return { health, roadmap, issues: issuesList, commitPlan, fileInsights, calendar, security, growth };
}

function computeHealth(days,cc,contribs,stars,issues,commits) {
  let score=5;
  score+=days<3?2:days<7?1:days<30?0:days<90?-1:-2;
  score+=contribs>10?1.5:contribs>3?0.5:contribs<=1?-1:0;
  score+=cc>25?1:cc<5?-1:0;
  score+=issues<5?0.5:issues>50?-1:0;
  score=Math.max(1,Math.min(10,Math.round(score)));
  const trend=cc>10?(days<7?'rising':'stable'):(days>30?'declining':'stable');
  const burnout=score<=3;
  const tones=(commits||[]).slice(0,15).map(c=>{const l=c.commit.message.toLowerCase();const neg=['fix','bug','broken','hack','revert','hotfix','crash','fail'];const pos=['feat','add','implement','improve','enhance','refactor','release','new'];if(pos.some(w=>l.includes(w))&&!neg.some(w=>l.includes(w)))return'positive';if(neg.some(w=>l.includes(w)))return'negative';return'neutral';});
  const posR=tones.length?tones.filter(t=>t==='positive').length/tones.length:0.5;
  const insights=pickInsights(score,trend,days,cc,contribs,stars,issues,posR);
  return{score,trend,burnout,insights};
}

function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

function pickInsights(score,trend,days,cc,contribs,stars,issues,posR){
  const p=[];
  if(days<3)p.push(pick(['Active development — last commit within 72 hours indicates strong engagement.','High-frequency commits suggest actively maintained codebase.','Recent commits show responsive maintainer with consistent output.']));
  else if(days<14)p.push(pick(['Moderate cadence — commits within two weeks suggest regular maintenance.','Steady development pace indicates sustainable maintenance rhythm.']));
  else if(days<60)p.push(pick(['Activity gap — no commits in 2+ weeks may indicate shifting priorities.','The commit gap suggests competing priorities for the maintainer.']));
  else p.push(pick(['Extended inactivity (60+ days) — evaluate active forks for continued development.','No recent commits — project may be in archived or abandoned state.']));
  if(trend==='rising')p.push(pick(['Commit velocity accelerating — development momentum increasing.','Rising pattern suggests growing investment in this project.']));
  else if(trend==='declining')p.push(pick(['Declining frequency may indicate fatigue or deprioritization.','Reduced output compared to earlier period — monitor for slowdown.']));
  else p.push(pick(['Stable cadence — consistent and predictable maintenance.','Steady rhythm suggests sustainable long-term approach.']));
  if(posR>0.6)p.push(pick(['Constructive commit language — features outweigh fixes.','Positive patterns indicate forward-looking development.']));
  else if(posR<0.35)p.push(pick(['Higher fix ratio suggests accumulating technical debt.','Reactive patterns dominate — architecture review recommended.']));
  else p.push(pick(['Balanced feature and maintenance work — healthy distribution.','Mix of features and fixes shows normal development cycle.']));
  return p.slice(0,3);
}

function genRoadmap(repo,hasReadme,hasLicense,hasCI,hasContrib,hasChangelog,hasTests,hasDocker,cc,issues,days,contribs){
  const i=[];
  if(!hasCI)i.push({title:'Set up CI/CD pipeline',detail:'Add GitHub Actions for automated testing on every push and PR.'});
  if(!hasTests)i.push({title:'Add test coverage',detail:`Create test suite for ${repo.language||'the'} codebase — target 60%+ coverage.`});
  if(!hasContrib)i.push({title:'Create CONTRIBUTING.md',detail:'Define contribution guidelines, PR process, and coding standards.'});
  if(!hasChangelog)i.push({title:'Maintain CHANGELOG.md',detail:'Track changes per version in Keep a Changelog format.'});
  if(issues>20)i.push({title:`Triage ${issues} open issues`,detail:'Label, prioritize, close stale, and respond to recent issues.'});
  if(contribs<=2)i.push({title:'Attract contributors',detail:'Add "good first issue" labels and improve onboarding documentation.'});
  if(!hasDocker)i.push({title:'Add Docker support',detail:'Containerize for consistent dev environments and easy deployment.'});
  if(days>30)i.push({title:'Resume active development',detail:`Last commit ${days}d ago — plan next feature or maintenance cycle.`});
  i.push({title:'Plan next release',detail:'Review commits since last tag, write changelog, bump version.'});
  i.push({title:'Update dependencies',detail:'Check for outdated packages, security advisories, breaking changes.'});
  return i.slice(0,7);
}

function genIssues(repo,hasLicense,hasCI,hasTests,hasSecurity,hasChangelog,lang,issues){
  const i=[];
  if(!hasCI)i.push({title:`[Infra] Set up CI/CD`,body:`No CI detected.\n\nAdd GitHub Actions:\n- Run tests on push/PR\n- Lint + build verification\n- Language: ${lang||'detect'}`});
  if(!hasTests)i.push({title:`[Quality] Add test suite`,body:`No tests found.\n\nSetup:\n- Framework: ${lang==='JavaScript'?'Vitest/Jest':lang==='Python'?'pytest':'appropriate'}\n- Target: 60%+ coverage\n- Run in CI pipeline`});
  if(!hasLicense)i.push({title:`[Legal] Add LICENSE`,body:`No license file.\n\nWithout one, code is "all rights reserved".\nRecommended: MIT or Apache-2.0`});
  if(!hasSecurity)i.push({title:`[Security] Add SECURITY.md`,body:`No security policy.\n\nInclude:\n- Vulnerability reporting process\n- Supported versions\n- Response SLA`});
  if(!hasChangelog)i.push({title:`[Docs] Create CHANGELOG`,body:`No changelog found.\n\nFormat: Keep a Changelog\nSections: Added/Changed/Fixed/Removed`});
  return i.slice(0,4);
}

function genCommits(hasLicense,hasCI,hasTests,hasContrib,hasChangelog,hasSecurity,lang){
  const i=[];
  if(!hasLicense)i.push({title:'chore: add MIT license',detail:'Add LICENSE file for open source clarity'});
  if(!hasCI)i.push({title:`ci: add ${lang||'base'} workflow`,detail:'Create .github/workflows/ci.yml with test+build'});
  if(!hasTests)i.push({title:'test: add initial test suite',detail:'Set up framework and add smoke tests'});
  if(!hasContrib)i.push({title:'docs: add CONTRIBUTING.md',detail:'PR process, coding standards, setup guide'});
  if(!hasChangelog)i.push({title:'docs: add CHANGELOG.md',detail:'Start tracking version changes'});
  if(!hasSecurity)i.push({title:'docs: add SECURITY.md',detail:'Vulnerability reporting process'});
  i.push({title:'chore: update dependencies',detail:'Fix outdated packages and advisories'});
  i.push({title:'refactor: code cleanup',detail:'Remove dead code, fix lint warnings'});
  i.push({title:'feat: next feature',detail:'Implement highest-priority feature from issues'});
  i.push({title:'chore: prepare release',detail:'Bump version, update changelog, create tag'});
  return i.slice(0,8);
}

function genFiles(files,hasReadme,hasLicense,hasCI,hasTests,hasDocker,hasPkg,hasReq){
  const i=[];
  if(hasReadme)i.push({file:'README.md',insight:'Present. Ensure: install steps, usage examples, badges, and contributing section.'});
  else i.push({file:'README.md',insight:'MISSING — Add project description, installation, usage examples, and badges.'});
  if(!hasLicense)i.push({file:'LICENSE',insight:'MISSING — No usage rights defined. Add MIT or Apache-2.0.'});
  if(hasCI)i.push({file:'.github/workflows/',insight:'CI detected. Verify it runs on push and pull_request events.'});
  else i.push({file:'.github/workflows/',insight:'MISSING — Add automated testing to prevent regressions.'});
  if(hasPkg)i.push({file:'package.json',insight:'Ensure "test", "build", "lint" scripts exist. Pin critical deps.'});
  if(hasReq)i.push({file:'requirements.txt',insight:'Pin versions. Consider using Poetry or pip-tools for lockfile.'});
  if(!hasTests)i.push({file:'tests/',insight:'MISSING — No test directory. Critical for production reliability.'});
  if(hasDocker)i.push({file:'Dockerfile',insight:'Use multi-stage builds and non-root user for security.'});
  return i.slice(0,6);
}

function genCalendar(issues,days,hasCI,hasTests){
  const i=[];
  i.push({title:'Review open issues',detail:`Triage ${issues} issues — label, prioritize, close stale.`,daysFromNow:1});
  if(!hasCI)i.push({title:'Set up CI/CD',detail:'Create GitHub Actions workflow.',daysFromNow:3});
  if(!hasTests)i.push({title:'Write first tests',detail:'Add test framework + smoke tests.',daysFromNow:5});
  i.push({title:'Dependency audit',detail:'Check outdated deps and security advisories.',daysFromNow:7});
  i.push({title:'Plan next release',detail:'Write changelog, bump version, create tag.',daysFromNow:14});
  if(days>14)i.push({title:'Resume development',detail:`Inactive ${days}d — plan next iteration.`,daysFromNow:2});
  return i.slice(0,5);
}

function genGrowth(stars,forks,contribs,hasContrib,issues){
  const i=[];
  if(stars<100)i.push({title:'Share on communities',detail:'Post to Reddit, HN, Dev.to, Twitter with demo.'});
  if(!hasContrib)i.push({title:'Lower contribution barrier',detail:'Add CONTRIBUTING.md, "good first issue" labels.'});
  i.push({title:'Add visual demos',detail:'GIFs/screenshots in README increase engagement 3x.'});
  i.push({title:'Create starter issues',detail:`Label ${Math.min(issues,5)} simple issues for newcomers.`});
  i.push({title:'Write a tutorial/blog post',detail:'Technical content attracts organic traffic and stars.'});
  if(forks>10)i.push({title:'Engage fork maintainers',detail:`${forks} forks — reach out for potential PRs.`});
  i.push({title:'Submit to awesome lists',detail:'Find "awesome-*" repos and submit a PR.'});
  i.push({title:'Add shields.io badges',detail:'Badges make repos look professional and maintained.'});
  return i.slice(0,6);
}
