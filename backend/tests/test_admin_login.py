#!/usr/bin/env python
"""
Debug admin login - test password hashing and user verification
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from models import db, User
from app import create_app

def test_admin_login():
    app = create_app()
    
    with app.app_context():
        print("🔍 Debugging Admin Login\n")
        
        # Check admin user exists
        admin_user = User.query.filter_by(username='admin').first()
        
        if not admin_user:
            print("❌ Admin user not found in database!")
            print("   Creating admin user now...")
            admin_user = User(
                username='admin',
                email='admin@example.com',
                is_admin=True,
                is_active=True
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()
            print("✅ Admin user created!")
        
        print(f"👤 Admin User Found:")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   is_admin: {admin_user.is_admin}")
        print(f"   is_active: {admin_user.is_active}")
        print(f"   Password hash: {admin_user.password[:50]}...")
        
        # Test password verification
        print(f"\n🔐 Testing Password Verification:")
        test_passwords = ['admin123', 'admin', '123456', 'wrong']
        
        for pwd in test_passwords:
            result = admin_user.check_password(pwd)
            status = "✅ MATCH" if result else "❌ NO MATCH"
            print(f"   Password '{pwd}': {status}")
        
        # Simulate login
        print(f"\n🧪 Simulating Login Request:")
        username = 'admin'
        password = 'admin123'
        
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"   ❌ User '{username}' not found")
        elif not user.check_password(password):
            print(f"   ❌ Password mismatch for '{username}'")
            print(f"      Expected password: '{password}'")
            print(f"      Actual stored hash: {user.password[:50]}...")
        elif not user.is_active:
            print(f"   ❌ User account disabled")
        else:
            print(f"   ✅ LOGIN SUCCESS!")
            print(f"      User: {user.username}")
            print(f"      is_admin: {user.is_admin}")

if __name__ == '__main__':
    test_admin_login()
