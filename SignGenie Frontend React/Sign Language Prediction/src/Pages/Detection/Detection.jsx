import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import "./Detection.css";

const Detection = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [prediction, setPrediction] = useState("Waiting...");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [lastSpokenWord, setLastSpokenWord] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isDetecting) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing webcam:", err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isDetecting]);

  useEffect(() => {
    let frameInterval;
    let displayInterval;
    let latestPrediction = "";
    let lastSavedPrediction = "";

    if (isDetecting) {
      frameInterval = setInterval(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (canvas && video) {
          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append("image", blob, "frame.jpg");

              const token = localStorage.getItem("token");

              axios
                .post(`${baseURL}/predict-frame`, formData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                  },
                })
                .then((response) => {
                  latestPrediction = response.data.prediction;
                })
                .catch((err) => {
                  if (err.response) {
                    console.error(
                      "Server responded with error:",
                      err.response.data
                    );
                  } else if (err.request) {
                    console.error(
                      "No response received from server. Request was:",
                      err.request
                    );
                  } else {
                    console.error("Error setting up request:", err.message);
                  }
                });
            }
          }, "image/jpeg");
        }
      }, 100);

      displayInterval = setInterval(() => {
        if (
          latestPrediction &&
          latestPrediction !== "Waiting for enough frames..."
        ) {
          setPrediction(latestPrediction);

          // Update speech
          if (isSpeechEnabled && latestPrediction !== lastSpokenWord) {
            speechSynthesis.cancel();
            speakText(latestPrediction);
            setLastSpokenWord(latestPrediction);
          }

          // Update sign history only if different from last saved one
          if (latestPrediction !== lastSavedPrediction) {
            lastSavedPrediction = latestPrediction;

            axios
              .post(
                `${baseURL}/sign-history`,
                { sign: latestPrediction },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                  },
                }
              )
              .catch((err) =>
                console.error("Error updating sign history:", err)
              );
          }
        }
      }, 1000); // update UI and sign history once per second
    } else {
      setPrediction("Waiting...");
      setLastSpokenWord("");
    }

    return () => {
      clearInterval(frameInterval);
      clearInterval(displayInterval);
    };
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
                <>
                  <video ref={videoRef} autoPlay muted className="video-box" />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </>
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
