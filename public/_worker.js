const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

const handleGroq = async (request, env) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method === 'GET') {
    return json({ ok: true, service: 'groq' });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return json({ error: 'Missing GROQ_API_KEY environment variable' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON request body' }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return json({ error: 'messages must be a non-empty array' }, 400);
  }

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: body.model || env.GROQ_MODEL || env.VITE_GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages,
      max_tokens: body.max_tokens || 800,
      temperature: body.temperature ?? 0.7,
    }),
  });

  const text = await groqResponse.text();
  return new Response(text, {
    status: groqResponse.status,
    headers: {
      'Content-Type': groqResponse.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/groq' || url.pathname === '/api/groq/') {
      return handleGroq(request, env);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get('Accept')?.includes('text/html');

    if (assetResponse.status === 404 && request.method === 'GET' && acceptsHtml) {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = '/';
      indexUrl.search = '';
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return assetResponse;
  },
};
