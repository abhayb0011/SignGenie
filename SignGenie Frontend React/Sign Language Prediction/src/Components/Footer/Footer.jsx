import React from "react";
import { Link } from "react-router-dom";
import facebookLogo from "../../assets/Images/facebook logo.webp";
import instaLogo from "../../assets/Images/insta.webp";
import xLogo from "../../assets/Images/X logo.webp";
import "./Footer.css";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { isLoggedIn } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/detection">Live Detection</Link>
                  </li>
                  <li>
                    <Link to="/quiz">Quiz</Link>
                  </li>
                  <li>
                    <Link to="/dictionary">Dictionary</Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/dictionary">Dictionary</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/contact-us">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <img src={facebookLogo} alt="Facebook" />
              </a>
              <a href="#" className="social-icon">
                <img src={xLogo} alt="X" />
              </a>
              <a href="#" className="social-icon">
                <img src={instaLogo} alt="Instagram" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SignGenie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
