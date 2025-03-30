import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaUndo, FaUpload, FaTimes } from 'react-icons/fa';
import { collection, getDocs, query, where ,addDoc } from "firebase/firestore";
import { db } from "../../../firebaseFile/firebaseConfig";
import { Loading } from "../../../Loading/Loading";
import './DutyLeaveStudent.css';

export const DutyLeaveForm = ({ userData }) => {
  const [formData, setFormData] = useState({
    studentName: userData?.name || '',
    className: userData?.class || '',
    rollNo: userData?.rollNo || '',
    leavePeriod: '',
    leaveReason: '',
    examinationDuringLeave: '',
    dutyLeaveCount: '',
    studentSignature: '',
    advisorRemarks: '',
    hodApproval: '',
    selectedCertificate: '',
    newCertificate: null
  });
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);

  // Function to fetch user certificates from Firestore
  const fetchUserCertificates = async (rollNo) => {
    try {
      const q = query(collection(db, "certificates"), where("user_id", "==", rollNo));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching certificates:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCertificates = async () => {
      if (userData?.rollNo) {
        try {
          setIsLoading(true);
          const certs = await fetchUserCertificates(userData.rollNo);
          setCertificates(certs);
        } catch (error) {
          console.error("Failed to load certificates:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCertificates();
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (name === "newCertificate") {
      setFormData((prev) => ({
        ...prev,
        newCertificate: files[0],
      }));
    } else if (name === "selectedCertificate") {
      // Find the selected certificate's fileURL
      const selectedCert = certificates.find(cert => cert.id === value);
      setFormData((prev) => ({
        ...prev,
        selectedCertificate: value,
        certificateFileURL: selectedCert ? selectedCert.fileURL : "", // Store fileURL
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const uploadToImageKit = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("folder", "/dutyleave");
    formData.append("publicKey", "public_dGrtJlwx1cYmPGWcjN5Ybdp0bYw="); 
  
    try {
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa("private_6doDUpitrkkv73i9cZvUYrviuDg=:")}`, // Fixed API Key format
        },
        body: formData,
      });
  
      const data = await response.json();
      return data.url; // Return the uploaded file URL
    } catch (error) {
      console.error("Error uploading to ImageKit:", error);
      return null;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leavePeriod || !formData.leaveReason) {
      alert("Please fill all required fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let uploadedFileURL = formData.certificateFileURL; // Use selected file URL if exists
      let certId = formData.selectedCertificate || null; // Use existing cert_id if available
  
      // If a new certificate is uploaded, upload to ImageKit
      if (formData.newCertificate) {
        const imageKitURL = await uploadToImageKit(formData.newCertificate);
        if (imageKitURL) {
          uploadedFileURL = imageKitURL;
          certId = imageKitURL; // Set certId as the uploaded file URL
        }
      }
  
      // Prepare Firestore document
      const submissionData = {
        studentName: formData.studentName,
        className: formData.className,
        rollNo: formData.rollNo,
        leavePeriod: formData.leavePeriod,
        leaveReason: formData.leaveReason,
        examinationDuringLeave: formData.examinationDuringLeave,
        dutyLeaveCount: formData.dutyLeaveCount,
        studentSignature: formData.studentSignature,
        advisorRemarks: formData.advisorRemarks,
        faculty_id: userData.mentor,
        hodApproval: formData.hodApproval,
        certificateURL: uploadedFileURL, // Store uploaded or selected certificate URL
        timestamp: new Date(),
      };
  
      // Add duty leave data to Firestore
      const docRef = await addDoc(collection(db, "Dutyleave"), submissionData);
  
      // Add notification for faculty
      await addDoc(collection(db, "Notifications"), {
        cert_id: certId, // Use existing cert_id or uploaded file URL
        for: "faculty",
        msg: `${userData.name} requested for duty leave`, 
        status: "not viewed",
        type: "upload",
        user_id: userData.mentor, // Assigning the faculty ID as recipient
        timestamp: new Date().toISOString(),
      });

      alert("Duty Leave application submitted successfully!");
      handleReset();
    } catch (error) {
      console.error("Error submitting duty leave:", error);
      alert("Error submitting duty leave. Please try again.");
    } finally {
      setIsLoading(false);
    }
};

  

  const handleReset = () => {
    setFormData({
      studentName: userData?.name || '',
      className: userData?.class || '',
      rollNo: userData?.rollNo || '',
      leavePeriod: '',
      leaveReason: '',
      examinationDuringLeave: '',
      dutyLeaveCount: '',
      studentSignature: '',
      advisorRemarks: '',
      hodApproval: '',
      selectedCertificate: '',
      newCertificate: null
    });
    setShowUploadOption(false);
  };

  const removeUploadedFile = () => {
    setFormData(prev => ({ ...prev, newCertificate: null }));
  };

  if (loading) {
    return <Loading />; 
  }
  return (
    <div className="duty-leave-container">
      <div className="college-header">
        <h1>T K M COLLEGE OF ENGINEERING, KOLLAM -5</h1>
        <h2>Application for Duty Leave (Students)</h2>
      </div>

      <form onSubmit={handleSubmit} className="duty-leave-form">
        <div className="form-group">
          <label>Name of Student:</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Class:</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Roll No.:</label>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>No. of days & Period of leave (DD/MM/YYYY):</label>
          <input
            type="text"
            name="leavePeriod"
            value={formData.leavePeriod}
            onChange={handleChange}
            placeholder="e.g., 2 days (15/05/2024 - 16/05/2024)"
            required
          />
        </div>

        <div className="form-group">
          <label>Reason for Leave:</label>
          <textarea
            name="leaveReason"
            value={formData.leaveReason}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Any Examination/Submission during the period of leave:</label>
          <textarea
            name="examinationDuringLeave"
            value={formData.examinationDuringLeave}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Total number of duty leave availed in the current semester:</label>
          <input
            type="number"
            name="dutyLeaveCount"
            value={formData.dutyLeaveCount}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Signature of student with date:</label>
          <input
            type="text"
            name="studentSignature"
            value={formData.studentSignature}
            onChange={handleChange}
            required
          />
        </div>

        {/* Certificate Selection Section */}
        <div className="form-group">
          <label>Related Certificate:</label>
          
          {isLoading ? (
            <p>Loading certificates...</p>
          ) : !showUploadOption ? (
            <>
              <select
                name="selectedCertificate"
                value={formData.selectedCertificate}
                onChange={handleChange}
                className="certificate-select"
              >
                <option value="">Select a certificate</option>
                {certificates.map(cert => (
                  <option key={cert.id} value={cert.id}>
                    {cert.certificateName} ({cert.eventDate})
                  </option>
                ))}
              </select>
              
              <button 
                type="button"
                className="upload-toggle-btn"
                onClick={() => setShowUploadOption(true)}
              >
                <FaUpload /> Upload New Certificate
              </button>
            </>
          ) : (
            <>
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <input
                    type="file"
                    name="newCertificate"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  Choose File
                </label>
                
                {formData.newCertificate && (
                  <div className="file-preview">
                    <span>{formData.newCertificate.name}</span>
                    <button 
                      type="button" 
                      onClick={removeUploadedFile}
                      className="remove-file-btn"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                type="button"
                className="upload-toggle-btn"
                onClick={() => setShowUploadOption(false)}
              >
                Select Existing Certificate
              </button>
            </>
          )}
        </div>

        <div className="form-group">
          <label>Specific Remark of Sr. Advisor/Advisor:</label>
          <textarea
            name="advisorRemarks"
            value={formData.advisorRemarks}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Order of Head of the Department:</label>
          <textarea
            name="hodApproval"
            value={formData.hodApproval}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleReset} className="reset-btn">
            <FaUndo /> Reset
          </button>
          <button type="submit" className="submit-btn">
            <FaPaperPlane /> Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};