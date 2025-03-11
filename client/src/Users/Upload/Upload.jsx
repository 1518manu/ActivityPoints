import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFile } from "react-icons/fa";
import { NotificationContainer } from "../../Notification/NotificationContainer";
import "./Upload.css";

export function CertificateUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [category, setCategory] = useState("curricular");
  const [eventDate, setEventDate] = useState("");
  const [certificateDate, setCertificateDate] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [organization, setOrganization] = useState("");
  const [institute, setInstitute] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "", show: false });
  
  const navigate = useNavigate();

  const institutes = ["TKMCE", "CTE", "NSSCE"];
  const organizations = ["IEEE", "IEI", "ACM", "HESTIA", "TINKERHUB"];
  const certificateTypes = ["Hackathon", "Sports", "Arts", "Workshop", "Volunteering",
    "NPTEL Course", "Internship", "Webinar", "Seminar", "Conference", "Other"];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };


  const handleUpload = () => {
    if (!selectedFile || !eventDate || !certificateDate || !certificateType || !organization || !institute) {
      showNotification("Please fill all details before uploading!", "error");
      //alert("Please fill all details before uploading!");
      return;
    }

    const uploadData = {
      fileName: selectedFile.name,
      category,
      eventDate,
      certificateDate,
      certificateType,
      organization,
      institute,
    };

    console.log("Uploading Data:", uploadData);
    showNotification("upload Successful!", "success");
    //alert("Certificate uploaded successfully!");
    // Add a short delay before navigating
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500); // 1.5 seconds delay

    // TODO: Implement backend file upload
  };

  return (
    <div className="upload-container">
      <NotificationContainer message={notification.message} type={notification.type} show={notification.show} />
      <h2 className="Upload-Your-Certificate">Upload Your Certificate</h2>

      {/* File Upload */}
      <label className="upload-box">
        <FaUpload className="upload-icon" />
        <p>Click to select a certificate</p>
        <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} />
      </label>

      {/* Preview */}
      {previewUrl && (
        <div className="preview-container">
          <p>
           <FaFile style={{ color: "#868282", fontSize: "20px", margin:"0px 10px 0px 0px ",fontWeight: "100" }}/>
            Selected File: {selectedFile.name}</p>
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
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>

      {/* Date of Certificate Provided */}
      <div className="input-group">
        <label>Date Certificate Provided:</label>
        <input type="date" value={certificateDate} onChange={(e) => setCertificateDate(e.target.value)} />
      </div>

      {/* Certificate Type Dropdown */}
      <div className="input-group">
        <label>Type of Certificate:</label>
        <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
          <option value="" disabled>Select a Certificate Type</option>
          {certificateTypes.map((cert) => (
            <option key={cert} value={cert}>{cert}</option>
          ))}
        </select>
      </div>

      {/* Organization Dropdown */}
      <div className="input-group">
        <label>Organization:</label>
        <select value={organization} onChange={(e) => setOrganization(e.target.value)}>
          <option value="" disabled>Select an Organization</option>
          {organizations.map((org) => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>
      </div>
      
      {/* Institute Dropdown */}
      <div className="input-group">
        <label>Institute:</label>
        <select value={institute} onChange={(e) => setInstitute(e.target.value)}>
          <option value="" disabled>Select an Institute</option>
          {institutes.map((inst) => (
            <option key={inst} value={inst}>{inst}</option>
          ))}
        </select>
      </div>

      {/* Upload Button */}
      <button className="uploadButton" onClick={handleUpload}>
        Upload  <FaUpload style={{ color: "#ffff", fontSize: "20px", margin:" 5px 0px",fontWeight: "100" }}/>
      </button>
    </div>
  );
}
