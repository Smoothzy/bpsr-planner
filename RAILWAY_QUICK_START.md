# 🚂 Quick Railway Deployment Checklist

## ✅ Step-by-Step Guide

### 1️⃣ Go to Railway
**URL:** https://railway.app

**Action:** Click "Start a New Project" or "Login"

**Login with:** Your GitHub account (Smoothzy)

---

### 2️⃣ Create New Project
**Click:** "New Project" button (top right)

**Select:** "Deploy from GitHub repo"

**Choose:** `Smoothzy/bpsr-planner`

**Wait:** Railway will detect Node.js automatically (~1-2 min)

---

### 3️⃣ Get Your Railway URL
**Go to:** Settings tab in your Railway project

**Find:** "Domains" section

**Click:** "Generate Domain" if not auto-generated

**Copy:** Your URL (looks like: `https://bpsr-planner-production.up.railway.app`)

---

### 4️⃣ Update Frontend API URL
Open `script.js` and find line 11:

**Change this:**
```javascript
const API_URL = window.location.origin;
```

**To this (use YOUR Railway URL):**
```javascript
const API_URL = 'https://your-app-name.up.railway.app';
```

⚠️ **Important:** 
- No trailing slash at the end!
- Replace `your-app-name` with your actual Railway domain
- Keep the `https://` part

---

### 5️⃣ Commit and Push
```powershell
git add script.js
git commit -m "Connect frontend to Railway backend"
git push origin main
```

Wait 2-3 minutes for GitHub Pages to update.

---

### 6️⃣ Test It!
1. **Open:** https://smoothzy.github.io/bpsr-planner/
2. **Press F12** to open browser console
3. **Look for:** "Loaded X players from server" message
4. **Add a test player**
5. **Open another tab** to the same URL
6. **Verify:** Player appears in both tabs

---

## 🎯 What to Look For

### ✅ Success Signs
- Railway shows "Deployed" status with green checkmark
- Browser console shows "Loaded X players from server"
- No red errors in console
- Adding a player shows success message
- Data syncs between multiple tabs

### ❌ Common Issues

**"Application failed to respond"**
- Solution: Check Railway logs for errors
- Fix: Restart the Railway service

**CORS errors in console**
- Solution: Check API_URL in script.js is correct
- Fix: Remove any trailing slashes

**"Cannot GET /api/players"**
- Solution: API_URL doesn't match Railway URL
- Fix: Copy exact URL from Railway (including https://)

---

## 📊 Railway Dashboard Overview

### Tabs You'll Use:
- **Deployments:** See build/deploy status and logs
- **Metrics:** Monitor CPU, memory, network usage
- **Settings:** Get your domain URL, restart service
- **Variables:** Add environment variables (optional)

### Important Buttons:
- **View Logs:** Real-time server output
- **Restart:** Restart your server if needed
- **Generate Domain:** Get a public URL

---

## 💰 Cost Breakdown

**Free Tier:**
- $5 credit per month
- Resets every month
- Your app will likely use < $1/month

**If you need more:**
- Developer plan: $5/month
- Includes $5 credit + extra resources

---

## 🔗 Quick Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Your Repository:** https://github.com/Smoothzy/bpsr-planner
- **Your GitHub Pages:** https://smoothzy.github.io/bpsr-planner/
- **Railway Docs:** https://docs.railway.app

---

## 📝 Example URLs

**Your current setup:**
- Frontend (GitHub Pages): `https://smoothzy.github.io/bpsr-planner/`
- Backend (Local): `http://localhost:3000`
- Backend (Railway): `https://your-app.up.railway.app` ← You'll get this!

**After deployment:**
- Frontend calls Railway backend
- Everyone shares the same data
- Auto-sync every 30 seconds

---

## 🆘 Need Help?

**Check Railway Logs:**
1. Go to Railway dashboard
2. Click your project
3. Click "Deployments" tab
4. Click the latest deployment
5. View build and runtime logs

**Common Log Messages:**
- ✅ "Server running on port XXX" = Good!
- ✅ "API Endpoints:" = Server started successfully
- ❌ "Error: Cannot find module" = Dependencies issue
- ❌ "Port already in use" = Railway will handle this

---

## ✨ Final Check

Before you share with your raid group:

- [ ] Railway deployment shows "Active" status
- [ ] You copied the Railway URL
- [ ] Updated `API_URL` in script.js
- [ ] Committed and pushed to GitHub
- [ ] Waited 2-3 minutes for GitHub Pages to update
- [ ] Tested adding a player
- [ ] Tested opening multiple tabs
- [ ] No errors in browser console (F12)

---

## 🎉 Ready to Share!

Once everything works, share this with your raid group:

**🔗 https://smoothzy.github.io/bpsr-planner/**

Everyone can add themselves and the data automatically syncs!

No tokens, no manual steps, just works! 🚀
