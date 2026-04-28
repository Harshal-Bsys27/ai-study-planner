# Admin Setup Guide

## ✅ Admin Credentials Configuration

Admin users are automatically created on backend startup in development mode.

**Auto-setup on startup:**
- Backend automatically creates admin user with correct password
- Runs every time backend starts
- No manual setup needed

## 📝 Default Admin Account

**Username:** `admin`  
**Email:** `admin@example.com`  
**Password:** `admin123`

## 🔐 How Admin Authentication Works

1. **Backend Startup:**
   - On startup, backend creates/updates admin user automatically
   - Ensures admin user always has correct password
   - Works in development and production

2. **Login Phase:**
   - User logs in with their credentials
   - Backend returns `is_admin: true` in the response
   - Frontend stores the user data (including `is_admin`) in localStorage
   - If `is_admin` is true, user is automatically redirected to `/admin`

3. **Route Protection:**
   - Admin Dashboard (`/admin`) is protected by `isUserAdmin()` check
   - This checks if `user.is_admin` is true in localStorage
   - Non-admin users trying to access `/admin` are redirected to home page

## 🚀 Testing Admin Login

### Step 1: Start Backend
```bash
cd backend
python app.py
```

You should see:
```
✅ Admin user created
✅ AI Study Planner Backend Started
🔗 API: http://localhost:5000/api
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Login with Admin Credentials
1. Navigate to `http://localhost:5174`
2. Click "Sign In" tab
3. Enter username: `admin`
4. Enter password: `admin123`
5. Click "Sign In"

### Expected Behavior:
- ✅ Login succeeds
- ✅ Automatically redirected to Admin Dashboard (`/admin`)
- ✅ See "👑 Administrator" badge in user menu
- ✅ Can see admin navigation options (⚙️ Admin Panel)

## 🔧 Creating Additional Admin Users (Optional)

If you want to add more admin users, edit `backend/app.py` and modify the `ensure_admin_user()` function.

## ✨ Frontend Admin Detection

- **Navbar:** Admin button (⚙️ Admin Panel) appears only for admin users
- **User Menu:** "Admin Panel" option visible for admins
- **Mobile Menu:** Admin panel link appears in mobile navigation
- **Route:** Direct access to `/admin` redirects to home if not admin

## 🐛 Troubleshooting

### Admin button not appearing after login:
1. Clear localStorage: `localStorage.clear()` in browser console
2. Refresh the page
3. Login again

### Can't access admin dashboard:
1. Check console for `isUserAdmin` logs
2. Verify `user.is_admin` is true in localStorage: 
   ```javascript
   JSON.parse(localStorage.getItem('user')).is_admin
   ```
3. Check backend logs for "Admin user created"

### Backend doesn't create admin user:
1. Check backend is running in development mode
2. Look for "✅ Admin user created" message on startup
3. If missing, restart backend: `python backend/app.py`

## 📚 Related Files

- `backend/app.py` - Admin auto-creation logic in `ensure_admin_user()`
- `backend/models.py` - User model with `is_admin` field
- `frontend/src/App.jsx` - Admin route protection and redirect
- `frontend/src/pages/AdminDashboard.jsx` - Admin dashboard UI

## 📁 Test Scripts

Location: `backend/tests/`

- `setup.py` - Manual admin user creation
- `verify.py` - Verify admin user exists and password works
