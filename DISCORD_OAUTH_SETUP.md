# Discord OAuth Setup Instructions

The raid planner now uses Discord OAuth for player ownership authentication. This allows players to:
- Create and edit their own characters
- Access their characters from any device/browser
- Prevent others from editing their characters
- Display their Discord avatar and username

## Setup Steps

### 1. Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Give it a name (e.g., "BPSR Raid Planner")
4. Click "Create"

### 2. Configure OAuth2

1. In your application, go to "OAuth2" in the left sidebar
2. Click "Add Redirect" under "Redirects"
3. Add your redirect URLs:
   - For local testing: `http://localhost:3000/auth/discord/callback`
   - For production: `https://web-production-af38.up.railway.app/auth/discord/callback`
   - For GitHub Pages: `https://smoothzy.github.io/bpsr-planner/auth/discord/callback` (if needed)
4. Click "Save Changes"

### 3. Get Your Credentials

1. In the "OAuth2" section, find your:
   - **Client ID** (visible at the top)
   - **Client Secret** (click "Reset Secret" if needed, then copy it)

### 4. Set Environment Variables

#### For Local Development

Create a `.env` file in the project root (or set in your terminal):

```bash
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

#### For Railway Deployment

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add these variables:
   - `DISCORD_CLIENT_ID` = your client ID
   - `DISCORD_CLIENT_SECRET` = your client secret
   - `DISCORD_REDIRECT_URI` = `https://web-production-af38.up.railway.app/auth/discord/callback`

### 5. Install Dependencies (if not already done)

```bash
npm install node-fetch@2
```

### 6. Test Locally

1. Start your server:
   ```bash
   node server.js
   ```

2. Open http://localhost:3000 in your browser

3. Click "Login with Discord"

4. Authorize the application

5. You should be redirected back and see your Discord username/avatar

### 7. Deploy to Railway

Once configured, push your changes to GitHub:

```bash
git add .
git commit -m "Add Discord OAuth authentication"
git push
```

Railway will automatically redeploy with the new environment variables.

## How It Works

1. **Login Flow**:
   - User clicks "Login with Discord"
   - Redirected to Discord authorization page
   - User approves
   - Discord redirects back to `/auth/discord/callback` with auth code
   - Server exchanges code for access token
   - Server fetches user info from Discord
   - Server creates session token and stores user data
   - User redirected back to site with session token

2. **Session Management**:
   - Session token stored in localStorage as `bpsr_session_token`
   - Every request to save players includes `Authorization: Bearer <token>`
   - Server validates token and associates player with Discord user ID

3. **Player Ownership**:
   - Each player has an `ownerId` field (Discord user ID)
   - Users can only edit players they own (or if admin)
   - Players without ownerId can be claimed by anyone (migration support)

## Security Notes

- Keep your `DISCORD_CLIENT_SECRET` private!
- Never commit it to Git (use environment variables)
- Railway automatically keeps variables secure
- Sessions are stored in `sessions.json` on the server
- Session tokens are cryptographically random (64 hex characters)

## Troubleshooting

**"Authentication failed"**
- Check that CLIENT_ID and CLIENT_SECRET are correct
- Verify redirect URI matches exactly (including http/https)
- Check server logs for specific error

**"Cannot find module 'node-fetch'"**
- Run `npm install node-fetch@2`

**"Invalid session"**
- Session may have expired or been cleared
- Click logout and login again

**Players not saving ownership**
- Ensure you're logged in before creating/editing
- Check server logs to verify session token is being sent
- Make sure server has write access to `players.json`

## Admin Mode

Admin mode still works with the secret key "bond" typed on the page. Admins can:
- Edit any player regardless of ownership
- Delete any player
- Create players without logging in
