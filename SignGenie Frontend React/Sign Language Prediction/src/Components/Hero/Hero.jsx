import React from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import heroImg from "../../assets/Images/HomeHeroImg.jpeg";

const Hero = () => {
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
              <button className="cta-button primary">
                <Link to="/detection">Start Detecting Signs</Link>
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
