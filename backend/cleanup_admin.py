from models import db, User
from app import create_app

app = create_app()

with app.app_context():
    # Check ALL users with username admin
    print('🔍 Searching for ALL users with username=admin...')
    
    users = User.query.filter(User.username.ilike('admin')).all()
    
    print(f'Found {len(users)} user(s):')
    for u in users:
        print(f'  ID: {u.id}, username: "{u.username}", is_admin: {u.is_admin}')
    
    # Delete all non-admin ones
    if len(users) > 1:
        print(f'\n🗑️  Deleting duplicate admins...')
        for u in users:
            if not u.is_admin:
                print(f'  Deleting ID {u.id} (is_admin={u.is_admin})')
                db.session.delete(u)
        db.session.commit()
        print('✅ Deleted!')
        
        # Verify
        remaining = User.query.filter(User.username.ilike('admin')).all()
        print(f'\n✅ Remaining admins: {len(remaining)}')
        for u in remaining:
            print(f'  ID: {u.id}, is_admin: {u.is_admin}')
    else:
        print('✅ Only one admin user found - no duplicates to clean')
