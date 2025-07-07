import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import CustomButton from "../CustomButton/CustomButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../../assets/Images/logo Sign Language Prediction.jpg";
import { useAuth } from "../../Context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location, setIsLoggedIn]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

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
          {isLoggedIn ? (
            <>
              <li onClick={() => setIsOpen(false)}>
                <Link
                  to="/"
                  className={location.pathname === "/" ? "active" : ""}
                >
                  <CustomButton text="Home" />
                </Link>
              </li>
              <li onClick={() => setIsOpen(false)}>
                <Link
                  to="/detection"
                  className={location.pathname === "/detection" ? "active" : ""}
                >
                  <CustomButton text="Live Detection" />
                </Link>
              </li>
              <li onClick={() => setIsOpen(false)}>
                <Link
                  to="/quiz"
                  className={location.pathname === "/quiz" ? "active" : ""}
                >
                  <CustomButton text="Quiz" />
                </Link>
              </li>
              <li onClick={() => setIsOpen(false)}>
                <Link
                  to="/dictionary"
                  className={
                    location.pathname === "/dictionary" ? "active" : ""
                  }
                >
                  <CustomButton text="Dictionary" />
                </Link>
              </li>
              <li
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <button className="logout-button">
                  <CustomButton text="Logout" />
                </button>
              </li>
              <li onClick={() => setIsOpen(false)}>
                <Link
                  to="/profile"
                  className={location.pathname === "/profile" ? "active" : ""}
                >
                  <div className="profile-icon">
                    <AccountCircleIcon fontSize="large" />
                  </div>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li onClick={() => setIsOpen(false)}>
                <Link
                  to="/login"
                  className={location.pathname === "/login" ? "active" : ""}
                >
                  <CustomButton text="Login" />
                </Link>
              </li>
              <li onClick={() => setIsOpen(false)}>
                <Link
                  to="/signup"
                  className={location.pathname === "/signup" ? "active" : ""}
                >
                  <CustomButton text="Sign Up" />
                </Link>
              </li>
            </>
          )}
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
