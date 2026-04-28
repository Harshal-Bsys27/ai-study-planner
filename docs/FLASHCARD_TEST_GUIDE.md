# Testing the Flashcard Feature - Step by Step

## Current Status
✅ Backend is running on http://localhost:5000
✅ Frontend is running on http://localhost:5174

## IMPORTANT: Clear Your Browser Cache
1. Press **F12** to open Developer Tools
2. Go to **Application** tab
3. Click **Clear Site Data** or delete localStorage
4. Close and reopen http://localhost:5174

---

## Manual Testing Steps

### Step 1: Login / Register
1. Open http://localhost:5174 in your browser
2. If not logged in, click "Sign Up"
3. Enter:
   - Username: `testuser2026`
   - Email: `testuser@example.com`
   - Password: `password123`
4. Click "Register"
5. You should be logged in

### Step 2: Generate a Study Plan
1. In the main app, select:
   - **Subject**: DSA (or any subject)
   - **Level**: Beginner (or any level)
   - **Days**: 3
   - **Hours/Day**: 2
2. Click the blue **"Generate"** button
3. Wait for the success snackbar message
4. The plan should appear below

### Step 3: Add a Flashcard (THE KEY TEST)
1. Scroll down to the **"Active Study Tools"** section
2. Find the **"Flashcards"** card (right side, should say "No flashcards yet")
3. Click the blue **"Add"** button
4. A dialog should appear with three fields:
   - **Topic**: Enter "Binary Search"
   - **Question**: Enter "What is binary search?"
   - **Answer**: Enter "An efficient search algorithm for sorted arrays"
5. Click the blue **"Create"** button
6. **EXPECTED RESULT**: 
   - Dialog closes
   - Snackbar appears saying "📇 Flashcard added!"
   - The flashcard appears in the card above showing:
     - Question side showing "What is binary search?"
     - Topic: Binary Search

### Step 4: Test Flip Functionality
1. Click the flashcard to flip it
2. Should show the answer
3. Click again to flip back to question

### Step 5: Add Another Flashcard
1. Click "Add" again
2. Add different content:
   - Topic: "Sorting"
   - Question: "What is quicksort?"
   - Answer: "A divide-and-conquer sorting algorithm"
3. Click Create
4. You should now see "2 / 2" in the navigation
5. Use the arrow buttons to navigate between cards

---

## If Flashcards Still Don't Appear

### Open Browser Developer Tools (F12)
1. Go to the **Console** tab
2. Try adding a flashcard again
3. Look for these messages:
   - `🎯 handleAddFlashcard called with:` (shows the data being sent)
   - `📬 Response status: 201` (should show status 201)
   - `✅ Flashcard created:` (success message)
   - `🔄 Fetching flashcards for plan:` (fetching the list)

### Check Network Tab
1. Go to **Network** tab in DevTools
2. Try adding a flashcard
3. Look for requests:
   - `POST /api/flashcards` - Should show **Status 201**
   - `GET /api/flashcards/X` - Should show **Status 200**
4. Click on each request to see the response body

### Common Issues

**Issue: "Please generate a study plan first" error**
- Solution: Make sure you clicked "Generate" button and plan appeared
- The plan ID should be logged to console as: `🎯 Final planId being set: X`

**Issue: "Error: no such table"**
- Solution: Restart backend:
  - Kill terminal running `python app.py`
  - Type: `cd backend && python app.py`

**Issue: Response shows "Invalid token"**
- Solution: Your session expired
- Logout (refresh page) and login again

---

## Chrome DevTools Debugging

### Check currentPlanId
1. Open Console (F12 → Console)
2. Type: `localStorage.getItem('token')`
3. Should show a JWT token

### Manual API Test in Console
```javascript
// Get your token
const token = localStorage.getItem('token');

// Test creating a flashcard manually
fetch('http://localhost:5000/api/flashcards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    plan_id: 5,  // Replace with your actual plan ID
    question: 'Test question',
    answer: 'Test answer',
    topic: 'Test topic'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(e => console.error('Error:', e));
```

---

## What Should Be Fixed Now

1. ✅ **Flashcard data structure** - Frontend now correctly extracts the array from API response
2. ✅ **Better logging** - Console shows detailed steps of flashcard creation
3. ✅ **Error handling** - Clear error messages if something fails

---

## Still Having Issues?

1. **Screenshot** the error message or console logs
2. **Describe** what you're clicking
3. **Share** any errors from the console
4. Check the backend terminal for error messages

---

## Backend Verification (Already Tested)

Your backend API works perfectly:

```
TEST 3: Create Flashcard
Status: 201
Response: {
  "id": 5,
  "message": "Flashcard created"
}
Flashcard created! Flashcard ID: 5

TEST 4: Get Flashcards for Plan
Status: 200
Response: {
  "flashcards": [
    {
      "id": 5,
      "question": "What is binary search?",
      "answer": "Binary search is an efficient search algorithm",
      "topic": "Algorithms"
    }
  ],
  "total": 1
}
```

The backend creates and retrieves flashcards perfectly. The fix applied above ensures the frontend now processes this data correctly.

---

## Next Steps

1. **Test in browser** using the steps above
2. **Check console** for the logging messages
3. **Report** if flashcards appear or if you see errors
4. If working, try the other features (Pomodoro, Streak, etc.)

