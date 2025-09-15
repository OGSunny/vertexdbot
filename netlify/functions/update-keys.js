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
        const expectedSecret = 'your_secure_secret_here'; // Hardcoded secret (match with index.js)
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
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Maximum HWID resets reached' }) };
                }
                resetStats.hwidResets += 1;
                resetStats.hwid = null;
                await store.setJSON(`user-${resetStats.robloxId}`, resetStats);
                result = { success: true, remainingResets: resetStats.maxHwidResets - resetStats.hwidResets };
                break;
            
            case 'get_stats':
                const { discordId: statsDiscordId } = data;
                if (!statsDiscordId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing discordId' }) };
                }
                const stats = await getUserStats(store, statsDiscordId);
                result = stats ? { success: true, ...stats } : { success: false, error: 'User not found' };
                break;
            
            case 'revoke_user':
                const { discordId: revokeDiscordId } = data;
                if (!revokeDiscordId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing discordId' }) };
                }
                const revokeStats = await getUserStats(store, revokeDiscordId);
                if (!revokeStats) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
                }
                revokeStats.active = false;
                await store.setJSON(`user-${revokeStats.robloxId}`, revokeStats);
                result = { success: true };
                break;
            
            case 'unrevoke_user':
                const { discordId: unrevokeDiscordId } = data;
                if (!unrevokeDiscordId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing discordId' }) };
                }
                const unrevokeStats = await getUserStats(store, unrevokeDiscordId);
                if (!unrevokeStats) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
                }
                unrevokeStats.active = true;
                await store.setJSON(`user-${unrevokeStats.robloxId}`, unrevokeStats);
                result = { success: true };
                break;
            
            case 'list_users':
                const { keys } = await store.list();
                const userKeys = keys.filter(k => k.key.startsWith('user-'));
                const users = [];
                for (const { key } of userKeys) {
                    const userData = await store.get(key, { type: 'json' });
                    if (userData) users.push(userData);
                }
                result = users;
                break;
            
            default:
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
        }
        
        return { statusCode: 200, headers, body: JSON.stringify(result) };
    } catch (error) {
        console.error('API error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Internal server error' }) };
    }
};

// Helper function to get user stats by discordId
async function getUserStats(store, discordId) {
    const { keys } = await store.list();
    for (const { key } of keys) {
        if (key.startsWith('user-')) {
            const userData = await store.get(key, { type: 'json' });
            if (userData && userData.discordId === discordId) {
                return userData;
            }
        }
    }
    return null;
}
