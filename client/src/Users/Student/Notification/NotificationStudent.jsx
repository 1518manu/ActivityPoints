import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseFile/firebaseConfig";
import { FaThLarge, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NotificationStudent.css";

export const NotificationPage = ({ token, userData, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const navigate = useNavigate();

  // Function to fetch certificate by ID
  const fetchCertificateById = async (certId) => {
    try {
      if (!certId) return null;

      const certRef = doc(db, "certificates", certId);
      const certDoc = await getDoc(certRef);

      console.log(certDoc.data());

      return certDoc.exists() ? {
        id: certDoc.id,
        certificateName: certData.certificateName?.stringValue || "N/A",
        activity: certData.activity?.stringValue || "N/A",
        role: certData.role?.stringValue || "N/A",
        eventDate: certData.eventDate?.stringValue || "N/A",
        certificateDate: certData.certificateDate?.stringValue || "N/A",
        fileURL: certData.fileURL?.stringValue || null,
        semester: certData.semester?.stringValue || "N/A",
        uploadedAt: certData.uploadedAt?.timestampValue || "N/A",
      } : null;
      
    } catch (error) {
      console.error("Error fetching certificate:", error);
      return null;
    }
  };

  // Function to fetch notifications and related certificates
  const fetchNotifications = async (userData) => {
    try {
      const rollNo = userData.rollNo;
      const notificationsQuery = query(collection(db, "Notifications"), where("user_id", "==", rollNo));
      const notificationDocs = await getDocs(notificationsQuery);

      const notificationDataArray = await Promise.all(
        notificationDocs.docs.map(async (doc) => {
          const notificationData = { id: doc.id, ...doc.data() };

          if (notificationData.cert_id) {
            const certificate = await fetchCertificateById(notificationData.cert_id);
            notificationData.certificate = certificate;
          }

          return notificationData;
        })
      );

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
        <button onClick={onNotification}>
          <FaBell className="menu-icon" /> Notifications
        </button>
        <button onClick={onLogout} style={{ color: "#df0000" }}>
          <FaSignOutAlt className="menu-icon" style={{ color: "#df0000" }} /> Logout
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
                  onClick={() => {
                    setSelectedNotification(notification);
                    setSelectedCertificate(notification.certificate || null);
                  }}
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
            <button className="close-button" onClick={() => {
              setSelectedNotification(null);
              setSelectedCertificate(null);
            }}>
              &times;
            </button>
            <h2>{selectedNotification.title}</h2>
            <p><strong>Message:</strong> {selectedNotification.msg}</p>
            <p className="date"><strong>Date:</strong> {selectedNotification.timestamp}</p>

            {selectedCertificate && (
              <div className="certificate-details">
                <h3>Certificate Details</h3>
                <p><strong>Certificate ID:</strong> {selectedCertificate.id}</p>
                <p><strong>Issued By:</strong> {selectedCertificate.issuedBy}</p>
                <p><strong>Date Issued:</strong> {selectedCertificate.dateIssued}</p>
                <p><strong>Category:</strong> {selectedCertificate.category}</p>
                <p><strong>Description:</strong> {selectedCertificate.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
