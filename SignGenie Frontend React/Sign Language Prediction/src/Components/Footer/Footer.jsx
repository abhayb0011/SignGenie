import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/contact-us">Contact Us</Link>
          <div className="social-icons">
            <a href="#">
              <img
                src="./src/assets/Images/facebook logo.webp"
                alt="Facebook"
              />
            </a>
            <a href="#">
              <img src="./src/assets/Images/X logo.webp" alt="X" />
            </a>
            <a href="#">
              <img src="./src/assets/Images/insta.webp" alt="Instagram" />
            </a>
          </div>
        </div>
        <div className="copyright">
          <p>© {new Date().getFullYear()} SignGenie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
