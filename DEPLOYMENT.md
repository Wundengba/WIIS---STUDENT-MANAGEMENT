# Ghana Placement System - Production Deployment Guide

This guide covers deploying the Ghana Placement System to production.

## Prerequisites

- Node.js 14+ and npm
- Supabase account with project set up
- Production server/hosting (Heroku, Railway, AWS, DigitalOcean, etc.)
- Domain name configured (optional but recommended)

## Architecture Overview

```
Backend (Express.js) → Supabase (PostgreSQL)
Frontend (React) → Backend API
```

## Backend Deployment

### 1. Prepare Backend for Production

```bash
cd backend
npm install --production
```

### 2. Create Production `.env` File

Create `.env` in the `backend/` directory:

```dotenv
# Backend Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Supabase (Production Project)
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

**Important:**
- Set `NODE_ENV=production` to disable verbose logging
- Set `FRONTEND_URL` to your deployed frontend domain for CORS
- Use production Supabase credentials

### 3. Deploy Backend

#### Option A: Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
heroku config:set SUPABASE_URL="your_supabase_url"
heroku config:set SUPABASE_SERVICE_KEY="your_service_key"

# Deploy
git push heroku main
```

#### Option B: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option C: DigitalOcean App Platform

1. Connect GitHub repository to DigitalOcean
2. Set environment variables in App Platform dashboard
3. Configure build command: `npm install`
4. Configure run command: `npm start`
5. Set HTTP port to 5000

### 4. Verify Backend Health

```bash
curl https://your-backend-domain/health
# Should return: { "status": "healthy" }
```

## Frontend Deployment

### 1. Prepare Frontend for Production

```bash
cd frontend
npm install --production
```

### 2. Create Production `.env` File

Create `.env.production.local` in the `frontend/` directory:

```dotenv
# Supabase (Production Project)
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Backend API (Your deployed backend domain)
REACT_APP_API_URL=https://your-backend-domain/api
```

**Important:**
- Use production Supabase credentials (anonymous key)
- Point `REACT_APP_API_URL` to your deployed backend
- Keep `.env.production.local` out of version control

### 3. Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory (~80KB gzipped).

### 4. Deploy Frontend

#### Netlify Deployment

Netlify provides fast, reliable hosting with automatic HTTPS, CDN, and continuous deployment.

**Option 1: CLI Deployment**

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the frontend
cd frontend
npm run build

# Deploy to production
netlify deploy --prod --dir=build
```

**Option 2: Connect GitHub for Continuous Deployment (Recommended)**

1. **Create Netlify Account:**
   - Go to [netlify.com](https://netlify.com) and sign up
   - Connect your GitHub account

2. **Deploy from GitHub:**
   - Click "New site from Git"
   - Choose your repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `frontend/build`
   - Click "Deploy site"

3. **Configure Environment Variables:**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add the following:
     ```
     REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
     REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
     REACT_APP_API_URL=https://your-backend-domain/api
     ```

4. **Set Custom Domain (Optional):**
   - In Site settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed

**Option 3: Drag & Drop Deployment**

```bash
# Build the frontend
cd frontend
npm run build

# Go to netlify.com and drag the build folder to deploy
```

#### Alternative: GitHub Pages

```bash
# Build
npm run build

# Deploy build folder to your hosting
```

#### Alternative: Traditional Web Server (Nginx)

```bash
# Build
npm run build

# Copy build folder to server
scp -r build/ user@server:/var/www/gps-frontend/

# Configure Nginx to serve static files and proxy API requests
```

Nginx config example:
```nginx
upstream backend {
  server 127.0.0.1:5000;
}

server {
  listen 80;
  server_name your-domain.com;
  
  # Static files
  location / {
    root /var/www/gps-frontend/build;
    try_files $uri /index.html;
  }
  
  # API proxy
  location /api/ {
    proxy_pass http://backend;
  }
}
```

## Database Setup

### 1. Create Supabase Tables

If not already created, run the migration:

```bash
# Set access token
export SUPABASE_ACCESS_TOKEN="your_token"

# Push schema
cd .
supabase db push
```

Or in Supabase dashboard, run [docs/supabase-schema.sql](docs/supabase-schema.sql):

```bash
# In Supabase SQL Editor
create table students (
  id text primary key,
  full_name text not null,
  index_number text unique not null,
  gender text,
  dob date,
  parent_contact text,
  photo_url text,
  created_at timestamp default now()
);

-- Add other tables (see supabase-schema.sql)
```

### 2. Set Row Level Security (RLS)

For production, enable RLS on all tables in Supabase dashboard:

1. Go to Authentication > Policies
2. Enable RLS on `students`, `selections`, `scores`, `schools` tables
3. Add appropriate policies

Initial simple policy:
```sql
-- Allow service role full access
-- For client-facing access, restrict based on authentication
```

## Production Checklist

- [ ] Backend `.env` configured with production values
- [ ] Frontend `.env.production.local` configured
- [ ] Backend deployed and health endpoint responds
- [ ] Frontend built and deployed
- [ ] CORS correctly configured on backend
- [ ] Database backup configured in Supabase
- [ ] SSL/HTTPS enabled on both backend and frontend
- [ ] Environment variables secured (not in git)
- [ ] Domain names configured and DNS propagated
- [ ] Tested full workflow (login, enroll, select schools)

## Monitoring and Maintenance

### Logs

**Backend (Heroku):**
```bash
heroku logs --tail -a your-app-name
```

**Backend (Traditional):**
```bash
tail -f /var/log/gps-api/app.log
```

**Frontend:**
Check browser console for errors: F12 → Console

### Database Backups

Enable automatic backups in Supabase:
1. Project Settings → Backups
2. Set backup frequency
3. Configure storage retention

### Health Checks

```bash
# Backend health
curl https://your-backend-domain/health

# Frontend loads
curl -I https://your-frontend-domain
```

## Troubleshooting

### "Failed to fetch data from API"

- Verify `REACT_APP_API_URL` in frontend `.env.production.local`
- Check CORS configuration in `backend/server.js`
- Ensure `FRONTEND_URL` in backend `.env` matches frontend domain
- Check backend is running: `curl your-backend-domain/health`

### "Cannot POST /api/students"

- Verify backend is deployed and running
- Check all backend environment variables are set
- Verify Supabase credentials are correct
- Check database tables exist

### Slow Performance

- Check Node.js memory usage
- Review database query performance in Supabase
- Enable caching if applicable
- Monitor frontend bundle size: `npm run build` shows size

### 404 on Frontend Routes

- Ensure frontend server redirects all routes to `index.html`
- Netlify does this automatically
- For Nginx/Node, configure catch-all route

## Security Best Practices

1. **Environment Variables:** Never commit `.env` files
2. **CORS:** Specify exact domain, not `*`
3. **Database:** Use Supabase RLS policies
4. **Rate Limiting:** Consider adding for production API
5. **HTTPS:** Always use SSL certificates
6. **API Keys:** Rotate regularly, use service keys for backend only
7. **Logging:** Monitor access logs for suspicious activity

## Scaling

To handle more users:

1. **Database:** Upgrade Supabase plan
2. **Backend:** Deploy multiple instances with load balancer
3. **Frontend:** Use CDN (Cloudflare, Fastly)
4. **Caching:** Add Redis if needed
5. **API Rate Limiting:** Implement to prevent abuse

## Support

For issues:
1. Check [docs/API.md](docs/API.md) for API documentation
2. Review [docs/SETUP.md](docs/SETUP.md) for local setup
3. Check Supabase documentation: https://supabase.com/docs
4. Review server logs for error details

---

**Last Updated:** March 2026  
**Version:** 1.0.0
