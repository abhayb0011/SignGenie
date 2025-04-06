import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import "./Profile.css";

const Profile = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return navigate("/login");

    axios
      .get(`${baseURL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        navigate("/login");
      });
  }, [navigate]);

  if (!profile) {
    return (
      <div className="profile-loading">
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-wrapper">
        <div className="profile-card">
          <h2 className="profile-title">
            👋 Welcome, {profile.name || profile.username}!
          </h2>

          <div className="profile-info">
            {/* Full Name */}
            <div className="profile-box">
              <PersonIcon className="profile-icon" />
              <div className="box-label">Full Name</div>
              <div className="box-value">{profile.name || "N/A"}</div>
            </div>

            {/* Username */}
            <div className="profile-box">
              <AccountCircleIcon className="profile-icon" />
              <div className="box-label">Username</div>
              <div className="box-value">{profile.username}</div>
            </div>

            {/* Email */}
            <div className="profile-box">
              <EmailIcon className="profile-icon" />
              <div className="box-label">Email</div>
              <div className="box-value">{profile.email}</div>
            </div>

            {/* Quiz High Score */}
            <div className="profile-box">
              <EmojiEventsIcon className="profile-icon" />
              <div className="box-label">Quiz High Score</div>
              <div className="box-value">{profile.quiz_high_score}</div>
            </div>

            {/* Signs Practiced */}
            <div className="profile-box">
              <span className="emoji">🖐️</span>
              <div className="box-label">Signs Practiced</div>
              <div className="box-value">
                {profile.sign_history.length > 0 ? (
                  <ul className="sign-history-list">
                    {profile.sign_history.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                ) : (
                  <span>No sign history</span>
                )}
              </div>
            </div>

            {/* Joined Date */}
            <div className="profile-box">
              <CalendarMonthIcon className="profile-icon" />
              <div className="box-label">Joined On</div>
              <div className="box-value">
                {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <button
            className="update-profile-btn"
            onClick={() => navigate("/update-profile")}
          >
            ✏️ Update Profile
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
