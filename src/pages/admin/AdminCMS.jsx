import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import SEO from '../../components/ui/SEO';

const ADMIN_USERNAME = 'truehannan';

export default function AdminCMS() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState('overview');
  const [announcements, setAnnouncements] = useState([]);
  const [banners, setBanners] = useState([]);
  const [sponsored, setSponsored] = useState([]);

  useEffect(() => {
    try {
      setAnnouncements(JSON.parse(localStorage.getItem('cms_announcements') || '[]'));
      setBanners(JSON.parse(localStorage.getItem('cms_banners') || '[]'));
      setSponsored(JSON.parse(localStorage.getItem('cms_sponsored') || '[]'));
    } catch {}
  }, []);

  const save = (key, data) => { localStorage.setItem(key, JSON.stringify(data)); };

  if (!user || user.login !== ADMIN_USERNAME) return <Navigate to="/" replace />;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <SEO title="CMS Admin" />
      <h1 className="text-2xl font-bold text-white mb-6">Admin CMS</h1>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-white/[0.06] mb-6">
        {['overview', 'announcements', 'banners', 'sponsored'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'announcements' && <AnnouncementsTab data={announcements} setData={d => { setAnnouncements(d); save('cms_announcements', d); }} />}
      {tab === 'banners' && <BannersTab data={banners} setData={d => { setBanners(d); save('cms_banners', d); }} />}
      {tab === 'sponsored' && <SponsoredTab data={sponsored} setData={d => { setSponsored(d); save('cms_sponsored', d); }} />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="card-glass text-center py-8">
        <p className="text-3xl font-bold text-secondary">—</p>
        <p className="text-xs text-gray-500 mt-1">Total Users (connect D1)</p>
      </div>
      <div className="card-glass text-center py-8">
        <p className="text-3xl font-bold text-accent-blue">—</p>
        <p className="text-xs text-gray-500 mt-1">Page Views (connect analytics)</p>
      </div>
      <div className="card-glass text-center py-8">
        <p className="text-3xl font-bold text-accent-purple">—</p>
        <p className="text-xs text-gray-500 mt-1">API Calls Today</p>
      </div>
      <div className="card col-span-full">
        <p className="text-sm text-gray-400">Analytics data will populate when connected to Cloudflare D1 and Web Analytics. For now, manage ads and content below.</p>
      </div>
    </div>
  );
}

function AnnouncementsTab({ data, setData }) {
  const [form, setForm] = useState({ text: '', link: '', bgColor: 'linear-gradient(90deg, #10b981, #06b6d4)', textColor: '#ffffff', active: true });

  const add = () => {
    if (!form.text.trim()) return;
    setData([...data, { ...form, id: Date.now().toString() }]);
    setForm({ text: '', link: '', bgColor: 'linear-gradient(90deg, #10b981, #06b6d4)', textColor: '#ffffff', active: true });
  };

  const remove = (id) => setData(data.filter(a => a.id !== id));
  const toggle = (id) => setData(data.map(a => a.id === id ? { ...a, active: !a.active } : a));

  return (
    <div>
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Add Announcement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Announcement text" className="input-field text-sm" />
          <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="Link URL (optional)" className="input-field text-sm" />
          <input value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} placeholder="Background (CSS color/gradient)" className="input-field text-sm" />
          <input value={form.textColor} onChange={e => setForm({ ...form, textColor: e.target.value })} placeholder="Text color" className="input-field text-sm" />
        </div>
        <div className="mt-3 p-2 rounded text-center text-sm font-medium" style={{ background: form.bgColor, color: form.textColor }}>{form.text || 'Preview'}</div>
        <button onClick={add} className="btn-primary text-sm mt-3">Add Announcement</button>
      </div>
      <div className="space-y-2">
        {data.map(a => (
          <div key={a.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${a.active ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className="text-sm text-white">{a.text}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggle(a.id)} className="text-xs text-gray-400 hover:text-white">{a.active ? 'Disable' : 'Enable'}</button>
              <button onClick={() => remove(a.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannersTab({ data, setData }) {
  const [form, setForm] = useState({ slot: 'home-mid', title: '', description: '', imageUrl: '', link: '', bgColor: '#0a0e27', badge: '', cta: '', active: true });

  const add = () => {
    if (!form.title.trim()) return;
    setData([...data, { ...form, id: Date.now().toString() }]);
    setForm({ slot: 'home-mid', title: '', description: '', imageUrl: '', link: '', bgColor: '#0a0e27', badge: '', cta: '', active: true });
  };

  const remove = (id) => setData(data.filter(b => b.id !== id));
  const toggle = (id) => setData(data.map(b => b.id === id ? { ...b, active: !b.active } : b));

  return (
    <div>
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Add Banner Ad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.slot} onChange={e => setForm({ ...form, slot: e.target.value })} className="input-field text-sm">
            <option value="home-mid">Homepage Middle</option>
            <option value="home-bottom">Homepage Bottom</option>
            <option value="explore-top">Explore Top</option>
            <option value="repo-detail">Repo Detail</option>
          </select>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="input-field text-sm" />
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input-field text-sm" />
          <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL" className="input-field text-sm" />
          <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="Click link" className="input-field text-sm" />
          <input value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} placeholder="Background color" className="input-field text-sm" />
          <input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Badge text (optional)" className="input-field text-sm" />
          <input value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })} placeholder="CTA text (optional)" className="input-field text-sm" />
        </div>
        <button onClick={add} className="btn-primary text-sm mt-3">Add Banner</button>
      </div>
      <div className="space-y-2">
        {data.map(b => (
          <div key={b.id} className="card flex items-center justify-between">
            <div><p className="text-sm text-white">{b.title}</p><p className="text-[11px] text-gray-500">Slot: {b.slot}</p></div>
            <div className="flex gap-2">
              <button onClick={() => toggle(b.id)} className="text-xs text-gray-400 hover:text-white">{b.active ? 'Disable' : 'Enable'}</button>
              <button onClick={() => remove(b.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsoredTab({ data, setData }) {
  const [form, setForm] = useState({ repoPath: '', name: '', description: '', avatarUrl: '', active: true });

  const add = () => {
    if (!form.repoPath.trim() || !form.name.trim()) return;
    setData([...data, { ...form, id: Date.now().toString() }]);
    setForm({ repoPath: '', name: '', description: '', avatarUrl: '', active: true });
  };

  const remove = (id) => setData(data.filter(s => s.id !== id));
  const toggle = (id) => setData(data.map(s => s.id === id ? { ...s, active: !s.active } : s));

  return (
    <div>
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Add Sponsored Repo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.repoPath} onChange={e => setForm({ ...form, repoPath: e.target.value })} placeholder="Repo path (e.g. /owner/repo)" className="input-field text-sm" />
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Display name" className="input-field text-sm" />
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="input-field text-sm" />
          <input value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} placeholder="Avatar image URL" className="input-field text-sm" />
        </div>
        <button onClick={add} className="btn-primary text-sm mt-3">Add Sponsored Repo</button>
      </div>
      <div className="space-y-2">
        {data.map(s => (
          <div key={s.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              {s.avatarUrl && <img src={s.avatarUrl} alt="" className="w-6 h-6 rounded" />}
              <div><p className="text-sm text-white">{s.name}</p><p className="text-[11px] text-gray-500">{s.repoPath}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggle(s.id)} className="text-xs text-gray-400 hover:text-white">{s.active ? 'Disable' : 'Enable'}</button>
              <button onClick={() => remove(s.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
