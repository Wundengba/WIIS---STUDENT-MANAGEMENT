# Supabase Setup Guide

This guide will walk you through setting up Supabase for the GPS (Ghana Placement System) application.

## Step 1: Create a Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Sign Up" and create an account
3. Create a new project:
   - Click "New Project"
   - Enter a project name (e.g., "GPS-System")
   - Choose a strong database password
   - Select your region (closest to your users)
   - Click "Create new project"

**Wait for the project to initialize** (usually 1-2 minutes)

## Step 2: Get Your Credentials

1. Once your project is created, go to **Settings → API**
2. Copy the following credentials:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public key**: This is your `REACT_APP_SUPABASE_ANON_KEY` (frontend)
   - **service_role key**: This is your `SUPABASE_SERVICE_KEY` (backend)

## Step 3: Create Environment Files

### Backend (.env)
Create file: `backend/.env`
```
PORT=5000
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
NODE_ENV=development
```

### Frontend (.env.local)
Create file: `frontend/.env.local`
```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_ANON_KEY
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 4: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Open the file: `docs/supabase-schema.sql`
4. Copy the entire SQL content
5. Paste it into the Supabase SQL editor
6. Click "Run" (⌘/Ctrl + Enter)

**Expected Result**: All tables, indexes, and views should be created successfully.

## Step 5: Create Storage Bucket (Optional)

To enable student photo uploads:

1. In Supabase, go to **Storage**
2. Click "New Bucket"
3. Name it: `student-photos`
4. Click "Create"
5. Go to the bucket's **Policies** tab
6. Add a policy to allow public read access (optional for displaying photos)

## Step 6: Verify Setup

### Test Backend Connection:
```bash
cd backend
npm start
```
You should see: `Server running on port 5000`

### Test Frontend Connection:
```bash
cd frontend
npm start
```
The app should load without demo mode warnings.

## Troubleshooting

### "Running in demo mode" message
- **Cause**: Invalid or missing Supabase credentials in `.env.local`
- **Fix**: Verify the REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are correct

### Database errors when creating tables
- **Cause**: SQL syntax errors or table already exists
- **Fix**: Check the error message in Supabase SQL Editor and ensure supabase-schema.sql is run completely

### Backend can't connect to Supabase
- **Cause**: Invalid SUPABASE_URL or SUPABASE_SERVICE_KEY
- **Fix**: Verify credentials in backend/.env match exactly from Supabase Settings

### 403 Forbidden errors on photo uploads
- **Cause**: Storage bucket policies not set correctly
- **Fix**: Ensure the bucket policy allows authenticated uploads (service role key has access)

## Database Tables Overview

| Table | Purpose |
|-------|---------|
| **students** | Student profiles (name, contact, DOB, etc.) |
| **scores** | Subject-wise scores for each student |
| **selections** | School selections for each student (status: pending/approved/rejected) |
| **notifications** | System notifications |

## Next Steps

Once setup is complete:
1. Run the backend: `cd backend && npm start`
2. Run the frontend: `cd frontend && npm start`
3. Access the app at http://localhost:3000
4. Admin Portal: Use the admin credentials
5. Student Portal: Use student index number and parent contact to login

## Security Notes

- **Never commit `.env` files** to version control
- Keep `SUPABASE_SERVICE_KEY` secret (backend only)
- Use `REACT_APP_SUPABASE_ANON_KEY` for frontend (has limited permissions)
- Regularly rotate keys in Supabase Settings → API

## Support

For more info visit: [Supabase Documentation](https://supabase.com/docs)
