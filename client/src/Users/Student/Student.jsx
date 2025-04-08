import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaEdit, FaUser, FaUniversity, FaUpload, FaThLarge, FaCog, FaCalendarAlt, FaBell , FaSignOutAlt } from "react-icons/fa"; 
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { fetchUserData, fetchUserRole } from "../../Login/dataApi/userDataApi"
import { collection, query, where, onSnapshot ,getDocs} from "firebase/firestore";
import { db } from "../../firebaseFile/firebaseConfig";
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


export const Student = ({ token, userData: initialUserData, onLogout }) => {
  const [progress, setProgress] = useState(0); 
  const [userData, setUserData] = useState(initialUserData);
  const [notificationCount, setNotificationCount] = useState(0);
  const [dutyLeaveApplications, setDutyLeaveApplications] = useState([]);
  const navigate = useNavigate();

  console.log("Student Data:", userData);
  console.log("Token:", token);


  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-100 px-2 py-1 rounded-md";
      case "pending":
        return "text-blue-600 bg-blue-100 px-2 py-1 rounded-md";
      case "rejected":
        return "text-red-600 bg-red-100 px-2 py-1 rounded-md";
      default:
        return "text-gray-600 bg-gray-100 px-2 py-1 rounded-md"; // Default style
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching user data... email:", initialUserData?.email);
        const role = await fetchUserRole(initialUserData?.email); // Fetch role first
        if (role) {
          const updatedUserData = await fetchUserData(initialUserData?.email, role);
          if (updatedUserData) {
            setUserData(updatedUserData);
            setProgress(updatedUserData?.point || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
     // Fetch duty-leave applications
    
  }, [token, initialUserData?.email, navigate]);

  const fetchApplications = async () => {
    if (!userData?.rollNo) return; // Ensure userData.rollNo is available

    try {
      const dutyLeaveRef = collection(db, "Dutyleave");
      const q = query(dutyLeaveRef, where("rollNo", "==", userData.rollNo));
      const querySnapshot = await getDocs(q);

      const applications = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        slNo: index + 1,
        ...doc.data(),
      }));

      setDutyLeaveApplications(applications);
    } catch (error) {
      console.error("Error fetching duty-leave applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications(); // Fetch applications when rollNo is available
  }, [userData?.rollNo]); // Re-run when rollNo changes
  useEffect(() => {
    if (!userData?.rollNo) return;

    const notificationsRef = collection(db, "Notifications");
    const q = query(notificationsRef, where("user_id", "==", userData.rollNo));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.size); // Update notification count
    });
    
    return () => unsubscribe();
  }, [userData?.rollNo]);
  
  const openUploadPage = () => navigate("/upload-certificate");
  const onCertificate = () => navigate("/certificate");
  const onNotification = () => navigate("/Notification");
  const onDutyLeave = () => navigate("/duty-leave");
  const onEvent = () => navigate("/StudentEvents");
  
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

          <button  onClick={onEvent}>
            <FaFileAlt className="menu-icon" /> Event <span className="badge">new</span>
          </button>
          
          <button onClick={onDutyLeave}>
            <FaCalendarAlt className="menu-icon" /> Duty leave 
          </button>

          <button onClick={onNotification} >
          <FaBell className="menu-icon" /> Notifications  
          {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
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
                  <span>{userData?.phone || "N/A"}</span><div>|</div>
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
    {userData?.about || "Craft an engaging story in your bio and make meaningful connections with peers and recruiters alike!"}
  </p>
  <button className="add-button">Add About</button>
</div>

{/* Duty-Leave Applications Section */}
<div className="section-container">
      <div className="section-header">
        <h3>Duty-Leave Applications</h3>
      </div>
      {dutyLeaveApplications.length > 0 ? (
        <div className="duty-leave-list">
          {dutyLeaveApplications.map((app) => (
            <div key={app.id} className="application-card-faculty p-4 border border-gray-300 rounded-lg shadow-md">
              <p><strong>Sl. No:</strong> {app.slNo}</p>
              <p><strong>Reason:</strong> {app.leaveReason}</p>
              <p>
                <strong>Status:</strong> 
                <span className={`ml-2 font-semibold ${getStatusClass(app.status)}`}>
                  {app.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No duty-leave applications available.</p>
      )}
    </div>

<div className="section-container">
  <div className="section-header">
    <h3>Resume</h3>
  </div>
  <div className="resume-section">
    <h4>Add your Resume & get your profile filled in a click!</h4>
    <p>Adding your Resume helps you to tell who you are and what makes you different—to employers and recruiters.</p>
    <button className="upload-resume-btn">Upload Resume</button>
  </div>
</div>

          </div>
        </div>
      </div>

      <div className="upload-div">
        <button className="upload-button" onClick={openUploadPage}>Upload Certificate<FaUpload style={{ color: "#fff", fontSize: "20px", margin: "5px 0px", fontWeight: "100" }} /></button>
      </div>
    </div>
  );
};