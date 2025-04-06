import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import axios from "axios";
import "./UpdateProfile.css";

const UpdateProfile = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const [formData, setFormData] = useState({ name: "", username: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${baseURL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          name: res.data.name || "",
          username: res.data.username || "",
        });
      } catch (err) {
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        `${baseURL}/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(`${err.response.data.error}`);
      } else {
        setMessage("Failed to update profile. Try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="update-profile-container">
        <h2>Update Your Profile</h2>
        <form onSubmit={handleSubmit} className="update-form">
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </label>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
          </label>
          <button type="submit" className="submit-btn">
            Save Changes
          </button>
          {message && <p className="update-message">{message}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default UpdateProfile;
