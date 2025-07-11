# UNordinary Hub - Discord Bot Management System

A complete web application that combines the UNordinary Hub gaming website with a Discord bot management panel.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   python app.py
   ```

3. **Access the application:**
   - Main website: `http://localhost:5000`
   - Admin panel: `http://localhost:5000/admin`
   - Login credentials: `UNordinary` / `Sosama01881`

## 🌐 Deployment

### Render.com (Recommended)
1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Add persistent disk for database

### Other Platforms
- **Railway**: Connect GitHub repo, set build/start commands
- **Heroku**: Add Procfile with `web: python app.py`
- **Vercel**: Use Vercel CLI

## 📁 Project Structure

```
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── bot_data.db          # SQLite database
├── templates/           # HTML templates
│   ├── index.html      # Main website
│   ├── privacy.html    # Privacy page
│   └── admin/         # Admin panel templates
└── static/            # Static files
```

## 🔧 Features

### Main Website
- Gaming scripts and tools
- Modern, responsive design
- Privacy policy page

### Admin Panel
- **Dashboard**: Statistics and overview
- **Tickets**: Create and manage support tickets
- **Users**: User management
- **Logs**: System activity logs
- **Settings**: Bot configuration
- **Security**: Security settings
- **Health**: System monitoring

## 🔐 Security

- Admin authentication required
- Session-based security
- SQLite database with proper structure
- CSRF protection (Flask built-in)

## 📊 Database

Uses SQLite with tables for:
- Users (admin accounts)
- Tickets (support system)
- Logs (activity tracking)

## 🎨 Design

- Modern dark theme
- Responsive design
- Discord-inspired UI
- Font Awesome icons

## 🚀 Custom Domain

To use with your domain (e.g., https://www.unordinariness.xyz/):

1. Deploy to your chosen platform
2. Add custom domain in platform settings
3. Update DNS records
4. SSL certificate will be auto-configured

## 📝 License

This project is for the UNordinary Hub Discord bot management system.

---

**Built with Flask, SQLite, and modern web technologies** 