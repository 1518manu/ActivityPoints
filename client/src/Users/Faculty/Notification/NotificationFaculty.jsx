import  { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseFile/firebaseConfig";
import {  FaThLarge, FaCheckCircle, FaCog,
   FaCalendarAlt,  FaSignOutAlt,
     FaUserTie,
     FaFilter} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Loading } from "../../../Loading/Loading";
import "./NotificationFaculty.css";

export const NotificationPageFaculty = ({ token, userData, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const navigate = useNavigate();

  // Function to fetch notifications and related certificates
  const fetchNotifications = async (userData) => {
    setLoading(true);
    try {
      console.log("Fetching notifications for user:", userData);
      const facultyId = userData.faculty_id;
      const notificationsQuery = query(collection(db, "Notifications"), where("user_id", "==", facultyId));
      const notificationDocs = await getDocs(notificationsQuery);

      const notificationDataArray = await Promise.all(
        notificationDocs.docs.map(async (doc) => {
          const notificationData = { id: doc.id, ...doc.data() };

          

          return notificationData;
        })
      );
      console.log(notificationDataArray);
      setNotifications(notificationDataArray);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      onLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/");
    if (userData) fetchNotifications(userData);
  }, [token, userData, navigate]);

  const onValidate = () => { navigate("/Validate"); }
  const onStudentList = () => { navigate("/StudentList"); }
  const onDashboard = () => { navigate("/FacultyDashboard"); }

  return (loading ? (
    <Loading />
  ) :(
    <div className="container">
      {/* Header/Navbar */}
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
    <div className="notification-container1">
      {/* Sidebar Menu */}
      <div className={`sidebar-menu  ${selectedNotification ? "blur-background" : ""}`}>
      <button  onClick={onDashboard}> <FaUserTie   className="menu-icon-faculty" /> Dashboard  </button>
          <button onClick={onValidate}><FaCheckCircle className="menu-icon-faculty" /> Validate</button>
          <button onClick={onStudentList}><FaThLarge className="menu-icon-faculty" /> Student List</button>
          <button><FaCalendarAlt className="menu-icon-faculty" /> Events <span className="badge">new</span></button>
          <button onClick={() => navigate("/filter")} ><FaFilter className="menu-icon-faculty" /> Filter & Sort</button>
          <button><FaCog className="menu-icon-faculty" /> Settings</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

      {/* Notifications List */}
      <div className={`notification-container2 ${selectedNotification ? "blur-background" : ""}`}>
        <h2 className="notification-title">Notifications</h2>

        { notifications.length === 0 ? (
          <p className="no-notifications">No notifications available.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li key={notification.id} className="notification-item">
                <button
                  className="notification-button"
                  onClick={() => {
                    setSelectedNotification(notification);
                    setSelectedCertificate(notification.certificate || null);
                  }}
                >
                  <h3 className="notification-heading">{notification.title || "Notification"}</h3>
                  <p className="notification-message">{notification.msg}</p>
                  <p className="notification-date">
                    {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : "N/A"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notification Modal */}
      {selectedNotification && (
        <div className="notification-modal">
          <div className="notification-modal-content">
            <button className="close-button" onClick={() => {
              setSelectedNotification(null);
              setSelectedCertificate(null);
            }}>
              &times;
            </button>
            <h2>{selectedNotification.title}</h2>
            <p><strong>Message:</strong> {selectedNotification.msg}</p>
            <p className="date"><strong>Date:</strong> {selectedNotification.timestamp ? new Date(selectedNotification.timestamp).toLocaleString() : "N/A"}</p>

            {/* Certificate Details */}
            {selectedCertificate && (
              <div className="certificate-details">
                <h3>Certificate Details</h3>
                
                <iframe
                    src={selectedCertificate.fileURL}
                    className="pdf-preview"
                    title={`Preview of ${selectedCertificate.certificateName}`}
                    style={{ border: "none" }}
                  ></iframe>
                <table className="certificate-table">
                  <tbody>
                    <tr>
                      <td><strong>Certificate Name:</strong></td>
                      <td>{selectedCertificate.certificateName}</td>
                    </tr>
                    <tr>
                      <td><strong>Activity:</strong></td>
                      <td>{selectedCertificate.activity}</td>
                    </tr>
                    <tr>
                      <td><strong>Role:</strong></td>
                      <td>{selectedCertificate.role}</td>
                    </tr>
                    <tr>
                      <td><strong>Event Date:</strong></td>
                      <td>{selectedCertificate.eventDate}</td>
                    </tr>
                    <tr>
                      <td><strong>Certificate Date:</strong></td>
                      <td>{selectedCertificate.certificateDate}</td>
                    </tr>
                    <tr>
                      <td><strong>Semester:</strong></td>
                      <td>{selectedCertificate.semester}</td>
                    </tr>
                    <tr>
                      <td><strong>Uploaded At:</strong></td>
                      <td>{selectedCertificate.uploadedAt}</td>
                    </tr>
                    <tr>
                      <td><strong>Issued By:</strong></td>
                      <td>{selectedCertificate.issuedBy}</td>
                    </tr>
                    <tr>
                      <td><strong>Date Issued:</strong></td>
                      <td>{selectedCertificate.dateIssued}</td>
                    </tr>
                    <tr>
                      <td><strong>Category:</strong></td>
                      <td>{selectedCertificate.category}</td>
                    </tr>
                    <tr>
                      <td><strong>Description:</strong></td>
                      <td>{selectedCertificate.description}</td>
                    </tr>
                    
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
    </div>)
  );
};
