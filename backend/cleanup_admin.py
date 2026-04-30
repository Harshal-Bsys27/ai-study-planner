#!/usr/bin/env python
"""
COMPLETE RESET: Delete all users and create fresh admin user
"""
import os
from dotenv import load_dotenv

load_dotenv()

from models import db, User
from app import create_app

def complete_reset():
    app = create_app()
    
    with app.app_context():
        print("🗑️  COMPLETE ADMIN RESET\n")
        print("=" * 60)
        
        # Step 1: Delete ALL users
        print("Step 1: Deleting ALL existing users...")
        all_users = User.query.all()
        print(f"  Found {len(all_users)} users to delete")
        
        for user in all_users:
            print(f"  Deleting: {user.username} (ID: {user.id}, is_admin: {user.is_admin})")
            db.session.delete(user)
        
        db.session.commit()
        print("✅ All users deleted!\n")
        
        # Step 2: Create fresh admin user
        print("Step 2: Creating fresh admin user...")
        admin_user = User(
            username='admin',
            email='admin@example.com',
            is_admin=True,
            is_active=True
        )
        admin_user.set_password('admin123')
        
        db.session.add(admin_user)
        db.session.commit()
        
        print(f"✅ Admin user created!")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   is_admin: {admin_user.is_admin}")
        print(f"   is_active: {admin_user.is_active}")
        print(f"   Password hash: {admin_user.password[:50]}...\n")
        
        # Step 3: Verify password
        print("Step 3: Verifying password...")
        if admin_user.check_password('admin123'):
            print("✅ Password verification: SUCCESS\n")
        else:
            print("❌ Password verification: FAILED\n")
        
        # Step 4: Simulate login
        print("Step 4: Simulating login request...")
        login_user = User.query.filter_by(username='admin').first()
        
        if not login_user:
            print("❌ User not found after creation!")
            return
        
        print(f"  Found user: {login_user.username}")
        print(f"  is_admin: {login_user.is_admin}")
        print(f"  is_active: {login_user.is_active}")
        
        if login_user.check_password('admin123'):
            print("✅ Password check: PASS")
        else:
            print("❌ Password check: FAIL")
        
        if login_user.is_admin:
            print("✅ is_admin flag: TRUE")
        else:
            print("❌ is_admin flag: FALSE")
        
        if login_user.is_active:
            print("✅ is_active flag: TRUE")
        else:
            print("❌ is_active flag: FALSE")
        
        print("\n" + "=" * 60)
        print("✨ SETUP COMPLETE!")
        print("\n🔐 Login Credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n📝 Next steps:")
        print("   1. Restart backend server")
        print("   2. Login with admin/admin123")
        print("   3. Should see admin dashboard")

if __name__ == '__main__':
    complete_reset()
