# Railway Deployment Guide for BPSR Planner

## 🚂 Deploy Your Backend to Railway in 5 Minutes!

Railway is the easiest way to deploy your Node.js backend. It's free to start and auto-deploys from your GitHub repository.

---

## Step 1: Create a Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up using your **GitHub account** (recommended for easy deployment)

---

## Step 2: Push Your Code to GitHub

First, make sure all your backend files are committed and pushed to your repository:

```powershell
# Check what files need to be committed
git status

# Add all files
git add .

# Commit with a message
git commit -m "Add backend server for automatic data sync"

# Push to GitHub
git push origin main
```

---

## Step 3: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **In Railway Dashboard:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository: **`Smoothzy/bpsr-planner`**
   - Railway will automatically detect it's a Node.js project

2. **Railway will automatically:**
   - Install dependencies (`npm install`)
   - Run your server (`npm start`)
   - Assign a public URL

3. **Wait for deployment** (usually 1-2 minutes)
   - You'll see build logs in real-time
   - Look for "Deployment successful" message

4. **Get your URL:**
   - Click on your deployment
   - Find the **"Settings"** tab
   - Under **"Domains"**, you'll see your Railway URL
   - It looks like: `https://bpsr-planner-production.up.railway.app`

### Option B: Deploy from CLI

```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## Step 4: Configure Environment Variables (Optional)

Railway automatically sets the `PORT` variable, but you can add custom ones:

1. Go to your project in Railway
2. Click **"Variables"** tab
3. Add variables if needed:
   - `NODE_ENV=production`

---

## Step 5: Update Your Frontend

Once deployed, copy your Railway URL and update `script.js`:

```javascript
// Find this line in script.js (around line 11):
const API_URL = window.location.origin;

// Replace with your Railway URL:
const API_URL = 'https://your-app-name.up.railway.app';
```

**Important:** Don't include a trailing slash!

Then commit and push:

```powershell
git add script.js
git commit -m "Update API URL to Railway backend"
git push origin main
```

Your GitHub Pages site will update automatically in a few minutes!

---

## Step 6: Test Your Deployment

1. **Visit your GitHub Pages site:**
   - https://smoothzy.github.io/bpsr-planner/

2. **Open browser console** (F12)
   - Look for messages like "Loaded X players from server"
   - Check for any red error messages

3. **Add a test player:**
   - Fill out the form
   - Click "Save / Update Player"
   - Watch for the success message

4. **Open a new browser tab/window:**
   - Go to the same URL
   - You should see the test player
   - Try adding another player
   - Both tabs should sync within 30 seconds!

---

## Common Issues & Solutions

### ❌ "Application failed to respond"
- **Cause:** Server isn't starting properly
- **Fix:** Check Railway logs for errors
- **Verify:** `package.json` has correct start script

### ❌ "CORS Error" in browser console
- **Cause:** Frontend and backend on different domains
- **Fix:** CORS is already enabled in `server.js`, should work fine
- **Double-check:** Railway URL in `script.js` is correct

### ❌ "Cannot GET /api/players"
- **Cause:** Wrong API URL in frontend
- **Fix:** Make sure `API_URL` in `script.js` matches your Railway URL exactly
- **No trailing slash:** Use `https://app.railway.app` not `https://app.railway.app/`

### ❌ Build fails
- **Cause:** Missing dependencies or syntax errors
- **Fix:** Check Railway build logs
- **Test locally first:** Run `npm install && npm start` locally

---

## Railway Features You Get

✅ **Free Tier:** $5 credit per month (enough for hobby projects)  
✅ **Auto-deploy:** Pushes to GitHub automatically redeploy  
✅ **HTTPS:** Free SSL certificates included  
✅ **Logs:** View real-time server logs  
✅ **Metrics:** CPU, memory, bandwidth usage  
✅ **Custom domains:** Add your own domain (optional)  

---

## Monitoring Your Deployment

### View Logs
1. Go to your Railway project
2. Click **"Deployments"** tab
3. Click on the active deployment
4. View real-time logs

### Check Metrics
1. Click **"Metrics"** tab
2. See CPU, Memory, Network usage
3. Monitor for any issues

### Restart Service
If something goes wrong:
1. Click **"Settings"** tab
2. Click **"Restart"** button
3. Service will restart in ~10 seconds

---

## What Happens After Deployment

### Automatic Sync Flow
1. User opens https://smoothzy.github.io/bpsr-planner/
2. Frontend loads and calls your Railway backend
3. Backend reads `players.json` and returns data
4. User adds/updates a player
5. Frontend saves to Railway backend
6. Backend writes to `players.json`
7. All other users get the update within 30 seconds!

### Data Persistence
- Railway provides **persistent storage**
- Your `players.json` file survives restarts
- Data is safe and won't be lost

---

## Cost Estimate

Railway pricing (as of 2024):
- **Free tier:** $5 credit/month (resets monthly)
- **Hobby project usage:** ~$0.50-2/month
- **Your app will likely stay free** unless you get massive traffic

If you exceed free tier:
- Upgrade to **Developer plan** ($5/month)
- Gets you $5 credit + $0.01/GB bandwidth

---

## Quick Command Reference

```powershell
# Commit and push changes
git add .
git commit -m "Your message"
git push origin main

# Check Git status
git status

# View recent commits
git log --oneline -5

# Create a new branch (optional)
git checkout -b railway-deploy
```

---

## Need Help?

1. **Railway Docs:** https://docs.railway.app
2. **Railway Discord:** https://discord.gg/railway
3. **Check Railway status:** https://status.railway.app

---

## Success Checklist

Before you finish, verify:

- ✅ Backend pushed to GitHub
- ✅ Railway project created and deployed
- ✅ Railway URL obtained
- ✅ `script.js` updated with Railway URL
- ✅ Changes pushed to GitHub
- ✅ GitHub Pages updated (wait 2-3 minutes)
- ✅ Tested adding a player
- ✅ Tested multi-tab sync
- ✅ No errors in browser console

---

## 🎉 You're Done!

Your raid planner is now fully deployed with automatic backend sync!

Share your GitHub Pages URL with your raid group:
**https://smoothzy.github.io/bpsr-planner/**

Everyone can now add themselves and the data syncs automatically! 🚀
