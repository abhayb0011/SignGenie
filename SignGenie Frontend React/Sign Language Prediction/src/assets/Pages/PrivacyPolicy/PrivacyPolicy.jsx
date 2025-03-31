import React from "react";
import Navbar from "../../Components/Navbar/Navbar"
import Footer from '../../Components/Footer/Footer'
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="privacy-policy">
        <h1>Privacy Policy</h1>
        <p className="intro">
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your personal information when you use our
          Sign Language Recognition app.
        </p>

        <div className="policy-section">
          <h2>📌 Information We Collect</h2>
          <p>
            We may collect data such as images, hand gestures, and device
            information to improve our AI-powered sign recognition. We do not
            store or share personal data without your consent.
          </p>
        </div>

        <div className="policy-section">
          <h2>🔍 How We Use Your Information</h2>
          <p>
            The collected data is used solely for enhancing the sign detection
            accuracy. We ensure that all processing is secure and follows
            established privacy standards.
          </p>
        </div>

        <div className="policy-section">
          <h2>🔒 Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data
            from unauthorized access or misuse.
          </p>
        </div>

        <div className="policy-section">
          <h2>✅ Your Rights</h2>
          <p>
            You have the right to access, modify, or delete your data. If you have
            any concerns, please reach out to us.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
