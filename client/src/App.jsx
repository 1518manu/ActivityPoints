import { useState, useEffect } from "react";
import { app } from "./firebaseFile/firebaseConfig";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./Login/Login";
import { SignupPage } from "./test/Signup/SignUp";
import { NotificationContainer } from "./Notification/NotificationContainer";
import { Loading } from "./Loading/Loading";

import { Student } from "./Users/Student/Student";
import { DutyLeaveForm } from "./Users/Student/DutyLeave/DutyLeaveStudent";
import { CertificateUploadPage } from "./Users/Student/Upload/Upload";
import { Certificate } from "./Users/Student/Certificates/Certificate";
import { NotificationPageStudent } from "./Users/Student/Notification/NotificationStudent";

import { Faculty } from "./Users/Faculty/Faculty";
import { Validate } from "./Users/Faculty/validate/Validate";
import { StudentList } from "./Users/Faculty/StudentList/StudentList";
import { NotificationPageFaculty } from "./Users/Faculty/Notification/NotificationFaculty";
import { FilterStudent } from "./Users/Faculty/Filter/FilterStudent";

import { Admin } from "./Users/Admin/Admin"
import { StudentListAdmin } from "./Users/Admin/StudentListAdmin/StudentListAdmin";
import { AddStudent } from "./Users/Admin/AddStudent/AddStudent";

import "./App.css";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  

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
      setIsLoading(false); //  Mark loading complete
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
// just for develeopment fase to see the user data , u can remove it any time
  useEffect(() => {
    console.log("userDataa");
    if (userData) {
      console.log("User Data in App:", userData);
    } else {
      console.log("No User Data in App");
    }
  }, [userData]);

  return (    
    <>
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
                  isLoading ? ( <Loading /> ) : isLoggedIn && userData ? ( <Student token={token} userData={userData} onLogout={handleLogout}  />  ) :
                                                                        ( <LoginPage onLoginSuccess={handleLoginSuccess} /> )
                }
              />

              <Route path="/upload-certificate"
               element={<CertificateUploadPage />} />

              <Route path="/certificate"
               element={<Certificate  token={token} userData={userData} onLogout={handleLogout} />}
                />

                
              <Route
                path = "/Notification"
                element ={
                  <NotificationPageStudent token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              
                
              <Route
                path = "/duty-leave"
                element ={
                  <DutyLeaveForm token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              /duty-leave

              <Route 
                path = "/FacultyDashboard"
                element={
                  isLoading ? ( <Loading /> ) : isLoggedIn && userData ? ( <Faculty token={token} userData={userData} onLogout={handleLogout}  />  ) :
                                                                        ( <LoginPage onLoginSuccess={handleLoginSuccess} /> )
                }
              />

              <Route
                path = "/Validate"
                element ={
                  <Validate token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              
              <Route
                path = "/StudentList"
                element ={
                  <StudentList token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              <Route
                path = "/Notification-faculty"
                element ={
                  <NotificationPageFaculty token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              <Route
                path = "/filter"
                element ={
                  <FilterStudent token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              
              <Route
                path = "/Admin"
                element ={
                  <Admin token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              <Route
                path = "/StudentListAdmin"
                element ={
                  <StudentListAdmin token={token} userData={userData} onLogout={handleLogout} />
                }
              />
              
              <Route
                path = "/AddStudent"
                element ={
                  <AddStudent token={token} userData={userData} onLogout={handleLogout} />
                }
              />

            </Routes>
          </Router>
    </>
  );
}

export default App;
