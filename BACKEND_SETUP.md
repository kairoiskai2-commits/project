# Backend Setup Guide

Complete guides for implementing the backend for your Travel Explorer app.

---

## 🎯 Choose Your Backend

| Option | Setup Time | Cost | Best For |
|--------|-----------|------|----------|
| **Supabase** | 30 min | Free tier + pay-as-you-go | Beginners, MVP |
| **Firebase** | 1 hour | Free tier + pay-as-you-go | Google ecosystem |
| **Node.js + PostgreSQL** | 2-3 hours | $5-50/month | Full control |

---

## Option 1: Supabase (Recommended for Beginners)

Supabase is the easiest option - PostgreSQL database + Auth + Storage included.

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Save your credentials:
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: (copy from project settings)
   - Service Role Key: (for server-side only)

### Step 2: Create Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Places table
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  wikipedia_id TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_posts_user_email ON posts(user_email);
CREATE INDEX idx_places_is_featured ON places(is_featured);
CREATE INDEX idx_places_created_date ON places(created_date DESC);
```

### Step 3: Deploy Edge Functions

Supabase allows serverless functions. Create file `supabase/functions/api/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
)

serve(async (req) => {
  const { pathname } = new URL(req.url)

  // Auth endpoints
  if (pathname === "/auth/signup" && req.method === "POST") {
    const { email, password, full_name } = await req.json()
    
    // Create user
    const { data, error } = await supabase.auth.signUpWithPassword({
      email,
      password,
    })
    
    if (error) return new Response(JSON.stringify({ error }), { status: 400 })
    
    return new Response(JSON.stringify({
      token: data.session.access_token,
      user: { id: data.user.id, email, full_name }
    }))
  }

  // Add more endpoints...
  return new Response("Not found", { status: 404 })
})
```

### Step 4: Configure in Frontend

Update `.env.local`:
```
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1/api
```

### Step 5: Test

```bash
npm run dev
# Should be able to sign up and login
```

---

## Option 2: Firebase

Firebase offers Firestore, Authentication, and Cloud Storage.

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create new project
3. Enable Firestore Database
4. Enable Firebase Authentication (Email/Password)
5. Enable Cloud Storage

### Step 2: Create Firestore Collections

In Firebase Console, create these collections:

```
users/
  ├── userId1
  │   ├── email: "user@example.com"
  │   ├── full_name: "John Doe"
  │   └── created_at: timestamp

places/
  ├── placeId1
  │   ├── name_en: "Giza Pyramids"
  │   ├── latitude: 29.9792
  │   ├── longitude: 31.1342
  │   └── is_featured: true

posts/
  ├── postId1
  │   ├── user_id: "userId1"
  │   ├── user_email: "user@example.com"
  │   ├── content: "Great place!"
  │   └── likes_count: 5
```

### Step 3: Deploy Cloud Functions

Create `functions/index.js`:

```javascript
const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp()

// Signup endpoint
exports.signup = functions.https.onCall(async (data, context) => {
  const { email, password, full_name } = data
  
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: full_name,
    })
    
    // Create user document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      full_name,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    // Generate token
    const token = await admin.auth().createCustomToken(userRecord.uid)
    
    return { token, user: { id: userRecord.uid, email, full_name } }
  } catch (error) {
    throw new functions.https.HttpsError('invalid-argument', error.message)
  }
})

// Login endpoint
exports.login = functions.https.onCall(async (data, context) => {
  // Firebase client library handles login
  // This function validates the token
  return { success: true }
})
```

Deploy:
```bash
npm install -g firebase-tools
firebase deploy --only functions
```

### Step 4: Configure Frontend

Get your Firebase config from Project Settings:

Update `.env.local`:
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

---

## Option 3: Node.js + Express Backend

Full control - implement your own backend.

### Step 1: Create Node.js Project

```bash
mkdir travel-app-backend
cd travel-app-backend
npm init -y
npm install express cors dotenv mongoose jsonwebtoken bcryptjs
```

### Step 2: Create Server (`server.js`)

```javascript
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}))

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const users = {} // In production, use a database

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, full_name } = req.body
  
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  
  if (users[email]) {
    return res.status(400).json({ error: 'User exists' })
  }
  
  // Hash password
  const hashed = await bcrypt.hash(password, 10)
  
  // Store user
  const userId = Math.random().toString(36).substr(2, 9)
  users[email] = { userId, email, full_name, password: hashed }
  
  // Create token
  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
  
  res.json({ token, user: { id: userId, email, full_name } })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  
  if (!users[email]) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const validPassword = await bcrypt.compare(password, users[email].password)
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const token = jwt.sign(
    { userId: users[email].userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  res.json({
    token,
    user: {
      id: users[email].userId,
      email: users[email].email,
      full_name: users[email].full_name
    }
  })
})

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user)
})

// Generic entity endpoints
const entities = {
  Place: [],
  Post: [],
  ChatMessage: [],
  // ... other entities
}

app.get('/api/entities/:entity', (req, res) => {
  const { entity } = req.params
  res.json(entities[entity] || [])
})

app.post('/api/entities/:entity', authMiddleware, (req, res) => {
  const { entity } = req.params
  const data = { id: Math.random().toString(36).substr(2, 9), ...req.body }
  entities[entity] = entities[entity] || []
  entities[entity].push(data)
  res.json(data)
})

app.listen(3001, () => console.log('Backend running on :3001'))
```

### Step 3: Deploy

#### Vercel (Easiest)
```bash
npm install -g vercel
vercel
```

#### Render.com
1. Push code to GitHub
2. Go to https://render.com
3. Connect GitHub
4. Deploy Node.js service

#### Railway.app
1. Go to https://railway.app
2. Connect GitHub
3. Deploy

### Step 4: Update Frontend

`.env.local`:
```
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

---

## 🧪 Testing Your Backend

### Test with cURL

```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Should return token

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test with Frontend

```bash
# Start backend
npm start

# In another terminal, start frontend
cd project-web
npm run dev
```

Test flow:
1. ✅ Open http://localhost:3000
2. ✅ Redirected to /login
3. ✅ Click "Sign up here"
4. ✅ Create account
5. ✅ Should log in and see app

---

## 🔒 Security Tips

1. **Hash Passwords** - Always use bcrypt/argon2
2. **Use HTTPS** - Required for production
3. **JWT Expiry** - Set token expiration (7 days recommended)
4. **CORS** - Configure properly, don't use `*`
5. **Rate Limiting** - Prevent brute force attacks
6. **Input Validation** - Check all inputs
7. **Environment Variables** - Never commit secrets

---

## 📊 Database Schema Reference

All backends should implement these collections/tables:

```sql
-- Core tables
User (id, email, password_hash, full_name, created_at)
Place (id, name_en, description, latitude, longitude, is_featured, created_date)
Post (id, user_id, title, content, likes_count, comments_count, created_date)
PostComment (id, post_id, user_id, content, created_date)
PostLike (id, post_id, user_id, created_date)
ChatMessage (id, sender_email, receiver_email, message, created_date)
Favorite (id, user_id, place_id, created_date)
Comment (id, place_id, user_id, content, created_date)

-- And other entities in entities/ folder
```

---

## 🚀 Next Steps

1. Choose a backend option above
2. Follow the setup steps
3. Update `VITE_API_BASE_URL` in `.env.local`
4. Test with `npm run dev`
5. Deploy both frontend and backend

---

## 💬 Recommended Combinations

**For MVP (Fastest):**
- Frontend: Vercel
- Backend: Supabase (fully hosted)
- Time to launch: < 2 hours

**For Control + Scalability:**
- Frontend: Vercel
- Backend: Node.js on Railway or Render
- Database: PostgreSQL (included in hosting)
- Time to launch: 3-4 hours

**For Enterprise:**
- Frontend: Vercel
- Backend: AWS/GCP
- Database: RDS PostgreSQL
- CDN: CloudFront
- Time to launch: 1-2 weeks

---

**Choose your backend and follow the guide above!**
