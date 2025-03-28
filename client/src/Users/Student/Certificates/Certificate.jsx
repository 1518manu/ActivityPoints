import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseFile/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCoins, FaThLarge, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Loading } from "../../../Loading/Loading";
import "./Certificate.css";
import { use } from "react";
import { FaUserTie } from "react-icons/fa6";

// Activity data structure
const activityData = {
  "National Initiatives": ["NCC", "NSS"],
  "Sports & Games": ["Football", "Cricket", "Basketball", "Other"],
  "Cultural Activities": ["Music", "Performing Arts", "Literary Arts"],
  "Professional Self Initiatives": [
    "Tech Fest,Tech Quiz",
    "MOOC",
    "Competitions conducted by Professional Societies - (IEEE,IET, ASME, SAE, NASA etc.)",
    "Attending Full time Conference/ Seminars / Exhibitions/ Workshop/ STTP conducted at IITs /NITs",
    "Paper presentation/publication at IITs/NITs",
    "Poster Presentation at IITs /NITs",
    "Industrial Training/Internship (atleast for 5 full days)",
    "Industrial/Exhibition visits",
  ],
  "Entrepreneurship and Innovation": [
    "Foreign Language Skill (TOEFL/ IELTS/ BEC exams etc.)",
    "Startup Company-Registered legally",
    "Patent Filed",
    "Patent - Published",
    "Patent- Approved",
    "Patent- Licensed",
    "Product Development",
    "Awards for Products developed",
    "Innovative technologies developed and used by industries/users",
    "Got venture capital funding for innovative ideas/products",
    "Startup Employment (Offering jobs to two persons not less than Rs. 15000/- per month)",
    "Societal innovations",
  ],
  "Leadership & Management": ["Student Societies", "College Association", "Festival & Technical Events", "Elected student representatives"],
};

const achievementLevels = ["Level I (College)", "Level II (Zonal)", "Level III (State/University)", "Level IV (National)", "Level V (International)"];
const rolesForLeadership = ["Core Coordinator", "Sub Coordinator", "Volunteer"];
const rolesForElectedRepresentatives = ["Chairman", "Secretary", "Other Council Members"];
const prizeOptions = ["None", "1st Prize", "2nd Prize", "3rd Prize"];
const semesters = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

export const Certificate = ({ token, userData, onLogout } ) => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showPointModal, setShowPointModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    sort: false,
    activityHead: true,
    activity: false,
    achievementLevel: false,
    role: false,
    prize: false,
    semester: false,
  });
  const [filters, setFilters] = useState({
    activityHead: [],
    activity: [],
    achievementLevel: [],
    role: [],
    prize: [],
    semester: [],
  });
  
  const navigate = useNavigate();
  
  const onNotification = () => navigate("/Notification");
  


    const fetchCertificates = async (userData) => {
      try {
        console.log(userData);
        const userId = userData.rollNo;
        const q = query(collection(db, "certificates"), where("user_id", "==", userId));
        const querySnapshot = await getDocs(q);

        const fetchedCertificates = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCertificates(fetchedCertificates);
        setFilteredCertificates(fetchedCertificates);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };


  // Search Functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = certificates.filter(cert =>
      cert.certificateName.toLowerCase().includes(query)
    );
    setFilteredCertificates(filtered);
  };

  // Sorting Functionality
  const handleSort = (order) => {
    setSortOrder(order);
    const sortedCertificates = [...filteredCertificates].sort((a, b) => {
      return order === "asc" ? a.points - b.points : b.points - a.points;
    });
    setFilteredCertificates(sortedCertificates);
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle checkbox changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      return newFilters;
    });
  };

  // Apply all selected filters and close panel
  const applyFilters = () => {
    let filtered = certificates;
    
    // Apply activity head filter
    if (filters.activityHead.length > 0) {
      filtered = filtered.filter(cert => 
        filters.activityHead.includes(cert.activityHead)
      );
    }
    
    // Apply activity filter
    if (filters.activity.length > 0) {
      filtered = filtered.filter(cert => 
        filters.activity.includes(cert.activity)
      );
    }
    
    // Apply achievement level filter
    if (filters.achievementLevel.length > 0) {
      filtered = filtered.filter(cert => 
        filters.achievementLevel.includes(cert.achievementLevel)
      );
    }
    
    // Apply role filter
    if (filters.role.length > 0) {
      filtered = filtered.filter(cert => 
        filters.role.includes(cert.role)
      );
    }
    
    // Apply prize filter
    if (filters.prize.length > 0) {
      filtered = filtered.filter(cert => 
        filters.prize.includes(cert.prize)
      );
    }
    
    // Apply semester filter
    if (filters.semester.length > 0) {
      filtered = filtered.filter(cert => 
        filters.semester.includes(cert.semester)
      );
    }
    
    setFilteredCertificates(filtered);
    setShowFilterPanel(false); // Close the filter panel
  };

  // Clear all filters and close panel
  const clearFilters = () => {
    setFilters({
      activityHead: [],
      activity: [],
      achievementLevel: [],
      role: [],
      prize: [],
      semester: [],
    });
    setFilteredCertificates(certificates);
    setSortOrder("");
    setShowFilterPanel(false); // Close the filter panel
  };

  // Close filter panel on ESC key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowFilterPanel(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  
    useEffect(() => {
      if (!token) navigate("/");
      if (userData) fetchCertificates(userData);
    }, [token, userData, navigate]);
  

  if (isLoading) return <Loading />;

  return (
    <div className={`container ${showPointModal ? 'modal-open' : ''}`}>
      {/* Navbar */}
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search Certificate..." 
              value={searchQuery} 
              onChange={handleSearch} 
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="header-right">
          <button className="filter-sort-btn" onClick={() => setShowPointModal(true)}>
            <FaCoins/> Get Point
          </button>
          <button className="filter-sort-btn" onClick={() => setShowFilterPanel(true)}>
            <FaFilter /> Filter & Sort
          </button>
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar-menu">
          <button onClick={() => navigate("/StudentDashboard")}>
            <FaUserTie className="menu-icon" /> Dashboard
          </button>
          <button><FaCog className="menu-icon" /> Settings</button>
          <button><FaCalendarAlt className="menu-icon" /> Events <span className="badge">new</span></button>
          <button onClick={onNotification}>
            <FaBell className="menu-icon" /> Notifications  
            {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
          </button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon" /> Logout
          </button>
        </div>

        {/* Amazon-style Filter Panel */}
        <div className={`amazon-filter-panel ${showFilterPanel ? "show" : ""}`}>
          <div className="filter-panel-header">
            <h3>Filter & Sort</h3>
            <button className="close-btn" onClick={() => setShowFilterPanel(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('sort')}>
              <h4>Sort By</h4>
              {expandedSections.sort ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.sort && (
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortOrder === "asc"} 
                    onChange={() => handleSort("asc")} 
                  />
                  Points: Low to High
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortOrder === "desc"} 
                    onChange={() => handleSort("desc")} 
                  />
                  Points: High to Low
                </label>
              </div>
            )}
          </div>

          {/* Activity Head Filter */}
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('activityHead')}>
              <h4>Activity Head</h4>
              {expandedSections.activityHead ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.activityHead && (
              <div className="filter-options">
                {Object.keys(activityData).map(head => (
                  <label key={head}>
                    <input
                      type="checkbox"
                      checked={filters.activityHead.includes(head)}
                      onChange={() => handleFilterChange('activityHead', head)}
                    />
                    {head}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Activity Filter */}
          {filters.activityHead.length > 0 && (
            <div className="filter-section">
              <div className="filter-section-header" onClick={() => toggleSection('activity')}>
                <h4>Activity</h4>
                {expandedSections.activity ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.activity && (
                <div className="filter-options">
                  {filters.activityHead.map(head => (
                    <div key={head}>
                      <h5>{head}</h5>
                      {activityData[head].map(activity => (
                        <label key={activity}>
                          <input
                            type="checkbox"
                            checked={filters.activity.includes(activity)}
                            onChange={() => handleFilterChange('activity', activity)}
                          />
                          {activity}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Achievement Level Filter */}
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('achievementLevel')}>
              <h4>Achievement Level</h4>
              {expandedSections.achievementLevel ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.achievementLevel && (
              <div className="filter-options">
                {achievementLevels.map(level => (
                  <label key={level}>
                    <input
                      type="checkbox"
                      checked={filters.achievementLevel.includes(level)}
                      onChange={() => handleFilterChange('achievementLevel', level)}
                    />
                    {level}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Role Filter */}
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('role')}>
              <h4>Role</h4>
              {expandedSections.role ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.role && (
              <div className="filter-options">
                <h5>Leadership Roles</h5>
                {rolesForLeadership.map(role => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={filters.role.includes(role)}
                      onChange={() => handleFilterChange('role', role)}
                    />
                    {role}
                  </label>
                ))}
                <h5>Elected Representatives</h5>
                {rolesForElectedRepresentatives.map(role => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={filters.role.includes(role)}
                      onChange={() => handleFilterChange('role', role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Prize Filter */}
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('prize')}>
              <h4>Prize</h4>
              {expandedSections.prize ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.prize && (
              <div className="filter-options">
                {prizeOptions.map(prize => (
                  <label key={prize}>
                    <input
                      type="checkbox"
                      checked={filters.prize.includes(prize)}
                      onChange={() => handleFilterChange('prize', prize)}
                    />
                    {prize}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Semester Filter */}
          <div className="filter-section">
            <div className="filter-section-header" onClick={() => toggleSection('semester')}>
              <h4>Semester</h4>
              {expandedSections.semester ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.semester && (
              <div className="filter-options">
                {semesters.map(semester => (
                  <label key={semester}>
                    <input
                      type="checkbox"
                      checked={filters.semester.includes(semester)}
                      onChange={() => handleFilterChange('semester', semester)}
                    />
                    {semester}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-actions">
            <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
            <button className="clear-btn" onClick={clearFilters}>Clear All</button>
          </div>
        </div>

        {/* Overlay for when filter panel is open */}
        {showFilterPanel && (
          <div className="filter-overlay" onClick={() => setShowFilterPanel(false)}></div>
        )}

        {/* Certificate List */}
        <div className="certificate-container">
          <h2>My Certificates</h2>
          <div className="certificate-list">
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((cert) => (
                <div key={cert.id} className="certificate-card">
                  <iframe
                    src={cert.fileURL}
                    className="pdf-preview"
                    title={`Preview of ${cert.certificateName}`}
                    style={{ border: "none" }}
                  ></iframe>
                  <h3>{cert.certificateName}</h3>
                  <p><strong>Issued By:</strong> {cert.activityHead || "N/A"}</p>
                  <p><strong>Date:</strong> {cert.eventDate || "N/A"}</p>
                  <p><strong>Description:</strong> {cert.description || "N/A"}</p>
                  <a href={cert.fileURL} target="_blank" rel="noopener noreferrer" className="certificate-link">
                    View Certificate
                  </a>
                </div>
              ))
            ) : (
              <p>No certificates found.</p>
            )}
          </div>
        </div>
      </div>
      {showPointModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowPointModal(false)}></div>
          <div className="point-modal">
            <div className="modal-header">
              <h3>Select Certificates to Claim Points</h3>
              <button className="close-btn" onClick={() => setShowPointModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="certificate-checklist">
                {certificates.length > 0 ? (
                  <table className="certificate-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Certificate</th>
                        <th>Activity</th>
                        <th>Date</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map((cert) => (
                        <tr key={cert.id}>
                          <td>
                            <input 
                              type="checkbox" 
                              id={`cert-${cert.id}`}
                              // You'll need to add state management for selected certificates
                            />
                          </td>
                          <td>
                            <label htmlFor={`cert-${cert.id}`}>
                              {cert.certificateName}
                            </label>
                          </td>
                          <td>{cert.activityHead || "N/A"}</td>
                          <td>{cert.eventDate || "N/A"}</td>
                          <td>
                            <input 
                              type="number" 
                              min="0"
                              defaultValue={cert.points || 0}
                              className="points-input"
                              // You'll need to add state management for point values
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No certificates available for claiming points.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="set-point-btn"
                onClick={() => {
                  // Add your logic to save the points
                  setShowPointModal(false);
                }}
              >
                Set Points
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};