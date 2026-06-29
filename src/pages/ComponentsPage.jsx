import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/ui/SEO';

const CATEGORIES = ['All', 'Stats', 'Badges', 'Widgets', 'Social', 'Custom'];

// Pre-loaded popular components
const DEFAULT_COMPONENTS = [
  {
    id: 'stats-card',
    title: 'GitHub Stats Card',
    description: 'Show your GitHub stats including stars, commits, PRs, and issues.',
    category: 'Stats',
    author: 'anuraghazra',
    code: '![{{username}}\'s GitHub Stats](https://github-readme-stats.vercel.app/api?username={{username}}&show_icons=true&theme=dark&bg_color=1B1B1B&border_color=3a3a3a&icon_color=00bf63&title_color=00bf63)',
    upvotes: 248,
  },
  {
    id: 'streak-stats',
    title: 'GitHub Streak Stats',
    description: 'Display your contribution streak, current streak, and longest streak.',
    category: 'Stats',
    author: 'DenverCoder1',
    code: '![GitHub Streak](https://streak-stats.demolab.com?user={{username}}&theme=dark&background=1B1B1B&border=3a3a3a&ring=00bf63&fire=00bf63&currStreakLabel=00bf63)',
    upvotes: 189,
  },
  {
    id: 'top-langs',
    title: 'Top Languages Card',
    description: 'Show most used programming languages across your repos.',
    category: 'Stats',
    author: 'anuraghazra',
    code: '![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username={{username}}&layout=compact&theme=dark&bg_color=1B1B1B&border_color=3a3a3a&title_color=00bf63)',
    upvotes: 167,
  },
  {
    id: 'trophy',
    title: 'GitHub Profile Trophy',
    description: 'Add dynamically generated GitHub trophy to your README.',
    category: 'Badges',
    author: 'ryo-ma',
    code: '![Trophy](https://github-profile-trophy.vercel.app/?username={{username}}&theme=darkhub&no-bg=true&no-frame=true&margin-w=10)',
    upvotes: 134,
  },
  {
    id: 'activity-graph',
    title: 'Activity Graph',
    description: 'A dynamically generated activity graph showing your contributions.',
    category: 'Widgets',
    author: 'Ashutosh00710',
    code: '![Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username={{username}}&theme=github-dark&bg_color=1B1B1B&color=00bf63&line=00bf63&point=ffffff&area=true&hide_border=true)',
    upvotes: 112,
  },
  {
    id: 'profile-views',
    title: 'Profile Views Counter',
    description: 'Track and display your GitHub profile view count.',
    category: 'Badges',
    author: 'antonkomarev',
    code: '![Profile Views](https://komarev.com/ghpvc/?username={{username}}&color=00bf63&style=for-the-badge&label=PROFILE+VIEWS)',
    upvotes: 98,
  },
  {
    id: 'typing-svg',
    title: 'Typing SVG',
    description: 'Animated typing text for your profile README.',
    category: 'Widgets',
    author: 'DenverCoder1',
    code: '![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&pause=1000&color=00BF63&background=1B1B1B00&width=435&lines=Hello+World!+I\'m+{{username}};Welcome+to+my+GitHub+Profile)',
    upvotes: 87,
  },
  {
    id: 'social-badges',
    title: 'Social Media Badges',
    description: 'Clean badges linking to your social profiles.',
    category: 'Social',
    author: 'community',
    code: '[![GitHub](https://img.shields.io/badge/GitHub-{{username}}-00bf63?style=for-the-badge&logo=github)](https://github.com/{{username}})\n[![Twitter](https://img.shields.io/badge/Twitter-{{username}}-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/{{username}})',
    upvotes: 76,
  },
];

export default function ComponentsPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState('All');
  const [myUsername, setMyUsername] = useState(user?.login || '');
  const [components, setComponents] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('scotium_components') || '[]');
      return [...DEFAULT_COMPONENTS, ...stored];
    } catch { return DEFAULT_COMPONENTS; }
  });
  const [copied, setCopied] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', code: '', category: 'Custom' });

  const filtered = useMemo(() => {
    if (category === 'All') return components;
    return components.filter(c => c.category === category);
  }, [category, components]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)), [filtered]);

  const copyCode = (code, id) => {
    const rendered = code.replace(/\{\{username\}\}/g, myUsername || 'username');
    navigator.clipboard.writeText(rendered);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const upvote = (id) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c));
  };

  const submitComponent = () => {
    if (!form.title.trim() || !form.code.trim()) return;
    const newComp = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      code: form.code,
      category: form.category,
      author: user?.login || 'anonymous',
      upvotes: 0,
    };
    const updated = [...components, newComp];
    setComponents(updated);
    // Store only user-submitted ones
    const userSubmitted = updated.filter(c => !DEFAULT_COMPONENTS.find(d => d.id === c.id));
    localStorage.setItem('scotium_components', JSON.stringify(userSubmitted));
    setForm({ title: '', description: '', code: '', category: 'Custom' });
    setShowSubmit(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title="README Components" description="Browse and copy GitHub README components for your profile" canonical="/components" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">README Components</h1>
          <p className="text-sm text-gray-400 mt-1">Browse, preview, and copy components for your GitHub README</p>
        </div>
        <button onClick={() => setShowSubmit(!showSubmit)} className="btn-primary text-sm">+ Submit Component</button>
      </div>

      {/* Username input */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="text-sm font-medium text-gray-300 flex-shrink-0">Your GitHub username:</label>
          <input
            value={myUsername}
            onChange={e => setMyUsername(e.target.value)}
            placeholder="Enter your username to preview"
            className="input-field text-sm flex-1 max-w-xs"
          />
          <p className="text-[11px] text-gray-500">Used to replace <code className="text-secondary">{'{{username}}'}</code> in components</p>
        </div>
      </div>

      {/* Submit form */}
      {showSubmit && (
        <div className="card mb-6 border-secondary/20">
          <h3 className="text-sm font-semibold text-white mb-3">Submit a Component</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Component title" className="input-field text-sm" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field text-sm">
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="input-field text-sm sm:col-span-2" />
          </div>
          <textarea
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            placeholder={'Paste your markdown code here...\nUse {{username}} as placeholder for the user\'s GitHub username'}
            rows={4}
            className="input-field text-sm w-full font-mono resize-none mb-3"
          />
          <div className="flex gap-2">
            <button onClick={submitComponent} className="btn-primary text-xs">Submit</button>
            <button onClick={() => setShowSubmit(false)} className="btn-ghost text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${
              category === c ? 'bg-secondary/10 text-secondary border-secondary/30' : 'text-gray-400 border-gray-700 hover:border-gray-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map(comp => (
          <div key={comp.id} className="card">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{comp.title}</h3>
                {comp.description && <p className="text-[11px] text-gray-500 mt-0.5">{comp.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge bg-secondary/10 text-secondary">{comp.category}</span>
                  {comp.author && <span className="text-[10px] text-gray-500">by {comp.author}</span>}
                </div>
              </div>
              <button onClick={() => upvote(comp.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-secondary transition-colors">
                ▲ {comp.upvotes || 0}
              </button>
            </div>

            {/* Preview */}
            <div className="bg-primary rounded-xl border border-gray-800/40 p-3 mb-3 overflow-x-auto">
              <pre className="text-[11px] font-mono text-gray-400 whitespace-pre-wrap break-all">
                {comp.code.replace(/\{\{username\}\}/g, myUsername || '{{username}}')}
              </pre>
            </div>

            {/* Image preview if markdown image */}
            {myUsername && comp.code.includes('![') && (
              <div className="mb-3 overflow-hidden rounded-lg">
                <img
                  src={comp.code.match(/\(([^)]+)\)/)?.[1]?.replace(/\{\{username\}\}/g, myUsername)}
                  alt="Preview"
                  className="max-w-full h-auto"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <button
              onClick={() => copyCode(comp.code, comp.id)}
              className={`w-full py-2 rounded-xl text-xs font-medium transition-all ${
                copied === comp.id
                  ? 'bg-secondary/10 text-secondary border border-secondary/30'
                  : 'bg-white/[0.03] text-gray-400 border border-gray-700 hover:border-secondary/30 hover:text-white'
              }`}
            >
              {copied === comp.id ? '✓ Copied to clipboard!' : 'Copy to clipboard'}
            </button>
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="card text-center py-12 text-gray-500 text-sm">
          No components in this category yet. Be the first to submit one!
        </div>
      )}
    </div>
  );
}
