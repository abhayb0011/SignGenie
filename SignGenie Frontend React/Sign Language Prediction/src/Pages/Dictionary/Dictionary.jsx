import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./Dictionary.css";

const Dictionary = () => {
  const [signs, setSigns] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/signs")
      .then((response) => setSigns(response.data))
      .catch((error) => console.error("Error fetching signs:", error));
  }, []);

  const filteredSigns = selectedLetter
    ? signs.filter(
        (sign) => sign.alphabet.toLowerCase() === selectedLetter.toLowerCase()
      )
    : signs;

  return (
    <>
      <Navbar />
      <div className="dictionary-container">
        <h1>Sign Language Dictionary</h1>

        {/* Alphabet Filter */}
        <div className="alphabet-filter">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`letter-btn ${
                selectedLetter === letter ? "active" : ""
              }`}
            >
              {letter}
            </button>
          ))}
          {selectedLetter && (
            <button
              onClick={() => setSelectedLetter("")}
              className="clear-filter-btn"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Display Signs */}
        <div className="signs-list">
          {filteredSigns.map((sign) => (
            <div key={sign.id} className="sign-entry">
              <img
                src={`http://127.0.0.1:5000/${sign.image_url}`}
                alt={sign.sign_name}
                className="sign-thumbnail"
              />
              <div>
                <h3>{sign.sign_name}</h3>
                <p>{sign.description}</p>
                <a
                  href={`http://127.0.0.1:5000/${sign.video_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Video
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dictionary;
