# 🔧 Debugging & Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Issue: Backend Server won't start

### Error Message
```
ModuleNotFoundError: No module named 'flask'
OSError: [Errno 48] Address already in use
```

### Solutions

**Solution 1: Install missing dependencies**
```bash
cd backend
pip install -r requirements.txt
pip install flask flask-sqlalchemy flask-cors flask-jwt-extended
```

**Solution 2: Release port 5000**
```bash
# If port is already in use
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**Solution 3: Use different port**
```python
# In backend/app.py, change:
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Changed from 5000
```

### Verification
```bash
curl http://localhost:5000/
# Should show Flask error page (404 is OK, means server is running)
```

---

## 🔴 Issue: Database errors

### Error Messages
```
sqlite3.OperationalError: no such table
sqlalchemy.exc.IntegrityError: FOREIGN KEY constraint failed
AttributeError: 'NoneType' object has no attribute
```

### Solutions

**Solution 1: Reinitialize database**
```bash
# Delete old database
rm backend/instance/study_planner.db

# Reinitialize
cd backend
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print('✓ Database initialized!')"
```

**Solution 2: Check database file exists**
```bash
# Windows
dir backend/instance/

# Mac/Linux
ls -la backend/instance/
```

**Solution 3: Verify models.py is correct**
- Make sure all model classes have `__tablename__` defined
- Check for circular imports in models.py
- Verify all relationships use correct foreign keys

**Solution 4: Rollback migrations (if using Alembic)**
```bash
flask db downgrade
flask db upgrade
```

---

## 🔴 Issue: Flashcards not being added

### Symptoms
- Form validation passes but card doesn't appear
- No error message shown
- Card appears briefly then disappears

### Root Causes & Solutions

**Root Cause 1: Missing currentPlanId**
```javascript
// In App.jsx, verify this function works:
const [currentPlanId, setCurrentPlanId] = useState(null);

// Check that generatePlan sets it properly:
const newPlanId = data.id;  // Must use database ID
setCurrentPlanId(newPlanId);
```

**Root Cause 2: Network request failing silently**
```javascript
// Add console.log to debug:
const handleAddFlashcard = async (cardData) => {
    console.log('Adding flashcard for plan:', currentPlanId);
    console.log('Data:', cardData);
    
    const token = getToken();
    console.log('Token:', token ? '✓ Present' : '✗ Missing');
    
    try {
        const res = await fetch(`/api/flashcards`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(cardData)
        });
        console.log('Response:', res.status, res.statusText);
    } catch (e) {
        console.error('Request failed:', e);
    }
};
```

**Root Cause 3: Backend endpoint not working**
```bash
# Test using curl:
curl -X POST http://localhost:5000/api/flashcards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 1, "question": "Test?", "answer": "Test answer", "topic": "Test"}'

# Check for response
```

**Root Cause 4: Backend not returning ID**
```python
# In backend/app.py, verify create_flashcard returns:
@app.route('/api/flashcards', methods=['POST'])
@token_required
def create_flashcard(current_user):
    data = request.json
    card = Flashcard(
        plan_id=data['plan_id'],
        question=data['question'],
        answer=data['answer'],
        topic=data['topic']
    )
    db.session.add(card)
    db.session.commit()
    
    # Return with ID
    return jsonify({
        'id': card.id,
        'plan_id': card.plan_id,
        'question': card.question
    }), 201
```

---

## 🔴 Issue: Login/Authentication not working

### Error Messages
```
Invalid credentials
Unauthorized
401 Unauthorized
Token is invalid
```

### Solutions

**Solution 1: Verify registration**
```bash
# Check if user exists in database
# Use SQLite browser or:
cd backend
python -c "
from app import create_app, db
from models import User
app = create_app()
with app.app_context():
    users = User.query.all()
    for u in users:
        print(f'User: {u.username} ({u.email})')
"
```

**Solution 2: Check password hashing**
```python
# In backend/models.py, verify:
from werkzeug.security import check_password_hash, generate_password_hash

class User(db.Model):
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
```

**Solution 3: Verify JWT secret key**
```python
# In backend/config.py:
class Config:
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-key-change-in-production')
```

**Solution 4: Check token storage**
```javascript
// In frontend, verify token is saved:
// Open DevTools → Application → Local Storage
// Look for key like 'auth_token' or 'token'
// Should contain a JWT string like: eyJhbGciOiJIUzI1NiIs...
```

**Solution 5: Test login endpoint**
```bash
# Register user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@test.com", "password": "password123"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Should return: {"token": "eyJ..."}
```

---

## 🔴 Issue: API requests timing out

### Symptoms
- Frontend freezes when making requests
- Network requests show "Pending"
- Response takes >10 seconds

### Solutions

**Solution 1: Increase timeout**
```javascript
// In frontend API calls:
const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000)  // 10 second timeout
});
```

**Solution 2: Check backend performance**
```bash
# Add timing to Flask:
import time
from datetime import datetime

@app.route('/api/flashcards', methods=['POST'])
def create_flashcard(current_user):
    start = time.time()
    print(f"[{datetime.now()}] Received flashcard creation request")
    
    # ... do work ...
    
    duration = time.time() - start
    print(f"[{datetime.now()}] Completed in {duration:.2f}s")
    return jsonify({'status': 'ok'}), 201
```

**Solution 3: Check for large database queries**
```python
# Enable SQL logging:
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

**Solution 4: Verify CORS is working**
```bash
# Check if CORS headers are present:
curl -i http://localhost:5000/api/flashcards

# Look for:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
```

---

## 🔴 Issue: Frontend not loading components

### Symptoms
- Page shows blank/white screen
- Only login form appears
- Components not rendering

### Solutions

**Solution 1: Check console for errors**
```javascript
// Press F12, click Console tab
// Look for red error messages
// Common errors:
// "Cannot read property 'map' of undefined"
// "React is not defined"
// "Material-UI component not found"
```

**Solution 2: Verify imports**
```javascript
// In App.jsx, check all imports are present:
import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent } from '@mui/material';
import FlashcardWidget from './components/FlashcardWidget';
import PomodoroTimer from './components/PomodoroTimer';
import StreakTracker from './components/StreakTracker';
import ProgressChart from './components/ProgressChart';
import ExportPlan from './components/ExportPlan';
import SearchFilter from './components/SearchFilter';
```

**Solution 3: Clear cache and reload**
```javascript
// Open DevTools (F12)
// Right-click refresh button
// Select "Empty cache and hard refresh"
// Or: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

**Solution 4: Check Vite server is running**
```bash
# Terminal should show:
# ➜  Local:   http://localhost:5173/
# ➜  Press q to quit

# If you see errors, try:
cd frontend
npm run dev -- --host
```

**Solution 5: Verify package.json is correct**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@mui/material": "^5.0.0",
    "@mui/icons-material": "^5.0.0",
    "recharts": "^2.0.0",
    "axios": "^1.0.0"
  }
}
```

---

## 🔴 Issue: Flashcards showing but can't interact

### Symptoms
- Cards appear but flip button doesn't work
- Delete button doesn't delete
- Add button doesn't open dialog

### Solutions

**Solution 1: Check onClick handlers**
```javascript
// In FlashcardWidget.jsx, verify:
const handleFlip = (index) => {
    setFlipped(prev => ({
        ...prev,
        [index]: !prev[index]
    }));
};

<button onClick={() => handleFlip(index)}>Flip</button>
```

**Solution 2: Verify state updates**
```javascript
// Add console.log to see state changes:
const [flashcards, setFlashcards] = useState([]);

useEffect(() => {
    console.log('Flashcards updated:', flashcards);
}, [flashcards]);
```

**Solution 3: Check for event delegation issues**
```javascript
// Make sure to stop event propagation:
const handleDelete = (e, cardId) => {
    e.stopPropagation();  // Prevent card flip when clicking delete
    deleteFlashcard(cardId);
};

<button onClick={(e) => handleDelete(e, card.id)}>Delete</button>
```

**Solution 4: Verify Material-UI Button is used correctly**
```javascript
import { Button, Card, CardContent } from '@mui/material';

<Button 
    variant="contained" 
    onClick={() => handleFlip(index)}
    fullWidth
>
    Flip Card
</Button>
```

---

## 🔴 Issue: Pomodoro timer not working

### Symptoms
- Timer doesn't start
- Time not counting down
- Session not logging to database

### Solutions

**Solution 1: Check setInterval is clearing**
```javascript
// In PomodoroTimer.jsx, verify cleanup:
useEffect(() => {
    let interval;
    
    if (isRunning) {
        interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Switch to break or stop
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    
    return () => clearInterval(interval);  // Cleanup on unmount
}, [isRunning]);
```

**Solution 2: Verify session logging**
```javascript
// After timer completes:
const handleComplete = async () => {
    const token = getToken();
    const response = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            plan_id: currentPlanId,
            topic: currentTopic,
            focus_duration: 25,
            completed: true
        })
    });
    console.log('Session logged:', response.status);
};
```

**Solution 3: Check backend endpoint**
```bash
# Test Pomodoro endpoint:
curl -X POST http://localhost:5000/api/pomodoro \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 1, "topic": "DSA", "focus_duration": 25, "completed": true}'
```

---

## 🔴 Issue: Graphics/Charts not displaying

### Symptoms
- ProgressChart shows blank area
- Bar chart missing
- Pie chart not rendering

### Solutions

**Solution 1: Verify Recharts data format**
```javascript
// Data must be array of objects:
const data = [
    { name: 'Completed', value: 45 },
    { name: 'Remaining', value: 55 }
];

// NOT:
const data = { completed: 45, remaining: 55 };
```

**Solution 2: Check component imports**
```javascript
import {
    BarChart, Bar,
    PieChart, Pie,
    LineChart, Line,
    XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
```

**Solution 3: Verify container dimensions**
```javascript
// Charts need container with height:
<div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
            {/* chart elements */}
        </BarChart>
    </ResponsiveContainer>
</div>
```

**Solution 4: Check data is being fetched**
```javascript
const fetchAnalytics = async (planId) => {
    const token = getToken();
    const response = await fetch(`/api/analytics/${planId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('Analytics data:', data);  // Check if empty
    setAnalytics(data);
};
```

---

## 🟡 Issue: Warnings in console

### Common Warnings

**Warning: "Each child in a list should have a unique key prop"**
```javascript
// Fix:
{flashcards.map((card, index) => (
    <Card key={card.id || index}>  // Use ID, fallback to index
        {/* ... */}
    </Card>
))}
```

**Warning: "useEffect has missing dependencies"**
```javascript
// Fix:
useEffect(() => {
    fetchData();
}, [currentPlanId, getToken]);  // Include all dependencies
```

**Warning: "Lost connection to DevTools"**
- Just a DevTools issue, safe to ignore
- Close DevTools and reopen if persistent

**Warning: "Chunk size exceeds 500kb"**
- Non-critical, just a performance optimization tip
- Build is still successful

---

## 🟢 Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] Database initializes
- [ ] Can register new user
- [ ] Can login with correct credentials
- [ ] Can't login with wrong password
- [ ] Can create study plan
- [ ] Can create flashcard
- [ ] Can get flashcards for plan
- [ ] Can delete flashcard
- [ ] Can log Pomodoro session
- [ ] Can get streak data

### Frontend Tests
- [ ] Page loads
- [ ] Can register
- [ ] Can login
- [ ] Can generate plan
- [ ] Can add flashcard
- [ ] Can flip flashcard
- [ ] Can delete flashcard
- [ ] Can start Pomodoro timer
- [ ] Can see progress chart
- [ ] Can search plans
- [ ] Responsive on mobile

### Integration Tests
- [ ] Create plan → Add flashcard → See in list
- [ ] Create plan → Start Pomodoro → Session logs
- [ ] Add flashcard → Refresh page → Still there
- [ ] Login with different user → See only their plans

---

## 🔍 Debugging Tools

### Browser DevTools (F12)
- **Console** - JS errors and logs
- **Network** - API request/response
- **Application** - Local storage, cookies
- **Elements** - HTML structure
- **Performance** - Load times

### Backend Debugging
```python
# Add print statements
print(f"Received request: {request.json}")

# Use logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug(f"Creating flashcard: {data}")

# Database inspection
from flask import g
print(g.user)  # Current user

# SQL query inspection
from sqlalchemy import event
@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    print(f"SQL: {statement}")
```

### Network Debugging
```bash
# Use curl to test endpoints:
curl -v http://localhost:5000/api/flashcards

# -v shows headers
# Add -X POST for POST requests
# Add -d '{"json": "data"}' for body
```

---

## 📞 Getting Help

### Check These First
1. Is backend running? (http://localhost:5000 should load)
2. Is frontend running? (http://localhost:5173 should load)
3. Any error messages in browser console (F12)?
4. Any error messages in terminal?
5. Does database file exist? (backend/instance/study_planner.db)

### Steps to Debug
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform failing action
4. Look for red error messages
5. Copy the full error text
6. Check if it matches any issue above

### Still Stuck?
1. Delete database: `rm backend/instance/study_planner.db`
2. Reinitialize: `python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"`
3. Restart both servers
4. Try again

---

**Happy Debugging!** 🐛✨
