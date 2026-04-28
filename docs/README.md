# Documentation Index

All documentation files are organized here in the `docs/` folder to keep the project root clean.

## 📚 Guide Files

### Admin Setup & Authentication

- **[ADMIN_SETUP.md](ADMIN_SETUP.md)** - Admin setup guide and quick start
  - Default admin credentials
  - How admin authentication works
  - Testing admin login
  - Troubleshooting

- **[ADMIN_LOGIN_TEST_GUIDE.md](ADMIN_LOGIN_TEST_GUIDE.md)** - Complete testing guide
  - Step-by-step verification procedures
  - Browser testing with console checks
  - Debugging checklist
  - Common issues and solutions

- **[ADMIN_SETUP_COMPLETE.md](ADMIN_SETUP_COMPLETE.md)** - Implementation details
  - What was implemented
  - Configuration status
  - Auto-setup on startup
  - Emergency reset procedures

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login**:
   - Navigate to: `http://localhost:5174`
   - Username: `admin`
   - Password: `admin123`

4. **Access Admin Dashboard**:
   - Automatically redirected to `/admin`
   - See admin panel with metrics and user management

## 📁 Backend Test Scripts

Location: `backend/tests/`

- `setup.py` - Manual admin user creation
- `verify.py` - Verify admin user exists and password works
- `README.md` - Test script documentation

## 📖 Other Documentation

See root directory for:
- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `PROJECT_SUMMARY.md` - Feature summary
- `GETTING_STARTED.md` - Getting started guide

## 🔑 Key Credentials

**Admin User:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`

Auto-created on every backend startup!
