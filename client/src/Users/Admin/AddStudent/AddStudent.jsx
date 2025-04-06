import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  FaCheckCircle, FaCog, 
         FaCalendarAlt, FaBell, FaSignOutAlt, 
         FaUser, FaUserTie, FaTimes,
         FaFilter} from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import './AddStudent.css';

const getColor = (point) => {
  if (point <= 40) return 'red'; 
  if (point >= 75) return 'green'; 
  return 'blue';
};

export const AddStudent = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();




  useEffect(() => {
    if (!token) navigate("/");
    fetchStudents();
  }, [token, navigate]);

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
        <button onClick={() => navigate("/Admin")}><FaUserTie className="menu-icon-faculty" /> Dashboard</button>
          <button><FaCog className="menu-icon-faculty" /> Settings</button>
          <button onClick={onLogout} className="logout-btn">
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content">


      </div>

      </div>
    </div>
  );
};