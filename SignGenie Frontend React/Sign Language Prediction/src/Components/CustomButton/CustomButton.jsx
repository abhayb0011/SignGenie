import React from "react";
import "./CustomButton.css";

const CustomButton = ({
  text,
  icon: Icon,
  onClick,
  color = "primary",
  className = "",
}) => {
  return (
    <button className={`custom-button ${color} ${className}`} onClick={onClick}>
      {Icon && <Icon className="button-icon" />}
      <span className="button-text">{text}</span>
    </button>
  );
};

export default CustomButton;
