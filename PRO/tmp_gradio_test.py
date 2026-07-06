import os
import tempfile
import pathlib
from unittest.mock import patch

root = pathlib.Path.cwd()
with tempfile.NamedTemporaryFile(delete=False, suffix='.txt', dir=root) as tmp_image:
    tmp_image.write(b'dummy image bytes')
    image_path = tmp_image.name
with tempfile.NamedTemporaryFile(delete=False, suffix='.wav', dir=root) as tmp_audio:
    tmp_audio.write(b'dummy audio bytes')
    audio_path = tmp_audio.name

try:
    import gradio_app
    with patch('voice_of_the_patient.transcribe_with_groq', return_value='hello doctor'), \
         patch('brain_of_the_doctor.analyze_image_with_query', return_value='doctor answer'), \
         patch('voice_of_the_doctor.text_to_speech_with_elevenlabs', return_value='final.mp3'):
        out = gradio_app.process_inputs(audio_path, image_path)
        print('PROCESS_OK', out)
except Exception as e:
    print('PROCESS_ERROR', repr(e))
finally:
    for path in [image_path, audio_path]:
        try:
            os.unlink(path)
        except Exception:
            pass
