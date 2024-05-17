////////// Start of Constants and Variable Declarations //////////
let globalXprediction;
let globalYprediction;
let outputParagraph;
const outputs = ['output1', 'output2', 'output3', 'output4']; // to check if we are looking at an output

let globalTexts = { // variable where we store the text for each paragraph
    'output1': "The story of Sharky the toothbrusher ",
    'output2': "In the deep sea, there was a special boy named Sharky. He didn't want to be like other sea kids; he dreamed of being a toothbrusher. But his dad, a big shark, had different plans. He wanted Sharky to be the strongest and beat the king, Squiddy the first. ",
    'output3': "100g of cheese, 2L of milk, 12 eggs, 2 cucumbers, 1 salad, 4 yogurts, 1 big brown bread, 400g of beef meat, 400g of butter, 2k of sugar, 300g of strawberries, 1 bottle of ketchup ",
    'output4': "Even with his dad pushing him to do something else, Sharky stuck to his dream. He loved brushing teeth and wanted to make everyone's smile sparkle. And that's how Sharky's journey to be the best toothbrusher in the sea began. "
}
////////// End of Constants and Variable Declarations //////////


////////// Speech_Rec Starts Here //////////
//setting functioning of buttons (bold etc) to format text
function formatDoc(cmd, value=null) {
    if(value) {
        document.execCommand(cmd, false, value);
    } else {
        document.execCommand(cmd);
    }
}

// function for file selector 
function fileHandle(value) {
    if(value === 'new') {
        content.innerHTML = '';
        filename.value = 'untitled';
    } else if(value === 'pdf') {
        html2pdf(content).save(filename.value);
    }
}

// Getting the button that activates 
const recButton = document.getElementById('rec_button');


// Function for selecting text in a paragraph
function selectText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Function that handles the select function
function handleSelect(outputParagraph) {
    selectText(outputParagraph);
}

// Function that deletes the text
function deleteText(content, outputParagraph) {
    globalTexts[outputParagraph.id] = '';
    outputParagraph.innerText = '';
}

// Function that sets the selected text as bold
function strongText(content, outputParagraph) {
    handleSelect(outputParagraph);
    const selection = window.getSelection().toString();
    outputParagraph.innerHTML = outputParagraph.innerHTML.replace(selection, `<strong>${selection}</strong>`);
}

// Function that sets the selected text as italic
function italicText(content, outputParagraph) {
    handleSelect(outputParagraph);
    const selection = window.getSelection().toString();
    outputParagraph.innerHTML = outputParagraph.innerHTML.replace(selection, `<i>${selection}</i>`);
}

// Function that sets the selected text as small font size
function smallText(content, outputParagraph) {
    handleSelect(outputParagraph);
    const selection = window.getSelection().toString();
    outputParagraph.innerHTML = outputParagraph.innerHTML.replace(selection, `<font size='5'>${selection}</font>`);
}

// Function that sets the selected text as big font size
function bigText(content, outputParagraph) {
    handleSelect(outputParagraph);
    const selection = window.getSelection().toString();
    outputParagraph.innerHTML = outputParagraph.innerHTML.replace(selection, `<font size='6'>${selection}</font>`);
}

// Function that sets the selected text as big font size
function underlineText(content, outputParagraph) {
    handleSelect(outputParagraph);
    const selection = window.getSelection().toString();
    outputParagraph.innerHTML = outputParagraph.innerHTML.replace(selection, `<u>${selection}</u>`);
}

// Function that strips the text of all formatting
function stripText(content, outputParagraph) {
    outputParagraph.innerText = globalTexts[outputParagraph.id];
}

// Function that handles the speech_rec content and sets it as the inner text of the current paragraph
function handle_input(content, outputParagraph) {
    console.log(content);
    globalTexts[outputParagraph.id] = globalTexts[outputParagraph.id] + content + ' ';
    console.log(globalTexts);
    outputParagraph.innerText = globalTexts[outputParagraph.id];
}


// Function that does nothing in case the command is not recognized
function no_command(content, outputParagraph) {console.log('Command not recognized!')}

// Command dictionary with functions as values
commands = {
    'delete': deleteText,
    'strong': strongText,
    'italic': italicText,
    'type': handle_input,
    'small': smallText,
    'big': bigText,
    'underline': underlineText,
    'strip': stripText,
    'none': no_command
}

// Function that handles the output from the speech_recognition api
function handle_recognized_text(data) {
    if (data.error) {}
    else if (data.command) {
        outputParagraph = null;
        outputParagraph = document.elementFromPoint(globalXprediction, globalYprediction);
        if (outputParagraph) {
            console.log('Output ID: ', outputParagraph.id);
            if (outputs.includes(outputParagraph.id)) {
                commands[data.command](data.content, outputParagraph);
            } else {
                console.log('Element is not in outputs.');
                get_recognized_text();
            }
        } else {console.log('No output found.')}
    }
}

// Function that fetches response from speech_recognition api
function get_recognized_text() {
    console.log('Click')
    fetch('/recognize')
        .then(response => response.json())
        .then(data => {handle_recognized_text(data)})
}


//recButton.addEventListener('click', get_recognized_text)
////////// Speech_Rec Ends Here //////////


////////// Button fixation Starts Here //////////

// Function to check if coordinates are within the box
function isWithinButton(x, y) {
    // Get the button element
    const button = document.getElementById('rec_button');
    // Get the position and dimensions of the button
    const buttonRect = button.getBoundingClientRect();
    // Check if coordinates are within the button
    return x >= buttonRect.left && x <= buttonRect.right && y >= buttonRect.top && y <= buttonRect.bottom;
}

// Function to execute when coordinates are within the box for 3 seconds
// The function to click at the coordinates: x = globalXprediction y = globalYprediction
let executed = false;
function executeFunction() {
    if (!executed) { // Check if function already been executed
        console.log('Coordinates are within the button for 3 seconds!');
        // The code to execute goes here
        get_recognized_text();
        executed = true;
        setTimeout(() => {
            executed = false;
            console.log('Executed variable reset to false.');
        }, 5000);
    }
}

// Main function to continuously check if coordinates are within the box for 3 seconds
function checkCoordinates() {
    let timeElapsed = 0;
    const interval = setInterval(() => {
        timeElapsed += 1000; // Increase timeElapsed by 1 second
        if (isWithinButton(globalXprediction, globalYprediction)) {
            if (timeElapsed >= 3000) { // If within button for 3 seconds
                clearInterval(interval); // Clears the interval (deletes it I think)
                executeFunction(); // Execute the function
            }
        } else {
            clearInterval(interval); // Clears the interval if coordinates move out of the button
        }
    }, 1000); // Check every 1 second
}
////////// Button fixation Ends Here //////////


////////// Main code Starts Here //////////
window.onload = async function() {
    
    console.log('Window loaded');
    
    //start the webgazer tracker
    await webgazer.setRegression('ridge') /* currently must set regression and tracker */
        //.setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {
            ////////// Our code Starts Here //////////
            if (data !== null) {
                globalXprediction = data.x;
                globalYprediction = data.y;
                checkCoordinates();
            }
            ////////// Our code Ends Here //////////
          //   console.log(data); /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
          //   console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
        })
        .saveDataAcrossSessions(true)
        .begin();
        webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

    //Set up the webgazer video feedback.
    var setup = function() {

        //Set up the main canvas. The main canvas is used to calibrate the webgazer.
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
    };
    setup();

};

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function() {
    webgazer.end();
}

/**
 * Restart the calibration process by clearing the local storage and reseting the calibration point
 */
function Restart(){
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}
////////// Main code Ends Here //////////