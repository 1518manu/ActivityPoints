import { useState, useEffect } from "react";
import { app } from "./firebaseFile/firebaseConfig";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./Login/Login";
import { SignupPage } from "./test/Signup/SignUp";
import { Student } from "./Users/Student/Student";
import { CertificateUploadPage } from "./Users/Upload/Upload";
import { Certificate } from "./Users/Student/Certificates/Certificate";
import { NotificationContainer } from "./Notification/NotificationContainer";
import { Loading } from "./Loading/Loading";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  // <-- Added loading state

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setToken(localStorage.getItem("token"));
        const storedUserData = localStorage.getItem("userData");

        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } else {
        setIsLoggedIn(false);
        setToken(null);
        setUserData(null);
      }
      setIsLoading(false); // <-- Mark loading complete
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLoginSuccess = (token, userData) => {
    setIsLoggedIn(true);
    setToken(token);
    setUserData(userData);  // <-- Ensure userData is updated immediately
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(userData));

    console.log("Token:", token);
    console.log("UserData:", userData);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setToken(null);
      setUserData(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    console.log("userDataa");
    if (userData) {
      console.log("User Data in App:", userData);
    } else {
      console.log("No User Data in App");
    }
  }, [userData]);

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
          element={
            isLoggedIn && userData ? (isLoading ? ( <Loading /> ) : <Student token={token} userData={userData} onLogout={handleLogout}  />  ) :
                                                                   ( <LoginPage onLoginSuccess={handleLoginSuccess} /> )
          }
        />
        <Route path="/upload-certificate" element={<CertificateUploadPage />} />
        <Route path="/certificate" element={<Certificate />} />
      </Routes>
    </Router>
  );
}

export default App;
