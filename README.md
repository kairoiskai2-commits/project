# Travel Explorer App

A modern travel and exploration web application built with React, Vite, and Tailwind CSS. Deploy to Vercel, Netlify, or any standard web hosting provider.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm or yarn
- A backend API server (see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md))

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd project-web
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your backend URL
```
VITE_API_BASE_URL=http://localhost:3001/api
```

5. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## � Backend Setup (Required)

Your app needs a backend for authentication, database, and AI features. Choose one:

### Option 1: Supabase (Recommended - 15 min setup)

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Copy the backend files from supabase-backend/ folder
# 3. Run the database schema in Supabase SQL Editor
# 4. Deploy the edge functions
# 5. Add your API keys in Supabase settings
```

**Files ready:** `supabase-backend/` folder with complete setup.

### Option 2: Node.js/Express (Full control)

Use the `BACKEND_SETUP.md` guide for a custom Node.js backend.

### Option 3: Firebase (Google ecosystem)

Use the Firebase setup guide in `BACKEND_SETUP.md`.

---

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Your backend API URL | `http://localhost:3001/api` | ✅ Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | - | ✅ For Supabase |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | - | ✅ For Supabase |
| `VITE_OPENWEATHER_API_KEY` | Weather API key | - | ❌ Optional |
| `VITE_UNSPLASH_API_KEY` | Image API key | - | ❌ Optional |
| `VITE_PIXABAY_API_KEY` | Image API key | - | ❌ Optional |

## 🏗️ Project Structure

```
src/
├── api/
│   └── apiClient.js          # API client for backend communication
├── components/
│   ├── admin/                # Admin components
│   ├── home/                 # Home page components
│   ├── ui/                   # UI components (buttons, cards, etc.)
│   └── ...                   # Other components
├── lib/
│   ├── AuthContext.jsx       # Authentication context
│   └── utils.js              # Utility functions
├── pages/
│   ├── Login.jsx             # Login page (NEW)
│   ├── Signup.jsx            # Signup page (NEW)
│   └── ...                   # Other pages
├── App.jsx
├── Layout.jsx
└── main.jsx
```

## 🔐 Authentication

This app uses JWT-based authentication:

1. **Login/Signup**: Users authenticate with email and password
2. **Token Storage**: JWT is stored in `localStorage` as `auth_token`
3. **API Requests**: Token is automatically included in all API requests
4. **Token Expiry**: User is redirected to login if token expires

### Login/Signup Pages

- **Login**: `/login` - Authenticate existing users
- **Signup**: `/signup` - Create new user accounts
- Both pages include validation and error handling

## 📦 Building for Production

### Build the project
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview production build
```bash
npm run preview
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Traditional Hosting (Hostinger, BlueHost, etc.)
1. Run `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Configure your server to serve `index.html` for all routes
4. Update `VITE_API_BASE_URL` in environment variables

### Deployment Checklist
- [ ] Backend API is deployed and running
- [ ] Set `VITE_API_BASE_URL` to your backend domain
- [ ] Configure CORS on your backend
- [ ] Test login/signup functionality
- [ ] Verify API calls work from production domain

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run typecheck` | Check TypeScript types |

## 🔌 Backend Integration

This frontend requires a backend API. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for:
- Required endpoints
- Request/response formats
- Example implementation
- Recommended backend solutions

## 🎨 UI Components

The project uses a comprehensive UI component library built with:
- **Radix UI** - Headless UI components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

See `src/components/ui/` for available components.

## 📚 Key Features

- 🔐 User authentication (login/signup)
- 🗺️ Place exploration and discovery
- 💬 Chat and messaging
- 📸 Photo galleries
- ✍️ Social feed
- 🤖 AI-powered features
- 📱 Responsive design
- 🌙 Dark mode support

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API connection issues
1. Check `VITE_API_BASE_URL` is correct
2. Verify backend server is running
3. Check CORS settings on backend
4. Look for network errors in browser DevTools

### Build fails
```bash
npm run lint:fix  # Fix linting issues
npm run build     # Try building again
```

## 📖 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Backend API endpoints
- [Environment Setup](./.env.example) - Environment variables

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Review API_DOCUMENTATION.md
3. Check browser console for errors
4. Verify backend is running and accessible

## 🔄 Migration from Base44

This project has been migrated from Base44 to a standard web application. Key changes:

- ✅ Removed `@base44/sdk` dependency
- ✅ Removed `@base44/vite-plugin` 
- ✅ Added custom API client (`src/api/apiClient.js`)
- ✅ Added Login page (`src/pages/Login.jsx`)
- ✅ Added Signup page (`src/pages/Signup.jsx`)
- ✅ Updated AuthContext for JWT authentication
- ✅ Replaced all `db.entities.*` calls with API client
- ✅ Ready for any standard web hosting

All Base44-specific code has been removed. You now have full control over your backend implementation.

---

**Ready to deploy? Start with the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**