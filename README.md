# 🌙 Moonlight Raid Planner

A comprehensive web-based raid planner for Blue Protocol with timezone support, dark mode, and **multi-user synchronization** (no backend required!).

## 🌐 Live Site

**Visit:** https://smoothzy.github.io/bpsr-planner/

## Features

### 🔄 Multi-User Sync (NEW!)
- **GitHub Gist Integration** - Share player data with your entire raid group
- **Real-time Sync** - Auto-sync every 30 seconds to see updates
- **No Backend Server** - Uses GitHub's free Gist service as storage
- **Conflict Resolution** - Smart merging keeps everyone's data safe
- **Read-only Option** - Members can view without GitHub tokens
- **Offline Support** - Falls back to localStorage when offline
- 👉 **See [GIST_SETUP.md](GIST_SETUP.md) for complete setup guide**

### 🌍 Timezone Support
- **Automatic timezone detection** - Detects your local timezone automatically
- **Manual timezone selection** - Choose from 14+ timezones worldwide
- **Timezone popup** - Click the "🌍 Timezone Settings" button on any page to:
  - View current local and server time
  - See DST (Daylight Saving Time) status
  - Quick conversion examples
  - Change your timezone preference
- **Server Time System**: 9:00 AM CEST (Berlin) = 00:00 Server Time
- **Automatic DST Detection**: System automatically adjusts for summer/winter time

### 🌙 Dark Mode
- **Toggle button** - Click the moon/sun icon in the top-right corner
- **Persistent preference** - Your dark mode choice is saved
- **Smooth transitions** - All colors transition smoothly when switching themes
- **Complete coverage** - Dark mode works across all three pages

### 📋 Main Planner (index.html)
- Register players with name, class, and gearscore
- Set availability on a 7-day × 24-hour grid
- Automatic timezone conversion (displays in your local time, saves as server time)
- Edit existing players instead of creating duplicates
- Export/Import player data as JSON
- Real-time clock showing local and server time
- Visual conversion examples

### 👥 Players Overview (players-overview.html)
- **Statistics Dashboard**: Total players, average gearscore, total hours available, most popular class
- **Advanced Filtering**: Filter by class, minimum gearscore, day, or search by name
- **Sortable Table**: Click column headers to sort
- **Visual Heatmaps**: Color-coded weekly availability per player
  - Gray: 0 hours
  - Yellow: 1-5 hours
  - Green: 6-11 hours
  - Purple: 12+ hours
- **Timezone Popup**: View and change timezone settings
- **Dark Mode Support**: Full dark mode integration

### 🔍 Advanced Raid Finder (raid-finder.html)
- **Search Criteria**:
  - Minimum players (1-8)
  - Filter by specific day
  - Minimum average gearscore
  - Time range filter (morning/afternoon/evening/night/all)
- **List View**:
  - Detailed cards showing time, day, player count
  - Class composition visual bars
  - Average gearscore badges
  - List of available players with their stats
  - Quality indicators (Excellent/Good/Fair)
- **Timeline View**:
  - Visual 7×24 heatmap grid
  - Color-coded by player count
  - Legend showing player count ranges
- **Timezone Popup**: View and change timezone settings
- **Dark Mode Support**: Full dark mode integration

## How to Use

### First Time Setup
1. Open `index.html` in your web browser
2. Click the timezone settings button to verify your timezone is correct
3. Toggle dark mode if preferred (moon/sun icon in top-right)

### Adding Players
1. Enter player name, select class, and input gearscore
2. Click hours on the grid to mark availability (displayed in your local time)
3. Click "Save Player" - data is stored in browser localStorage
4. To edit: Click "Edit" on a player card, modify, and save again

### Finding Raid Times
1. Go to "Advanced Raid Finder" (link at top)
2. Set your criteria (min players, day, gearscore, time range)
3. Click "Find Raid Times"
4. Switch between List View and Timeline View
5. Use the timezone popup to see times in different timezones

### Managing Players
1. Go to "Players Overview" (link at top)
2. Use filters to find specific players
3. Click table headers to sort
4. View heatmaps for weekly availability patterns
5. Edit or delete players as needed

## Timezone Information

### Server Time Calculation
- **Reference Point**: 9:00 AM CEST (Berlin/Central European Summer Time) = 00:00 Server Time
- **Summer Time (April-October)**: CEST is UTC+2
- **Winter Time (November-March)**: CET is UTC+1
- **Automatic Detection**: The planner automatically detects which season it is

### Supported Timezones
- Auto-detect (uses your system timezone)
- Europe: London, Berlin, Paris, Madrid, Rome
- Americas: New York, Chicago, Denver, Los Angeles
- Asia: Tokyo, Shanghai, Dubai
- Australia: Sydney

### Conversion Examples
When you open the timezone popup, you'll see conversion examples showing how your local time maps to server time, updated in real-time.

## Data Management

### Export/Import
- **Export**: Click "Export Data" on the main planner to download all player data as JSON
- **Import**: Click "Import Data" and select a JSON file to restore data
- **Backup**: Recommended to export regularly as a backup

### Storage
- All data is stored in browser localStorage
- Data persists across browser sessions
- Clearing browser data will delete all player information
- Each browser stores data separately

## Technical Details

### Files
- `index.html` - Main planner interface
- `players-overview.html` - Detailed player table and statistics
- `raid-finder.html` - Advanced raid time search
- `styles.css` - Main stylesheet
- `dark-mode.css` - Dark mode theme and CSS variables
- `script.js` - Core JavaScript logic
- `test_timezone.html` - Timezone conversion testing tool
- `debug.html` - localStorage inspector

### Browser Compatibility
- Works on all modern browsers (Chrome, Firefox, Edge, Safari)
- Requires JavaScript enabled
- Uses localStorage (no server required)
- Responsive design for mobile and desktop

### Dark Mode Colors
- Light mode: Clean white and blue theme
- Dark mode: Dark gray (#1a1a1a) background with softer colors
- Consistent gradient accents in both modes
- Smooth 0.3s transitions between themes

## Tips

1. **Timezone Changes**: If you travel or want to see times in a different zone, use the timezone popup on any page
2. **Dark Mode**: Enable dark mode for comfortable nighttime planning
3. **Filtering**: Use the Players Overview filters to quickly find players with specific requirements
4. **Timeline View**: Great for visualizing peak hours across the week
5. **Backup Data**: Export your data periodically to avoid losing player information

## Future Enhancements

Potential features for future versions:
- More precise DST calculation (exact last Sunday of March/October)
- Backend server for multi-user support
- Discord webhook integration
- Mobile app version
- Additional analytics and statistics
- Calendar export functionality

---

**Version**: 2.0 (with Dark Mode & Timezone Popups)  
**Last Updated**: October 2025
