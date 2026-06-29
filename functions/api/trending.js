export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const language = url.searchParams.get('language') || '';
  const since = url.searchParams.get('since') || 'weekly';
  const sort = url.searchParams.get('sort') || 'stars';
  const page = url.searchParams.get('page') || '1';
  const perPage = url.searchParams.get('per_page') || '30';

  let query = 'stars:>100';
  if (language) query += ` language:${language}`;

  const dateMap = { daily: 1, weekly: 7, monthly: 30 };
  const days = dateMap[since] || 7;
  const date = new Date();
  date.setDate(date.getDate() - days);
  query += ` created:>${date.toISOString().split('T')[0]}`;

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Scotium/1.0',
        },
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch trending repos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
