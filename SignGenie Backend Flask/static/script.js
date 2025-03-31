let ttsEnabled = false; // Track if TTS is enabled
let lastSpokenWord = ""; // Store the last spoken word

// Function to toggle menu for mobile devices
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = (navLinks.style.display === 'flex') ? 'none' : 'flex';
}

// Function to open camera and start video stream
function openCamera() {
    const videoFeed = document.getElementById('video-feed');
    
    // Show video
    videoFeed.src = "/video"; // Load the video stream from Flask route
    videoFeed.style.display = "block"; 

    // Start fetching predictions every second
    setInterval(fetchPrediction, 1000);
}

// Function to fetch and update predicted text
function fetchPrediction() {
    fetch('/prediction')
        .then(response => response.json())
        .then(data => {
            const predictionBox = document.getElementById('prediction-text');
            const predictedWord = data.prediction;

            // Update the UI
            predictionBox.innerText = `Predicted: ${predictedWord}`;

            // Speak the text only if TTS is enabled and it's a new word
            if (ttsEnabled && predictedWord && predictedWord !== "Waiting..." && predictedWord !== lastSpokenWord) {
                speakText(predictedWord);
                lastSpokenWord = predictedWord; // Update last spoken word
            }
        })
        .catch(error => {
            console.error("Error fetching prediction:", error);
        });
}

// Function to convert text to speech using Google API
function speakText(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Set language
    utterance.rate = 1; // Normal speech rate
    synth.speak(utterance);
}

// Toggle TTS when the button is clicked
document.getElementById('tts-button').addEventListener('click', function() {
    ttsEnabled = !ttsEnabled;
    this.innerText = ttsEnabled ? "Disable Voice" : "Enable Voice"; // Update button text
});
