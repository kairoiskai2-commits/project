# Travel Explorer - Supabase Backend

Complete backend implementation for your Travel Explorer app using Supabase.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for setup to complete
4. Go to Settings → API
5. Copy your Project URL and anon/public key

### 2. Environment Variables

In your Supabase project settings, add these environment variables:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for enhanced features)
OPENWEATHER_API_KEY=your_openweather_api_key
UNSPLASH_API_KEY=your_unsplash_api_key
PIXABAY_API_KEY=your_pixabay_api_key
```

### 3. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy auth/login
supabase functions deploy auth/signup
supabase functions deploy auth/me
supabase functions deploy entities
supabase functions deploy integrations
supabase functions deploy external
```

### 4. Run Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database-schema.sql`
3. Run the query

### 5. Configure Your Frontend

Update your `.env.local` file:

```bash
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 Project Structure

```
supabase-backend/
├── database-schema.sql          # Database tables & policies
├── supabase/
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts          # CORS headers
│       ├── auth/
│       │   ├── login/index.ts   # User login
│       │   ├── signup/index.ts  # User registration
│       │   └── me/index.ts      # Get current user
│       ├── entities/index.ts    # CRUD for all entities
│       ├── integrations/index.ts # AI & file uploads
│       └── external/index.ts    # External APIs
└── README.md                    # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/me` - Get current user

### Entities (CRUD)
- `GET /entities/{entity}` - List entities
- `GET /entities/{entity}/{id}` - Get single entity
- `POST /entities/{entity}` - Create entity
- `PUT /entities/{entity}/{id}` - Update entity
- `DELETE /entities/{entity}/{id}` - Delete entity

### Integrations
- `POST /integrations/llm` - AI chat completion
- `POST /integrations/generate-image` - AI image generation

### External APIs
- `POST /external/wikipedia/search` - Wikipedia search
- `POST /external/weather/current` - Current weather
- `POST /external/geo/geocode` - Address to coordinates
- `POST /external/translation/translate` - Text translation
- `POST /external/images/unsplash` - Image search (Unsplash)
- `POST /external/currency/convert` - Currency conversion
- And many more...

## 🔑 API Keys Setup

### Required
- **OpenAI API Key**: For AI features (stories, chat, image generation)

### Optional (but recommended)
- **OpenWeather API Key**: Weather data
- **Unsplash API Key**: High-quality images
- **Pixabay API Key**: Alternative image search

## 🧪 Testing

Test your setup:

```bash
# Test AI integration
curl -X POST https://your-project.supabase.co/functions/v1/integrations/llm \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, tell me about Egypt"}'

# Test external API
curl -X POST https://your-project.supabase.co/functions/v1/external/weather/current \
  -H "Content-Type: application/json" \
  -d '{"latitude": 30.0444, "longitude": 31.2357}'
```

## 🚀 Deployment

Your app is now ready! The backend will:

1. ✅ Handle user authentication
2. ✅ Provide CRUD operations for all entities
3. ✅ Power AI features (stories, chat, image analysis)
4. ✅ Integrate with external APIs (Wikipedia, weather, etc.)
5. ✅ Scale automatically with Supabase

## 💡 Next Steps

1. **Test locally** with `npm run dev`
2. **Deploy frontend** to Vercel/Netlify
3. **Monitor usage** in Supabase dashboard
4. **Add more features** as needed

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Function deploy fails | Check Supabase CLI version |
| API key errors | Verify environment variables in Supabase |
| CORS errors | Check cors.ts headers |
| Database errors | Run schema again in SQL Editor |

---

**Time to deploy: 15-30 minutes** ⏱️

Happy deploying! 🎉