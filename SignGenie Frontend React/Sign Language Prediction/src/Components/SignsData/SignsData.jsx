import React, { useState, useEffect } from "react";
import "./SignsData.css";

const SignsData = () => {
  const [signs, setSigns] = useState([]);
  const [search, setSearch] = useState("");
  const [filterLetter, setFilterLetter] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/signs") // Flask API
      .then((res) => res.json())
      .then((data) => setSigns(data))
      .catch((err) => console.error("Error fetching signs:", err));
  }, []);

  const filteredSigns = signs.filter((sign) =>
    sign.sign_name.toLowerCase().includes(search.toLowerCase()) &&
    (filterLetter ? sign.alphabet.toLowerCase() === filterLetter.toLowerCase() : true)
  );

  return (
    <div className="signs-container">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for a sign..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {/* Alphabetical Filter */}
      <div className="alphabet-filter">
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
          <button key={letter} className="letter-btn" onClick={() => setFilterLetter(letter)}>
            {letter}
          </button>
        ))}
      </div>

      {/* Display Signs */}
      <div className="signs-grid">
        {filteredSigns.map((sign) => (
          <div key={sign.id} className="sign-card">
            <img src={sign.image_url} alt={sign.sign_name} className="sign-image" />
            <h3>{sign.sign_name}</h3>
            <p>{sign.description}</p>
            <a href={sign.video_url} target="_blank" rel="noopener noreferrer">
              View Video
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignsData;
