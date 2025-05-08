import React, { useState, useRef } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [matches, setMatches] = useState([]);
  const [highlightedImage, setHighlightedImage] = useState(null);
  const [visualMatchTable, setVisualMatchTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null); // NEW

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
      const response = await fetch("http://localhost:8000/upload", {
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
      fileInputRef.current.value = null; // FULL RESET of file input
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>📚 Thrift Book Finder</h2>

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
          style={{ width: '100%', marginTop: '1rem', border: '2px solid #333' }}
        />
      ) : (
        previewUrl && (
          <img
            src={previewUrl}
            alt="Uploaded preview"
            style={{ width: '100%', marginTop: '1rem' }}
          />
        )
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSubmit}>Upload and Scan</button>
        <button onClick={handleReset} style={{ marginLeft: '1rem' }}>Reset</button>
      </div>

      {loading && <p>🔍 Scanning image...</p>}

      {matches.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
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
        <div style={{ marginTop: '2rem' }}>
          <h3>🧠 OCR Match Table</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>OCR Text</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Matched Phrase</th>
              </tr>
            </thead>
            <tbody>
              {visualMatchTable.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.5rem 0' }}>{row.ocr_text}</td>
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

