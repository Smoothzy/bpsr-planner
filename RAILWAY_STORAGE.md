# Railway Persistent Storage Setup

## Problem
Railway containers are ephemeral - when you redeploy, the filesystem is reset and `players.json` gets deleted.

## Solution: Add a Railway Volume

Railway provides **Volumes** for persistent data storage. Here's how to set it up:

---

## Step-by-Step Setup

### 1. Go to Your Railway Project
- Open https://railway.app
- Click on your **bpsr-planner** project

### 2. Add a Volume
1. Click on your service (the one running your backend)
2. Go to the **"Variables"** tab
3. Scroll down and find **"Volumes"** section
4. Click **"+ New Volume"**

### 3. Configure the Volume
- **Mount Path:** `/data`
- **Name:** `bpsr-data` (or any name you prefer)
- Click **"Add"**

### 4. Set Environment Variable
Still in the Variables tab:
1. Click **"+ New Variable"**
2. **Variable name:** `RAILWAY_VOLUME_MOUNT_PATH`
3. **Value:** `/data`
4. Click **"Add"**

### 5. Redeploy
Railway will automatically redeploy with the new volume attached.

---

## What This Does

The server is now configured to:
- Check if `RAILWAY_VOLUME_MOUNT_PATH` exists
- If yes (on Railway): save `players.json` to `/data/players.json` (persistent volume)
- If no (local): save to current directory (works locally)

**Result:** Your player data will survive deployments! 🎉

---

## Verification

After setup, test it:
1. Add a player to your site
2. Go to Railway dashboard
3. Click **"Deployments"** → **"Redeploy"**
4. Wait for deployment to complete
5. Check your site - the player should still be there!

---

## Alternative: Use Railway's Database (More Robust)

If you want a more professional solution, you can use Railway's PostgreSQL:

1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will provide connection URL
4. Update your server.js to use a database instead of JSON file

This is more scalable but requires more code changes.

---

## Current Status

✅ Server code updated to support volumes
✅ Ready to configure in Railway dashboard
⏳ Waiting for you to add the volume in Railway

Once you add the volume, player data will persist forever!
