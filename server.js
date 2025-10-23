const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Use Railway's persistent volume if available, otherwise use local directory
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'players.json');

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
            
            const existingPlayer = merged[sanitizedName];
            
            if (!existingPlayer) {
                merged[sanitizedName] = newPlayer;
            } else {
                const newTime = new Date(newPlayer.lastUpdated || 0).getTime();
                const existingTime = new Date(existingPlayer.lastUpdated || 0).getTime();
                
                if (newTime > existingTime) {
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

// Start server
async function startServer() {
    await ensureDataFile();
    app.listen(PORT, () => {
        console.log(`🚀 BPSR Planner Server running on http://localhost:${PORT}`);
        console.log(`📁 Data file: ${DATA_FILE}`);
        console.log(`\n📡 API Endpoints:`);
        console.log(`   GET    /api/players        - Get all players`);
        console.log(`   POST   /api/players        - Save/update players`);
        console.log(`   DELETE /api/players/:name  - Delete a player`);
    });
}

startServer().catch(console.error);
