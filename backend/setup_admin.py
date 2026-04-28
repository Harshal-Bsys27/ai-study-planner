#!/usr/bin/env python
"""
Setup script to create/verify admin user credentials
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from models import db, User
from app import create_app

def setup_admin():
    app = create_app()
    
    with app.app_context():
        # Create all tables
        print("📦 Creating database tables...")
        db.create_all()
        print("✅ Database tables ready")
        
        # Admin credentials from environment
        admin_usernames = [u.strip().lower() for u in os.getenv('ADMIN_USERNAMES', 'admin').split(',') if u.strip()]
        admin_emails = [e.strip().lower() for e in os.getenv('ADMIN_EMAILS', 'admin@example.com').split(',') if e.strip()]
        
        print(f"\n🔧 Admin Configuration:")
        print(f"   Admin usernames: {admin_usernames}")
        print(f"   Admin emails: {admin_emails}")
        
        # Check if admin user exists
        admin_user = User.query.filter_by(username=admin_usernames[0]).first() if admin_usernames else None
        
        if admin_user:
            print(f"\n✅ Admin user '{admin_usernames[0]}' already exists")
            print(f"   ID: {admin_user.id}")
            print(f"   Email: {admin_user.email}")
            print(f"   is_admin: {admin_user.is_admin}")
            print(f"   is_active: {admin_user.is_active}")
            
            # Update admin status if needed
            if not admin_user.is_admin:
                print(f"\n⚠️  Updating admin status...")
                admin_user.is_admin = True
                db.session.commit()
                print(f"✅ Admin status updated!")
        else:
            # Create admin user
            print(f"\n👤 Creating admin user '{admin_usernames[0]}'...")
            admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
            admin_email = admin_emails[0] if admin_emails else 'admin@example.com'
            
            admin_user = User(
                username=admin_usernames[0],
                email=admin_email,
                is_admin=True,
                is_active=True
            )
            admin_user.set_password(admin_password)
            
            db.session.add(admin_user)
            db.session.commit()
            
            print(f"✅ Admin user created successfully!")
            print(f"   ID: {admin_user.id}")
            print(f"   Username: {admin_usernames[0]}")
            print(f"   Email: {admin_email}")
            print(f"   Default Password: {admin_password}")
        
        # List all users
        print(f"\n📋 All users in database:")
        users = User.query.all()
        if users:
            for user in users:
                admin_badge = "👑" if user.is_admin else "👤"
                active_badge = "✅" if user.is_active else "❌"
                print(f"   {admin_badge} {user.username} ({user.email}) - active:{active_badge}")
        else:
            print("   (No users found)")

if __name__ == '__main__':
    setup_admin()
    print("\n✨ Setup complete! You can now login with admin credentials.")
