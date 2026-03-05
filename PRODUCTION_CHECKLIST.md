# Production Deployment Checklist

Use this checklist to ensure your app is ready for production deployment.

## Code Quality

- [ ] All console.log/console.error statements are production-ready
- [ ] No test/debug code left in codebase
- [ ] No hardcoded credentials in code
- [ ] Build completes without errors: `npm run build`
- [ ] No unused imports or variables (warnings are acceptable)
- [ ] All environment variables documented in `.env.example` files

## Backend Configuration

- [ ] `.env` file created with production values
- [ ] `NODE_ENV=production` set
- [ ] `FRONTEND_URL` points to actual frontend domain
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from production Supabase project
- [ ] Port configured (default: 5000)
- [ ] CORS configured to accept frontend domain only (not `*`)
- [ ] Morgan logging set to "combined" (done automatically in production)
- [ ] Error handling properly configured

### Backend Environment Variables

```bash
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

## Frontend Configuration

- [ ] `.env.production.local` file created
- [ ] `REACT_APP_SUPABASE_URL` from production Supabase project
- [ ] `REACT_APP_SUPABASE_ANON_KEY` from production Supabase project
- [ ] `REACT_APP_API_URL` points to deployed backend API
- [ ] Build optimized: `npm run build`
- [ ] Build output is minified and gzipped (~80KB)
- [ ] No debug console statements in production build
- [ ] All images and assets loading correctly

### Frontend Environment Variables

```bash
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anonymous_key
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Database

- [ ] Supabase project created and accessible
- [ ] All tables created:
  - [ ] `students`
  - [ ] `scores`
  - [ ] `selections`
  - [ ] `schools`
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Service role has full access
- [ ] Automatic backups configured
- [ ] Connection pooling enabled (if applicable)

## Deployment

### Backend

- [ ] Backend deployed to hosting service
- [ ] Health endpoint responds: `GET /health` → `{ "status": "healthy" }`
- [ ] API endpoints responding correctly:
  - [ ] `GET /api/students`
  - [ ] `GET /api/scores`
  - [ ] `GET /api/selections`
  - [ ] `GET /api/schools`
- [ ] Backend logs accessible for monitoring
- [ ] Restart/recovery policy configured

### Frontend

- [ ] Frontend built and deployed
- [ ] Served over HTTPS
- [ ] Index.html fallback configured (for SPA routing)
- [ ] Static files cached appropriately
- [ ] Custom error pages (404, 500) configured
- [ ] All routes accessible

## Security

- [ ] HTTPS/SSL enabled on all domains
- [ ] Certificates valid and not expired
- [ ] CORS headers correct (specific domain, not `*`)
- [ ] Environment variables NOT in version control
- [ ] `.env.production.local` in `.gitignore`
- [ ] API keys rotated and secure
- [ ] Database backups encrypted
- [ ] No sensitive data in logs
- [ ] Rate limiting considered for API

## SSL/HTTPS

- [ ] Backend domain has valid SSL certificate
- [ ] Frontend domain has valid SSL certificate
- [ ] All HTTP traffic redirects to HTTPS
- [ ] Mixed content warnings resolved
- [ ] Certificate expiration monitored

## Testing

- [ ] Admin portal login works
- [ ] Admin can enroll students
- [ ] Admin can view students
- [ ] Student login works
- [ ] Student can view schools
- [ ] Student can submit school selection
- [ ] Student can view selection status
- [ ] All notifications appear
- [ ] All tabs/pages load correctly
- [ ] Responsive design works on mobile

## Functional Testing

- [ ] Enroll new student → Verify in database
- [ ] Upload student scores → Verify displayed correctly
- [ ] Submit school selection → Verify status changes
- [ ] Approve/reject selection → Verify status updates
- [ ] Delete schools → Verify students' selections update
- [ ] View analytics → Verify counts accurate
- [ ] Notifications trigger on actions

## Performance

- [ ] Frontend bundle < 100KB gzipped (current: ~80KB)
- [ ] Page load time < 3 seconds
- [ ] API responses < 500ms average
- [ ] Database queries optimized
- [ ] No console errors in browser
- [ ] No network errors in browser DevTools

## Monitoring & Logging

- [ ] Backend logs accessible
- [ ] Frontend errors logged and monitored
- [ ] Database query logs monitored
- [ ] Uptime monitoring configured
- [ ] Alerts set up for critical errors
- [ ] Daily backup verification

## Documentation

- [ ] [DEPLOYMENT.md](DEPLOYMENT.md) reviewed and followed
- [ ] [docs/API.md](docs/API.md) reviewed
- [ ] [docs/SETUP.md](docs/SETUP.md) reviewed
- [ ] Deployment runbook created
- [ ] Emergency rollback plan documented

## Domain & DNS

- [ ] Domain registered
- [ ] DNS records configured:
  - [ ] A record for backend pointing to server
  - [ ] A record for frontend pointing to CDN/server
  - [ ] CNAME if using third-party hosting
- [ ] DNS propagated (check with `nslookup`)
- [ ] Wildcard SSL certificate if using subdomains

## Backup & Disaster Recovery

- [ ] Database backups automated
- [ ] Backup retention policy set
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Contact information documented

## Post-Deployment

- [ ] Set up monitoring alerts
- [ ] Monitor error rates first 24 hours
- [ ] Check user feedback for issues
- [ ] Review slow API endpoints
- [ ] Verify all notifications working
- [ ] Monitor database performance

## Sign-Off

- [ ] Backend Team: ___________________  Date: _______
- [ ] Frontend Team: ___________________  Date: _______
- [ ] DevOps: ___________________  Date: _______
- [ ] Project Lead: ___________________  Date: _______

---

**Deployment Date:** ___________________  
**Production URL (Backend):** https://  
**Production URL (Frontend):** https://  
**Deployed Version:** 1.0.0  
**Emergency Contact:** ___________________
