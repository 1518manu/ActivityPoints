import { useState, useEffect } from "react";
import {app} from "./firebaseFile/firebaseConfig"; 
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./Login/Login";
import { SignupPage } from "./test/Signup/SignUp";
import { Student } from "./Users/Student/Student";
import { CertificateUploadPage } from "./Users/Upload/Upload";
import { Certificate } from "./Users/Student/Certificates/Certificate";
import { NotificationContainer } from "./Notification/NotificationContainer";
import "./App.css";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  
  // Check localStorage for a stored token on initial load for login checking..

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setToken(localStorage.getItem("token"));
      } else {
        setIsLoggedIn(false);
        setToken(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Handle login success and store token in localStorage
  const handleLoginSuccess = (token) => {
    setIsLoggedIn(true);
    setToken(token);
    localStorage.setItem("token", token);
    
  };

  // Logout function: Remove token from localStorage
  const handleLogout = async () => {
     try {
       await signOut(auth);
       setIsLoggedIn(false);
       setToken(null);
       localStorage.removeItem("token");
     } catch (error) {
       console.error("Error logging out:", error);
     }
   };

  return (
    <Router>
      <NotificationContainer />
      <Routes>
        <Route 
          path="/signup" 
          element={<SignupPage onSignUpSuccess={handleLoginSuccess} />}
        />
        <Route 
          path="/" 
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/StudentDashboard" 
          element={isLoggedIn ? <Student token={token} onLogout={handleLogout} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/upload-certificate" element={<CertificateUploadPage />} />
        <Route path="/certificate" element={<Certificate />} />
      </Routes>
    </Router>
  );
}

export default App;