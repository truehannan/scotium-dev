export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'repositories';
  const sort = url.searchParams.get('sort') || 'stars';
  const page = url.searchParams.get('page') || '1';
  const perPage = url.searchParams.get('per_page') || '30';

  if (!q) {
    return new Response(JSON.stringify({ error: 'Missing search query' }), {
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
    const endpoint = type === 'users' ? 'users' : type === 'code' ? 'code' : 'repositories';
    const response = await fetch(
      `https://api.github.com/search/${endpoint}?q=${encodeURIComponent(q)}&sort=${sort}&order=desc&per_page=${perPage}&page=${page}`,
      { headers }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
