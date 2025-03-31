import React from "react";
import Navbar from "../../Components/Navbar/Navbar"
import Footer from '../../Components/Footer/Footer'
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <>
      <Navbar />
      <div className="contact-us">
        <h1>Contact Us</h1>
        <p className="intro">
          Have questions or feedback? Reach out to us! We’d love to hear from you.
        </p>

        <div className="contact-info">
          <h2>📧 Get in Touch</h2>
          <p>Email: <a href="mailto:support@sign_genie.com">support@sign_genie.com</a></p>
          <p>Phone: <a href="tel:+91 373839373839">+91 373839373839</a></p>
        </div>

        <div className="team-section">
          <h2>🤝 Meet the Team</h2>
          <p>We are the minds behind this app, dedicated to breaking communication barriers.</p>
          <ul className="team-list">
            <li>🧑‍💻 <strong>Abhay Bhardwaj</strong></li>
            <li>🧑‍💻 <strong>Soham Dalui</strong></li>
            <li>🧑‍💻 <strong>Subhadeep Banik</strong></li>
          </ul>
        </div>

        <div className="contact-form">
          <h2>📝 Send Us a Message</h2>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;
