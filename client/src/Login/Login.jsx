import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { signInWithGoogle } from "./AuthApi/GoogleAuth";
import { mockAuthApi } from "./AuthApi/Api";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { NotificationContainer } from "../Notification/NotificationContainer";
import { fetchUserData , fetchUserRole} from "./dataApi/userDataApi"
import "./Login.css";


export function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", show: false });

  const navigate = useNavigate();
  const auth = getAuth();
  
  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
  
      if (user) {
        console.log("User logged in:", user.email);
        const role = await fetchUserRole(user.email); // Get role first
        if (!role) {
          showNotification("User role not found!", "error");
          return;
        }
  
       
        if (role) {
          console.log("User role:", role, user.email);
            const userData = await fetchUserData(user.email, role); // Fetch Student data if role is Student
        
  
            console.log("userData:", userData);
            const userId = userData?.rollNo || user.uid; // Default to Firebase UID if no rollNo
            localStorage.setItem("token", await user.getIdToken());
            localStorage.setItem("role", role);
            localStorage.setItem("userData", JSON.stringify(userData || {}));
            localStorage.setItem("user_id", userId);
  
            showNotification("Login Successful!", "success");
            console.log("Login Successful!");
            console.log("userData:", userData);
  
            setTimeout(() => {
              switch (role) {
                case "Admin":
                  navigate("/Admin");
                  break;
                case "Faculty":
                  navigate("/FacultyDashboard");
                  break;
                case "Club":
                  navigate("/ClubDashboard");
                  break;
                case "Students":
                  navigate("/StudentDashboard");
                  console.log("Student nav");
                  break;
                default:
                  showNotification("User role not found!", "error");
                  console.log("User role not found!");
              }
            }, 1400);
          } else {
                    console.log("User role not found!");
                    showNotification("User role not found!", "error");
                  }
                
          } else {
            console.log("User is logged out");
          }
        });
  
    return () => unsubscribe();
  }, [auth, navigate]);
  
const handleGoogleSignIn = async (e) => {
  e.preventDefault();
  
  setIsLoading(true);
  
  try {
    const response = await signInWithGoogle("login");
    
    console.log(response);
    if (response.success) {
      
      // Fetch the role after login
      console.log(response.token); 
      
      const email = response?.user?.email;

      console.log("email:",email);

      const role = await fetchUserRole(email);
      console.log("role:",role);

      const userData = await fetchUserData(email, role);

      onLoginSuccess(response.token, userData);

      if (role) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", role);
        localStorage.setItem("userData", JSON.stringify(userData));

        showNotification("Login Successful!", "success");
        console.log("Login Successful");

        // Redirect to the appropriate dashboard based on the role
        setTimeout(() => {
          switch (role) {
            case "Admin":
              console.log("Admin role found!");
              navigate("/Admin");
              break;
            case "faculty":
              console.log("Faculty role found!");
              navigate("/FacultyDashboard");
              break;
            case "Club":
              console.log("Club role found!");
              navigate("/ClubDashboard");
              break;
            case "Students":
              console.log("Student role found!");
              navigate("/StudentDashboard");
              break;
            default:
              showNotification("User role not found!", "error");
              console.log("User role not found!");
          }
        }, 1400);
      } else {
        showNotification("User role not found!", "error");
        console.log("User role not found!");
      }

      console.log("Google Sign In");
    } else {
      showNotification(response.error || "Login Failed!", "error");
      console.log("Login Failed");
    }

  } catch (error) {
    showNotification("An error occurred. Please try again.", "error");
    console.log("An error occurred. Please try again.");
  } finally {
    setIsLoading(false);
  }
  
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

      const email = response?.token?.email;
      console.log("email:", email);

      const role =  await fetchUserRole(email);
      console.log(role);
      const userData = await fetchUserData(email, role);
      onLoginSuccess(response.token, userData);

      
      if (role) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", role);
        localStorage.setItem("userData", JSON.stringify(userData));

        showNotification("Login Successful!", "success");
        console.log("Login Successful!");

        // Redirect to the appropriate dashboard based on the role
        
        setTimeout(() => {
          switch (role) {
            case "Admin":
              console.log("Admin role found!");
              navigate("/Admin");
              break;
            case "Faculty":
              console.log("Faculty role found!");
              navigate("/FacultyDashboard");
              break;
            case "Club":
              console.log("Club role found!");
              navigate("/ClubDashboard");
              break;
            case "Students":
              console.log("Student role found!");
              navigate("/StudentDashboard");
              break; 
            default:
              showNotification("User role not found!", "error");
              console.log("User role not found!");
          }
        }, 1400);

      } else {
        showNotification("User role not found!", "error");
        console.log("User role not found!");
      }
    } else {
      showNotification(response.message || "Login Failed!", "error");
      console.warn(response.message || "Login Failed!");
    }
  } catch (error) {
    showNotification("An error occurred. Please try again.", "error");
    console.log("An error occurred. Please try again");
  } finally {
    setIsLoading(false);
  }
  
};



  const handleForgotPassword = () => {
    showNotification("Password reset link sent!", "info");
    console.log("Password reset link sent!");
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
