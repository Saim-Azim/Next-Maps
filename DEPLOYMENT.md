# 🚀 Deployment Guide: Railway + Netlify

## Architecture
- **Backend (Express)**: Railway → https://your-app.up.railway.app
- **Frontend (Next.js)**: Netlify → https://your-site.netlify.app

---

## 📦 Part 1: Deploy Backend to Railway

### Step 1: Sign Up for Railway
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `location-address-finder` repository
4. Railway will automatically detect it's a Node.js app

### Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
PORT=4000
OLLAMA_URL=http://localhost:11434
CACHE_TTL_SECONDS=86400
SIMILARITY_THRESHOLD=0.85
DISTANCE_THRESHOLD_METERS=500
NODE_ENV=production
```

**Note**: Ollama won't work on Railway (no GPU). The app will use fallback embeddings automatically.

### Step 4: Configure Deployment
1. Go to Settings → Deploy
2. **Root Directory**: Leave empty (default)
3. **Build Command**: `npm install`
4. **Start Command**: `npm run backend`
5. Click "Deploy"

### Step 5: Get Your Backend URL
1. Once deployed, go to Settings → Domains
2. Click "Generate Domain"
3. You'll get a URL like: `https://location-address-finder-production-abc123.up.railway.app`
4. **Copy this URL** - you'll need it for Netlify!

### Step 6: Test Backend
Visit: `https://your-railway-url.up.railway.app/health`

You should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## 🌐 Part 2: Deploy Frontend to Netlify

### Step 1: Configure Netlify (Already Done!)
Your site is already on Netlify, now we just need to configure it properly.

### Step 2: Update Environment Variables in Netlify
1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add this variable:

```
Key: NEXT_PUBLIC_API_URL
Value: https://your-railway-url.up.railway.app
```

**Replace with YOUR actual Railway URL!**

### Step 3: Update Build Settings
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Set:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18

### Step 4: Trigger Redeploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to finish (~2-3 minutes)

### Step 5: Test Your App
1. Visit your Netlify URL: `https://your-site.netlify.app`
2. Try entering an address
3. Check if autocomplete works
4. Verify the map loads

---

## ✅ Verification Checklist

### Backend (Railway)
- [ ] Backend deployed successfully
- [ ] Health endpoint works: `/health`
- [ ] Autocomplete endpoint works: `/api/autocomplete?query=pune`
- [ ] Geocode endpoint works: `/api/geocode` (POST)

### Frontend (Netlify)
- [ ] Site loads without 404 error
- [ ] Location input appears
- [ ] Autocomplete suggestions appear when typing
- [ ] Map displays when address is found
- [ ] Address fields populate correctly

### Integration
- [ ] Frontend can reach backend API
- [ ] No CORS errors in browser console
- [ ] Cache hit/miss indicators work

---

## 🔧 Troubleshooting

### Issue: Netlify shows "Page not found"
**Solution**: 
- Ensure `netlify.toml` is committed and pushed
- Check build settings in Netlify dashboard
- Redeploy with "Clear cache"

### Issue: Backend API not responding
**Solution**:
- Check Railway logs: Dashboard → View Logs
- Verify environment variables are set
- Ensure `npm run backend` works locally

### Issue: CORS errors
**Solution**:
The backend already has CORS enabled. If you still see errors, verify:
- `NEXT_PUBLIC_API_URL` is set correctly in Netlify
- Railway backend URL is correct
- No typos in the URL

### Issue: Ollama embeddings not working
**Solution**:
This is expected on Railway (no Ollama support). The app automatically falls back to hash-based embeddings. Semantic caching still works, just slightly less accurate.

---

## 💰 Costs

### Railway
- **Free Tier**: $5 credit/month (~500 hours)
- Good for: Development, demos, low traffic
- **Hobby Plan**: $5/month for more resources

### Netlify
- **Free Tier**: 100GB bandwidth, 300 build minutes/month
- Good for: Personal projects, demos
- **Pro Plan**: $19/month if you need more

---

## 🔄 Making Updates

After making code changes:

```bash
# Commit and push to GitHub
git add .
git commit -m "Your changes description"
git push origin master
```

- **Railway**: Auto-deploys from GitHub (if connected)
- **Netlify**: Auto-deploys from GitHub

Both will rebuild automatically!

---

## 🎯 URLs Summary

After deployment, save these URLs:

```
Frontend (Netlify): https://your-site.netlify.app
Backend (Railway):  https://your-app.up.railway.app
Backend Health:     https://your-app.up.railway.app/health
Backend API:        https://your-app.up.railway.app/api
GitHub Repo:        https://github.com/Saim-Azim/location-address-finder
```

---

## 📊 Monitoring

### Railway Dashboard
- View logs
- Check CPU/Memory usage
- Monitor deployments

### Netlify Dashboard
- View deploy logs
- Check build status
- Monitor bandwidth usage

---

**🎉 Deployment Complete!**
Your app is now live with Railway (backend) + Netlify (frontend).
