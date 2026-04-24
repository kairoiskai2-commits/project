import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Auth methods
const auth = {
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },
  me: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },
  signup: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    if (error) throw error
    return data
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}

// Entities methods - dynamic proxy for all tables
const entities = new Proxy({}, {
  get: (target, tableName) => ({
    filter: async (filters = {}, options = {}) => {
      let query = supabase.from(tableName).select('*')

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object' && value !== null) {
          // Handle range queries
          if (value.gte !== undefined) query = query.gte(key, value.gte)
          if (value.lte !== undefined) query = query.lte(key, value.lte)
          if (value.gt !== undefined) query = query.gt(key, value.gt)
          if (value.lt !== undefined) query = query.lt(key, value.lt)
        } else {
          query = query.eq(key, value)
        }
      })

      // Apply options
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending !== false })
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    get: async (id) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    create: async (item) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(item)
        .select()
        .single()
      if (error) throw error
      return data
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    delete: async (id) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    },
  }),
})

// Integrations - call edge functions
const integrations = {
  Core: {
    UploadFile: async (file) => {
      // For now, use Supabase storage
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)
      return { file_url: publicUrl }
    },
  },
  AI: {
    chat: async (messages, options = {}) => {
      const { data, error } = await supabase.functions.invoke('integrations', {
        body: { action: 'chat', messages, ...options },
      })
      if (error) throw error
      return data
    },
    generateImage: async (prompt, options = {}) => {
      const { data, error } = await supabase.functions.invoke('integrations', {
        body: { action: 'generateImage', prompt, ...options },
      })
      if (error) throw error
      return data
    },
  },
  External: {
    wikipedia: async (action, params) => {
      const { data, error } = await supabase.functions.invoke('external', {
        body: { service: 'wikipedia', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    weather: async (action, params) => {
      const { data, error } = await supabase.functions.invoke('external', {
        body: { service: 'weather', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    geo: async (action, params) => {
      const { data, error } = await supabase.functions.invoke('external', {
        body: { service: 'geo', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    translation: async (action, params) => {
      const { data, error } = await supabase.functions.invoke('external', {
        body: { service: 'translation', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    images: async (service, params) => {
      const { data, error } = await supabase.functions.invoke('external', {
        body: { service: 'images', endpoint: service, ...params },
      })
      if (error) throw error
      return data
    },
    currency: async (action, params) => {
      const { data, error } = await supabase.functions.invoke('external', {
        body: { service: 'currency', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    travel: async (action, params) => {
      const { data, error } = await supabase.functions.invoke('external', {
        body: { service: 'travel', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
  },
}

export const db = { auth, entities, integrations }
export const base44 = db
export default db