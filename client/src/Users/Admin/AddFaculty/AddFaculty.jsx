import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaCog, FaSignOutAlt, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, deleteUser } from 'firebase/auth';
import './AddFaculty.css'; // Create similar CSS file as AddStudent.css

export const AddFaculty = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    faculty_id: '',
    department: 'CS',
    designation: 'Professor',
    faculty_type: 'Advisor',
    assigned_class: '',
    college: 'TKM College of Engineering'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.email.endsWith('@tkmce.ac.in')) {
        throw new Error('Only TKMCE email addresses are allowed');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const auth = getAuth();
      let userCredential;

      try {
        // Step 1: Create authentication user
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const uid = userCredential.user.uid;

        // Prepare user document
        const userDoc = {
          name: formData.name,
          email: formData.email,
          faculty_type: formData.faculty_type,
          role: "Faculty",
          user_id: formData.faculty_id,
          createdAt: serverTimestamp()
        };

        // Step 2: Add to Users collection
        await setDoc(doc(db, "Users", uid), userDoc);

        // Step 3: Add to Faculty collection
        const facultyDoc = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          faculty_id: formData.faculty_id,
          department: formData.department,
          designation: formData.designation,
          faculty_type: formData.faculty_type,
          assigned_class: formData.assigned_class,
          college: formData.college,
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, "Faculty", formData.faculty_id), facultyDoc);

        setSuccess('Faculty member added successfully!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          faculty_id: '',
          department: 'CS',
          designation: 'Professor',
          faculty_type: 'Advisor',
          assigned_class: '',
          college: 'TKM College of Engineering'
        });

      } catch (err) {
        // Rollback auth user creation if Firestore operations fail
        if (userCredential?.user) {
          await deleteUser(userCredential.user);
        }
        throw err;
      }

    } catch (err) {
      console.error("Error adding faculty:", err);
      setError(err.message || 'Failed to add faculty member');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    navigate("/");
    return null;
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-faculty">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-faculty">
          <button onClick={() => navigate("/Admin")}>
            <FaUserTie className="menu-icon-faculty" /> Dashboard
          </button>
          <button>
            <FaCog className="menu-icon-faculty" /> Settings
          </button>
          <button onClick={onLogout} className="logout-btn">
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content">
          <div className="faculty-form-container">
            <h2>Add New Faculty Member</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                <FaCheckCircle /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="example@tkmce.ac.in"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group password-field">
                  <label>Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={toggleShowPassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group password-field">
                  <label>Confirm Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={toggleShowConfirmPassword}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Faculty ID</label>
                  <input
                    type="text"
                    name="faculty_id"
                    value={formData.faculty_id}
                    onChange={handleChange}
                    required
                    placeholder="e.g., f1015"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="CS">Computer Science</option>
                    <option value="EC">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="EE">Electrical</option>
                    <option value="CE">Civil</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="HOD">HOD</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Faculty Type</label>
                  <select
                    name="faculty_type"
                    value={formData.faculty_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Advisor">Advisor</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Class Teacher">Class Teacher</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned Class</label>
                  <input
                    type="text"
                    name="assigned_class"
                    value={formData.assigned_class}
                    onChange={handleChange}
                    placeholder="e.g., R6B"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Adding...
                  </>
                ) : (
                  'Add Faculty Member'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};