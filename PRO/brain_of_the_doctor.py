import base64
import os
import requests
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*args, **kwargs):
        return False

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))


def get_api_key(name):
    return os.environ.get(name)


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def _upload_to_0x0(file_path: str) -> str:
    """Upload a local file to 0x0.st and return the public URL."""
    with open(file_path, "rb") as f:
        files = {"file": f}
        try:
            resp = requests.post("https://0x0.st", files=files, timeout=30)
            resp.raise_for_status()
            return resp.text.strip()
        except Exception as e:
            raise RuntimeError(f"Failed to upload image to 0x0.st: {e}")


def analyze_image_with_query(query, model, encoded_image_or_path):
    api_key = get_api_key("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Please add it to your .env file or environment.")

    from groq import Groq

    client = Groq(api_key=api_key)

    # Determine image source: public URL, local path, or base64 data
    image_url = None
    if isinstance(encoded_image_or_path, str) and encoded_image_or_path.startswith("http"):
        image_url = encoded_image_or_path
    else:
        # If it's a path to an existing file, encode it as base64
        p = Path(str(encoded_image_or_path))
        if p.exists():
            # Encode the file as base64 instead of uploading
            b64 = encode_image(str(p))
            # Determine MIME type from extension
            if p.suffix.lower() in ['.png']:
                image_url = f"data:image/png;base64,{b64}"
            else:
                image_url = f"data:image/jpeg;base64,{b64}"
        else:
            # assume it's base64 data; detect png signature
            b64 = encoded_image_or_path
            if b64.startswith("iVBOR"):
                image_url = f"data:image/png;base64,{b64}"
            else:
                image_url = f"data:image/jpeg;base64,{b64}"

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": query},
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                },
            ],
        }
    ]

    try:
        chat_completion = client.chat.completions.create(messages=messages, model=model)
    except Exception as e:
        # If the image couldn't be retrieved or was rejected, retry without the image
        err_text = str(e)
        if "image" in err_text.lower() or "media" in err_text.lower() or "invalid" in err_text.lower():
            fallback_messages = [
                {"role": "user", "content": [{"type": "text", "text": query}]}
            ]
            chat_completion = client.chat.completions.create(messages=fallback_messages, model=model)
        else:
            raise

    return chat_completion.choices[0].message.content