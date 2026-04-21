# 🚀 Deployment & AI Integration Strategy (100% FREE)

## 🎯 QUICK REFERENCE - Everything FREE ✅

```
┌─────────────────────────────────────────────────────────┐
│         COMPLETE FREE TECH STACK                        │
├─────────────────────────────────────────────────────────┤
│ Frontend:  Render (React)  ($0/month, spins down)      │
│ Backend:   Render (Flask)  ($0/month, spins down)      │
│ Database:  Render PostgreSQL ($0/month)                │
│ AI:        Google Gemini   ($0/month, 60 req/min)      │
├─────────────────────────────────────────────────────────┤
│ TOTAL COST: $0/MONTH ✅                                │
│ Setup Time: 2 hours                                    │
│ All code changes: ~1 hour                              │
│ WARNING: Services spin down after 15 min inactivity    │
│ PRO TIP: Use Render Cron jobs to prevent spinning down │
└─────────────────────────────────────────────────────────┘
```

### Free Service Signup Links:
- 🟦 **Render (All Services):** https://render.com
- 🟡 **Google Gemini:** https://ai.google.dev (no signup needed!)
- 💻 **GitHub:** https://github.com

---

## Part 1: FREE Deployment Stack

### 🏆 **Best Free Stack: Vercel + Railway + Supabase**

| Service | Free Tier | Why |
|---------|-----------|-----|
| **Vercel** (Frontend) | 100GB bandwidth | Unlimited projects, auto-deploys |
| **Railway** (Backend) | $5 credit/month | Equivalent to ~50 hours of compute |
| **Supabase** (Database) | PostgreSQL 500MB | Free PostgreSQL + Auth |

**Total Cost:** $0/month ✅

---

### Option 1: **Render (Frontend) - COMPLETELY FREE**
**Pros:**
- Free tier with unlimited projects
- Automatic Git integration
- Auto-deploys on git push
- Free custom domains
- PostgreSQL included
- No security issues ✅ (Safe!)

**Setup:**
1. Sign up at render.com
2. New Web Service → Connect GitHub
3. Root Directory: frontend
4. Build Command: npm install && npm run build
5. Start Command: npm run preview
6. Deploy (auto-generates domain)

**Cost:** $0/month (services spin down after 15 min inactivity)

---

### Option 2: **Render (Backend) - COMPLETELY FREE**
**Pros:**
- Free tier included
- PostgreSQL database included
- Environment variables management
- Auto-deploy on git push
- No credit card required

**Setup:**
1. New Web Service → Connect GitHub
2. Root Directory: backend
3. Build Command: pip install -r requirements.txt
4. Start Command: gunicorn app:app
5. Add environment variables
6. Connect PostgreSQL

**Cost:** $0/month (spins down after 15 min inactivity)

---

### Option 3: **Render PostgreSQL - COMPLETELY FREE**
**Pros:**
- Free PostgreSQL database (500MB)
- Included with Render
- Auto-backups
- No credit card required

**Setup:**
1. New PostgreSQL Database on Render
2. Get connection string
3. Add to backend environment variables
4. Run: flask db upgrade

**Cost:** $0/month

---

### 🏆 **RECOMMENDED STACK: Render Everything**
```
Frontend → Render Web Service (free)
Backend → Render Web Service (free)
Database → Render PostgreSQL (free, included)
AI → Google Gemini (free, 60 req/min)

Total Cost: $0/month ✅
Setup Time: 15 minutes
Tradeoff: Services sleep after 15 min (cold start ~30 sec)

Solution: Add Render Cron Job to ping every 10 minutes
```

---

## Part 2: Database Migration (SQLite → PostgreSQL)

### Current Setup:
```
sqlite:///study_planner.db  (file-based)
```

### Production Setup:
```python
# backend/config.py
import os

DATABASE_URL = os.getenv('DATABASE_URL')

class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = DATABASE_URL  # Provided by Render/Railway
    DEBUG = False
    TESTING = False
```

### Migration Commands:
```bash
# 1. Create migration folder (if not exists)
flask db init

# 2. Auto-generate migration from model changes
flask db migrate -m "Initial migration"

# 3. Apply migration to production database
flask db upgrade
```

---

## Part 3: FREE AI Integration for Topic Generation

### 🏆 **Best Free AI: Google Gemini (No Credit Card)**

**Why Gemini:**
- ✅ Completely free tier: 60 requests/minute
- ✅ No credit card required
- ✅ Good quality output for educational content
- ✅ 1-minute setup

**Usage Limits:**
- 60 requests/min (plenty for MVP)
- ~1,500 requests/day
- No daily quota cutoff

```python
# backend/ai_service.py
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

def generate_topics(subject, level="Beginner"):
    prompt = f"""Generate 8-10 study topics for {subject} at {level} level.
    Format as a numbered list with brief descriptions."""
    response = model.generate_content(prompt)
    return response.text
```

**Cost:** $0/month ✅

---

### Option 2: **Hugging Face (Completely FREE - Open Source)**

**Why Hugging Face:**
- ✅ 100% free, open source models
- ✅ No API costs ever
- ✅ Run locally or via free API
- ✅ Multiple model options
- ✅ Privacy-friendly

**Models Available:**
```python
from transformers import pipeline

# Option 1: Use Hugging Face API (free tier)
generator = pipeline(
    "text-generation",
    model="mistral-7b-instruct-v0.1",
    token=os.getenv("HF_TOKEN")
)

# Option 2: Run locally (completely free, no API key)
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "mistral-7b-instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

def generate_topics_local(subject):
    prompt = f"Generate 8 study topics for {subject}:"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=500)
    return tokenizer.decode(outputs[0])
```

**Cost:** $0/month ✅

**Downsides:** Requires 4GB+ RAM for local inference

---

### Option 3: **Groq (FREE - Super Fast LLM)**

**Why Groq:**
- ✅ Completely free tier
- ✅ Super fast inference (up to 300 tokens/sec)
- ✅ No credit card required
- ✅ Great for real-time applications

```python
import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_topics_groq(subject):
    response = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{
            "role": "user",
            "content": f"Generate 8 study topics for {subject}"
        }],
        max_tokens=1024
    )
    return response.choices[0].message.content
```

**Cost:** $0/month ✅

---

### Option 4: **Together.ai (FREE - Llama 2 & More)**

**Why Together.ai:**
- ✅ Free tier: up to $5/month (lots for MVP)
- ✅ Llama 2 & other models
- ✅ No credit card (initially)
- ✅ Good latency

```python
import together

together.api_key = os.getenv("TOGETHER_API_KEY")

def generate_topics_together(subject):
    output = together.Complete.create(
        prompt=f"Generate 8 study topics for {subject}:",
        model="togethercomputer/llama-2-7b-chat",
        max_tokens=1024
    )
    return output['output']['choices'][0]['text']
```

**Cost:** $0/month (free credits) ✅

---

## ⭐ **RECOMMENDED FREE APPROACH**

### **Tier 1: Best Balance (RECOMMENDED)**
```python
# Use Google Gemini + Hugging Face fallback
# No costs, good quality, easy setup

if use_free_credits:
    return gemini.generate()  # Free tier: 60 req/min
else:
    return huggingface.generate()  # Completely free fallback
```

### **Tier 2: Maximum Free (No Limits)**
```python
# Use local Hugging Face models + Groq
# Run model locally for infinite free inference
# Use Groq API for backup (also free)

return huggingface_local.generate()  # 100% local, no API calls
```

### **Comparison Chart**

| Model | Free? | Setup | Quality | Speed | Notes |
|-------|-------|-------|---------|-------|-------|
| **Gemini** | ✅ 60 req/min | 1 min | ⭐⭐⭐⭐ | ⭐⭐⭐ | Easiest |
| **Groq** | ✅ 25K req/day | 2 min | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Fastest |
| **HF Local** | ✅ Unlimited | 5 min | ⭐⭐⭐ | ⭐⭐ | No API |
| **Together** | ✅ $5 free | 2 min | ⭐⭐⭐⭐ | ⭐⭐⭐ | Good quality |

**My Pick:** Start with **Gemini** (easiest), fallback to **Groq** or **HF Local**

---

## Part 5: Recommended FREE Implementation

### **Deployment Architecture (100% FREE - Render Only)**

```
GitHub Repo
    │
    ├─→ Render Web Service #1 ──→ React Frontend (FREE)
    │
    ├─→ Render Web Service #2 ──→ Flask Backend (FREE)
    │
    ├─→ Render PostgreSQL ──→ Database (FREE, 500MB)
    │
    └─→ Render Cron Job ──→ Keep-Alive Ping (FREE, optional)
```

### **Keep-Alive Cron Job (Optional but Recommended)**

To prevent services from spinning down:
```yaml
# Render Dashboard → New + → Cron Job
Schedule: 0 */10 * * * *  (every 10 minutes)
URL: https://your-backend.onrender.com/api/health
HTTP Method: GET
Timeout: 60 seconds
```

This keeps your backend warm and always responsive!

### **Code: AI Service Module**

```python
# backend/ai_service.py
import os
import google.generativeai as genai

class TopicGenerator:
    def __init__(self):
        # Get free API key from https://ai.google.dev
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-pro")
    
    def generate_topics(self, subject, level="Beginner", num_topics=8):
        """Generate study topics using free Gemini API"""
        prompt = f"""
        Generate {num_topics} specific, actionable study topics for:
        Subject: {subject}
        Difficulty Level: {level}
        
        Format ONLY as:
        1. Topic Name - Brief description
        2. Topic Name - Brief description
        etc.
        
        Make topics concrete and actionable for learners.
        """
        
        response = self.model.generate_content(prompt)
        return self._parse_topics(response.text)
    
    def _parse_topics(self, text):
        """Parse AI response into structured topics"""
        topics = []
        for line in text.strip().split('\n'):
            if line.strip() and line[0].isdigit():
                topics.append(line.strip())
        return topics

# backend/app.py - Add new endpoint
@app.route('/api/generate-topics', methods=['POST'])
@login_required
def generate_topics():
    data = request.get_json()
    subject = data.get('subject')
    level = data.get('level', 'Beginner')
    
    generator = TopicGenerator()
    topics = generator.generate_topics(subject, level)
    
    return jsonify({'topics': topics}), 200
```

### **Frontend: UI for AI Topics**

```javascript
// frontend/src/components/AITopicGenerator.jsx
import { useState } from 'react';
import { Button, TextField, CircularProgress, Box } from '@mui/material';

export default function AITopicGenerator() {
    const [subject, setSubject] = useState('');
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateAITopics = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, level: 'Beginner' })
            });
            const data = await response.json();
            setTopics(data.topics);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <TextField 
                label="Subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />
            <Button 
                variant="contained"
                onClick={generateAITopics}
                disabled={loading || !subject}
            >
                {loading ? <CircularProgress size={24} /> : '🤖 Generate Topics'}
            </Button>
            {topics.map((topic, i) => (
                <div key={i}>{topic}</div>
            ))}
        </Box>
    );
}
```

---

## Part 6: Implementation Roadmap (FREE)

### **Phase 1: GitHub Setup (30 min)**
- [ ] Create GitHub repo
- [ ] Push all code to GitHub
- [ ] Create .gitignore for `.env`, `*.db`

### **Phase 2: Frontend Deployment (15 min)**
- [ ] Sign up at vercel.com
- [ ] Import GitHub repo
- [ ] Deploy (auto-generates domain)
- [ ] Test frontend

### **Phase 3: Backend Deployment (30 min)**
- [ ] Sign up at railway.app (or render.com)
- [ ] Connect GitHub repo
- [ ] Set environment variables
- [ ] Deploy Flask app
- [ ] Test backend endpoints

### **Phase 4: Database (15 min)**
- [ ] Sign up at supabase.com
- [ ] Create PostgreSQL project
- [ ] Get connection string
- [ ] Update `config.py` with connection string
- [ ] Run migrations

### **Phase 5: AI Integration (1 hour)**
- [ ] Get free Gemini API key from ai.google.dev
- [ ] Install `google-generativeai` library
- [ ] Create `ai_service.py` module
- [ ] Add `/api/generate-topics` endpoint
- [ ] Update frontend UI
- [ ] Test AI topic generation

**Total Setup Time:** 2 hours
**Total Cost:** $0 ✅

---

## Part 7: Environment Variables (FREE)

```bash
# .env (local development)
FLASK_ENV=development
DATABASE_URL=sqlite:///study_planner.db
GEMINI_API_KEY=your_free_key_from_ai.google.dev
ADMIN_EMAILS=admin@example.com
ADMIN_USERNAMES=admin
SECRET_KEY=dev-secret-key

# Railway/Vercel dashboard .env
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host/db  # From Supabase
GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_production_secret_key
```

---

## Part 8: Cost Breakdown (100% FREE with Render)

| Service | Free Tier | Cost/Month |
|---------|-----------|-----------|
| **Render Frontend** (React) | Yes (sleeps) | **$0** |
| **Render Backend** (Flask) | Yes (sleeps) | **$0** |
| **Render PostgreSQL** | 500MB | **$0** |
| **Google Gemini** (AI) | 60 req/min | **$0** |
| **Render Cron Job** (optional) | Included | **$0** |
| **TOTAL** | - | **$0/month** ✅ |

**Constraints:**
- Render: Services spin down after 15 min inactivity (can be fixed with Cron)
- Gemini: 60 requests/minute (3,600/hour - enough for 100+ users)
- PostgreSQL: 500MB storage (upgrades at $15/month)

**Pro Tip:** Use the free Render Cron Job to keep backend warm!

---

## Part 9: Step-by-Step Deployment Guide (Render)

### **Step 1: GitHub Setup**
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit - Ready for production"
git remote add origin https://github.com/YOUR_USERNAME/ai-study-planner.git
git push -u origin main
```

### **Step 2: Create Render Account**
```
1. Go to render.com
2. Sign up with GitHub (easier)
3. Verify email
4. Dashboard ready!
```

### **Step 3: Deploy Frontend (React) to Render**
```
1. Render Dashboard → New + → Web Service
2. Select ai-study-planner GitHub repo
3. Choose "Public" Git repository
4. Configuration:
   - Name: ai-study-planner-frontend
   - Root Directory: frontend
   - Runtime: Node
   - Build Command: npm install && npm run build
   - Start Command: npm run preview
5. Environment Variables:
   - VITE_API_URL=https://your-backend.onrender.com/api
6. Deploy!
7. Get frontend URL (e.g., ai-study-planner-frontend.onrender.com)
```

### **Step 4: Deploy PostgreSQL Database**
```
1. Render Dashboard → New + → PostgreSQL
2. Configuration:
   - Name: ai-study-planner-db
   - Database: study_planner
   - User: postgres
   - Auto-renewal: Enabled
3. Create!
4. Copy connection string (looks like: postgresql://user:pass@host:5432/db)
5. Keep this safe - you'll need it for backend
```

### **Step 5: Deploy Backend (Flask) to Render**
```
1. Render Dashboard → New + → Web Service
2. Select ai-study-planner GitHub repo
3. Configuration:
   - Name: ai-study-planner-backend
   - Root Directory: backend
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app --workers 1 --timeout 120
4. Environment Variables:
   - FLASK_ENV=production
   - DATABASE_URL=postgresql://user:pass@host:5432/db  (from Step 4)
   - GEMINI_API_KEY=your_api_key
   - SECRET_KEY=your-very-secret-key
   - ADMIN_EMAILS=admin@example.com
   - ADMIN_USERNAMES=admin
   - CORS_ORIGINS=https://your-frontend.onrender.com,http://localhost:5173
5. Deploy!
6. Get backend URL (e.g., ai-study-planner-backend.onrender.com)
```

### **Step 6: Update Frontend Environment**
```
1. Render Dashboard → ai-study-planner-frontend → Environment
2. Update VITE_API_URL with actual backend URL
3. Redeploy frontend
4. Test: go to frontend URL, try login
```

### **Step 7 (Optional): Keep Services Alive**
```
To prevent spinning down, add Cron job:

1. Render Dashboard → New + → Cron Job
2. Configuration:
   - Name: keep-backend-alive
   - Schedule: 0 */10 * * * *  (every 10 minutes)
   - URL: https://your-backend.onrender.com/api/health
   - HTTP Method: GET
   - Timeout: 60 seconds
3. Create!

Now backend stays warm 24/7!
```

### **Step 8: Run Database Migrations**
```bash
# From your local machine (one-time setup)
# Connect to remote database and run migrations

# First, update your config to use the DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host/db"

# Then run migrations
flask db upgrade

# You can also SSH into Render to do this:
# Render Dashboard → Services → your-backend → Shell
# $ flask db upgrade
```

### **Step 4: Setup Supabase Database**
```
1. Go to supabase.com → New Project
2. Create PostgreSQL database
3. Copy connection string
4. Add to Railway environment variables
5. Run Flask migrations:
   flask db upgrade
```

### **Step 5: Setup Gemini API**
```
1. Go to ai.google.dev → Get API Key (free!)
2. Copy API key
3. Add to Railway environment: GEMINI_API_KEY=...
4. Test with:
   curl -X POST https://your-api.railway.app/api/generate-topics \
     -H "Content-Type: application/json" \
     -d '{"subject":"DSA"}'
```
