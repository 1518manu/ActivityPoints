import { useState, useEffect } from "react";
import { fetchUserData, fetchUserRole } from "../../Login/dataApi/userDataApi";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { FaThLarge, FaCheckCircle, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaEdit, FaUser, FaUniversity, FaCheck, FaTimes } from "react-icons/fa";
import { collection, getDocs ,query, where, onSnapshot} from "firebase/firestore";
import { db } from '../../firebaseFile/firebaseConfig';
import "./Faculty.css";
import { Loading } from "../../Loading/Loading";

export const Faculty = ({ token, userData: initialUserData, onLogout }) => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userData, setUserData] = useState(initialUserData);
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSemesterPopup, setShowSemesterPopup] = useState(false);
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [semestersWithData, setSemestersWithData] = useState([]);
  const [showYearPopup, setShowYearPopup] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const [yearsWithData, setYearsWithData] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  // All possible semesters
  const allSemesters = [
    "Semester 1", "Semester 2", "Semester 3", "Semester 4",
    "Semester 5", "Semester 6", "Semester 7", "Semester 8"
  ];

  // Academic years and their corresponding semesters
  const academicYears = {
    "First Year": ["Semester 1", "Semester 2"],
    "Second Year": ["Semester 3", "Semester 4"],
    "Third Year": ["Semester 5", "Semester 6"],
    "Fourth Year": ["Semester 7", "Semester 8"]
  };

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
        
        // Fetch all students
        const studentSnapshot = await getDocs(collection(db, "Students"));
        const studentData = studentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentData);

        // Fetch all certificates
        const certSnapshot = await getDocs(collection(db, "certificates"));
        const certData = certSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCertificates(certData);

        // Determine which semesters have data
        const semestersWithCertificates = [...new Set(certData.map(cert => cert.semester).filter(Boolean))];
        setSemestersWithData(semestersWithCertificates);

        // Determine which years have data
        const yearsWithCertificates = [];
        Object.entries(academicYears).forEach(([year, semesters]) => {
          if (certData.some(cert => semesters.includes(cert.semester))) {
            yearsWithCertificates.push(year);
          }
        });
        setYearsWithData(yearsWithCertificates);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token, initialUserData?.email, navigate]);
  useEffect(() => {
    if (!userData?.faculty_id) return; // Ensure faculty_id is available
  
    const notificationsRef = collection(db, "Notifications");
    const q = query(notificationsRef, where("user_id", "==", userData.faculty_id)); 
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.size); // Real-time update
    });
  
    return () => unsubscribe();
  }, [userData?.faculty_id]); 

  const handleSemesterReportClick = () => {
    setShowSemesterPopup(true);
  };

  const handleYearReportClick = () => {
    setShowYearPopup(true);
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemesters(prev => {
      if (prev.includes(semester)) {
        return prev.filter(s => s !== semester);
      } else {
        return [...prev, semester];
      }
    });
  };

  const handleYearSelect = (year) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year];
      }
    });
  };

  const handleGenerateSelectedReports = async () => {
    if (selectedSemesters.length === 0) {
      alert("Please select at least one semester");
      return;
    }

    setShowSemesterPopup(false);
    
    // Process each selected semester sequentially
    for (const semester of selectedSemesters) {
      await generateSingleSemesterReport(semester);
    }
    
    setSelectedSemesters([]); // Clear selection after generation
  };

  const handleGenerateSelectedYearReports = async () => {
    if (selectedYears.length === 0) {
      alert("Please select at least one academic year");
      return;
    }

    setShowYearPopup(false);
    
    // Process each selected year sequentially
    for (const year of selectedYears) {
      await generateSingleYearReport(year);
    }
    
    setSelectedYears([]); // Clear selection after generation
  };

  const generateSingleSemesterReport = async (semester) => {
    if (loading) {
      alert("Data is still loading. Please wait...");
      return;
    }
  
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set document metadata
      doc.setProperties({
        title: `${semester} Activity Report`,
        subject: "Student activities by semester",
        author: userData?.name || "Faculty",
        keywords: "semester, activity, report, students",
        creator: "College Management System"
      });
  
      // Add title with styling
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.setFont("helvetica", "bold");
      doc.text(`${semester} Activity Report`, 105, 20, { align: 'center' });
      
      // Subtitle with generation date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 105, 27, { align: 'center' });
  
      // Add footer to each page
      const addFooter = (doc) => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
          doc.text("Confidential - For internal use only", 105, 290, { align: 'center' });
        }
      };
  
      // Filter certificates for this semester
      const certs = certificates.filter(cert => cert.semester === semester);
      
      if (certs.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(150, 0, 0);
        doc.text(`No information available for ${semester}`, 105, 50, { align: 'center' });
      } else {
        // Group by activity head and activity
        const activityGroups = {};
        certs.forEach(cert => {
          const head = cert.activityHead || "Other Activities";
          const activity = cert.activity || "Unknown";
          
          if (!activityGroups[head]) {
            activityGroups[head] = {};
          }
          if (!activityGroups[head][activity]) {
            activityGroups[head][activity] = {
              students: new Set(),
              studentNames: []
            };
          }
          
          const student = students.find(s => s.rollNo === cert.user_id);
          const studentName = student ? `${student.name} (${cert.user_id})` : cert.user_id;
          
          activityGroups[head][activity].students.add(cert.user_id);
          activityGroups[head][activity].studentNames.push(studentName);
        });
  
        // Convert to array for table
        const tableData = [];
        Object.entries(activityGroups).forEach(([head, activities]) => {
          Object.entries(activities).forEach(([activity, data]) => {
            tableData.push({
              head,
              activity,
              count: data.students.size,
              students: data.studentNames.join(", ")
            });
          });
        });
  
        // Generate table
        autoTable(doc, {
          startY: 50,
          head: [["Activity Category", "Activity", "Participants", "Student List"]],
          body: tableData.map(row => [row.head, row.activity, row.count, row.students]),
          theme: "grid",
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0],
            cellPadding: 3,
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { 
              cellWidth: 30,
              fontStyle: 'bold'
            },
            1: { 
              cellWidth: 30,
              halign: 'left'
            },
            2: { 
              cellWidth: 20,
              halign: 'center'
            },
            3: { 
              cellWidth: 'auto', 
              minCellHeight: 8,
              halign: 'left'
            }
          },
          margin: { top: 50, left: 14, right: 14 },
          pageBreak: 'auto',
          tableWidth: 'wrap',
          showHead: 'firstPage',
          tableLineColor: [200, 200, 200],
          tableLineWidth: 0.2
        });
      }
      
      // Add footer
      addFooter(doc);
      
      // Save with semester-specific filename
      doc.save(`${semester.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (error) {
      console.error(`Error generating ${semester} report:`, error);
      alert(`Failed to generate ${semester} report. Please try again.`);
    }
  };

  const generateSingleYearReport = async (year) => {
    if (loading) {
      alert("Data is still loading. Please wait...");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set document metadata
      doc.setProperties({
        title: `${year} Activity Report`,
        subject: "Student activities by academic year",
        author: userData?.name || "Faculty",
        keywords: "year, activity, report, students",
        creator: "College Management System"
      });

      // Add title with styling
      doc.setFontSize(20);
      doc.setTextColor(52, 152, 219);
      doc.setFont("helvetica", "bold");
      doc.text(`${year} Activity Report`, 105, 20, { align: 'center' });
      
      // Subtitle with generation date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 105, 27, { align: 'center' });

      // Add footer to each page
      const addFooter = (doc) => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
          doc.text("Confidential - For internal use only", 105, 290, { align: 'center' });
        }
      };

      // Filter certificates for this year's semesters
      const yearSemesters = academicYears[year];
      const certs = certificates.filter(cert => yearSemesters.includes(cert.semester));
      
      if (certs.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(150, 0, 0);
        doc.text(`No information available for ${year}`, 105, 50, { align: 'center' });
      } else {
        // Group by semester first, then by activity head and activity
        const semesterGroups = {};
        
        yearSemesters.forEach(semester => {
          const semesterCerts = certs.filter(cert => cert.semester === semester);
          if (semesterCerts.length > 0) {
            semesterGroups[semester] = {};
            
            semesterCerts.forEach(cert => {
              const head = cert.activityHead || "Other Activities";
              const activity = cert.activity || "Unknown";
              
              if (!semesterGroups[semester][head]) {
                semesterGroups[semester][head] = {};
              }
              if (!semesterGroups[semester][head][activity]) {
                semesterGroups[semester][head][activity] = {
                  students: new Set(),
                  studentNames: []
                };
              }
              
              const student = students.find(s => s.rollNo === cert.user_id);
              const studentName = student ? `${student.name} (${cert.user_id})` : cert.user_id;
              
              semesterGroups[semester][head][activity].students.add(cert.user_id);
              semesterGroups[semester][head][activity].studentNames.push(studentName);
            });
          }
        });

        // Generate content for each semester with data
        let startY = 40;
        Object.entries(semesterGroups).forEach(([semester, activityGroups]) => {
          // Add semester header
          if (startY > 40) {
            doc.addPage();
            startY = 20;
          }
          
          doc.setFontSize(16);
          doc.setTextColor(41, 128, 185);
          doc.text(semester, 14, startY);
          startY += 10;

          // Convert to array for table
          const tableData = [];
          Object.entries(activityGroups).forEach(([head, activities]) => {
            Object.entries(activities).forEach(([activity, data]) => {
              tableData.push({
                head,
                activity,
                count: data.students.size,
                students: data.studentNames.join(", ")
              });
            });
          });

          // Generate table
          autoTable(doc, {
            startY: startY,
            head: [["Activity Category", "Activity", "Participants", "Student List"]],
            body: tableData.map(row => [row.head, row.activity, row.count, row.students]),
            theme: "grid",
            headStyles: { 
              fillColor: [52, 152, 219],
              textColor: [255, 255, 255],
              fontSize: 10,
              fontStyle: 'bold',
              halign: 'center'
            },
            bodyStyles: {
              fontSize: 9,
              textColor: [0, 0, 0],
              cellPadding: 3,
              lineWidth: 0.1
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            },
            columnStyles: {
              0: { 
                cellWidth: 30,
                fontStyle: 'bold'
              },
              1: { 
                cellWidth: 30,
                halign: 'left'
              },
              2: { 
                cellWidth: 20,
                halign: 'center'
              },
              3: { 
                cellWidth: 'auto', 
                minCellHeight: 8,
                halign: 'left'
              }
            },
            margin: { top: startY, left: 14, right: 14 },
            pageBreak: 'auto',
            tableWidth: 'wrap',
            showHead: 'firstPage',
            tableLineColor: [200, 200, 200],
            tableLineWidth: 0.2
          });

          startY = doc.lastAutoTable.finalY + 10;
        });

        // Add summary statistics for the entire year
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text(`${year} Summary Statistics`, 105, 20, { align: 'center' });
        
        // Calculate participation by semester
        const participationData = [];
        Object.entries(semesterGroups).forEach(([semester, activities]) => {
          let totalActivities = 0;
          let totalParticipants = 0;
          let uniqueStudents = new Set();
          
          Object.values(activities).forEach(activityGroup => {
            Object.values(activityGroup).forEach(activity => {
              totalActivities++;
              totalParticipants += activity.students.size;
              activity.students.forEach(student => uniqueStudents.add(student));
            });
          });
          
          participationData.push({
            semester,
            activities: totalActivities,
            participants: totalParticipants,
            uniqueStudents: uniqueStudents.size
          });
        });

        // Generate summary table
        autoTable(doc, {
          startY: 30,
          head: [["Semester", "Activities", "Total Participations", "Unique Students"]],
          body: participationData.map(row => [
            row.semester, 
            row.activities, 
            row.participants, 
            row.uniqueStudents
          ]),
          theme: "grid",
          headStyles: { 
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0],
            cellPadding: 3,
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' },
            3: { cellWidth: 40, halign: 'center' }
          }
        });

        // Add participation chart (as a simple table visualization)
        const chartY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Participation Overview", 14, chartY);
        
        // Simple bar chart representation using text
        participationData.forEach((row, index) => {
          const yPos = chartY + 10 + (index * 10);
          doc.text(`${row.semester}:`, 14, yPos);
          
          // Draw a simple "bar" using text
          const barLength = Math.min(100, (row.uniqueStudents / students.length) * 100);
          doc.setFillColor(52, 152, 219);
          doc.rect(40, yPos - 3, barLength, 4, 'F');
          
          doc.text(`${row.uniqueStudents} students (${Math.round((row.uniqueStudents / students.length) * 100)}%)`, 145, yPos, { align: 'right' });
        });
      }
      
      // Add footer
      addFooter(doc);
      
      // Save with year-specific filename
      doc.save(`${year.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (error) {
      console.error(`Error generating ${year} report:`, error);
      alert(`Failed to generate ${year} report. Please try again.`);
    }
  };

  const onValidate = () => { navigate("/Validate"); }
  const onStudentList = () => { navigate("/StudentList"); }

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleClosePopup = () => {
    setSelectedApplication(null);
    setRejectionReason("");
  };

  const handleApprove = () => {
    const facultyName = selectedApplication.facultyName || "HOD";
    alert(`Approved application for ${selectedApplication.studentName}. Forwarded to ${facultyName}.`);
    handleClosePopup();
  };

  const handleReject = () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
    alert(`Rejected application for ${selectedApplication.studentName}. Reason: ${rejectionReason}`);
    handleClosePopup();
  };

  if (!userData) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  const dutyLeaveApplications = [
    {
      id: 1,
      studentName: "Alice Johnson",
      rollNo: "S101",
      class: "R6A",
      date: "2023-10-25",
      facultyName: "Dr. Smith",
      reason: "Medical Emergency",
      certificate: "medical_certificate.pdf",
      status: "Pending",
    },
    {
      id: 2,
      studentName: "Bob Smith",
      rollNo: "S102",
      class: "R6B",
      date: "2023-10-26",
      facultyName: "",
      reason: "Family Function",
      certificate: "family_function.pdf",
      status: "Pending",
    },
    {
      id: 3,
      studentName: "Charlie Brown",
      rollNo: "S103",
      class: "R6B",
      date: "2023-10-27",
      facultyName: "Dr. Brown",
      reason: "Sports Competition",
      certificate: "sports_certificate.pdf",
      status: "Pending",
    },
  ];

  return (
    <div className="container-faculty">
      <header className="header-faculty">
        <div className="header-left-faculty">
          <div className="logo-container-faculty">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right-faculty">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content-faculty">
        <div className="sidebar-menu-faculty">
          <button onClick={onValidate}><FaCheckCircle className="menu-icon-faculty" /> Validate</button>
          <button onClick={onStudentList}><FaThLarge className="menu-icon-faculty" /> Student List</button>
          <button><FaCalendarAlt className="menu-icon-faculty" /> Events <span className="badge">new</span></button>
          <button> <FaBell   className="menu-icon-faculty" /> Notifications  {notificationCount > 0 && <span className="badge">{notificationCount}</span>}</button>
          <button><FaCog className="menu-icon-faculty" /> Settings</button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt className="menu-icon-faculty" /> Logout
          </button>
        </div>

        <div className="profile-content-faculty">
          <div className="profile-banner-faculty">
            <div className="banner-background-faculty"></div>
            <div className="edit-button-faculty">
              <FaEdit className="edit-icon-faculty" />
            </div>
          </div>

          <div className="profile-details-faculty">
            <div className="profile-header-faculty">
              <div className="profile-pic-container-faculty">
                <FaUser className="profile-icon-faculty" />
              </div>
              <div className="profile-header-info-faculty">
                <h2>{userData?.name || "N/A"}</h2>
                <div className="profile-username-faculty">{userData?.faculty_id || "unknown"}</div>
                <div className="profile-username-faculty">
                  {userData?.faculty_type + " | " || "unknown"} {userData?.email || "N/A"}
                </div>
                <div className="profile-education-faculty">
                  <FaUniversity className="university-icon-faculty" />
                  <span>{userData?.college || "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="section-container-faculty">
              <div className="section-header-faculty">
                <h3>WORKS</h3>
              </div>
              <div className="boxes-container-faculty">
                <div className="box-faculty box1">
                  <p>Total Students: {students.length}</p>
                </div>
                <div className="box-faculty box2">
                  <p>Pending Validation: {certificates.filter(c => c.status === "pending").length}</p>
                </div>
                <div className="box-faculty box3">
                  <p>Approved Certificates: {certificates.filter(c => c.status === "approved").length}</p>
                </div>
              </div>
            </div>

            <div className="section-container-faculty">
              <div className="section-header-faculty">
                <h3>Generate Report</h3>
                <p>Analysis based on student performance semester-wise or year-wise</p>
              </div>
              <div className="buttons-container-faculty">
                <button 
                  className="report-button-faculty" 
                  onClick={handleSemesterReportClick}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Semester-wise Report"}
                </button>
                <button 
                  className="report-button-faculty" 
                  onClick={handleYearReportClick}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Year-wise Report"}
                </button>
              </div>
            </div>
              
            <div className="section-container-faculty">
              <h3>Duty-Leave Applications</h3>
              {dutyLeaveApplications.map((app) => (
                <div key={app.id} className="application-card-faculty">
                  <p><strong>Name:</strong> {app.studentName}</p>
                  <p><strong>Roll No:</strong> {app.rollNo}</p>
                  <button 
                    className="view-button-faculty" 
                    onClick={() => handleViewApplication(app)}
                  >
                    View Application
                  </button>
                </div>
              ))}
            </div>

            {selectedApplication && (
              <div className="popup-overlay-faculty">
                <div className="popup-content-faculty">
                  <h3>Application Details</h3>
                  <p><strong>Name:</strong> {selectedApplication.studentName}</p>
                  <p><strong>Roll No:</strong> {selectedApplication.rollNo}</p>
                  <p><strong>Class:</strong> {selectedApplication.class}</p>
                  <p><strong>Date:</strong> {selectedApplication.date}</p>
                  <p><strong>Reason:</strong> {selectedApplication.reason}</p>
                  <p><strong>Certificate:</strong> {selectedApplication.certificate}</p>
                  
                  <div className="rejection-reason-faculty">
                    <label>Rejection Reason (if applicable):</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                    />
                  </div>

                  <div className="popup-actions-faculty">
                    <button className="approve-btn-faculty" onClick={handleApprove}>
                      <FaCheck /> Approve
                    </button>
                    <button className="reject-btn-faculty" onClick={handleReject}>
                      <FaTimes /> Reject
                    </button>
                    <button className="close-btn-faculty" onClick={handleClosePopup}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showSemesterPopup && (
              <div className="popup-overlay-faculty">
                <div className="popup-content-faculty" style={{ maxWidth: "500px" }}>
                  <h3>Select Semesters to Generate Reports</h3>
                  <p>Check the semesters you want to generate reports for:</p>
                  
                  <div className="semester-checklist">
                    {allSemesters.map(semester => {
                      const hasData = semestersWithData.includes(semester);
                      return (
                        <div key={semester} className={`semester-checkbox ${!hasData ? 'disabled' : ''}`}>
                          <input
                            type="checkbox"
                            id={`semester-${semester}`}
                            checked={selectedSemesters.includes(semester)}
                            onChange={() => handleSemesterSelect(semester)}
                            disabled={!hasData}
                          />
                          <label htmlFor={`semester-${semester}`}>
                            {semester}
                            {!hasData && <span className="no-data-tag"> (No data)</span>}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="popup-actions-faculty" style={{ justifyContent: 'space-between' }}>
                    <button 
                      className="close-btn-faculty" 
                      onClick={() => {
                        setShowSemesterPopup(false);
                        setSelectedSemesters([]);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="generate-btn-faculty"
                      onClick={handleGenerateSelectedReports}
                      disabled={selectedSemesters.length === 0}
                    >
                      Generate {selectedSemesters.length > 1 ? `${selectedSemesters.length} Reports` : 'Report'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showYearPopup && (
              <div className="popup-overlay-faculty">
                <div className="popup-content-faculty" style={{ maxWidth: "500px" }}>
                  <h3>Select Academic Years to Generate Reports</h3>
                  <p>Check the years you want to generate reports for:</p>
                  
                  <div className="semester-checklist">
                    {Object.keys(academicYears).map(year => {
                      const hasData = yearsWithData.includes(year);
                      return (
                        <div key={year} className={`semester-checkbox ${!hasData ? 'disabled' : ''}`}>
                          <input
                            type="checkbox"
                            id={`year-${year}`}
                            checked={selectedYears.includes(year)}
                            onChange={() => handleYearSelect(year)}
                            disabled={!hasData}
                          />
                          <label htmlFor={`year-${year}`}>
                            {year}
                            {!hasData && <span className="no-data-tag"> (No data)</span>}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="popup-actions-faculty" style={{ justifyContent: 'space-between' }}>
                    <button 
                      className="close-btn-faculty" 
                      onClick={() => {
                        setShowYearPopup(false);
                        setSelectedYears([]);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="generate-btn-faculty"
                      onClick={handleGenerateSelectedYearReports}
                      disabled={selectedYears.length === 0}
                    >
                      Generate {selectedYears.length > 1 ? `${selectedYears.length} Reports` : 'Report'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};