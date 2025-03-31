import React, { useState, useEffect } from "react";
import "./Quiz.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [prediction, setPrediction] = useState("Waiting...");

  // Fetch quiz questions from Flask backend
  useEffect(() => {
    fetchQuizQuestions();
  }, []);

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

  // Continuous detection loop
  useEffect(() => {
    let interval;

    if (isDetecting) {
      interval = setInterval(async () => {
        try {
          const response = await fetch("http://127.0.0.1:5000/prediction", { cache: "no-store" });
          if (!response.ok) throw new Error("Failed to fetch prediction");
          const data = await response.json();
          if (!data || !data.prediction) throw new Error("Invalid response format");

          const detectedSign = data.prediction;
          setPrediction(detectedSign);

          if (!questions.length) return;
          const correctAnswer = questions[currentQuestion]?.sign_name || "";

          if (detectedSign.toLowerCase() === correctAnswer.toLowerCase()) {
            setUserAnswer(true);
            setFeedback("✅ Correct!");
            setIsDetecting(false);
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
    setFeedback("Detecting...");
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setFeedback("Detection stopped.");
  };

  const nextQuestion = () => {
    setFeedback("");
    setUserAnswer(null);
    setPrediction("Waiting...");
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert("🎉 Quiz Completed!");
    }
  };

  return (
    <div className="quiz-page">
      <Navbar />
      <div className="quiz-container">
        <h1>Sign Language Quiz</h1>

        {questions.length > 0 ? (
          <>
            <div className="question-section">
              <h2>
                Perform this Sign:{" "}
                <span>{questions[currentQuestion].sign_name}</span>
              </h2>
              <img
                src={`http://127.0.0.1:5000/${questions[currentQuestion].image_url}`}
                alt="Sign Example"
                className="sign-image"
              />
            </div>

            <div className="video-section">
              {isDetecting ? (
                <img
                  src="http://127.0.0.1:5000/video"
                  alt="Live Video Stream"
                  className="webcam-feed"
                />
              ) : (
                <div className="video-placeholder">Camera is Off</div>
              )}
            </div>

            <div className="detection-controls">
              <button
                className="start-btn"
                onClick={startDetection}
                disabled={isDetecting}
              >
                Start Detection
              </button>
              <button
                className="stop-btn"
                onClick={stopDetection}
                disabled={!isDetecting}
              >
                Stop Detection
              </button>
            </div>

            <p className="prediction-text">Prediction: {prediction}</p>
            {feedback && <p className="feedback">{feedback}</p>}

            <button className="next-btn" onClick={nextQuestion}>
              Next Question
            </button>
          </>
        ) : (
          <p>Loading questions...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Quiz;
