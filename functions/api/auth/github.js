export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { code, redirect_uri } = await request.json();

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const githubTokenUrl = new URL('/login/oauth/access_token', 'https://github.com').toString();

    const body = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    });

    if (redirect_uri) body.set('redirect_uri', redirect_uri);

    const tokenResponse = await fetch(githubTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'User-Agent': 'scotium-dev-oauth',
      },
      body: body.toString(),
    });

    const raw = await tokenResponse.text();
    let tokenData = {};
    try {
      tokenData = raw ? JSON.parse(raw) : {};
    } catch {
      tokenData = {};
    }

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      return new Response(
        JSON.stringify({
          error: tokenData.error || 'github_oauth_error',
          error_description:
            tokenData.error_description || `GitHub token endpoint returned ${tokenResponse.status}`,
          error_uri: tokenData.error_uri || null,
          github_status: tokenResponse.status,
          endpoint: githubTokenUrl,
          raw_response: raw?.slice(0, 500) || null,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ access_token: tokenData.access_token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'internal_server_error',
        message: err?.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
