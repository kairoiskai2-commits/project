import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const AUTH_SESSION_KEY = 'project-web-local-session'

// Simple file-based database (in production, this would be a real database)
let database = null

const loadDatabase = async () => {
  if (database) return database
  try {
    // In a real app, this would be an API call to load the database
    // For now, we'll simulate it with localStorage as a fallback
    const stored = localStorage.getItem('project-web-database')
    if (stored) {
      database = JSON.parse(stored)
    } else {
      // Load from the JSON file (simulated)
      database = {
        users: [
          {
            id: "admin-001",
            email: "karasmina2511@gmail.com",
            fullName: "Admin User",
            passwordHash: "b2FzJGFkbWluMjUxMTIwMTJrJCRhZG1pbg==",
            role: "admin",
            createdAt: "2024-01-01T00:00:00.000Z",
            isActive: true
          }
        ],
        userProfiles: [],
        posts: [],
        comments: [],
        favorites: [],
        places: [],
        familyTrips: [],
        memories: [],
        chatMessages: [],
        announcements: [],
        settings: {
          siteName: "Egypt Wonders",
          siteDescription: "Discover the wonders of Egypt",
          maintenanceMode: false,
          maxUsers: 100
        }
      }
      saveDatabase()
    }
    return database
  } catch (error) {
    console.error('Failed to load database:', error)
    return null
  }
}

const saveDatabase = () => {
  if (database) {
    localStorage.setItem('project-web-database', JSON.stringify(database))
  }
}

const hashPassword = (password) => {
  try {
    return btoa(unescape(encodeURIComponent(password)))
  } catch {
    return password
  }
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

const createLocalUser = async ({ email, password, fullName }) => {
  const db = await loadDatabase()
  if (!db) throw new Error('Database not available')

  const existing = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase())
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
    isActive: true
  }

  db.users.push(newUser)
  saveDatabase()
  return newUser
}

const authenticateLocalUser = async ({ email, password }) => {
  const db = await loadDatabase()
  if (!db) throw new Error('Database not available')

  const stored = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (!stored || !stored.isActive) {
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
    const user = await authenticateLocalUser({ email, password })
    setSessionUser(user)
    return { user }
  },
  signup: async (email, password, metadata = {}) => {
    const fullName = metadata.full_name || metadata.fullName || ''
    const user = await createLocalUser({ email, password, fullName })
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

// Entities methods - using local database
const entities = new Proxy({}, {
  get: (target, tableName) => ({
    filter: async (filters = {}, options = {}) => {
      const db = await loadDatabase()
      if (!db) throw new Error('Database not available')

      let items = db[tableName] || []

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          items = items.filter(item => value.includes(item[key]))
        } else if (typeof value === 'object' && value !== null) {
          if (value.gte !== undefined) items = items.filter(item => item[key] >= value.gte)
          if (value.lte !== undefined) items = items.filter(item => item[key] <= value.lte)
          if (value.gt !== undefined) items = items.filter(item => item[key] > value.gt)
          if (value.lt !== undefined) items = items.filter(item => item[key] < value.lt)
        } else {
          items = items.filter(item => item[key] === value)
        }
      })

      // Apply sorting
      if (options.orderBy) {
        items.sort((a, b) => {
          const aVal = a[options.orderBy]
          const bVal = b[options.orderBy]
          if (aVal < bVal) return options.ascending !== false ? -1 : 1
          if (aVal > bVal) return options.ascending !== false ? 1 : -1
          return 0
        })
      }

      // Apply pagination
      if (options.limit) {
        const offset = options.offset || 0
        items = items.slice(offset, offset + options.limit)
      }

      return items
    },
    get: async (id) => {
      const db = await loadDatabase()
      if (!db) throw new Error('Database not available')

      const items = db[tableName] || []
      const item = items.find(item => item.id === id)
      if (!item) throw new Error(`${tableName} not found`)
      return item
    },
    create: async (item) => {
      const db = await loadDatabase()
      if (!db) throw new Error('Database not available')

      if (!db[tableName]) db[tableName] = []

      const newItem = {
        ...item,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      db[tableName].push(newItem)
      saveDatabase()
      return newItem
    },
    update: async (id, updates) => {
      const db = await loadDatabase()
      if (!db) throw new Error('Database not available')

      const items = db[tableName] || []
      const index = items.findIndex(item => item.id === id)
      if (index === -1) throw new Error(`${tableName} not found`)

      const updatedItem = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      items[index] = updatedItem
      saveDatabase()
      return updatedItem
    },
    delete: async (id) => {
      const db = await loadDatabase()
      if (!db) throw new Error('Database not available')

      const items = db[tableName] || []
      const index = items.findIndex(item => item.id === id)
      if (index === -1) throw new Error(`${tableName} not found`)

      items.splice(index, 1)
      saveDatabase()
      return true
    },
  }),
})

// Integrations - call edge functions
const integrations = {
  Core: {
    UploadFile: async (file) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
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
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('integrations', {
        body: { action: 'chat', messages, ...options },
      })
      if (error) throw error
      return data
    },
    generateImage: async (prompt, options = {}) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('integrations', {
        body: { action: 'generateImage', prompt, ...options },
      })
      if (error) throw error
      return data
    },
  },
  External: {
    wikipedia: async (action, params) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'wikipedia', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    weather: async (action, params) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'weather', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    geo: async (action, params) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'geo', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    translation: async (action, params) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'translation', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    images: async (service, params) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'images', endpoint: service, ...params },
      })
      if (error) throw error
      return data
    },
    currency: async (action, params) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'currency', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
    travel: async (action, params) => {
      const client = supabase
      if (!client) throw new Error('Supabase client not configured')
      const { data, error } = await client.functions.invoke('external', {
        body: { service: 'travel', endpoint: action, ...params },
      })
      if (error) throw error
      return data
    },
  },
}

export { auth, entities, integrations }
export const db = { auth, entities, integrations }
export const base44 = db
export default db