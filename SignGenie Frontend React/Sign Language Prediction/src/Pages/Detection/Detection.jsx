import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
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
        fetch("http://127.0.0.1:5000/prediction")
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
    <div className="detection-page">
      <Navbar />
      <main className="detection-main">
        <div className="detection-container">
          <h1 className="detection-title">Live Sign Language Detection</h1>
          <p className="detection-subtitle">
            Use your camera to detect and translate sign language in real-time
          </p>

          <div className="detection-content">
            <div className="video-container">
              {isDetecting ? (
                <img
                  src="http://127.0.0.1:5000/video"
                  alt="Live Video Stream"
                  className="video-box"
                />
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-content">
                    <p>Camera is Off</p>
                    <p className="placeholder-subtext">
                      Click Start Detection to begin
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="prediction-output">
              <h2>Predicted Text</h2>
              <div className="predicted-text-container">
                <p className="predicted-text">{prediction}</p>
              </div>
            </div>

            <div className="controls">
              <button
                className={`control-button ${isDetecting ? "active" : ""}`}
                onClick={() => setIsDetecting(!isDetecting)}
              >
                {isDetecting ? (
                  <>
                    <StopIcon /> Stop Detection
                  </>
                ) : (
                  <>
                    <PlayArrowIcon /> Start Detection
                  </>
                )}
              </button>

              <button
                className={`control-button speech ${
                  isSpeechEnabled ? "active" : ""
                }`}
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              >
                <VolumeUpIcon />
                {isSpeechEnabled ? "Disable Speech" : "Enable Speech"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Detection;
