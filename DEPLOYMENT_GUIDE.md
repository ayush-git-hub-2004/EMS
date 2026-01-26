# 🚀 Deployment Guide: Employee Management System

## Overview
This guide walks you through deploying your full-stack app to get live links for sharing with friends.

- **Frontend**: [Vercel](https://vercel.com) (React/Vite) - **FREE**
- **Backend**: [Railway](https://railway.app) (Node.js/Express) - **FREE**

---

## Part 1: Deploy Backend to Railway

### Step 1: Prepare Backend for Deployment

1. **Update `backend/.env` for production:**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=production
   ```

2. **Ensure `backend/server.js` uses environment variables:**
   ```js
   const PORT = process.env.PORT || 5000;
   ```

3. **Add `.gitignore` to backend (if not present):**
   ```
   node_modules/
   .env
   .DS_Store
   ```

### Step 2: Push Code to GitHub

1. Create a GitHub account (if you don't have one): https://github.com
2. Create a new repository
3. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 3: Deploy Backend to Railway

1. Go to https://railway.app
2. Click **"Create New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects it's a Node.js project
5. **Add MongoDB Plugin:**
   - In Railway dashboard → Click **"+ Add"** → Select **MongoDB**
   - Railway automatically links the MongoDB URI to your app
6. **Set Environment Variables:**
   - In Railway → Variables section
   - Add: `NODE_ENV=production`
7. **Deploy:**
   - Railway auto-deploys when you push to GitHub
   - Click your project → **Deployments** → Wait for green checkmark
8. **Get Your Backend URL:**
   - In Railway → Click your project
   - Copy the **Public URL** (looks like: `https://your-app-production.up.railway.app`)
   - This is your **LIVE BACKEND URL** ✅

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"** → Use GitHub account to login

### Step 2: Update Frontend API URL

**Before deploying, update the frontend to use your live backend:**

1. Open `frontend/src/services/api.js`
2. Change the API base URL:
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-railway-url.up.railway.app/api';
   
   // Or simply hardcode for now:
   // const API_BASE_URL = 'https://your-app-production.up.railway.app/api';
   ```

3. Push this change to GitHub:
   ```bash
   git add frontend/src/services/api.js
   git commit -m "Update API URL for production"
   git push
   ```

### Step 3: Deploy Frontend with Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```
6. Click **"Deploy"**
7. Wait for the build to complete (usually 1-2 minutes)
8. Once done, you'll get a **live URL** like: `https://your-app.vercel.app` ✅

---

## Part 3: Test Your Live Deployment

1. Visit your **Vercel frontend URL** in a browser
2. Try logging in with test credentials
3. Test CRUD operations (Add, Edit, Delete)
4. Check the **Network tab** in DevTools to confirm API calls go to your Railway backend

---

## Part 4: Share Live Links with Friends

You now have two live URLs to share:

### **Frontend (User-facing):**
```
https://your-app.vercel.app
```
→ Share this link with friends!

### **Backend API (For reference):**
```
https://your-app-production.up.railway.app/api
```

---

## Troubleshooting

### "Cannot POST /api/auth/login" Error
**Solution:** Check that your frontend API URL matches your Railway backend URL.

### MongoDB Connection Issues
**Solution:** Ensure Railway's MongoDB plugin is active. Go to Railway dashboard → Variables → Check `MONGODB_URI` is set.

### CORS Errors
**Solution:** Update `backend/server.js` to allow your Vercel frontend:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Build Failed on Vercel
**Solution:** 
- Check build logs in Vercel dashboard
- Ensure `frontend/vite.config.js` is correct
- Try removing `node_modules` locally and `npm install` again

---

## Auto-Deployment (Bonus)

Both Railway and Vercel automatically redeploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your change description"
git push origin main

# Automatically deploys to both services! 🎉
```

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Railway** | 5GB RAM + 100GB storage | $5/month+ if you exceed |
| **Vercel** | Unlimited deployments | FREE (Hobby plan) |
| **MongoDB** (Railway) | Included | FREE |
| **Total** | | FREE (if you stay under Railway limits) |

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Railway
3. ✅ Deploy frontend to Vercel
4. ✅ Update API URL
5. ✅ Test everything
6. ✅ Share links with friends!

Good luck! 🚀
