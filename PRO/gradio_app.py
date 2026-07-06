# if you dont use pipenv uncomment the following:
import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

#VoiceBot UI with Gradio
import gradio as gr

from brain_of_the_doctor import analyze_image_with_query
from voice_of_the_patient import record_audio, transcribe_with_groq
from voice_of_the_doctor import text_to_speech_with_gtts, text_to_speech_with_elevenlabs

system_prompt="""You have to act as a professional doctor, i know you are not but this is for learning purpose. 
            What's in this image?. Do you find anything wrong with it medically? 
            If you make a differential, suggest some remedies for them. Donot add any numbers or special characters in 
            your response. Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
            Donot say 'In the image I see' but say 'With what I see, I think you have ....'
            Dont respond as an AI model in markdown, your answer should mimic that of an actual doctor not an AI bot, 
            Keep your answer concise (max 2 sentences). No preamble, start your answer right away please"""


def process_inputs(audio_filepath, image_filepath):
    try:
        # Transcribe audio only if provided
        if audio_filepath:
            speech_to_text_output = transcribe_with_groq(
                stt_model="whisper-large-v3",
                audio_filepath=audio_filepath,
                GROQ_API_KEY=os.environ.get("GROQ_API_KEY"),
            )
        else:
            speech_to_text_output = ""

        # Handle the image input
        if image_filepath:
            # pass the filepath (or URL) directly; analyzer will upload local files if needed
            doctor_response = analyze_image_with_query(
                query=system_prompt + (speech_to_text_output or ""),
                encoded_image_or_path=image_filepath,
                model="meta-llama/llama-4-scout-17b-16e-instruct",
            )
        else:
            doctor_response = "No image provided for me to analyze"

        # Generate TTS (returns a filepath)
        try:
            import tempfile
            # Create output filepath in a temp directory
            temp_dir = tempfile.gettempdir()
            output_audio_path = os.path.join(temp_dir, "final.mp3")
            voice_of_doctor = text_to_speech_with_elevenlabs(input_text=doctor_response, output_filepath=output_audio_path)
        except Exception as tts_error:
            # fallback: return empty string for audio output if TTS fails
            print(f"TTS Error: {tts_error}")
            voice_of_doctor = ""

        return speech_to_text_output or "", doctor_response or "", voice_of_doctor

    except Exception as e:
        # Log traceback to the server terminal for debugging
        import traceback

        tb = traceback.format_exc()
        print(tb)
        err_msg = f"Error: {e}"
        # Return human-readable errors to the UI instead of Gradio's generic 'Error'
        return err_msg, err_msg, ""


# Create the interface
iface = gr.Interface(
    fn=process_inputs,
    inputs=[
        gr.Audio(sources=["microphone"], type="filepath"),
        gr.Image(type="filepath")
    ],
    outputs=[
        gr.Textbox(label="Speech to Text"),
        gr.Textbox(label="Doctor's Response"),
        gr.Audio("Temp.mp3")
    ],
    title="AI Doctor with Vision and Voice"
)

if __name__ == "__main__":
    iface.launch(debug=True)

#http://127.0.0.1:7862