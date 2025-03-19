import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaUser, FaUniversity, FaCheck, FaTimes } from "react-icons/fa";
import "./Faculty.css";

export const Faculty = ({ token, userData, onLogout }) => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  
  const navigate = useNavigate();

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

  const onValidate = () => navigate("/validate");

  const handleSemesterReport = () => {
    console.log("Generating Semester-wise Report...");
    //code for generating report
  };

  const handleYearReport = () => {
    console.log("Generating Year-wise Report...");
  };

  const dutyLeaveApplications = [
    {
      id: 1,
      studentName: "Alice Johnson",
      rollNo: "S101",
      class: "R6A",
      date: "2023-10-25",
      facultyName: "Dr. Smith",
      reason: "Medical Emergency",
      certificate: "medical_certificate.pdf",
      status: "Pending",
    },
    {
      id: 2,
      studentName: "Bob Smith",
      rollNo: "S102",
      class: "R6B",
      date: "2023-10-26",
      facultyName: "",
      reason: "Family Function",
      certificate: "family_function.pdf",
      status: "Pending",
    },
    {
      id: 3,
      studentName: "Charlie Brown",
      rollNo: "S103",
      class: "R6B",
      date: "2023-10-27",
      facultyName: "Dr. Brown",
      reason: "Sports Competition",
      certificate: "sports_certificate.pdf",
      status: "Pending",
    },
  ];

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleClosePopup = () => {
    setSelectedApplication(null);
    setRejectionReason("");
  };

  const handleApprove = () => {
    //CODE FOR APPROVING AND SEND TO CORRESPONDING FACULTY AND HOD
    const facultyName = selectedApplication.facultyName || "HOD";
    alert(`Approved application for ${selectedApplication.studentName}. Forwarded to ${facultyName}.`);
    handleClosePopup();
  };

  const handleReject = () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
    alert(`Rejected application for ${selectedApplication.studentName}. Reason: ${rejectionReason}`);
    handleClosePopup();
  };

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="container-faculty">
      <header className="header-faculty">
        <div className="header-left-faculty">
          <div className="logo-container-faculty">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-faculty">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content-faculty">
        <div className="sidebar-menu-faculty">
          <button onClick={onValidate}><img src="settings-icon.svg" className="menu-icon-faculty" /> Validate</button>
          <button><img src="messages-icon.svg" className="menu-icon-faculty" /> Messages <span className="badge">new</span></button>
          <button><img src="notifications-icon.svg" className="menu-icon-faculty" /> Notifications</button>
          <button onClick={onLogout}><img src="logout-icon.svg" className="menu-icon-faculty" /> Logout</button>
        </div>

        <div className="profile-content-faculty">
          <div className="profile-banner-faculty">
            <div className="banner-background-faculty"></div>
            <div className="edit-button-faculty">
              <FaEdit style={{ color: "#ccc", fontSize: "15px", margin: "5px", fontWeight: "100" }} />
            </div>
          </div>

          <div className="profile-details-faculty">
            <div className="profile-header-faculty">
              <div className="profile-pic-container-faculty">
                <FaUser style={{ color: "#ccc", fontSize: "40px", margin: "5px", fontWeight: "100" }} />
              </div>
              <div className="profile-header-info-faculty">
                <h2>{userData?.name || "N/A"}</h2>
                <div className="profile-username-faculty">{userData?.faculty_id || "unknown"}</div>
                <div className="profile-username-faculty">{userData?.faculty_type  || "unknown"} <div>|</div>  {userData?.email || "N/A"}</div>
                <div className="profile-education-faculty">
                  <FaUniversity style={{ fontSize: "15px", margin: "10px", fontWeight: "100" }} />
                  <span>{userData?.college}</span>
                </div>
              </div>
            </div>
            
            <div className="section-container-faculty">
              <div className="section-heade-facultyr">
                <h3>WORKS</h3>
              </div>
              <div className="boxes-container-faculty">
                <div className="box-faculty">
                  <p>total no of students</p>
                </div>
                <div className="box-faculty">
                  <p>Pending Validation</p>
                </div>
                <div className="box-faculty">
                  <p>Completed</p>
                </div>
              </div>
            </div>
            <div className="section-container-faculty">
              <div className="section-header-faculty">
                <h3>Generate Report</h3>
                <p>Analysis based on student performance semester-wise or year-wise</p>
              </div>
              <div className="buttons-container-faculty">
                <button className="report-button-faculty" onClick={() => handleSemesterReport()}>
                  Semester-wise Report
                </button>
                <button className="report-button-faculty" onClick={() => handleYearReport()}>
                  Year-wise Report
                </button>
              </div>
            </div>
              
            <div className="section-container-faculty">
              <h3>Duty-Leave Applications</h3>
              {dutyLeaveApplications.map((app) => (
                <div key={app.id} className="application-card-faculty">
                  <p><strong>Name:</strong> {app.studentName}</p>
                  <p><strong>Roll No:</strong> {app.rollNo}</p>
                  <button className="view-button-faculty" onClick={() => handleViewApplication(app)}>View Application</button>
                </div>
              ))}
            </div>

            {selectedApplication && (
              <div className="popup-overlay-faculty">
                <div className="popup-content-faculty">
                  <h3>Application Details</h3>
                  <p><strong>Name:</strong> {selectedApplication.studentName}</p>
                  <p><strong>Reason:</strong> {selectedApplication.reason}</p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                  />
                  <button onClick={handleApprove}><FaCheck /> Approve</button>
                  <button onClick={handleReject}><FaTimes /> Reject</button>
                  <button onClick={handleClosePopup}>Close</button>
                </div>
              </div>
            )}
            <div className="section-container-faculty">
              <div className="section-header-faculty">
                <h3>Recent Activities</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};







