// API Client for standard REST backend
// Replace the Backend URL in your environment or update the BASE_URL below

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * @param {string | null} token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getHeaders() {
    /** @type {{[key:string]: string}} */
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * @param {string} endpoint
   * @param {{ method?: string, headers?: Record<string, string>, body?: string }} options
   */
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        window.location.href = '/login';
      }

      if (response.status === 204) {
        return null;
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const error = data || {};
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) throw error;
      throw new Error('Unknown API error');
    }
  }

  // Auth endpoints
  auth = {
    /**
     * @param {string} email
     * @param {string} password
     */
    login: async (email, password) => {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const token = response?.token || response?.access_token || response?.session?.access_token || response?.data?.session?.access_token;
      if (token) {
        this.setToken(token);
      }
      return response;
    },

    /**
     * @param {string} email
     * @param {string} password
     * @param {string} fullName
     */
    signup: async (email, password, fullName) => {
      const response = await this.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const token = response?.token || response?.access_token || response?.session?.access_token || response?.data?.session?.access_token;
      if (token) {
        this.setToken(token);
      }
      return response;
    },

    logout: async () => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } catch (error) {
        if (error instanceof Error && !error.message.includes('404')) {
          console.warn('Logout endpoint failed:', error);
        }
      } finally {
        this.setToken(null);
      }
    },

    me: async () => {
      return this.request('/auth/me');
    },

    isAuthenticated: async () => {
      try {
        await this.auth.me();
        return true;
      } catch {
        return false;
      }
    },
  };

  // Generic entity methods
  entities = {
    /**
     * @param {string} entityName
     */
    get: (entityName) => ({
      /**
       * @param {string} [sort]
       * @param {number} [limit]
       */
      list: async (sort = '', limit = 100) => {
        return this.request(
          `/entities/${entityName}?sort=${sort}&limit=${limit}`
        );
      },

      /**
       * @param {Record<string, any>} [filters]
       * @param {string} [sort]
       * @param {number} [limit]
       */
      filter: async (filters = {}, sort = '', limit = 100) => {
        const params = new URLSearchParams();
        params.append('sort', sort);
        params.append('limit', String(limit));

        Object.entries(filters).forEach(([k, v]) => {
          const value = typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
          params.append(`filter_${k}`, value);
        });

        return this.request(`/entities/${entityName}?${params}`);
      },

      /**
       * @param {string} id
       */
      get: async (id) => {
        return this.request(`/entities/${entityName}/${id}`);
      },

      /**
       * @param {Record<string, any>} data
       */
      create: async (data) => {
        return this.request(`/entities/${entityName}`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },

      /**
       * @param {string} id
       * @param {Record<string, any>} data
       */
      update: async (id, data) => {
        return this.request(`/entities/${entityName}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },

      /**
       * @param {string} id
       */
      delete: async (id) => {
        return this.request(`/entities/${entityName}/${id}`, {
          method: 'DELETE',
        });
      },
    }),

    // Shortcut properties for common entities
    get Place() {
      return this.get('Place');
    },
    get User() {
      return this.get('User');
    },
    get Post() {
      return this.get('Post');
    },
    get Comment() {
      return this.get('Comment');
    },
    get ChatMessage() {
      return this.get('ChatMessage');
    },
    get Favorite() {
      return this.get('Favorite');
    },
    get PostLike() {
      return this.get('PostLike');
    },
    get PostComment() {
      return this.get('PostComment');
    },
    get Announcement() {
      return this.get('Announcement');
    },
    get Memory() {
      return this.get('Memory');
    },
    get FamilyTrip() {
      return this.get('FamilyTrip');
    },
    get Follow() {
      return this.get('Follow');
    },
    get Friendship() {
      return this.get('Friendship');
    },
    get SiteSettings() {
      return this.get('SiteSettings');
    },
    get UserProfile() {
      return this.get('UserProfile');
    },
  };

  users = {
    /**
     * @param {string} email
     * @param {string} [role]
     * @param {Record<string, any>} [metadata]
     */
    inviteUser: async (email, role = 'user', metadata = {}) => {
      return this.entities.User.create({ email, role, ...metadata });
    },
  };

  // Integration endpoints (AI, File Upload, etc.)
  integrations = {
    Core: {
      /**
       * @param {Record<string, any>} params
       */
      InvokeLLM: async (params) => {
        return this.request('/integrations/llm', {
          method: 'POST',
          body: JSON.stringify(params),
        });
      },

      /**
       * @param {Record<string, any>} params
       */
      GenerateImage: async (params) => {
        return this.request('/integrations/generate-image', {
          method: 'POST',
          body: JSON.stringify(params),
        });
      },

      /**
       * @param {{ file: File, folder?: string }} options
       */
      UploadFile: async ({ file, folder = 'uploads' }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch(`${BASE_URL}/integrations/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response.json();
      },
    },
  };
}

export const db = new APIClient();
export const apiClient = db;
export default db;
