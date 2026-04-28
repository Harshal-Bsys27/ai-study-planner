# Production Deployment Guide - Cloud Database & Hosting Options

## ✅ Admin Credentials (FIXED)
**Username:** `admin`  
**Password:** `admin123`  

Try logging in now — should work! ✅

---

## 🚀 Recommended Cloud Databases for Production

### 1. **PostgreSQL (Recommended for Production)**

#### **A) Render (Easiest)**
- **Cost:** Free tier available (limited), paid ~$7/month
- **Features:** Managed PostgreSQL, automatic backups, easy deploy
- **Setup Time:** 5 minutes
- **Best For:** Small to medium projects
```bash
# Connection string format:
postgresql://user:password@host:port/dbname
```
- **Pros:** One-click Render deployment, handles DB + hosting
- **Cons:** Limited free tier

**Sign up:** https://render.com

#### **B) Railway**
- **Cost:** ~$5-15/month for full stack (DB + API)
- **Features:** Simple CLI, GitHub integration, good pricing
- **Setup Time:** 10 minutes
- **Best For:** Startups, fast deployment
- **Pros:** Clean UI, affordable, pay-per-use
- **Cons:** Still relatively new platform

**Sign up:** https://railway.app

#### **C) Neon (Free PostgreSQL)**
- **Cost:** Free tier (good limits), paid ~$15/month
- **Features:** Serverless PostgreSQL, instant databases
- **Setup Time:** 3 minutes
- **Best For:** Development & small production
- **Pros:** Extremely fast setup, good free tier, instant provisioning
- **Cons:** Serverless can have cold starts

**Sign up:** https://neon.tech

#### **D) AWS RDS PostgreSQL**
- **Cost:** ~$12-50/month (or more)
- **Features:** Industry standard, highly configurable
- **Setup Time:** 30 minutes
- **Best For:** Large-scale projects, enterprises
- **Pros:** Maximum control, scalability, security
- **Cons:** Complex setup, steeper learning curve

**Sign up:** https://aws.amazon.com/rds/

---

### 2. **MySQL / MariaDB**

#### **PlanetScale (MySQL - Fastest Setup)**
- **Cost:** Free tier available, paid ~$39/month
- **Features:** MySQL-compatible, serverless, instant scaling
- **Setup Time:** 5 minutes
- **Best For:** MySQL/Laravel developers
- **Pros:** Excellent free tier, MySQL familiar to most, instant
- **Cons:** Less flexible than PostgreSQL

**Sign up:** https://planetscale.com

#### **Supabase (PostgreSQL + extras)**
- **Cost:** Free tier with good limits, paid ~$25/month
- **Features:** PostgreSQL + Auth + Real-time + File storage
- **Setup Time:** 5 minutes
- **Best For:** Full-stack projects needing auth & storage
- **Pros:** Firebase alternative, complete backend-as-a-service
- **Cons:** Overkill if you just need DB

**Sign up:** https://supabase.com

---

## 💾 Comparison Table

| Option | Cost | Setup Time | Scalability | Best For |
|--------|------|-----------|-------------|----------|
| Neon (PostgreSQL) | Free/$15/mo | 3 min | ⭐⭐⭐ | Small-medium, fast start |
| PlanetScale (MySQL) | Free/$39/mo | 5 min | ⭐⭐⭐⭐ | MySQL preference, high scale |
| Render (PostgreSQL) | Free/$7/mo | 5 min | ⭐⭐⭐ | Full-stack hosting + DB |
| Railway | ~$5/mo | 10 min | ⭐⭐⭐ | Fast prototypes, cheap |
| Supabase (PostgreSQL) | Free/$25/mo | 5 min | ⭐⭐⭐ | Full backend + auth |
| AWS RDS | ~$15/mo | 30 min | ⭐⭐⭐⭐⭐ | Enterprise, maximum control |

---

## 🎯 My Recommendation: **Neon + Render**

### Why this stack?
1. **Neon for Database:** Free PostgreSQL, instant setup, good free tier
2. **Render for Hosting:** Flask API + frontend on one platform, automatic deploys from GitHub

### Setup Steps:

#### Step 1: Create Neon PostgreSQL Database
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Get connection string: `postgresql://user:password@host/dbname`

#### Step 2: Update `.env` for Production
```env
# .env production
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this
SQLALCHEMY_DATABASE_URI=postgresql://user:password@neon-host/dbname

# Admin Config
ADMIN_USERNAMES=admin
ADMIN_EMAILS=admin@example.com
ADMIN_PASSWORD=your-strong-password-here
```

#### Step 3: Create `requirements.txt` with production dependencies
```bash
cd backend
pip freeze > requirements.txt
# Add this line if not present:
# psycopg2-binary==2.9.9  (for PostgreSQL)
```

#### Step 4: Deploy on Render
1. Go to https://render.com
2. Connect GitHub account
3. Create new "Web Service"
4. Select your repo
5. Set up:
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `gunicorn -w 4 backend.app:create_app()`
   - Add environment variables from `.env`
6. Deploy!

---

## 🔧 Changes Needed for Production

### 1. Update `backend/config.py`
```python
import os
from datetime import timedelta

class Config:
    """Base config"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION_DELTA = timedelta(days=7)

class DevelopmentConfig(Config):
    """Development config"""
    SQLALCHEMY_DATABASE_URI = 'sqlite:///study_planner.db'
    DEBUG = True

class ProductionConfig(Config):
    """Production config"""
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    DEBUG = False
    TESTING = False
    # Add security headers
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

def get_config(env='development'):
    if env == 'production':
        return ProductionConfig()
    return DevelopmentConfig()
```

### 2. Add `gunicorn` to `requirements.txt`
```txt
Flask==3.1.2
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
psycopg2-binary==2.9.9
gunicorn==21.2.0
python-dotenv==1.0.0
PyJWT==2.8.1
```

### 3. Update `frontend/.env` for production
```env
VITE_API_URL=https://your-api-domain.onrender.com
```

### 4. Frontend deployment on Render
- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Environment: Node

---

## 🔐 Security Checklist

- [ ] Change `SECRET_KEY` to strong random string
- [ ] Use environment variables for sensitive data (never commit `.env`)
- [ ] Enable HTTPS (Render/Railway do this automatically)
- [ ] Use strong admin password (not "admin123" in production!)
- [ ] Set `FLASK_ENV=production`
- [ ] Enable CORS only for your frontend domain
- [ ] Use PostgreSQL with strong password
- [ ] Enable database backups
- [ ] Monitor logs and errors
- [ ] Set up SSL certificates (auto with Render/Railway)

---

## 📊 Free Tier Limits (for reference)

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **Neon** | Generous | 10 GB storage, decent compute |
| **PlanetScale** | Good | 5 GB storage, limited queries |
| **Render** | Limited | ~750 compute hours/month |
| **Railway** | Trial | $5 credit/month |
| **Supabase** | Very Good | 500 MB, Auth included |

---

## 🚀 Quick Deployment Command (After Setup)

```bash
# Push to GitHub (Render will auto-deploy)
git add .
git commit -m "Production ready"
git push origin main

# On Render dashboard: deployment will start automatically
# On Neon: database is already live
```

---

## ✨ Recommended Deployment Workflow

1. **Development:** Local SQLite + `npm run dev`
2. **Testing:** Create free Neon DB + test locally with it
3. **Production:** Deploy via Render with Neon PostgreSQL
4. **Monitoring:** Set up error logging (Sentry is free for startups)

This gives you a **fully production-ready, scalable, free-tier-friendly setup**! 🎉
