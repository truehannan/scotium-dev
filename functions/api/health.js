export async function onRequest() {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'scotium',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
