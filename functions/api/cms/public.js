export async function onRequest(context) {
  const { env } = context;

  try {
    const [announcements, banners, sponsored] = await Promise.all([
      env.DB.prepare('SELECT * FROM cms_announcements WHERE active = 1 ORDER BY created_at DESC').all(),
      env.DB.prepare('SELECT * FROM cms_banners WHERE active = 1 ORDER BY created_at DESC').all(),
      env.DB.prepare('SELECT * FROM cms_sponsored_repos WHERE active = 1 ORDER BY created_at DESC').all(),
    ]);

    return new Response(JSON.stringify({
      announcements: (announcements.results || []).map(a => ({
        id: a.id, text: a.text, link: a.link, bgColor: a.bg_color, textColor: a.text_color, active: true,
      })),
      banners: (banners.results || []).map(b => ({
        id: b.id, slot: b.slot, title: b.title, description: b.description, imageUrl: b.image_url,
        link: b.link, bgColor: b.bg_color, badge: b.badge, cta: b.cta, active: true,
      })),
      sponsored_repos: (sponsored.results || []).map(s => ({
        id: s.id, repoPath: s.repo_path, name: s.name, description: s.description, avatarUrl: s.avatar_url, active: true,
      })),
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ announcements: [], banners: [], sponsored_repos: [] }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
