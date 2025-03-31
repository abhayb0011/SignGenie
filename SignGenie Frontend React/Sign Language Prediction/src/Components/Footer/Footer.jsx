import React from "react";
import { Link } from "react-router-dom";
import facebookLogo from "../../assets/Images/facebook logo.webp";
import instaLogo from "../../assets/Images/insta.webp";
import xLogo from "../../assets/Images/X logo.webp";

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
                src={facebookLogo}
                alt="Facebook"
              />
            </a>
            <a href="#">
              <img src={xLogo} alt="X" />
            </a>
            <a href="#">
              <img src={instaLogo} alt="Instagram" />
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
