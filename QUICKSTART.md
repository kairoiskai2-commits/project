# 🚀 Quick Start Guide

Get your Travel Explorer app running in 5 minutes (after backend setup).

## ⏱️ 5-Minute Local Setup

### 1. **Install & Configure**
```bash
# Navigate to project
cd project-web

# Install dependencies
npm install

# Create environment file
echo 'VITE_API_BASE_URL=http://localhost:3001/api' > .env.local
```

### 2. **Start Dev Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### 3. **You Should See:**
- ✅ Redirected to `/login`
- ✅ Signup and login forms
- ✅ Ready to connect to backend

---

## 🔌 Next: Set Up Backend (Required)

Your app won't work until you have a backend API. Choose one:

### **Option A: Supabase (Easiest - 30 minutes)**
1. Sign up at https://supabase.com
2. Create new project
3. Follow [Supabase Backend Guide](./BACKEND_SETUP.md)
4. Update `.env.local` with API URL

### **Option B: Firebase (Medium - 1 hour)**
1. Create project at https://console.firebase.google.com
2. Set up Firestore database
3. Enable authentication
4. Deploy Cloud Functions
5. Follow [Firebase Backend Guide](./BACKEND_SETUP.md)

### **Option C: Node.js Backend (Advanced - 2-3 hours)**
1. Create Node.js project with Express
2. Implement API endpoints (see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md))
3. Deploy to Vercel, Render, or Railway
4. Update `.env.local` with backend URL

---

## 📖 Essential Docs

| Document | Use When |
|----------|----------|
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Understanding what changed |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Building backend API |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Ready to deploy |
| [README.md](./README.md) | Project overview |
| [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) | What was done |

---

## 💾 Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview

# Deploy build to hosting
# (See DEPLOYMENT_GUIDE.md)
```

---

## ✅ Deployment Checklist

- [ ] Backend API implemented and deployed
- [ ] `VITE_API_BASE_URL` points to your backend
- [ ] Test login/signup locally
- [ ] Run `npm run build` successfully
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Test login on production

---

## 🆘 Troubleshooting

**Issue: "API is unreachable"**
```bash
# Check your .env.local
cat .env.local

# Should show your backend URL
# VITE_API_BASE_URL=http://localhost:3001/api
```

**Issue: "Build fails"**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue: "Imports not found"**
```bash
# The @ alias is configured in vite.config.js
# Make sure paths match: src/api/apiClient.js
```

---

## 🎯 Next Steps

1. **Read** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. **Choose** backend (Supabase recommended)
3. **Implement** API endpoints
4. **Test** locally with `npm run dev`
5. **Deploy** to production

---

**Everything is ready! Start with [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) →**
