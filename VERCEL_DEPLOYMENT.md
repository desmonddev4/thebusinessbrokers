# Vercel Deployment Guide

This guide explains how to deploy the frontend to Vercel with the backend on Render.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A Render account (https://render.com) for the backend
3. The backend API deployed and accessible

## Deployment Steps

### Step 1: Deploy Backend to Render

1. Create a new repository on GitHub with this code
2. Go to [Render](https://render.com) and sign in
3. Click "New +" → "Blueprint" (or "Web Service" for manual setup)
4. Connect your GitHub repository
5. Render will detect `render.yaml` automatically
6. Review the configuration:
   - PostgreSQL database will be created automatically
   - Django web service will be built from Dockerfile
7. Click "Apply" to deploy
8. Wait for deployment to complete (you'll get a URL like `https://tbb-backend.onrender.com`)

**Manual Setup (if Blueprint fails):**
1. Create PostgreSQL database first
2. Create Web Service with:
   - Environment: Docker
   - Dockerfile path: `./Dockerfile`
   - Context: `.`
   - Set environment variables (see `.env.render.example`)
   - Link to the PostgreSQL database

### Step 2: Configure Backend CORS

After your backend is deployed on Render:

1. Go to your Render dashboard → tbb-backend service
2. Copy the backend URL (e.g., `https://tbb-backend.onrender.com`)
3. Go to Environment Variables
4. Update `CORS_ORIGINS` to include your future Vercel domain:
   - Initially set to: `https://*.vercel.app` (allows any Vercel app)
   - After Vercel deployment, update to your specific domain: `https://your-app.vercel.app`
5. Click "Save Changes" to trigger a redeploy

### Step 3: Deploy Frontend to Vercel

#### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api`
     - Example: `https://tbb-backend.onrender.com/api`
6. Click "Deploy"

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the frontend directory
cd frontend
vercel

# Follow the prompts to configure:
# - Project name
# - Build command: npm run build
# - Output directory: dist
# - Set VITE_API_URL environment variable
```

### Step 4: Update CORS on Render

After Vercel deployment:

1. Copy your Vercel app URL (e.g., `https://your-app.vercel.app`)
2. Go back to Render → tbb-backend → Environment Variables
3. Update `CORS_ORIGINS` to your specific Vercel domain:
   - `https://your-app.vercel.app`
4. Save changes to redeploy backend

## Environment Variables

### Backend (Render)

Required variables (configured in `render.yaml`):
- `DJANGO_SECRET_KEY` (auto-generated)
- `DJANGO_DEBUG=0`
- `DJANGO_ALLOWED_HOSTS=*.onrender.com`
- `CSRF_TRUSTED_ORIGINS=https://*.onrender.com`
- `CORS_ORIGINS=https://your-app.vercel.app` (update after Vercel deploy)
- Database variables (auto-linked to PostgreSQL)

Optional variables:
- `ENQUIRY_NOTIFY_EMAIL` (for email notifications)
- Email settings (SMTP) if you want real email sending

### Frontend (Vercel)

Required variable:
- `VITE_API_URL`: Your Render backend URL with `/api` suffix
  - Example: `https://tbb-backend.onrender.com/api`

## Important Notes

1. **Backend Required**: The frontend needs a running backend API to function properly
2. **CORS Configuration**: Critical for frontend-backend communication
3. **Media Files**: On Render free tier, media files are not persistent. Consider:
   - Upgrading to Standard plan with disk mount for production
   - Or using AWS S3 + django-storages for persistent storage
4. **Database Migrations**: The `start.sh` script runs migrations automatically on deploy
5. **Content Seeding**: Initial content (desks, people) is seeded automatically on first deploy

## Alternative: Local Backend with ngrok (for testing)

If you want to test Vercel with a local backend:

1. Install ngrok: https://ngrok.com/download
2. Start your Django backend locally:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   export DJANGO_DEBUG=1 DB_NAME=tbb DB_USER=tbb DB_PASSWORD=tbb DB_HOST=localhost
   python manage.py migrate
   python manage.py seed_tbb
   python manage.py runserver
   ```
3. In another terminal, expose it with ngrok:
   ```bash
   ngrok http 8000
   ```
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Set `VITE_API_URL=https://abc123.ngrok.io/api` in Vercel
6. Update local backend CORS settings to allow your Vercel domain

## Troubleshooting

### API Requests Failing

- Check that `VITE_API_URL` is set correctly in Vercel environment variables
- Verify the backend is running and accessible
- Check browser console for CORS errors
- Ensure backend `CORS_ORIGINS` includes your Vercel domain
- Check Render logs for backend errors

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Check that the build command works locally: `npm run build`
- Review Vercel build logs for specific errors

### Media Files Not Loading

- On Render free tier, media files reset on each deploy (expected behavior)
- For production, upgrade to Standard plan with disk mount or use S3
- Verify media files exist in the backend `/media` directory

### Database Connection Issues

- Check Render logs for database connection errors
- Verify PostgreSQL database is running
- Ensure database is linked to the web service
- Check that database credentials are properly set

## Production Considerations

For production deployment:

1. **Upgrade Render Plan**: Use Standard plan for:
   - Persistent disk storage for media files
   - Better performance and uptime
   - More build minutes

2. **External Storage**: Consider using AWS S3 or Google Cloud Storage for media files instead of Render disk

3. **Email Configuration**: Set up SMTP for real email notifications

4. **Domain Names**: Configure custom domains on both Render and Vercel

5. **Monitoring**: Set up Render and Vercel monitoring/alerts

## Alternative: Single-Origin Deployment (Google Cloud)

The original plan uses Google Cloud Run where backend and frontend are served from the same origin. This avoids CORS issues and is simpler for production. See README.md for Google Cloud deployment instructions.
