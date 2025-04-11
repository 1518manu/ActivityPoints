import { useState ,useRef} from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaCog, FaSignOutAlt, FaBell, FaFilter, FaCheckCircle, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import './AddStudent.css';

export const AddStudent = ({ token, userData, onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adm_no: '',
    rollNo: '',
    class: '',
    dept: '',
    college: 'TKM College of Engineering, Kerala',
    about: '',
    point: 0,
    mentor: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef();

const handleUploadJSONClick = () => {
  fileInputRef.current.click();
};

  
  const navigate = useNavigate();
  const onAddFaculty = () => { navigate("/AddFaculty"); }
  const onDashboard = () => { navigate("/Admin"); }
  const onStudentList = () => { navigate("/StudentListAdmin"); }

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

      // Step 1: Create authentication user
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = userCredential.user.uid;

      // Step 2: Add to Users collection
      const userDoc = {
        UID: uid,
        name: formData.name.toUpperCase(),
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        role: "Students",
        rollNo: formData.rollNo,
        password:formData.password,
        point: Number(formData.point),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "Users"), userDoc);

      // Step 3: Add to Students collection
      const studentDoc = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        adm_no: Number(formData.adm_no),
        rollNo: formData.rollNo,
        class: formData.class,
        dept: formData.dept,
        college: formData.college,
        about: formData.about,
        point: Number(formData.point),
        mentor: formData.mentor,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "Students"), studentDoc);

      setSuccess('Student added successfully!');
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        adm_no: '',
        rollNo: '',
        class: '',
        dept: '',
        college: 'TKM College of Engineering, Kerala',
        about: '',
        point: 0,
        mentor: ''
      });

    } catch (err) {
      console.error("Error adding student:", err);
      setError(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentJSONUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const students = Array.isArray(json) ? json : [json]; // handle single or multiple entries
  
        for (const student of students) {
          try {
            if (!student.email.endsWith('@tkmce.ac.in')) {
              throw new Error(`Invalid email: ${student.email}`);
            }
  
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              student.email,
              student.password
            );
            const uid = userCredential.user.uid;
  
            // Users collection
            const userDoc = {
              UID: uid,
              name: student.name.toUpperCase(),
              email: student.email,
              phone: student.phone,
              college: student.college,
              role: "Students",
              rollNo: student.rollNo,
              password: student.password,
              point: Number(student.point),
              createdAt: serverTimestamp()
            };
  
            await addDoc(collection(db, "Users"), userDoc);
  
            // Students collection
            const studentDoc = {
              name: student.name,
              email: student.email,
              phone: student.phone,
              adm_no: Number(student.adm_no),
              rollNo: student.rollNo,
              class: student.class,
              dept: student.dept,
              college: student.college,
              about: student.about,
              point: Number(student.point),
              mentor: student.mentor,
              createdAt: serverTimestamp()
            };
  
            await addDoc(collection(db, "Students"), studentDoc);
  
          } catch (err) {
            console.error("Error in JSON upload:", err.message);
          }
        }
  
        alert('Students from JSON uploaded successfully!');
      } catch (err) {
        console.error("JSON parsing failed:", err.message);
        alert('Invalid JSON format.');
      }
    };
  
    reader.readAsText(file);
  };


  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-faculty">            
          <div className="mt-6">
              <button
                type="button"
                className="json-btn"
                onClick={handleUploadJSONClick}
              >
                Upload Students JSON
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleStudentJSONUpload}
                style={{ display: 'none' }}
              />
            </div>
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
         
        <div className="sidebar-menu-faculty">
           <button onClick={onDashboard}><FaUserTie className="menu-icon-Admin" /> Dashboard</button>
           <button><FaBell className="menu-icon-Admin" /> Notifications</button>
           <button><FaFilter className="menu-icon-Admin" /> Filter</button>
           <button><FaCog className="menu-icon-faculty" /> Settings  </button>
           <button onClick={onStudentList}><FaThLarge className="menu-icon-Admin" /> Student List</button>
           <button onClick={onAddFaculty}><FaPlus className="menu-icon-Admin" /> ADD Faculty </button>
           <button onClick={onLogout} className="logout-btn"> <FaSignOutAlt className="menu-icon-faculty" /> Logout </button>
        </div>

        <div className="profile-content">
          <div className="student-form-container">
            <h2>Add New Student</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                <FaCheckCircle /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group-S">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group-S">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="@tkmce.ac.in"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-S password-field">
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
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group-S password-field">
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
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-S">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-S">
                  <label>Admission Number</label>
                  <input
                    type="number"
                    name="adm_no"
                    value={formData.adm_no}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-S">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-S">
                  <label>Class</label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    placeholder="eg: R6B"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-S">
                  <label>Department</label>
                  <select
                    name="dept"
                    value={formData.dept}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="CS">Computer Science</option>
                    <option value="EC">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="EE">Electrical</option>
                    <option value="CE">Civil</option>
                  </select>
                </div>

                <div className="form-group-S">
                  <label>Mentor ID</label>
                  <input
                    type="text"
                    name="mentor"
                    value={formData.mentor}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-S">
                <label>Initial Points</label>
                <input
                  type="number"
                  name="point"
                  value={formData.point}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-group-S">
                <label>About</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};