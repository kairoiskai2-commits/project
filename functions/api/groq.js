const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
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

  const payload = {
    model: body.model || env.GROQ_MODEL || env.VITE_GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: Array.isArray(body.messages) ? body.messages : [],
    max_tokens: body.max_tokens || 800,
    temperature: body.temperature ?? 0.7,
  };

  if (payload.messages.length === 0) {
    return json({ error: 'messages must be a non-empty array' }, 400);
  }

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await groqResponse.text();

  return new Response(text, {
    status: groqResponse.status,
    headers: {
      'Content-Type': groqResponse.headers.get('Content-Type') || 'application/json',
    },
  });
}
