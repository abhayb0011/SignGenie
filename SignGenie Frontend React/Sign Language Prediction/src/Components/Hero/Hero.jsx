import React from "react";
import "./Hero.css";
import heroImg from "../../assets/Images/HomeHeroImg.jpeg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleStartDetecting = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/detection");
    } else {
      alert("Please login to start detecting signs.");
    }
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Sign Language Recognition</h1>
            <h2>
              "Sign, Speak, Connect - Breaking Barriers with Every Gesture."
            </h2>
            <p>
              Bridge the gap between gestures and words with our AI-powered Sign
              Language Recognition app! Instantly translate hand signs into
              text, making communication seamless, inclusive, and accessible for
              everyone.
            </p>
            <div className="cta-container">
              <button className="cta-button primary" onClick={handleStartDetecting}>
                Start Detecting Signs
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <img src={heroImg} alt="Sign Language Communication" />
              <div className="image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
