export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return new Response(JSON.stringify({ error: 'Missing username parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = request.headers.get('Authorization');
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Scotium/1.0',
  };
  if (token) headers.Authorization = token;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers }),
    ]);

    const user = await userRes.json();
    const repos = await reposRes.json();

    return new Response(JSON.stringify({ user, repos }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
