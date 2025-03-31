import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; 
import CustomButton from "../CustomButton/CustomButton"; 
import MenuIcon from "@mui/icons-material/Menu"; 
import HomeIcon from "@mui/icons-material/Home"; 
import logo from "../../assets/Images/logo_Sign_Language_Prediction.jpg";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo-container">
        <img src= {logo} alt="SignApp Logo" className="logo" />
        <span className="app-name">SignGenie</span>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><Link to="/"><CustomButton text="Home" icon={HomeIcon} /></Link></li>
        <li><Link to="/detection"><CustomButton text="Live Detection" /></Link></li>
        <li><Link to="/quiz"><CustomButton text="Quiz" /></Link></li>
        <li><Link to="/dictionary"><CustomButton text="Dictionary" /></Link></li>
      </ul>

      {/* Hamburger Menu Button */}
      <div className="toggle-menu" onClick={toggleMenu}>
        <MenuIcon fontSize="large" />
      </div>
    </nav>
  );
};

export default Navbar;
