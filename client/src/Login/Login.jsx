import React, { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { mockAuthApi } from "./Api"
import "./Login.css"

export function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await mockAuthApi(email, password, isLogin ? "login" : "register")

      if (response.success) {
        onLoginSuccess(response.token)
      } else {
        setError(response.message || "An error occurred")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Implement Google Sign-In logic here
    console.log("Google Sign-In attempted")
  }

  const handleForgotPassword = () => {
    // Implement forgot password logic here
    console.log("Forgot password for:", email)
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">Activity Point System</h1>
        <h2 className="login-subtitle">{isLogin ? "Sign in to your account" : "Create a new account"}</h2>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                className="form-input"
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
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                className="form-input"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-footer">
              <div className="remember-me">
                <input id="remember-me" name="remember-me" type="checkbox" />
                <label className="Remember_me"htmlFor="remember-me">Remember me</label>
              </div>

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

          <div className="toggle-form">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Register" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

