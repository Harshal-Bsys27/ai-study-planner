# Backend Tests Folder

Simple test and setup scripts for development.

## Setup Script

**File**: `setup.py`

Clean slate setup - creates fresh admin user.

### Usage:
1. Stop backend server (Ctrl+C)
2. Delete database files if needed:
   ```bash
   del instance/study_planner.db
   del backend/instance/study_planner.db
   ```
3. Run setup:
   ```bash
   python backend/tests/setup.py
   ```
4. Output shows admin credentials
5. Start backend: `python backend/app.py`

### Login Credentials:
- Username: `admin`
- Password: `admin123`
