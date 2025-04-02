import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaThLarge, FaUserTie, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaFilter, FaUserGraduate } from "react-icons/fa";
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import './Validate.css';

export const Validate = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  const [validationData, setValidationData] = useState([]);
  const [pointsPopup, setPointsPopup] = useState(false);
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [studentsWithCertificates, setStudentsWithCertificates] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(() => {
    const saved = localStorage.getItem('selectedStudent');
    return saved ? JSON.parse(saved) : null;
  });
  const [rejectPopup, setRejectPopup] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchValidationData = async () => {
    try {
      setLoading(true);
      const userDataString = localStorage.getItem('userData'); 
      let facultyId = null;
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        facultyId = userData.faculty_id;
      }

      const validationQuery = query(
        collection(db, "Validation"),
        where("faculty_id", "==", facultyId),
        where("validation_status", "==", "not validated")
      );
      const querySnapshot = await getDocs(validationQuery);

      if (querySnapshot.empty) {
        console.log("No pending validations found.");
        setValidationData([]);
        setStudentsWithCertificates([]);
        setLoading(false);
        return;
      }

      const studentMap = new Map();
      
      for (const validationDoc of querySnapshot.docs) {
        const validationData = validationDoc.data();
        const certRef = validationData.cert_id;
        
        const certDoc = await getDoc(doc(db, "certificates", certRef));
        if (!certDoc.exists()) continue;
        
        const certData = certDoc.data();
        const studentId = certData.user_id;
        
        if (!studentMap.has(studentId)) {
          const studentQuery = query(collection(db, "Students"), where("rollNo", "==", studentId));
          const studentSnapshot = await getDocs(studentQuery);
          if (studentSnapshot.empty) continue;
          
          const studentData = studentSnapshot.docs[0].data();
          studentMap.set(studentId, {
            ...studentData,
            rollNo: studentId,
            validations: []
          });
        }
        
        const student = studentMap.get(studentId);
        student.validations.push({
          id: validationDoc.id,
          ...validationData,
          certificateDetails: certData
        });
      }
      
      const studentsArray = Array.from(studentMap.values());
      setStudentsWithCertificates(studentsArray);
      setValidationData(studentsArray.flatMap(student => student.validations));
      
      if (selectedStudent) {
        const freshStudent = studentsArray.find(s => s.rollNo === selectedStudent.rollNo);
        setSelectedStudent(freshStudent || null);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching validation data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    
    if (userData) {
      fetchValidationData();
    }
  }, [token, userData, navigate]);

  useEffect(() => {
    if (selectedStudent) {
      localStorage.setItem('selectedStudent', JSON.stringify({
        rollNo: selectedStudent.rollNo,
        name: selectedStudent.name,
        department: selectedStudent.department
      }));
    } else {
      localStorage.removeItem('selectedStudent');
    }
  }, [selectedStudent]);

  const handleAcceptCertificate = (validation) => {
    const cert = validation.certificateDetails;
    let points = 0;

    if (cert.activity === "NSS" || cert.activity === "NCC") {
      points = 60;
    }
    else if (cert.activityHead === "Sports & Games" || cert.activityHead === "Cultural Activities") {
      if (cert.achievementLevel === "I") points = 8;
      else if (cert.achievementLevel === "II") points = 12;
      else if (cert.achievementLevel === "III") points = 20;
      else if (cert.achievementLevel === "IV") points = 40;
      else if (cert.achievementLevel === "V") points = 60;
    }
    else if (cert.activityHead === "Professional Self Initiatives") {
      if (cert.activity === "MOOC") {
        points = 50;
      } else if (cert.activity === "Tech Fest" || cert.activity === "Tech Quiz") {
        if (cert.achievementLevel === "I") points = 10;
        else if (cert.achievementLevel === "II") points = 20;
        else if (cert.achievementLevel === "III") points = 30;
        else if (cert.achievementLevel === "IV") points = 40;
        else if (cert.achievementLevel === "V") points = 50;
      }
      else if (cert.activity === "Competitions conducted by Professional Societies - (IEEE,IET, ASME, SAE, NASA etc.)") {
        if (cert.achievementLevel === "I") points += 10;
        else if (cert.achievementLevel === "II") points += 15;
        else if (cert.achievementLevel === "III") points += 20;
        else if (cert.achievementLevel === "IV") points += 30;
        else if (cert.achievementLevel === "V") points += 40;
      }
      else if (
        cert.activity === "Attending Full time Conference/ Seminars / Exhibitions/ Workshop/ STTP conducted at IITs /NITs " || 
        cert.activity === "Poster Presentation at IITs /NITs " || 
        cert.activity === "Industrial Training/Internship (atleast for 5 full days)"
      ) {
        points = 20;
      }
      else if(cert.activity==="Paper presentation/publication at IITs/NITs "){
        points = 30;
      }
    }
    else if (cert.activityHead === "Entrepreneurship and Innovation" ) {
      if (cert.activity === "Prototype  Developed and tested" ||
      cert.activity === "Awards for Products developed "||
      cert.activity === "Innovative technologies developed and used by industries/users " ||
      cert.activity === "Startup Company-Registered legally "
      ) {
        points = 60;
      }
      else if (cert.activity === "Societal innovations " ||
              cert.activity=== "Patent- Approved "||
              cert.activity==="Foreign Language Skill (TOEFL/ IELTS/ BEC exams etc.)"  ) {
        points=50;
      }
      else if (cert.activity === "Patent- Licensed"||
        cert.activity=== "Got venture capital funding for innovative ideas/products"||
        cert.activity==="Startup Employment (Offering jobs to two persons not less than Rs. 15000/- per month) "
      ) {
        points = 80;
      }
      else if (cert.activity ==="Patent-Filed") {
        points = 30;
      }
      else if (cert.activity ==="Patent - Published") {
        points = 35;
      }
    }
    else if (cert.activityHead === "Leadership & Management" ) {
      if (
        cert.activity === "Student Societies" || 
        cert.activity === "College Association" || 
        cert.activity === "Festival & Technical Events") 
      {
        if ( cert.role === "Core coodinator" || cert.role ==="Other Council Members") points = 15;
        else if ( cert.role === "Sub Coordinator") points = 10;
        else if ( cert.role === "Volunteer") points = 5;
        else if (cert.role === "Chairman") points =30;
        else if (cert.role === "Secretary") points=25;
      }
    }

    setCalculatedPoints(points);
    setSelectedValidation(validation);
    setPointsPopup(true);
  };

  const handleConfirmApproval = async (validationId) => {
    try {
      const validationRef = doc(db, "Validation", validationId);
      const validationSnap = await getDoc(validationRef);
  
      if (!validationSnap.exists()) {
        console.error("Validation document not found");
        return;
      }
  
      const { cert_id, faculty_id } = validationSnap.data();
  
      const certRef = doc(db, "certificates", cert_id);
      const certSnap = await getDoc(certRef);
  
      if (!certSnap.exists()) {
        console.error("Certificate document not found");
        return;
      }
  
      const { user_id } = certSnap.data();
  
      await updateDoc(validationRef, {
        validation_status: "approved",
        points: Number(calculatedPoints),
        rejectReason: null,
        validatedBy: userData.name,
        validationTime: new Date().toISOString(),
      });
  
      const studentsCollection = collection(db, "Students");
      const q = query(studentsCollection, where("rollNo", "==", user_id));
      const studentQuerySnap = await getDocs(q);

      if (!studentQuerySnap.empty) {
        const studentDoc = studentQuerySnap.docs[0];
        const studentRef = doc(db, "Students", studentDoc.id);
        const studentSnap = await getDoc(studentRef);
        const currentPoints = studentSnap.data().point || 0;
        const newTotalPoints = currentPoints + Number(calculatedPoints);

        await updateDoc(studentRef, {
          point: newTotalPoints
        });
      }

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
  
      setPointsPopup(false);
      setSelectedValidation(null);
      fetchValidationData();
    } catch (error) {
      console.error("Error approving validation status:", error);
    }
  };

  const handleRejectCertificate = async (validationId) => {
    try {
      const validationRef = doc(db, "Validation", validationId);
      const validationSnap = await getDoc(validationRef);

      if (!validationSnap.exists()) {
        console.error("Validation document not found");
        return;
      }

      const { cert_id } = validationSnap.data();
      const certRef = doc(db, "certificates", cert_id);
      const certSnap = await getDoc(certRef);

      if (!certSnap.exists()) {
        console.error("Certificate document not found");
        return;
      }

      const { user_id } = certSnap.data();
      await updateDoc(validationRef, {
        validation_status: "rejected",
        rejectReason: rejectReason,
        validatedBy: userData.name,
        validationTime: new Date().toISOString()
      });

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

      setRejectPopup(null);
      setRejectReason("");
      setSelectedValidation(null);
      fetchValidationData();
    } catch (error) {
      console.error("Error updating validation status:", error);
    }
  };

  const handleViewCertificate = (file) => {
    window.open(file, "_blank");
  };

  const onStudentList = () => { navigate("/StudentList"); }
  const onNotification = () => { navigate("/Notification-faculty"); }
  const onFilter = () => { navigate("/filter"); }
  const onDashboard = () => { navigate("/FacultyDashboard"); }

  const renderDetailItem = (label, value) => {
    if (!value) return null;
    return (
      <div className="detail-item">
        <span className="detail-label">{label}</span>
        <span className="separator">: </span>
        <span className="detail-value">{value}</span>
      </div>
    );
  };

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-faculty">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-faculty">
          <button onClick={onDashboard}><FaUserTie className="menu-icon-faculty" /> Dashboard</button>
          <button onClick={onStudentList}><FaThLarge className="menu-icon-faculty" /> Student List</button>
          <button><FaCalendarAlt className="menu-icon-faculty" /> Events <span className="badge">new</span></button>
          <button onClick={onNotification}> <FaBell className="menu-icon-faculty" /> Notifications</button>
          <button onClick={onFilter}> <FaFilter className="menu-icon-faculty" /> Filter & Sort</button>
          <button><FaCog className="menu-icon-faculty" /> Settings</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content">
          <h2>Certificate Validation </h2>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading validation data...</p>
            </div>
          ) : (
            <div className="validation-container">
              <div className="students-list-container scrollable">
                <div className="section-header">
                  <h3>Students with Pending Certificates</h3>
                  <p className="subtitle">{studentsWithCertificates.length} students found</p>
                </div>

                {studentsWithCertificates.length > 0 ? (
                  <div className="students-list">
                    {studentsWithCertificates.map((student) => (
                      <div 
                        key={student.rollNo} 
                        className={`student-card ${selectedStudent?.rollNo === student.rollNo ? 'active' : ''}`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="student-info">
                          <div className="student-avatar">
                            <FaUserGraduate className="student-icon" />
                            <span className="badge">{student.validations.length}</span>
                          </div>
                          <div className="student-details">
                            <h4>{student.name}</h4>
                            <p className="student-meta">
                              <span>Roll No: {student.rollNo}</span>
                              <span>•</span>
                              <span>{student.department}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No pending validations assigned.</p>
                  </div>
                )}
              </div>

              <div className="certificates-container scrollable">
                {selectedStudent ? (
                  <>
                    <div className="section-header">
                      <div className="student-info-header">
                        <h3>{selectedStudent.name}</h3>
                        <p className="student-meta">
                          <span>Roll No: {selectedStudent.rollNo}</span>
                          <span>•</span>
                          <span>{selectedStudent.department}</span>
                          <span>•</span>
                          <span>{selectedStudent.validations.length} pending certificates</span>
                        </p>
                      </div>
                    </div>

                    {selectedStudent.validations.length > 0 ? (
                      <div className="certificate-grid">
                        {selectedStudent.validations.map((validation) => {
                          const cert = validation.certificateDetails;
                          return (
                            <div key={validation.id} className="certificate-card">
                              <div className="certificate-header">
                                <h4>{cert.certificateName}</h4>
                              </div>
                              
                              <div className="certificate-details-container">
                                {renderDetailItem("Activity", cert.activity)}
                                {renderDetailItem("Activity Head", cert.activityHead)}
                                {renderDetailItem("Sub-Activity", cert.subActivity)}
                                {renderDetailItem("Level", cert.achievementLevel)}
                                {renderDetailItem("Event Date", 
                                  cert.eventDate?.seconds ? 
                                    new Date(cert.eventDate.seconds * 1000).toLocaleDateString() : 
                                    null
                                )}
                                {renderDetailItem("Role", cert.role)}
                                {renderDetailItem("Semester", cert.semester)}
                                {renderDetailItem("Prize", cert.prize)}
                                {renderDetailItem("Status", validation.validation_status)}
                                
                                {cert.description && (
                                  <div className="description-container">
                                    <span className="detail-label">Description: </span>
                                    <p className="detail-value">{cert.description}</p>
                                  </div>
                                )}
                              </div>

                              <div className="certificate-actions">
                                <button 
                                  className="view-btn"
                                  onClick={() => handleViewCertificate(cert.fileURL)}
                                >
                                  <FaEye /> View Certificate
                                </button>
                                <div className="action-buttons">
                                  <button 
                                    className="approve-btn"
                                    onClick={() => handleAcceptCertificate(validation)}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    className="reject-btn"
                                    onClick={() => setRejectPopup(validation.id)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <FaUserGraduate />
                        </div>
                        <h4>No pending certificates</h4>
                        <p>This student has no pending certificates for validation</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <FaUserGraduate />
                    </div>
                    <h4>No student selected</h4>
                    <p>Select a student from the list to view their pending certificates</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {pointsPopup && (
          <div className="popup-overlay">
            <div className="points-popup">
              <h3>Points Calculated</h3>
              <div className="popup-content">
                <div className="certificate-summary">
                  {renderDetailItem("Certificate", selectedValidation?.certificateDetails.certificateName)}
                  {renderDetailItem("Activity", selectedValidation?.certificateDetails.activity)}
                  {renderDetailItem("Level", selectedValidation?.certificateDetails.achievementLevel)}
                </div>
                
                <div className="points-input-container">
                  <label>Points Awarded:</label>
                  <input
                    type="number"
                    value={calculatedPoints}
                    onChange={(e) => setCalculatedPoints(e.target.value)}
                    className="points-input"
                    min="0"
                  />
                </div>
              </div>
              <div className="popup-buttons">
                <button 
                  className="confirm-btn"
                  onClick={() => handleConfirmApproval(selectedValidation.id)}
                >
                  Confirm Approval
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setPointsPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {rejectPopup !== null && (
          <div className="popup-overlay">
            <div className="reject-popup">
              <h3>Reason for Rejection</h3>
              <div className="popup-content">
                {renderDetailItem("Certificate", validationData.find(v => v.id === rejectPopup)?.certificateDetails.certificateName)}
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please specify the reason for rejecting this certificate..."
                  rows={4}
                  required
                ></textarea>
              </div>
              <div className="popup-buttons">
                <button 
                  className="confirm-btn"
                  onClick={() => handleRejectCertificate(rejectPopup)}
                  disabled={!rejectReason.trim()}
                >
                  Confirm Rejection
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setRejectPopup(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};