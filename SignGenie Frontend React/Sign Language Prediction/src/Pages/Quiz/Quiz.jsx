import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Quiz.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TimerIcon from "@mui/icons-material/Timer";

const Quiz = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [prediction, setPrediction] = useState("Waiting...");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      const response = await axios.get(`${baseURL}/signs`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
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
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isDetecting]);

  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      setIsDetecting(false);
      setFeedback("⏰ Time's up! Try again.");
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    let frameInterval;
    let displayInterval;
    let latestPrediction = "";

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
                .catch((err) =>
                  console.error("Error sending frame for prediction:", err)
                );
            }
          }, "image/jpeg");
        }
      }, 30);

      displayInterval = setInterval(() => {
        const correctAnswer = questions[currentQuestion]?.sign_name || "";

        if (
          latestPrediction &&
          correctAnswer &&
          latestPrediction.toLowerCase() === correctAnswer.toLowerCase()
        ) {
          setUserAnswer(true);
          setFeedback("🎉 Correct! Well done!");
          setIsDetecting(false);
          setIsTimerActive(false);
          setScore((prev) => prev + 1);
        } else if (
          latestPrediction &&
          latestPrediction !== "Waiting for enough frames..."
        ) {
          setUserAnswer(false);
          setFeedback("❌ Incorrect! Try again.");
        }

        if (
          latestPrediction &&
          latestPrediction !== "Waiting for enough frames..."
        ) {
          setPrediction(latestPrediction);
        }
      }, 1000);
    } else {
      setPrediction("Waiting...");
    }

    return () => {
      clearInterval(frameInterval);
      clearInterval(displayInterval);
    };
  }, [isDetecting, currentQuestion, questions]);

  const startDetection = () => {
    setIsDetecting(true);
    setIsTimerActive(true);
    setTimeLeft(30);
    setFeedback("Detecting...");
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setIsTimerActive(false);
    setFeedback("Detection stopped.");
  };

  const updateHighScore = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${baseURL}/update-high-score`,
        { score }, // send the final score
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error updating high score:", error);
    }
  };

  const nextQuestion = () => {
    setFeedback("");
    setUserAnswer(null);
    setPrediction("Waiting...");
    setTimeLeft(30);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      updateHighScore();
    } else {
      alert(`🎉 Quiz Completed! Your score: ${score}/${questions.length}`);
      updateHighScore();
    }
  };

  return (
    <div className="quiz-page">
      <Navbar />
      <main className="quiz-main">
        <div className="quiz-container">
          <div className="quiz-header">
            <h1>Sign Language Quiz</h1>
            <div className="quiz-stats">
              <div className="stat-item">
                <EmojiEventsIcon />
                <span>Score: {score}</span>
              </div>
              <div className="stat-item">
                <TimerIcon />
                <span>Time: {timeLeft}s</span>
              </div>
            </div>
          </div>

          {questions.length > 0 ? (
            <div className="quiz-content">
              <div className="question-section">
                <h2>Perform this Sign:</h2>
                <div className="sign-name">
                  {questions[currentQuestion].sign_name}
                </div>
                <div className="sign-image-container">
                  <img
                    src={`${baseURL}/${questions[currentQuestion].image_url}`}
                    alt="Sign Example"
                    className="sign-image"
                  />
                  <div className="image-overlay"></div>
                </div>
              </div>

              <div className="video-section">
                {isDetecting ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="webcam-feed"
                    />
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

              <div className="controls-section">
                <div className="detection-controls">
                  <button
                    className={`control-button ${isDetecting ? "active" : ""}`}
                    onClick={() => {
                      if (isDetecting) {
                        // Stop detection and clean up camera stream
                        if (videoRef.current && videoRef.current.srcObject) {
                          videoRef.current.srcObject
                            .getTracks()
                            .forEach((track) => track.stop());
                          videoRef.current.srcObject = null;
                        }
                        setIsDetecting(false);
                        setIsTimerActive(false);
                        setFeedback("Detection stopped.");
                      } else {
                        setIsDetecting(true);
                        setIsTimerActive(true);
                        setTimeLeft(30);
                        setFeedback("Detecting...");
                      }
                    }}
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
                </div>

                <div className="prediction-section">
                  <div className="prediction-box">
                    <h3>Your Sign:</h3>
                    <p className="prediction-text">{prediction}</p>
                  </div>
                  {feedback && (
                    <div
                      className={`feedback ${
                        userAnswer ? "correct" : "incorrect"
                      }`}
                    >
                      {feedback}
                    </div>
                  )}
                </div>

                <button className="next-button" onClick={nextQuestion}>
                  Next Question <ArrowForwardIcon />
                </button>
              </div>
            </div>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading questions...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;
