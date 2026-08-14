# OpsCraft Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository with the frontend code
- Vercel account (free tier available)
- Supabase project URL and anon key
- Backend API URL (after backend deployment)

### Step 1: Push to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial commit - OpsCraft frontend"
git branch -M main
git remote add origin https://github.com/yourusername/opscraft-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (if repo contains both frontend and backend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Configure Environment Variables
In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_COMPANY_NAME=IT Operations Suite
```

### Step 4: Deploy
Click "Deploy" and Vercel will build and deploy your application.

---

## Backend Deployment (Render/Railway/Heroku)

### Option 1: Render (Recommended)

#### Prerequisites
- GitHub repository with backend code
- Render account (free tier available)
- Supabase project URL and service role key

#### Steps:
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: opscraft-backend
   - **Region**: Closest to your users
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. Add Environment Variables:
```
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

6. Click "Create Web Service"

#### Important: Enable CORS
Update your backend to allow requests from your Vercel domain:

```typescript
// In backend/src/index.ts
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}))
```

### Option 2: Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your backend repository
4. Railway will automatically detect Node.js
5. Add environment variables in the "Variables" tab
6. Deploy

### Option 3: Heroku

1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create opscraft-backend`
4. Set environment variables:
```bash
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
heroku config:set NODE_ENV=production
```
5. Deploy: `git push heroku main`

---

## Post-Deployment Steps

### 1. Update Frontend Environment Variables
After backend deployment, update the frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### 2. Redeploy Frontend
Go to Vercel dashboard → Your project → Redeploy

### 3. Test the Application
- Visit your Vercel URL
- Navigate through all pages
- Test API calls (check browser console for errors)
- Verify Supabase data loading

### 4. Configure Custom Domain (Optional)
- In Vercel: Settings → Domains → Add your domain
- Update DNS records as instructed
- In backend: Update CORS origin to include custom domain

---

## Troubleshooting

### Frontend Issues
- **Build fails**: Check logs in Vercel dashboard
- **Environment variables not working**: Redeploy after adding variables
- **API calls failing**: Verify CORS configuration on backend

### Backend Issues
- **CORS errors**: Ensure frontend URL is in CORS allowlist
- **Supabase connection failed**: Check service role key permissions
- **Port binding error**: Use PORT environment variable (not hardcoded)

### Database Issues
- **Data not loading**: Check Supabase Row Level Security (RLS) policies
- **API returns 401**: Verify service role key has proper permissions

---

## Security Notes

1. **Never commit** `.env.local` or actual API keys to git
2. **Use environment variables** for all sensitive data
3. **Enable SSL** on both frontend and backend
4. **Configure RLS policies** in Supabase for data security
5. **Rate limit** your API endpoints to prevent abuse
6. **Monitor logs** regularly for suspicious activity

---

## Cost Summary

### Free Tier Options
- **Vercel**: Free tier (100GB bandwidth/month)
- **Render**: Free tier (750 hours/month)
- **Railway**: $5 credit for new users
- **Supabase**: Free tier (500MB database, 1GB storage)

### Estimated Monthly Costs (Free Tier)
- **Frontend**: $0 (Vercel)
- **Backend**: $0 (Render free tier)
- **Database**: $0 (Supabase free tier)
- **Total**: $0/month

### Paid Tier (if needed)
- **Vercel Pro**: $20/month
- **Render Starter**: $7/month
- **Supabase Pro**: $25/month
- **Total**: ~$52/month
