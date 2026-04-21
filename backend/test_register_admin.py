import requests
import json

# First, register the admin user
print('📝 Step 1: Registering admin user...')
print('=' * 60)

reg_url = 'http://localhost:5000/api/register'
reg_data = {
    'username': 'admin',
    'email': 'admin@example.com',
    'password': '123456'
}

try:
    resp = requests.post(reg_url, json=reg_data)
    reg_result = resp.json()
    print(f'Registration status: {resp.status_code}')
    print(json.dumps(reg_result, indent=2))
except Exception as e:
    print(f'Error: {e}')

print('\n🔐 Step 2: Logging in with admin credentials...')
print('=' * 60)

login_url = 'http://localhost:5000/api/login'
login_data = {
    'username': 'admin',
    'password': '123456'
}

try:
    resp = requests.post(login_url, json=login_data)
    login_result = resp.json()
    print(f'Login status: {resp.status_code}')
    print(json.dumps(login_result, indent=2))
    
    if resp.status_code == 200:
        user = login_result.get('user', {})
        print(f'\n✨ Login Result:')
        print(f'   Username: {user.get("username")}')
        print(f'   is_admin: {user.get("is_admin")}')
        print(f'   is_active: {user.get("is_active")}')
        
        if user.get('is_admin'):
            print(f'\n🎉 SUCCESS! User is admin!')
        else:
            print(f'\n❌ FAIL: User is NOT admin')
except Exception as e:
    print(f'Error: {e}')
