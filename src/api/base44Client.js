import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const AUTH_USERS_KEY = 'project-web-local-users'
const AUTH_SESSION_KEY = 'project-web-local-session'

const hashPassword = (password) => {
  try {
    return btoa(unescape(encodeURIComponent(password)))
  } catch {
    return password
  }
}

const getLocalUsers = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_USERS_KEY) || '[]')
  } catch {
    return []
  }
}

const setLocalUsers = (users) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

const getSessionUser = () => {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

const setSessionUser = (user) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user))
}

const clearSession = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_SESSION_KEY)
}

const createLocalUser = ({ email, password, fullName }) => {
  const users = getLocalUsers()
  const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    const error = new Error('A user with that email already exists')
    error.type = 'user_exists'
    throw error
  }

  const newUser = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    email,
    fullName,
    passwordHash: hashPassword(password),
    role: 'user',
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  setLocalUsers(users)
  return newUser
}

const authenticateLocalUser = ({ email, password }) => {
  const users = getLocalUsers()
  const stored = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (!stored) {
    const error = new Error('Invalid email or password')
    error.type = 'invalid_credentials'
    throw error
  }

  if (stored.passwordHash !== hashPassword(password)) {
    const error = new Error('Invalid email or password')
    error.type = 'invalid_credentials'
    throw error
  }

  return {
    id: stored.id,
    email: stored.email,
    fullName: stored.fullName,
    role: stored.role,
    createdAt: stored.createdAt,
  }
}

// Auth methods
const auth = {
  isAuthenticated: async () => {
    return !!getSessionUser()
  },
  me: async () => {
    return getSessionUser()
  },
  login: async (email, password) => {
    const user = authenticateLocalUser({ email, password })
    setSessionUser(user)
    return { user }
  },
  signup: async (email, password, metadata = {}) => {
    const fullName = metadata.full_name || metadata.fullName || ''
    const user = createLocalUser({ email, password, fullName })
    setSessionUser({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
    })
    return { user }
  },
  logout: async () => {
    clearSession()
  },
  redirectToLogin: () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use this feature.')
  }
  return supabase
}

// Entities methods - dynamic proxy for all tables
const entities = new Proxy({}, {
  get: (target, tableName) => ({
    filter: async (filters = {}, options = {}) => {
      const client = ensureSupabase()
      let query = client.from(tableName).select('*')

      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object' && value !== null) {
          if (value.gte !== undefined) query = query.gte(key, value.gte)
          if (value.lte !== undefined) query = query.lte(key, value.lte)
          if (value.gt !== undefined) query = query.gt(key, value.gt)
          if (value.lt !== undefined) query = query.lt(key, value.lt)
        } else {
          query = query.eq(key, value)
        }
      })

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
      const client = ensureSupabase()
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    create: async (item) => {
      const client = ensureSupabase()
      const { data, error } = await client
        .from(tableName)
        .insert(item)
        .select()
        .single()
      if (error) throw error
      return data
    },
    update: async (id, updates) => {
      const client = ensureSupabase()
      const { data, error } = await client
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    delete: async (id) => {
      const client = ensureSupabase()
      const { error } = await client
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
      const client = ensureSupabase()
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await client.storage
        .from('uploads')
        .upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = client.storage
        .from('uploads')
        .getPublicUrl(fileName)
      return { file_url: publicUrl }
    },
  },
  AI: {
    chat: async (messages, options = {}) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('integrations', {
        body: { action: 'chat', messages, ...options },
      })
      if (error) throw error
      return data
    },
    generateImage: async (prompt, options = {}) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('integrations', {
        body: { action: 'generateImage', prompt, ...options },
      })
      if (error) throw error
      return data
    },
  },
  External: {
    wikipedia: async (action, params) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'wikipedia', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    weather: async (action, params) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'weather', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    geo: async (action, params) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'geo', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    translation: async (action, params) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'translation', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    images: async (service, params) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'images', endpoint: service, ...params },
      })
      if (error) throw error
      return data
    },
    currency: async (action, params) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'currency', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    travel: async (action, params) => {
      const client = ensureSupabase()
      const { data, error } = await client.functions.invoke('external', {
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