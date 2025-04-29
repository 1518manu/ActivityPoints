import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  FaCheckCircle, FaCog, 
         FaCalendarAlt, FaBell, FaSignOutAlt, 
         FaUser, FaUserTie, FaTimes,
         FaFilter} from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs ,addDoc} from 'firebase/firestore';
import { Loading } from "../../../Loading/Loading"
import './StudentList.css';

const getColor = (point) => {
  if (point <= 40) return 'red'; 
  if (point >= 75) return 'green'; 
  return 'blue';
};

export const StudentList = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCertificates, setStudentCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [loding , setLoading] = useState(true);
  const [message, setMessage] = useState(false);
  const [minPoints, setMinPoints] = useState("");
  const fetchStudents = async () => {
    try {
      const userDataString = localStorage.getItem('userData'); 
      const facultyId = userDataString ? JSON.parse(userDataString).faculty_id : null;

      const viewStudents = query(
        collection(db, "Students"),
        where("mentor", "==", facultyId)
      );

      const studDoc = await getDocs(viewStudents);
      const studDataArray = studDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studDataArray);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching students:", error);
    }
  };

  const fetchStudentCertificates = async (rollNo) => {
    try {
      setLoadingCertificates(true);
      const q = query(collection(db, "certificates"), where("user_id", "==", rollNo));
      const querySnapshot = await getDocs(q);
      const certs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fileUrl: doc.data().fileUrl || doc.data().fileURL // Handle both cases
      }));
      setStudentCertificates(certs);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoadingCertificates(false);
    }
  };
  const handleSendNotification = async () => {
    try {
      const minPointsNum = Number(minPoints);
      if (isNaN(minPointsNum)) {
        alert("Please enter a valid number");
        return;
      }
  
      const studentsRef = collection(db, "Students");
      const studentsSnapshot = await getDocs(studentsRef);
  
      const studentsToNotify = studentsSnapshot.docs.filter(doc => {
        const points = doc.data().point || 0;
        return points < minPointsNum;
      });
  
      const notificationsRef = collection(db, "Notifications");
  
      for (const student of studentsToNotify) {
        const rollNo = student.data().rollNo;
        await addDoc(notificationsRef, {
          cert_id: null, // No specific cert in this case
          for: "student",
          msg: "You have less points. Participate in events and upload certificates!",
          status: "not viewed",
          type: "reminder",
          user_id: rollNo,
          timestamp: new Date().toISOString(),
        });
      }
  
      alert("Notification sent!");
      setMinPoints(""); 
      setMessage(false);
    } catch (error) {
      console.error("Error sending notifications:", error);
      alert("Failed to send notifications");
    }
  };
  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    await fetchStudentCertificates(student.rollNo);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setStudentCertificates([]);
  };

  useEffect(() => {
    fetchStudents();
  }, [token, navigate]);

  const onMessage = () => {
    console.log("Message button clicked!");
    setMessage(true);
  }
  
  if(!token) navigate("/");

  if (!userData) return <Loading />;

  return (
    <div className="container">
      {message && (
        <div className="message-overlay">
          <div className="message-modal">
            <div className="message-header">
              <h3>Send Notification</h3>
            </div>
            <div className="message-content">
              <div>  
                <input
                  type="number"
                  className="min-points"
                  placeholder="Enter minimum points"
                  value={minPoints}
                  onChange={(e) => setMinPoints(e.target.value)}
                />
              </div>
              <button className="send-button" onClick={handleSendNotification}>
                Send
              </button>
              <button className="cancel-button" onClick={() => setMessage(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="https://ik.imagekit.io/yx0worcwu/logo.jpg?updatedAt=1745328786060" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-faculty">
          <button onClick={onMessage} className="filter-sort-btn">Send Notification</button>
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-faculty">
        <button onClick={() => navigate("/FacultyDashboard")}><FaUserTie className="menu-icon-faculty" /> Dashboard</button>
          <button onClick={() => navigate("/Validate")}>
            <FaCheckCircle className="menu-icon-faculty" /> Validate
          </button>
          <button onClick={() => navigate("/Notification-faculty")}>
            <FaBell className="menu-icon-faculty" /> Notifications
          </button>
          <button onClick={() => navigate("/filter")}>
            <FaFilter className="menu-icon-faculty" /> Filter & Sort
          </button>
          <button onClick={onLogout} className="logout-btn">
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content">
          <h2>Student List</h2>

          <div className="student-list">
            {students.map((student) => (
              <div 
                key={student.id}
                className="student-card"
                onClick={() => handleStudentClick(student)}
              >
                <div className="student-card-header">
                  <div className="profile-image-container">
                    {student.profileImg ? (
                      <img 
                        src={student.profileImg} 
                        alt={`${student.name}'s profile`}
                        className="profile-image"
                      />
                    ) : (
                      <div className="default-profile-icon">
                        <FaUser size={24} />
                      </div>
                    )}
                  </div>
                  <div className="student-info-main">
                    <h3>{student.name}</h3>
                    <span className={`student-points ${getColor(student.point)}`}>
                      {student.point} pts
                    </span>
                  </div>
                </div>
                <div className="student-card-details">
                  <div className="detail-row">
                    <span className="detail-label">Roll No:</span>
                    <span>{student.rollNo}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Department:</span>
                    <span>{student.dept}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="student-email">{student.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Modal Overlay */}
      <div className={`modal-overlay ${selectedStudent ? 'active' : ''}`}>
        {selectedStudent && (
          <div className="student-modal">
            <div className="modal-header">
              <h3>{selectedStudent.name}'s Details</h3>
              <button className="close-button1" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              <div className="student-info">
                <div className="info-row">
                  <span className="info-label">Roll No:</span>
                  <span>{selectedStudent.rollNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Department:</span>
                  <span>{selectedStudent.dept}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Points:</span>
                  <span style={{color: getColor(selectedStudent.point)}}>
                    {selectedStudent.point || 0}
                  </span>
                </div>
              </div>

              <div className="certificates-section">
                <h4>Certificates ({studentCertificates.length})</h4>
                {loadingCertificates ? (
                  <div className="loading-spinner"></div>
                ) : studentCertificates.length === 0 ? (
                  <p className="no-certificates">No certificates found</p>
                ) : (
                  <div className="certificate-list">
                    {studentCertificates.map((cert) => (
                      <div key={cert.id} className="certificate-item">
                        <div className="certificate-header">
                          <strong>{cert.certificateName || 'Unnamed Certificate'}</strong>
                          <span className={`status ${cert.status?.toLowerCase()}`}>
                            {cert.status || 'Pending'}
                          </span>
                        </div>
                        <div className="certificate-details">
                          <p><span className="detail-label">Organization:</span> {cert.activity || 'N/A'}</p>
                          <p><span className="detail-label">Date:</span> {cert.eventDate || 'Unknown'}</p>
                          <p><span className="detail-label">Points:</span> <span className="points-value">{cert.points || 0}</span></p>
                          
                          {cert.fileUrl && (
                            <div className="certificate-preview-container">
                              <iframe 
                                src={cert.fileUrl}
                                title={`Certificate: ${cert.certificateName}`}
                                className="certificate-frame"
                                frameBorder="0"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = document.getElementById(`fallback-${cert.id}`);
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              ></iframe>
                              <div id={`fallback-${cert.id}`} className="certificate-fallback">
                                <p>Certificate preview unavailable</p>
                                <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
                                  View certificate in new tab
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};