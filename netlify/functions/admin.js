// netlify/functions/admin.js
import { getStore } from '@netlify/blobs';

const ADMIN_SECRET = 'VH_ADMIN_SECRET_2025';

export default async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-auth-token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'text/html; charset=utf-8'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: { ...headers, 'Content-Type': 'text/plain' }, body: '' };
    }
    
    try {
        const authToken = event.headers['x-auth-token'] || new URLSearchParams(event.queryStringParameters || {}).get('token');
        if (authToken !== ADMIN_SECRET) {
            return { 
                statusCode: 403, 
                headers, 
                body: '<h1>Unauthorized</h1>' 
            };
        }
        
        if (event.httpMethod === 'GET') {
            // Serve admin panel HTML
            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vertex Hub Admin Panel</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #1e1e1e; color: #ffffff; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; background: #333; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #333; padding: 15px; border-radius: 8px; text-align: center; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #333; }
        .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #555; }
        .table th { background: #444; }
        .form { background: #333; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .form input, .form button { padding: 10px; margin: 5px; border: none; border-radius: 5px; }
        .form input { background: #555; color: #fff; }
        .form button { background: #007bff; color: #fff; cursor: pointer; }
        .logs { max-height: 300px; overflow-y: auto; background: #333; padding: 10px; border-radius: 8px; }
        .modal { display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
        .modal-content { background: #333; margin: 15% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 500px; }
        .close { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌟 Vertex Hub Admin Panel</h1>
            <p>Manage users, keys, and system health</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Users</h3>
                <p id="totalUsers">Loading...</p>
            </div>
            <div class="stat-card">
                <h3>Active Keys</h3>
                <p id="activeKeys">Loading...</p>
            </div>
            <div class="stat-card">
                <h3>Active Sessions</h3>
                <p id="activeSessions">Loading...</p>
            </div>
            <div class="stat-card">
                <h3>Total Requests</h3>
                <p id="totalRequests">Loading...</p>
            </div>
        </div>
        
        <div class="form">
            <h3>Generate Keys</h3>
            <input type="number" id="keyAmount" placeholder="Number of keys" min="1" max="1000">
            <button onclick="generateKeys()">Generate</button>
        </div>
        
        <div class="form">
            <h3>Remove Key</h3>
            <input type="text" id="removeKey" placeholder="Key to remove">
            <button onclick="removeKey()">Remove</button>
        </div>
        
        <div class="form">
            <h3>Suspend User</h3>
            <input type="text" id="suspendDiscordId" placeholder="Discord ID">
            <input type="text" id="suspendDuration" placeholder="Duration (e.g., 7d)">
            <input type="text" id="suspendReason" placeholder="Reason">
            <button onclick="suspendUser()">Suspend</button>
        </div>
        
        <h3>Users Table</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Discord ID</th>
                    <th>Roblox ID</th>
                    <th>Key</th>
                    <th>Active</th>
                    <th>HWID Resets</th>
                    <th>Suspended Until</th>
                    <th>Sessions</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="usersTable"></tbody>
        </table>
        
        <h3>Audit Logs</h3>
        <div class="logs" id="auditLogs">Loading...</div>
        
        <button onclick="refreshData()">Refresh Data</button>
    </div>
    
    <div id="userModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h3 id="modalTitle">User Details</h3>
            <div id="modalBody"></div>
        </div>
    </div>
    
    <script>
        const API_URL = '/.netlify/functions/admin';
        const TOKEN = '${ADMIN_SECRET}';
        
        async function fetchData(endpoint, options = {}) {
            const response = await fetch(\`\${API_URL}\${endpoint}\`, {
                headers: { 'x-auth-token': TOKEN, ...options.headers },
                ...options
            });
            if (!response.ok) throw new Error(\`Error: \${response.status}\`);
            return response.json();
        }
        
        async function loadStats() {
            try {
                const stats = await fetchData('/stats');
                document.getElementById('totalUsers').textContent = stats.totalUsers;
                document.getElementById('activeKeys').textContent = stats.activeKeys;
                document.getElementById('activeSessions').textContent = stats.activeSessions;
                document.getElementById('totalRequests').textContent = stats.totalRequests;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }
        
        async function loadUsers() {
            try {
                const users = await fetchData('/users');
                const tbody = document.getElementById('usersTable');
                tbody.innerHTML = '';
                users.forEach(user => {
                    const row = tbody.insertRow();
                    row.innerHTML = \`
                        <td>\${user.discordId}</td>
                        <td>\${user.robloxId}</td>
                        <td>\${user.key}</td>
                        <td>\${user.active ? 'Yes' : 'No'}</td>
                        <td>\${user.hwidResets}/\${user.maxHwidResets}</td>
                        <td>\${user.suspendedUntil || 'N/A'}</td>
                        <td>\${user.sessions ? user.sessions.length : 0}</td>
                        <td><button onclick="viewUser('\${user.discordId}')">View</button></td>
                    \`;
                });
            } catch (error) {
                console.error('Error loading users:', error);
            }
        }
        
        async function loadLogs() {
            try {
                const logs = await fetchData('/logs');
                document.getElementById('auditLogs').innerHTML = logs.map(log => 
                    \`<p>[\${new Date(log.timestamp).toLocaleString()}] \${log.action} - User: \${log.userId} IP: \${log.ip}</p>\`
                ).join('');
            } catch (error) {
                console.error('Error loading logs:', error);
            }
        }
        
        async function generateKeys() {
            const amount = document.getElementById('keyAmount').value;
            if (!amount) return alert('Enter amount');
            try {
                await fetchData('', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'generate_keys', data: { amount: parseInt(amount) } })
                });
                alert('Keys generated!');
                refreshData();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        async function removeKey() {
            const key = document.getElementById('removeKey').value;
            if (!key) return alert('Enter key');
            try {
                await fetchData('', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'remove_key', data: { key } })
                });
                alert('Key removed!');
                refreshData();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        async function suspendUser() {
            const discordId = document.getElementById('suspendDiscordId').value;
            const duration = document.getElementById('suspendDuration').value;
            const reason = document.getElementById('suspendReason').value;
            if (!discordId || !duration) return alert('Enter ID and duration');
            try {
                await fetchData('', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'suspend_user', data: { discordId, duration, reason } })
                });
                alert('User suspended!');
                refreshData();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        function viewUser(discordId) {
            // Fetch and show modal - implement fetch user details
            document.getElementById('modalTitle').textContent = \`User \${discordId}\`;
            document.getElementById('modalBody').innerHTML = 'Loading...';
            document.getElementById('userModal').style.display = 'block';
            // TODO: Fetch and display full user data
        }
        
        function closeModal() {
            document.getElementById('userModal').style.display = 'none';
        }
        
        function refreshData() {
            loadStats();
            loadUsers();
            loadLogs();
        }
        
        // Initial load
        refreshData();
        setInterval(refreshData, 30000); // Refresh every 30s
        
        // Modal close on outside click
        window.onclick = function(event) {
            const modal = document.getElementById('userModal');
            if (event.target == modal) closeModal();
        }
    </script>
</body>
</html>`;
            return { 
                statusCode: 200, 
                headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' }, 
                body: html 
            };
        }
        
        if (event.httpMethod === 'POST') {
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
            // Handle admin actions like generate_keys, etc. - mirror update-keys but with admin secret
            // For brevity, redirect to update-keys logic, but since separate, implement similarly
            const store = getStore('vertexHubData');
            let result = { success: false };
            switch (action) {
                case 'stats':
                    const { keys } = await store.list();
                    let totalUsers = 0, activeSessions = 0, totalRequests = 0;
                    for (const { key: k } of keys) {
                        if (k.startsWith('user-')) {
                            totalUsers++;
                            const ud = await store.get(k, { type: 'json' });
                            if (ud && ud.sessions) activeSessions += ud.sessions.filter(s => !s.endTime).length;
                        } else if (k.startsWith('audit-')) {
                            totalRequests++;
                        }
                    }
                    result = { success: true, totalUsers, activeSessions, totalRequests: keys.length };
                    break;
                case 'users':
                    const userKeys = keys.filter(k => k.startsWith('user-'));
                    const users = [];
                    for (const { key } of userKeys) {
                        try {
                            const userData = await store.get(key, { type: 'json' });
                            if (userData) users.push(userData);
                        } catch (error) {}
                    }
                    result = users;
                    break;
                case 'logs':
                    const auditKeys = keys.filter(k => k.startsWith('audit-'));
                    const logs = [];
                    for (const { key } of auditKeys.slice(-50)) { // Last 50
                        try {
                            const log = await store.get(key, { type: 'json' });
                            if (log) logs.push(log);
                        } catch (error) {}
                    }
                    result = logs.reverse();
                    break;
                // Add other actions as needed, e.g., generate_keys, etc.
                default:
                    result.error = 'Invalid action';
            }
            return { 
                statusCode: 200, 
                headers: { ...headers, 'Content-Type': 'application/json' }, 
                body: JSON.stringify(result) 
            };
        }
        
        return { 
            statusCode: 405, 
            headers, 
            body: JSON.stringify({ success: false, error: 'Method not allowed' }) 
        };
        
    } catch (error) {
        console.error('Admin error:', error);
        return { 
            statusCode: 500, 
            headers, 
            body: '<h1>Internal Server Error</h1>' 
        };
    }
}
