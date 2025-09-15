const { getStore } = require('@netlify/blobs');

exports.handler = async function (event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-auth-token',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }
    
    try {
        const authToken = event.headers['x-auth-token'];
        const expectedSecret = 'your_secure_secret_here'; // Match with index.js
        if (authToken !== expectedSecret) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        
        const body = JSON.parse(event.body);
        const { action, data } = body;
        
        if (!action) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing action' }) };
        }
        
        const store = getStore('vertexHubData');
        
        let result;
        switch (action) {
            case 'add_user':
                const { discordId, robloxId, key, maxHwidResets } = data;
                if (!discordId || !robloxId || !key || !maxHwidResets) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing data for add_user' }) };
                }
                const userKey = `user-${robloxId}`;
                let existing = await store.get(userKey, { type: 'json' });
                if (existing) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'User already exists' }) };
                }
                const userData = {
                    discordId,
                    robloxId,
                    key,
                    hwid: null,
                    hwidResets: 0,
                    maxHwidResets,
                    whitelistedAt: new Date().toISOString(),
                    active: true
                };
                await store.setJSON(userKey, userData);
                result = { success: true };
                break;
            
            case 'reset_hwid':
                const { discordId: resetDiscordId } = data;
                if (!resetDiscordId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing discordId' }) };
                }
                const resetStats = await getUserStats(store, resetDiscordId);
                if (!resetStats) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
                }
                if (resetStats.hwidResets >= resetStats.maxHwidResets) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Maximum HWID
