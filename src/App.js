import React, { useState, useRef } from 'react';
import './App.css';
function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [matches, setMatches] = useState([]);
  const [highlightedImage, setHighlightedImage] = useState(null);
  const [visualMatchTable, setVisualMatchTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMatches([]);
    setHighlightedImage(null);
    setVisualMatchTable([]);
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    setSubmitted(true);

    try {
      const response = await fetch("https://thrift-book-detector-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      setMatches(data.matches || []);
      setHighlightedImage(data.highlighted_image || null);
      setVisualMatchTable(data.visual_match_table || []);
    } catch (err) {
      setLoading(false);
      alert("Error processing image. Check the backend console.");
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl(null);
    setMatches([]);
    setHighlightedImage(null);
    setVisualMatchTable([]);
    setLoading(false);
    setSubmitted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="container">
      <h2>📚 Thrift Book Finder</h2>

      <p className="instructions" style={{ fontSize: "0.85rem" }}>
        Upload a photo of a unsorted bookshelf and this app will scan it to detect
        book titles and authors from my personal list. A list upload feature is comming soon. 
        Matches are highlighted directly on the image.
        Powered by Google Cloud Vision and a custom Python backend.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
      />

      {highlightedImage ? (
        <img
          src={`data:image/jpeg;base64,${highlightedImage}`}
          alt="Detected text"
        />
      ) : (
        previewUrl && (
          <img
            src={previewUrl}
            alt="Uploaded preview"
          />
        )
      )}

      <div>
        <button onClick={handleSubmit}>Upload and Scan</button>
        <button onClick={handleReset}>Reset</button>
      </div>

      {loading && <p>🔍 Scanning image...</p>}

      {matches.length > 0 && (
        <div className="card">
          <h3>✅ Matches Found</h3>
          <ul>
            {matches.map((match, index) => (
              <li key={index}>
                <strong>{match.phrase}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {visualMatchTable.length > 0 && (
        <div className="card">
          <h3>🧠 OCR Match Table</h3>
          <table>
            <thead>
              <tr>
                <th>OCR Text</th>
                <th>Matched Phrase</th>
              </tr>
            </thead>
            <tbody>
              {visualMatchTable.map((row, index) => (
                <tr key={index}>
                  <td>{row.ocr_text}</td>
                  <td>{row.matched_phrase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {submitted && matches.length === 0 && !loading && (
        <p style={{ marginTop: '2rem' }}>❌ No matches found.</p>
      )}
    </div>
  );
}

export default App;

