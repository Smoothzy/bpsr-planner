# 🎉 NO TOKENS REQUIRED! Multi-User Setup Guide

Your raid planner now uses **JSONBin** for cloud storage - **everyone can save without any tokens or accounts!**

---

## 🚀 Quick Setup (2 minutes)

### For Raid Leaders (One-time setup):

1. Open your planner: https://smoothzy.github.io/bpsr-planner/
2. Scroll to **"🔄 Multi-User Sync"** section
3. Leave the **"Shared Storage ID"** field empty
4. Click **"📤 Save to Cloud"**
5. Wait for success message
6. **COPY THE STORAGE ID** that appears (e.g., `66f1234567890abcdef`)
7. Share that ID in your Discord/guild chat

---

### For Raid Members:

1. Open the planner: https://smoothzy.github.io/bpsr-planner/
2. Get the **Storage ID** from your raid leader
3. Paste it in the **"Shared Storage ID"** field
4. Click **"📥 Load from Cloud"** to see everyone's data
5. Add your own availability
6. Click **"📤 Save to Cloud"** - NO TOKEN NEEDED!
7. (Optional) Click **"🔄 Auto-Sync: OFF"** to turn it ON

---

## ✨ What Changed?

**Before (GitHub Gist):**
- ❌ Required GitHub account
- ❌ Required token to save
- ❌ Only leader/officers could update
- ✅ Members could only read

**Now (JSONBin):**
- ✅ NO accounts needed
- ✅ NO tokens needed
- ✅ **EVERYONE can save!**
- ✅ Everyone can update their availability
- ✅ Auto-merge handles conflicts

---

## 🎯 Workflow

### Simple Workflow:
1. **Leader** creates storage (one-time)
2. **Leader** shares the Storage ID
3. **Everyone** enters the same ID
4. **Everyone** adds their availability
5. **Everyone** clicks "Save to Cloud"
6. **Everyone** sees all updates!

### With Auto-Sync:
1. Everyone enables **"🔄 Auto-Sync: ON"**
2. Updates sync every 30 seconds automatically
3. Always see the latest data
4. No manual refresh needed

---

## 💡 Features

### What Everyone Can Do:
- ✅ Add their own player info
- ✅ Update their availability
- ✅ Save to cloud (no restrictions!)
- ✅ Load latest data
- ✅ Enable auto-sync
- ✅ Works offline (syncs when back online)

### How Conflicts Are Handled:
- Newest data wins (by timestamp)
- Your local data is never deleted
- Safe for multiple people to save simultaneously
- Smart auto-merge

---

## 🔧 How To Use

### First Time:
```
1. Leader clicks "Save to Cloud" (creates new storage)
2. Leader shares the ID
3. Members paste ID and click "Load from Cloud"
4. Everyone enables Auto-Sync
```

### Daily Use:
```
1. Open planner
2. Update your availability
3. Click "Save to Cloud"
4. Done! (Or just let Auto-Sync handle it)
```

---

## ❓ FAQ

### Do I need an account?
**NO!** No accounts, no tokens, no authentication required.

### Is there a limit?
Free tier allows plenty of updates. You won't hit limits for a raid group.

### What if two people save at the same time?
The system auto-merges based on timestamps. Both changes are preserved.

### Can I use this offline?
Yes! It saves locally first, then syncs when you're online.

### What if I don't have the Storage ID?
Ask your raid leader. Only one person needs to create it once.

### How do I create a new storage?
Leave the Storage ID field empty and click "Save to Cloud". A new ID will be generated.

### Can we have multiple groups?
Yes! Create different Storage IDs for different groups. Switch IDs as needed.

---

## 🎮 Example Workflow

**Monday:**
- Leader creates storage: `abc123`
- Posts in Discord: "Use Storage ID: abc123"

**Tuesday-Friday:**
- Members paste ID and load data
- Everyone adds their availability
- Everyone clicks "Save to Cloud"
- Auto-sync keeps everyone updated

**Saturday (Raid Day):**
- Everyone sees the same schedule
- Use Advanced Raid Finder for optimal times
- Coordinate in Discord
- Raid together!

---

## 🆘 Troubleshooting

**"Failed to load: 404"**
- Check the Storage ID is correct (no spaces)
- Make sure someone has saved data first

**"Failed to save"**
- Check your internet connection
- Try again in a few seconds

**Auto-sync not working**
- Make sure you clicked the button to turn it ON
- Check if the button shows "ON" and is highlighted

**Data not syncing**
- Click "Load from Cloud" manually
- Make sure everyone is using the same Storage ID
- Check you have internet connection

---

## 🎉 Benefits

- ✅ **Zero setup** for members
- ✅ **Democratic** - everyone can contribute
- ✅ **Simple** - just one ID to share
- ✅ **Free** - no costs, no limits
- ✅ **Fast** - instant updates
- ✅ **Reliable** - auto-merge prevents conflicts
- ✅ **Offline-ready** - works without internet

---

## 📊 Summary

| Feature | Old (Gist) | New (JSONBin) |
|---------|-----------|---------------|
| Need Account | ✅ Yes | ❌ No |
| Need Token | ✅ Yes | ❌ No |
| Everyone Can Save | ❌ No | ✅ YES! |
| Setup Time | 5 min | 30 sec |
| Member Setup | Complex | Paste ID only |

---

**Enjoy your token-free raid planning!** 🚀✨

Questions? Issues? Open an issue on GitHub: https://github.com/Smoothzy/bpsr-planner
