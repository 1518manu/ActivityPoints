import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaThLarge,   FaCalendarAlt,  FaBell, 
  FaCog,   FaSignOutAlt,   FaFilter,   FaFileDownload,   FaSearch,   FaTimes, 
  FaChevronDown,   FaChevronUp, FaUserTie} from "react-icons/fa";
import { db } from '../../../firebaseFile/firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { Loading } from "../../../Loading/Loading";
import './FilterStudent.css';

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

export const FilterStudent = ({ token, userData, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
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
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Fetch students from database
  const fetchStudents = async () => {
    try {
      const userDataString1 = localStorage.getItem('userData'); 
      let facultyId = null;
  
      if (userDataString1) {
        const userData1 = JSON.parse(userDataString1);
        facultyId = userData1.faculty_id;
      }
  
      // Fetch Students assigned to the faculty
      const viewStudents = query(
        collection(db, "Students"),
        where("mentor", "==", facultyId)
      );
  
      const studDoc = await getDocs(viewStudents);
      let studentsArray = studDoc.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        certificates: [] // Placeholder for certificates
      }));
      console.log("Students Data:", studentsArray);

      // Fetch Certificates for each student based on rollNo
      const certPromises = studentsArray.map(async student => {
        const certQuery = query(
          collection(db, "certificates"),
          where("user_id", "==", student.rollNo) // Match user_id with rollNo
        );
  
        const certSnapshot = await getDocs(certQuery);
        const certificates = certSnapshot.docs.map(cert => ({
          id: cert.id,
          ...cert.data()
        }));
  
        return { ...student, certificates }; // Merge certificates into student data
      });
  
      // Resolve all certificate fetches
      const studentsWithCertificates = await Promise.all(certPromises);
  
      setStudents(studentsWithCertificates);
      setFilteredStudents([]);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Search Functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === "") {
      setFilteredStudents([]);
      setFiltersApplied(false);
    } else {
      const filtered = students.filter(student => (
        (student.name?.toLowerCase().includes(query)) ||
        (student.rollNo?.toLowerCase().includes(query)) ||
        (student.department?.toLowerCase().includes(query))
      ));
      setFilteredStudents(filtered);
      setFiltersApplied(true);
    }
  };

  // Sorting Functionality
  const handleSort = (order) => {
    setSortOrder(order);
    const sortedStudents = [...filteredStudents].sort((a, b) => {
      if (order === "name-asc") {
        return a.name?.localeCompare(b.name);
      } else if (order === "name-desc") {
        return b.name?.localeCompare(a.name);
      } else if (order === "points-asc") {
        return (a.points || 0) - (b.points || 0);
      } else if (order === "points-desc") {
        return (b.points || 0) - (a.points || 0);
      }
      return 0;
    });
    setFilteredStudents(sortedStudents);
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

  // Apply all selected filters
  const applyFilters = () => {
    let filtered = [...students]; // Start with all students
  
    filtered = filtered.map(student => {
      // Filter the certificates that match selected filters
      const filteredCertificates = student.certificates.filter(cert => {
        return (
          (filters.activityHead.length === 0 || filters.activityHead.includes(cert.activityHead)) &&
          (filters.activity.length === 0 || filters.activity.includes(cert.activity)) &&
          (filters.achievementLevel.length === 0 || filters.achievementLevel.includes(cert.achievementLevel)) &&
          (filters.role.length === 0 || filters.role.includes(cert.role)) &&
          (filters.prize.length === 0 || filters.prize.includes(cert.prize)) &&
          (filters.semester.length === 0 || filters.semester.includes(cert.semester))
        );
      });
  
      return { ...student, certificates: filteredCertificates };
    });
  
    // Remove students who have no matching certificates after filtering
    filtered = filtered.filter(student => student.certificates.length > 0);
  
    // Ensure students are unique in the list
    const uniqueStudents = [];
    const seenStudents = new Set();
    
    filtered.forEach(student => {
      if (!seenStudents.has(student.rollNo)) {
        seenStudents.add(student.rollNo);
        uniqueStudents.push(student);
      }
    });
  
    setFilteredStudents(uniqueStudents);
    setFiltersApplied(true);
    setShowFilterPanel(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      activityHead: [],
      activity: [],
      achievementLevel: [],
      role: [],
      prize: [],
      semester: [],
    });
    setSearchQuery("");
    setSortOrder("");
    setFilteredStudents([]);
    setFiltersApplied(false);
    setShowFilterPanel(false);
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
    fetchStudents();
  }, [token, navigate]);


  // Navigation handlers
  const onValidate = () => navigate("/Validate");
  const onNotification = () => navigate("/Notification-faculty");

  // Group students by activity and include semesters
  const groupStudentsByActivity = () => {
    if (!filtersApplied || filteredStudents.length === 0) return [];
  
    const groups = {};
  
    filteredStudents.forEach(student => {
      student.certificates.forEach(cert => {
        const key = `${cert.activityHead || 'No Activity Head'}|${cert.activity || 'No Activity'}|${cert.achievementLevel || 'No Level'}`;
  
        if (!groups[key]) {
          groups[key] = {
            activityHead: cert.activityHead || 'N/A',
            activity: cert.activity || 'N/A',
            level: cert.achievementLevel || 'N/A',
            students: []
          };
        }
        
        // Check if student already exists in this group
        const existingStudent = groups[key].students.find(s => s.rollNo === student.rollNo);
        
        if (existingStudent) {
          // Add semester to existing student's semesters array
          if (cert.semester && !existingStudent.semesters.includes(cert.semester)) {
            existingStudent.semesters.push(cert.semester);
          }
        } else {
          // Add new student with semesters array
          groups[key].students.push({ 
            ...student, 
            semesters: cert.semester ? [cert.semester] : ['N/A'],
            certificateDetails: cert  // Add certificate-specific details inside student
          });
        }
      });
    });
  
    return Object.values(groups);
  };
  

  // Download as Excel
  const downloadExcel = () => {
    const groupedData = groupStudentsByActivity();
    if (groupedData.length === 0) return;
    
    const dataToExport = [];
    
    groupedData.forEach(group => {
      group.students.forEach(student => {
        dataToExport.push({
          'Activity Head': group.activityHead,
          'Activity': group.activity,
          'Level': group.level,
          'Student Name': student.name,
          'Roll No': student.rollNo,
          'Phone Number': student.phone,
          'Email': student.email,
          'Semesters': student.semesters.join(', '),
          'Prize': student.certificateDetails?.prize || 'N/A',
          'Points': student.points || 0
        });
      });
    });
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Data");
    XLSX.writeFile(workbook, "Students_List.xlsx");
  };

  const groupedStudents = groupStudentsByActivity();

  
  if(!token) navigate("/");
  
  if (!userData) {
    return <div>Loading user data...</div>;
  }


  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="https://drive.google.com/file/d/14mwb0h4iESMMZocxhpXEq44ub0QL30Kl/view?usp=drive_link" alt="Logo" className="logo" />
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery} 
              onChange={handleSearch} 
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="header-right-faculty">
          <button className="filter-sort-btn" onClick={() => setShowFilterPanel(true)}>
            <FaFilter /> Filter & Sort
          </button>
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar-menu-faculty">
        <button onClick={() => navigate("/FacultyDashboard")}><FaUserTie className="menu-icon-faculty" /> Dashboard</button>
          <button onClick={onValidate}><FaCheckCircle className="menu-icon-faculty" /> Validate</button>
          <button onClick={() => navigate("/StudentList")} ><FaThLarge className="menu-icon-faculty" /> Student List</button>
          <button onClick={onNotification}><FaBell className="menu-icon-faculty" /> Notifications</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
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
                    checked={sortOrder === "name-asc"} 
                    onChange={() => handleSort("name-asc")} 
                  />
                  Name: A to Z
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortOrder === "name-desc"} 
                    onChange={() => handleSort("name-desc")} 
                  />
                  Name: Z to A
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortOrder === "points-asc"} 
                    onChange={() => handleSort("points-asc")} 
                  />
                  Points: Low to High
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortOrder === "points-desc"} 
                    onChange={() => handleSort("points-desc")} 
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

        {/* Main Content Area */}
        <div className="content-area">
          <h2>Student List</h2>
          
          {/* Results Table - Only shown when filters are applied */}
          {filtersApplied ? (
            groupedStudents.length > 0 ? (
              <div className="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Activity Head</th>
                      <th>Activity</th>
                      <th>Level</th>
                      <th>No. of Students</th>
                      <th>Students Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedStudents.map((group, index) => (
                      <tr key={index}>
                        <td>{group.activityHead}</td>
                        <td>{group.activity}</td>
                        <td>{group.level}</td>
                        <td>{group.students.length}</td>
                        <td>
                          <table className="nested-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Roll No</th>
                                <th>Semesters</th>
                                <th>Phone</th>
                                <th>Email</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.students.map((student, idx) => (
                                <tr key={idx}>
                                  <td>{student.name || 'N/A'}</td>
                                  <td>{student.rollNo || 'N/A'}</td>
                                  <td>{student.semesters.join(', ') || 'N/A'}</td>
                                  <td>{student.phone || 'N/A'}</td>
                                  <td>{student.email || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Download Button */}
                <div className="download-section">
                  <button onClick={downloadExcel} className="download-btn">
                    <FaFileDownload /> Download as Excel
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-results">
                No students found matching your filters.
              </div>
            )
          ) : (
            <div className="empty-state">
              <p>Apply filters to view student data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterStudent;