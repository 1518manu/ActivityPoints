

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaThLarge, FaCheckCircle, FaCog,
   FaCalendarAlt, FaBell, FaSignOutAlt,
     FaUser, FaUniversity, FaCheck, FaTimes } from "react-icons/fa";
import { certificatesFetch } from "../certificatesFetch/certificatesFetch"
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { doc, updateDoc, addDoc ,getDoc } from 'firebase/firestore';
import './Validate.css';

export const Validate = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  const [validationData, setValidationData] = useState([]);
  const [pointsPopup, setPointsPopup] = useState(false);
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [selectedValidation, setSelectedValidation] = useState(null);
  


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
    
   
    fetchValidationData();
   
  }, [token, userData, navigate]);

  if (!userData) {
    return <div>Loading user data...</div>;
  }
  
  
  const [rejectPopup, setRejectPopup] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  

  const getValidatableCertificates = (studentId) => {
    const studentCerts = updatedCertificates[studentId] || [];
    const certsToValidate = studentCerts.filter(cert =>
      validationData.some(validation => validation.cert_id === cert.id && validation.validation_status === "Not Validated")
    );
    return certsToValidate;
  };
  const handleAcceptCertificate = (validation) => {
    const cert = validation.certificateDetails;
  
    console.log("Certificate Name:", cert.certificateName);
    console.log("Description:", cert.description);
    console.log("Status:", validation.validation_status);
    console.log("Activity:", cert.activity);
    console.log("Activity Head:", cert.activityHead);
    console.log("Sub-Activity:", cert.subActivity);
    console.log("Level:", cert.achievementLevel);
    console.log("Role:", cert.role);
    console.log("Event Date:", cert.eventDate);
    console.log("Certificate Date:", cert.certificateDate);
    console.log("Semester:", cert.semester);
    console.log("Prize:", cert.prize);
    console.log("Full Data:", validation);
  
    // ✅ Calculate Points
    const { activity, activityHead, achievementLevel ,role} = cert;
    let points = 0;
  
    if (activity === "NSS" || activity === "NCC") {
      points = 60;
    }
    else if (activityHead === "Sports & Games" || activityHead === "Cultural Activities") {
      if (achievementLevel === "I") points = 8;
      else if (achievementLevel === "II") points = 12;
      else if (achievementLevel === "III") points = 20;
      else if (achievementLevel === "IV") points = 40;
      else if (achievementLevel === "V") points = 60;
    }
    else if (activityHead === "Professional Self Initiatives") {
      if (activity === "MOOC") {
        points = 50;
      } else if (activity === "Tech Fest" || activity === "Tech Quiz") {
        if (achievementLevel === "I") points = 10;
        else if (achievementLevel === "II") points = 20;
        else if (achievementLevel === "III") points = 30;
        else if (achievementLevel === "IV") points = 40;
        else if (achievementLevel === "V") points = 50;
      }
      else if (activity === "Competitions conducted by Professional Societies - (IEEE,IET, ASME, SAE, NASA etc.)") {
        if (achievementLevel === "I") points += 10;
        else if (achievementLevel === "II") points += 15;
        else if (achievementLevel === "III") points += 20;
        else if (achievementLevel === "IV") points += 30;
        else if (achievementLevel === "V") points += 40;
      }
      else if (
        activity === "Attending Full time Conference/ Seminars / Exhibitions/ Workshop/ STTP conducted at IITs /NITs " || 
        activity === "Poster Presentation at IITs /NITs " || 
        activity === "Industrial Training/Internship (atleast for 5 full days)"
      ) {
        points = 20;
      }
      else if(activity==="Paper presentation/publication at IITs/NITs "){
        points = 30;
      }
    }
    else if (activityHead === "Entrepreneurship and Innovation" ) {
      if (activity === "Prototype  Developed and tested" ||
      activity === "Awards for Products developed "||
      activity === "Innovative technologies developed and used by industries/users " ||
      activity === "Startup Company-Registered legally "
    ) {
        points = 60;
      }
      else if (activity === "Societal innovations " ||
              activity=== "Patent- Approved "||
              activity==="Foreign Language Skill (TOEFL/ IELTS/ BEC exams etc.)"  ) {
        points=50;
      }
      else if (activity === "Patent- Licensed"||
        activity=== "Got venture capital funding for innovative ideas/products"||
        activity==="Startup Employment (Offering jobs to two persons not less than Rs. 15000/- per month) "
      ) {
        points = 80;
      }
      else if (activity ==="Patent-Filed") {
        points = 30;
      }
      else if (activity ==="Patent - Published") {
        points = 35
      }

    }
    else if (activityHead === "Leadership & Management" ) {
      if (
        activity === "Student Societies" || 
        activity === "College Association" || 
        activity === "Festival & Technical Events") 
      {
        if ( role === "Core coodinator" || role ==="Other Council Members") points = 15;
        else if ( role === "Sub Coordinator") points = 10;
        else if ( role === "Volunteer") points = 5;
        else if (role === "Chairman") points =30;
        else if (role === "Secretary") points=25;
      }
    }
  
    console.log("Calculated Points:", points);
    setCalculatedPoints(points);
  setSelectedValidation(validation);
  setPointsPopup(true);
  };
  //--------------------------------------------------to add-----------------------------------------------------
  const handleConfirmApproval = async (validationId) => {
    try {
      // Step 1: Fetch the Validation document
      const validationRef = doc(db, "Validation", validationId);
      const validationSnap = await getDoc(validationRef);
  
      if (!validationSnap.exists()) {
        console.error("Validation document not found");
        return;
      }
  
      const { cert_id, faculty_id } = validationSnap.data(); // Extract cert_id and faculty_id
  
      if (!cert_id) {
        console.error("Error: cert_id is undefined!");
        return;
      }
  
      // Step 2: Fetch user_id from Certificates collection using cert_id
      const certRef = doc(db, "certificates", cert_id);
      const certSnap = await getDoc(certRef);
  
      if (!certSnap.exists()) {
        console.error("Certificate document not found");
        return;
      }
  
      const { user_id } = certSnap.data(); // Extract user_id
  
      // Step 3: Update the Validation document with approval details
      await updateDoc(validationRef, {
        validation_status: "approved",
        cert_id: cert_id,
        faculty_id: faculty_id || "Unknown Faculty",
        points: Number(calculatedPoints),
        rejectReason: null,
        validatedBy: userData.name, // Faculty name (optional)
        validationTime: new Date().toISOString(),
      });
  
      console.log("Validation approved and updated in Firestore");
  
      // Step 4: Add an approval notification for the student
      const notificationsRef = collection(db, "Notifications");
      await addDoc(notificationsRef, {
        cert_id: cert_id,
        for: "student",
        msg: `Your certificate has been approved! You received ${calculatedPoints} points.`,
        status: "not viewed",
        type: "approve",
        user_id: user_id,
        timestamp: new Date().toISOString(),
      });
  
      console.log("Approval notification added to Firestore");
  
      // Refresh validation data to reflect the update
      setPointsPopup(false);
      fetchValidationData(); // Reload data after approval
  
    } catch (error) {
      console.error("Error approving validation status:", error);
    }
  };
  
  //-------------------------------------------------------------------------------------------------------

const handleRejectCertificate = async (validationId) => {
  try {
    // Update the Firestore Validation document
    const validationRef = doc(db, "Validation", validationId);
    const validationSnap = await getDoc(validationRef);

    if (!validationSnap.exists()) {
      console.error("Validation document not found");
      return;
    }

    const { cert_id } = validationSnap.data(); // Extract cert_id

    // Step 2: Fetch user_id from Certificates collection using cert_id
    const certRef = doc(db, "certificates", cert_id);
    const certSnap = await getDoc(certRef);

    if (!certSnap.exists()) {
      console.error("Certificate document not found");
      return;
    }

    const { user_id } = certSnap.data(); // Extract user_id
    await updateDoc(validationRef, {
      validation_status: "rejected",
      rejectReason: rejectReason,
      validatedBy: userData.name, // Optional: track who rejected
      validationTime: new Date().toISOString()
    });

    console.log("Validation rejected and updated in Firestore");
    const notificationsRef = collection(db, "Notifications");
    await addDoc(notificationsRef, {
      cert_id: cert_id,
      for: "student",
      msg: rejectReason,
      status: "not viewed",
      type: "reject",
      user_id: user_id,
      timestamp: new Date().toISOString(),
    });

    console.log("Notification added to Firestore");
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

  const onValidate = () => { navigate("/Validate"); }
  const onStudentList = () => { navigate("/StudentList"); }
  const onNotification = () => { navigate("/Notification-faculty"); }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>

        <div className="header-right">
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-faculty">
          <button onClick={onValidate}><FaCheckCircle className="menu-icon-faculty" /> Validate</button>
          <button onClick={onStudentList}><FaThLarge className="menu-icon-faculty" /> Student List</button>
          <button><FaCalendarAlt className="menu-icon-faculty" /> Events <span className="badge">new</span></button>
          <button  onClick={onNotification}> <FaBell   className="menu-icon-faculty" /> Notifications  </button>
          <button><FaCog className="menu-icon-faculty" /> Settings</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content">
          <h2>Validate Certificate</h2>
          <div className="student-certificates-container">
            

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
          <p><strong>Activity:</strong> {validation.certificateDetails.activity}</p>
        <p><strong>Achievement Level:</strong> {validation.certificateDetails.achievementLevel}</p>
        <p><strong>Role:</strong> {validation.certificateDetails.role}</p>
        <p><strong>Event Date:</strong> {validation.certificateDetails.eventDate}</p>
        <p><strong>Certificate Date:</strong> {validation.certificateDetails.certificateDate}</p>
        <p><strong>Semester:</strong> {validation.certificateDetails.semester}</p>
        <p><strong>Prize:</strong> {validation.certificateDetails.prize}</p>

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
            {/* <button className="approve-btn" onClick={() => handleAcceptCertificate(selectedStudent, cert.id)}>Approve</button> */}
            <button className="approve-btn" onClick={() => handleAcceptCertificate(validation)}>Approve</button>
            <button className="reject-btn-validate" onClick={() => setRejectPopup(validation.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p>No pending validations assigned.</p>
  )}
</div>

          </div>
          {/* poinys popup */}
          {pointsPopup && (
  <div className="points-popup">
    <h3>Points Calculated</h3>
    <p>Certificate Name: <strong>{selectedValidation.certificateDetails.certificateName}</strong></p>
    
    <label>
      Calculated Points:
      <input
        type="number"
        value={calculatedPoints}
        onChange={(e) => setCalculatedPoints(e.target.value)}
        className="points-input"
      />
    </label>

    <div className="popup-buttons">
    <button onClick={() => handleConfirmApproval(selectedValidation.id)}>
  Confirm Approval
</button>

      <button onClick={() => setPointsPopup(false)}>Cancel</button>
    </div>
  </div>
)}


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

