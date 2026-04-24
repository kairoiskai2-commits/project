import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const getAuthUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  return user
}

const callOpenAI = async (messages: any[], model = 'gpt-4') => {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return {
    result: data.choices[0]?.message?.content || '',
    usage: data.usage,
    model: data.model,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const user = await getAuthUser(req)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // Expected path: /integrations/{endpoint}
    if (pathParts.length < 2 || pathParts[0] !== 'integrations') {
      return new Response(
        JSON.stringify({ error: 'Invalid path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const endpoint = pathParts[1]

    switch (endpoint) {
      case 'llm': {
        const { prompt, messages, system, model = 'gpt-4' } = await req.json()

        if (!prompt && !messages) {
          return new Response(
            JSON.stringify({ error: 'Either prompt or messages are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        let chatMessages = []

        if (messages && Array.isArray(messages)) {
          chatMessages = messages
        } else {
          chatMessages = []
          if (system) {
            chatMessages.push({ role: 'system', content: system })
          }
          chatMessages.push({ role: 'user', content: prompt })
        }

        const result = await callOpenAI(chatMessages, model)

        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'generate-image': {
        const { prompt, size = '1024x1024' } = await req.json()

        if (!prompt) {
          return new Response(
            JSON.stringify({ error: 'Prompt is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const openaiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openaiKey) {
          return new Response(
            JSON.stringify({ error: 'Image generation not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            n: 1,
            size: size,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          return new Response(
            JSON.stringify({ error: `Image generation failed: ${error.error?.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const data = await response.json()
        const imageUrl = data.data[0]?.url

        return new Response(
          JSON.stringify({
            image_url: imageUrl,
            file_url: imageUrl, // Same for now
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Integration error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})