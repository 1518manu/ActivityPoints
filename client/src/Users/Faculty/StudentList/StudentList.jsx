import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
//import { certificatesFetch } from "../certificatesFetch/certificatesFetch"
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { doc, updateDoc, addDoc ,getDoc } from 'firebase/firestore';
import './StudentList.css';

export const StudentList = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  
  //---------------------------------------fetching students from the database-------------------------------------
const [students, setStudents] = useState([]);

// Fetch students and set the state
const fetchStudents = async () => {
  try {
    const userDataString1 = localStorage.getItem('userData'); 
    let facultyId = null;

    if (userDataString1) {
      const userData1 = JSON.parse(userDataString1);
      facultyId = userData1.faculty_id;
      console.log("Faculty ID inside IF:", facultyId);
    }

    const viewStudents = query(
      collection(db, "Students"),
      where("mentor", "==", facultyId)
    );

    const studDoc = await getDocs(viewStudents);
    const studDataArray = [];

    for (const doc of studDoc.docs) {
      const studData = { id: doc.id, ...doc.data() };  // Include document ID for 'key'
      console.log("Student Data:", studData);
      studDataArray.push(studData);
    }

    setStudents(studDataArray);  // Set the data to state
  } catch (error) {
    console.error("Error fetching students:", error);
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
    
    fetchStudents();
    
  }, [token, userData, navigate]);

  if (!userData) {
    return <div>Loading user data...</div>;
  }
  
  const [selectedStudent, setSelectedStudent] = useState(null);
 
  
  const handleSelectStudent = (studentId) => {
    setSelectedStudent(studentId);
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
        <div className="sidebar-menu">
          <button><img src="settings-icon.svg" className="menu-icon" /> Settings</button>
          <button><img src="settings-icon.svg" className="menu-icon" /> Validate</button>
          <button><img src="notifications-icon.svg" className="menu-icon" /> Manage Faculty</button>
          <button><img src="notifications-icon.svg" className="menu-icon" /> Notifications</button>
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
        <p>Points: {student.point}</p>
      </div>
    ))}
  </div>
</div>

           
                      

 </div>
          
        </div>
      </div>
    </div>
  );
};
