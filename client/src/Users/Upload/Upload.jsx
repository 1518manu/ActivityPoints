import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";
import "./Upload.css";

export function CertificateUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    alert(`Uploading: ${selectedFile.name}`);
    // TODO: Handle file upload to backend
  };

  return (
    <div className="upload-container">
      <h2>Upload Your Certificate</h2>

      <label className="upload-box">
        <FaUpload className="upload-icon" />
        <p>Click to select a certificate</p>
        <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} />
      </label>

      {previewUrl && (
        <div className="preview-container">
          <p>Selected File: {selectedFile.name}</p>
          {selectedFile.type.startsWith("image/") && (
            <img src={previewUrl} alt="Certificate Preview" className="preview-image" />
          )}
        </div>
      )}

      <button className="uploadButton" onClick={handleUpload}>Upload</button>
    </div>
  );
}


