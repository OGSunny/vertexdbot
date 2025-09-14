// netlify/functions/verify.js
const { Client, GatewayIntentBits } = require('discord.js');

// Bot Configuration - PUT YOUR BOT TOKEN HERE
const BOT_TOKEN = 'MTM5MDcyNzE2NDk2OTYxNTQzMQ.GSeAH7.UoQ4_CSW-Li-PGLWLDEgC6NaPWGs1x9806HC6A';
const VERIFIED_ROLE_ID = '1416857999825309897';
const GUILD_ID = '1416853003159339202'; // Your Discord server ID

// In-memory storage (in production, use a database)
let verificationData = new Map();

// Initialize bot
if (!client.readyTimestamp) {
    client.login(BOT_TOKEN);
}

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
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
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }

    try {
        const { code, user, captcha, guildId } = JSON.parse(event.body);

        // Validate input
        if (!code || !user || !captcha) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Missing required fields' 
                })
            };
        }

        // Wait for client to be ready
        if (!client.readyTimestamp) {
            await new Promise(resolve => client.once('ready', resolve));
        }

        // For demo purposes, accept any 6-character captcha
        if (captcha.length !== 6) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Invalid CAPTCHA format' 
                })
            };
        }

        // Get guild (your Discord server)
        const guild = client.guilds.cache.get(guildId || '1416857998055362561'); // Replace with your guild ID
        if (!guild) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Server not found' 
                })
            };
        }

        // Get member
        const member = await guild.members.fetch(user);
        if (!member) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Member not found in server' 
                })
            };
        }

        // Add verified role
        const verifiedRole = guild.roles.cache.get(VERIFIED_ROLE_ID);
        if (verifiedRole) {
            await member.roles.add(verifiedRole);
        }

        // Send DM to user
        try {
            await member.send('✅ **Verification Complete!** Welcome to the Vertex server! You now have access to all channels.');
        } catch (dmError) {
            console.log('Could not send DM to user:', dmError.message);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Verification completed successfully!' 
            })
        };

    } catch (error) {
        console.error('Verification error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Internal server error' 
            })
        };
    }
};
