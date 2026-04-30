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

const toSearchAnswer = (query, items) => {
  if (!items.length) {
    return `I searched for "${query}", but I could not find useful results. Try asking with a more specific place, date, or topic.`;
  }

  const bullets = items.slice(0, 5).map((item) => {
    const title = item.title || 'Result';
    const snippet = item.snippet || item.htmlSnippet?.replace(/<[^>]+>/g, '') || 'No preview available.';
    return `- **${title}**: ${snippet}`;
  }).join('\n');

  const sources = items.slice(0, 5).map((item, index) => {
    const title = item.title || `Source ${index + 1}`;
    return `${index + 1}. [${title}](${item.link})`;
  }).join('\n');

  return `I searched the web for **"${query}"** and found:\n\n${bullets}\n\n**Sources**\n${sources}`;
};

const handleSearchAnswer = async (request, env) => {
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
    return json({ ok: true, service: 'search-answer' });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = env.GOOGLE_SEARCH_API_KEY || env.GOOGLE_API_KEY || env.VITE_GOOGLE_SEARCH_API_KEY;
  const cx = env.GOOGLE_SEARCH_CX || env.GOOGLE_CSE_ID || env.VITE_GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    return json({
      error: 'Missing GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX environment variables',
    }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON request body' }, 400);
  }

  const query = String(body.query || '').trim();
  if (!query) {
    return json({ error: 'query is required' }, 400);
  }

  const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
  searchUrl.searchParams.set('key', apiKey);
  searchUrl.searchParams.set('cx', cx);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('num', String(Math.min(Math.max(Number(body.max_results) || 6, 1), 10)));
  searchUrl.searchParams.set('safe', 'active');

  const googleResponse = await fetch(searchUrl.toString());
  const text = await googleResponse.text();

  if (!googleResponse.ok) {
    return json({
      error: `Google Search API failed (${googleResponse.status})`,
      details: text,
    }, googleResponse.status);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return json({ error: 'Google Search returned invalid JSON' }, 502);
  }

  const items = Array.isArray(data.items) ? data.items : [];

  return json({
    content: toSearchAnswer(query, items),
    results: items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
    })),
  });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/groq' || url.pathname === '/api/groq/') {
      return handleGroq(request, env);
    }

    if (url.pathname === '/api/search-answer' || url.pathname === '/api/search-answer/') {
      return handleSearchAnswer(request, env);
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
