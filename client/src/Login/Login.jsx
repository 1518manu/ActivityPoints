import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { mockAuthApi } from "./AuthApi/Api";
import { signInWithGoogle } from "./AuthApi/GoogleAuth";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {NotificationContainer } from "../Notification/NotificationContainer";
import { db } from "../firebaseFile/firebaseConfig"; // Make sure to import your db configuration
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Login.css";

const fetchUserData = async (email) => {
  try {
    console.log("Fetching user role for email:", email);
    const usersRef = await collection(db, "Users"); // Assuming "users" is your collection
    const q = await query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    console.log("userRef:", usersRef);
    console.log("q:", q);
    console.log("querySnapshot:" , querySnapshot);
    
    if (!querySnapshot.empty) {
      console.log("Role found:", querySnapshot.docs[0].data());
      return querySnapshot.docs[0].data(); // Assuming the role is stored in the "role" field
    } else {
      throw new Error("Role not found");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", show: false });

  const navigate = useNavigate();
  const auth = getAuth();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (user) {
        console.log("User is logged in UseEffect:", user.email);
        const userData = await fetchUserData(user.email);
        const role = userData.role;
        console.log("Role:", role);

        if (role) {
          localStorage.setItem("token", await user.getIdToken());
          localStorage.setItem("role", role);

          switch (role) {
            case "admin":
              console.log("Admin role found!");
              navigate("/AdminDashboard");
              break;
            case "faculty":
              console.log("Faculty role found!");
              navigate("/FacultyDashboard");
              break;
            case "club":
              console.log("Club role found!");
              navigate("/ClubDashboard");
              break;
            case "student":
              console.log("Student role found!");
              navigate("/StudentDashboard");
              break;
            default:
              console.log("User role not found!");
              showNotification("User role not found!", "error");
              
          }
        } else {
          setTimeout(()=> navigate("/StudentDashboard"), 1500);
          console.log("User role not found!");
          showNotification("User role not found!", "error");
        }
      } else {
        console.log("User is logged out");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("Please fill in all fields", "error");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await mockAuthApi(email, password, isLogin ? "login" : "register");
      console.log(response);
      if (response.success) {
        // Fetch the role after login

        console.log(response.token); 
        const userData = await fetchUserData(email);
        const role = userData.role;
        onLoginSuccess(response.token, userData);

        
        if (role) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("role", role);
          localStorage.setItem("userData", JSON.stringify(userData));

          showNotification("Login Successful!", "success");

          // Redirect to the appropriate dashboard based on the role
          setTimeout(() => {
            switch (role) {
              case "admin":
                console.log("Admin role found!");
                navigate("/AdminDashboard");
                break;
              case "faculty":
                console.log("Faculty role found!");
                navigate("/FacultyDashboard");
                break;
              case "club":
                console.log("Club role found!");
                navigate("/ClubDashboard");
                break;
              case "student":
                console.log("Student role found!");
                navigate("/StudentDashboard");
              default:
                console.log("User role not found!");
                showNotification("User role not found!", "error");
            }
          }, 1400);
        } else {
          showNotification("User role not found!", "error");
        }
      } else {
        showNotification(response.message || "Login Failed!", "error");
      }
    } catch (error) {
      showNotification("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
    
  };
  

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const response = await signInWithGoogle("login");
      
      console.log(response);
      if (response.success) {
        
        // Fetch the role after login
        console.log(response.token); 
        const userData = await fetchUserData(email);
        const role = userData.role;
        onLoginSuccess(response.token, userData);

        if (role) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("role", role);
          localStorage.setItem("userData", JSON.stringify(userData));

          showNotification("Login Successful!", "success");

          // Redirect to the appropriate dashboard based on the role
          setTimeout(() => {
            if (role === "admin") {
              navigate("/AdminDashboard");
            } else if (role === "faculty") {
              navigate("/FacultyDashboard");
            } else if (role === "club") {
              navigate("/ClubDashboard");
            } else {
              navigate("/StudentDashboard");
            }
          }, 1400);
        } else {
          showNotification("User role not found!", "error");
        }

        console.log("Google Sign In");
      } else {
        showNotification(response.error || "Login Failed!", "error");
      }

    } catch (error) {
      showNotification("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
    
  };

  const handleForgotPassword = () => {
    showNotification("Password reset link sent!", "info");
  };

  return (
    <div className="login-container">
      <NotificationContainer message={notification.message} type={notification.type} show={notification.show} />
      
      <div className="login-content">
        <h1 className="login-title">Activity Point System</h1>
        <h2 className="login-subtitle">Sign in to your account</h2>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                className="form-input"
                placeholder="123456@tkmce.ac.in"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                className="form-input"
                placeholder="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="password-checkbox">
                <input
                  type="checkbox"
                  id="show-password"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label htmlFor="show-password">Show Password</label>
              </div>
            </div>

            <div className="form-footer">
              {isLogin && (
                <a href="#" onClick={handleForgotPassword} className="forgot-password">
                  Forgot your password?
                </a>
              )}
            </div>

            <button className="submit-button" type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : isLogin ? "Sign in" : "Register"}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          <button onClick={handleGoogleSignIn} className="google-button">
            <FcGoogle className="google-icon" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
