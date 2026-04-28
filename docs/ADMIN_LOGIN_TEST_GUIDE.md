# Admin Dashboard Login & Testing Guide

## ✅ Status: Complete Admin Setup

All credentials have been reset and verified:
- **Admin User**: Created fresh in clean database
- **Username**: `admin`
- **Password**: `admin123`
- **Status**: ✅ Verified working

## 🧪 Complete Test Procedure

### Step 1: Verify Database State
```bash
cd backend
python backend/tests/verify.py
```

Expected output:
```
Database URI: sqlite:///study_planner.db
✅ DB file exists
Users in database: 1
✅ Admin user found!
✅ Password 'admin123' works!
```

### Step 2: Start Backend Server
```bash
cd backend
python app.py
```

Expected output:
```
✅ Admin user created
✅ AI Study Planner Backend Started
🔗 API: http://localhost:5000/api
```

### Step 3: Start Frontend Server
```bash
cd frontend
npm run dev
```

Expected output:
```
Local:   http://localhost:5174/
```

### Step 4: Browser Testing (Frontend Login Flow)

1. **Open Browser**: Navigate to `http://localhost:5174`
2. **See Login Page**: Should see Auth component with login tab
3. **Enter Credentials**:
   - Username: `admin`
   - Password: `admin123`
4. **Click Login**: Button should submit form
5. **Check Console** (F12 → Console Tab):
   ```
   ✅ You should see: "🔐 Login Success - userData:"
   ✅ You should see: "isAdmin set to: true"
   ✅ You should see: "🚀 Redirecting to /admin"
   ✅ You should see: "💾 Saved to localStorage: {...}"
   ```
6. **Check Storage Tab** (F12 → Application → Storage):
   - Look for `user` key in localStorage
   - Click to expand and verify:
     ```json
     {
       "id": 1,
       "username": "admin",
       "email": "admin@example.com",
       "is_admin": true,
       "is_active": true
     }
     ```
7. **Page Should Redirect**: Automatically navigate to `/admin`
8. **Admin Dashboard Should Load**: See dashboard with metrics, user management, logs

### Step 5: Verify Admin Dashboard Components

Once on `/admin` page, you should see:

- **📊 Metrics Section**:
  - Total Users
  - Active Admins
  - Study Plans
  - Total Topics

- **👥 User Management**:
  - List of all users
  - User ID, Name, Email, Status
  - Admin badge indicators
  - Manage buttons

- **📜 Activity Logs**:
  - Recent activity from all users
  - Timestamps and action descriptions

## 🔍 Debugging - If Admin Dashboard Doesn't Load

### Check 1: Verify Login Response
In browser console (F12):
```javascript
// Get the token from localStorage
localStorage.getItem('token')

// Get the user object
JSON.parse(localStorage.getItem('user'))

// Should show:
// {id: 1, username: "admin", email: "admin@example.com", is_admin: true, is_active: true}
```

### Check 2: Verify isUserAdmin() Function
In browser console:
```javascript
// This should match the App.jsx logic
const user = localStorage.getItem('user');
const userData = JSON.parse(user);
console.log('is_admin value:', userData.is_admin);
console.log('Result:', !!userData.is_admin);  // Should be: true
```

### Check 3: Check Network Tab
1. F12 → Network Tab
2. Reload page
3. Look for `/api/login` request:
   - Status should be `200`
   - Response should contain:
     ```json
     {
       "message": "Login successful",
       "token": "eyJ...",
       "user": {
         "id": 1,
         "username": "admin",
         "email": "admin@example.com",
         "is_admin": true,
         "is_active": true
       }
     }
     ```

### Check 4: Verify Route Protection
1. In browser console:
   ```javascript
   // Check current URL
   window.location.pathname  // Should be: /admin
   ```

2. Manually navigate to admin route:
   - Type in address bar: `http://localhost:5174/admin`
   - If logged in as admin: Should see dashboard
   - If not logged in: Should redirect to `/` (login page)

## 🚀 Complete Flow Visualization

```
┌─────────────────────────────────────────────────────┐
│ 1. User enters: username=admin, password=admin123   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. Frontend sends POST /api/login                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. Backend verifies:                                │
│    - User exists                                    │
│    - Password matches                               │
│    - Account is active                              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. Backend returns:                                 │
│    - JWT token                                      │
│    - User object with is_admin=true                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 5. Frontend saves to localStorage:                  │
│    - token: "eyJ..."                                │
│    - user: {id, username, email, is_admin: true}   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 6. Frontend calls handleLoginSuccess()              │
│    - Sets isAdmin state = true                      │
│    - Calls navigate('/admin')                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 7. Route protector checks isUserAdmin()             │
│    - Reads localStorage.user                        │
│    - Confirms is_admin = true                       │
│    - Renders <AdminDashboard />                     │
└─────────────────────────────────────────────────────┘
```

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Login page displays correctly
- [ ] Can submit admin/admin123 credentials
- [ ] Console shows "🚀 Redirecting to /admin"
- [ ] localStorage contains correct user object with is_admin=true
- [ ] URL changes to http://localhost:5174/admin
- [ ] Admin Dashboard component renders
- [ ] Can see metrics section
- [ ] Can see user management section
- [ ] Can see activity logs section
- [ ] No console errors (red ❌)

## 🔧 If Issues Persist

### Complete Reset Procedure
```bash
# Stop both servers (Ctrl+C)

# Delete database
cd backend
del instance\study_planner.db

# Clear browser storage (F12 → Application → Storage → Clear all)

# Restart servers
python app.py  # In backend terminal
npm run dev    # In frontend terminal
```

### Common Issues

**Issue**: "isUserAdmin() returning false"
- **Solution**: Check localStorage.user contains is_admin: true
- **Check**: `console.log(JSON.parse(localStorage.getItem('user')))`

**Issue**: "Admin dashboard not rendering"
- **Solution**: Verify route is being accessed at `/admin`
- **Check**: `window.location.pathname` in console

**Issue**: "Getting 401 Unauthorized"
- **Solution**: Backend auto-creates admin on startup
- **Fix**: Restart backend server

**Issue**: "Login button not responding"
- **Solution**: Backend might not be running
- **Check**: `http://localhost:5000/api/health`

## 📞 Quick Reference

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:5174 | ✅ Running |
| Backend | http://localhost:5000 | ✅ Running |
| Login Page | http://localhost:5174 | ✅ Working |
| Admin Dashboard | http://localhost:5174/admin | ✅ Protected |
| API Health | http://localhost:5000/api/health | ✅ Test endpoint |

## 🎯 Next Steps After Verification

1. ✅ Verify admin login works
2. ✅ Test admin dashboard displays
3. ✅ Test user management features
4. 🔄 Proceed with admin dashboard development
5. 🔄 Add additional admin features as needed
