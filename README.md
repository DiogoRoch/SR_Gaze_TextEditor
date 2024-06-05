# SR_Gaze_TextEditor
## Authors
- Hannah Portmann
- Léandre Dubey
- Diogo Rocha

## Extra Resources
- Inside the directory "Report_and_Demo" you can find:
  - The final report of the project.
  - The demo of the application.

## Dependencies
- Python version used to run the app: Python 3.11.8.
- Install the libraries from the "requirements.txt" file.

## Warnings
- If using a macOS device, pyaudio won't be installed properly unless you first homebrew install portaudio (this is needed for the audio feedback)
- When using the app for the first time, you might have bugs with speech recognition since it will first need to pull the model from the library and locally install it on your environment.
  - You can check the state of the model installation through the python console.
  - After installation is done you can just reload the page and try again.

## Instructions
1. Launch the "main.py" file --> The flask server will start to run.
2. Go to your localhost address where the webpage is served.
3. Calibrate the eye tracking.
4. Press the "Hide Calibration" button to unveil the text editor.
5. Look at the recording button for 3 seconds to start speech recognition.
6. Announce your command and look at the paragraph where you want it to be applied (has to be fast, else the recognizer stops)
