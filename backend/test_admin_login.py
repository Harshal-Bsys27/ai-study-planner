import requests
import json

# Test the login endpoint
print('🧪 Testing Admin Login...')
print('=' * 50)

url = 'http://localhost:5000/api/login'
credentials = {
    'username': 'admin',
    'password': '123456'
}

try:
    response = requests.post(url, json=credentials)
    data = response.json()
    
    print(f'📊 Response Status: {response.status_code}')
    print(f'📋 Response Data:')
    print(json.dumps(data, indent=2))
    
    if response.status_code == 200:
        user = data.get('user', {})
        print(f'\n✅ Login successful!')
        print(f'   Username: {user.get("username")}')
        print(f'   Email: {user.get("email")}')
        print(f'   ID: {user.get("id")}')
        print(f'   is_admin: {user.get("is_admin")}')
        print(f'   is_active: {user.get("is_active")}')
        
        if user.get('is_admin'):
            print(f'\n🎉 ADMIN STATUS: TRUE ✅')
        else:
            print(f'\n❌ ADMIN STATUS: FALSE')
    else:
        print(f'❌ Login failed: {data.get("error")}')
        
except Exception as e:
    print(f'❌ Error: {e}')
