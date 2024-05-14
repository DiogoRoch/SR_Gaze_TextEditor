//https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand

// const { log } = require("console");

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

// Setting the ids of the output paragraphs
let outputs = ['output1', 'output2', 'output3', 'output4'];
let currentOutput = outputs[0]; // initialize output as the first of the list
let globalTexts = { // variable where we store the text for each paragraph
    'output1': '',
    'output2': '',
    'output3': '',
    'output4': ''
}


// Function for selecting text in a paragraph
function selectText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Function that handles the select function
function handleSelect(content) {
    let outputParagraph = document.getElementById(currentOutput);
    selectText(outputParagraph);
}

// Function that deletes the text
function deleteText(content) {
    globalTexts[currentOutput] = '';
    let outputParagraph = document.getElementById(currentOutput);
    outputParagraph.innerText = '';
}

// Function that sets the selected text as bold
function strongText(content) {
    const selection = window.getSelection().toString();
    let outputParagraph = document.getElementById(currentOutput);
    outputParagraph.innerHTML = outputParagraph.innerHTML.replace(selection, `<strong>${selection}</strong>`);
}

// Function that sets the selected text as italic
function italicText(content) {
    const selection = window.getSelection().toString();
    let outputParagraph = document.getElementById(currentOutput);
    outputParagraph.innerHTML = outputParagraph.innerHTML.replace(selection, `<i>${selection}</i>`);
}

// Function that switches to the next paragraph
function next(content) {
    if (currentOutput === outputs[outputs.length - 1]) {
        currentOutput = outputs[0];
    } else {currentOutput = outputs[outputs.indexOf(currentOutput) + 1];}
    console.log(currentOutput);
}

// Function that handles the speech_rec content and sets it as the inner text of the current paragraph
function handle_input(content) {
    console.log(content);
    globalTexts[currentOutput] = globalTexts[currentOutput] + content + ' ';
    console.log(globalTexts);
    let outputParagraph = document.getElementById(currentOutput);
    outputParagraph.innerText = globalTexts[currentOutput];
}

// Function that does nothing in case the command is not recognized
function no_command(content) {console.log('Command not recognized!')}

// Command dictionary with functions as values
commands = {
    'select': handleSelect,
    'delete': deleteText,
    'strong': strongText,
    'italic': italicText,
    'next': next,
    'type': handle_input,
    'none': no_command
}

// Function that handles the output from the speech_recognition api
function handle_recognized_text(data) {
    if (data.error) {}
    else if (data.command) {commands[data.command](data.content)}
}

// Function that fetches response from speech_recognition api
function get_recognized_text() {
    console.log('Click')
    fetch('/recognize')
        .then(response => response.json())
        .then(data => {handle_recognized_text(data)})
}


recButton.addEventListener('click', get_recognized_text)


// Define global variables for coordinates
let globalXprediction;
let globalYprediction;

// Set the gaze listener
webgazer.setGazeListener(function(data, elapsedTime) {
    if (data == null) {
        return;
    }
    // Update global coordinates
    globalXprediction = data.x; //these x coordinates are relative to the viewport
    globalYprediction = data.y; //these y coordinates are relative to the viewport
    console.log(globalXprediction, globalYprediction); //show coordinates in the console

    // Call the function to check coordinates
    checkCoordinates();
}).begin();

// Function to check if coordinates are within the box
function isWithinButton(x, y) {
    // Get the button element
    const button = document.getElementById('rec_button');
    // Get the position and dimensions of the button
    const buttonRect = button.getBoundingClientRect();
    // Check if coordinates are within the button
    if (x >= buttonRect.left && x <= buttonRect.right && y >= buttonRect.top && y <= buttonRect.bottom) {
        return true;
    } else {
        return false;
    }
}

// Function to execute when coordinates are within the box for 3 seconds
// The function to click at the coordinates : x = globalXprediction y = globalYprediction
let executed = false;
function executeFunction() {
    if (!executed) { // Check if the function has already been executed
        const button = document.getElementById('rec_button');
        button.click();
        console.log("Coordinates are within the button for 3 seconds!");
        // Your code to execute goes here
        executed = true; // Set executed to true to indicate that the function has been executed
            // Set a timeout to reset executed variable after 5 seconds
    setTimeout(() => {
        executed = false;
        console.log("Executed variable reset to false.");
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
                clearInterval(interval); // Stop the interval
                executeFunction(); // Execute the function
            }
        } else {
            clearInterval(interval); // Stop the interval if coordinates move out of the button
        }
    }, 1000); // Check every 1 second
}


webgazer.setTracker("TFFacemesh");
webgazer.setRegression("ridge");
// webgazer.util.bound(prediction);
// prediction.x; //now always in the bounds of the viewport
// prediction.y; //now always in the bounds of the viewport