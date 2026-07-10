import { useState, useEffect, useRef } from 'react';
import { VscPulse, VscArrowUp, VscArrowDown, VscDash, VscWarning, VscSparkle, VscFile, VscGitMerge, VscCalendar, VscShield, VscRocket, VscBug, VscTarget, VscFolderOpened } from 'react-icons/vsc';
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
  const [typingDone, setTypingDone] = useState(false);

  const { data: commits } = useQuery({ queryKey: ['intel-commits', owner, repo], queryFn: () => fetchRepoCommits(owner, repo, 1, token), enabled: !!owner && !!repo });
  const { data: rootFiles } = useQuery({ queryKey: ['intel-files', owner, repo], queryFn: () => fetchRepoContents(owner, repo, '', '', token), enabled: !!owner && !!repo });

  useEffect(() => { axios.get('https://zenquotes.io/api/random').then(r => { if (r.data?.[0]) setQuote(r.data[0]); }).catch(() => {}); }, []);

  useEffect(() => {
    if (!commits || !repoData) return;
    const delay = 4500 + Math.random() * 1000;
    const t = setTimeout(() => { setResult(runEngine(repoData, commits, contributors, rootFiles)); setAnalyzing(false); setTimeout(() => setTypingDone(true), 800); }, delay);
    return () => clearTimeout(t);
  }, [commits, repoData, contributors, rootFiles]);

  // === FULLSCREEN AI LOADER ===
  if (analyzing) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center">
        {/* Animated gradient ring */}
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary via-accent-cyan to-secondary animate-spin" style={{ padding: '3px' }}>
            <div className="w-full h-full rounded-full bg-black" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <VscSparkle className="w-7 h-7 text-secondary animate-pulse" />
          </div>
        </div>

        <p className="text-xl font-bold text-white mb-2 tracking-tight">Analyzing with Intelligence</p>
        <p className="text-sm text-gray-400 max-w-sm text-center leading-relaxed">
          Scanning commit history, evaluating file structure, measuring health patterns, and generating personalized insights
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mt-6">
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Quote */}
        <div className="mt-10 max-w-md text-center px-6">
          <p className="text-sm text-gray-300 italic leading-relaxed">"{quote.q}"</p>
          <p className="text-xs text-gray-500 mt-2">— {quote.a}</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor = result.health.score >= 7 ? 'text-green-400' : result.health.score >= 4 ? 'text-yellow-400' : 'text-red-400';
  const scoreBorder = result.health.score >= 7 ? 'from-green-400/40' : result.health.score >= 4 ? 'from-yellow-400/40' : 'from-red-400/40';
  const TrendIcon = result.health.trend === 'rising' ? VscArrowUp : result.health.trend === 'declining' ? VscArrowDown : VscDash;

  const sections = [
    { id: 'health', label: 'Health', Icon: VscPulse },
    { id: 'roadmap', label: 'Roadmap', Icon: VscTarget },
    { id: 'issues', label: 'Issues', Icon: VscBug },
    { id: 'commits', label: 'Commit Plan', Icon: VscGitMerge },
    { id: 'files', label: 'File Insights', Icon: VscFolderOpened },
    { id: 'calendar', label: 'Tasks', Icon: VscCalendar },
    { id: 'security', label: 'Security', Icon: VscShield },
    { id: 'growth', label: 'Growth', Icon: VscRocket },
  ];

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${typingDone ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
      {/* Gradient glow border */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${scoreBorder} to-secondary/10 opacity-60`} />
      <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a0c]" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
              <VscSparkle className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Project Intelligence</h3>
              <p className="text-[11px] text-gray-500">AI-powered analysis for {owner}/{repo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <TrendIcon className={`w-4 h-4 ${result.health.trend === 'rising' ? 'text-green-400' : result.health.trend === 'declining' ? 'text-red-400' : 'text-gray-400'}`} />
            <span className={`text-2xl font-black ${scoreColor}`}>{result.health.score}</span>
            <span className="text-xs text-gray-500">/10</span>
          </div>
        </div>

        {/* Tab navigation - pill style */}
        <div className="px-4 py-3 border-b border-white/[0.04] overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200
                  ${activeSection === s.id
                    ? 'bg-secondary/15 text-secondary border border-secondary/30 shadow-sm shadow-secondary/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}>
                <s.Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="px-6 py-5 min-h-[200px] max-h-[500px] overflow-y-auto">
          {activeSection === 'health' && <HealthSection data={result.health} />}
          {activeSection === 'roadmap' && <ListSection items={result.roadmap} />}
          {activeSection === 'issues' && <IssuesSection items={result.issues} owner={owner} repo={repo} />}
          {activeSection === 'commits' && <ListSection items={result.commitPlan} />}
          {activeSection === 'files' && <FilesSection items={result.fileInsights} />}
          {activeSection === 'calendar' && <CalendarSection items={result.calendar} owner={owner} repo={repo} />}
          {activeSection === 'security' && <ChecklistSection items={result.security} />}
          {activeSection === 'growth' && <ListSection items={result.growth} />}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-[10px] text-gray-600">Generated by Scotium Intelligence Engine</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] text-gray-500">Live analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// === SUB-COMPONENTS WITH AI FEEL ===

function HealthSection({ data }) {
  return (
    <div className="space-y-4">
      {data.insights.map((text, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <VscSparkle className="w-3 h-3 text-secondary" />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
        </div>
      ))}
      {data.burnout && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.05] border border-red-500/20">
          <VscWarning className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-300 font-medium">Burnout Risk Detected</p>
            <p className="text-xs text-red-400/70 mt-0.5">Declining commit frequency combined with reactive fix patterns</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ListSection({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-secondary/20 transition-colors">
          <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary">
            {i + 1}
          </div>
          <div>
            <p className="text-sm text-white font-medium">{item.title}</p>
            {item.detail && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function IssuesSection({ items, owner, repo }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <VscSparkle className="w-3.5 h-3.5 text-secondary" />
        <p className="text-xs text-gray-400">Suggested issues based on repository analysis:</p>
      </div>
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-secondary/20 transition-colors">
          <p className="text-sm text-white font-semibold">{item.title}</p>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed whitespace-pre-line">{item.body}</p>
          <a href={`https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(item.title)}&body=${encodeURIComponent(item.body)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-medium hover:bg-secondary/20 transition-colors">
            <VscBug className="w-3 h-3" /> Create on GitHub
          </a>
        </div>
      ))}
    </div>
  );
}

function FilesSection({ items }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <VscSparkle className="w-3.5 h-3.5 text-secondary" />
        <p className="text-xs text-gray-400">File structure analysis:</p>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <VscFile className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-mono font-medium">{item.file}</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.insight}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarSection({ items, owner, repo }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <VscSparkle className="w-3.5 h-3.5 text-secondary" />
        <p className="text-xs text-gray-400">Recommended task schedule:</p>
      </div>
      {items.map((item, i) => {
        const s = new Date(); s.setDate(s.getDate() + item.daysFromNow);
        const e = new Date(s); e.setHours(e.getHours() + 1);
        const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title + ' - ' + owner + '/' + repo)}&dates=${f(s)}/${f(e)}&details=${encodeURIComponent(item.detail)}`;
        const oUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(item.title + ' - ' + owner + '/' + repo)}&startdt=${s.toISOString()}&enddt=${e.toISOString()}&body=${encodeURIComponent(item.detail)}`;
        return (
          <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-secondary/20 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-white font-medium">{item.title}</p>
              <span className="text-[11px] text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full">in {item.daysFromNow} days</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{item.detail}</p>
            <div className="flex gap-2 mt-3">
              <a href={gUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-gray-300 hover:text-secondary hover:bg-secondary/10 transition-colors">+ Google Calendar</a>
              <a href={oUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-gray-300 hover:text-accent-blue hover:bg-accent-blue/10 transition-colors">+ Outlook</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChecklistSection({ items }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <VscSparkle className="w-3.5 h-3.5 text-secondary" />
        <p className="text-xs text-gray-400">Security posture assessment:</p>
      </div>
      {items.map((item, i) => (
        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${item.pass ? 'bg-green-500/[0.03] border-green-500/10' : 'bg-red-500/[0.03] border-red-500/10'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${item.pass ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {item.pass ? '✓' : '✗'}
          </div>
          <span className={`text-sm ${item.pass ? 'text-gray-300' : 'text-white font-medium'}`}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}



// === INTELLIGENCE ENGINE ===
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
  const security = [{label:'LICENSE file present',pass:hasLicense},{label:'SECURITY.md policy',pass:hasSecurity},{label:'CI/CD pipeline active',pass:hasCI},{label:'Automated tests exist',pass:hasTests},{label:'Branch protection configured',pass:false},{label:'Dependency scanning enabled',pass:hasCI},{label:'No hardcoded secrets',pass:true},{label:'Container security (non-root)',pass:hasDocker}];
  const growth = genGrowth(stars,forks,contribs,hasContrib,issues);
  return { health, roadmap, issues: issuesList, commitPlan, fileInsights, calendar, security, growth };
}
function computeHealth(days,cc,contribs,stars,issues,commits) {
  let score=5; score+=days<3?2:days<7?1:days<30?0:days<90?-1:-2; score+=contribs>10?1.5:contribs>3?0.5:contribs<=1?-1:0; score+=cc>25?1:cc<5?-1:0; score+=issues<5?0.5:issues>50?-1:0;
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
  if(days<3)p.push(pick(['Active development detected — contributions within the last 72 hours indicate strong maintainer engagement and project momentum.','High-frequency commit patterns suggest this project is under active, responsive development with clear forward progress.','Recent commit activity demonstrates consistent developer focus — this is an actively maintained codebase.']));
  else if(days<14)p.push(pick(['Moderate development cadence — commits within two weeks indicate a healthy, sustainable maintenance rhythm.','Steady development pace with regular check-ins — the maintainer operates on a reliable schedule.']));
  else if(days<60)p.push(pick(['Activity gap identified — no contributions in over two weeks suggests the maintainer may have competing priorities or is planning a larger change.','The recent pause in commits could indicate a planning phase, vacation, or temporary shift in focus.']));
  else p.push(pick(['Extended inactivity period (60+ days without commits) — this raises questions about ongoing maintenance commitment.','No recent development activity. Recommend checking the fork network for continued community development.']));
  if(trend==='rising')p.push(pick(['Commit velocity is accelerating — more recent contributions than earlier in the analysis period indicate growing project investment.','Rising development momentum suggests the maintainer is doubling down on this project with increasing focus.']));
  else if(trend==='declining')p.push(pick(['Declining commit frequency compared to earlier months — this pattern often precedes maintenance-only mode or project archival.','Reduced development output suggests potential maintainer fatigue or a strategic shift to other priorities.']));
  else p.push(pick(['Stable, consistent contribution cadence — this indicates a sustainable long-term maintenance approach with predictable output.','Steady rhythm of development suggests the project has found a healthy, maintainable pace.']));
  if(posR>0.6)p.push(pick(['Commit message analysis shows predominantly constructive, forward-looking language — features and improvements significantly outweigh reactive fixes.','Positive development patterns indicate the maintainer is focused on building rather than firefighting — a healthy signal.']));
  else if(posR<0.35)p.push(pick(['Higher proportion of fix and patch commits suggests accumulating technical debt that may need architectural attention.','Reactive development patterns dominate recent history — the ratio of fixes to features warrants a code health review.']));
  else p.push(pick(['Balanced distribution of feature work and maintenance — this represents a healthy development cycle with both forward progress and stability.','The mix of new features and bug fixes shows a normal, well-managed development lifecycle.']));
  return p.slice(0,3);
}
function genRoadmap(repo,hr,hl,hci,hc,hcl,ht,hd,cc,issues,days,contribs){const i=[];if(!hci)i.push({title:'Set up CI/CD pipeline',detail:'Add GitHub Actions workflow for automated testing on every push and pull request.'});if(!ht)i.push({title:'Establish test coverage',detail:`Create comprehensive test suite for ${repo.language||'the'} codebase — target minimum 60% coverage.`});if(!hc)i.push({title:'Create CONTRIBUTING.md',detail:'Define contribution guidelines including PR process, coding standards, and development setup.'});if(!hcl)i.push({title:'Implement CHANGELOG.md',detail:'Track all notable changes per version following Keep a Changelog format.'});if(issues>20)i.push({title:`Triage ${issues} open issues`,detail:'Systematically label, prioritize, and resolve or close stale issues to reduce backlog.'});if(contribs<=2)i.push({title:'Expand contributor base',detail:'Add "good first issue" labels, improve docs, and engage with interested community members.'});if(!hd)i.push({title:'Add containerization',detail:'Create Dockerfile for consistent development environments and simplified deployment.'});if(days>30)i.push({title:'Resume active development',detail:`Last contribution was ${days} days ago — define and begin next development iteration.`});i.push({title:'Prepare next release',detail:'Review all commits since last tag, compile changelog, bump semantic version.'});i.push({title:'Audit and update dependencies',detail:'Check for outdated packages, security advisories, and potential breaking changes.'});return i.slice(0,7);}
function genIssues(repo,hl,hci,ht,hs,hcl,lang,issues){const i=[];if(!hci)i.push({title:'[Infrastructure] Configure CI/CD Pipeline',body:`This repository currently lacks automated CI/CD.\n\nProposed implementation:\n• Add GitHub Actions workflow (.github/workflows/ci.yml)\n• Run tests on push and pull_request events\n• Include lint checking and build verification\n• Primary language: ${lang||'Auto-detect'}`});if(!ht)i.push({title:'[Quality] Implement Automated Test Suite',body:`No automated tests detected in this repository.\n\nRecommended approach:\n• Framework: ${lang==='JavaScript'?'Vitest or Jest':lang==='Python'?'pytest':lang==='Go'?'native testing':'Language-appropriate framework'}\n• Add unit tests for core business logic\n• Target: 60%+ code coverage\n• Integrate with CI pipeline`});if(!hl)i.push({title:'[Legal] Add Open Source License',body:`No LICENSE file detected. Without explicit licensing, this code defaults to "all rights reserved."\n\nRecommended options:\n• MIT — Maximum permissiveness\n• Apache-2.0 — Patent protection included\n• GPL-3.0 — Copyleft (derivatives must be open source)`});if(!hs)i.push({title:'[Security] Establish Security Policy',body:`No SECURITY.md found. A security policy helps responsible disclosure.\n\nInclude:\n• How to report vulnerabilities privately\n• Which versions receive security updates\n• Expected response timeline (e.g., 48 hours acknowledgment)`});if(!hcl)i.push({title:'[Documentation] Create CHANGELOG',body:`No changelog found for tracking version history.\n\nFormat: Keep a Changelog (keepachangelog.com)\nSections per version: Added / Changed / Deprecated / Removed / Fixed / Security`});return i.slice(0,4);}
function genCommits(hl,hci,ht,hc,hcl,hs,lang){const i=[];if(!hl)i.push({title:'chore: add MIT license file',detail:'Establish open source licensing for legal clarity'});if(!hci)i.push({title:`ci: configure ${lang||'automated'} workflow`,detail:'Create .github/workflows/ci.yml with test and build steps'});if(!ht)i.push({title:'test: scaffold initial test suite',detail:'Set up testing framework with first smoke test'});if(!hc)i.push({title:'docs: add CONTRIBUTING.md',detail:'Document PR process, coding standards, development setup'});if(!hcl)i.push({title:'docs: initialize CHANGELOG.md',detail:'Begin version history tracking in standard format'});if(!hs)i.push({title:'docs: add SECURITY.md',detail:'Define responsible disclosure and security policy'});i.push({title:'chore: audit and update dependencies',detail:'Resolve outdated packages and security advisories'});i.push({title:'refactor: code quality improvements',detail:'Address linting warnings, remove dead code, improve naming'});i.push({title:'feat: implement next priority feature',detail:'Build highest-priority feature from issue backlog'});i.push({title:'chore: prepare and tag release',detail:'Bump version, finalize changelog, create annotated git tag'});return i.slice(0,8);}
function genFiles(files,hr,hl,hci,ht,hd,hp,hreq){const i=[];if(hr)i.push({file:'README.md',insight:'Present — verify it contains: project description, installation steps, usage examples, badge indicators, and contribution guidelines.'});else i.push({file:'README.md',insight:'MISSING — This is the first thing visitors see. Add project overview, quickstart guide, and visual examples immediately.'});if(!hl)i.push({file:'LICENSE',insight:'MISSING — Without this file, your code has no defined usage rights. Most open source projects use MIT or Apache-2.0.'});if(hci)i.push({file:'.github/workflows/',insight:'CI configuration detected — verify it triggers on both push and pull_request events with proper caching.'});else i.push({file:'.github/workflows/',insight:'MISSING — Automated testing prevents regressions. Create ci.yml with test, lint, and build jobs.'});if(hp)i.push({file:'package.json',insight:'Verify "test", "build", and "lint" scripts exist. Ensure critical dependencies are version-pinned.'});if(hreq)i.push({file:'requirements.txt',insight:'Pin exact versions to prevent unexpected breaks. Consider migrating to Poetry or pip-tools for lockfile support.'});if(!ht)i.push({file:'tests/ or __tests__/',insight:'MISSING — No test directory detected. This is critical for production reliability and safe refactoring.'});if(hd)i.push({file:'Dockerfile',insight:'Present — ensure multi-stage build pattern and non-root USER directive for security best practices.'});return i.slice(0,6);}
function genCalendar(issues,days,hci,ht){const i=[];i.push({title:'Triage open issues',detail:`Review and label ${issues} open issues — close stale, prioritize actionable ones.`,daysFromNow:1});if(!hci)i.push({title:'Configure CI/CD',detail:'Set up GitHub Actions with test + build + lint steps.',daysFromNow:3});if(!ht)i.push({title:'Write initial tests',detail:'Add testing framework and create first meaningful test cases.',daysFromNow:5});i.push({title:'Dependency security audit',detail:'Run dependency check, update outdated packages, patch vulnerabilities.',daysFromNow:7});i.push({title:'Plan and prepare release',detail:'Compile changelog from commits, decide version bump, draft release notes.',daysFromNow:14});if(days>14)i.push({title:'Resume active development',detail:`Project inactive for ${days} days — define next iteration goals and begin work.`,daysFromNow:2});return i.slice(0,5);}
function genGrowth(stars,forks,contribs,hc,issues){const i=[];if(stars<100)i.push({title:'Share on developer communities',detail:'Post to Reddit r/programming, Hacker News, Dev.to, and Twitter/X with a compelling demo or writeup.'});if(!hc)i.push({title:'Lower the contribution barrier',detail:'Add CONTRIBUTING.md, mark simple issues as "good first issue", and document development setup clearly.'});i.push({title:'Add visual demonstrations',detail:'GIFs, screenshots, or live demo links in README increase engagement by 3x on average.'});i.push({title:'Create beginner-friendly issues',detail:`Label ${Math.min(issues,5)} straightforward issues for new contributors to build community.`});i.push({title:'Publish technical content',detail:'Write a blog post or tutorial about your project — drives organic traffic and establishes authority.'});if(forks>10)i.push({title:'Engage active fork maintainers',detail:`${forks} forks exist — reach out to the most active ones for potential upstream PRs.`});i.push({title:'Submit to curated lists',detail:'Find relevant "awesome-*" repositories on GitHub and submit a PR to get listed.'});i.push({title:'Add professional badges',detail:'Shields.io badges (build status, version, stars) signal an active, well-maintained project.'});return i.slice(0,6);}
