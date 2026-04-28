# 🚀 Getting Started - AI Study Planner

## Installation & Setup

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database
```bash
cd backend
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print('Database initialized!')"
```

### 3. Start Backend Server
```bash
cd backend
python app.py
```
The backend server will start on **`http://localhost:5000`**

### 4. Install Frontend Dependencies (in another terminal)
```bash
cd frontend
npm install
```

### 5. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
The frontend will be available on **`http://localhost:5173`**

---

## Quick Usage Guide

### Step 1: Create an Account
1. Click **"Sign Up"** on the login page
2. Enter username, email, and password
3. Click **"Register"**

### Step 2: Generate Your First Study Plan
1. After logging in, select a **Subject** (DSA, React, Machine Learning, etc.)
2. Choose a **Level** (Beginner, Intermediate, Advanced)
3. Set **Days** (how many days for the study plan)
4. Set **Hours/Day** (study hours per day)
5. Click **"Generate"** button

This will create a study plan and save it to the database.

### Step 3: Add Flashcards
1. After generating a plan, scroll to **"Active Study Tools"** section
2. In the **"Flashcards"** card, click the **"Add"** button
3. Fill in:
   - **Topic**: The topic this flashcard covers (e.g., "Binary Search")
   - **Question**: The question text (e.g., "What is binary search?")
   - **Answer**: The answer text (e.g., "Binary search is...")
4. Click **"Create"** button
5. The flashcard will be saved to the database and appear immediately

### Step 4: Use Pomodoro Timer
1. In the **"Active Study Tools"** section, find the **Pomodoro Timer**
2. Click **"Start"** to begin a 25-minute focus session
3. After 25 minutes, it automatically switches to a 5-minute break
4. When complete, click **"Stop"** to log the session

### Step 5: Track Your Streak
1. In the **"Active Study Tools"** section, view your **"Study Streak"**
2. Shows your current streak and longest streak
3. Click **"Log Study Session"** to update your streak after studying

### Step 6: View Analytics
1. Scroll to the **"Course Analytics & Progress"** section
2. See your overall completion percentage
3. View study sessions count and total hours
4. Check topics completed and average time per topic

### Step 7: Study Your Plan
1. Scroll to **"Your Study Plan"** section at the bottom
2. Each day shows a progress bar and status indicator
3. Click on a day to expand and see all topics
4. Check off topics as you complete them
5. Status updates automatically (Ahead/On Track/Behind)

---

## Troubleshooting

### Issue: Flashcards Not Saving?

**Solution:**
1. Make sure backend is running: `python app.py`
2. Check browser console (F12) for error messages
3. Verify you've generated a study plan first
4. Check the backend logs for validation errors

**If still not working:**
- Open browser DevTools (F12)
- Go to **Network** tab
- Try adding a flashcard
- Look for the `POST /api/flashcards` request
- Check the response status and error message

### Issue: Can't Log In?

**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Make sure backend is running on `localhost:5000`
3. Check that database was initialized (`db.sqlite`)
4. Try creating a new account with different email

### Issue: Frontend Not Loading?

**Solution:**
1. Make sure frontend is running: `npm run dev`
2. Check if you're on `localhost:5173`
3. Clear browser cache
4. Restart the dev server: `Ctrl+C` then `npm run dev`

### Issue: Spacing/Download Issues?

**Solution:**
- The layout now uses optimized spacing with single-file structure
- All components are properly responsive
- No empty divs or unnecessary wrappers
- Should work on all screen sizes

---

## API Endpoints Reference

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - Login and get token

### Study Plans
- `POST /api/generate-plan` - Create study plan
- `GET /api/plans` - List all plans
- `GET /api/plans/<id>` - Get specific plan
- `DELETE /api/plans/<id>` - Delete plan
- `GET /api/plans/search?q=query` - Search plans
- `GET /api/plans/<id>/export` - Export as PDF/CSV

### Flashcards
- `POST /api/flashcards` - Add flashcard
- `GET /api/flashcards/<plan_id>` - Get flashcards for plan
- `DELETE /api/flashcards/<id>` - Delete flashcard

### Study Sessions
- `POST /api/pomodoro` - Log Pomodoro session
- `GET /api/pomodoro/<plan_id>` - Get Pomodoro sessions

### Analytics & Streak
- `GET /api/stats/streak` - Get user streak data
- `POST /api/stats/streak/update` - Update streak
- `GET /api/analytics/<plan_id>` - Get plan analytics
- `GET /api/stats` - Get all statistics

### Notes
- `POST /api/plans/<id>/notes` - Add study notes
- `GET /api/plans/<id>/notes` - Get study notes

---

## Features Implemented

✅ **Authentication**
- User registration and login
- JWT token-based security
- Persistent session storage

✅ **Study Plans**
- Generate plans from 50+ topics
- 3 difficulty levels (Beginner/Intermediate/Advanced)
- Custom domain creation
- Variable day and hour settings

✅ **Active Study Tools**
- Pomodoro Timer (25min work, 5min break)
- Study Streak Tracker (current and longest)
- Flashcard System (flip cards with Q&A)

✅ **Analytics**
- Overall completion percentage
- Session tracking
- Time spent per topic
- Topics completed counter

✅ **Responsive Design**
- Works on mobile, tablet, and desktop
- Optimized grid layout
- Professional UI spacing
- Smooth animations

---

## Keyboard Shortcuts (Coming Soon)

- `Ctrl + G` - Generate new plan
- `Shift + F` - Focus Pomodoro timer
- `Shift + S` - Search plans

---

## Database Schema

### Users Table
- id, username, email, password, created_at

### StudyPlans Table
- id, user_id, subject, level, days, hours_per_day, plan_data (JSON), completion_percentage, created_at, updated_at

### Flashcards Table
- id, plan_id, question, answer, topic, created_at

### PomodoroSessions Table
- id, plan_id, topic, focus_duration, completed, created_at

### StudyStreaks Table
- id, user_id, current_streak, longest_streak, last_study_date, updated_at

### UserProgress Table
- id, plan_id, day, topic, completed, time_spent (seconds), created_at

---

## Performance Tips

1. **Clear localStorage periodically** - Helps with app responsiveness
   ```javascript
   localStorage.clear()
   ```

2. **Close browser tabs** - Large study plans can consume memory

3. **Use Firefox DevTools** for better debugging of network requests

4. **Restart servers** if you notice slow performance
   - Kill the backend: `Ctrl+C` in terminal
   - Kill the frontend: `Ctrl+C` in terminal
   - Restart both

---

## Common Questions

### Q: Can I use this offline?
**A:** Yes, after initial load. The app will sync data when back online.

### Q: How many study plans can I create?
**A:** Unlimited! All saved to database.

### Q: Can I share my study plans?
**A:** Not yet, but coming in v2.0!

### Q: Is my data private?
**A:** Yes, encrypted in database. Only you can see your plans.

### Q: Can I export my plans?
**A:** Yes! Click **"Download"** in the top-right of any plan.

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///instance/study_planner.db
CORS_ORIGINS=*,http://localhost:5173
```

---

## Support & Debugging

### Check Logs
1. Backend: Terminal where `python app.py` is running
2. Frontend: Browser DevTools Console (F12)

### Enable Debug Mode
Backend: Set `DEBUG=True` in your Flask config

### SQL Issues?
- Database file: `backend/instance/study_planner.db`
- To reset: Delete the file and reinitialize

---

## Next Steps

1. ✅ Generate a study plan
2. ✅ Add some flashcards
3. ✅ Start a Pomodoro session
4. ✅ Check your progress
5. ✅ Export your plan

**Happy studying!** 📚✨
