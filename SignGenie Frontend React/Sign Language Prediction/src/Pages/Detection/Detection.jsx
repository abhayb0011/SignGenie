import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import VolumeUpIcon from "@mui/icons-material/VolumeUp"; // Importing Material UI Icon
import "./Detection.css";

const Detection = () => {
  const [prediction, setPrediction] = useState("Waiting...");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [lastSpokenWord, setLastSpokenWord] = useState("");

  // Function to convert text to speech
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Set language
      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech Synthesis not supported in this browser.");
    }
  };

  useEffect(() => {
    let interval;

    if (isDetecting) {
      interval = setInterval(() => {
        fetch("https://signgenie.onrender.com/prediction")
          .then((res) => res.json())
          .then((data) => {
            const newWord = data.prediction;
            setPrediction(newWord);

            // Speak only if speech is enabled and the word has changed
            if (isSpeechEnabled && newWord !== lastSpokenWord) {
              speakText(newWord);
              setLastSpokenWord(newWord);
            }
          })
          .catch((err) => console.error("Error fetching prediction:", err));
      }, 1000); // Fetch predictions every second
    } else {
      setPrediction("Waiting...");
      setLastSpokenWord(""); // Reset spoken word when detection stops
    }

    return () => clearInterval(interval);
  }, [isDetecting, isSpeechEnabled, lastSpokenWord]);

  return (
    <>
      <Navbar />
      <div className="detection-container">
        <h1 className="title">Live Sign Language Detection</h1>

        <div className="video-container">
          {isDetecting ? (
            <img
              src="https://signgenie.onrender.com/video"
              alt="Live Video Stream"
              className="video-box"
            />
          ) : (
            <div className="video-placeholder">Camera is Off</div>
          )}
        </div>

        <div className="controls">
          <button
            className="detect-btn"
            onClick={() => setIsDetecting(!isDetecting)}
          >
            {isDetecting ? "Stop Detection" : "Start Detection"}
          </button>

          <button
            className={`speech-btn ${isSpeechEnabled ? "active" : ""}`}
            onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
          >
            <VolumeUpIcon /> {/* Voice icon for text to speech */}
          </button>
        </div>

        <div className="prediction-output">
          <h2>Predicted Text:</h2>
          <div className="predicted-text-container">
            <p className="predicted-text">{prediction}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Detection;
