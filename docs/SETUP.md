# Setup Guide

## Prerequisites
- Node.js 18+
- npm 9+
- Free Supabase account (https://supabase.com)

## 1. Supabase Setup
1. Create a new Supabase project
2. Go to SQL Editor and paste the contents of `docs/supabase-schema.sql`
3. Click **Run** to create all tables
4. (Optional) Go to Storage → New bucket → name it `student-photos` → set to **Public**
5. Go to Settings → API and note down:
   - Project URL
   - `anon` / public key  ← for the frontend
   - `service_role` key   ← for the backend (keep secret!)

## 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
npm start
# App runs at http://localhost:3000
```

## 3. Backend Setup (optional — app works without it)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase URL and service_role key
npm run dev
# API runs at http://localhost:5000
```

## 4. Demo Mode
If you skip Supabase setup, the app runs in **demo mode**:
- All data is stored in React state (lost on refresh)
- No credentials needed
- Great for testing/development

## 5. Production Build
```bash
cd frontend
npm run build
# Serve the /build folder with any static host (Vercel, Netlify, etc.)
```
