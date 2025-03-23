import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import { certificatesFetch } from "../certificatesFetch/certificatesFetch"
import { db } from '../../../firebaseFile/firebaseConfig'; // Adjust your path to firebase config
import { collection, query, where, getDocs } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

import './Validate.css';

export const Validate = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  const [validationData, setValidationData] = useState([]);
  //---------------------------------------fetching certificates from the database-------------------------------------
const fetchValidationData = async () => {
  try {
    const userDataString = localStorage.getItem('userData'); 
    let facultyId = null;
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      facultyId = userData.faculty_id;
      console.log("Faculty ID inside IF:", facultyId);
    }

    console.log("Faculty ID for query:", facultyId);
    
    const validationQuery = query(
      collection(db, "Validation"),
      where("faculty_id", "==", facultyId),
      where("validation_status", "==", "not validated")
    );

    const querySnapshot = await getDocs(validationQuery);

    if (querySnapshot.empty) {
      console.log("No pending validations found.");
      setValidationData([]);
      return;
    }

    // Now fetch the certificates related to the validation
    const validationWithCertificates = [];
    for (const doc of querySnapshot.docs) {
      const validationData = doc.data();
      const certRef = doc.data().cert_id;  // Assuming cert_id is the document ID of Certificates
      console.log("type of certRef",certRef, typeof certRef);


      const certDoc = await getDocs(
        query(collection(db, "certificates"), where("__name__", "==", certRef))
      );

      if (!certDoc.empty) {
        const certData = certDoc.docs[0].data();
        validationWithCertificates.push({
          id: doc.id,
          ...validationData,
          certificateDetails: certData,
        });
      } else {
        console.log(`Certificate not found for cert_id: ${certRef}`);
      }
    }

    setValidationData(validationWithCertificates);
    console.log("Validation Data with Certificates:", validationWithCertificates);

  } catch (error) {
    console.error("Error fetching validation data:", error);
  }
};
  useEffect(() => {
    if (!token) {
      navigate("/");
    }

    if (userData) {
      console.log("Faculty Data Loaded:", userData);
    } else {
      console.warn("No user data available!");
    }

    // Load certificates from localStorage if available
    // const savedCertificates = JSON.parse(localStorage.getItem("certificates"));
    // if (savedCertificates) {
    //   setUpdatedCertificates(savedCertificates);
    // }
    //------------------------------
    //const fetchValidationData = async () => {
//       try {
//         const userDataString = localStorage.getItem('userData'); 
//         //const facultyId = null;
//         if (userDataString) {
//           const userData = JSON.parse(userDataString);
//           const facultyId = userData.faculty_id;
//           console.log("Faculty ID:", facultyId);
// } // fetch faculty ID from local storage
//         console.log("Faculty ID:", facultyId);
//         const q = query(
//           collection(db, "Validation"),
//           where("faculty_id", "==", facultyId),
//           where("validation_status", "==", "Not Validated")
//         );
  
//         const querySnapshot = await getDocs(q);
//         const validations = [];
//         querySnapshot.forEach((doc) => {
//           validations.push({ id: doc.id, ...doc.data() });
//         });
//         setValidationData(validations);
//         console.log("Validation Data:", validations);
//       } catch (error) {
//         console.error("Error fetching validation data:", error);
//       }



  
    fetchValidationData();
    //}, []);
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

  const getValidatableCertificates = (studentId) => {
    const studentCerts = updatedCertificates[studentId] || [];
    const certsToValidate = studentCerts.filter(cert =>
      validationData.some(validation => validation.cert_id === cert.id && validation.validation_status === "Not Validated")
    );
    return certsToValidate;
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

  // const handleRejectCertificate = (studentId, certificateId) => {
  //   const updatedCerts = { ...updatedCertificates };
  //   const studentCertificates = updatedCerts[studentId];
  //   const certificateIndex = studentCertificates.findIndex(cert => cert.id === certificateId);
  //   studentCertificates[certificateIndex].status = "Rejected";
  //   studentCertificates[certificateIndex].rejectReason = rejectReason;
  //   studentCertificates[certificateIndex].validatedBy = userData.name;
  //   studentCertificates[certificateIndex].validationTime = new Date().toLocaleString();

  //   // Save to localStorage to persist data
  //   localStorage.setItem("certificates", JSON.stringify(updatedCerts));
  //   setUpdatedCertificates(updatedCerts);
  //   setRejectPopup(null); // Close the popup
  //   setRejectReason(""); // Reset the reject reason

  //   // Send email to student (simulated here)
  //   sendRejectionEmail(studentId, rejectReason);
  // };

const handleRejectCertificate = async (validationId) => {
  try {
    // Update the Firestore Validation document
    const validationRef = doc(db, "Validation", validationId);
    await updateDoc(validationRef, {
      validation_status: "rejected",
      rejectReason: rejectReason,
      validatedBy: userData.name, // Optional: track who rejected
      validationTime: new Date().toISOString()
    });

    console.log("Validation rejected and updated in Firestore");

    // Refresh validation data to reflect the update
    setRejectPopup(null);
    setRejectReason("");
    fetchValidationData();

  } catch (error) {
    console.error("Error updating validation status:", error);
  }
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
    <h3>Pending Certificates</h3>
  </div>

  {validationData.length > 0 ? (
    <div className="certificate-list">
      {validationData.map((validation) => (
        <div key={validation.id} className="certificate-card">
          <p><strong>Certificate Name:</strong> {validation.certificateDetails.certificateName}</p>
          <p><strong>Description:</strong> {validation.certificateDetails.description}</p>
          <p>Status: {validation.validation_status}</p>

          {/* View Certificate Option */}
          <div className="view-cert">
            <FaEye onClick={() => handleViewCertificate(validation.certificateDetails.fileURL)} style={{ cursor: "pointer", color: "blue" }} />
            <a 
              href={validation.certificateDetails.fileURL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="certificate-link"
              style={{ marginLeft: "10px" }}
            >
              View Certificate
            </a>
          </div>

          <div className="actions">
                          <button className="approve-btn" onClick={() => handleAcceptCertificate(selectedStudent, cert.id)}>Approve</button>
                          <button className="reject-btn" onClick={() => setRejectPopup(validation.id)}>Reject</button>
                        </div>
        </div>
      ))}
    </div>
  ) : (
    <p>No pending validations assigned.</p>
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
                {/* <button onClick={() => handleRejectCertificate(selectedStudent, rejectPopup)}>Confirm</button> */}
                <button onClick={() => handleRejectCertificate(rejectPopup)}>Confirm</button>

                <button onClick={() => setRejectPopup(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
