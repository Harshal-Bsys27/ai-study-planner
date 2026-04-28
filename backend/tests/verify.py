#!/usr/bin/env python
"""Quick test to check which database is being used and if admin exists"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv()

from app import create_app
from models import User

app = create_app()

with app.app_context():
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"Instance path: {app.instance_path}")
    
    db_path = os.path.join(app.instance_path, 'study_planner.db')
    print(f"Full DB path: {db_path}")
    
    if os.path.exists(db_path):
        print(f"✅ DB file exists")
    else:
        print(f"❌ DB file missing!")
    
    count = User.query.count()
    print(f"\nUsers in database: {count}")
    
    admin = User.query.filter_by(username='admin').first()
    if admin:
        print(f"✅ Admin user found!")
        print(f"   is_admin: {admin.is_admin}")
        print(f"   is_active: {admin.is_active}")
        
        # Test password
        if admin.check_password('admin123'):
            print(f"✅ Password 'admin123' works!")
        else:
            print(f"❌ Password check failed!")
    else:
        print(f"❌ Admin user NOT found!")
