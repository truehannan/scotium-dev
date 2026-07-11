import { useState, useEffect } from 'react';
import { VscPulse, VscArrowUp, VscArrowDown, VscDash, VscWarning, VscSparkle, VscFile, VscGitMerge, VscCalendar, VscShield, VscRocket, VscBug, VscTarget, VscFolderOpened } from 'react-icons/vsc';
import { fetchRepoCommits, fetchRepoContents, formatDate } from '../../utils/github';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function MaintainerHealthCard({ owner, repo, repoData, contributors }) {
  const { token, user } = useAuth();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState('health');
  const [quote, setQuote] = useState({ q: 'Code is like humor. When you have to explain it, it\'s bad.', a: 'Cory House' });
  const [error, setError] = useState(null);
  const [typingDone, setTypingDone] = useState(false);

  const { data: commits } = useQuery({ queryKey: ['intel-commits', owner, repo], queryFn: () => fetchRepoCommits(owner, repo, 1, token), enabled: !!owner && !!repo });
  const { data: rootFiles } = useQuery({ queryKey: ['intel-files', owner, repo], queryFn: () => fetchRepoContents(owner, repo, '', '', token), enabled: !!owner && !!repo });

  useEffect(() => { axios.get('https://zenquotes.io/api/random').then(r => { if (r.data?.[0]) setQuote(r.data[0]); }).catch(() => {}); }, []);

  // Call real AI endpoint when data is ready
  useEffect(() => {
    if (!commits || !repoData || !rootFiles) return;

    const runAnalysis = async () => {
      const files = (rootFiles || []).map(f => f.name.toLowerCase());
      const has = (n) => files.some(f => f.includes(n));
      const daysSince = commits[0] ? Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000) : 999;

      const repoContext = {
        description: repoData.description || '',
        language: repoData.language || '',
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        issues: repoData.open_issues_count || 0,
        contributors: contributors?.length || 0,
        lastCommitDays: daysSince,
        commitCount: commits.length,
        hasLicense: has('license'),
        hasCI: has('.github') || has('ci'),
        hasTests: has('test') || has('spec') || has('__tests__'),
        hasSecurity: has('security'),
        hasContributing: has('contributing'),
        hasDocker: has('docker'),
        hasChangelog: has('changelog'),
        rootFiles: (rootFiles || []).map(f => f.name).slice(0, 20),
        recentCommits: (commits || []).slice(0, 10).map(c => c.commit.message.split('\n')[0].slice(0, 80)),
      };

      try {
        if (!token) throw new Error('AUTH_REQUIRED');

        const res = await fetch('/api/analyze/intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ owner, repo, repoContext }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Rate limit or auth error — fall back to local
          if (data.code === 'RATE_LIMIT') setError('Daily AI limit reached (3/day). Showing cached analysis.');
          throw new Error(data.error || 'API error');
        }

        // Real AI response — format it
        setResult({
          health: { score: data.score, trend: data.trend || 'stable', burnout: data.burnout || false, insights: data.health || [] },
          roadmap: data.roadmap || [],
          issues: data.issues || [],
          commitPlan: data.commitPlan || [],
          fileInsights: data.fileInsights || [],
          calendar: data.calendar || [],
          security: data.security || [],
          growth: data.growth || [],
        });
      } catch (err) {
        // FALLBACK: Run local analysis engine
        console.info('AI endpoint unavailable, using local analysis:', err.message);
        setResult(runLocalEngine(repoData, commits, contributors, rootFiles));
      }

      setAnalyzing(false);
      setTimeout(() => setTypingDone(true), 400);
    };

    runAnalysis();
  }, [commits, repoData, contributors, rootFiles, token]);


  // === FULLSCREEN AI LOADER ===
  if (analyzing) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary via-accent-cyan to-secondary animate-spin" style={{ padding: '3px' }}>
            <div className="w-full h-full rounded-full bg-black" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <VscSparkle className="w-7 h-7 text-secondary animate-pulse" />
          </div>
        </div>
        <p className="text-xl font-bold text-white mb-2 tracking-tight">Running AI Analysis</p>
        <p className="text-sm text-gray-400 max-w-sm text-center leading-relaxed">Generating insights with Llama 3.1 — analyzing commits, structure, and health patterns</p>
        <div className="flex items-center gap-1.5 mt-6">
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
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
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${scoreBorder} to-secondary/10 opacity-60`} />
      <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a0c]" />
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

        {error && <div className="px-6 py-2 bg-yellow-500/[0.05] border-b border-yellow-500/10 text-xs text-yellow-400">{error}</div>}

        {/* Pill tabs */}
        <div className="px-4 py-3 border-b border-white/[0.04] overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200
                  ${activeSection === s.id ? 'bg-secondary/15 text-secondary border border-secondary/30 shadow-sm shadow-secondary/10' : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'}`}>
                <s.Icon className="w-3.5 h-3.5" />{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
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

        <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-[10px] text-gray-600">Powered by Cloudflare Workers AI (Llama 3.1)</p>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /><span className="text-[10px] text-gray-500">AI generated</span></div>
        </div>
      </div>
    </div>
  );
}


// === UI SUB-COMPONENTS ===
function HealthSection({ data }) {
  return (
    <div className="space-y-4">
      {(data.insights || []).map((text, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><VscSparkle className="w-3 h-3 text-secondary" /></div>
          <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
        </div>
      ))}
      {data.burnout && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.05] border border-red-500/20">
          <VscWarning className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div><p className="text-sm text-red-300 font-medium">Burnout Risk Detected</p><p className="text-xs text-red-400/70 mt-0.5">Declining patterns combined with reactive commits indicate potential maintainer fatigue</p></div>
        </div>
      )}
    </div>
  );
}
function ListSection({ items }) {
  return (<div className="space-y-3">{(items || []).map((item, i) => (<div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-secondary/20 transition-colors"><div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary">{i+1}</div><div><p className="text-sm text-white font-medium">{item.title}</p>{item.detail && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.detail}</p>}</div></div>))}</div>);
}
function IssuesSection({ items, owner, repo }) {
  return (<div className="space-y-3"><div className="flex items-center gap-2 mb-2"><VscSparkle className="w-3.5 h-3.5 text-secondary" /><p className="text-xs text-gray-400">AI-suggested issues for this repository:</p></div>{(items || []).map((item, i) => (<div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-secondary/20 transition-colors"><p className="text-sm text-white font-semibold">{item.title}</p><p className="text-xs text-gray-400 mt-2 leading-relaxed whitespace-pre-line">{item.body}</p><a href={`https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(item.title)}&body=${encodeURIComponent(item.body)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-medium hover:bg-secondary/20 transition-colors"><VscBug className="w-3 h-3" />Create on GitHub</a></div>))}</div>);
}
function FilesSection({ items }) {
  return (<div className="space-y-3"><div className="flex items-center gap-2 mb-2"><VscSparkle className="w-3.5 h-3.5 text-secondary" /><p className="text-xs text-gray-400">AI file structure analysis:</p></div>{(items || []).map((item, i) => (<div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"><VscFile className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" /><div><p className="text-sm text-white font-mono font-medium">{item.file}</p><p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.insight}</p></div></div>))}</div>);
}
function CalendarSection({ items, owner, repo }) {
  return (<div className="space-y-3"><div className="flex items-center gap-2 mb-2"><VscSparkle className="w-3.5 h-3.5 text-secondary" /><p className="text-xs text-gray-400">AI-recommended task schedule:</p></div>{(items || []).map((item, i) => {const s=new Date();s.setDate(s.getDate()+(item.daysFromNow||7));const e=new Date(s);e.setHours(e.getHours()+1);const f=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const gUrl=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title+' - '+owner+'/'+repo)}&dates=${f(s)}/${f(e)}&details=${encodeURIComponent(item.detail||'')}`;const oUrl=`https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(item.title+' - '+owner+'/'+repo)}&startdt=${s.toISOString()}&enddt=${e.toISOString()}&body=${encodeURIComponent(item.detail||'')}`;return(<div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-secondary/20 transition-colors"><div className="flex items-center justify-between mb-1.5"><p className="text-sm text-white font-medium">{item.title}</p><span className="text-[11px] text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full">in {item.daysFromNow||7}d</span></div><p className="text-xs text-gray-400 leading-relaxed">{item.detail}</p><div className="flex gap-2 mt-3"><a href={gUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-gray-300 hover:text-secondary hover:bg-secondary/10 transition-colors">+ Google Calendar</a><a href={oUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-gray-300 hover:text-accent-blue hover:bg-accent-blue/10 transition-colors">+ Outlook</a></div></div>);})}</div>);
}
function ChecklistSection({ items }) {
  return (<div className="space-y-2"><div className="flex items-center gap-2 mb-3"><VscSparkle className="w-3.5 h-3.5 text-secondary" /><p className="text-xs text-gray-400">AI security assessment:</p></div>{(items || []).map((item, i) => (<div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.pass?'bg-green-500/[0.03] border-green-500/10':'bg-red-500/[0.03] border-red-500/10'}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${item.pass?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>{item.pass?'✓':'✗'}</div><span className={`text-sm ${item.pass?'text-gray-300':'text-white font-medium'}`}>{item.label}</span></div>))}</div>);
}


// === LOCAL FALLBACK ENGINE (used when AI endpoint unavailable) ===
function runLocalEngine(repo, commits, contributors, rootFiles) {
  const files = (rootFiles || []).map(f => f.name.toLowerCase());
  const has = (n) => files.some(f => f.includes(n));
  const days = commits?.[0] ? Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000) : 999;
  const cc = commits?.length || 0;
  const contribs = contributors?.length || 0;
  const stars = repo.stargazers_count || 0;
  const issues = repo.open_issues_count || 0;
  const lang = repo.language || '';
  const hl=has('license'),hci=has('.github')||has('ci'),ht=has('test')||has('spec'),hs=has('security'),hc=has('contributing'),hcl=has('changelog'),hd=has('docker');

  let score=5; score+=days<3?2:days<7?1:days<30?0:-1; score+=contribs>10?1.5:contribs>3?0.5:-0.5; score+=cc>25?1:cc<5?-1:0;
  score=Math.max(1,Math.min(10,Math.round(score)));
  const trend=cc>10?(days<7?'rising':'stable'):(days>30?'declining':'stable');
  const burnout=score<=3;

  const health = [
    days<7 ? 'Active development detected with recent commits.' : 'Extended gap since last commit — may need attention.',
    contribs>5 ? 'Healthy contributor base reduces single-point-of-failure risk.' : 'Limited contributors — consider expanding the team.',
    score>=7 ? 'Overall project health is strong based on activity patterns.' : 'Some areas need improvement for long-term sustainability.',
  ];
  const roadmap = [];
  if(!hci) roadmap.push({title:'Set up CI/CD',detail:'Add automated testing pipeline.'});
  if(!ht) roadmap.push({title:'Add test coverage',detail:`Create test suite for ${lang} code.`});
  if(!hc) roadmap.push({title:'Create CONTRIBUTING.md',detail:'Define how others can contribute.'});
  roadmap.push({title:'Update dependencies',detail:'Check for outdated packages.'});
  roadmap.push({title:'Plan next release',detail:'Review commits and bump version.'});

  const issuesList = [];
  if(!hci) issuesList.push({title:'[Infra] Set up CI/CD',body:'Add GitHub Actions workflow for automated testing.'});
  if(!ht) issuesList.push({title:'[Quality] Add tests',body:'Create test suite with baseline coverage.'});
  if(!hl) issuesList.push({title:'[Legal] Add LICENSE',body:'Add open source license file.'});

  const commitPlan = [];
  if(!hl) commitPlan.push({title:'chore: add license',detail:'Add MIT LICENSE file'});
  if(!hci) commitPlan.push({title:'ci: add workflow',detail:'Create CI pipeline'});
  commitPlan.push({title:'chore: update deps',detail:'Update dependencies'});
  commitPlan.push({title:'feat: next feature',detail:'Implement priority feature'});

  const fileInsights = [];
  fileInsights.push({file:'README.md',insight:has('readme')?'Present — verify completeness.':'MISSING — add immediately.'});
  if(!hl) fileInsights.push({file:'LICENSE',insight:'MISSING — add open source license.'});
  if(!hci) fileInsights.push({file:'.github/workflows/',insight:'MISSING — add CI/CD.'});

  const calendar = [{title:'Review issues',detail:`Triage ${issues} open issues.`,daysFromNow:1},{title:'Update deps',detail:'Security audit.',daysFromNow:7}];
  const security = [{label:'LICENSE present',pass:hl},{label:'SECURITY.md',pass:hs},{label:'CI/CD active',pass:hci},{label:'Tests exist',pass:ht},{label:'No secrets exposed',pass:true}];
  const growth = [{title:'Share on communities',detail:'Post to Reddit, HN, Dev.to.'},{title:'Add badges',detail:'Shields.io badges signal activity.'}];

  return { health: { score, trend, burnout, insights: health }, roadmap, issues: issuesList, commitPlan, fileInsights, calendar, security, growth };
}
