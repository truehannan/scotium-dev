// CMS Admin CRUD - requires admin auth
const ADMIN_USER = 'truehannan';

async function verifyAdmin(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const res = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });
    const user = await res.json();
    return user.login === ADMIN_USER;
  } catch { return false; }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!await verifyAdmin(request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

  try {
    const { action, type, data } = await request.json();
    const id = data.id || crypto.randomUUID();

    if (action === 'create') {
      if (type === 'announcement') {
        await env.DB.prepare('INSERT INTO cms_announcements (id, text, link, bg_color, text_color, active) VALUES (?, ?, ?, ?, ?, 1)')
          .bind(id, data.text, data.link || '', data.bgColor || 'linear-gradient(90deg, #10b981, #06b6d4)', data.textColor || '#ffffff').run();
      } else if (type === 'banner') {
        await env.DB.prepare('INSERT INTO cms_banners (id, slot, title, description, image_url, link, bg_color, badge, cta, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)')
          .bind(id, data.slot, data.title, data.description || '', data.imageUrl || '', data.link || '', data.bgColor || '#0a0e27', data.badge || '', data.cta || '').run();
      } else if (type === 'sponsored') {
        await env.DB.prepare('INSERT INTO cms_sponsored_repos (id, repo_path, name, description, avatar_url, active) VALUES (?, ?, ?, ?, ?, 1)')
          .bind(id, data.repoPath, data.name, data.description || '', data.avatarUrl || '').run();
      }
    } else if (action === 'delete') {
      const table = { announcement: 'cms_announcements', banner: 'cms_banners', sponsored: 'cms_sponsored_repos' }[type];
      if (table) await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    } else if (action === 'toggle') {
      const table = { announcement: 'cms_announcements', banner: 'cms_banners', sponsored: 'cms_sponsored_repos' }[type];
      if (table) await env.DB.prepare(`UPDATE ${table} SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?`).bind(id).run();
    }

    return new Response(JSON.stringify({ success: true, id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
}
