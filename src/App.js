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


  return (
    <div className="container">
      <h2>📚 Thrift Book Finder</h2>

      <p className="instructions" style={{ fontSize: "0.85rem" }}>
        Upload a photo of a unsorted bookshelf and this app will scan it to detect
        book titles and authors from a list. If no custom list is uploaded, my personal list will be used by default.
        A list upload feature is comming soon. 
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
      <div className={`csv-upload-box ${showHelp ? 'expanded' : 'collapsed'}`}>
        <div className="csv-dropdown-toggle" onClick={() => setShowHelp(!showHelp)}>
          <span><strong>Optional:</strong> Upload a custom list (.csv)</span>
          <span>{showHelp ? '▲' : '▼'}</span>
        </div>

        {showHelp && (
          <div className="dropdown-expanded">
            <p>Your CSV file should look like this:</p>
            <pre>{`phrase
Cormac McCarthy
All the Pretty Horses
Dante Inferno`}</pre>
            <p>
              Save it as a <strong>.csv</strong>. Make sure the first row is exactly <code>phrase</code> and each line after is a book title, author, or keyword.
            </p>
            <input type="file" accept=".csv" onChange={handleListUpload} ref={csvInputRef} />
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
    </div>
  );
}

export default App;

