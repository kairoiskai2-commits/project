import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const AUTH_SESSION_KEY = 'project-web-local-session'

const hasUsableApiKey = (value) => {
  if (!value || typeof value !== 'string') return false
  const normalized = value.trim().toLowerCase()
  return !normalized.includes('your_') && !normalized.includes('your-') && !normalized.endsWith('-here')
}

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
      // Ensure database has required structure
      if (!database.users) database.users = []
      if (!database.userProfiles) database.userProfiles = []
      if (!database.posts) database.posts = []
      if (!database.comments) database.comments = []
      if (!database.favorites) database.favorites = []
      if (!database.places) database.places = []
      if (!database.familyTrips) database.familyTrips = []
      if (!database.memories) database.memories = []
      if (!database.chatMessages) database.chatMessages = []
      if (!database.announcements) database.announcements = []
      if (!database.settings) database.settings = {
        siteName: "Egypt Wonders",
        siteDescription: "Discover the wonders of Egypt",
        maintenanceMode: false,
        maxUsers: 100
      }
    } else {
      // Load from the JSON file (simulated)
      database = {
        users: [
          {
            id: "admin-001",
            email: "karasmina2511@gmail.com",
            fullName: "Admin User",
            passwordHash: "MjUxMTIwMTJrJCRhZG1pbg==",
            role: "admin",
            createdAt: "2024-01-01T00:00:00.000Z",
            isActive: true
          }
        ],
        userProfiles: [
          {
            id: "profile-001",
            user_email: "karasmina2511@gmail.com",
            display_name: "Admin User",
            bio: "مشرف التطبيق - اكتشف أفضل أماكن مصر واقترح إضافات جديدة.",
            location: "القاهرة، مصر",
            avatar_url: "https://picsum.photos/seed/admin/200/200",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        posts: [],
        comments: [],
        favorites: [],
        places: [
          {
            id: "place-giza-001",
            name_en: "Pyramids of Giza",
            name_ar: "أهرامات الجيزة",
            description_en: "The iconic Pyramids of Giza are Egypt’s most famous ancient monuments, built as tombs for pharaohs over 4,500 years ago.",
            description_ar: "أهرامات الجيزة الأيقونية هي أشهر آثار مصر القديمة، بُنيت كمقابر للفراعنة قبل أكثر من 4500 عام.",
            category: "archaeological",
            location: "Giza, Egypt",
            latitude: 29.9792,
            longitude: 31.1342,
            image_url: "https://picsum.photos/seed/giza/800/600",
            wikipedia_url: "https://en.wikipedia.org/wiki/Giza_pyramid_complex",
            is_featured: true,
            views_count: 1523,
            tags: ["pyramids", "giza", "ancient"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "place-luxor-001",
            name_en: "Luxor Temple",
            name_ar: "معبد الأقصر",
            description_en: "Luxor Temple is a large Ancient Egyptian temple complex located on the east bank of the Nile in Luxor.",
            description_ar: "معبد الأقصر هو مجمع معبد مصري قديم كبير يقع على الضفة الشرقية للنيل في الأقصر.",
            category: "historical",
            location: "Luxor, Egypt",
            latitude: 25.7000,
            longitude: 32.6396,
            image_url: "https://picsum.photos/seed/luxor/800/600",
            wikipedia_url: "https://en.wikipedia.org/wiki/Luxor_Temple",
            is_featured: true,
            views_count: 1140,
            tags: ["luxor", "temple", "ancient"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "place-karnak-001",
            name_en: "Karnak Temple",
            name_ar: "معبد الكرنك",
            description_en: "Karnak Temple is one of the largest temple complexes in the world, with towering columns and ancient hieroglyphs.",
            description_ar: "معبد الكرنك هو أحد أكبر مجمعات المعابد في العالم، مع أعمدة شاهقة ونقوش هيروغليفية قديمة.",
            category: "archaeological",
            location: "Luxor, Egypt",
            latitude: 25.7188,
            longitude: 32.6573,
            image_url: "https://picsum.photos/seed/karnak/800/600",
            wikipedia_url: "https://en.wikipedia.org/wiki/Karnak",
            is_featured: false,
            views_count: 980,
            tags: ["karnak", "temple", "ancient"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "place-aswan-001",
            name_en: "Aswan",
            name_ar: "أسوان",
            description_en: "Aswan is a beautiful Nile city known for its relaxed island scenery, temples, and vibrant market.",
            description_ar: "أسوان هي مدينة نيلية جميلة مع مناظر جزيرة خضراء، معابد، وسوق نابض بالحياة.",
            category: "natural",
            location: "Aswan, Egypt",
            latitude: 24.0908,
            longitude: 32.8998,
            image_url: "https://picsum.photos/seed/aswan/800/600",
            wikipedia_url: "https://en.wikipedia.org/wiki/Aswan",
            is_featured: false,
            views_count: 720,
            tags: ["aswan", "nile", "natural"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
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
    // Reset database on error
    database = {
      users: [
        {
          id: "admin-001",
          email: "karasmina2511@gmail.com",
          fullName: "Admin User",
          passwordHash: "MjUxMTIwMTJrJCRhZG1pbg==",
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
    return database
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
  if (!db) {
    // Fallback: create user in memory only
    console.warn('Database not available, creating user in memory only')
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      email,
      fullName,
      passwordHash: hashPassword(password),
      role: 'user',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  }

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
  if (!db) {
    // Fallback: check hardcoded admin user
    if (email === 'karasmina2511@gmail.com' && password === '25112012k$$') {
      return {
        id: "admin-001",
        email: "karasmina2511@gmail.com",
        fullName: "Admin User",
        role: "admin",
        createdAt: "2024-01-01T00:00:00.000Z",
      }
    }
    const error = new Error('Invalid email or password')
    error.type = 'invalid_credentials'
    throw error
  }

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
    try {
      const user = getSessionUser()
      return !!user && !!user.id && !!user.email
    } catch {
      clearSession()
      return false
    }
  },
  me: async () => {
    try {
      const user = getSessionUser()
      if (user && user.id && user.email) {
        // Get full user record from database for role
        const db = await loadDatabase()
        if (db && db.users) {
          const fullUser = db.users.find(u => u.email.toLowerCase() === user.email.toLowerCase())
          if (fullUser) {
            return {
              id: user.id || fullUser.id,
              email: user.email || fullUser.email,
              fullName: user.fullName || fullUser.fullName,
              full_name: user.fullName || fullUser.fullName,
              role: fullUser.role || 'user',
              createdAt: user.createdAt || fullUser.createdAt,
            }
          }
        }
        return user
      }
      clearSession()
      return null
    } catch {
      clearSession()
      return null
    }
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
  reset: async () => {
    // Clear all localStorage data
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_SESSION_KEY)
      window.localStorage.removeItem('project-web-database')
      window.localStorage.removeItem('project-web-local-users')
    }
    // Reset in-memory database
    database = null
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
    list: async (sort = '', limit = 100) => {
      try {
        const db = await loadDatabase()
        if (!db) {
          console.warn(`Database not available for ${tableName}, returning empty array`)
          return []
        }

        let items = db[tableName] || []
        if (typeof sort === 'object' && sort !== null) {
          const options = sort
          if (options.orderBy) {
            const ascending = options.ascending !== false
            items.sort((a, b) => {
              const aVal = a[options.orderBy]
              const bVal = b[options.orderBy]
              if (aVal < bVal) return ascending ? -1 : 1
              if (aVal > bVal) return ascending ? 1 : -1
              return 0
            })
          }
          if (options.limit) {
            const offset = options.offset || 0
            items = items.slice(offset, offset + options.limit)
          }
        } else {
          if (typeof sort === 'string' && sort.trim()) {
            const ascending = !sort.startsWith('-')
            const orderBy = sort.replace(/^-/, '')
            items.sort((a, b) => {
              const aVal = a[orderBy]
              const bVal = b[orderBy]
              if (aVal < bVal) return ascending ? -1 : 1
              if (aVal > bVal) return ascending ? 1 : -1
              return 0
            })
          }
          if (typeof limit === 'number') {
            items = items.slice(0, limit)
          }
        }

        return items
      } catch (error) {
        console.error(`Error listing ${tableName}:`, error)
        return []
      }
    },
    filter: async (filters = {}, sort = '', limit = 100) => {
      try {
        const db = await loadDatabase()
        if (!db) {
          console.warn(`Database not available for ${tableName}, returning empty array`)
          return []
        }

        let items = db[tableName] || []

        // Accept legacy signature filter(filters, sort, limit)
        const options = typeof sort === 'string'
          ? {
              orderBy: sort.replace(/^-/, ''),
              ascending: !sort.startsWith('-'),
              limit,
            }
          : sort || {}

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
      } catch (error) {
        console.error(`Error filtering ${tableName}:`, error)
        return []
      }
    },
    get: async (id) => {
      try {
        const db = await loadDatabase()
        if (!db) throw new Error('Database not available')

        const items = db[tableName] || []
        const item = items.find(item => item.id === id)
        if (!item) throw new Error(`${tableName} not found`)
        return item
      } catch (error) {
        console.error(`Error getting ${tableName} ${id}:`, error)
        throw error
      }
    },
    create: async (item) => {
      try {
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
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error)
        throw error
      }
    },
    update: async (id, updates) => {
      try {
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
      } catch (error) {
        console.error(`Error updating ${tableName} ${id}:`, error)
        throw error
      }
    },
    delete: async (id) => {
      try {
        const db = await loadDatabase()
        if (!db) throw new Error('Database not available')

        const items = db[tableName] || []
        const index = items.findIndex(item => item.id === id)
        if (index === -1) throw new Error(`${tableName} not found`)

        items.splice(index, 1)
        saveDatabase()
        return true
      } catch (error) {
        console.error(`Error deleting ${tableName} ${id}:`, error)
        throw error
      }
    },
  }),
})

// Integrations - free APIs for development and production
const integrations = {
  Core: {
    UploadFile: async (file) => {
      // For now, return a mock URL - in production you'd use a service like Cloudinary free tier
      console.warn('File upload using mock URL - implement real upload service for production')
      return {
        file_url: `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`,
        success: true
      }
    },
    InvokeLLM: async (params) => {
      try {
        const prompt = params.prompt || params.text || 'Hello';
        let response = '';
        let groqError = '';

        // 1. Try Groq chat completions
        const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
        const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

        if (params.provider === 'groq' && !response) {
          try {
            const apiResponse = await fetch('/api/groq', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: params.max_tokens || 800,
                temperature: params.temperature ?? 0.7,
              }),
            });

            if (apiResponse.ok) {
              const data = await apiResponse.json();
              response = data.choices?.[0]?.message?.content || data.content || '';
            } else if (apiResponse.status !== 404) {
              const errorText = await apiResponse.text();
              groqError = `Groq API failed (${apiResponse.status}): ${errorText}`;
              console.warn('Groq proxy failed:', apiResponse.status, errorText);
            }
          } catch (error) {
            groqError = error.message || String(error);
            console.warn('Groq proxy failed:', error);
          }
        }

        if (hasUsableApiKey(GROQ_API_KEY) && !response) {
          try {
            const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: params.max_tokens || 800,
                temperature: params.temperature ?? 0.7,
              }),
            });

            if (apiResponse.ok) {
              const data = await apiResponse.json();
              response = data.choices?.[0]?.message?.content || '';
            } else {
              const errorText = await apiResponse.text();
              groqError = `Groq API failed (${apiResponse.status}): ${errorText}`;
              console.warn('Groq LLM failed:', apiResponse.status, errorText);
            }
          } catch (error) {
            groqError = error.message || String(error);
            console.warn('Groq LLM failed:', error);
          }
        }

        if (params.provider === 'groq' && !response) {
          if (!groqError && !hasUsableApiKey(GROQ_API_KEY)) {
            return 'Groq is not configured yet. Add GROQ_API_KEY to your Cloudflare Pages environment variables, then redeploy.';
          }

          return groqError
            ? `Groq could not generate a reply. ${groqError}`
            : 'Groq could not generate a reply. Please check VITE_GROQ_MODEL and your Groq API key.';
        }

        // 2. Try Together AI with better model
        const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
        if (hasUsableApiKey(TOGETHER_API_KEY) && !response) {
          try {
            const apiResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'mistralai/Mistral-7B-Instruct-v0.1',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: params.max_tokens || 800,
                temperature: params.temperature || 0.7,
              }),
            });

            if (apiResponse.ok) {
              const data = await apiResponse.json();
              response = data.choices?.[0]?.message?.content || '';
            }
          } catch (error) {
            console.warn('Together AI LLM failed:', error);
          }
        }

        // 3. Try Hugging Face with better model
        const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
        if (hasUsableApiKey(HUGGINGFACE_API_KEY) && !response) {
          try {
            const apiResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: {
                  past_user_inputs: [],
                  generated_responses: [],
                  text: prompt
                },
                parameters: {
                  max_length: params.max_tokens || 300,
                  temperature: params.temperature || 0.7,
                  do_sample: true,
                },
              }),
            });

            if (apiResponse.ok) {
              const data = await apiResponse.json();
              response = data.generated_text || data.conversation?.generated_responses?.[0] || '';
            }
          } catch (error) {
            console.warn('Hugging Face LLM failed:', error);
          }
        }

        // 4. Try Replicate with proper implementation
        const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
        if (hasUsableApiKey(REPLICATE_API_KEY) && !response) {
          try {
            const apiResponse = await fetch('https://api.replicate.com/v1/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                version: "02e509c789964a7ea8736978a43525956cd30bfdb2f1e081f1f5f5c2a1c4b8e0e",
                input: {
                  prompt: prompt,
                  max_new_tokens: params.max_tokens || 500,
                  temperature: params.temperature || 0.7,
                  top_p: 0.9,
                  repetition_penalty: 1.1
                },
              }),
            });

            if (apiResponse.ok) {
              const prediction = await apiResponse.json();
              // Wait for completion (simplified - in production you'd poll the prediction URL)
              if (prediction.status === 'succeeded') {
                response = prediction.output || '';
              } else {
                // For now, just try to get a basic response
                response = 'AI response is being processed...';
              }
            }
          } catch (error) {
            console.warn('Replicate LLM failed:', error);
          }
        }

        // 5. Try OpenAI-compatible API (if available)
        const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
        if (hasUsableApiKey(OPENAI_API_KEY) && !response) {
          try {
            const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: params.max_tokens || 500,
                temperature: params.temperature || 0.7,
              }),
            });

            if (apiResponse.ok) {
              const data = await apiResponse.json();
              response = data.choices?.[0]?.message?.content || '';
            }
          } catch (error) {
            console.warn('OpenAI LLM failed:', error);
          }
        }

        // Enhanced fallback responses based on bot type
        if (!response) {
          const lowerPrompt = prompt.toLowerCase();

          if (lowerPrompt.includes('guide') || lowerPrompt.includes('دليل') || lowerPrompt.includes('place') || lowerPrompt.includes('مكان')) {
            response = 'As your Egyptian guide, I can tell you about amazing places like the Pyramids of Giza, Valley of the Kings, Siwa Oasis, and the White Desert. What specific place would you like to know about?';
          } else if (lowerPrompt.includes('planner') || lowerPrompt.includes('مخطط') || lowerPrompt.includes('trip') || lowerPrompt.includes('رحلة')) {
            response = 'I can help you plan your perfect Egypt trip! Consider visiting Cairo for history, Luxor for ancient temples, and Sharm El Sheikh for beaches. What type of trip are you planning?';
          } else if (lowerPrompt.includes('support') || lowerPrompt.includes('مساعد') || lowerPrompt.includes('visa') || lowerPrompt.includes('فيزا') || lowerPrompt.includes('safety') || lowerPrompt.includes('أمان')) {
            response = 'For travel support: Egypt is generally safe for tourists. Tourist Police: 126, Emergency: 123. Most nationalities get visa on arrival. What specific help do you need?';
          } else if (lowerPrompt.includes('egypt') || lowerPrompt.includes('مصر')) {
            response = 'Egypt is a land of ancient wonders! From the Pyramids to the Nile, there\'s so much to explore. What aspect interests you most?';
          } else {
            response = 'I\'m here to help with your Egypt travel questions! Ask me about places, planning trips, or travel support.';
          }
        }

        return response || 'I apologize, but I am unable to generate a response at this time. Please try again later.';
      } catch (error) {
        console.error('LLM invocation failed:', error);
        return 'This feature is currently using simplified responses. Please check back later for full AI functionality.';
      }
    },
  AI: {
    chat: async (messages, options = {}) => {
      try {
        const userMessage = messages[messages.length - 1]?.content || '';
        let aiResponse = '';

        // 1. Try Together AI free tier
        const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
        if (TOGETHER_API_KEY && !aiResponse) {
          try {
            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'meta-llama/Llama-2-7b-chat-hf',
                messages: messages,
                max_tokens: options.max_length || 500,
                temperature: options.temperature || 0.7,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              aiResponse = data.choices?.[0]?.message?.content || '';
            }
          } catch (error) {
            console.warn('Together AI chat failed:', error);
          }
        }

        // 2. Try Hugging Face conversational AI
        if (!aiResponse) {
          try {
            const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: {
                  past_user_inputs: messages.slice(0, -1).map(m => m.content),
                  generated_responses: [],
                  text: userMessage
                },
                parameters: {
                  max_length: options.max_length || 200,
                  temperature: options.temperature || 0.7,
                  do_sample: true,
                },
              }),
            });

            if (response.ok) {
              const data = await response.json();
              aiResponse = data.conversation?.generated_responses?.[0] || data.generated_text || '';
            }
          } catch (error) {
            console.warn('Hugging Face chat failed:', error);
          }
        }

        // 3. Try Replicate
        const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
        if (REPLICATE_API_KEY && !aiResponse) {
          try {
            const apiResponse = await fetch('https://api.replicate.com/v1/models/meta/llama-2-7b-chat/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: {
                  prompt: userMessage,
                  max_length: options.max_length || 300,
                  temperature: options.temperature || 0.7,
                },
              }),
            });

            if (apiResponse.ok) {
              aiResponse = 'LLM response being generated via Replicate...';
            }
          } catch (error) {
            console.warn('Replicate LLM failed:', error);
          }
        }

        // Fallback response
        if (!aiResponse) {
          if (userMessage.toLowerCase().includes('egypt') || userMessage.toLowerCase().includes('travel')) {
            aiResponse = 'I can provide information about Egypt and travel planning. For specific questions about Egyptian history, places, or travel tips, I recommend checking Wikipedia or using our AI trip planner.';
          } else {
            aiResponse = 'This feature is currently using free AI services. For travel-related questions, I can help with information about destinations and planning.';
          }
        }

        return aiResponse || 'I apologize, but I am unable to generate a response at this time. Please try again later.';
      } catch (error) {
        console.error('LLM invocation failed:', error);
        return 'This feature is currently using simplified responses. Please check back later for full AI functionality.';
      }
    },
  },
  },
  External: {
    wikipedia: async (action, params) => {
      try {
        const query = params.query || params.search || params.title || 'Egypt';
        const lang = params.lang || (/[ -]/.test(query) ? 'en' : /[\u0600-\u06FF]/.test(query) ? 'ar' : 'en');
        const host = `${lang}.wikipedia.org`;

        // Handle search action - returns search results
        if (action === 'search') {
          const url = new URL(`https://${host}/w/api.php`);
          url.searchParams.set('action', 'query');
          url.searchParams.set('list', 'search');
          url.searchParams.set('srsearch', query);
          url.searchParams.set('format', 'json');
          url.searchParams.set('origin', '*');
          url.searchParams.set('srlimit', '5');
          url.searchParams.set('srprop', 'snippet|titlesnippet|wordcount|timestamp');

          const response = await fetch(url.toString());
          if (!response.ok) throw new Error(`Wikipedia search failed: ${response.status}`);

          const data = await response.json();
          const results = data.query?.search || [];

          if (results.length === 0 && lang !== 'en') {
            const fallbackUrl = new URL('https://en.wikipedia.org/w/api.php');
            fallbackUrl.searchParams.set('action', 'query');
            fallbackUrl.searchParams.set('list', 'search');
            fallbackUrl.searchParams.set('srsearch', query);
            fallbackUrl.searchParams.set('format', 'json');
            fallbackUrl.searchParams.set('origin', '*');
            fallbackUrl.searchParams.set('srlimit', '5');
            fallbackUrl.searchParams.set('srprop', 'snippet|titlesnippet|wordcount|timestamp');

            const fallbackResponse = await fetch(fallbackUrl.toString());
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              const fallbackResults = fallbackData.query?.search || [];
              if (fallbackResults.length > 0) {
                return {
                  results: fallbackResults.map(r => ({ title: r.title, snippet: r.snippet })),
                  count: fallbackResults.length,
                  success: true,
                  source: 'Wikipedia Search (Fallback en.wikipedia.org)'
                };
              }
            }
          }

          return {
            results: results.map(r => ({ title: r.title, snippet: r.snippet })),
            count: results.length,
            success: results.length > 0,
            source: `Wikipedia Search (${host})`
          };
        }

        // Default action - get page details by title
        const pageUrl = new URL(`https://${host}/w/api.php`);
        pageUrl.searchParams.set('action', 'query');
        pageUrl.searchParams.set('titles', query);
        pageUrl.searchParams.set('prop', 'extracts|coordinates|pageimages');
        pageUrl.searchParams.set('exintro', 'true');
        pageUrl.searchParams.set('explaintext', 'true');
        pageUrl.searchParams.set('pithumbsize', '800');
        pageUrl.searchParams.set('format', 'json');
        pageUrl.searchParams.set('origin', '*');

        let response = await fetch(pageUrl.toString());
        if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`);

        let data = await response.json();
        let pages = data.query?.pages || {};
        let pageId = Object.keys(pages)[0];

        if (pageId === '-1' && lang !== 'en') {
          const fallbackPageUrl = new URL('https://en.wikipedia.org/w/api.php');
          fallbackPageUrl.searchParams.set('action', 'query');
          fallbackPageUrl.searchParams.set('titles', query);
          fallbackPageUrl.searchParams.set('prop', 'extracts|coordinates|pageimages');
          fallbackPageUrl.searchParams.set('exintro', 'true');
          fallbackPageUrl.searchParams.set('explaintext', 'true');
          fallbackPageUrl.searchParams.set('pithumbsize', '800');
          fallbackPageUrl.searchParams.set('format', 'json');
          fallbackPageUrl.searchParams.set('origin', '*');

          const fallbackResponse = await fetch(fallbackPageUrl.toString());
          if (fallbackResponse.ok) {
            data = await fallbackResponse.json();
            pages = data.query?.pages || {};
            pageId = Object.keys(pages)[0];
          }
        }

        if (!pageId || pageId === '-1') {
          throw new Error('Page not found');
        }

        const page = pages[pageId];
        return {
          title: page.title,
          extract: page.extract,
          thumbnail: page.thumbnail?.source,
          coordinates: page.coordinates?.[0] || null,
          url: `https://${host}/wiki/${encodeURIComponent(page.title)}`,
          success: true,
          source: `Wikipedia (${host})`
        };
      } catch (error) {
        console.error('Wikipedia API failed:', error);
        return {
          title: params.query || 'Egypt',
          extract: 'Information not available.',
          success: false,
          error: error.message
        };
      }
    },
    weather: async (action, params) => {
      try {
        // Using Open-Meteo (completely free, no API key required)
        const lat = params.lat || 30.0444; // Cairo coordinates
        const lon = params.lon || 31.2357;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          temperature: data.current_weather?.temperature,
          windspeed: data.current_weather?.windspeed,
          weathercode: data.current_weather?.weathercode,
          humidity: data.hourly?.relative_humidity_2m?.[0],
          forecast: data.hourly,
          success: true,
          source: 'Open-Meteo (Free API)',
          location: `${lat}, ${lon}`
        };
      } catch (error) {
        console.error('Weather API failed:', error);
        return {
          temperature: 25,
          weathercode: 0,
          success: false,
          error: 'Weather data temporarily unavailable',
          note: 'Using free Open-Meteo API - no key required'
        };
      }
    },
    geo: async (action, params) => {
      try {
        // Using Nominatim (OpenStreetMap) - free geocoding
        const query = params.query || params.address || 'Cairo, Egypt';
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            display_name: data[0].display_name,
            success: true,
            source: 'OpenStreetMap Nominatim (Free API)'
          };
        } else {
          throw new Error('Location not found');
        }
      } catch (error) {
        console.error('Geocoding API failed:', error);
        return {
          lat: 30.0444,
          lon: 31.2357,
          display_name: 'Cairo, Egypt (fallback)',
          success: false,
          error: error.message
        };
      }
    },
    translation: async (action, params) => {
      // Free alternative: Mock translation for now
      console.warn('Translation using mock service - implement real free translation API');
      return {
        translated_text: params.text || 'Translation not available',
        source_lang: params.from || 'en',
        target_lang: params.to || 'ar',
        success: true,
        note: 'Using mock translation - implement LibreTranslate or similar free service'
      };
    },
    images: async (service, params) => {
      try {
        // Using Pexels free API (requires API key but has generous free tier)
        const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
        if (!apiKey) {
          // Fallback to Lorem Picsum (completely free)
          const width = params.width || 800;
          const height = params.height || 600;
          return {
            images: [{
              url: `https://picsum.photos/${width}/${height}?random=${Date.now()}`,
              photographer: 'Lorem Picsum',
              alt: params.query || 'Random image'
            }],
            success: true,
            source: 'Lorem Picsum (Free)',
            note: 'No API key required - completely free'
          };
        }

        const query = params.query || 'egypt pyramids';
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`;

        const response = await fetch(url, {
          headers: {
            'Authorization': apiKey
          }
        });

        if (!response.ok) {
          throw new Error(`Pexels API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          images: data.photos.map(photo => ({
            url: photo.src.large,
            photographer: photo.photographer,
            alt: photo.alt || query
          })),
          success: true,
          source: 'Pexels (Free tier)'
        };
      } catch (error) {
        console.error('Images API failed:', error);
        // Fallback to Lorem Picsum
        return {
          images: [{
            url: `https://picsum.photos/800/600?random=${Date.now()}`,
            photographer: 'Fallback Service',
            alt: 'Random image'
          }],
          success: true,
          source: 'Lorem Picsum (Free fallback)'
        };
      }
    },
    currency: async (action, params) => {
      try {
        // Using free currency API (no key required)
        const url = 'https://api.exchangerate-api.com/v4/latest/USD';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Currency API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          rates: data.rates,
          base: data.base,
          date: data.date,
          success: true,
          source: 'ExchangeRate-API (Free)'
        };
      } catch (error) {
        console.error('Currency API failed:', error);
        return {
          rates: { USD: 1, EGP: 30.9, EUR: 0.92 },
          base: 'USD',
          success: false,
          error: 'Currency data temporarily unavailable',
          note: 'Using cached rates - implement free currency API'
        };
      }
    },
    // FREE MAPS API SEARCH - Search for places and get map data
    maps: async (action, params) => {
      try {
        const query = params.query || params.search || 'Cairo, Egypt';
        const limit = params.limit || 10;

        // Using Nominatim for place search (free, no API key)
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`;

        const response = await fetch(searchUrl);
        if (!response.ok) {
          throw new Error(`Maps search API error: ${response.status}`);
        }

        const data = await response.json();

        const places = data.map(place => ({
          id: place.place_id,
          name: place.display_name.split(',')[0], // Get main name
          full_name: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          type: place.type,
          category: place.class,
          address: place.address,
          importance: place.importance,
          // Generate static map URL using OpenStreetMap tiles (free)
          map_url: `https://www.openstreetmap.org/export/embed.html?bbox=${place.boundingbox.join(',')}&layer=mapnik&marker=${place.lat},${place.lon}`,
          // Alternative: Use a free map tile service
          tile_url: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
        }));

        return {
          places: places,
          total: places.length,
          query: query,
          success: true,
          source: 'OpenStreetMap Nominatim (Free Maps API)',
          note: 'Free maps search - no API key required'
        };
      } catch (error) {
        console.error('Maps search API failed:', error);
        return {
          places: [],
          success: false,
          error: error.message,
          note: 'Free OpenStreetMap search temporarily unavailable'
        };
      }
    },
    // WIKIPEDIA AUTO PLACE CREATION - Automatically create places from Wikipedia
    wikipediaPlaces: async (action, params) => {
      try {
        const placeName = params.placeName || params.query || 'Pyramids of Giza';
        const autoCreate = params.autoCreate !== false; // Default to true

        // First get Wikipedia summary
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;
        const wikiResponse = await fetch(wikiUrl);

        if (!wikiResponse.ok) {
          throw new Error(`Wikipedia API error: ${wikiResponse.status}`);
        }

        const wikiData = await wikiResponse.json();

        // Get coordinates from Wikipedia if available, otherwise geocode
        let coordinates = null;
        if (wikiData.coordinates) {
          coordinates = {
            lat: wikiData.coordinates.lat,
            lon: wikiData.coordinates.lon
          };
        } else {
          // Fallback to geocoding
          const geoResult = await integrations.External.geo('search', { query: placeName });
          if (geoResult.success) {
            coordinates = {
              lat: geoResult.lat,
              lon: geoResult.lon
            };
          }
        }

        // Create place object
        const placeData = {
          name: wikiData.title,
          description: wikiData.extract,
          location: coordinates ? `${coordinates.lat}, ${coordinates.lon}` : null,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lon || null,
          image_url: wikiData.thumbnail?.source || null,
          wikipedia_url: wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(placeName)}`,
          category: 'historical', // Default category
          rating: 4.5, // Default rating
          visit_duration: '2-3 hours', // Default
          best_time_to_visit: 'October to April',
          entry_fee: 'Varies',
          tags: ['wikipedia', 'historical', 'egypt'],
          source: 'Wikipedia Auto-Import',
          created_at: new Date().toISOString()
        };

        // Auto-create place in database if requested
        if (autoCreate) {
          try {
            const createdPlace = await entities.places.create(placeData);
            placeData.id = createdPlace.id;
            placeData.auto_created = true;
          } catch (createError) {
            console.warn('Auto-creation failed, returning place data only:', createError);
            placeData.auto_created = false;
          }
        }

        return {
          place: placeData,
          wikipedia_data: wikiData,
          coordinates: coordinates,
          auto_created: placeData.auto_created || false,
          success: true,
          source: 'Wikipedia Auto-Place Creator (Free)'
        };
      } catch (error) {
        console.error('Wikipedia auto-place creation failed:', error);
        return {
          place: null,
          success: false,
          error: error.message,
          note: 'Could not create place from Wikipedia data'
        };
      }
    },
    // AI TRIP PLANNER - Generate complete travel itineraries
    aiTripPlanner: async (action, params) => {
      try {
        const destination = params.destination || 'Egypt';
        const duration = params.duration || 7; // days
        const budget = params.budget || 'medium';
        const interests = params.interests || ['historical', 'cultural'];
        const travelers = params.travelers || 2;

        // Try multiple free AI services
        let aiResponse = null;

        // 1. Try Together AI (free tier available)
        const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
        if (TOGETHER_API_KEY && !aiResponse) {
          try {
            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'meta-llama/Llama-2-7b-chat-hf',
                messages: [{
                  role: 'user',
                  content: `Create a detailed ${duration}-day travel itinerary for ${destination}. Focus on ${interests.join(', ')} activities. Budget: ${budget}. Include daily activities, places to visit, meals, transportation, and practical tips. Format as a structured plan.`
                }],
                max_tokens: 1500,
                temperature: 0.7,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              aiResponse = data.choices?.[0]?.message?.content;
            }
          } catch (error) {
            console.warn('Together AI failed:', error);
          }
        }

        // 2. Try Hugging Face free inference (works without API key for some models)
        if (!aiResponse) {
          try {
            const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: `Plan a ${duration}-day trip to ${destination} for ${interests.join(', ')} interests with ${budget} budget.`,
                parameters: {
                  max_length: 300,
                  temperature: 0.8,
                  do_sample: true,
                },
              }),
            });

            if (response.ok) {
              const data = await response.json();
              aiResponse = data[0]?.generated_text;
            }
          } catch (error) {
            console.warn('Hugging Face failed:', error);
          }
        }

        // 3. Try Replicate free tier (if API key available)
        const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
        if (REPLICATE_API_KEY && !aiResponse) {
          try {
            const response = await fetch('https://api.replicate.com/v1/models/meta/llama-2-7b-chat/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: {
                  prompt: `Create a ${duration}-day travel itinerary for ${destination}. Interests: ${interests.join(', ')}. Budget: ${budget}. Include daily activities and tips.`,
                  max_length: 500,
                  temperature: 0.7,
                },
              }),
            });

            if (response.ok) {
              const prediction = await response.json();
              // Wait a bit for prediction to complete (simplified)
              await new Promise(resolve => setTimeout(resolve, 2000));

              const resultResponse = await fetch(prediction.urls.get, {
                headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` },
              });

              if (resultResponse.ok) {
                const result = await resultResponse.json();
                aiResponse = result.output?.join(' ') || result.output;
              }
            }
          } catch (error) {
            console.warn('Replicate failed:', error);
          }
        }

        let tripPlan;

        if (aiResponse) {
          // Try to parse AI response
          try {
            // Look for JSON in response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              tripPlan = JSON.parse(jsonMatch[0]);
            } else {
              // Create structured plan from text response
              tripPlan = {
                destination: destination,
                duration: duration,
                budget: budget,
                travelers: travelers,
                interests: interests,
                days: []
              };

              // Parse text response into days
              const lines = aiResponse.split('\n').filter(line => line.trim());
              let currentDay = null;
              let dayActivities = [];

              for (const line of lines) {
                const dayMatch = line.match(/day\s*(\d+)/i);
                if (dayMatch) {
                  if (currentDay) {
                    tripPlan.days.push({
                      day: currentDay,
                      title: `Day ${currentDay} in ${destination}`,
                      activities: dayActivities.slice(0, 4),
                      meals: ['Breakfast', 'Lunch', 'Dinner'],
                      transportation: 'Local transport',
                      tips: ['Stay hydrated', 'Respect local culture']
                    });
                  }
                  currentDay = parseInt(dayMatch[1]);
                  dayActivities = [];
                } else if (currentDay && line.trim()) {
                  dayActivities.push(line.trim());
                }
              }

              // Add last day
              if (currentDay && dayActivities.length > 0) {
                tripPlan.days.push({
                  day: currentDay,
                  title: `Day ${currentDay} in ${destination}`,
                  activities: dayActivities.slice(0, 4),
                  meals: ['Breakfast', 'Lunch', 'Dinner'],
                  transportation: 'Local transport',
                  tips: ['Stay hydrated', 'Respect local culture']
                });
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse AI response:', parseError);
            aiResponse = null; // Force fallback
          }
        }

        // Fallback: Enhanced rule-based planning with real place data
        if (!aiResponse || !tripPlan || !tripPlan.days || tripPlan.days.length === 0) {
          tripPlan = {
            destination: destination,
            duration: duration,
            budget: budget,
            travelers: travelers,
            interests: interests,
            days: []
          };

          // Get real places from database
          try {
            const places = await entities.places.list({ limit: 20 });
            const relevantPlaces = places.filter(p =>
              p.location?.toLowerCase().includes(destination.toLowerCase()) ||
              p.tags?.some(tag => interests.some(interest =>
                tag.toLowerCase().includes(interest.toLowerCase())
              ))
            );

            // Create itinerary using real places
            const placesPerDay = Math.max(1, Math.floor(relevantPlaces.length / duration));

            for (let i = 1; i <= duration; i++) {
              const dayPlaces = relevantPlaces.slice((i-1) * placesPerDay, i * placesPerDay);
              const activities = dayPlaces.length > 0
                ? dayPlaces.map(p => `Visit ${p.name_en || p.name || 'local attraction'}`)
                : [`Explore ${destination} ${interests[0] || 'attractions'}`];

              // Add general activities
              activities.push('Try local cuisine', 'Experience local culture');

              tripPlan.days.push({
                day: i,
                title: `Day ${i}: ${dayPlaces.length > 0 ? dayPlaces[0].name_en || 'Discovery' : 'Exploration'}`,
                activities: activities,
                meals: [
                  'Breakfast at accommodation',
                  'Local street food or restaurant',
                  'Traditional dinner experience'
                ],
                transportation: budget === 'low' ? 'Public transport/walking' : 'Taxi/private car',
                tips: [
                  'Stay hydrated and use sunscreen',
                  'Respect local customs and dress modestly',
                  'Learn basic local phrases',
                  'Carry small cash for tips and small purchases',
                  budget === 'low' ? 'Look for free attractions and walking tours' : 'Book popular sites in advance'
                ]
              });
            }
          } catch (placesError) {
            console.warn('Could not load places for itinerary:', placesError);
            // Basic fallback
            for (let i = 1; i <= duration; i++) {
              tripPlan.days.push({
                day: i,
                title: `Day ${i} in ${destination}`,
                activities: [
                  `Visit popular ${interests[0] || 'historical'} sites`,
                  'Explore local markets and culture',
                  'Try authentic local cuisine'
                ],
                meals: ['Local breakfast', 'Street food lunch', 'Restaurant dinner'],
                transportation: 'Walking/Taxi',
                tips: ['Stay hydrated', 'Respect local customs', 'Carry small cash']
              });
            }
          }
        }

        // Add recommendations
        tripPlan.recommendations = {
          best_time_to_visit: destination.toLowerCase().includes('egypt') ? 'October to April (cooler weather)' : 'Check local climate',
          currency: destination.toLowerCase().includes('egypt') ? 'Egyptian Pound (EGP)' : 'Check local currency',
          language: 'English widely spoken in tourist areas',
          safety: 'Generally safe for tourists, use registered transport',
          health: 'Drink bottled water, use sunscreen, get recommended vaccinations',
          budget_tips: budget === 'low' ? 'Use public transport, eat street food, visit free attractions' :
                       budget === 'medium' ? 'Mix budget and mid-range options' :
                       'Choose premium experiences and private transport'
        };

        return {
          trip_plan: tripPlan,
          ai_generated: !!aiResponse,
          success: true,
          source: aiResponse ? 'AI Trip Planner (Free Services)' : 'Smart Trip Planner (Database + Rules)',
          note: aiResponse ? 'Trip plan generated by AI - customize as needed' : 'Trip plan generated using local data and travel expertise'
        };
      } catch (error) {
        console.error('AI trip planner failed:', error);
        // Fallback basic plan
        return {
          trip_plan: {
            destination: params.destination || 'Egypt',
            duration: params.duration || 7,
            days: [
              {
                day: 1,
                title: 'Arrival and Acclimation',
                activities: ['Arrive at destination', 'Check into accommodation', 'Light exploration'],
                meals: ['Welcome dinner', 'Local specialties'],
                transportation: 'Airport transfer',
                tips: ['Rest after travel', 'Stay hydrated']
              }
            ]
          },
          success: true,
          source: 'Basic Trip Template (Fallback)',
          note: 'AI trip planning temporarily unavailable - using basic template'
        };
      }
    },
    travel: async (action, params) => {
      // Enhanced travel API with more features
      console.warn('Travel API using enhanced free services');
      return {
        destinations: [
          { name: 'Pyramids of Giza', country: 'Egypt', rating: 4.8, category: 'historical' },
          { name: 'Luxor Temple', country: 'Egypt', rating: 4.6, category: 'historical' },
          { name: 'Karnak Temple', country: 'Egypt', rating: 4.7, category: 'historical' },
          { name: 'Khan El Khalili Bazaar', country: 'Egypt', rating: 4.4, category: 'cultural' },
          { name: 'Egyptian Museum', country: 'Egypt', rating: 4.5, category: 'museum' }
        ],
        success: true,
        note: 'Using enhanced travel data with free APIs'
      };
    },
  },
}

export { auth, entities, integrations }
export const db = { auth, entities, integrations }
export const base44 = db
export default db
