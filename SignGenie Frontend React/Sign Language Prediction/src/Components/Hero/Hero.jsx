import React from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import heroImg from "../../assets/Images/HomeHeroImg.jpeg";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-image">
          <img
            src={heroImg}
            alt="Sign Language Communication"
          />
        </div>
        <h1>"Sign, Speak, Connect - Breaking Barriers with Every Gesture."</h1>
        <p>
          Bridge the gap between gestures and words with our AI-powered Sign
          Language Recognition app! Instantly translate hand signs into text,
          making communication seamless, inclusive, and accessible for everyone.
          Whether you're learning sign language, assisting a loved one, or
          breaking language barriers, Our smart technology ensures real-time,
          effortless interaction. Try it now and experience the future of
          communication!
        </p>
        <div class="cta-container">
          <button class="cta-button"><Link to="/detection">➜ Start Detecting Signs</Link></button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
