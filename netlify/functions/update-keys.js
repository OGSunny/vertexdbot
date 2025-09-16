// netlify/functions/update-keys.js
import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

const AUTH_SECRET = 'VH_SECRET_2025';

export default async function handler(event, context) {
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
        return { 
            statusCode: 405, 
            headers, 
            body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) 
        };
    }
    
    try {
        const authToken = event.headers['x-auth-token'] || event.headers['x-auth-token'];
        if (authToken !== AUTH_SECRET) {
            return { 
                statusCode: 403, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Unauthorized' }) 
            };
        }
        
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch (error) {
            return { 
                statusCode: 400, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Invalid JSON' }) 
            };
        }
        
        const { action, data } = body;
        
        if (!action) {
            return { 
                statusCode: 400, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Missing action' }) 
            };
        }
        
        const store = getStore('vertexHubData');
        
        let result;
        switch (action) {
            case 'init_keys':
                // Generate 200 unique keys on first deployment
                const availableKeysKey = 'available_keys';
                let availableKeys = [];
                try {
                    const existing = await store.get(availableKeysKey, { type: 'json' });
                    availableKeys = existing || [];
                } catch (error) {
                    // Ignore if not exists
                }
                if (availableKeys.length === 0) {
                    const newKeys = [];
                    for (let i = 0; i < 200; i++) {
                        const key = 'VH-' + crypto.randomBytes(6).toString('hex').toUpperCase();
                        newKeys.push(key);
                    }
                    availableKeys = newKeys;
                    await store.setJSON(availableKeysKey, availableKeys);
                    console.log('Generated 200 initial keys');
                }
                result = { success: true, totalKeys: availableKeys.length };
                break;
            
            case 'add_user':
                await store.setJSON('available_keys', []); // Ensure init
                const { discordId, robloxId, key: providedKey, maxHwidResets } = data;
                if (!discordId || !robloxId || !maxHwidResets) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing data for add_user' }) 
                    };
                }
                const userKeyStr = `user-${robloxId}`;
                let existingUser;
                try {
                    existingUser = await store.get(userKeyStr, { type: 'json' });
                } catch (error) {
                    existingUser = null;
                }
                if (existingUser) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'User already exists' }) 
                    };
                }
                const availableKeysKey = 'available_keys';
                let availableKeys = [];
                try {
                    const availBlob = await store.get(availableKeysKey, { type: 'json' });
                    availableKeys = availBlob || [];
                } catch (error) {
                    availableKeys = [];
                }
                let assignedKey = providedKey;
                if (!assignedKey && availableKeys.length > 0) {
                    assignedKey = availableKeys.pop();
                    await store.setJSON(availableKeysKey, availableKeys);
                } else if (!assignedKey) {
                    assignedKey = 'VH-' + crypto.randomBytes(6).toString('hex').toUpperCase();
                }
                const userData = {
                    discordId: discordId.toString(),
                    robloxId: parseInt(robloxId),
                    key: assignedKey,
                    hwid: null,
                    hwidResets: 0,
                    maxHwidResets: parseInt(maxHwidResets),
                    whitelistedAt: new Date().toISOString(),
                    active: true,
                    suspendedUntil: null,
                    sessions: [],
                    analytics: { usageCount: 0 }
                };
                await store.setJSON(userKeyStr, userData);
                result = { success: true, assignedKey };
                break;
            
            case 'reset_hwid':
                const { discordId: resetDiscordId } = data;
                if (!resetDiscordId) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing discordId' }) 
                    };
                }
                const resetStats = await getUserStats(store, resetDiscordId);
                if (!resetStats) {
                    return { 
                        statusCode: 404, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'User not found' }) 
                    };
                }
                if (resetStats.hwidResets >= resetStats.maxHwidResets) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Maximum HWID resets reached' }) 
                    };
                }
                resetStats.hwidResets += 1;
                resetStats.hwid = null;
                await store.setJSON(`user-${resetStats.robloxId}`, resetStats);
                result = { success: true, remainingResets: resetStats.maxHwidResets - resetStats.hwidResets };
                break;
            
            case 'get_stats':
                const { discordId: statsDiscordId } = data;
                if (!statsDiscordId) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing discordId' }) 
                    };
                }
                const stats = await getUserStats(store, statsDiscordId);
                result = stats ? { success: true, ...stats } : { success: false, error: 'User not found' };
                break;
            
            case 'revoke_user':
                const { discordId: revokeDiscordId } = data;
                if (!revokeDiscordId) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing discordId' }) 
                    };
                }
                const revokeStats = await getUserStats(store, revokeDiscordId);
                if (!revokeStats) {
                    return { 
                        statusCode: 404, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'User not found' }) 
                    };
                }
                revokeStats.active = false;
                await store.setJSON(`user-${revokeStats.robloxId}`, revokeStats);
                result = { success: true };
                break;
            
            case 'unrevoke_user':
                const { discordId: unrevokeDiscordId } = data;
                if (!unrevokeDiscordId) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing discordId' }) 
                    };
                }
                const unrevokeStats = await getUserStats(store, unrevokeDiscordId);
                if (!unrevokeStats) {
                    return { 
                        statusCode: 404, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'User not found' }) 
                    };
                }
                unrevokeStats.active = true;
                await store.setJSON(`user-${unrevokeStats.robloxId}`, unrevokeStats);
                result = { success: true };
                break;
            
            case 'suspend_user':
                const { discordId: suspendDiscordId, duration, reason } = data;
                if (!suspendDiscordId || !duration) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing discordId or duration' }) 
                    };
                }
                const suspendStats = await getUserStats(store, suspendDiscordId);
                if (!suspendStats) {
                    return { 
                        statusCode: 404, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'User not found' }) 
                    };
                }
                const suspendUntil = new Date();
                suspendUntil.setDate(suspendUntil.getDate() + parseInt(duration));
                suspendStats.suspendedUntil = suspendUntil.toISOString();
                suspendStats.suspendReason = reason;
                await store.setJSON(`user-${suspendStats.robloxId}`, suspendStats);
                result = { success: true };
                break;
            
            case 'set_loadstring':
                const { loadstring } = data;
                if (!loadstring) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing loadstring' }) 
                    };
                }
                await store.setJSON('config_loadstring', loadstring);
                result = { success: true };
                break;
            
            case 'generate_keys':
                const { amount } = data;
                if (!amount || amount > 1000) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Invalid amount' }) 
                    };
                }
                const genAvailableKey = 'available_keys';
                let genAvailable = [];
                try {
                    const genBlob = await store.get(genAvailableKey, { type: 'json' });
                    genAvailable = genBlob || [];
                } catch (error) {
                    genAvailable = [];
                }
                for (let i = 0; i < amount; i++) {
                    const newKey = 'VH-' + crypto.randomBytes(6).toString('hex').toUpperCase();
                    genAvailable.push(newKey);
                }
                await store.setJSON(genAvailableKey, genAvailable);
                result = { success: true, generated: amount, total: genAvailable.length };
                break;
            
            case 'remove_key':
                const { key: removeKey } = data;
                if (!removeKey) {
                    return { 
                        statusCode: 400, 
                        headers, 
                        body: JSON.stringify({ success: false, error: 'Missing key' }) 
                    };
                }
                // Remove from available keys
                let removeAvailable = [];
                try {
                    const removeBlob = await store.get('available_keys', { type: 'json' });
                    removeAvailable = (removeBlob || []).filter(k => k !== removeKey);
                } catch (error) {
                    removeAvailable = [];
                }
                await store.setJSON('available_keys', removeAvailable);
                // Also check users
                const { keys } = await store.list();
                for (const { key: blobKey } of keys) {
                    if (blobKey.startsWith('user-')) {
                        const userD = await store.get(blobKey, { type: 'json' });
                        if (userD && userD.key === removeKey) {
                            userD.active = false;
                            await store.setJSON(blobKey, userD);
                        }
                    }
                }
                result = { success: true };
                break;
            
            case 'key_analytics':
                const { keys: allKeys } = await store.list();
                let totalKeys = 0;
                let activeKeys = 0;
                let usageCount = 0;
                for (const { key: k } of allKeys) {
                    if (k === 'available_keys') {
                        const avail = await store.get(k, { type: 'json' });
                        totalKeys += (avail || []).length;
                    } else if (k.startsWith('user-')) {
                        const ud = await store.get(k, { type: 'json' });
                        if (ud) {
                            totalKeys++;
                            if (ud.active) activeKeys++;
                            if (ud.analytics) usageCount += ud.analytics.usageCount || 0;
                        }
                    }
                }
                const usageRate = totalKeys > 0 ? Math.round((activeKeys / totalKeys) * 100) : 0;
                result = { success: true, totalKeys, activeKeys, usageRate, totalUsage: usageCount };
                break;
            
            case 'list_users':
                const { keys } = await store.list();
                const userKeys = keys.filter(k => k.startsWith('user-'));
                const users = [];
                for (const { key } of userKeys) {
                    try {
                        const userData = await store.get(key, { type: 'json' });
                        if (userData) users.push(userData);
                    } catch (error) {
                        console.error('Error fetching user:', error);
                    }
                }
                result = users;
                break;
            
            default:
                return { 
                    statusCode: 400, 
                    headers, 
                    body: JSON.stringify({ success: false, error: 'Invalid action' }) 
                };
        }
        
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify(result) 
        };
    } catch (error) {
        console.error('API error:', error);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ success: false, error: 'Internal server error' }) 
        };
    }
}

// Helper function to get user stats by discordId
async function getUserStats(store, discordId) {
    const { keys } = await store.list();
    for (const { key } of keys) {
        if (key.startsWith('user-')) {
            try {
                const userData = await store.get(key, { type: 'json' });
                if (userData && userData.discordId === discordId.toString()) {
                    // Check suspension
                    if (userData.suspendedUntil) {
                        const now = new Date();
                        const suspendDate = new Date(userData.suspendedUntil);
                        if (now > suspendDate) {
                            userData.suspendedUntil = null;
                            userData.active = true;
                            await store.setJSON(key, userData);
                        } else {
                            userData.active = false;
                        }
                    }
                    // Increment usage if applicable
                    if (userData.analytics) {
                        userData.analytics.usageCount = (userData.analytics.usageCount || 0) + 1;
                        await store.setJSON(key, userData);
                    }
                    return userData;
                }
            } catch (error) {
                console.error('Error in getUserStats:', error);
            }
        }
    }
    return null;
}
