import React, { useState, useEffect } from "react";
import Notification from "./Notification";
import "./Notification.css";

export const NotificationContainer = ({ message, type, show }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (show && message && type) {
      const id = Date.now(); // Unique ID for each notification
      setNotifications((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id)); // Auto remove
      }, 3000);
    }
  }, [show, message, type]);

  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
        />
      ))}
    </div>
  );
};
