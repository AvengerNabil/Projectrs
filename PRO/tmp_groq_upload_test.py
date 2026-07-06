import os, requests, pathlib
root = pathlib.Path.cwd()
img_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg'
resp = requests.get(img_url, headers={'User-Agent':'Mozilla/5.0'}, timeout=30)
resp.raise_for_status()
content = resp.content
api_key = os.environ.get('GROQ_API_KEY') or ''
if not api_key:
    print('NO_GROQ_KEY')
else:
    files = {'file': ('flower.jpg', content)}
    headers = {'Authorization': f'Bearer {api_key}'}
    r = requests.post('https://api.groq.com/openai/v1/files', headers=headers, files=files)
    print('STATUS', r.status_code)
    try:
        print('JSON', r.json())
    except Exception:
        print('TEXT', r.text)
