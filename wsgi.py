from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash, send_from_directory
from functools import wraps
import sqlite3
import os
from datetime import datetime
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'supersecretkey123')

# Security headers and HTTPS redirect
Talisman(app, 
         force_https=False,  # Set to True in production
         content_security_policy={
             'default-src': "'self'",
             'script-src': "'self' 'unsafe-inline'",
             'style-src': "'self' 'unsafe-inline'",
             'img-src': "'self' data: https:",
             'font-src': "'self'",
         })

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Database setup
DB_PATH = 'bot_data.db'

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
    
    c.execute('''CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        type TEXT DEFAULT 'General',
        created_at TEXT NOT NULL,
        user TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )''')
    
    # Create default admin user if not exists
    c.execute('SELECT * FROM users WHERE username = ?', ('UNordinary',))
    if not c.fetchone():
        c.execute('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', 
                 ('UNordinary', 'Sosama01881', 1))
    
    conn.commit()
    conn.close()

init_db()

# Auth decorators
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session or not session.get('is_admin'):
            return redirect(url_for('admin_dashboard'))
        return f(*args, **kwargs)
    return decorated

# Main website routes
@app.route('/')
@limiter.limit("30 per minute")
def home():
    return render_template('index.html')

@app.route('/features')
@limiter.limit("30 per minute")
def features():
    return render_template('features.html')

@app.route('/games')
@limiter.limit("30 per minute")
def games():
    return render_template('games.html')

@app.route('/privacy')
@limiter.limit("30 per minute")
def privacy():
    return render_template('privacy.html')

@app.route('/loader')
@limiter.limit("10 per minute")
def loader():
    return send_from_directory('.', 'loader')

# Admin panel routes
@app.route('/admin')
@login_required
@limiter.limit("60 per hour")
def admin_dashboard():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get stats
    c.execute('SELECT COUNT(*) FROM tickets')
    total_tickets = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM tickets WHERE status = "Open"')
    open_tickets = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM users')
    total_users = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM logs')
    total_logs = c.fetchone()[0]
    
    conn.close()
    
    return render_template('admin/dashboard.html', 
                         total_tickets=total_tickets,
                         open_tickets=open_tickets,
                         total_users=total_users,
                         total_logs=total_logs)

@app.route('/admin/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
        user = c.fetchone()
        conn.close()
        
        if user:
            session['user'] = username
            session['is_admin'] = user[3]
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials')
    
    return render_template('admin/login.html')

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('admin_login'))

@app.route('/admin/tickets')
@login_required
@limiter.limit("60 per hour")
def admin_tickets():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM tickets ORDER BY created_at DESC')
    tickets = c.fetchall()
    conn.close()
    
    return render_template('admin/tickets.html', tickets=tickets)

@app.route('/admin/users')
@admin_required
@limiter.limit("60 per hour")
def admin_users():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM users')
    users = c.fetchall()
    conn.close()
    
    return render_template('admin/users.html', users=users)

@app.route('/admin/logs')
@admin_required
@limiter.limit("60 per hour")
def admin_logs():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100')
    logs = c.fetchall()
    conn.close()
    
    return render_template('admin/logs.html', logs=logs)

@app.route('/admin/settings')
@admin_required
@limiter.limit("60 per hour")
def admin_settings():
    return render_template('admin/settings.html')

@app.route('/admin/security')
@admin_required
@limiter.limit("60 per hour")
def admin_security():
    return render_template('admin/security.html')

@app.route('/admin/health')
@admin_required
@limiter.limit("60 per hour")
def admin_health():
    return render_template('admin/health.html')

# API routes
@app.route('/api/bot_status')
@login_required
@limiter.limit("30 per minute")
def api_bot_status():
    # Check if bot is running (you can implement this based on your bot setup)
    return jsonify({'status': 'online', 'uptime': '24h 30m'})

@app.route('/api/add_ticket', methods=['POST'])
@login_required
@limiter.limit("10 per minute")
def api_add_ticket():
    title = request.form.get('title')
    ticket_type = request.form.get('type', 'General')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO tickets (title, status, type, created_at, updated_at, user) 
                 VALUES (?, ?, ?, ?, ?, ?)''', 
              (title, 'Open', ticket_type, datetime.now().strftime('%Y-%m-%d %H:%M'), 
               datetime.now().strftime('%Y-%m-%d %H:%M'), session['user']))
    
    # Log the action
    c.execute('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)',
              (f'Created ticket: {title}', session['user'], datetime.now().strftime('%Y-%m-%d %H:%M')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/close_ticket/<int:ticket_id>')
@login_required
@limiter.limit("30 per minute")
def api_close_ticket(ticket_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?',
              ('Closed', datetime.now().strftime('%Y-%m-%d %H:%M'), ticket_id))
    
    # Log the action
    c.execute('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)',
              (f'Closed ticket #{ticket_id}', session['user'], datetime.now().strftime('%Y-%m-%d %H:%M')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

# Error handlers
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Rate limit exceeded'}), 429

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 27451))
    app.run(host="0.0.0.0", port=port) 