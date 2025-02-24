import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { mockAuthApi } from "./Api";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import icons for show/hide
import "./Login.css";

export function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await mockAuthApi(email, password, isLogin ? "login" : "register");

      if (response.success) {
        onLoginSuccess(response.token);
      } else {
        setError(response.message || "An error occurred");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In attempted");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password for:", email);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">Activity Point System</h1>
        <h2 className="login-subtitle">Sign in to your account</h2>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                className="form-input"
                placeholder = "123456@tkmce.ac.in"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group relative">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="password-input-container">
                <input
                  className="form-input"
                  placeholder="Password"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Toggle password visibility
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

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
