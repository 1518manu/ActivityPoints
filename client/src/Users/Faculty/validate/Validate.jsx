import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import { certificatesFetch } from "../certificatesFetch/certificatesFetch"
import './Validate.css';

export const Validate = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }

    if (userData) {
      console.log("Student Data Loaded:", userData);
    } else {
      console.warn("No user data available!");
    }

    // Load certificates from localStorage if available
    const savedCertificates = JSON.parse(localStorage.getItem("certificates"));
    if (savedCertificates) {
      setUpdatedCertificates(savedCertificates);
    }
  }, [token, userData, navigate]);

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  const students = [
    { id: 1, name: "Alice Johnson", rollNo: "S101" },
    { id: 2, name: "Bob Smith", rollNo: "S102" },
    { id: 3, name: "Charlie Brown", rollNo: "S103" },
    { id: 4, name: "David Williams", rollNo: "S104" },
    { id: 5, name: "Eva Green", rollNo: "S105" },
    { id: 6, name: "Frank White", rollNo: "S106" },
  ];

  const certificates = {
    1: [
      { id: 1, name: "NSS Volunteer (2 Years)", status: "Pending", description: "Active participation in NSS for 2 years.", validatedBy: "", validationTime: "", file: "/path/to/certificate1.pdf" },
      { id: 2, name: "Tech Fest Participation", status: "Pending", description: "Presented a project in a state-level tech fest.", validatedBy: "", validationTime: "", file: "/path/to/certificate2.jpg" },
    ],
    2: [
      { id: 1, name: "Football Team", status: "Pending", description: "Represented in football team.", validatedBy: "", validationTime: "", file: "/path/to/certificate3.pdf" },
    ],
  };

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rejectPopup, setRejectPopup] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [updatedCertificates, setUpdatedCertificates] = useState(certificates);

  const handleSelectStudent = (studentId) => {
    setSelectedStudent(studentId);
  };

  const handleAcceptCertificate = (studentId, certificateId) => {
    const updatedCerts = { ...updatedCertificates };
    const studentCertificates = updatedCerts[studentId];
    const certificateIndex = studentCertificates.findIndex(cert => cert.id === certificateId);
    studentCertificates[certificateIndex].status = "Approved";
    studentCertificates[certificateIndex].validatedBy = userData.name; // Assume userData contains the name of the person approving
    studentCertificates[certificateIndex].validationTime = new Date().toLocaleString(); // Add current timestamp

    // Save to localStorage to persist data
    localStorage.setItem("certificates", JSON.stringify(updatedCerts));
    setUpdatedCertificates(updatedCerts);
  };

  const handleRejectCertificate = (studentId, certificateId) => {
    const updatedCerts = { ...updatedCertificates };
    const studentCertificates = updatedCerts[studentId];
    const certificateIndex = studentCertificates.findIndex(cert => cert.id === certificateId);
    studentCertificates[certificateIndex].status = "Rejected";
    studentCertificates[certificateIndex].rejectReason = rejectReason;
    studentCertificates[certificateIndex].validatedBy = userData.name;
    studentCertificates[certificateIndex].validationTime = new Date().toLocaleString();

    // Save to localStorage to persist data
    localStorage.setItem("certificates", JSON.stringify(updatedCerts));
    setUpdatedCertificates(updatedCerts);
    setRejectPopup(null); // Close the popup
    setRejectReason(""); // Reset the reject reason

    // Send email to student (simulated here)
    sendRejectionEmail(studentId, rejectReason);
  };

  const sendRejectionEmail = (studentId, reason) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      console.log(`Sending rejection email to ${student.name} with reason: ${reason}`);
    }
  };

  const handleViewCertificate = (file) => {
    // Open the certificate in a new tab
    window.open(file, "_blank");
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>

        <div className="header-right">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu">
          <button><img src="settings-icon.svg" className="menu-icon" /> Settings</button>
          <button><img src="settings-icon.svg" className="menu-icon" /> Validate</button>
          <button><img src="notifications-icon.svg" className="menu-icon" /> Manage Faculty</button>
          <button><img src="notifications-icon.svg" className="menu-icon" /> Notifications</button>
          <button onClick={onLogout}><img src="logout-icon.svg" className="menu-icon" /> Logout</button>
        </div>

        <div className="profile-content">
          <div className="profile-banner">
            <div className="banner-background"></div>
            <div className="edit-button">
              <FaEdit style={{ color: "#0000FF", fontSize: "15px", margin: "5px", fontWeight: "100" }} />
            </div>
          </div>

          <div className="student-certificates-container">
            {/* Students List Section */}
            <div className="student-list-container">
              <div className="section-header">
                <h3>Student List</h3>
              </div>
              <div className="student-list">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`student-card ${selectedStudent === student.id ? "selected" : ""}`}
                    onClick={() => handleSelectStudent(student.id)}
                  >
                    <p><strong>{student.name}</strong></p>
                    <p>Roll No: {student.rollNo}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates List Section */}
            <div className="certificate-list-container">
              <div className="section-header">
                <h3>Certificates for {students.find(s => s.id === selectedStudent)?.name}</h3>
              </div>
              {selectedStudent && updatedCertificates[selectedStudent]?.length > 0 ? (
                <div className="certificate-list">
                  {updatedCertificates[selectedStudent].map((cert) => (
                    <div key={cert.id} className="certificate-card">
                      <p><strong>{cert.name}</strong></p>
                      <p>{cert.description}</p>
                      <p>Status: {cert.status}</p>

                      {cert.status === "Pending" && (
                        <div className="actions">
                          <button className="approve-btn" onClick={() => handleAcceptCertificate(selectedStudent, cert.id)}>Approve</button>
                          <button className="reject-btn" onClick={() => setRejectPopup(cert.id)}>Reject</button>
                        </div>
                      )}

                      {cert.status === "Rejected" && (
                        <p><strong>Rejected Reason:</strong> {cert.rejectReason}</p>
                      )}

                      {/* View Certificate Option */}
                      <div className="view-cert">
                        <FaEye onClick={() => handleViewCertificate(cert.file)} style={{ cursor: "pointer", color: "blue" }} />
                        <a 
                          href={cert.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="certificate-link"
                          style={{ marginLeft: "10px" }}
                        >
                          View Certificate
                        </a>
                      </div>

                      {/* Optional: Embed PDF Preview */}
                      {/* <iframe 
                        src={cert.file} 
                        width="100%" 
                        height="500px"
                        title={cert.name}
                        style={{ border: "none", marginTop: "10px" }}
                      ></iframe> */}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No certificates available for this student.</p>
              )}
            </div>
          </div>

          {/* Reject Popup */}
          {rejectPopup !== null && (
            <div className="reject-popup">
              <h3>Enter Reason for Rejection</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
              ></textarea>
              <div className="popup-buttons">
                <button onClick={() => handleRejectCertificate(selectedStudent, rejectPopup)}>Confirm</button>
                <button onClick={() => setRejectPopup(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
