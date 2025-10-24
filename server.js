const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Discord OAuth Config
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

// Use Railway's persistent volume if available, otherwise use local directory
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'players.json');
const RAIDS_FILE = path.join(DATA_DIR, 'raids.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Sanitize function to prevent XSS
function sanitizeName(name) {
    if (!name || typeof name !== 'string') return '';
    // Remove any HTML tags and script content
    return name.replace(/<[^>]*>/g, '').trim();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Ensure players.json exists
async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, '{}', 'utf8');
        console.log('Created players.json');
    }
}

// Ensure raids.json exists
async function ensureRaidsFile() {
    try {
        await fs.access(RAIDS_FILE);
    } catch {
        await fs.writeFile(RAIDS_FILE, '[]', 'utf8');
        console.log('Created raids.json');
    }
}

// Ensure sessions.json exists
async function ensureSessionsFile() {
    try {
        await fs.access(SESSIONS_FILE);
    } catch {
        await fs.writeFile(SESSIONS_FILE, '{}', 'utf8');
        console.log('Created sessions.json');
    }
}

// Session management
async function getSessions() {
    try {
        const data = await fs.readFile(SESSIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveSession(token, userData) {
    const sessions = await getSessions();
    sessions[token] = {
        user: userData,
        createdAt: new Date().toISOString()
    };
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
}

async function getSession(token) {
    const sessions = await getSessions();
    return sessions[token];
}

// Discord OAuth Routes
app.get('/auth/discord', (req, res) => {
    const redirectUri = encodeURIComponent(DISCORD_REDIRECT_URI);
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    
    if (!code) {
        return res.status(400).send('No code provided');
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            throw new Error(tokenData.error_description || 'Failed to get access token');
        }
        
        // Get user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });
        
        const userData = await userResponse.json();
        
        // Create session token
        const sessionToken = require('crypto').randomBytes(32).toString('hex');
        await saveSession(sessionToken, {
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            avatar: userData.avatar
        });
        
        // Redirect back to frontend with session token
        res.redirect(`/?session=${sessionToken}`);
    } catch (error) {
        console.error('Discord OAuth error:', error);
        res.status(500).send('Authentication failed');
    }
});

// Get current user
app.get('/api/auth/user', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const session = await getSession(token);
    
    if (!session) {
        return res.status(401).json({ error: 'Invalid session' });
    }
    
    res.json(session.user);
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
        const sessions = await getSessions();
        delete sessions[token];
        await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
    }
    
    res.json({ success: true });
});

// GET endpoint - Read players data
app.get('/api/players', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading players:', error);
        res.status(500).json({ error: 'Failed to read players data' });
    }
});

// POST endpoint - Save players data
app.post('/api/players', async (req, res) => {
    try {
        // Get session if provided
        const token = req.headers.authorization?.replace('Bearer ', '');
        let ownerId = null;
        
        if (token) {
            const session = await getSession(token);
            if (session) {
                ownerId = session.user.id;
            }
        }
        
        const players = req.body;
        
        // Validate data
        if (!players || typeof players !== 'object') {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Read current data for merging
        let currentData = {};
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            currentData = JSON.parse(data);
        } catch (error) {
            console.log('No existing data, creating new file');
        }

        // Merge with existing data (keep newer entries)
        const merged = { ...currentData };
        Object.keys(players).forEach(name => {
            // Sanitize player name to prevent XSS
            const sanitizedName = sanitizeName(name);
            if (!sanitizedName) return; // Skip empty names
            
            const newPlayer = players[name];
            // Update the name in the player object too
            newPlayer.name = sanitizedName;
            
            // Add or update ownerId for new players
            if (ownerId && !merged[sanitizedName]) {
                newPlayer.ownerId = ownerId;
            }
            
            const existingPlayer = merged[sanitizedName];
            
            if (!existingPlayer) {
                merged[sanitizedName] = newPlayer;
            } else {
                const newTime = new Date(newPlayer.lastUpdated || 0).getTime();
                const existingTime = new Date(existingPlayer.lastUpdated || 0).getTime();
                
                if (newTime > existingTime) {
                    // Preserve ownerId if updating
                    if (existingPlayer.ownerId) {
                        newPlayer.ownerId = existingPlayer.ownerId;
                    }
                    merged[sanitizedName] = newPlayer;
                }
            }
        });

        // Write to file
        await fs.writeFile(DATA_FILE, JSON.stringify(merged, null, 2), 'utf8');
        
        res.json({ 
            success: true, 
            message: 'Players data saved successfully',
            playerCount: Object.keys(merged).length
        });
    } catch (error) {
        console.error('Error saving players:', error);
        res.status(500).json({ error: 'Failed to save players data' });
    }
});

// DELETE endpoint - Delete a specific player (admin only)
app.delete('/api/players/:name', async (req, res) => {
    try {
        const playerName = req.params.name;
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const players = JSON.parse(data);
        
        if (players[playerName]) {
            delete players[playerName];
            await fs.writeFile(DATA_FILE, JSON.stringify(players, null, 2), 'utf8');
            res.json({ success: true, message: `Player ${playerName} deleted` });
        } else {
            res.status(404).json({ error: 'Player not found' });
        }
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

// GET endpoint - Read raids data
app.get('/api/raids', async (req, res) => {
    try {
        const data = await fs.readFile(RAIDS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading raids:', error);
        res.status(500).json({ error: 'Failed to read raids data' });
    }
});

// POST endpoint - Save raids data
app.post('/api/raids', async (req, res) => {
    try {
        const raids = req.body;
        
        // Validate data
        if (!Array.isArray(raids)) {
            return res.status(400).json({ error: 'Invalid data format - expected array' });
        }

        // Write to file
        await fs.writeFile(RAIDS_FILE, JSON.stringify(raids, null, 2), 'utf8');
        
        res.json({ 
            success: true, 
            message: 'Raids data saved successfully',
            raidCount: raids.length
        });
    } catch (error) {
        console.error('Error saving raids:', error);
        res.status(500).json({ error: 'Failed to save raids data' });
    }
});

// Start server
async function startServer() {
    await ensureDataFile();
    await ensureRaidsFile();
    await ensureSessionsFile();
    app.listen(PORT, () => {
        console.log(`🚀 BPSR Planner Server running on http://localhost:${PORT}`);
        console.log(`📁 Data file: ${DATA_FILE}`);
        console.log(`📁 Raids file: ${RAIDS_FILE}`);
        console.log(`📁 Sessions file: ${SESSIONS_FILE}`);
        console.log(`\n📡 API Endpoints:`);
        console.log(`   GET    /api/players        - Get all players`);
        console.log(`   POST   /api/players        - Save/update players`);
        console.log(`   DELETE /api/players/:name  - Delete a player`);
        console.log(`   GET    /api/raids          - Get all raids`);
        console.log(`   POST   /api/raids          - Save raids`);
        console.log(`   GET    /auth/discord       - Login with Discord`);
        console.log(`   GET    /api/auth/user      - Get current user`);
        console.log(`   POST   /api/auth/logout    - Logout`);
    });
}

startServer().catch(console.error);
