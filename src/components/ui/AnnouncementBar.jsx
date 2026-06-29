import { useState } from 'react';
import { useCMS } from '../../context/CMSContext';

export default function AnnouncementBar() {
  const { announcements } = useCMS();
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]'); } catch { return []; }
  });

  const active = announcements.filter(a => a.active && !dismissed.includes(a.id));
  if (!active.length) return null;

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    sessionStorage.setItem('dismissed_announcements', JSON.stringify(next));
  };

  return (
    <div className="space-y-0">
      {active.map(a => (
        <div key={a.id} className="relative py-2 px-4 text-center text-sm font-medium" style={{ background: a.bgColor || 'linear-gradient(90deg, #10b981, #06b6d4)', color: a.textColor || '#fff' }}>
          {a.link ? <a href={a.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{a.text}</a> : a.text}
          <button onClick={() => dismiss(a.id)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 text-current">✕</button>
        </div>
      ))}
    </div>
  );
}
