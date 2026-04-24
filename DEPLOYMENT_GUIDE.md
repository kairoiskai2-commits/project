# Deployment Guide

Complete guide to deploying your Travel Explorer app to production.

## 📋 Pre-Deployment Checklist

- [ ] Backend API is fully implemented and tested
- [ ] Backend is deployed and accessible
- [ ] All database migrations are complete
- [ ] Environment variables are configured
- [ ] CORS is configured on backend
- [ ] SSL certificate is installed (HTTPS required)
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes without errors

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Prerequisites
- Vercel account (free: vercel.com)
- GitHub account
- Backend API deployed

#### Steps

1. **Push code to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects it's a Vite project

3. **Configure Environment Variables**
   - Set `VITE_API_BASE_URL` to your backend API URL
   - Example: `https://your-api.com/api`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2 minutes)
   - Get your live URL

5. **Custom Domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS instructions

#### Vercel Dashboard Commands
```bash
# View logs
vercel logs

# Rollback to previous version
vercel rollback

# View environment variables
vercel env pull
```

---

### Option 2: Netlify

#### Prerequisites
- Netlify account (free: netlify.com)
- GitHub account

#### Steps

1. **Build the project locally**
```bash
npm run build
```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site"
   - Select "Import an existing project"
   - Choose GitHub
   - Select repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add `VITE_API_BASE_URL=your_api_url`

5. **Deploy**
   - Netlify auto-deploys on every git push
   - View live site immediately

#### Redirect Rules (netlify.toml)

Create `netlify.toml` for SPA routing:

```toml
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

---

### Option 3: Traditional Hosting (Hostinger, Bluehost, etc.)

#### Prerequisites
- Hosting account with SSH/FTP access
- Node.js optional (static hosting works too)

#### Steps

1. **Build locally**
```bash
npm run build
```

2. **Upload files**
   - Connect via SFTP/FTP
   - Upload contents of `dist/` folder to `public_html/`

3. **Configure Server** (if using Apache)

Create `.htaccess` in `public_html/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. **Set Environment Variables**
   - Update `VITE_API_BASE_URL` in `index.html` or via environment variable
   - Or rebuild with environment variable before uploading

#### For Nginx

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/your-app/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static files
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

---

### Option 4: AWS (Scalable)

#### Using S3 + CloudFront

1. **Build project**
```bash
npm run build
```

2. **Create S3 bucket**
   - Name: `your-app.com`
   - Enable static website hosting
   - Grant public read access

3. **Upload files**
```bash
aws s3 sync dist/ s3://your-app.com/
```

4. **CloudFront Distribution**
   - Create distribution for S3 bucket
   - Set origin domain
   - Create cache invalidation

---

## 🔒 Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] API base URL uses HTTPS
- [ ] CORS headers properly configured
- [ ] No sensitive data in frontend code
- [ ] Environment variables not committed to git
- [ ] API tokens have expiration
- [ ] Password hashing on backend
- [ ] Input validation on backend
- [ ] Rate limiting configured

## ⚙️ Performance Optimization

### Frontend Optimizations

Already configured in `vite.config.js`:
- ✅ Code splitting
- ✅ Minification
- ✅ Tree shaking
- ✅ Image optimization (configure as needed)

### Additional Optimizations

Add to `vite.config.js`:
```javascript
export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-*'],
        }
      }
    }
  }
})
```

### Image Optimization

Use the `picture` element or image optimization library:
```javascript
import sharp from 'sharp'
```

### Caching Headers

Configure your hosting to cache static files:
```
Cache-Control: max-age=31536000 (for .js, .css files)
Cache-Control: max-age=3600 (for HTML files)
```

---

## 📊 Monitoring & Logging

### Vercel Analytics
- Automatically enabled
- View performance metrics in dashboard
- Monitor Core Web Vitals

### Netlify Analytics
- Built-in analytics
- View visitor stats and errors

### Custom Monitoring

Add to your frontend (optional):
```javascript
// Sentry for error tracking
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
})
```

### Backend Logging

Ensure your backend logs:
- API request duration
- Error stack traces
- Database queries (in development)
- Authentication attempts
- File uploads

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🐛 Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routes Not Working
- Ensure SPA routing is configured (see Netlify/Hostinger sections)
- Check `vite.config.js` has proper base path

### API Not Connecting
```javascript
// Check in browser console
console.log(import.meta.env.VITE_API_BASE_URL)
```

### Slow Performance
- Enable gzip compression on server
- Add CDN for static files
- Optimize images
- Use lazy loading

### High Memory Usage
- Check for memory leaks with React DevTools
- Use performance profiler
- Implement code splitting

---

## 📈 Post-Deployment

### Monitor
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Track user metrics

### Backup
- Regular database backups
- Version control backups
- Document deployment steps

### Update Security
- Keep dependencies updated: `npm audit fix`
- Rotate API keys regularly
- Monitor for security advisories

### User Communication
- Set up status page
- Plan maintenance windows
- Communicate downtime if needed

---

## 🔗 Useful Commands

```bash
# Check bundle size
npm run build -- --report

# Analyze dependencies
npm ls

# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Force reinstall
npm ci
```

---

## 💡 Quick Reference

| Platform | Build Command | Deploy Command | Cost |
|----------|---------------|-----------------|------|
| Vercel | Auto | `vercel` | Free tier available |
| Netlify | Auto | `netlify deploy` | Free tier available |
| Hostinger | Manual | Via cPanel/SFTP | $2.99+/month |
| AWS | Manual | `aws s3 sync` | $0.50-$5/month |
| GitHub Pages | Auto | Auto on push | Free |

---

## 📞 Getting Help

- Check deployment provider docs
- Review error logs in deployment dashboard
- Check browser console for client-side errors
- Verify backend API is accessible from frontend

---

**You're ready to deploy! Choose your platform above and follow the steps.**
