import React, { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { mockAuthApi } from "./Api"
import "./SignUp.css"

export function SignupPage({ onSignUpSuccess }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await mockAuthApi(email, password, "register", name)

      if (response.success) {
        onSignUpSuccess(response.token)
      } else {
        setError(response.message || "An error occurred")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.log(err);
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    // Implement Google Sign-Up logic here
    console.log("Google Sign-Up attempted")
  }

  return (
    <div className="signup-container">
      <div className="signup-content">
        <h1 className="signup-title">Activity Point System</h1>
        <h2 className="signup-subtitle">Create a new account</h2>

        <div className="signup-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                className="form-input"
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="submit-button" type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          <button onClick={handleGoogleSignUp} className="google-button">
            <FcGoogle className="google-icon" />
            Sign up with Google
          </button>

          <div className="toggle-form">
            <p>
              Already have an account?{" "}
              <a href="/login" className="toggle-link">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

