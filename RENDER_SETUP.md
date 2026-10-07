# Render + Vercel Deployment Setup

Your project is now ready for deployment with:
- **Backend**: Render (Django + PostgreSQL)
- **Frontend**: Vercel (React)

## Quick Start

### 1. Deploy Backend to Render

```bash
# Push your code to GitHub
git add .
git commit -m "Add Render deployment configuration"
git push origin main

# Then go to https://render.com
# 1. Sign in with GitHub
# 2. Click "New +" → "Blueprint"
# 3. Connect your repository
# 4. Review the render.yaml configuration
# 5. Click "Apply" to deploy
```

### 2. Configure CORS on Render

After backend deployment:
1. Copy your Render backend URL (e.g., `https://tbb-backend.onrender.com`)
2. Go to Environment Variables in Render dashboard
3. Set `CORS_ORIGINS` to `https://*.vercel.app` (temporary)
4. Save changes to redeploy

### 3. Deploy Frontend to Vercel

```bash
# Option 1: Via Vercel Dashboard
# 1. Go to https://vercel.com
# 2. Click "Add New Project"
# 3. Import your GitHub repository
# 4. Set Root Directory: `frontend`
# 5. Set Build Command: `npm run build`
# 6. Set Output Directory: `dist`
# 7. Add Environment Variable: VITE_API_URL=https://your-render-backend.onrender.com/api
# 8. Click "Deploy"

# Option 2: Via CLI
cd frontend
npm i -g vercel
vercel login
vercel
```

### 4. Update CORS with Vercel Domain

After Vercel deployment:
1. Copy your Vercel app URL (e.g., `https://your-app.vercel.app`)
2. Go back to Render → Environment Variables
3. Update `CORS_ORIGINS` to your specific Vercel domain
4. Save changes to redeploy backend

## Files Created/Modified

### New Files
- `render.yaml` - Render Blueprint configuration
- `.env.render.example` - Environment variables template for Render
- `backend/start.sh` - Startup script for migrations and seeding
- `RENDER_SETUP.md` - This file

### Modified Files
- `Dockerfile` - Added start.sh script execution
- `backend/config/settings.py` - Updated CORS settings for Render
- `VERCEL_DEPLOYMENT.md` - Updated with Render backend instructions

## Important Notes

### Media Files
- **Free Tier**: Media files (photos) will be lost on each redeploy
- **Production**: Upgrade to Render Standard plan with disk mount, or use AWS S3

### Database
- PostgreSQL is automatically created and linked via render.yaml
- Migrations run automatically on each deploy
- Initial content (desks, people) is seeded on first deploy

### CORS
- Critical for frontend-backend communication
- Must be configured with your actual Vercel domain
- Set to `https://*.vercel.app` initially, then update to specific domain

### Environment Variables
Backend (Render):
- Most are auto-configured in render.yaml
- Update `CORS_ORIGINS` after Vercel deployment
- Optional: Configure email settings for notifications

Frontend (Vercel):
- `VITE_API_URL` - Your Render backend URL + `/api`

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify database is linked properly
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct in Vercel
- Check `CORS_ORIGINS` in Render includes your Vercel domain
- Check browser console for CORS errors

### Media files not loading
- Expected on Render free tier (resets on redeploy)
- For production, upgrade to Standard plan with disk mount

## Next Steps

1. **Push to GitHub** - Ensure all changes are committed
2. **Deploy to Render** - Follow the steps above
3. **Deploy to Vercel** - Connect to Render backend
4. **Test** - Verify all functionality works
5. **Production** - Consider upgrading Render plan for persistent storage

## Alternative: Google Cloud

The original plan uses Google Cloud Run where backend and frontend are served from the same origin. This avoids CORS and is simpler for production. See README.md for Google Cloud deployment instructions if you prefer that approach.
