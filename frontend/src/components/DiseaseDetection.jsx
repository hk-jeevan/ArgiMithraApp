import React, { useState, useRef } from "react";
import "./DiseaseDetection.css";

const API_BASE = "http://127.0.0.1:8000";

export default function DiseaseDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();

  function handleFile(f) {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  async function detect() {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/disease/predict`, {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      const text = json.result || "No result";

      const lines = text.split("\n").filter((l) => l.trim());
      const title = lines[0];
      const details = lines.slice(1);

      setResult({
        title,
        details,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch {
      setResult({
        title: "Error",
        details: ["Server not responding. Try again later."],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="disease-container">
      <h2>🌿 Plant Disease Detection</h2>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {preview && (
        <img className="preview" src={preview} alt="preview" />
      )}

      <button disabled={!file || loading} onClick={detect}>
        {loading ? "Analyzing..." : "Detect Disease"}
      </button>

      {result && (
        <div className="result">
          <h3>{result.title}</h3>
          <ul>
            {result.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
          <small>⏱ {result.timestamp}</small>
        </div>
      )}
    </div>
  );
}
