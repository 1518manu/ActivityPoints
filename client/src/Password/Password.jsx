import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from "../firebaseFile/firebaseConfig";
import "./Password.css";

const auth = getAuth(app);

export const ForgotPassword = ({ onClose, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      // Remove e.preventDefault() since we're not using a form
      setMessage('');
      setError('');
      setIsLoading(true);
  
      try {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset email sent! Check your inbox.');
      } catch (err) {
        setError(err.message);
        console.error("Password reset error:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="forgot-password-overlay">
        <div className="forgot-password-container">
          <div className="forgot-password-header">
            <h2 className="forgot-password-title">Forgot Password</h2>
            <button 
              onClick={onClose}
              className="forgot-password-close-btn"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          
          {/* Replaced form with div */}
          <div className="forgot-password-form">
            <input
              type="email"
              className="forgot-password-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            <button
              type="button"  // Changed from "submit" to "button"
              className="forgot-password-submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </div>
          
          {message && (
            <div className="forgot-password-message forgot-password-success">
              {message}
            </div>
          )}
          {error && (
            <div className="forgot-password-message forgot-password-error">
              {error}
            </div>
          )}
        </div>
      </div>
    );
};