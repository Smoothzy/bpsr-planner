// Blue Protocol Star Resonance Raid Planner
// Server Time: 9:00 AM CEST = 00:00 Server Time

// Constants
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours
const STORAGE_KEY = 'bpsr_players';
const ADMIN_KEY = 'bond'; // Secret admin key
const SESSION_KEY = 'bpsr_session_token'; // Discord session token
// Auto-detect API URL based on environment
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost ? 'http://localhost:3000' : 'https://web-production-af38.up.railway.app';

// Server time reference: 9:00 AM CEST (UTC+2 in summer, UTC+1 in winter)
// For simplicity, we'll use UTC+2 as the base (CEST summer time)
const SERVER_TIME_OFFSET = -7; // 9:00 CEST = 7:00 UTC, server time 0:00 = -7 hours from that reference

// State
let currentPlayer = null;
let selectedTimezone = 'auto';
let availabilityGrid = {};
let playersCache = {}; // In-memory cache for player data (server is source of truth)
let currentUser = null; // Discord user info

// Drag selection state
let isDragging = false;
let dragMode = null; // 'select' or 'deselect'

// Check if admin mode is enabled
function isAdminMode() {
    return localStorage.getItem('adminKey') === ADMIN_KEY;
}

// Discord Authentication
async function checkAuth() {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) {
        currentUser = null;
        updateAuthUI();
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/auth/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
            return true;
        } else {
            localStorage.removeItem(SESSION_KEY);
            currentUser = null;
            updateAuthUI();
            return false;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

function updateAuthUI() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    
    if (currentUser) {
        const avatarUrl = currentUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
        
        authContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${avatarUrl}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #e040fb;">
                <span style="color: #e1bee7;">${currentUser.username}</span>
                <button onclick="logout()" style="padding: 5px 10px; background: #6a1b9a; color: white; border: none; border-radius: 5px; cursor: pointer;">Logout</button>
            </div>
        `;
    } else {
        authContainer.innerHTML = `
            <button onclick="loginWithDiscord()" style="padding: 8px 16px; background: #5865F2; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                Login with Discord
            </button>
        `;
    }
}

function loginWithDiscord() {
    window.location.href = `${API_URL}/auth/discord`;
}

async function logout() {
    const token = localStorage.getItem(SESSION_KEY);
    if (token) {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    localStorage.removeItem(SESSION_KEY);
    currentUser = null;
    updateAuthUI();
}

// Player ownership management (now uses Discord)
function canEditPlayer(playerName) {
    // Admin can edit anyone
    if (isAdminMode()) return true;
    
    // Not logged in - can't edit
    if (!currentUser) return false;
    
    // Check if player has ownerId and if it matches current user
    const player = playersCache[playerName];
    if (!player) return false;
    
    // If player has no owner, user can claim it (but we'll set ownership when saving)
    if (!player.ownerId) return true;
    
    // Check if this user owns the player
    return player.ownerId === currentUser.id;
}

// Update player selector dropdown for logged-in users
function updatePlayerSelector() {
    const nameInput = document.getElementById('playerName');
    const loadButton = document.getElementById('loadPlayer');
    const existingSelect = document.getElementById('playerNameSelect');
    
    // Remove dropdown if it exists - we're going back to input field only
    if (existingSelect) {
        existingSelect.remove();
    }
    
    // Always show input field
    nameInput.style.display = 'inline-block';
    loadButton.style.display = 'inline-block';
}

// Initialize availability grid
function initializeAvailabilityGrid() {
    availabilityGrid = {};
    DAYS.forEach(day => {
        availabilityGrid[day] = new Set();
    });
}

// Timezone conversion functions
function isSummerTime() {
    // Check if we're currently in daylight saving time (summer time)
    // We'll use the current date to determine this
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();
    
    // In Europe, DST typically runs from last Sunday of March to last Sunday of October
    // For simplicity, we'll use: April-September is definitely summer time
    // March and October need more careful checking, but we'll approximate
    
    // Most of the world uses DST from March/April to October/November
    // Simple approximation: months 3-9 (April through October) use summer time
    return month >= 3 && month <= 9;
}

function getServerTime(date = new Date()) {
    // Server time is based on 9:00 AM CEST = 00:00 Server Time
    // CEST is UTC+2, so 9:00 CEST = 7:00 UTC
    // To get server time: take UTC time and subtract 7 hours
    const utcTime = new Date(date.toISOString());
    const serverTime = new Date(utcTime.getTime() - (7 * 60 * 60 * 1000));
    return serverTime;
}

function getLocalHourFromServerHour(serverHour) {
    // Convert server hour to local hour based on selected timezone
    // Server time 00:00 = 7:00 UTC (because 9:00 CEST = 7:00 UTC = 0:00 Server)
    
    // Use current date for DST-aware conversion
    const now = new Date();
    const utcHour = (serverHour + 7) % 24;

    // Create a UTC instant for the given server-hour on the current date
    const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), utcHour, 0, 0));

    // For auto (browser local timezone) and specific timezones use toLocaleString
    // with explicit 24-hour format to avoid locale differences
    try {
        const localHourStr = utcDate.toLocaleString('en-US', {
            timeZone: selectedTimezone === 'auto' ? Intl.DateTimeFormat().resolvedOptions().timeZone : selectedTimezone,
            hour: 'numeric',
            hour12: false
        });
        const parsed = parseInt(localHourStr, 10);
        // Ensure hour is in 0-23 range
        return ((isNaN(parsed) ? utcDate.getHours() : parsed) + 24) % 24;
    } catch (e) {
        // Fallback: use local machine conversion
        return utcDate.getHours();
    }
}

function getServerHourFromLocalHour(localHour) {
    // Convert local hour to server hour based on selected timezone
    // Server time: 00:00 ST = 07:00 UTC
    // Example: 9:00 CEST (UTC+2 in summer) should = 00:00 Server
    
    // Use current date to maintain DST awareness
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    
    if (selectedTimezone === 'auto') {
        // Use the browser's local timezone
        const localDate = new Date(year, month, day, localHour, 0, 0);
        const utcHour = localDate.getUTCHours();
        const serverHour = (utcHour - 7 + 24) % 24;
        return serverHour;
    } else {
        // For a specific timezone:
        // Try different UTC hours to find which one gives us the desired local hour
        for (let utcHour = 0; utcHour < 24; utcHour++) {
            const testDate = new Date(Date.UTC(year, month, day, utcHour, 0, 0));
            const testLocalHour = parseInt(testDate.toLocaleString('en-US', {
                timeZone: selectedTimezone,
                hour: 'numeric',
                hour12: false
            }));
            
            if (testLocalHour === localHour) {
                // Found the UTC hour that corresponds to our local hour
                const serverHour = (utcHour - 7 + 24) % 24;
                return serverHour;
            }
        }
        
        // Fallback (shouldn't reach here)
        return 0;
    }
}

function formatLocalHour(hour) {
    return hour.toString().padStart(2, '0') + ':00';
}

function formatServerHour(hour) {
    return hour.toString().padStart(2, '0') + ':00';
}

function updateTimeDisplays() {
    const now = new Date();
    const serverTime = getServerTime(now);
    
    // Update local time based on selected timezone
    let localTimeStr;
    if (selectedTimezone === 'auto') {
        localTimeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        });
    } else {
        localTimeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: selectedTimezone
        });
    }
    document.getElementById('localTime').textContent = localTimeStr;
    
    // Update server time
    const serverTimeStr = serverTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    });
    document.getElementById('serverTime').textContent = serverTimeStr;
    
    // Calculate daily reset time (00:00 ST = 07:00 UTC)
    // Create a date for today at 07:00 UTC (which is 00:00 server time)
    const resetTimeUTC = new Date();
    resetTimeUTC.setUTCHours(7, 0, 0, 0);
    
    // If we've already passed today's reset, show tomorrow's reset
    if (now.getTime() > resetTimeUTC.getTime()) {
        resetTimeUTC.setDate(resetTimeUTC.getDate() + 1);
    }
    
    // Convert to user's timezone
    const userTimezone = selectedTimezone === 'auto' 
        ? Intl.DateTimeFormat().resolvedOptions().timeZone 
        : selectedTimezone;
    
    const resetTimeStr = resetTimeUTC.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: userTimezone
    });
    
    document.getElementById('dailyResetLabel').textContent = `Daily reset: ${resetTimeStr}`;
    
    // Update the grid tooltips to show local time equivalents
    updateGridTooltips();
    updateConversionExamples();
}

function updateConversionExamples() {
    const container = document.getElementById('conversionExamples');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show current DST status
    const isDST = isSummerTime();
    const dstNote = document.createElement('div');
    dstNote.style.cssText = 'grid-column: 1 / -1; background: ' + (isDST ? '#d4edda' : '#cfe2ff') + '; padding: 10px; border-radius: 8px; margin-bottom: 10px; text-align: center; font-weight: 600; color: ' + (isDST ? '#155724' : '#084298') + ';';
    dstNote.textContent = isDST ? '☀️ Currently using Summer Time (DST)' : '❄️ Currently using Winter Time (Standard Time)';
    container.appendChild(dstNote);
    
    // Show key conversion: what is 9:00 in selected timezone as server time?
    const nineAmServerTime = getServerHourFromLocalHour(9);
    
    // Show 6 example conversions throughout the day
    const exampleHours = [0, 6, 9, 12, 18, 21];
    
    exampleHours.forEach(localHour => {
        const serverHour = getServerHourFromLocalHour(localHour);
        
        const example = document.createElement('div');
        example.className = 'conversion-example';
        
        // Highlight 9:00 AM if it converts to 00:00 server (correct behavior for CEST)
        // or 01:00 server (correct for CET winter time)
        const isKeyTime = localHour === 9;
        const isCorrectCEST = isKeyTime && serverHour === 0 && isDST;
        const isCorrectCET = isKeyTime && serverHour === 1 && !isDST;
        
        if (isCorrectCEST || isCorrectCET) {
            example.style.border = '2px solid #28a745';
            example.style.background = '#d4edda';
        } else if (isKeyTime) {
            example.style.border = '2px solid #ffc107';
            example.style.background = '#fff3cd';
        }
        
        example.innerHTML = `
            <div class="conversion-local">${formatLocalHour(localHour)} ${isKeyTime ? '⭐' : ''}</div>
            <div class="conversion-arrow">↓</div>
            <div class="conversion-server">${formatServerHour(serverHour)} Server</div>
        `;
        container.appendChild(example);
    });
}

function updateGridTooltips() {
    const slots = document.querySelectorAll('.time-slot');
    slots.forEach(slot => {
        const day = slot.dataset.day;
        const localHour = parseInt(slot.dataset.localHour);
        const localTimeStr = formatLocalHour(localHour);
        
        // Calculate equivalent server time
        const serverHour = getServerHourFromLocalHour(localHour);
        const serverTimeStr = formatServerHour(serverHour);
        
        slot.title = `${day} ${localTimeStr} Local (${serverTimeStr} Server Time)`;
    });
}

// Storage functions (server-only, no localStorage for player data)
function savePlayers(players) {
    playersCache = players; // Update in-memory cache only
}

function loadPlayers() {
    return playersCache || {}; // Return from in-memory cache
}

function saveCurrentPlayer() {
    const name = document.getElementById('playerName').value.trim();
    const playerClass = document.getElementById('playerClass').value;
    const gearScore = document.getElementById('gearScore').value;
    const guild = document.getElementById('guild').value.trim();
    
    if (!name) {
        alert('Please enter a player name!');
        return;
    }
    
    if (!playerClass) {
        alert('Please select a class!');
        return;
    }
    
    if (!gearScore || gearScore <= 0) {
        alert('Please enter a valid gear score!');
        return;
    }
    
    // Require login to create/edit players
    if (!currentUser && !isAdminMode()) {
        alert('Please login with Discord to create or edit players!');
        return;
    }
    
    // Check if editing existing player
    const players = loadPlayers();
    const originalName = currentPlayer ? currentPlayer.name : null;
    const isEditing = originalName !== null;
    const isRenaming = isEditing && originalName !== name;
    
    // Check permission to edit the original player
    if (isEditing && !canEditPlayer(originalName)) {
        alert('You can only edit your own players! Admins can edit anyone.');
        return;
    }
    
    // If new name already exists and it's not the same player, reject
    if (players[name] && originalName !== name) {
        alert('A player with this name already exists!');
        return;
    }
    
    // Convert availability Set to Array for storage
    const availabilityData = {};
    Object.keys(availabilityGrid).forEach(day => {
        availabilityData[day] = Array.from(availabilityGrid[day]);
    });
    
    // Determine ownerId: preserve existing owner from original player, or set to current user if new
    let ownerId;
    if (isEditing && players[originalName] && players[originalName].ownerId) {
        // Keep existing owner when editing
        ownerId = players[originalName].ownerId;
    } else if (players[name] && players[name].ownerId) {
        // Keep existing owner if somehow already exists
        ownerId = players[name].ownerId;
    } else if (currentUser) {
        // Set current user as owner (new player or claiming unclaimed player)
        ownerId = currentUser.id;
    }
    
    // If renaming, delete the old player entry
    if (isRenaming) {
        delete players[originalName];
    }
    
    players[name] = {
        name,
        class: playerClass,
        gearScore: parseInt(gearScore),
        guild: guild || '',
        availability: availabilityData,
        lastUpdated: new Date().toISOString(),
        ownerId: ownerId
    };
    
    // Update currentPlayer to reflect the new/edited player
    currentPlayer = players[name];
    
    savePlayers(players);
    
    // Also save to server
    saveToServer();
    
    const action = isRenaming ? 'renamed and saved' : (isEditing ? 'updated' : 'created');
    alert(`Player ${name} ${action} successfully!`);
    renderPlayersList();
    calculateBestTimes();
    updatePlayerSelector(); // Update dropdown with new/edited player name
}

function loadPlayerData(name) {
    // Check permission
    if (!canEditPlayer(name)) {
        alert('You can only edit your own players! Admins can edit anyone.');
        return;
    }
    
    const players = loadPlayers();
    const player = players[name];
    
    if (!player) {
        alert(`Player ${name} not found!`);
        return;
    }
    
    document.getElementById('playerName').value = player.name;
    document.getElementById('playerClass').value = player.class;
    document.getElementById('gearScore').value = player.gearScore;
    document.getElementById('guild').value = player.guild || '';
    
    // Load availability
    initializeAvailabilityGrid();
    Object.keys(player.availability).forEach(day => {
        availabilityGrid[day] = new Set(player.availability[day]);
    });
    
    renderAvailabilityGrid();
    currentPlayer = player;
}

async function deletePlayer(name) {
    // Check if user can delete this player
    if (!isAdminMode() && !canEditPlayer(name)) {
        alert('You can only delete your own players. Admins can delete any player.');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem(SESSION_KEY);
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add admin flag if in admin mode
        const adminParam = isAdminMode() ? '?admin=true' : '';
        
        // Delete from server using DELETE endpoint
        const response = await fetch(`${API_URL}/api/players/${encodeURIComponent(name)}${adminParam}`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || 'Failed to delete player from server');
        }
        
        // Delete from local cache
        delete playersCache[name];
        
        if (currentPlayer && currentPlayer.name === name) {
            clearForm();
        }
        
        renderPlayersList();
        calculateBestTimes();
        updatePlayerSelector(); // Update dropdown after deletion
    } catch (error) {
        console.error('Error deleting player:', error);
        alert(`Failed to delete player: ${error.message}`);
    }
}

function clearForm() {
    document.getElementById('playerName').value = '';
    document.getElementById('playerClass').value = '';
    document.getElementById('gearScore').value = '';
    document.getElementById('guild').value = '';
    initializeAvailabilityGrid();
    renderAvailabilityGrid();
    currentPlayer = null;
}

// UI Rendering
function renderTimeLabels() {
    const container = document.getElementById('timeLabels');
    container.innerHTML = '';
    
    HOURS.forEach(hour => {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = formatLocalHour(hour);
        
        // Add server time equivalent as subtitle
        const serverHour = getServerHourFromLocalHour(hour);
        const subtitle = document.createElement('div');
        subtitle.className = 'time-label-subtitle';
        subtitle.textContent = `(${formatServerHour(serverHour)} ST)`;
        label.appendChild(subtitle);
        
        container.appendChild(label);
    });
}

function renderAvailabilityGrid() {
    const container = document.getElementById('gridBody');
    container.innerHTML = '';
    
    DAYS.forEach(day => {
        const row = document.createElement('div');
        row.className = 'day-row';
        
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        dayLabel.textContent = day;
        row.appendChild(dayLabel);
        
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'time-slots';
        
        HOURS.forEach(localHour => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.dataset.day = day;
            slot.dataset.localHour = localHour;
            
            // Convert local hour to server hour to check if selected
            const serverHour = getServerHourFromLocalHour(localHour);
            
            if (availabilityGrid[day] && availabilityGrid[day].has(serverHour)) {
                slot.classList.add('selected');
            }
            
            // Mouse down starts dragging
            slot.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isDragging = true;
                const isCurrentlySelected = slot.classList.contains('selected');
                dragMode = isCurrentlySelected ? 'deselect' : 'select';
                toggleTimeSlot(day, localHour, slot);
            });
            
            // Mouse enter while dragging
            slot.addEventListener('mouseenter', () => {
                if (isDragging) {
                    const serverHour = getServerHourFromLocalHour(localHour);
                    const isSelected = availabilityGrid[day].has(serverHour);
                    
                    if (dragMode === 'select' && !isSelected) {
                        availabilityGrid[day].add(serverHour);
                        slot.classList.add('selected');
                    } else if (dragMode === 'deselect' && isSelected) {
                        availabilityGrid[day].delete(serverHour);
                        slot.classList.remove('selected');
                    }
                }
            });
            
            // Add tooltip will be updated by updateGridTooltips
            slot.title = `${day} ${formatLocalHour(localHour)}`;
            
            slotsContainer.appendChild(slot);
        });
        
        row.appendChild(slotsContainer);
        container.appendChild(row);
    });
    
    updateGridTooltips();
}

function toggleTimeSlot(day, localHour, element) {
    // Convert local hour to server hour for storage
    const serverHour = getServerHourFromLocalHour(localHour);
    
    if (availabilityGrid[day].has(serverHour)) {
        availabilityGrid[day].delete(serverHour);
        element.classList.remove('selected');
    } else {
        availabilityGrid[day].add(serverHour);
        element.classList.add('selected');
    }
}

function renderPlayersList() {
    const container = document.getElementById('playersList');
    const players = loadPlayers();
    const playerNames = Object.keys(players);
    
    // Show/hide Force Save button based on admin mode
    const forceSaveBtn = document.getElementById('syncSave');
    if (forceSaveBtn) {
        forceSaveBtn.style.display = isAdminMode() ? 'inline-block' : 'none';
    }
    
    if (playerNames.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No players registered yet. Add your first player above!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    playerNames.sort().forEach(name => {
        const player = players[name];
        const card = document.createElement('div');
        card.className = 'player-card';
        
        // Count total availability slots and peak hours (in server time)
        let totalSlots = 0;
        const hourCounts = new Array(24).fill(0);
        Object.values(player.availability).forEach(hours => {
            totalSlots += hours.length;
            hours.forEach(hour => hourCounts[hour]++);
        });
        
    // Determine peak server hour safely: if all zeros, set to null
    const maxCount = Math.max(...hourCounts);
    const peakServerHour = maxCount > 0 ? hourCounts.indexOf(maxCount) : null;
    const peakLocalHour = peakServerHour !== null ? getLocalHourFromServerHour(peakServerHour) : null;
        const peakDays = Object.keys(player.availability).filter(day => 
            player.availability[day].includes(peakServerHour)
        );
        
        // Get last updated time
        const lastUpdated = player.lastUpdated 
            ? new Date(player.lastUpdated).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : 'Unknown';
        
        card.innerHTML = `
            <div class="player-card-header">
                <div class="player-name">${player.name}</div>
                <div class="player-class-badge">${player.class}</div>
            </div>
            <div class="player-info">
                <div class="player-info-row">
                    <span class="player-info-label">📊 Gear Score:</span>
                    <span class="player-info-value">${player.gearScore}</span>
                </div>
                <div class="player-info-row">
                    <span class="player-info-label">⏰ Total Hours:</span>
                    <span class="player-info-value">${totalSlots} time slots</span>
                </div>
                <div class="player-info-row">
                    <span class="player-info-label">🌟 Most Available:</span>
                    <span class="player-info-value">${peakLocalHour !== null ? `${formatLocalHour(peakLocalHour)} (${formatServerHour(peakServerHour)} ST)` : 'No peak'}</span>
                </div>
                <div class="player-info-row">
                    <span class="player-info-label">📅 Last Updated:</span>
                    <span class="player-info-value" style="font-size: 0.85em;">${lastUpdated}</span>
                </div>
            </div>
            <div class="availability-detailed">
                <div class="availability-header">Weekly Availability:</div>
                ${generateDetailedAvailability(player.availability)}
            </div>
            <div class="player-card-actions">
                ${canEditPlayer(player.name) ? `<button class="btn-edit" data-player-name="${player.name.replace(/"/g, '&quot;')}">✏️ Edit</button>` : ''}
                ${isAdminMode() ? `<button class="btn-delete" data-player-name="${player.name.replace(/"/g, '&quot;')}">🗑️ Delete</button>` : ''}
                <button class="btn-view" data-player-name="${player.name.replace(/"/g, '&quot;')}">👁️ Details</button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Add event listeners for dynamically created buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            loadPlayerData(this.dataset.playerName);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deletePlayer(this.dataset.playerName);
        });
    });
    
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            togglePlayerDetails(this.dataset.playerName);
        });
    });
    
    // Update player selector for logged-in users
    if (currentUser) {
        updatePlayerSelector();
    }
}

function generateDetailedAvailability(availability) {
    let html = '<div class="mini-grid">';
    
    DAYS.forEach(day => {
        const dayShort = day.substring(0, 3);
        const hours = availability[day] || [];
        const hourCount = hours.length;
        
        // Create a mini visualization
        let barWidth = (hourCount / 24) * 100;
        let barColor = hourCount === 0 ? '#e9ecef' : 
                       hourCount < 6 ? '#ffc107' : 
                       hourCount < 12 ? '#28a745' : '#667eea';
        
        html += `
            <div class="mini-grid-row">
                <div class="mini-day-label">${dayShort}</div>
                <div class="mini-bar-container">
                    <div class="mini-bar" style="width: ${barWidth}%; background: ${barColor};" 
                         title="${day}: ${hourCount} hours available"></div>
                </div>
                <div class="mini-count">${hourCount}h</div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function togglePlayerDetails(playerName) {
    const players = loadPlayers();
    const player = players[playerName];
    
    if (!player) return;
    
    // Create modal/detailed view
    const modal = document.createElement('div');
    modal.className = 'player-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${player.name}'s Detailed Schedule</h2>
                <button class="modal-close" onclick="this.closest('.player-details-modal').remove()">✖</button>
            </div>
            <div class="modal-body">
                <div class="player-stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Class</div>
                        <div class="stat-value">${player.class}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Gear Score</div>
                        <div class="stat-value">${player.gearScore}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Hours</div>
                        <div class="stat-value">${Object.values(player.availability).reduce((sum, arr) => sum + arr.length, 0)}</div>
                    </div>
                </div>
                <div class="detailed-schedule">
                    ${generateFullScheduleView(player.availability)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function generateFullScheduleView(availability) {
    let html = '<div class="schedule-grid">';
    html += '<div class="schedule-header">Times shown in your local timezone (Server Time in parentheses)</div>';
    
    DAYS.forEach(day => {
        const serverHours = availability[day] || [];
        serverHours.sort((a, b) => a - b);
        
        // Convert server hours to local hours and group consecutive ones
        const localHours = serverHours.map(sh => ({
            server: sh,
            local: getLocalHourFromServerHour(sh)
        }));
        
        // Group consecutive local hours
        const timeRanges = [];
        if (localHours.length > 0) {
            let start = localHours[0];
            let end = localHours[0];
            
            for (let i = 1; i < localHours.length; i++) {
                // Check if consecutive in local time
                if (localHours[i].local === (end.local + 1) % 24) {
                    end = localHours[i];
                } else {
                    // Add the range
                    timeRanges.push({
                        localStart: start.local,
                        localEnd: (end.local + 1) % 24,
                        serverStart: start.server,
                        serverEnd: (end.server + 1) % 24
                    });
                    start = localHours[i];
                    end = localHours[i];
                }
            }
            // Add the last range
            timeRanges.push({
                localStart: start.local,
                localEnd: (end.local + 1) % 24,
                serverStart: start.server,
                serverEnd: (end.server + 1) % 24
            });
        }
        
        const rangeStrings = timeRanges.map(range => 
            `${formatLocalHour(range.localStart)}-${formatLocalHour(range.localEnd)} <span class="server-time-small">(${formatServerHour(range.serverStart)}-${formatServerHour(range.serverEnd)} ST)</span>`
        );
        
        html += `
            <div class="schedule-row">
                <div class="schedule-day">${day}</div>
                <div class="schedule-times">
                    ${rangeStrings.length > 0 ? rangeStrings.join(', ') : '<span style="color: #999;">Not available</span>'}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function generateAvailabilitySummary(availability) {
    const summary = [];
    Object.keys(availability).forEach(day => {
        const hours = availability[day];
        if (hours.length > 0) {
            summary.push(`<strong>${day.substring(0, 3)}:</strong> ${hours.length}h`);
        }
    });
    return summary.length > 0 ? summary.join(' • ') : 'No availability set';
}

function calculateBestTimes() {
    const container = document.getElementById('bestTimes');
    const players = loadPlayers();
    const playerNames = Object.keys(players);
    
    if (playerNames.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Add players to see best raid times!</p>';
        return;
    }
    
    // Count availability for each time slot (server-hour keyed)
    const timeSlotCounts = {};
    
    DAYS.forEach(day => {
        timeSlotCounts[day] = {};
        HOURS.forEach(hour => {
            timeSlotCounts[day][hour] = {
                count: 0,
                players: []
            };
        });
    });
    
    // Count players available at each slot
    playerNames.forEach(name => {
        const player = players[name];
        Object.keys(player.availability).forEach(day => {
            player.availability[day].forEach(hour => {
                timeSlotCounts[day][hour].count++;
                timeSlotCounts[day][hour].players.push(name);
            });
        });
    });
    
    // Find best times (with at least 2 players)
    const bestTimes = [];
    DAYS.forEach(day => {
        HOURS.forEach(hour => {
            const slot = timeSlotCounts[day][hour];
            if (slot.count >= 2) {
                bestTimes.push({
                    day,
                    hour,
                    count: slot.count,
                    players: slot.players
                });
            }
        });
    });
    
    // Sort by player count (descending) and then by day/hour
    bestTimes.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        if (a.day !== b.day) return DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
        return a.hour - b.hour;
    });
    
    if (bestTimes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No common availability found. Need at least 2 players at the same time.</p>';
        return;
    }
    
    // Show top 12 best times
    container.innerHTML = '';
    bestTimes.slice(0, 12).forEach(time => {
    // Convert server hour to local hour for display (handle nulls defensively)
    const serverHour = time.hour;
    const localHour = typeof serverHour === 'number' ? getLocalHourFromServerHour(serverHour) : null;
        
        const option = document.createElement('div');
        option.className = 'time-option';
        option.innerHTML = `
            <div class="time-option-day">${time.day}</div>
            <div class="time-option-time">${localHour !== null ? formatLocalHour(localHour) : 'N/A'}</div>
            <div class="time-option-server">${formatServerHour(serverHour)} Server Time</div>
            <div class="time-option-count">${time.count} player${time.count > 1 ? 's' : ''} available</div>
            <div style="margin-top: 10px; font-size: 0.85em; color: #666;">
                ${time.players.join(', ')}
            </div>
        `;
        container.appendChild(option);
    });
}

// ============================================
// Backend API Functions
// ============================================

async function loadFromServer() {
    showSyncStatus('Loading from server...', 'loading');
    
    try {
        const response = await fetch(`${API_URL}/api/players`);
        
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.status}`);
        }
        
        const players = await response.json();
        
        // Save to in-memory cache only (no localStorage)
        savePlayers(players);
        renderPlayersList();
        calculateBestTimes();
        
        const count = Object.keys(players).length;
        if (count > 0) {
            showSyncStatus(`Loaded ${count} player${count !== 1 ? 's' : ''} from server`, 'success');
        } else {
            showSyncStatus('No players saved yet. Add some players to get started!', 'info');
        }
    } catch (error) {
        showSyncStatus(`Server unavailable. Cannot load player data.`, 'error');
        console.error('Load error:', error);
    }
}

async function saveToServer() {
    showSyncStatus('Saving to server...', 'loading');
    
    try {
        const players = loadPlayers();
        const token = localStorage.getItem(SESSION_KEY);
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}/api/players`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(players)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to save: ${response.status}`);
        }
        
        const result = await response.json();
        
        showSyncStatus(`Saved ${result.playerCount} player${result.playerCount !== 1 ? 's' : ''} to server!`, 'success');
        
        // Reload to get any merged data from server
        await loadFromServer();
    } catch (error) {
        showSyncStatus(`Error saving to server: ${error.message}`, 'error');
        console.error('Save error:', error);
    }
}

function showSyncStatus(message, type = 'info') {
    const status = document.getElementById('syncStatus');
    const icon = document.getElementById('syncStatusIcon');
    const text = document.getElementById('syncStatusText');
    
    const icons = {
        success: '●',
        error: '✕',
        info: '◆',
        loading: '◐'
    };
    
    const colors = {
        success: 'var(--success-bg, #d4edda)',
        error: 'var(--error-bg, #f8d7da)',
        info: 'var(--info-bg, #d1ecf1)',
        loading: 'var(--warning-bg, #fff3cd)'
    };
    
    icon.textContent = icons[type] || icons.info;
    text.textContent = message;
    status.style.background = colors[type] || colors.info;
    status.style.display = 'block';
    
    if (type !== 'loading') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
}

// Event Listeners
document.getElementById('savePlayer').addEventListener('click', saveCurrentPlayer);
document.getElementById('clearForm').addEventListener('click', clearForm);
document.getElementById('loadPlayer').addEventListener('click', () => {
    const name = document.getElementById('playerName').value.trim();
    if (name) {
        loadPlayerData(name);
    } else {
        alert('Please enter a player name to load!');
    }
});

document.getElementById('timezoneSelect').addEventListener('change', (e) => {
    selectedTimezone = e.target.value;
    
    // Update timezone label
    const label = document.getElementById('timezoneLabel');
    if (selectedTimezone === 'auto') {
        label.textContent = 'Auto-detected';
    } else {
        const selectElement = document.getElementById('timezoneSelect');
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        label.textContent = selectedOption.text;
    }
    
    updateTimeDisplays();
    renderTimeLabels(); // Re-render time labels with new timezone
    renderAvailabilityGrid(); // Re-render grid to update tooltips
    updateConversionExamples(); // Update conversion examples
    renderPlayersList(); // Re-render players to show times in new timezone
    calculateBestTimes(); // Re-calculate best times in new timezone
});

// Server sync button event listeners
document.getElementById('syncLoad').addEventListener('click', loadFromServer);
document.getElementById('syncSave').addEventListener('click', saveToServer);

// Auto-sync functionality removed to reduce server load
// Players can manually reload using the "Reload from Server" button

// Initialize
async function init() {
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session');
    if (sessionToken) {
        localStorage.setItem(SESSION_KEY, sessionToken);
        // Remove session param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check authentication
    await checkAuth();
    
    initializeAvailabilityGrid();
    renderTimeLabels();
    renderAvailabilityGrid();
    renderPlayersList();
    calculateBestTimes();
    updateTimeDisplays();
    
    // Load once on page load (no auto-sync to reduce server load)
    await loadFromServer();
    
    // Auto-load user's owned players if logged in
    if (currentUser) {
        const ownedPlayers = Object.keys(playersCache).filter(name => canEditPlayer(name));
        if (ownedPlayers.length > 0) {
            // Load the first owned player
            loadPlayerData(ownedPlayers[0]);
            
            // Update player selector if it exists
            updatePlayerSelector();
        }
    }
    
    // Update time displays every second
    setInterval(updateTimeDisplays, 1000);
    
    // Global mouse up listener to stop dragging
    document.addEventListener('mouseup', () => {
        isDragging = false;
        dragMode = null;
    });
    
    // Prevent text selection while dragging
    document.addEventListener('selectstart', (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    });
    
    // Auto-detect timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneSelect = document.getElementById('timezoneSelect');
    const option = Array.from(timezoneSelect.options).find(opt => opt.value === timezone);
    if (option) {
        timezoneSelect.value = timezone;
        selectedTimezone = timezone;
        document.getElementById('timezoneLabel').textContent = option.text;
    } else {
        document.getElementById('timezoneLabel').textContent = 'Auto-detected';
    }
    
    // Check for edit parameter in URL
    const editParams = new URLSearchParams(window.location.search);
    const editPlayer = editParams.get('edit');
    if (editPlayer) {
        loadPlayerData(editPlayer);
        // Scroll to the form
        document.querySelector('.user-form').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Admin key listener
    let keyBuffer = '';
    document.addEventListener('keypress', (e) => {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > ADMIN_KEY.length) {
            keyBuffer = keyBuffer.slice(-ADMIN_KEY.length);
        }
        if (keyBuffer === ADMIN_KEY) {
            if (!isAdminMode()) {
                localStorage.setItem('adminKey', ADMIN_KEY);
                alert('Admin mode activated! Delete buttons and force save are now visible.');
                renderPlayersList(); // Refresh to show delete buttons and force save
            }
            keyBuffer = '';
        }
    });
}

// Start the application
init();

// Dark mode toggle (Default is dark, toggle to light)
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('lightMode', isLight);
    const toggle = document.querySelector('.dark-mode-toggle');
    if (toggle) {
        toggle.textContent = isLight ? '◑' : '◐';
        toggle.title = isLight ? 'Toggle Dark Mode' : 'Toggle Light Mode';
    }
}

// Load light mode preference (default is dark)
if (localStorage.getItem('lightMode') === 'true') {
    document.body.classList.add('light-mode');
    const toggle = document.querySelector('.dark-mode-toggle');
    if (toggle) {
        toggle.textContent = '◑';
        toggle.title = 'Toggle Dark Mode';
    }
}
