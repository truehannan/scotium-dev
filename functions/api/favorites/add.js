export async function onRequestPost(context) {
  const { request, env } = context;

  const token = request.headers.get('Authorization');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { repo_full_name, repo_url, repo_description, repo_stars, repo_language } = await request.json();

    if (!repo_full_name || !repo_url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user from GitHub token
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: token, Accept: 'application/vnd.github.v3+json' },
    });
    const user = await userRes.json();

    if (!user.id) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = String(user.id);
    const id = crypto.randomUUID();

    // Upsert user
    await env.DB.prepare(
      'INSERT OR REPLACE INTO users (id, github_username, github_id, profile_pic, name) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, user.login, user.id, user.avatar_url, user.name || user.login).run();

    // Add favorite
    await env.DB.prepare(
      'INSERT INTO favorites (id, user_id, repo_full_name, repo_url, repo_description, repo_stars, repo_language) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, repo_full_name, repo_url, repo_description || '', repo_stars || 0, repo_language || '').run();

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to add favorite', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
