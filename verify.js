// Save as: netlify/functions/verify.js

const crypto = require('crypto');

// Store valid keys as environment variables or in the function
const validKeys = new Set([
    'YOUR-VALID-KEY-1',
    'YOUR-VALID-KEY-2',
    'PREMIUM-KEY-123',
    'ZKQWRPTLFNSXMU',
    'BDTJLXWPAQHCRY',
    'XGFRLNVWZMKTPQ',
    'KJYDRTNLQMSXHB',
    'WZRNYXCFDKJQTP',
    'PJTBVHKRDMZLQX',
    'LZXDWFNQYPKHMR',
    'QWVZRKFMYNLXDP',
    'XQKTLZNWVHPRDY',
    'TMPRXZKNDLFYQW',
    'KXJYLNQZRWMTDP',
    'NZXYFRLHWQKTMD',
    'DZRJXYWQLTKNMP',
    'HXRZFWNYQJLTDP',
    'JNZQYRXWKTDLPM',
    'VYTRXQKJWNZPLD',
    'QMLWZKXJYTRPND',
    'YWXKRJNZTDLQMP',
    'MZQRYXKNTWPLDJ',
    'RQXZNYKWJLTMDP',
    'NXYRQZTWKJLMDP',
    'TWZKXJYRQNLMDP',
    'JZXRYKWNTDQLPM',
    'QZKXNWYJRLTMDP',
    'WQKZJXRYNTLDMP',
    'YXZKQWNJTRLMDP',
    'MZKQXWYJTRLNDP',
    'QZXYRWKJNTPDLM',
    'KQXZYWJNRLTMDP',
    'XQZRYWKNTJLMDP',
    'ZQKXNYRWJTLDMP',
    'QKXZYWJNRLTMDP',
    'NZQXKYWJTRLMDP',
    'YQKZXRWNTJLMDP',
    'ZQXYKWRJNTPDLM',
    'KXZQYWJNRLTMDP',
    'QZXYRWKJNTPMDL',
    'WZKXQYJRNTLDMP',
    'JXZKQYWNRLTMDP',
    'QXZRYWKJNTPDLM',
    'ZQKYXWJNRLTMDP',
    'XQZKYWJRNTLDMP',
    'KXZQYWNRJLTMDP',
    'ZQXYKWRJNTPLDM',
    'YWZKXQJNRLTMDP',
    'QXZKYWRJNTPMDL',
    'ZQXKYWJRNTLDMP',
    'KXZQYWJNRLTMDP',
    'QZXYRWKJNTPMDL',
    'XZQKYWJRNTLDMP',
    'JXZKQYWNRLTMDP',
    'ZQKYXWJNRLTMDP',
    'QXZRYWKJNTPMDL',
    'KXZQYWJRNTLDMP',
    'ZQXYKWRJNTPLDM',
    'YWZKXQJNRLTMDP',
    'QXZKYWRJNTPMDL',
    'ZQXKYWJRNTLDMP',
    'KXZQYWJNRLTMDP',
    'QZXYRWKJNTPMDL',
    'XZQKYWJRNTLDMP',
    'JXZKQYWNRLTMDP',
    'ZQKYXWJNRLTMDP',
    'QXZRYWKJNTPMDL',
    'KXZQYWJRNTLDMP',
    'ZQXYKWRJNTPLDM',
    'YWZKXQJNRLTMDP',
    'QXZKYWRJNTPMDL',
    'ZQXKYWJRNTLDMP',
    'KXZQYWJNRLTMDP',
    'QZXYRWKJNTPMDL',
    'XZQKYWJRNTLDMP',
    'JXZKQYWNRLTMDP',
    'ZQKYXWJNRLTMDP',
    'QXZRYWKJNTPMDL',
    'KXZQYWJRNTLDMP',
    'ZQXYKWRJNTPLDM',
    'YWZKXQJNRLTMDP',
    'QXZKYWRJNTPMDL',
    'ZQXKYWJRNTLDMP',
    'KXZQYWJNRLTMDP',
    'QZXYRWKJNTPMDL',
    'XZQKYWJRNTLDMP',
    'JXZKQYWNRLTMDP',
    'ZQKYXWJNRLTMDP',
    'QXZRYWKJNTPMDL',
    'KXZQYWJRNTLDMP',
    'ZQXYKWRJNTPLDM',
    'YWZKXQJNRLTMDP',
    'QXZKYWRJNTPMDL',
    'ZQXKYWJRNTLDMP',
    'KXZQYWJNRLTMDP',
    'QZXYRWKJNTPMDL',
    'XZQKYWJRNTLDMP'
]);

// Rate limiting storage (resets on cold starts)
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

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Method not allowed'
            })
        };
    }
    
    try {
        const clientIP = event.headers['x-forwarded-for'] || 
                        event.headers['x-real-ip'] || 
                        'unknown';
        
        // Rate limiting
        if (!checkRateLimit(clientIP)) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Too many requests. Please try again later.'
                })
            };
        }
        
        // Parse request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid JSON'
                })
            };
        }
        
        const { key, userId, timestamp, signature } = requestBody;
        
        // Basic validation
        if (!key) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing authentication key'
                })
            };
        }
        
        // Check if key exists in valid keys
        if (!validKeys.has(key)) {
            console.log(`Invalid key attempt: ${key} from IP: ${clientIP}`);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid authentication key'
                })
            };
        }
        
        // Optional: Verify timestamp to prevent replay attacks
        if (timestamp) {
            const now = Date.now();
            const requestTime = parseInt(timestamp);
            const timeDiff = Math.abs(now - requestTime);
            
            // Allow 5 minute window
            if (timeDiff > 300000) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Request timestamp expired'
                    })
                };
            }
        }
        
        // Optional: Verify signature for additional security
        if (signature && userId && timestamp) {
            const expectedSignature = crypto
                .createHmac('sha256', key)
                .update(`${userId}:${timestamp}`)
                .digest('hex');
                
            if (signature !== expectedSignature) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid signature'
                    })
                };
            }
        }
        
        // Success response
        console.log(`Successful auth: ${key} from IP: ${clientIP}`);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Authentication successful',
                userId: userId || null,
                permissions: ['basic']
            })
        };
        
    } catch (error) {
        console.error('Auth error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};
