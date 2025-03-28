import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaThLarge, FaCheckCircle, FaCog,
   FaCalendarAlt, FaBell, FaSignOutAlt,
     FaUser, FaUniversity, FaCheck, FaTimes } from "react-icons/fa";

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
    console.log("Student Data Array:", studDataArray);
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
          <button ><FaThLarge className="menu-icon-faculty" /> Student List</button>
          <button><FaCalendarAlt className="menu-icon-faculty" /> Events <span className="badge">new</span></button>
          <button  onClick={onNotification}> <FaBell   className="menu-icon-faculty" /> Notifications </button>
          <button><FaCog className="menu-icon-faculty" /> Settings</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content">
          <h2>Student List</h2>

          <div className="student-certificates-container">
            {/* Students List Section */}
            <div className="student-list-container">
  <div className="section-header">
    <h3>Student List</h3>
  </div>
  <div className="student-list">
    {students.map((student) => (
      <button
        key={student.id}
        className=  { "student-item" `student-card ${selectedStudent === student.id ? "selected" : ""}`}
        onClick={() => handleSelectStudent(student.id)}
      >
        <p><strong>{student.name}</strong></p>
        <p>Roll No: {student.rollNo}</p>
        <p>Points: {student.point}</p>
      </button>
    ))}
  </div>
</div>

           
                      

 </div>
          
        </div>
      </div>
    </div>
  );
};
