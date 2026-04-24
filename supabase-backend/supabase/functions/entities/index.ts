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

const handleEntityRequest = async (req: Request, entityName: string, id?: string) => {
  const user = await getAuthUser(req)
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const method = req.method

  try {
    let result

    switch (method) {
      case 'GET':
        if (id) {
          // Get single entity
          result = await supabase
            .from(entityName.toLowerCase())
            .select('*')
            .eq('id', id)
            .single()
        } else {
          // List entities with filters
          const sort = url.searchParams.get('sort') || 'created_at'
          const limit = parseInt(url.searchParams.get('limit') || '100')

          let query = supabase
            .from(entityName.toLowerCase())
            .select('*')
            .order(sort, { ascending: false })
            .limit(limit)

          // Add filters
          for (const [key, value] of url.searchParams.entries()) {
            if (key.startsWith('filter_')) {
              const filterKey = key.replace('filter_', '')
              try {
                const filterValue = JSON.parse(value)
                query = query.eq(filterKey, filterValue)
              } catch {
                query = query.eq(filterKey, value)
              }
            }
          }

          result = await query
        }
        break

      case 'POST':
        // Create entity
        const createData = await req.json()
        createData.user_id = user.id // Add user_id for user-owned entities

        result = await supabase
          .from(entityName.toLowerCase())
          .insert(createData)
          .select()
          .single()
        break

      case 'PUT':
        // Update entity
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'ID required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()
        result = await supabase
          .from(entityName.toLowerCase())
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        break

      case 'DELETE':
        // Delete entity
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'ID required for delete' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        result = await supabase
          .from(entityName.toLowerCase())
          .delete()
          .eq('id', id)
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(result.data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)

  // Expected path: /entities/{entityName}/{id?}
  if (pathParts.length < 2 || pathParts[0] !== 'entities') {
    return new Response(
      JSON.stringify({ error: 'Invalid path' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const entityName = pathParts[1]
  const id = pathParts[2] // Optional

  return handleEntityRequest(req, entityName, id)
})