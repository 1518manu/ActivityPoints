
// Student.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEdit, FaUser, FaUniversity, FaUpload } from "react-icons/fa"; 
import './Student.css';

export const Student = ({ token, onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="container">
      {/* Header/Navigation */}
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Search " />
            <FaSearch style={{ color: "#ccc", fontSize: "20px", margin:" 5px 0px",fontWeight: "100" }}/>
          </div>
        </div>
        
        
        <div className="header-right">
         
          <button className="business-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-profile">
            <FaUser style={{ color: "#ccc", fontSize: "40px", margin:"5px",fontWeight: "100" }}/>
            {/* <img src="/api/placeholder/60/60" alt="Profile" className="profile-pic" /> */}
            <div className="profile-info">
              <h3>Arun M</h3>
              <p>arunmundakkal003@gmail.com</p>
            </div>
          </div>
          
          <div className="profile-completion">
            <div className="progress-bar">
              <div className="progress" style={{ width: '84%' }}></div>
            </div>
            <span className="progress-text">84%</span>
          </div>
          
          <ul className="sidebar-menu">
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
              <span className="badge">New</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>######</span>
            </li>
          </ul>
        </div>
        
        {/* Profile Content */}
        <div className="profile-content">
          <div className="profile-banner">
            <div className="banner-background">
              {/* Network graphic background */}
            </div>
            <div className="edit-button">
              <FaEdit style={{ color: "#ccc", fontSize: "15px", margin:"5px",fontWeight: "100" }}/>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="profile-header">
              <div className="profile-pic-container">
                <FaUser style={{ color: "#ccc", fontSize: "40px", margin:"5px",fontWeight: "100" }}/>
                {/*<img src="/api/placeholder/80/80" alt="Profile" className="profile-pic-large" />*/}
              </div>
              
              <div className="profile-header-info">
                <h2>Arun M</h2>
                <div className="profile-username">@arunzriv2653</div>
                <div className="profile-contact">
                  <span>+919995024963</span>
                  <span className="profile-email">arunmundakkal003@gmail.com</span>
                </div>
                <div className="profile-education">
                  <FaUniversity style={{ fontSize: "15px" ,fontWeight: "100" }} />
                  <span>TKM College of Engineering, Kerala</span>
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
      <diV className="upload-div">
        <button className="upload-button">Upload 
          <FaUpload style={{ color: "#666868", fontSize: "20px", margin:" 5px 0px",fontWeight: "100" }}/> </button>
      </diV>
    </div>
  );
};