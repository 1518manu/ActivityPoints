
// Student.js
import React from 'react';
import './Student.css';

export const Student = ({ token, onLogout }) => {
  return (
    <div className="unstop-container">
      {/* Header/Navigation */}
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Unstop Logo" className="logo" />
          </div>
          <div className="search-bar">
            <img src="/api/placeholder/20/20" alt="Search Icon" className="search-icon" />
            <input type="text" placeholder="Search Opportunities" />
          </div>
        </div>
        
        <div className="nav-links">
          <a href="#internships">Internships</a>
          <a href="#jobs">Jobs</a>
          <a href="#competitions">Competitions</a>
          <a href="#mentorships">Mentorships</a>
          <a href="#practice">Practice</a>
          <div className="dropdown">
            <a href="#more">More</a>
            <img src="/api/placeholder/16/16" alt="Dropdown Icon" className="dropdown-icon" />
          </div>
        </div>
        
        <div className="header-right">
          <img src="/api/placeholder/24/24" alt="Message Icon" className="icon" />
          <img src="/api/placeholder/24/24" alt="Notification Icon" className="icon" />
          <div className="profile-thumbnail">
            <img src="/api/placeholder/36/36" alt="Profile" className="profile-pic-small" />
          </div>
          <button className="host-btn">
            <span>+</span> Host
          </button>
          {/* Replaced "For Business" button with Logout button */}
          <button className="business-btn" onClick={onLogout}>
            <img src="/api/placeholder/16/16" alt="Logout Icon" className="business-icon" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-profile">
            <img src="/api/placeholder/60/60" alt="Profile" className="profile-pic" />
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
              <span>Registrations/Applications</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Referrals</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>My Rounds</span>
              <span className="badge">New</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Unstop Awards Nominations</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Watchlist</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Recently Viewed</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Mentor Sessions</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Courses</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Certificates</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Unstop Coins</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Settings</span>
            </li>
            <li>
              <img src="/api/placeholder/20/20" alt="Icon" className="menu-icon" />
              <span>Unstop Pro Subscription</span>
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
              <img src="/api/placeholder/20/20" alt="Edit" className="edit-icon" />
            </div>
          </div>
          
          <div className="profile-details">
            <div className="profile-header">
              <div className="profile-pic-container">
                <img src="/api/placeholder/80/80" alt="Profile" className="profile-pic-large" />
                <div className="profile-progress">84%</div>
              </div>
              
              <div className="profile-header-info">
                <h2>Arun M</h2>
                <div className="profile-username">@arunzriv2653</div>
                <div className="profile-contact">
                  <span>+919995024963</span>
                  <span className="profile-email">arunmundakkal003@gmail.com</span>
                </div>
                <div className="profile-education">
                  <img src="/api/placeholder/16/16" alt="Education" className="education-icon" />
                  <span>TKM College of Engineering, Kerala</span>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="share-btn">
                  <img src="/api/placeholder/20/20" alt="Share" className="share-icon" />
                </button>
                <button className="visibility-btn">
                  <img src="/api/placeholder/20/20" alt="Visibility" className="visibility-icon" />
                </button>
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
      
      {/* Footer/Taskbar */}
      <div className="windows-taskbar">
        <div className="taskbar-left">
          <img src="/api/placeholder/24/24" alt="Start" className="taskbar-icon" />
          <div className="search-taskbar">
            <img src="/api/placeholder/16/16" alt="Search" className="search-taskbar-icon" />
            <span>Search</span>
          </div>
          <div className="taskbar-icons">
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
            <img src="/api/placeholder/24/24" alt="App Icon" className="taskbar-app" />
          </div>
        </div>
        <div className="taskbar-right">
          <img src="/api/placeholder/16/16" alt="Up Arrow" className="taskbar-icon-small" />
          <div className="language-indicator">
            <span>ENG</span>
            <span>IN</span>
          </div>
          <img src="/api/placeholder/16/16" alt="Network" className="taskbar-icon-small" />
          <img src="/api/placeholder/16/16" alt="Sound" className="taskbar-icon-small" />
          <img src="/api/placeholder/16/16" alt="Battery" className="taskbar-icon-small" />
          <div className="time-date">
            <div className="time">12:51</div>
            <div className="date">26-02-2025</div>
          </div>
        </div>
      </div>
    </div>
  );
};