import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt, FaUserTie, FaSave, FaKey, FaTimes } from 'react-icons/fa';
import { db } from '../../../firebaseFile/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Loading } from "../../../Loading/Loading";
import { NotificationContainer } from "../../../Notification/NotificationContainer";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import './SettingsAdmin.css';

export const SettingsAdmin = ({ token, userData, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "", show: false });
  const [userDetails, setUserDetails] = useState(null);
  const [editableFields, setEditableFields] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();
  const onDashboard = () => { navigate("/Admin"); }

  // Fields that should not be editable
  const PROTECTED_FIELDS = ['name', 'rollNo', 'email', 'id', 'uid', 'createdAt'];

  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        showNotification("User not authenticated", "error");
        return;
      }

      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserDetails(data);
        
        // Initialize editable fields (exclude protected fields)
        const editable = {};
        Object.keys(data).forEach(key => {
          if (!PROTECTED_FIELDS.includes(key)) {
            editable[key] = data[key];
          }
        });
        setEditableFields(editable);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      showNotification("Failed to load user details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        showNotification("User not authenticated", "error");
        return;
      }

      // Update Firestore document
      await updateDoc(doc(db, "Users", currentUser.uid), editableFields);
      showNotification("Profile updated successfully", "success");
      
      // Refresh user data
      await fetchUserDetails();
    } catch (error) {
      console.error("Error updating user details:", error);
      showNotification("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showNotification("New passwords don't match", "error");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        showNotification("Password must be at least 6 characters", "error");
        return;
      }

      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        showNotification("User not authenticated", "error");
        return;
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);
      
      showNotification("Password updated successfully", "success");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error("Error updating password:", error);
      showNotification(
        error.code === 'auth/wrong-password' 
          ? "Current password is incorrect" 
          : "Failed to update password",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [token, navigate]);
  
  if(!token) navigate("/");

  if (!userData) return <Loading fullScreen={true} />;

  return (
    <div className="container">
      <NotificationContainer
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({...notification, show: false})}
      />
      
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/client/src/logo.png" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-Admin">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-Admin">
          <button onClick={onDashboard}><FaUserTie className="menu-icon-Admin" /> Dashboard</button>
          <button><FaCog className="menu-icon-Admin active" /> Settings</button>
          <button onClick={onLogout} className="logout-btn">
            <FaSignOutAlt className="menu-icon-Admin" /> Logout
          </button>
        </div>

        <div className="settings-content">
          <h2>Settings</h2>
          
          {loading && !userDetails ? (
            <Loading />
          ) : (
            <div className="settings-form">
              <div className="user-profile-section">
                <div className="profile-header">
                  <div className="profile-image-container">
                    {userDetails?.profileImg ? (
                      <img 
                        src={userDetails.profileImg} 
                        alt={`${userDetails.name}'s profile`}
                        className="profile-image"
                      />
                    ) : (
                      <div className="default-profile-icon">
                        <FaUserTie size={40} />
                      </div>
                    )}
                  </div>
                  <div className="profile-info">
                    <h3>{userDetails?.name}</h3>
                    <p>{userDetails?.email}</p>
                    {userDetails?.rollNo && <p>Roll No: {userDetails.rollNo}</p>}
                    {userDetails?.dept && <p>Department: {userDetails.dept}</p>}
                  </div>
                </div>
              </div>

              <div className="editable-fields-section">
                <h3>Edit Profile Information</h3>
                
                {userDetails && Object.entries(editableFields).map(([field, value]) => (
                  <div key={field} className="form-field">
                    <label htmlFor={field}>
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="text"
                      id={field}
                      value={value || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                ))}

                <div className="form-actions">
                  <button 
                    onClick={saveChanges}
                    className="save-btn"
                    disabled={loading}
                  >
                    <FaSave /> Save Changes
                  </button>
                </div>
              </div>

              <div className="password-section">
                <h3>Password Settings</h3>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="password-btn"
                >
                  <FaKey /> Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay active">
          <div className="password-modal">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button 
                className="close-button" 
                onClick={() => setShowPasswordModal(false)}
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-field">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePasswordChange}
                  className="confirm-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};