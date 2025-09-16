// netlify/functions/verify.js
import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-auth-token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

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

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response('', { status: 200, headers: CORS_HEADERS });
    }
    
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
            status: 405, 
            headers: CORS_HEADERS 
        });
    }
    
    try {
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-nf-client-connection-ip') || request.headers.get('client-ip') || 'unknown';
        
        if (!checkRateLimit(clientIP)) {
            return new Response(JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }), { 
                status: 429, 
                headers: CORS_HEADERS 
            });
        }
        
        let requestBody;
        try {
            requestBody = await request.json();
        } catch (error) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), { 
                status: 400, 
                headers: CORS_HEADERS 
            });
        }
        
        const { key, userId, timestamp, hwid, executor } = requestBody;
        
        if (!key || !userId || !timestamp || !hwid) {
            return new Response(JSON.stringify({ success: false, error: 'Missing key, userId, timestamp, or hwid' }), { 
                status: 400, 
                headers: CORS_HEADERS 
            });
        }
        
        const now = Date.now();
        const requestTime = parseInt(timestamp);
        const timeDiff = Math.abs(now - requestTime);
        
        if (timeDiff > 300000) { // 5 minutes
            return new Response(JSON.stringify({ success: false, error: 'Request timestamp expired' }), { 
                status: 401, 
                headers: CORS_HEADERS 
            });
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
            const blob = await store.get(userKey);
            userData = blob ? await blob.json() : null;
        } catch (error) {
            console.error('Blob get error:', error);
            userData = null;
        }
        
        if (!userData || userData.key !== sanitizedKey || !userData.active) {
            console.log(`Invalid key attempt: ${sanitizedKey} for user ${sanitizedUserId} from IP: ${clientIP}`);
            return new Response(JSON.stringify({ success: false, error: 'Invalid or inactive key' }), { 
                status: 401, 
                headers: CORS_HEADERS 
            });
        }
        
        // HWID logic
        if (userData.hwid === null || userData.hwid === undefined) {
            userData.hwid = sanitizedHwid;
            await store.setJSON(userKey, userData);
            console.log(`New HWID bound for user ${sanitizedUserId}: ${sanitizedHwid}`);
        } else if (userData.hwid !== sanitizedHwid) {
            return new Response(JSON.stringify({ success: false, error: 'HWID mismatch. Reset in Discord panel.' }), { 
                status: 401, 
                headers: CORS_HEADERS 
            });
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
        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Authentication successful', 
            userId: sanitizedUserId, 
            permissions: ['basic'], 
            sessionId 
        }), { 
            status: 200, 
            headers: CORS_HEADERS 
        });
        
    } catch (error) {
        console.error('Auth error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { 
            status: 500, 
            headers: CORS_HEADERS 
        });
    }
}
