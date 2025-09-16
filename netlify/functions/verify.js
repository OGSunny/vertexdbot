// netlify/functions/verify.js (Full code, ES module ready)
import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

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
        return { 
            statusCode: 405, 
            headers, 
            body: JSON.stringify({ success: false, error: 'Method not allowed' }) 
        };
    }
    
    try {
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';
        
        if (!checkRateLimit(clientIP)) {
            return { 
                statusCode: 429, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }) 
            };
        }
        
        let requestBody;
        try {
            requestBody = JSON.parse(event.body || '{}');
        } catch (error) {
            return { 
                statusCode: 400, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Invalid JSON' }) 
            };
        }
        
        const { key, userId, timestamp, hwid, executor } = requestBody;
        
        if (!key || !userId || !timestamp || !hwid) {
            return { 
                statusCode: 400, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Missing key, userId, timestamp, or hwid' }) 
            };
        }
        
        const now = Date.now();
        const requestTime = parseInt(timestamp);
        const timeDiff = Math.abs(now - requestTime);
        
        if (timeDiff > 300000) { // 5 minutes
            return { 
                statusCode: 401, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Request timestamp expired' }) 
            };
        }
        
        // Sanitize inputs
        const sanitizedKey = key.trim();
        const sanitizedUserId = userId.toString().trim();
        const sanitizedHwid = hwid.trim();
        const sanitizedExecutor = executor ? executor.trim() : 'Unknown';
        
        // Use Netlify Blobs for user data
        const store = getStore('vertexHubData');
        const userKey = `user-${sanitizedUserId}`;
        let userData;
        try {
            userData = await store.get(userKey, { type: 'json' });
        } catch (error) {
            console.error('Blob get error:', error);
            userData = null;
        }
        
        if (!userData || userData.key !== sanitizedKey || !userData.active) {
            console.log(`Invalid key attempt: ${sanitizedKey} for user ${sanitizedUserId} from IP: ${clientIP}`);
            return { 
                statusCode: 401, 
                headers, 
                body: JSON.stringify({ success: false, error: 'Invalid or inactive key' }) 
            };
        }
        
        // HWID logic
        if (userData.hwid === null || userData.hwid === undefined) {
            userData.hwid = sanitizedHwid;
            await store.setJSON(userKey, userData);
            console.log(`New HWID bound for user ${sanitizedUserId}: ${sanitizedHwid}`);
        } else if (userData.hwid !== sanitizedHwid) {
            return { 
                statusCode: 401, 
                headers, 
                body: JSON.stringify({ success: false, error: 'HWID mismatch. Reset in Discord panel.' }) 
            };
        }
        
        // Session tracking
        const sessionId = crypto.randomBytes(16).toString('hex');
        const sessionData = {
            sessionId,
            startTime: now,
            ipAddress: clientIP,
            executor: sanitizedExecutor,
            location: 'Unknown' // Can integrate geo API here if needed
        };
        if (!userData.sessions) userData.sessions = [];
        userData.sessions.push(sessionData);
        // Keep only last 10 sessions
        if (userData.sessions.length > 10) userData.sessions = userData.sessions.slice(-10);
        userData.lastUsed = now;
        userData.analytics = userData.analytics || { usageCount: 0 };
        userData.analytics.usageCount += 1;
        await store.setJSON(userKey, userData);
        
        // Log audit
        const auditKey = `audit-${Date.now()}`;
        const auditEntry = {
            action: 'auth_success',
            userId: sanitizedUserId,
            key: sanitizedKey.substring(0, 8) + '...',
            ip: clientIP,
            timestamp: now,
            sessionId
        };
        await store.setJSON(auditKey, auditEntry);
        
        console.log(`Successful auth: ${sanitizedKey} for user ${sanitizedUserId} from IP: ${clientIP}, Session: ${sessionId}`);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ 
                success: true, 
                message: 'Authentication successful', 
                userId: sanitizedUserId, 
                permissions: ['basic'], 
                sessionId 
            }) 
        };
        
    } catch (error) {
        console.error('Auth error:', error);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ success: false, error: 'Internal server error' }) 
        };
    }
}
