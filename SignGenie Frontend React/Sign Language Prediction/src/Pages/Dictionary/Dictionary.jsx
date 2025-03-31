import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar"
import Footer from '../../Components/Footer/Footer'
import "./Dictionary.css";

const Dictionary = () => {
  const [signs, setSigns] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("");

  useEffect(() => {
    fetch("https://signgenie.onrender.com/signs")
      .then((res) => res.json())
      .then((data) => setSigns(data))
      .catch((err) => console.error("Error fetching signs:", err));
  }, []);

  const filteredSigns = selectedLetter
    ? signs.filter((sign) => sign.alphabet.toLowerCase() === selectedLetter.toLowerCase())
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
              className={`letter-btn ${selectedLetter === letter ? "active" : ""}`}
            >
              {letter}
            </button>
          ))}
          {selectedLetter && (
            <button onClick={() => setSelectedLetter("")} className="clear-filter-btn">
              Clear Filter
            </button>
          )}
        </div>

        {/* Display Signs */}
        <div className="signs-list">
          {filteredSigns.map((sign) => (
            <div key={sign.id} className="sign-entry">
              <img src={`https://signgenie.onrender.com/${sign.image_url}`} alt={sign.sign_name} className="sign-thumbnail" />
              <div>
                <h3>{sign.sign_name}</h3>
                <p>{sign.description}</p>
                <a
                  href={`https://signgenie.onrender.com/${sign.video_url}`}
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
