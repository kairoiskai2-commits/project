# Migration Guide: Base44 to Standard Web App

This guide explains the changes made to your application and what you need to do next.

## ✅ What Has Been Changed

### 1. **Removed Base44 Dependencies**
- ❌ Removed `@base44/sdk` 
- ❌ Removed `@base44/vite-plugin`
- ✅ Clean dependencies - only standard web dev tools

### 2. **New API Client** (`src/api/apiClient.js`)
**Old Code:**
```javascript
import db from '@base44/sdk'
const places = await db.entities.Place.list()
```

**New Code:**
```javascript
import { db } from '@/api/apiClient'
const places = await db.entities.Place.list()
```

The new API client is compatible with the old interface but works with any REST backend.

### 3. **Authentication System**
**Old:** Base44 handled auth automatically  
**New:** JWT-based authentication with login/signup pages

New files:
- `src/pages/Login.jsx` - User login page
- `src/pages/Signup.jsx` - User signup page
- Updated `src/lib/AuthContext.jsx` - JWT token management

### 4. **Updated Routing**
- Login route: `/login`
- Signup route: `/signup`
- All other routes are protected (require login)
- Unauthenticated users are redirected to login

### 5. **Configuration Files**
- `vite.config.js` - Removed base44 plugin, added path alias
- `package.json` - Updated name, removed base44 packages
- `index.html` - Updated title, removed base44 references
- `.env.example` - Added environment template

## 🔧 Next Steps

### Step 1: Choose Your Backend

You need to implement a backend API. Options:

#### **Option A: Supabase (Easiest)**
- PostgreSQL database included
- Built-in authentication
- File storage
- Real-time features
- [Supabase Guide](./BACKEND_SETUP.md#supabase)

#### **Option B: Firebase (Google's Solution)**
- Firestore database
- Firebase Auth
- Cloud Storage
- Cloud Functions for logic
- [Firebase Guide](./BACKEND_SETUP.md#firebase)

#### **Option C: Node.js/Express (Most Control)**
- Full control over backend
- Use any database (MongoDB, PostgreSQL, MySQL)
- Deploy to Vercel, Heroku, Render, Railway
- [Express Setup](./BACKEND_SETUP.md#nodejs-express)

### Step 2: Implement Backend API

Your backend needs these endpoints (see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)):

```
Authentication:
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Entities (CRUD):
  GET    /api/entities/{EntityName}
  GET    /api/entities/{EntityName}/{id}
  POST   /api/entities/{EntityName}
  PUT    /api/entities/{EntityName}/{id}
  DELETE /api/entities/{EntityName}/{id}

Integrations:
  POST   /api/integrations/llm
  POST   /api/integrations/generate-image
  POST   /api/integrations/upload
```

### Step 3: Configure Environment

Create `.env.local`:
```
VITE_API_BASE_URL=http://localhost:3001/api
```

For production:
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Step 4: Update Component Imports

All components already use the new API client. No changes needed if they import from `@/api/apiClient`.

Verify imports in files that use database:
```javascript
// ✅ Correct
import { db } from '@/api/apiClient'

// ✅ Also correct (imported implicitly through useAuth)
import { useAuth } from '@/lib/AuthContext'
const { apiClient } = useAuth()
```

### Step 5: Test Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Backend should be running on http://localhost:3001
# Frontend will run on http://localhost:3000
```

Test the flow:
1. ✅ Visit `http://localhost:3000`
2. ✅ You should be redirected to `/login`
3. ✅ Create account on signup page
4. ✅ Login with your credentials
5. ✅ Access the app

### Step 6: Deploy

#### **Deploy Frontend**

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Traditional Hosting**
- Run `npm run build`
- Upload `dist/` folder to your host
- Configure server to serve `index.html` for all routes

#### **Deploy Backend**

Depends on your choice:
- Supabase: Hosted for you
- Firebase: Hosted for you
- Node.js: Deploy to Vercel, Render, Heroku, AWS, etc.

## 📋 Database Schema

Your backend database should have these collections/tables:

```javascript
User {
  id: string (primary key)
  email: string (unique)
  password: string (hashed)
  full_name: string
  created_at: timestamp
  updated_at: timestamp
}

Place {
  id: string
  name_en: string
  description: string
  latitude: float
  longitude: float
  wikipedia_id?: string
  is_featured?: boolean
  views_count?: number
  created_date: timestamp
  updated_at: timestamp
}

Post {
  id: string
  user_id: string -> User.id
  user_email: string
  user_name: string
  title: string
  content: string
  likes_count: number
  comments_count: number
  created_date: timestamp
}

// ... and other entities (see entities/ folder)
```

## 🚨 Common Issues

### Issue: "API call fails with 401"
**Solution:** Check that token is being sent in Authorization header:
```javascript
Authorization: Bearer your_jwt_token_here
```

### Issue: "CORS error"
**Solution:** Configure CORS on your backend to allow frontend domain:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}))
```

### Issue: "db is not defined"
**Solution:** Import the API client:
```javascript
import { db } from '@/api/apiClient'
```

### Issue: "Token persists after logout"
**Solution:** The token is cleared from localStorage. Make sure your backend validation also checks token expiry.

## 📚 File Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `src/api/apiClient.js` | NEW | Replaces base44 SDK |
| `src/pages/Login.jsx` | NEW | User authentication |
| `src/pages/Signup.jsx` | NEW | User registration |
| `src/lib/AuthContext.jsx` | UPDATED | JWT auth instead of Base44 |
| `src/App.jsx` | UPDATED | New routing, protected routes |
| `package.json` | UPDATED | Removed @base44/* |
| `vite.config.js` | UPDATED | Removed base44 plugin |
| `.env.example` | NEW | Environment config template |
| `index.html` | UPDATED | Removed Base44 references |
| `README.md` | UPDATED | New deployment instructions |
| `API_DOCUMENTATION.md` | NEW | Backend API specification |

## ✨ What's New

### Authentication
- ✅ Proper login/signup pages
- ✅ Password validation
- ✅ Email validation
- ✅ Error handling
- ✅ JWT token management

### API Client
- ✅ Standard REST API calls
- ✅ Error handling
- ✅ Token injection
- ✅ File uploads
- ✅ Type-safe (can add TypeScript)

### Deployment
- ✅ Deploy to any host (Vercel, Netlify, Hostinger, etc.)
- ✅ Works with any backend
- ✅ Environment-based configuration
- ✅ CORS-friendly

## 🎯 Recommended Next Steps

1. **Choose a backend solution** (Supabase recommended for fastest setup)
2. **Implement the API endpoints** (see API_DOCUMENTATION.md)
3. **Test locally** with the dev server
4. **Deploy backend** to production
5. **Deploy frontend** to Vercel/Netlify
6. **Update** `VITE_API_BASE_URL` in production environment

## 📖 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Backend Setup Guide](./BACKEND_SETUP.md) (coming)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) (coming)
- [Troubleshooting](./TROUBLESHOOTING.md) (coming)

## ❓ FAQ

**Q: Can I still use the old Base44 database?**  
A: No, Base44 is being phased out. You need to migrate to a standard backend.

**Q: Do I need to change my components?**  
A: Only if they import from `@base44/sdk`. The new `apiClient` has the same interface.

**Q: How do I migrate existing data?**  
A: Export data from Base44 and import into your new database.

**Q: Which backend do you recommend?**  
A: For beginners: Supabase. For most: Node.js + PostgreSQL. For enterprise: Firebase.

**Q: Can I use Vercel for the backend too?**  
A: Yes! Use Vercel's serverless functions or the new "Projects" feature. Or deploy Node.js backend separately.

---

**Next: [Read API_DOCUMENTATION.md](./API_DOCUMENTATION.md) to implement your backend API**
