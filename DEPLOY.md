# 🚀 GitHub Pages Deployment Guide

Follow these steps to publish your Moonlight Raid Planner on GitHub Pages.

## Step 1: Create a GitHub Account
1. Go to [github.com](https://github.com)
2. Click "Sign up" and follow the registration process
3. Verify your email address

## Step 2: Create a New Repository

1. Click the **+** icon in the top-right corner
2. Select **"New repository"**
3. Fill in the details:
   - **Repository name**: `bpsr-planner` (or any name you prefer)
   - **Description**: "Blue Protocol Star Resonance Raid Planner - Timezone-aware raid scheduling tool"
   - **Visibility**: Public (required for free GitHub Pages)
   - **Initialize**: Leave unchecked (we have files already)
4. Click **"Create repository"**

## Step 3: Upload Your Files

### Option A: Using GitHub Web Interface (Easiest)

1. On your new repository page, click **"uploading an existing file"**
2. Select ALL files from your `bpsr_planner` folder:
   - index.html
   - players-overview.html
   - raid-finder.html
   - styles.css
   - dark-mode.css
   - script.js
   - README.md
   - .gitignore
3. Add a commit message: "Initial commit - Moonlight Raid Planner"
4. Click **"Commit changes"**

### Option B: Using Git Command Line (Advanced)

Open PowerShell in your project folder and run:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Moonlight Raid Planner"

# Add GitHub remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top menu)
3. Click **"Pages"** (left sidebar)
4. Under **"Source"**, select:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **"Save"**
6. Wait 1-2 minutes for deployment

## Step 5: Access Your Site

Your site will be live at:
```
https://YOUR-USERNAME.github.io/REPO-NAME/
```

Example: `https://johndoe.github.io/bpsr-planner/`

## Step 6: Update README with Live URL

1. Edit README.md on GitHub
2. Update the "Live Demo" section with your actual URL
3. Commit the change

---

## 🎯 Quick Checklist

- [ ] GitHub account created
- [ ] New repository created
- [ ] All files uploaded
- [ ] GitHub Pages enabled in Settings
- [ ] Site is live and working
- [ ] README updated with live URL

---

## 🔧 Troubleshooting

### Site showing 404
- Wait 5 minutes after enabling Pages (can take time to build)
- Check that files are in the root folder (not in a subfolder)
- Verify index.html exists and is spelled correctly

### CSS/JS not loading
- Check that file paths are relative (no absolute paths)
- Clear browser cache and hard refresh (Ctrl+F5)

### Changes not appearing
- Changes can take 1-2 minutes to deploy
- Check the "Actions" tab to see build status
- Try clearing browser cache

---

## 📱 Sharing Your Planner

Once live, share your URL with your raid group:
- Discord
- Guild chat
- Social media
- Bookmark it for quick access

---

## 🔄 Updating Your Site

To make changes after initial deployment:

### Via GitHub Web:
1. Go to your repository
2. Click on the file you want to edit
3. Click the pencil icon (Edit)
4. Make changes
5. Commit changes
6. Wait 1-2 minutes for auto-deployment

### Via Git Command Line:
```powershell
# Make your changes to files
git add .
git commit -m "Description of changes"
git push
```

---

## 🎨 Optional: Custom Domain

If you own a domain name:
1. Go to Settings → Pages
2. Enter your custom domain
3. Follow GitHub's DNS configuration guide
4. Enable "Enforce HTTPS"

---

**Need help?** Check the [GitHub Pages documentation](https://docs.github.com/en/pages) or open an issue in your repository.

**Good luck!** 🚀
