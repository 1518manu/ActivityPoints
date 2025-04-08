import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  FaCheckCircle, FaCog, 
         FaCalendarAlt, FaBell, FaSignOutAlt, 
         FaUser, FaUserTie, FaTimes, FaPlus,
         FaFilter} from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import './StudentListAdmin.css';

const getColor = (point) => {
  if (point <= 40) return 'red'; 
  if (point >= 75) return 'green'; 
  return 'blue';
};

export const StudentListAdmin = ({ token, userData, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCertificates, setStudentCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  
  const navigate = useNavigate();
  const onAddStudent = () => { navigate("/AddStudent"); }
  const onAddFaculty = () => { navigate("/AddFaculty"); }
  const onDashboard = () => { navigate("/Admin"); }

  const fetchStudents = async () => {
    try {
      const userDataString = localStorage.getItem('userData'); 
      const dept = userDataString ? JSON.parse(userDataString).dept : null;
      console.log("Department:", dept);
      const viewStudents = query(
        collection(db, "Students"),
        where("dept", "==", dept)
      );

      const studDoc = await getDocs(viewStudents);
      const studDataArray = studDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studDataArray);
      console.log("Students:", studDataArray);
    } catch (error) {
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

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    await fetchStudentCertificates(student.rollNo);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setStudentCertificates([]);
  };

  useEffect(() => {
    if (!token) navigate("/");
    fetchStudents();
  }, [token, navigate]);

  if (!userData) return <div className="loading-full">Loading user data...</div>;

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-Admin">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-Admin">

            <button ><FaUserTie className="menu-icon-Admin" /> Dashboard</button>
            <button > <FaBell   className="menu-icon-Admin" /> Notifications  {/* notificationCount > 0 && <span className="badge">{notificationCount}</span> */} </button>
            <button> <FaFilter   className="menu-icon-Admin" /> Filter  </button>
            <button onClick={onAddFaculty}> <FaPlus    className="menu-icon-Admin" /> ADD Faculty  </button>
            <button onClick={onAddStudent}> <FaPlus    className="menu-icon-Admin" /> ADD Student  </button>
            <button><FaCog className="menu-icon-Admin" /> Settings</button>
                   
          <button onClick={onDashboard} className="logout-btn">
            <FaSignOutAlt className="menu-icon-Admin" /> Logout
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