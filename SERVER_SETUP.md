# Backend Server Setup Guide

This guide will help you set up and run the Node.js backend server for the Blue Protocol Raid Planner.

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your system (version 14 or higher recommended).

Check your Node.js version:
```bash
node --version
```

## Installation

1. **Install Dependencies**
   
   Open a terminal in the project folder and run:
   ```bash
   npm install
   ```
   
   This will install:
   - `express` - Web server framework
   - `cors` - Cross-origin resource sharing
   - `nodemon` - Auto-restart during development (dev only)

## Running the Server

### Production Mode
To run the server normally:
```bash
npm start
```

Or directly:
```bash
node server.js
```

### Development Mode
For auto-restart on file changes:
```bash
npm run dev
```

The server will start on **http://localhost:3000**

## Testing Locally

1. Start the server using one of the commands above
2. Open your web browser to `http://localhost:3000`
3. The raid planner should load and automatically connect to the server
4. Try adding a player - it should save to `players.json` automatically
5. Open another browser window/tab to the same URL
6. You should see the player data sync between both windows

## How It Works

### API Endpoints

The server provides 3 REST API endpoints:

- **GET /api/players** - Loads all player data
- **POST /api/players** - Saves player data (merges with existing)
- **DELETE /api/players/:name** - Deletes a specific player

### Data Storage

All player data is stored in `players.json` in the root folder. The server will automatically create this file if it doesn't exist.

### Smart Merge

When saving data, the server compares timestamps and keeps the newest version of each player if there are conflicts.

### Auto-Sync

The frontend automatically:
- Loads data from the server on page load
- Reloads data every 30 seconds
- Saves to the server whenever you add/update a player

## Deploying to Production

To make your raid planner accessible online, you need to deploy the backend server to a hosting service.

### Recommended Hosting Options

1. **Railway** (easiest, free tier available)
   - Visit https://railway.app
   - Connect your GitHub repository
   - Railway will auto-detect and deploy your Node.js app
   - Copy the provided URL

2. **Render** (free tier available)
   - Visit https://render.com
   - Create a new Web Service
   - Connect your GitHub repository
   - Render will auto-deploy on every push

3. **Heroku** (requires credit card for free tier)
   - Visit https://heroku.com
   - Create a new app
   - Deploy via Git or GitHub integration

4. **DigitalOcean App Platform** (paid, very reliable)
   - Visit https://www.digitalocean.com/products/app-platform
   - Deploy from GitHub
   - Affordable and scalable

### After Deployment

Once deployed, you need to update the `API_URL` in `script.js`:

```javascript
// Change this line:
const API_URL = window.location.origin;

// To your deployed server URL:
const API_URL = 'https://your-app-name.railway.app';
```

Then commit and push the changes to GitHub Pages.

## Troubleshooting

### Port Already in Use
If you see "Port 3000 is already in use", either:
- Stop the other process using port 3000
- Or set a different port:
  ```bash
  # Windows PowerShell
  $env:PORT=3001; npm start
  
  # Linux/Mac
  PORT=3001 npm start
  ```

### Cannot Connect to Server
- Make sure the server is running (check the terminal)
- Check if you can access http://localhost:3000 directly
- Look for error messages in the browser console (F12)

### Data Not Saving
- Check the browser console for errors
- Verify `players.json` exists and is writable
- Check the server terminal for error messages

### CORS Errors
- Make sure the CORS middleware is enabled in `server.js`
- If deploying, ensure your frontend URL is allowed

## Development Notes

### File Structure
```
bpsr_planner/
├── server.js           # Backend API server
├── package.json        # Node.js dependencies
├── players.json        # Data storage (auto-created)
├── index.html          # Main planner page
├── script.js           # Frontend logic
├── styles.css          # Styling
├── dark-mode.css       # Dark theme
├── players-overview.html
├── raid-finder.html
└── SERVER_SETUP.md     # This file
```

### Environment Variables
- `PORT` - Server port (default: 3000)

### Making Changes
1. Edit `server.js` for backend changes
2. If using `npm run dev`, changes auto-reload
3. For frontend changes, just refresh the browser

## Questions?

If you encounter any issues, check:
1. Node.js is installed correctly
2. All dependencies are installed (`npm install`)
3. Port 3000 is not being used by another app
4. `players.json` has write permissions

Happy raiding! 🎮
