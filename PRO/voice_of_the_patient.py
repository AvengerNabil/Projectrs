import logging
import os
from io import BytesIO

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*args, **kwargs):
        return False

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

try:
    import speech_recognition as sr
except ModuleNotFoundError:
    sr = None

from pydub import AudioSegment

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def record_audio(file_path, timeout=20, phrase_time_limit=None):
    if sr is None:
        logging.error("speech_recognition is not installed.")
        return None

    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            logging.info("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
            logging.info("Start speaking now...")

            audio_data = recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)
            logging.info("Recording complete.")

            wav_data = audio_data.get_wav_data()
            audio_segment = AudioSegment.from_wav(BytesIO(wav_data))
            audio_segment.export(file_path, format="mp3", bitrate="128k")
            logging.info(f"Audio saved to {file_path}")
            return file_path

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return None


GROQ_API_KEY = os.environ.get("GROQ_API_KEY")


def transcribe_with_groq(stt_model, audio_filepath, GROQ_API_KEY=None):
    api_key = GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
    if not api_key:
        return "GROQ_API_KEY is not set. Please add it to the .env file or your environment."

    from groq import Groq

    client = Groq(api_key=api_key)
    with open(audio_filepath, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(model=stt_model, file=audio_file, language="en")

    return getattr(transcription, "text", "")
