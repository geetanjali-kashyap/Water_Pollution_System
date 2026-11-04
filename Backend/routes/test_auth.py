import json
import urllib.request

BASE = 'http://127.0.0.1:5000/api/auth'

def post(path, payload):
    url = BASE + path
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=10) as r:
        status = r.getcode()
        body = r.read().decode('utf-8')
        print(f"POST {url} -> {status}\n{body}\n")

if __name__ == '__main__':
    try:
        post('/register', {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'TestPass123',
            'confirm_password': 'TestPass123'
        })
    except Exception as e:
        print('Register test error:', e)

    try:
        post('/login', {
            'email': 'test@example.com',
            'password': 'TestPass123'
        })
    except Exception as e:
        print('Login test error:', e)
