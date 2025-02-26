import { useState, useEffect } from "react";
import { LoginPage } from "./Login/Login";
import { SignupPage } from "./test/Signup/signup";
import { Student } from "./Users/Student/Student"
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  // Check localStorage for a stored token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    }
  }, []);

  // Handle login success and store token in localStorage
  const handleLoginSuccess = (token) => {
    setIsLoggedIn(true);
    setToken(token);
    localStorage.setItem("token", token); // Store token
  };

  // Logout function: Remove token from localStorage
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem("token"); // Remove token
  };

  if (!isLoggedIn) {
    return (
      <>
        {/* <SignupPage /> */}
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Activity Point System
        </h1>
        <p className="text-center text-xl">Welcome! You are logged in.</p>
        <p className="text-center mt-2">Your token: {token}</p>
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Log out
        </button>
      </div>
      <Student/>
    </div>
  );
}

export default App;
