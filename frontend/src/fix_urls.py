import os

file_path = 'App.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace all hardcoded URLs
content = content.replace('http://localhost:5000', '${API_URL}')

with open(file_path, 'w') as f:
    f.write(content)

print('✅ All URLs updated')
