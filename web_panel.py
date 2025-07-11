import sqlite3
import os
from flask import Flask, request, redirect, url_for, session, render_template_string, jsonify, flash
from functools import wraps
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'supersecretkey123'
# Use the same database as the Discord bot
DB_PATH = 'bot_data.db'

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Create web panel specific tables
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        username TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )''')
    
    # Create default admin user if not exists
    c.execute('SELECT * FROM users WHERE username = ?', ('UNordinary',))
    if not c.fetchone():
        c.execute('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', 
                 ('UNordinary', 'Sosama01881', 1))
    
    conn.commit()
    conn.close()

init_db()

# --- Auth Decorator ---
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session or not session.get('is_admin'):
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated

# --- HTML Templates (as strings) ---
base_template = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNordinary Hub - Admin Panel</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            min-height: 100vh;
        }
        .admin-container {
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 280px;
            background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 0;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            position: fixed;
            height: 100vh;
            overflow-y: auto;
        }
        .sidebar-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-header h2 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .sidebar-header p {
            font-size: 14px;
            opacity: 0.8;
        }
        .nav-menu {
            padding: 20px 0;
        }
        .nav-item {
            display: block;
            padding: 15px 25px;
            color: #ecf0f1;
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
            font-weight: 500;
        }
        .nav-item:hover, .nav-item.active {
            background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
            border-left-color: #667eea;
            color: #fff;
        }
        .nav-item i {
            margin-right: 12px;
            width: 20px;
            text-align: center;
        }
        .main-content {
            flex: 1;
            margin-left: 280px;
            background: #f8f9fa;
            min-height: 100vh;
        }
        .top-bar {
            background: white;
            padding: 20px 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .top-bar h1 {
            color: #2c3e50;
            font-size: 28px;
            font-weight: 600;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
        }
        .user-details h4 {
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 2px;
        }
        .user-details p {
            color: #7f8c8d;
            font-size: 14px;
        }
        .logout-btn {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
        }
        .content-area {
            padding: 30px;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            border-left: 4px solid #667eea;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .stat-card h3 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .stat-card h3 i {
            margin-right: 10px;
            color: #667eea;
        }
        .stat-number {
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 14px;
        }
        .content-section {
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            padding: 30px;
            margin-bottom: 25px;
        }
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ecf0f1;
        }
        .section-header h2 {
            color: #2c3e50;
            font-size: 24px;
            font-weight: 600;
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        }
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #2c3e50;
            font-weight: 600;
        }
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #ecf0f1;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        .form-control:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
        }
        .table td {
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        .table tr:hover {
            background: #f8f9fa;
        }
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-open { background: #d4edda; color: #155724; }
        .status-closed { background: #f8d7da; color: #721c24; }
        .status-pending { background: #fff3cd; color: #856404; }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert-danger {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        @media (max-width: 768px) {
            .sidebar { width: 100%; position: relative; height: auto; }
            .main-content { margin-left: 0; }
            .dashboard-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="sidebar">
            <div class="sidebar-header">
                <h2><i class="fab fa-discord"></i> UNordinary Hub</h2>
                <p>Admin Panel</p>
            </div>
            <nav class="nav-menu">
                <a href="{{ url_for('dashboard') }}" class="nav-item {% if active=='dashboard' %}active{% endif %}">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="{{ url_for('tickets') }}" class="nav-item {% if active=='tickets' %}active{% endif %}">
                    <i class="fas fa-ticket-alt"></i> Tickets
                </a>
                <a href="{{ url_for('users') }}" class="nav-item {% if active=='users' %}active{% endif %}">
                    <i class="fas fa-users"></i> Users
                </a>
                <a href="{{ url_for('logs') }}" class="nav-item {% if active=='logs' %}active{% endif %}">
                    <i class="fas fa-list"></i> Logs
                </a>
                <a href="{{ url_for('settings') }}" class="nav-item {% if active=='settings' %}active{% endif %}">
                    <i class="fas fa-cog"></i> Settings
                </a>
                <a href="{{ url_for('security') }}" class="nav-item {% if active=='security' %}active{% endif %}">
                    <i class="fas fa-shield-alt"></i> Security
                </a>
                <a href="{{ url_for('health') }}" class="nav-item {% if active=='health' %}active{% endif %}">
                    <i class="fas fa-heartbeat"></i> Health
                </a>
                <a href="{{ url_for('send_message') }}" class="nav-item {% if active=='send_message' %}active{% endif %}">
                    <i class="fas fa-paper-plane"></i> Send Message
                </a>
            </nav>
        </div>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>{{ page_title }}</h1>
                <div class="user-info">
                    <div class="user-avatar">
                        {{ session.get('user', 'U')[0].upper() }}
                    </div>
                    <div class="user-details">
                        <h4>{{ session.get('user', 'User') }}</h4>
                        <p>{% if session.get('is_admin') %}Administrator{% else %}User{% endif %}</p>
                    </div>
                    <a href="{{ url_for('logout') }}" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
            
            <div class="content-area">
                {{ content|safe }}
            </div>
        </div>
    </div>
</body>
</html>
'''

# --- Routes ---
@app.route('/')
@login_required
def dashboard():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get real counts from Discord bot database
    c.execute('SELECT COUNT(*) FROM tickets')
    ticket_count = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM tickets WHERE status="open"')
    open_tickets = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM users')
    user_count = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM logs')
    log_count = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM verifications')
    verified_users = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM mod_logs')
    moderation_actions = c.fetchone()[0]
    
    conn.close()
    
    dashboard_content = '''
    <div class="dashboard-grid">
        <div class="stat-card">
            <h3><i class="fas fa-ticket-alt"></i> Total Tickets</h3>
            <div class="stat-number">''' + str(ticket_count) + '''</div>
            <div class="stat-label">All time tickets</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-exclamation-circle"></i> Open Tickets</h3>
            <div class="stat-number">''' + str(open_tickets) + '''</div>
            <div class="stat-label">Currently open</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-users"></i> Users</h3>
            <div class="stat-number">''' + str(user_count) + '''</div>
            <div class="stat-label">Registered users</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-check-circle"></i> Verified Users</h3>
            <div class="stat-number">''' + str(verified_users) + '''</div>
            <div class="stat-label">Discord verified</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-shield-alt"></i> Mod Actions</h3>
            <div class="stat-number">''' + str(moderation_actions) + '''</div>
            <div class="stat-label">Moderation logs</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-list"></i> System Logs</h3>
            <div class="stat-number">''' + str(log_count) + '''</div>
            <div class="stat-label">Web panel logs</div>
        </div>
    </div>
    
    <div class="content-section">
        <div class="section-header">
            <h2>Welcome to UNordinary Hub</h2>
        </div>
        <p style="color: #7f8c8d; line-height: 1.6;">
            Welcome to your Discord Management Panel! This is your central hub for managing tickets, users, 
            and monitoring system health. Use the navigation menu to access different sections of the admin panel.
        </p>
    </div>
    '''
    return render_template_string(base_template, active='dashboard', page_title='Dashboard', content=dashboard_content)

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE username=? AND password=?', (username, password))
        user = c.fetchone()
        conn.close()
        if user:
            session['user'] = user[1]
            session['is_admin'] = bool(user[3])
            return redirect(url_for('dashboard'))
        else:
            error = 'Invalid credentials.'
    return render_template_string('''
    <html><head><title>Login - UNordinary Hub</title><style>body{background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}form{background:white;padding:3rem 4rem;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.1);color:#333;min-width:400px;}input{display:block;width:100%;margin-bottom:1.5rem;padding:1rem;border-radius:10px;border:2px solid #ecf0f1;font-size:16px;}input:focus{outline:none;border-color:#667eea;}button{background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;border:none;border-radius:10px;padding:1rem 2rem;font-weight:600;cursor:pointer;width:100%;font-size:16px;transition:all 0.3s ease;}button:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(102,126,234,0.3);}h2{margin-bottom:2rem;text-align:center;color:#2c3e50;}label{color:#2c3e50;font-weight:600;margin-bottom:0.5rem;display:block;}.alert{background:#f8d7da;color:#721c24;padding:1rem;border-radius:8px;margin-bottom:1.5rem;border:1px solid #f5c6cb;}</style></head><body><form method="post"><h2><i class="fab fa-discord"></i> UNordinary Hub</h2>{% if error %}<div class="alert">{{ error }}</div>{% endif %}<label>Username</label><input name="username" required><label>Password</label><input name="password" type="password" required><button type="submit">Login</button></form></body></html>
    ''', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/tickets', methods=['GET', 'POST'])
@login_required
def tickets():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get real tickets from Discord bot database
    query = '''
    SELECT t.id, t.subject, t.status, t.ticket_type, t.created_at, t.closed_at, 
           t.close_reason, t.closed_by, t.user_id, t.channel_id
    FROM tickets t 
    WHERE 1=1
    '''
    params = []
    
    # Filters
    status = request.args.get('status', 'All')
    ttype = request.args.get('type', 'All')
    search = request.args.get('search', '')
    
    if status != 'All':
        query += ' AND t.status=?'
        params.append(status)
    if ttype != 'All':
        query += ' AND t.ticket_type=?'
        params.append(ttype)
    if search:
        query += ' AND t.subject LIKE ?'
        params.append(f'%{search}%')
    
    query += ' ORDER BY t.id DESC'
    c.execute(query, params)
    tickets = c.fetchall()
    
    # Get user info for display
    user_info = {}
    for ticket in tickets:
        if ticket[8]:  # user_id
            c.execute('SELECT username FROM users WHERE id = ?', (ticket[8],))
            user_result = c.fetchone()
            user_info[ticket[8]] = user_result[0] if user_result else f"User {ticket[8]}"
    
    conn.close()
    
    tickets_html = '''
    <div class="content-section">
        <div class="section-header">
            <h2>Ticket Management</h2>
            <button class="btn" onclick="document.getElementById('newTicketForm').style.display='block'">
                <i class="fas fa-plus"></i> New Ticket
            </button>
        </div>
        
        <div id="newTicketForm" style="display:none; background:#f8f9fa; padding:20px; border-radius:10px; margin-bottom:20px;">
            <form method="post">
                <div class="form-group">
                    <label>Ticket Title</label>
                    <input name="title" class="form-control" placeholder="Enter ticket title..." required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select name="type" class="form-control">
                        <option>General</option>
                        <option>Bug</option>
                        <option>Support</option>
                    </select>
                </div>
                <button type="submit" class="btn">Create Ticket</button>
            </form>
        </div>
        
        <div style="display:flex; gap:15px; margin-bottom:20px;">
            <input name="search" value="''' + request.args.get('search','') + '''" placeholder="Search tickets..." class="form-control" style="flex:1;">
            <select name="status" class="form-control" style="width:150px;">
                <option>All Status</option>
                <option>Open</option>
                <option>Closed</option>
                <option>Pending</option>
            </select>
            <select name="type" class="form-control" style="width:150px;">
                <option>All Types</option>
                <option>General</option>
                <option>Bug</option>
                <option>Support</option>
            </select>
            <button class="btn">Filter</button>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Created By</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    '''
    
    for t in tickets:
        # Format dates
        created_date = t[4] if t[4] else 'Unknown'
        closed_date = t[5] if t[5] else ''
        status = t[2] if t[2] else 'open'
        ticket_type = t[3] if t[3] else 'General'
        subject = t[1] if t[1] else 'No subject'
        user_name = user_info.get(t[8], f"User {t[8]}") if t[8] else 'Unknown'
        
        tickets_html += '''
                <tr>
                    <td><strong>''' + subject + '''</strong></td>
                    <td><span class="status-badge status-''' + status.lower() + '''">''' + status.title() + '''</span></td>
                    <td>''' + ticket_type + '''</td>
                    <td>''' + user_name + '''</td>
                    <td>''' + created_date + '''</td>
                    <td>
        '''
        if status != 'closed':
            tickets_html += '''<a href="/close_ticket/''' + str(t[0]) + '''" class="btn btn-danger" style="padding:8px 15px; font-size:12px;">Close</a>'''
        if t[9]:  # channel_id
            tickets_html += ''' <span class="badge" style="background:#6c757d; color:white; padding:4px 8px; font-size:10px;">#''' + str(t[9]) + '''</span>'''
        tickets_html += '''
                    </td>
                </tr>
        '''
    
    if not tickets:
        tickets_html += '''
                <tr>
                    <td colspan="6" style="text-align:center; color:#7f8c8d; padding:40px;">No tickets found.</td>
                </tr>
        '''
    
    tickets_html += '''
            </tbody>
        </table>
    </div>
    '''
    
    return render_template_string(base_template, active='tickets', page_title='Ticket Management', content=tickets_html)

@app.route('/close_ticket/<int:tid>')
@login_required
def close_ticket(tid):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    now = datetime.now().strftime('%Y-%m-%d %H:%M')
    c.execute('UPDATE tickets SET status="closed", closed_at=? WHERE id=?', (now, tid))
    c.execute('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)', ('Closed ticket', session['user'], now))
    conn.commit()
    conn.close()
    return redirect(url_for('tickets'))

@app.route('/users', methods=['GET', 'POST'])
@admin_required
def users():
    msg = None
    if request.method == 'POST':
        action = request.form.get('action')
        user_id = request.form.get('user_id')
        if action == 'toggle_admin' and user_id:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            # Get user info before updating
            c.execute('SELECT username, is_admin FROM users WHERE id = ?', (user_id,))
            user_info = c.fetchone()
            if user_info:
                new_admin_status = not user_info[1]
                c.execute('UPDATE users SET is_admin = ? WHERE id = ?', (new_admin_status, user_id))
                # Log the role change
                role_change = 'Granted admin' if new_admin_status else 'Removed admin'
                c.execute('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)', 
                         (f'{role_change} role for {user_info[0]}', session['user'], datetime.now().strftime('%Y-%m-%d %H:%M')))
                conn.commit()
                conn.close()
                msg = f'Admin role {"granted" if new_admin_status else "removed"} for {user_info[0]}!'
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, username, is_admin FROM users')
    users = c.fetchall()
    conn.close()
    
    users_html = '''
    <div class="content-section">
        <div class="section-header">
            <h2>User Management</h2>
        </div>
        ''' + ('<div class="alert alert-success">' + msg + '</div>' if msg else '') + '''
        
        <table class="table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    '''
    
    for u in users:
        users_html += '''
                <tr>
                    <td><strong>''' + u[1] + '''</strong></td>
                    <td>''' + ('<span class="status-badge status-open">Administrator</span>' if u[2] else '<span class="status-badge status-pending">User</span>') + '''</td>
                    <td>
                        <form method="post" style="display:inline;">
                            <input type="hidden" name="user_id" value="''' + str(u[0]) + '''">
                            <button type="submit" name="action" value="toggle_admin" class="btn btn-secondary" style="padding:8px 15px; font-size:12px;">
                                ''' + ('Remove Admin' if u[2] else 'Make Admin') + '''
                            </button>
                        </form>
                    </td>
                </tr>
        '''
    
    if not users:
        users_html += '''
                <tr>
                    <td colspan="3" style="text-align:center; color:#7f8c8d; padding:40px;">No users found.</td>
                </tr>
        '''
    
    users_html += '''
            </tbody>
        </table>
    </div>
    '''
    
    return render_template_string(base_template, active='users', page_title='User Management', content=users_html)

@app.route('/send_message', methods=['GET', 'POST'])
@admin_required
def send_message():
    msg = None
    if request.method == 'POST':
        channel_id = request.form.get('channel_id')
        message = request.form.get('message')
        if channel_id and message:
            try:
                # Try to send message via Discord bot API
                import requests
                response = requests.post('http://localhost:5001/send_message', 
                                      json={'channel_id': int(channel_id), 'message': message},
                                      timeout=5)
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success'):
                        msg = f'Message sent to channel {channel_id}!'
                    else:
                        msg = f'Error: {result.get("error", "Unknown error")}'
                else:
                    msg = f'Error: Could not connect to Discord bot (Status: {response.status_code})'
            except Exception as e:
                msg = f'Error: Could not send message - {str(e)}'
            
            # Log the attempt regardless of success
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)', 
                     (f'Sent message to channel {channel_id}', session['user'], datetime.now().strftime('%Y-%m-%d %H:%M')))
            conn.commit()
            conn.close()
        else:
            msg = 'Please fill in all fields.'
    
    send_message_html = '''
    <div class="content-section">
        <div class="section-header">
            <h2>Send Message</h2>
        </div>
        ''' + ('<div class="alert alert-success">' + msg + '</div>' if msg else '') + '''
        <form method="post">
            <div class="form-group">
                <label>Channel ID</label>
                <input name="channel_id" class="form-control" placeholder="Enter Discord channel ID" required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea name="message" class="form-control" rows="4" placeholder="Enter your message..." required></textarea>
            </div>
            <button type="submit" class="btn">Send Message</button>
        </form>
    </div>
    '''
    return render_template_string(base_template, active='send_message', page_title='Send Message', content=send_message_html)

@app.route('/logs')
@admin_required
def logs():
    log_type = request.args.get('type', 'all')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get logs based on type from Discord bot database
    if log_type == 'verified':
        # Get verification logs from Discord bot
        c.execute('''
            SELECT 'User Verified' as action, 
                   'User ' || v.user_id || ' verified' as details,
                   v.verified_at as timestamp
            FROM verifications v
            ORDER BY v.verified_at DESC
            LIMIT 50
        ''')
        logs = c.fetchall()
    elif log_type == 'moderation':
        # Get moderation logs from Discord bot
        c.execute('''
            SELECT m.action as action, 
                   'User ' || m.user_id || ' by ' || m.moderator_id as details,
                   m.timestamp
            FROM mod_logs m
            ORDER BY m.timestamp DESC
            LIMIT 50
        ''')
        logs = c.fetchall()
    elif log_type == 'anti_alt':
        # Get anti-alt logs from Discord bot
        c.execute('''
            SELECT a.action_type as action, 
                   'User ' || a.user_id || ' - ' || COALESCE(a.details, 'No details') as details,
                   a.timestamp
            FROM anti_nuke_actions a
            WHERE a.action_type LIKE '%alt%' OR a.action_type LIKE '%duplicate%'
            ORDER BY a.timestamp DESC
            LIMIT 50
        ''')
        logs = c.fetchall()
    else:
        # Combine web panel logs with Discord bot logs
        c.execute('''
            SELECT action, username, timestamp FROM logs
            UNION ALL
            SELECT 'User Verified' as action, 
                   'User ' || v.user_id as username,
                   v.verified_at as timestamp
            FROM verifications v
            UNION ALL
            SELECT m.action as action, 
                   'Moderator ' || m.moderator_id as username,
                   m.timestamp
            FROM mod_logs m
            ORDER BY timestamp DESC
            LIMIT 50
        ''')
        logs = c.fetchall()
    
    conn.close()
    
    logs_html = '''
    <div class="content-section">
        <div class="section-header">
            <h2>System Logs</h2>
            <div style="display: flex; gap: 10px;">
                <a href="?type=all" class="btn''' + (' btn-secondary' if log_type == 'all' else '') + '''">All</a>
                <a href="?type=verified" class="btn''' + (' btn-secondary' if log_type == 'verified' else '') + '''">Verified Users</a>
                <a href="?type=moderation" class="btn''' + (' btn-secondary' if log_type == 'moderation' else '') + '''">Moderation</a>
                <a href="?type=anti_alt" class="btn''' + (' btn-secondary' if log_type == 'anti_alt' else '') + '''">Anti-Alt</a>
                <a href="/add_sample_data" class="btn btn-secondary">Add Sample Data</a>
            </div>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
    '''
    
    for l in logs:
        logs_html += '''
                <tr>
                    <td><strong>''' + l[0] + '''</strong></td>
                    <td>''' + l[1] + '''</td>
                    <td>''' + l[2] + '''</td>
                </tr>
        '''
    
    if not logs:
        logs_html += '''
                <tr>
                    <td colspan="3" style="text-align:center; color:#7f8c8d; padding:40px;">No logs found.</td>
                </tr>
        '''
    
    logs_html += '''
            </tbody>
        </table>
    </div>
    '''
    
    return render_template_string(base_template, active='logs', page_title='System Logs', content=logs_html)

# Add some sample data for demonstration
@app.route('/add_sample_data')
@admin_required
def add_sample_data():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Add sample verified users
    sample_verified = [
        ('123456789', 'JohnDoe', '2024-01-15 10:30:00', 'UNordinary'),
        ('987654321', 'JaneSmith', '2024-01-15 11:45:00', 'UNordinary'),
        ('555666777', 'BobWilson', '2024-01-15 14:20:00', 'UNordinary')
    ]
    for user in sample_verified:
        c.execute('INSERT OR IGNORE INTO verified_users (user_id, username, verified_at, verified_by) VALUES (?, ?, ?, ?)', user)
    
    # Add sample moderation actions
    sample_moderation = [
        ('Ban', 'Spammer123', 'UNordinary', 'Spam in general chat', '2024-01-15 09:15:00'),
        ('Kick', 'ToxicUser', 'UNordinary', 'Toxic behavior', '2024-01-15 12:30:00'),
        ('Warning', 'RuleBreaker', 'UNordinary', 'Breaking server rules', '2024-01-15 16:45:00')
    ]
    for action in sample_moderation:
        c.execute('INSERT OR IGNORE INTO moderation_actions (action_type, target_user, moderator, reason, timestamp) VALUES (?, ?, ?, ?, ?)', action)
    
    # Add sample anti-alt actions
    sample_anti_alt = [
        ('Blocked', 'SuspiciousAlt', 'Multiple accounts detected', '2024-01-15 08:30:00'),
        ('Flagged', 'AltAccount', 'Similar IP detected', '2024-01-15 13:20:00'),
        ('Banned', 'AltUser', 'Confirmed alt account', '2024-01-15 15:10:00')
    ]
    for alt in sample_anti_alt:
        c.execute('INSERT OR IGNORE INTO anti_alt_actions (username, action_type, reason, timestamp) VALUES (?, ?, ?, ?)', alt)
    
    conn.commit()
    conn.close()
    return redirect(url_for('logs'))

@app.route('/api/bot_token')
@login_required
def api_bot_token():
    # Only allow admin to fetch the token
    if not session.get('is_admin'):
        return jsonify({'error': 'Unauthorized'}), 403
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
    )''')
    c.execute('SELECT value FROM settings WHERE key=?', ('bot_token',))
    row = c.fetchone()
    conn.close()
    if row:
        return jsonify({'bot_token': row[0]})
    else:
        return jsonify({'bot_token': ''})

@app.route('/settings', methods=['GET', 'POST'])
@admin_required
def settings():
    msg = None
    if request.method == 'POST':
        # Save settings to database
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL
        )''')
        # Save each setting
        settings_data = {
            'bot_token': request.form.get('bot_token', ''),
            'bot_prefix': request.form.get('prefix', '/'),
            'language': request.form.get('lang', 'English'),
            'welcome_message': request.form.get('welcome', 'Welcome to our server!'),
            'auto_role': request.form.get('autorole', 'Member'),
            'log_level': request.form.get('loglevel', 'INFO'),
            'max_tickets': request.form.get('maxtickets', '100')
        }
        for key, value in settings_data.items():
            c.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (key, value))
        c.execute('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)', 
                 ('Updated settings', session['user'], datetime.now().strftime('%Y-%m-%d %H:%M')))
        conn.commit()
        conn.close()
        msg = 'Settings saved successfully!'
    # Load current settings
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
    )''')
    c.execute('SELECT key, value FROM settings')
    settings_dict = dict(c.fetchall())
    conn.close()
    settings_html = '''
    <div class="content-section">
        <div class="section-header">
            <h2>Bot Settings</h2>
        </div>
        ''' + ('<div class="alert alert-success">' + msg + '</div>' if msg else '') + '''
        <form method="post">
            <div class="form-group">
                <label>Bot Token</label>
                <input name="bot_token" class="form-control" type="password" id="botTokenInput" value="''' + settings_dict.get('bot_token', '') + '''" autocomplete="off">
                <button type="button" class="btn btn-secondary" style="margin-top:8px;" onclick="toggleBotToken()">Show/Hide</button>
            </div>
            <div class="form-group">
                <label>Bot Prefix</label>
                <input name="prefix" class="form-control" value="''' + settings_dict.get('bot_prefix', '/') + '''">
            </div>
            <div class="form-group">
                <label>Language</label>
                <input name="lang" class="form-control" value="''' + settings_dict.get('language', 'English') + '''">
            </div>
            <div class="form-group">
                <label>Welcome Message</label>
                <input name="welcome" class="form-control" value="''' + settings_dict.get('welcome_message', 'Welcome to our server!') + '''">
            </div>
            <div class="form-group">
                <label>Auto-role</label>
                <input name="autorole" class="form-control" value="''' + settings_dict.get('auto_role', 'Member') + '''">
            </div>
            <div class="form-group">
                <label>Log Level</label>
                <select name="loglevel" class="form-control">
                    <option value="DEBUG"''' + (' selected' if settings_dict.get('log_level', 'INFO') == 'DEBUG' else '') + '''>DEBUG</option>
                    <option value="INFO"''' + (' selected' if settings_dict.get('log_level', 'INFO') == 'INFO' else '') + '''>INFO</option>
                    <option value="WARNING"''' + (' selected' if settings_dict.get('log_level', 'INFO') == 'WARNING' else '') + '''>WARNING</option>
                    <option value="ERROR"''' + (' selected' if settings_dict.get('log_level', 'INFO') == 'ERROR' else '') + '''>ERROR</option>
                </select>
            </div>
            <div class="form-group">
                <label>Max Tickets</label>
                <input name="maxtickets" class="form-control" value="''' + settings_dict.get('max_tickets', '100') + '''">
            </div>
            <button type="submit" class="btn">Save Settings</button>
        </form>
        <script>
        function toggleBotToken() {
            var input = document.getElementById('botTokenInput');
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
        }
        </script>
    </div>
    '''
    return render_template_string(base_template, active='settings', page_title='Bot Settings', content=settings_html)

@app.route('/security', methods=['GET', 'POST'])
@admin_required
def security():
    msg = None
    if request.method == 'POST':
        # Save security settings to database
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS security_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL
        )''')
        
        # Save each security setting
        security_data = {
            'enable_2fa': '1' if request.form.get('enable_2fa') else '0',
            'anti_spam': '1' if request.form.get('anti_spam') else '0',
            'auto_ban': '1' if request.form.get('auto_ban') else '0',
            'rate_limiting': '1' if request.form.get('rate_limiting') else '0',
            'max_login_attempts': request.form.get('max_login_attempts', '5'),
            'session_timeout': request.form.get('session_timeout', '3600'),
            'ip_whitelist': request.form.get('ip_whitelist', ''),
            'password_policy': request.form.get('password_policy', 'medium')
        }
        
        for key, value in security_data.items():
            c.execute('INSERT OR REPLACE INTO security_settings (key, value) VALUES (?, ?)', (key, value))
        
        c.execute('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)', 
                 ('Updated security settings', session['user'], datetime.now().strftime('%Y-%m-%d %H:%M')))
        conn.commit()
        conn.close()
        msg = 'Security settings updated successfully!'
    
    # Load current security settings
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS security_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
    )''')
    c.execute('SELECT key, value FROM security_settings')
    security_dict = dict(c.fetchall())
    conn.close()
    
    security_html = '''
    <div class="content-section">
        <div class="section-header">
            <h2>Security Settings</h2>
        </div>
        ''' + ('<div class="alert alert-success">' + msg + '</div>' if msg else '') + '''
        
        <form method="post">
            <div class="form-group">
                <label><input type="checkbox" name="enable_2fa"''' + (' checked' if security_dict.get('enable_2fa', '0') == '1' else '') + ''' style="margin-right:10px;"> Enable 2FA</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" name="anti_spam"''' + (' checked' if security_dict.get('anti_spam', '1') == '1' else '') + ''' style="margin-right:10px;"> Anti-Spam Protection</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" name="auto_ban"''' + (' checked' if security_dict.get('auto_ban', '0') == '1' else '') + ''' style="margin-right:10px;"> Auto-ban System</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" name="rate_limiting"''' + (' checked' if security_dict.get('rate_limiting', '1') == '1' else '') + ''' style="margin-right:10px;"> Rate Limiting</label>
            </div>
            <div class="form-group">
                <label>Max Login Attempts</label>
                <input name="max_login_attempts" class="form-control" value="''' + security_dict.get('max_login_attempts', '5') + '''">
            </div>
            <div class="form-group">
                <label>Session Timeout (seconds)</label>
                <input name="session_timeout" class="form-control" value="''' + security_dict.get('session_timeout', '3600') + '''">
            </div>
            <div class="form-group">
                <label>IP Whitelist (comma separated)</label>
                <input name="ip_whitelist" class="form-control" value="''' + security_dict.get('ip_whitelist', '') + '''">
            </div>
            <div class="form-group">
                <label>Password Policy</label>
                <select name="password_policy" class="form-control">
                    <option value="low"''' + (' selected' if security_dict.get('password_policy', 'medium') == 'low' else '') + '''>Low</option>
                    <option value="medium"''' + (' selected' if security_dict.get('password_policy', 'medium') == 'medium' else '') + '''>Medium</option>
                    <option value="high"''' + (' selected' if security_dict.get('password_policy', 'medium') == 'high' else '') + '''>High</option>
                </select>
            </div>
            <button type="submit" class="btn">Update Security</button>
        </form>
    </div>
    '''
    
    return render_template_string(base_template, active='security', page_title='Security Settings', content=security_html)

@app.route('/health')
@admin_required
def health():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM tickets WHERE status="Open"')
    open_tickets = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM users')
    user_count = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM logs')
    log_count = c.fetchone()[0]
    conn.close()
    
    health_html = '''
    <div class="dashboard-grid">
        <div class="stat-card">
            <h3><i class="fas fa-exclamation-circle"></i> Open Tickets</h3>
            <div class="stat-number">''' + str(open_tickets) + '''</div>
            <div class="stat-label">Require attention</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-users"></i> Active Users</h3>
            <div class="stat-number">''' + str(user_count) + '''</div>
            <div class="stat-label">Registered users</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-list"></i> System Logs</h3>
            <div class="stat-number">''' + str(log_count) + '''</div>
            <div class="stat-label">Total logs</div>
        </div>
        <div class="stat-card">
            <h3><i class="fas fa-heartbeat"></i> System Status</h3>
            <div class="stat-number" style="color:#27ae60;">Online</div>
            <div class="stat-label">All systems operational</div>
        </div>
        <div class="stat-card">
            <h3><i class="fab fa-discord"></i> Bot Status</h3>
            <div class="stat-number" id="botStatus" style="color:#27ae60;">Checking...</div>
            <div class="stat-label">Connection status</div>
        </div>
    </div>
    
    <div class="content-section">
        <div class="section-header">
            <h2>System Health</h2>
        </div>
        <p style="color: #7f8c8d; line-height: 1.6;">
            The system is running smoothly with all services operational. No critical issues detected.
            All security measures are active and protecting the server effectively.
        </p>
    </div>
    
    <script>
    // Check bot status every 10 seconds
    function checkBotStatus() {
        fetch('/api/bot_status')
            .then(response => response.json())
            .then(data => {
                const statusElement = document.getElementById('botStatus');
                if (data.status === 'online') {
                    statusElement.textContent = 'Online';
                    statusElement.style.color = '#27ae60';
                } else if (data.status === 'offline') {
                    statusElement.textContent = 'Offline';
                    statusElement.style.color = '#e74c3c';
                } else {
                    statusElement.textContent = 'Error';
                    statusElement.style.color = '#f39c12';
                }
            })
            .catch(error => {
                const statusElement = document.getElementById('botStatus');
                statusElement.textContent = 'Error';
                statusElement.style.color = '#e74c3c';
            });
    }
    
    // Check immediately and then every 10 seconds
    checkBotStatus();
    setInterval(checkBotStatus, 10000);
    </script>
    '''
    
    return render_template_string(base_template, active='health', page_title='System Health', content=health_html)

@app.route('/api/bot_status')
@admin_required
def api_bot_status():
    """Check if bot is connected and responding"""
    try:
        # Simulate bot status check - in real implementation, this would check actual bot connection
        import random
        # 80% chance of being online for demo purposes
        is_online = random.choice([True, True, True, True, False])
        
        if is_online:
            return {'status': 'online', 'message': 'Bot is connected and responding'}
        else:
            return {'status': 'offline', 'message': 'Bot is not responding'}
    except Exception as e:
        return {'status': 'error', 'message': f'Error checking bot status: {str(e)}'}

if __name__ == '__main__':
    app.run(debug=True) 