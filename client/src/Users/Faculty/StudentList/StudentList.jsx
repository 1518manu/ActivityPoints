import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaThLarge, FaCheckCircle, FaCog, 
         FaCalendarAlt, FaBell, FaSignOutAlt, 
         FaUser, FaUniversity, FaTimes} from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import './StudentList.css';

const getColor = (point) => {
  if (point <= 40) {
    return 'red'; 
  } else if (point >= 75) {
    return 'green'; 
  } else { 
    return 'blue';
  }
};

export const StudentList = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCertificates, setStudentCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const fetchStudents = async () => {
    try {
      const userDataString1 = localStorage.getItem('userData'); 
      let facultyId = null;

      if (userDataString1) {
        const userData1 = JSON.parse(userDataString1);
        facultyId = userData1.faculty_id;
      }

      const viewStudents = query(
        collection(db, "Students"),
        where("mentor", "==", facultyId)
      );

      const studDoc = await getDocs(viewStudents);
      const studDataArray = [];

      for (const doc of studDoc.docs) {
        const studData = { id: doc.id, ...doc.data() };
        studDataArray.push(studData);
      }
      setStudents(studDataArray);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStudentCertificates = async (rollNo) => {
    try {
      console.log("Fetching certificates for rollNo:", rollNo);
      setLoadingCertificates(true);
      const q = query(collection(db, "certificates"), where("user_id", "==", rollNo));
      const querySnapshot = await getDocs(q);
      const certs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Certificates fetched:", certs);
      setStudentCertificates(certs);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    console.log("Student clicked:", student);
    console.log("Selected Student:", student);
    await fetchStudentCertificates(student.rollNo);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setStudentCertificates([]);
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    fetchStudents();
  }, [token, userData, navigate]);

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
        <div className="header-right"></div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-faculty">
          <button onClick={() => navigate("/Validate")}>
            <FaCheckCircle className="menu-icon-faculty" /> Validate
          </button>
          <button><FaThLarge className="menu-icon-faculty" /> Student List</button>
          <button><FaCalendarAlt className="menu-icon-faculty" /> Events <span className="badge">new</span></button>
          <button onClick={() => navigate("/Notification-faculty")}>
            <FaBell className="menu-icon-faculty" /> Notifications
          </button>
          <button><FaCog className="menu-icon-faculty" /> Settings</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content">
          <h2>Student List</h2>

          <div className="student-certificates-container">
            <div className="student-list-container">
              <div className="student-list">
                {students.map((student) => {
                  const pointColor = getColor(student.point);
                  return (
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
                          <span className={`student-points ${pointColor}`}>
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
                        <div className="detail-row">
                          <span className="detail-label">Phone:</span>
                          <span>{student.phone}</span>
                        </div>
                      </div>
                      <div className="student-card-footer">
                        <button className="view-profile-btn">View Profile</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="student-modal">
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="close-button" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="student-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span>{selectedStudent.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Roll No:</span>
                <span>{selectedStudent.rollNo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Department:</span>
                <span>{selectedStudent.dept}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Total Points:</span>
                <span style = {{color:`${getColor(selectedStudent.point)}`}}>{selectedStudent.point || 0}</span>
              </div>
            </div>

            <div className="certificates-section">
              <h4>Certificates ({studentCertificates.length})</h4>
              {loadingCertificates ? (
                <div className="loading">Loading certificates...</div>
              ) : studentCertificates.length === 0 ? (
                <p>No certificates found</p>
              ) : (
                <div className="certificate-list">
                  {studentCertificates.map((cert) => (
                    <div key={cert.id} className="certificate-item">
                      <div className="certificate-header">
                        <strong>{cert.certificateName || 'Unnamed Event'}</strong>
                        <span className={`status ${cert.status?.toLowerCase()}`}>
                          {cert.status || 'Pending'}
                        </span>
                      </div>
                      <div className="certificate-details">
                        <p>Organization: {cert.activity || 'N/A'}</p>
                        <p>Date: {cert.eventDate || 'Unknown'}</p>
                        <p>Points: <span style={{ color: 'blue' }}>{cert.points || 0}</span></p>
                        {cert.fileUrl && (
                          <div className="certificate-preview">
                            <iframe 
                              src={cert.fileUrl} 
                              title="Certificate Preview"
                              className="certificate-frame"
                              frameBorder="0"
                              loading="lazy"
                            ></iframe>
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
  );
};