# Quick Start Deployment Guide

## Ready to Deploy! 🚀

Your OpsCraft application is now ready for deployment. Both frontend and backend builds pass successfully.

---

## Step 1: Deploy Backend First (Render)

1. **Push backend to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend ready for deployment"
   git remote add origin https://github.com/yourusername/opscraft-backend.git
   git push -u origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: opscraft-backend
     - **Runtime**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Add environment variables (see `.env.example`)
   - Click "Create Web Service"

3. **Copy your backend URL** (e.g., `https://opscraft-backend.onrender.com`)

---

## Step 2: Deploy Frontend (Vercel)

1. **Push frontend to GitHub**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Frontend ready for deployment"
   git remote add origin https://github.com/yourusername/opscraft-frontend.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework**: Next.js
     - **Build Command**: `npm run build`
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_API_URL=https://opscraft-backend.onrender.com
     NEXT_PUBLIC_COMPANY_NAME=IT Operations Suite
     ```
   - Click "Deploy"

---

## Step 3: Update Backend CORS

After you get your Vercel URL, update the backend CORS:

1. Go to Render dashboard → Your backend service
2. Add/Update environment variable:
   ```
   CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
   ```
3. Redeploy the backend

---

## Important Files Created

### Frontend
- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.example` - Environment variable template
- ✅ `.gitignore` - Git ignore file

### Backend
- ✅ `.env.example` - Environment variable template
- ✅ `.gitignore` - Git ignore file
- ✅ Updated `src/index.ts` - CORS configuration for production

### Documentation
- ✅ `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- ✅ `QUICK_DEPLOY.md` - This quick start guide

---

## Environment Variables Needed

### Frontend (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_COMPANY_NAME=IT Operations Suite
```

### Backend (Render)
```
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
```

---

## Build Status

### Frontend Build: ✅ SUCCESS
```
✓ Compiled successfully
✓ Generating static pages (11/11)
Route (app)                              Size     First Load JS
┌ ○ /                                    112 kB          263 kB
├ ○ /_not-found                          877 B          88.4 kB
├ ○ /clients                             2.99 kB         154 kB
├ ○ /employees                           2.91 kB         154 kB
├ ○ /invoices                            2.91 kB         154 kB
├ ○ /leaves                              2.91 kB         154 kB
├ ○ /payroll                             2.59 kB         154 kB
├ ○ /projects                            3.26 kB         154 kB
└ ○ /timesheets                          2.62 kB         154 kB
```

### Backend Build: ✅ SUCCESS
```
✓ TypeScript compilation successful
```

---

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] CORS configured with frontend URL
- [ ] Environment variables set correctly
- [ ] Test all pages load correctly
- [ ] Test API calls (check browser console)
- [ ] Verify Supabase data loads
- [ ] Test forms (create employee, project, etc.)
- [ ] Verify navigation works

---

## Troubleshooting

### Frontend shows blank page
- Check Vercel deployment logs
- Verify environment variables are set
- Check browser console for errors

### API calls failing
- Verify backend is running
- Check CORS configuration
- Ensure NEXT_PUBLIC_API_URL is correct
- Check backend logs for errors

### Supabase connection issues
- Verify Supabase URL and keys
- Check RLS policies in Supabase
- Ensure service role key has proper permissions

---

## Next Steps

1. **Deploy Backend** to Render using the steps above
2. **Deploy Frontend** to Vercel
3. **Configure CORS** on backend with your Vercel URL
4. **Test thoroughly** all functionality
5. **Set up custom domain** (optional)
6. **Monitor logs** regularly

---

## Cost Summary

**Free Tier:**
- Frontend (Vercel): $0/month
- Backend (Render): $0/month  
- Database (Supabase): $0/month
- **Total: $0/month**

**Pro Tier (if needed):**
- Frontend (Vercel Pro): $20/month
- Backend (Render Starter): $7/month
- Database (Supabase Pro): $25/month
- **Total: ~$52/month**

---

## Support

For detailed deployment instructions, see `DEPLOYMENT_GUIDE.md`

For issues with specific platforms:
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- Supabase: https://supabase.com/docs
