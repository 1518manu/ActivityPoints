import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseFile/firebaseConfig"; 
import { useNavigate } from "react-router-dom";
import "./NotificationStudent.css"; 
import { use } from "react";

export const NotificationPage = ({ token, userData, onLogout }) => {
    
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

    const fetchNotifications = async (userData) => {
      try {
        console.log("User Data:", userData);

        const rollNo = userData.rollNo;
        console.log("Student ID:", rollNo);

        const notificationsQuery = query(
          collection(db, "Notifications"),
          where("user_id", "==", rollNo)
        );

        const notificationDocs = await getDocs(notificationsQuery);
        const notificationDataArray = notificationDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Notifications:", notificationDataArray);
        setNotifications(notificationDataArray);

        console.log("Notifications:", notifications);
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
        console.log("Faculty Data Loaded:", userData);
      } else {
        console.warn("No user data available!");
      }
      
        fetchNotifications(userData);
    }, [token, userData, navigate]);
  
    if (!userData) {
      return <div>Loading user data...</div>;
    }

  return (
    <div className="notification-container1">
      <h2 className="notification-title">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications available.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li key={notification.id} className="notification-item">
              <h3 className="notification-heading">{notification.title || "Notification"}</h3>
              <p className="notification-message">{notification.msg}</p>
              <p className="notification-date">{notification.timestamp || "No date provided"}</p>
            </li>
          ))}
        </ul>
      )}
      <button className="back-button" onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
};

 
