import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./Notification.css";

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Remove the notification after 3 seconds
    }, 3000);
    return () => clearTimeout(timer); 
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <div className="icon">
        {type === "success" ? <FaCheck className="success-icon" /> : <FaTimes className="error-icon" />}
      </div>
      <div className="message">{message}</div>
    </div>
  );
};

export default Notification;
