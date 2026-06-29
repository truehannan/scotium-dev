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
    const { repo_full_name } = await request.json();

    if (!repo_full_name) {
      return new Response(JSON.stringify({ error: 'Missing repo_full_name' }), {
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

    await env.DB.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND repo_full_name = ?'
    ).bind(userId, repo_full_name).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to remove favorite', details: err.message }), {
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
