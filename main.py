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
ERROR_PATH = os.path.realpath(os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "./data/error.wav"
))


def play_sound(filename):

    data, samplerate = sf.read(filename)
    sd.play(data, samplerate)

def recognize_command(rec_text, keywords):
    """
    This method goes through all words of the recognized text checks if they're in the keywords and 
    if true it returns it as the command and the rest of the text as the content
    """
    rec_text = rec_text.lstrip()
    split_text = rec_text.split(" ")
    command, content = "", ""

    if len(split_text) > 1:
        
        for word in split_text:
            formatted_word = "".join(letter for letter in word if letter.isalnum())
            formatted_word = formatted_word.lower()
            if formatted_word in keywords:
                command = formatted_word
                content = " ".join(split_text[split_text.index(word) + 1:])
                print('Command: ', command)
                print('Content: ', content)
                break
    
    else:
        command = "".join(letter for letter in split_text[0] if letter.isalnum())
        command = command.lower()

    if command in keywords:

        rec_command = command

        if len(split_text) > 1:
            rec_content = content
        else:
            rec_content = ''

        print(f"Command [{command}] successfully recognized !")
        return rec_command, rec_content

    else:
        print(f"Command {command} was not recognized")
        play_sound(ERROR_PATH)
        return 'none', ''


microphone = sr.Microphone()
recognizer = sr.Recognizer()
keywords = ["delete", "type", "strong", "italic", "small", "big", "underline", "strip", "update"]


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