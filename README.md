# AI Study Planner

A full-stack web application for creating personalized study plans and tracking learning progress.

**[Live Demo](https://ai-study-planner.onrender.com)** | **[GitHub](https://github.com/Harshal-Bsys27/ai-study-planner)**

## Overview

AI Study Planner is a complete full-stack application that helps students create customized study schedules, track their progress, and achieve their learning goals. With support for multiple subjects and difficulty levels, users can generate personalized study plans in seconds.

## Key Features

- **Smart Plan Generation** - Create personalized study plans with 6+ built-in subjects
- **6+ Built-in Subjects** - DSA, Python, Web Dev, Machine Learning, JavaScript, React
- **Custom Subjects** - Create your own learning paths with custom topics and difficulty levels
- **Visual Analytics** - Track progress with interactive charts and visualizations
- **Study Timer** - Built-in timer to track and monitor study sessions
- **User Authentication** - Secure JWT-based authentication system
- **Responsive Design** - Fully responsive on desktop, tablet, and mobile devices
- **User-Specific Data** - Each user has isolated, persistent data storage
- **Progress Tracking** - Real-time progress updates and completion tracking

## Tech Stack

### Frontend
- React 19
- Material-UI (MUI)
- Recharts (Data visualization)
- Vite (Build tool)

### Backend
- Flask
- SQLAlchemy
- SQLite (Development)
- JWT Authentication
- CORS

### Deployment
- Render (Cloud hosting)
 ---
 ## 📸 Screenshots

| Login Page | Planner Dashboard |
|------------|-----------|
| ![](screenshots/loginpage.png) | ![](screenshots/subjectdashboard_gen.png) |

| Planner Generation and analytics |
|--------------|
| ![](screenshots/studyplan_chart.png) | ![](screenshots/customized_plan.png) |

| History | 
|------------|
| ![](screenshots/studyhistory.png) | 


---

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+
- Git

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/Harshal-Bsys27/ai-study-planner.git
cd ai-study-planner
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend
python app.py
```

Backend runs on `http://localhost:5000`

#### 3. Frontend Setup (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

#### 4. Access Application
Visit `http://localhost:5173`

## How It Works

### 1. Register/Login
Create a new account or login with existing credentials using secure JWT authentication.

### 2. Choose Subject
Select from 6 built-in subjects:
- Data Structures & Algorithms
- Python Programming
- Web Development
- Machine Learning
- JavaScript
- React

Or create a custom subject with your own topics.

### 3. Configure Plan
Set your learning parameters:
- Difficulty Level (Beginner, Intermediate, Advanced)
- Duration (1-365 days)
- Daily Hours (0.5-8 hours)

### 4. Generate Plan
Receive an instant study schedule with:
- Day-wise topic breakdown
- Hour allocation per topic
- Visual progress indicators

### 5. Track Progress
- Click topics to mark completion
- Monitor progress with charts
- Use timer for study sessions
- View study history

## Database Schema

```
Users
├── id, username, email, password_hash
└── StudyPlans (one-to-many)

StudyPlans
├── id, user_id, subject, level, days
├── hours_per_day, plan_data (JSON)
└── UserProgress, StudyNotes, StudySession (one-to-many)

UserProgress
├── id, plan_id, day, topic, completed

StudyNotes
├── id, plan_id, topic, content

StudySession
├── id, plan_id, topic, duration
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- CORS protection
- Server-side input validation
- SQL injection prevention via SQLAlchemy ORM
- User data isolation

## Features

### Authentication
- User registration with validation
- Secure login with JWT tokens
- Session persistence
- Logout functionality

### Study Planning
- 6 subjects with 18+ topics each
- 3 difficulty levels per subject
- Dynamic topic distribution
- Custom subject creation

### Progress Tracking
- Real-time progress calculations
- Day-wise breakdowns
- Overall completion percentage
- Visual progress indicators

### Analytics
- Pie chart for overall progress
- Bar chart for daily progress
- Study history tracking
- User statistics

### Study Tools
- Timer with start/pause/reset
- Session tracking
- Note-taking capability

## Project Structure

```
ai-study-planner/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── config.py
│   ├── requirements.txt
│   ├── Procfile
│   └── study_planner.db
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/Auth.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── dist/
│
└── README.md
```

## Deployment

### Deploy to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Create Backend Service**
   - Visit render.com
   - New Web Service
   - Connect GitHub repo
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && gunicorn app:app`
   - Environment variables:
     - FLASK_ENV=production
     - SECRET_KEY=<random-key>
     - CORS_ORIGINS=<frontend-url>

3. **Create Frontend Service**
   - New Static Site
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/dist`
   - Environment: VITE_API_URL=<backend-url>

4. **Verify**
   - Visit frontend URL
   - Test registration and plan generation

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Study Plans
- `GET /api/plans` - Get all user plans
- `POST /api/generate-plan` - Generate new plan
- `GET /api/plans/<id>` - Get specific plan
- `POST /api/plans/<id>/progress` - Update progress

### Notes & Sessions
- `POST /api/plans/<id>/notes` - Save notes
- `GET /api/plans/<id>/notes` - Get notes
- `POST /api/plans/<id>/session` - Save session

### Analytics
- `GET /api/stats` - Get user statistics

## Future Enhancements

- Dark mode theme
- Export to PDF
- User collaboration
- Social sharing
- API integration
- Spaced repetition algorithm
- Mobile app

## Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues first
- Include error details and screenshots

---

Made with dedication by Harshal Bsys27
