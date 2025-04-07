import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // assuming token is stored here

    if (!token) {
      setStatus("Please login to send a message.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", message: "" });
      } else {
        setStatus(data.error || "Something went wrong.");
      }
    } catch (error) {
      setStatus("Failed to send message. Please try again.");
      console.error("Error sending message:", error);
    }
  };

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
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <button type="submit">Send Message</button>
          </form>
          {status && <p className="status-message">{status}</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;