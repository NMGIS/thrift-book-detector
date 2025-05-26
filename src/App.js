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

    if (customList) {
      formData.append("list", customList); // 👈 include uploaded CSV
    }

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
      alert("Oops! The backend server is starting up (free tier delay). Please wait 10 seconds and try again.");
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
    setCustomList(null); // clear list state

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    if (csvInputRef.current) {
      csvInputRef.current.value = null;
    }
  };

const [customList, setCustomList] = useState(null);

const handleListUpload = (e) => {
  const file = e.target.files[0];
  setCustomList(file);
};

const csvInputRef = useRef(null);

const [showHelp, setShowHelp] = useState(false);

const [showTech, setShowTech] = useState(false);


  return (
    <div className="container">
      <h2>📚 Thrift Book Finder</h2>

      <p className="instructions" style={{ fontSize: "0.85rem" }}>
        Upload a photo of a unsorted bookshelf and this app will scan it to detect
        book titles and authors from a list. If no custom list is uploaded, my personal list will be used by default.
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
      <div className={`csv-upload-box ${showHelp ? 'expanded' : 'collapsed'}`}>
        <div className="csv-dropdown-toggle" onClick={() => setShowHelp(!showHelp)}>
          <span><strong>Optional:</strong> Upload a custom list (.csv or .txt)</span>
          <span>{showHelp ? '▲' : '▼'}</span>
        </div>

        {showHelp && (
          <div className="dropdown-expanded">
            <p>
              To use a custom list, upload a plain text or CSV file containing book titles or authors
              separated by commas. Matching is not case-sensitive. For example:<br /><br />
              <em>Lord of the Rings, Ernest Hemingway, Moby Dick, John Steinbeck, Cormac McCarthy</em>
            </p>
            <input type="file" accept=".csv,.txt,text/plain" onChange={handleListUpload} ref={csvInputRef} />
          </div>
        )}
      </div>

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
      <p>
      <div className="expandable-section">
        <div className="expandable-toggle" onClick={() => setShowTech(!showTech)}>
          <strong>About:</strong> Technologies Used in This App {showTech ? '▲' : '▼'}
        </div>

        {showTech && (
          <div className="expandable-content">
            <ul>
              <li><strong>React</strong> – for building the frontend user interface</li>
              <li><strong>RESTful Flask (Python) API</strong> – processes image uploads and returns matches</li>
              <li><strong>Google Cloud Vision API</strong> – for optical character recognition (OCR)</li>
              <li><strong>RapidFuzz</strong> – for fuzzy matching scanned text against your list</li>
              <li><strong>GitHub Pages</strong> – hosts the frontend site</li>
              <li><strong>Render</strong> – hosts the Python/Flask backend</li>
            </ul>
          </div>
        )}
      </div>
      </p>
      <footer className="footer">
        <a href="https://github.com/NMGIS" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-github fa-2x"></i>
        </a>
        <a href="https://linkedin.com/in/nevinmcintyregis" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-linkedin fa-2x"></i>
        </a>
        <a href="https://www.nevinm.com" target="_blank" rel="noopener noreferrer">
          <i className="fa-solid fa-globe fa-2x"></i>
        </a>
      </footer>

    </div>
  );
}

export default App;

