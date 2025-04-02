import React, { useState, useEffect } from "react";
import "./Quiz.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TimerIcon from "@mui/icons-material/Timer";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [prediction, setPrediction] = useState("Waiting...");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

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

  const fetchQuizQuestions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/signs");
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  };

  useEffect(() => {
    let interval;

    if (isDetecting) {
      interval = setInterval(async () => {
        try {
          const response = await fetch("http://127.0.0.1:5000/prediction", {
            cache: "no-store",
          });
          if (!response.ok) throw new Error("Failed to fetch prediction");
          const data = await response.json();
          if (!data || !data.prediction)
            throw new Error("Invalid response format");

          const detectedSign = data.prediction;
          setPrediction(detectedSign);

          if (!questions.length) return;
          const correctAnswer = questions[currentQuestion]?.sign_name || "";

          if (detectedSign.toLowerCase() === correctAnswer.toLowerCase()) {
            setUserAnswer(true);
            setFeedback("🎉 Correct! Well done!");
            setIsDetecting(false);
            setIsTimerActive(false);
            setScore((prev) => prev + 1);
          } else {
            setUserAnswer(false);
            setFeedback("❌ Incorrect! Try again.");
          }
        } catch (error) {
          console.error("Error fetching prediction:", error);
          setFeedback("⚠️ Could not fetch prediction.");
        }
      }, 1500);
    } else {
      setPrediction("Waiting...");
    }

    return () => clearInterval(interval);
  }, [isDetecting, questions, currentQuestion]);

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

  const nextQuestion = () => {
    setFeedback("");
    setUserAnswer(null);
    setPrediction("Waiting...");
    setTimeLeft(30);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert(`🎉 Quiz Completed! Your score: ${score}/${questions.length}`);
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
                    src={`http://127.0.0.1:5000/${questions[currentQuestion].image_url}`}
                    alt="Sign Example"
                    className="sign-image"
                  />
                  <div className="image-overlay"></div>
                </div>
              </div>

              <div className="video-section">
                {isDetecting ? (
                  <img
                    src="http://127.0.0.1:5000/video"
                    alt="Live Video Stream"
                    className="webcam-feed"
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

              <div className="controls-section">
                <div className="detection-controls">
                  <button
                    className={`control-button ${isDetecting ? "active" : ""}`}
                    onClick={isDetecting ? stopDetection : startDetection}
                    disabled={isTimerActive && timeLeft === 0}
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
