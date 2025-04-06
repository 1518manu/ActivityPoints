import { useState, useEffect } from "react";
import { fetchUserData, fetchUserRole } from "../../Login/dataApi/userDataApi";
import { useNavigate } from "react-router-dom";
import { FaThLarge, FaCheckCircle, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaEdit, FaUser, FaUniversity, FaCheck, FaTimes, FaFilter } from "react-icons/fa";
import { collection, getDocs ,query, where, onSnapshot, updateDoc, doc} from "firebase/firestore";
import { db } from '../../firebaseFile/firebaseConfig';
import { Loading } from "../../Loading/Loading";
import "./Admin.css";

export const Admin = ({ token, userData: initialUserData, onLogout }) => {
  const [userData, setUserData] = useState(initialUserData);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onStudentList = () => { navigate("/StudentListAdmin"); }

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch user role and data
        const role = await fetchUserRole(initialUserData?.email);
        if (role) {
          const updatedUserData = await fetchUserData(initialUserData?.email, role);
          if (updatedUserData) {
            setUserData(updatedUserData);
          }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token, initialUserData?.email, navigate]);
  
  if (!userData) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-Admin">
      <header className="header-Admin">
        <div className="header-left-Admin">
          <div className="logo-container-Admin">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-Admin">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content-Admin">
        <div className="sidebar-menu-Admin">
          { /*<button onClick={onValidate}><FaCheckCircle className="menu-icon-Admin" /> Validate</button> }
          <button><FaCalendarAlt className="menu-icon-Admin" /> Events <span className="badge">new</span></button> */ }
          <button > <FaBell   className="menu-icon-Admin" /> Notifications  {/* notificationCount > 0 && <span className="badge">{notificationCount}</span> */} </button>
          <button> <FaFilter   className="menu-icon-Admin" /> Filter  </button>
          <button><FaCog className="menu-icon-Admin" /> Settings</button>
          <button onClick={onStudentList}><FaThLarge className="menu-icon-Admin" /> Student List</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-Admin" /> Logout
          </button>
        </div>

        <div className="profile-content-Admin">
          <div className="profile-banner-Admin">
            <div className="banner-background-Admin"></div>
            <div className="edit-button-Admin">
              <FaEdit style={{ color: "#ccc", fontSize: "15px", margin: "5px", fontWeight: "100" }}/>
            </div>
          </div>

          <div className="profile-details-Admin">
            <div className="profile-header-Admin">
              <div className="profile-pic-container-Admin">
               <FaUser style={{ color: "#ccc", fontSize: "40px", margin: "5px", fontWeight: "100" }} />
              </div>
              <div className="profile-header-info-Admin">
                <h2>{userData?.name || "N/A"}</h2>
                <div className="profile-username-Admin">{userData?.user_id || "unknown"}</div>
                <div className="profile-username-Admin">
                  {userData?.Admin_type + " | " || "unknown"} {userData?.email || "N/A"}
                </div>
                <div className="profile-education-Admin">
                  <FaUniversity className="university-icon-Admin" />
                  <span>{userData?.college || "N/A"}</span>
                </div>
              </div>
            </div>
              
          </div>
        </div>
      </div>
    </div>
  );
};