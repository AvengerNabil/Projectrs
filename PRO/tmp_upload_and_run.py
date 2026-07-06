import os, tempfile, pathlib, wave, struct, requests

root = pathlib.Path.cwd()
audio_path = root / 'tmp_live_audio.wav'

# write 1s silent wav
sample_rate = 16000
duration = 1
nframes = sample_rate * duration
with wave.open(str(audio_path), 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    silence = struct.pack('<h', 0)
    for _ in range(nframes):
        wf.writeframes(silence)

# public image URL to fetch and rehost
image_src = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg'

# download image
try:
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(image_src, headers=headers, timeout=30)
    r.raise_for_status()
    # upload to 0x0.st
    files = {'file': ('flower.jpg', r.content)}
    resp = requests.post('https://0x0.st', files=files, timeout=30)
    resp.raise_for_status()
    hosted_url = resp.text.strip()
    print('HOSTED_URL', hosted_url)
except Exception as e:
    print('DOWNLOAD_OR_UPLOAD_ERROR', repr(e))
    hosted_url = None

try:
    if hosted_url:
        import gradio_app
        print('Starting live submission with rehosted image; this will call external APIs (Groq/ElevenLabs).')
        out = gradio_app.process_inputs(str(audio_path), hosted_url)
        print('LIVE_PROCESS_OK')
        print(out)
    else:
        print('No hosted URL, skipping process_inputs')
except Exception as e:
    print('LIVE_PROCESS_ERROR', repr(e))
finally:
    try:
        os.unlink(audio_path)
    except Exception:
        pass
