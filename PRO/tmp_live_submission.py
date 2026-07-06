import os, base64, tempfile, pathlib, wave, struct

root = pathlib.Path.cwd()
image_path = root / 'tmp_live_img.png'
audio_path = root / 'tmp_live_audio.wav'

# write 1x1 PNG
png_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
with open(image_path, 'wb') as f:
    f.write(base64.b64decode(png_b64))

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

try:
    import gradio_app
    print('Starting live submission; this will call external APIs (Groq/ElevenLabs).')
    out = gradio_app.process_inputs(str(audio_path), str(image_path))
    print('LIVE_PROCESS_OK')
    print(out)
except Exception as e:
    print('LIVE_PROCESS_ERROR', repr(e))
finally:
    for p in (image_path, audio_path):
        try:
            os.unlink(p)
        except Exception:
            pass
