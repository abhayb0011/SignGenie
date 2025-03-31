import React from "react";
import Button from "@mui/material/Button";
import "./CustomButton.css"; // Import the CSS file

const CustomButton = ({ text, icon: Icon, onClick, color = "primary" }) => {
  return (
    <Button
      className={`custom-button ${color}`}
      variant="contained"
      startIcon={Icon && <Icon />}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
