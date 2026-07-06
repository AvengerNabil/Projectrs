import os, tempfile, pathlib, wave, struct

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

# public image URL
image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg'

try:
    import gradio_app
    print('Starting live submission with public image URL; this will call external APIs (Groq/ElevenLabs).')
    out = gradio_app.process_inputs(str(audio_path), image_url)
    print('LIVE_PROCESS_OK')
    print(out)
except Exception as e:
    print('LIVE_PROCESS_ERROR', repr(e))
finally:
    try:
        os.unlink(audio_path)
    except Exception:
        pass
