import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";
import "./Upload.css";

export function CertificateUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [category, setCategory] = useState("curricular"); // Curricular or Non-curricular
  const [eventDate, setEventDate] = useState("");
  const [certificateDate, setCertificateDate] = useState("");
  const [certificateType, setCertificateType] = useState("hackathon");
  const [organization, setOrganization] = useState("IEEE");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !eventDate || !certificateDate) {
      alert("Please fill all details before uploading!");
      return;
    }

    const uploadData = {
      fileName: selectedFile.name,
      category,
      eventDate,
      certificateDate,
      certificateType,
      organization,
    };

    console.log("Uploading Data:", uploadData);
    alert("Certificate uploaded successfully!");
    // TODO: Handle file upload to backend
  };

  return (
    <div className="upload-container">
      <h2  className= "Upload-Your-Certificate">Upload Your Certificate</h2>
      
      {/* File Upload */}
      <label className="upload-box">
        <FaUpload className="upload-icon" />
        <p>Click to select a certificate</p>
        <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} />
      </label>

      {/* Preview */}
      {previewUrl && (
        <div className="preview-container">
          <p>Selected File: {selectedFile.name}</p>
          {selectedFile.type.startsWith("image/") && (
            <img src={previewUrl} alt="Certificate Preview" className="preview-image" />
          )}
        </div>
      )}

      {/* Toggle Button for Curricular / Non-Curricular */}
        <div
        className={`toggle-group ${category === "noncurricular" ? "noncurricular" : ""}`}
        onClick={() => setCategory(category === "curricular" ? "noncurricular" : "curricular")}
        >
        <div className="toggle-active"></div>
        <div className={`toggle-button ${category === "curricular" ? "active" : ""}`}>Curricular</div>
        <div className={`toggle-button ${category === "noncurricular" ? "active" : ""}`}>Non-Curricular</div>
        </div>


      {/* Date of Event */}
      <div className="input-group">
        <label>Date of Event:</label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
      </div>

      {/* Date of Certificate Provided */}
      <div className="input-group">
        <label>Date Certificate Provided:</label>
        <input
          type="date"
          value={certificateDate}
          onChange={(e) => setCertificateDate(e.target.value)}
        />
      </div>

      {/* Certificate Type Dropdown */}
      <div className="input-group">
        <label>Type of Certificate:</label>
        <select
          value={certificateType}
          onChange={(e) => setCertificateType(e.target.value)}
        >
          <option value="hackathon">Hackathon</option>
          <option value="sports">Sports</option>
          <option value="arts">Arts</option>
          <option value="workshop">Workshop</option>
          <option value="volunteering">Volunteering</option>
          <option value="nptel">NPTEL Course</option>
        </select>
      </div>

      {/* Organization Dropdown */}
      <div className="input-group">
        <label>Organization:</label>
        <select
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        >
          <option value="IEEE">IEEE</option>
          <option value="IEI">IEI</option>
          <option value="ACM">ACM</option>
          <option value="HESTIA">HESTIA</option>
          <option value="TINKERHUB">TINKERHUB</option>
        </select>
      </div>


      {/* Upload Button */}
      <button className="uploadButton" onClick={handleUpload}>
        Upload  <FaUpload style={{ color: "#ffff", fontSize: "20px", margin:" 5px 0px",fontWeight: "100" }}/>
      </button>
    </div>
  );
}
