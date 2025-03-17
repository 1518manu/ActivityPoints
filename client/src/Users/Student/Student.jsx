import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEdit, FaUser, FaUniversity, FaUpload, FaThLarge, FaCog, FaCalendarAlt, FaBell , FaSignOutAlt } from "react-icons/fa"; 
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Student.css';

const getColor = (point) => {
  if (point <= 40) {
     return 'red'; 
  } else if (point >= 75) {
     return 'green'; 
  } else { 
    return 'blue';
  } 
};


export const Student = ({ token, userData, onLogout }) => {
  const [progress, setProgress] = useState(0);

  console.log("Student Data:", userData);
  console.log("Token:", token);
  const navigate = useNavigate();

  useEffect(() => {
    setProgress(userData?.point || 0); // Directly set progress without setInterval
  }, [userData]);
  

  useEffect(() => {
    if (!token) {
      navigate("/");
    }

    if (userData) {
      console.log("Student Data Loaded:", userData);
    } else {
      console.warn("No user data available!");
    }
  }, [token, userData, navigate]);

  const openUploadPage = () => navigate("/upload-certificate");

  const onCertificate = () => navigate("/certificate");
  if (!userData) {
    return <div>Loading user data...</div>; // Prevent render until data is ready
  }
  
  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Search " />
            <FaSearch style={{ color: "#ccc", fontSize: "20px", margin: "5px 0px", fontWeight: "100" }} />
          </div>
        </div>

        <div className="header-right">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu">
          <button onClick={onCertificate}>
            <FaThLarge className="menu-icon" /> Certificates
          </button>

          <button>
            <FaCog className="menu-icon" /> Settings
          </button>

          <button>
            <FaCalendarAlt className="menu-icon" /> Event <span className="badge">new</span>
          </button>

          <button>
            <FaBell   className="menu-icon" /> Notifications  <span className="badge">new</span>
          </button>

          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt style={{ color: "#df0000" }}className="menu-icon" /> Logout
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-banner">
            <div className="banner-background"></div>
            <div className="edit-button">
              <FaEdit style={{ color: "#ccc", fontSize: "15px", margin: "5px", fontWeight: "100" }} />
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-header">
              <div className="profile-pic-container">
                <div className="progress-container">
                  
                  <CircularProgressbar
                    value={progress }
                    maxValue={100}
                    strokeWidth={4} 
                    styles={buildStyles({
                      pathColor: getColor(userData?.point || 0),
                      trailColor: '#e5e7eb',
                      textSize: '16px'
                    })}
                  />
                  <div className="progress-icon">
                    <FaUser style={{ color: "#ccc", fontSize: "40px", margin: "5px", fontWeight: "100" }} />
                  </div>
                </div>
              </div>

              <div className="profile-header-info">
                <div className="profile-name_points">
                  <h2>{userData?.name || "N/A"}</h2> 
                  <div className = "points"   style={{ color: getColor(userData?.point || 0)  }}>{userData?.point || 0} </div>
                  <div className="points_text">points</div>
                </div>
                <div className = "profile-username">{userData?.rollNo || "unknown"}</div>
                <div className = "profile-contact">
                  <span>{userData?.phone || "N/A"}</span>
                  <span className="profile-email">{userData?.email || "N/A"}</span>
                </div>
                <div className="profile-education">
                  <FaUniversity style={{ fontSize: "15px", margin: "10px", fontWeight: "100" }} />
                  <span>{userData?.college || "unknown"}</span>
                </div>
              </div>
            </div>

            <div className="section-container">
              <div className="section-header">
                <h3>About</h3>
              </div>
              <p className="section-prompt">
                Craft an engaging story in your bio and make meaningful connections with peers and recruiters alike!
              </p>
              <button className="add-button">Add About</button>
            </div>

            <div className="section-container">
              <div className="section-header">
                <h3>Resume</h3>
              </div>
              <div className="resume-section">
                <h4>Add your Resume & get your profile filled in a click!</h4>
                <p>Adding your Resume helps you to tell who you are and what makes you different—to employers and recruiters</p>
                <button className="upload-resume-btn">Upload Resume</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-div">
        <button className="upload-button" onClick={openUploadPage}>Upload <FaUpload style={{ color: "#fff", fontSize: "20px", margin: "5px 0px", fontWeight: "100" }} /></button>
      </div>
    </div>
  );
};