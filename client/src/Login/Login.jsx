import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { mockAuthApi } from "./AuthApi/Api";
import { signInWithGoogle } from "./AuthApi/GoogleAuth";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {NotificationContainer } from "../Notification/NotificationContainer";
import "./Login.css";
//
import { db } from "../firebaseFile/firebaseConfig"; // Make sure to import your db configuration
import { collection, query, where, getDocs } from "firebase/firestore";

//

const fetchUserRole = async (email) => {
  try {
    const usersRef = collection(db, "Users"); // Assuming "users" is your collection
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().role; // Assuming the role is stored in the "role" field
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in:", user);
        navigate("/StudentDashboard");
      } else {
        console.log("User is logged out", user);
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
    //   console.log(response);
    //   if (response.success) {
    //     console.log(response.token);
    //     onLoginSuccess(response.token);
    //     showNotification("Login Successful!", "success");
        
  
    //     // Add a short delay before navigating
    //     localStorage.setItem("token", response.token);
    //     setTimeout(() => navigate("/StudentDashboard"), 1400);
        
        
        
    //   } else {
    //     showNotification(response.message || "Login Failed!", "error");
    //   }
    // } catch (error) {
    //   showNotification("An error occurred . Please try again.", "error");
    // } finally {
    //   setIsLoading(false);
    // }

    //--------------
    if (response.success) {
      // Fetch the role after login
      const role = await fetchUserRole(email);

      if (role) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", role); // Save the role in localStorage

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
    } else {
      showNotification(response.message || "Login Failed!", "error");
    }
  } catch (error) {
    showNotification("An error occurred. Please try again.", "error");
  } finally {
    setIsLoading(false);
  }
    //---
  };
  

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const response = await signInWithGoogle("login");
      
      console.log(response);
      if (response.success) {
        onLoginSuccess(response.token);
        showNotification("Login Successful!", "success");

        console.log("Google Sign In");
        localStorage.setItem("token", response.token);
        setTimeout(() => navigate("/StudentDashboard"), 1400);
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
