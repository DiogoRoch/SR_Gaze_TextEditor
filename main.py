from flask import Flask, render_template, jsonify
import os
import speech_recognition as sr
import soundfile as sf
import sounddevice as sd

app = Flask(__name__)


CUE_IN_PATH = os.path.realpath(os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "./data/cue_intro.wav"
))
CUE_OUT_PATH = os.path.realpath(os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "./data/cue_outro.wav"
))
SYNC_FILE = os.path.realpath(os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "./data/cloudsync.wav"
))



def play_sound(filename):

    data, samplerate = sf.read(filename)
    sd.play(data, samplerate)


def recognize_command(rec_text, keywords):
    """
    This method splits the recognized text into the first word and the rest
    It then cleans the first word and stores it as self.command and stores the rest of the text as self.content
    """
    rec_text = rec_text.lstrip()
    split_text = rec_text.split(" ", 1)
    rec_command, rec_content = "", ""

    if len(split_text) > 1:
        first_word, rest = split_text # Splits on the first encountered space (so the first word can keep special characters and needs to be cleaned)
        command = "".join(letter for letter in first_word if letter.isalnum()) # This makes a new string and joins letters if they're either alphabetic or numeric
        command = command.lower() # This converts the command into lower case, optimizes the comparisons
    
    else:
        command = "".join(letter for letter in split_text[0] if letter.isalnum())
        command = command.lower()

    if command in keywords:

        rec_command = command

        if len(split_text) > 1:
            rec_content = rest
        else:
            rec_content = ''

        print(f"Command [{command}] successfully recognized !")
        return rec_command, rec_content

    else:
        print(f"Command [{command}] was not recognized")
        return 'none', ''


microphone = sr.Microphone()
recognizer = sr.Recognizer()
keywords = ["insert", "delete", "type", "select", "click", "strong", "italic"]


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/recognize', methods=['GET' ,'POST'])
def recognize_speech():

    with microphone as source:

        # Calibrate recognizer
        print('Calibrating...')
        recognizer.adjust_for_ambient_noise(source)
        print('...Done')

        play_sound(CUE_IN_PATH)
        print("Say something...")
        audio = recognizer.listen(source)

    try:
        recognized_text = recognizer.recognize_whisper(audio, language='english')
        print(f"Whisper thinks you said: {recognized_text}")
        play_sound(CUE_OUT_PATH)
        command, content = recognize_command(recognized_text, keywords)
        return jsonify({'command': command, 'content': content})
    except sr.UnknownValueError:
        return jsonify({'error': 'Speech recognition could not understand audio'})
    except sr.RequestError as e:
        return jsonify({'error': f"Speech recognition error: {e}"})


if __name__ == '__main__':
    app.run(debug=True)