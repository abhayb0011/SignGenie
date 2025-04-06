import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"
import Home from "./Pages/Home/Home";
import Detection from "./Pages/Detection/Detection"
import Quiz from './Pages/Quiz/Quiz'
import Dictionary from './Pages/Dictionary/Dictionary'
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy'
import ContactUs from './Pages/ContactUs/ContactUs'
import SignUp from './Pages/SignUp/SignUp'
import Login from './Pages/Login/Login'
import Profile from "./Pages/Profile/Profile";
import UpdateProfile from "./Pages/UpdateProfile/UpdateProfile";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/detection" element={<Detection />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
  );
}

export default App;
