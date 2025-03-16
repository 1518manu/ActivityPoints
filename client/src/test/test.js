import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { mockAuthApi } from "./AuthApi/Api";
import { signInWithGoogle } from "./AuthApi/GoogleAuth";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { NotificationContainer } from "../Notification/NotificationContainer";
import { db } from "../firebaseFile/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Login.css";

const fetchUserRole = async (email) => {
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().role;
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
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", show: false });

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await fetchUserRole(user.email);
        if (role) {
          const userData = { email: user.email, role };
          onLoginSuccess(await user.getIdToken(), userData);
        } else {
          showNotification("User role not found!", "error");
        }
      }
    });
    return () => unsubscribe();
  }, [auth, navigate, onLoginSuccess]);

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
      const response = await mockAuthApi(email, password, "login");
      if (response.success) {
        const role = await fetchUserRole(email);
        const userData = { email, role };
        onLoginSuccess(response.token, userData);
      } else {
        showNotification(response.message || "Login Failed!", "error");
      }
    } catch (error) {
      showNotification("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
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
            </div>

            <button className="submit-button" type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
