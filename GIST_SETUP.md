# 🔄 GitHub Gist Multi-User Setup Guide

This guide will help you set up multi-user synchronization using GitHub Gist (no backend server required!).

## 📋 Overview

With GitHub Gist integration, your raid group can:
- ✅ Share player data in real-time
- ✅ Everyone sees the same availability
- ✅ Auto-sync every 30 seconds (optional)
- ✅ No backend server needed
- ✅ Free forever
- ✅ Works offline (falls back to local storage)

---

## 🚀 Quick Setup (5 minutes)

### For Raid Leaders (One-time setup):

#### Step 1: Get a GitHub Token
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `BPSR Planner`
4. Select only the **"gist"** scope (checkbox)
5. Click **"Generate token"** at the bottom
6. **COPY THE TOKEN** (starts with `ghp_`) - you won't see it again!

#### Step 2: Create the Gist
1. Open your BPSR Planner site
2. Scroll to the **"🔄 Multi-User Sync"** section
3. Paste your token in the **"GitHub Token"** field
4. Leave **"Gist ID"** empty (we're creating a new one)
5. Click **"📤 Save to Gist"**
6. Wait for success message
7. **COPY THE GIST ID** that appears (looks like: `abc123def456...`)

#### Step 3: Share with Your Group
Share these two things with your raid group:
- **Gist ID**: `abc123def456...`
- **Gist URL**: `https://gist.github.com/abc123def456...`

**⚠️ IMPORTANT:** Keep your TOKEN private! Only share the Gist ID, not the token!

---

### For Raid Members:

#### Step 1: Connect to the Gist
1. Open your BPSR Planner site
2. Scroll to **"🔄 Multi-User Sync"** section
3. Enter the **Gist ID** your raid leader shared
4. Leave **"GitHub Token"** empty (not needed for reading!)
5. Click **"📥 Load from Gist"**

#### Step 2: Enable Auto-Sync (Recommended)
1. Click **"🔄 Auto-Sync: OFF"** button
2. It will turn to **"ON"** and load updates every 30 seconds
3. Done! You'll always see the latest data

---

## 💡 Usage Patterns

### Pattern 1: Raid Leader Manages Everything
- **Leader**: Has token, can save and load
- **Members**: No token needed, read-only, auto-sync enabled
- **Members** add their own availability locally
- **Leader** saves everyone's data to Gist periodically

### Pattern 2: Everyone Can Update (Recommended)
- **Everyone** gets their own token
- **Everyone** can save their changes to the Gist
- Auto-merge handles conflicts (newer data wins)
- More flexible and democratic

### Pattern 3: Hybrid Approach
- **Few trusted officers** have tokens
- **Regular members** read-only with auto-sync
- Officers can update when members share their availability via Discord

---

## 🔧 How It Works

### Data Flow:
```
Your Browser → GitHub Gist → Other Browsers
     ↓              ↓              ↓
localStorage    Cloud Storage   localStorage
```

### Conflict Resolution:
- When loading from Gist, it **merges** with local data
- Newer entries (by timestamp) always win
- Your local data is never deleted
- Safe to use by multiple people simultaneously

### Auto-Sync:
- Checks Gist every 30 seconds
- Only updates if there are changes
- Minimal API usage (won't hit rate limits)
- Can be toggled on/off anytime

---

## ❓ FAQ

### Do I need a GitHub account?
**Reading data:** No! You can load from a public Gist without an account.
**Writing data:** Yes, you need an account to get a token.

### Is the data public?
**Yes**, Gists are public by default. Don't put sensitive info in player names. Use in-game names or nicknames only.

### What if I lose my token?
Generate a new token and update it in the planner. The Gist ID stays the same.

### Can I use this offline?
Yes! It falls back to localStorage. When you're back online, sync to see updates.

### What are the rate limits?
GitHub allows 5,000 API requests/hour for authenticated users. With auto-sync (30s interval), that's 120 requests/hour. You won't hit limits.

### How many players can it support?
Hundreds! The Gist size limit is 10MB. Your player data is tiny in comparison.

### Can I have multiple raid groups?
Yes! Create different Gists for different groups. Switch Gist IDs as needed.

### What if two people save at the same time?
The auto-merge system handles it. Both changes are preserved based on timestamps.

---

## 🛠️ Troubleshooting

### "Failed to load Gist: 404"
- Check the Gist ID is correct (no spaces)
- Make sure the Gist exists and is public

### "Failed to save: 401"
- Your token is invalid or expired
- Generate a new token
- Make sure you selected the "gist" scope

### "Failed to save: 403"
- You don't have permission to update this Gist
- You need to create your own Gist or get a token from the owner

### Auto-sync not working
- Check your internet connection
- Make sure you clicked "🔄 Auto-Sync" to turn it ON
- Check browser console (F12) for errors

### Data not appearing
- Click "📥 Load from Gist" manually
- Check the Gist URL to see if data is there
- Try refreshing the page

---

## 🔐 Security Notes

- ✅ Tokens are stored in localStorage (browser-only)
- ✅ Tokens are not synced with the Gist
- ✅ Gists are public but not indexed by search engines
- ⚠️ Don't share your personal token
- ⚠️ Don't put real names or sensitive info

---

## 📊 Example Workflow

**Monday Morning:**
1. Raid leader creates Gist with token
2. Shares Gist ID in Discord
3. All members connect and enable auto-sync

**Throughout the Week:**
4. Members update their availability anytime
5. Leader saves to Gist periodically
6. Everyone's data stays in sync

**Saturday (Raid Day):**
7. Everyone sees the same raid times
8. Use Advanced Raid Finder to find optimal slots
9. Coordinate in Discord and raid together!

---

## 🎯 Best Practices

1. **Enable Auto-Sync**: Set it and forget it
2. **Save After Changes**: Click "📤 Save to Gist" after updating availability
3. **Load Before Planning**: Click "📥 Load from Gist" before making raid schedules
4. **Keep Token Private**: Never share your token in Discord/screenshots
5. **Backup Locally**: Your localStorage is your backup if Gist has issues

---

## 🆘 Need Help?

- Check the [GitHub Gist Documentation](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists)
- Open an issue on the project repository
- Ask in your guild Discord

---

**Enjoy coordinated raiding!** 🎮✨
