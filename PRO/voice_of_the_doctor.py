import os
import platform
import subprocess

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*args, **kwargs):
        return False

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))


def _ensure_parent_directory(output_filepath):
    parent_directory = os.path.dirname(output_filepath)
    if parent_directory:
        os.makedirs(parent_directory, exist_ok=True)


def _play_audio(output_filepath):
    if not os.path.exists(output_filepath):
        return

    os_name = platform.system()
    try:
        if os_name == "Darwin":
            subprocess.run(["afplay", output_filepath], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif os_name == "Windows":
            subprocess.run(
                ["powershell", "-c", f'(New-Object Media.SoundPlayer "{output_filepath}").PlaySync();'],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        elif os_name == "Linux":
            subprocess.run(["aplay", output_filepath], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            raise OSError("Unsupported operating system")
    except Exception as e:
        print(f"An error occurred while trying to play the audio: {e}")


def text_to_speech_with_gtts(input_text, output_filepath):
    from gtts import gTTS

    language = "en"
    _ensure_parent_directory(output_filepath)
    audioobj = gTTS(text=input_text, lang=language, slow=False)
    audioobj.save(output_filepath)
    _play_audio(output_filepath)
    return output_filepath


def text_to_speech_with_elevenlabs(input_text, output_filepath):
    try:
        from elevenlabs.client import ElevenLabs
    except Exception:
        # fall back to gTTS if elevenlabs package not available
        return text_to_speech_with_gtts(input_text, output_filepath)

    api_key = os.environ.get("ELEVEN_API_KEY")
    if not api_key:
        raise ValueError("ELEVEN_API_KEY is not set. Please add it to the .env file or environment.")

    _ensure_parent_directory(output_filepath)
    client = ElevenLabs(api_key=api_key)
    try:
        # Some elevenlabs client versions expose different method names
        audio = client.generate(text=input_text, voice="Aria", output_format="mp3_22050_32", model="eleven_turbo_v2")
        client.save(audio, output_filepath)
    except AttributeError:
        # fall back to gTTS if the client API doesn't match expectations
        return text_to_speech_with_gtts(input_text, output_filepath)

    _play_audio(output_filepath)
    return output_filepath
