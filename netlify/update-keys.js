// netlify/functions/update-keys.js
const fs = require('fs').promises;
const path = require('path');

exports.handler = async function (event, context) {
    // CORS headers (aligned with netlify.toml)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-auth-token',
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
    
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        // Authenticate request
        const authToken = event.headers['x-auth-token'];
        if (authToken !== process.env.UPDATE_KEYS_SECRET) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }
        
        // Parse request body
        const { keys } = JSON.parse(event.body);
        
        // Validate input
        if (!Array.isArray(keys)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Keys must be an array' })
            };
        }
        
        // Read current verify.js
        const verifyPath = path.join(__dirname, 'verify.js');
        let verifyContent = await fs.readFile(verifyPath, 'utf8');
        
        // Generate new validKeys Set string
        const keysString = keys.map(key => `'${key}'`).join(',\n    ');
        const newValidKeys = `const validKeys = new Set([\n    ${keysString}\n]);`;
        
        // Replace the validKeys Set in verify.js
        const regex = /const validKeys = new Set\(\[[\s\S]*?\]\);/;
        if (!regex.test(verifyContent)) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to locate validKeys in verify.js' })
            };
        }
        verifyContent = verifyContent.replace(regex, newValidKeys);
        
        // Write updated verify.js
        await fs.writeFile(verifyPath, verifyContent);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Keys updated successfully' })
        };
    } catch (error) {
        console.error('Update keys error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Internal server error' })
        };
    }
};
