import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseFile/firebaseConfig";
import { FaSearch, FaAward, FaEdit, FaUser, FaUniversity, FaUpload, FaThLarge, FaCog, FaCalendarAlt, FaBell , FaSignOutAlt } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import "./NotificationStudent.css";

export const NotificationPage = ({ token, userData, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async (userData) => {
    try {
      const rollNo = userData.rollNo;

      const notificationsQuery = query(
        collection(db, "Notifications"),
        where("user_id", "==", rollNo)
      );

      const notificationDocs = await getDocs(notificationsQuery);
      const notificationDataArray = notificationDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationDataArray);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      onLogout();
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    if (userData) {
      fetchNotifications(userData);
    }
  }, [token, userData, navigate]);

  
  const onCertificate = () => navigate("/certificate");
  const onNotification = () => navigate("/Notification");

  return (
    <div className="notification-container1">
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
            <button onClick={onNotification} >
                <FaBell className="menu-icon" /> Notifications  
            </button>

            <button onClick={onLogout} style={{ color: "#df0000" }}>
                <FaSignOutAlt style={{ color: "#df0000" }}className="menu-icon" /> Logout
            </button>
            </div>
            <div className={`notification-container2 ${selectedNotification ? "blur-background" : ""}`}>
            <h2 className="notification-title">Notifications</h2>
            {notifications.length === 0 ? (
                <p className="no-notifications">No notifications available.</p>
            ) : (
                <ul className="notification-list">
                {notifications.map((notification) => (
                    <li key={notification.id} className="notification-item">
                    <button
                        className="notification-button"
                        onClick={() => setSelectedNotification(notification)}
                    >
                        <h3 className="notification-heading">{notification.title || "Notification"}</h3>
                        <p className="notification-message">{notification.msg}</p>
                        <p className="notification-date">{notification.timestamp}</p>
                    </button>
                    </li>
                ))}
                </ul>
            )}

            
            </div>
            {selectedNotification && (
                <div className="notification-modal">
                <div className="notification-modal-content">
                    <button className="close-button" onClick={() => setSelectedNotification(null)}>
                    &times; 
                    </button>
                    <h2>{selectedNotification.title}</h2>
                    <p><strong>Message:</strong> {selectedNotification.msg}</p>
                    <p className="date"><strong>Date:</strong> {selectedNotification.timestamp}</p>
                </div>
                </div>
            )}
    </div>
  );
};
