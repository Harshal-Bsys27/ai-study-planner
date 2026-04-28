#!/usr/bin/env python
"""
SIMPLE SETUP: Create fresh admin user
Run this AFTER stopping backend: python backend/tests/setup.py
"""
import os
import sys

# Add parent directory (backend) to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv()

from models import db, User
from app import create_app

def setup():
    app = create_app()
    
    with app.app_context():
        print("🔧 SETTING UP ADMIN USER\n")
        
        # Create all tables
        db.create_all()
        print("✅ Database tables created")
        
        # Delete all users
        User.query.delete()
        db.session.commit()
        print("✅ Database cleared")
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@example.com',
            is_admin=True,
            is_active=True
        )
        admin.set_password('admin123')
        
        db.session.add(admin)
        db.session.commit()
        
        print("✅ Admin user created")
        print(f"\n🔐 Login Credentials:")
        print(f"   Username: admin")
        print(f"   Password: admin123\n")

if __name__ == '__main__':
    setup()
