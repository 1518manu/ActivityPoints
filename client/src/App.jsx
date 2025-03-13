import { useState, useEffect } from "react";
import {app} from "./firebase/firebaseConfid"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./Login/Login";
import { Student } from "./Users/Student/Student";
import { CertificateUploadPage } from "./Users/Upload/Upload";
import { Certificate } from "./Users/Student/Certificates/Certificate";
import { NotificationContainer } from "./Notification/NotificationContainer";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  // Check localStorage for a stored token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    }
  }, []);

  // Handle login success and store token in localStorage
  const handleLoginSuccess = (token) => {
    setIsLoggedIn(true);
    setToken(token);
    localStorage.setItem("token", token);
  };

  // Logout function: Remove token from localStorage
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <NotificationContainer />
      <Routes>
        <Route 
          path="/" 
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <Student token={token} onLogout={handleLogout} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/upload-certificate" element={<CertificateUploadPage />} />
        <Route path="/certificate" element={<Certificate />} />
      </Routes>
    </Router>
  );
}

export default App;