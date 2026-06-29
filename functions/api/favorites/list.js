export async function onRequest(context) {
  const { request, env } = context;

  const token = request.headers.get('Authorization');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
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

    const result = await env.DB.prepare(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY saved_at DESC'
    ).bind(userId).all();

    return new Response(JSON.stringify({ favorites: result.results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to list favorites', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
