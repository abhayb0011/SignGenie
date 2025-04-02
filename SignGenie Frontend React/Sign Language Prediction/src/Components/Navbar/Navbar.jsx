import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import CustomButton from "../CustomButton/CustomButton";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import logo from "../../assets/Images/logo Sign Language Prediction.jpg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="SignApp Logo" className="logo" />
          <span className="app-name">SignGenie</span>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              <CustomButton text="Home" />
            </Link>
          </li>
          <li>
            <Link
              to="/detection"
              className={location.pathname === "/detection" ? "active" : ""}
            >
              <CustomButton text="Live Detection" />
            </Link>
          </li>
          <li>
            <Link
              to="/quiz"
              className={location.pathname === "/quiz" ? "active" : ""}
            >
              <CustomButton text="Quiz" />
            </Link>
          </li>
          <li>
            <Link
              to="/dictionary"
              className={location.pathname === "/dictionary" ? "active" : ""}
            >
              <CustomButton text="Dictionary" />
            </Link>
          </li>
        </ul>

        {/* Hamburger Menu Button */}
        <div className="toggle-menu" onClick={toggleMenu}>
          <MenuIcon fontSize="large" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
