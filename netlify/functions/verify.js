import { getStore } from '@netlify/blobs';

// Rate limiting (in-memory, per cold start)
const rateLimits = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;
    
    if (!rateLimits.has(ip)) {
        rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    const limit = rateLimits.get(ip);
    if (now > limit.resetTime) {
        limit.count = 1;
        limit.resetTime = now + windowMs;
        return true;
    }
    
    if (limit.count >= maxRequests) {
        return false;
    }
    
    limit.count++;
    return true;
}

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
        return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
    }
    
    try {
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'] || 'unknown';
        
        if (!checkRateLimit(clientIP)) {
            return { statusCode: 429, headers, body: JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }) };
        }
        
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (error) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid JSON' }) };
        }
        
        const { key, userId, timestamp, hwid } = requestBody;
        
        if (!key || !userId || !timestamp || !hwid) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Missing key, userId, timestamp, or hwid' }) };
        }
        
        const now = Date.now();
        const requestTime = parseInt(timestamp);
        const timeDiff = Math.abs(now - requestTime);
        
        if (timeDiff > 300000) {
            return { statusCode: 401, headers, body: JSON.stringify({ success: false, error: 'Request timestamp expired' }) };
        }
        
        // Use Netlify Blobs for user data
        const store = getStore('vertexHubData');
        const userKey = `user-${userId}`;
        let userData = await store.get(userKey, { type: 'json' });
        
        if (!userData || userData.key !== key || !userData.active) {
            console.log(`Invalid key attempt: ${key} for user ${userId} from IP: ${clientIP}`);
            return { statusCode: 401, headers, body: JSON.stringify({ success: false, error: 'Invalid or inactive key' }) };
        }
        
        // HWID logic
        if (userData.hwid === null) {
            userData.hwid = hwid;
            await store.setJSON(userKey, userData);
            console.log(`New HWID bound for user ${userId}: ${hwid}`);
        } else if (userData.hwid !== hwid) {
            return { statusCode: 401, headers, body: JSON.stringify({ success: false, error: 'HWID mismatch. Reset in Discord panel.' }) };
        }
        
        console.log(`Successful auth: ${key} for user ${userId} from IP: ${clientIP}`);
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Authentication successful', userId, permissions: ['basic'] }) };
        
    } catch (error) {
        console.error('Auth error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Internal server error' }) };
    }
}
