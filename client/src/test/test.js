import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  FaCheckCircle, FaCog, 
         FaCalendarAlt, FaBell, FaSignOutAlt, 
         FaUser, FaUserTie, FaTimes, FaPlus,
         FaFilter} from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loading } from "../../Loading/Loading";
import { NotificationContainer } from "../Notification/NotificationContainer";
import './StudentListAdmin.css';

const getColor = (point) => {
  if (point <= 40) return 'red'; 
  if (point >= 75) return 'green'; 
  return 'blue';
};

export const StudentListAdmin = ({ token, userData, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "", show: false });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCertificates, setStudentCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  
  const navigate = useNavigate();
  const onAddStudent = () => { navigate("/AddStudent"); }
  const onAddFaculty = () => { navigate("/AddFaculty"); }
  const onDashboard = () => { navigate("/Admin"); }

  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };

  


  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
  }, [token, navigate]);

  if (!userData) return <Loading fullScreen={true} />;

  return (
    <div className="container">
      <NotificationContainer/>
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
          <button onClick={onDashboard}><FaUserTie className="menu-icon-Admin" /> Dashboard</button>
          <button><FaBell className="menu-icon-Admin" /> Notifications</button>
          <button><FaFilter className="menu-icon-Admin" /> Filter</button>
          <button onClick={onAddFaculty}><FaPlus className="menu-icon-Admin" /> ADD Faculty</button>
          <button onClick={onAddStudent}><FaPlus className="menu-icon-Admin" /> ADD Student</button>
          <button><FaCog className="menu-icon-Admin" /> Settings</button>
                   
          <button onClick={onLogout} className="logout-btn">
            <FaSignOutAlt className="menu-icon-Admin" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};