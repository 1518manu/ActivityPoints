import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileAlt, FaChartLine } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { db } from '../../../../firebaseFile/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './StudentDetails.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const StudentDetails = ({ studentdata }) => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
 
  console.log("Student Data:", studentdata);
  const fetchUserCertificates = async (rollNo) => {
    try {
      const q = query(collection(db, "certificates"), where("user_id", "==", rollNo));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching certificates:", error);
      throw error;
    }
  };

  // Process certificate data for chart
  const processChartData = (certs) => {
    const dateCounts = certs.reduce((acc, cert) => {
      // Assuming cert has a date field in format 'YYYY-MM-DD' or similar
      const date = cert.date ? cert.date.split('T')[0] : 'Unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const sortedDates = Object.keys(dateCounts).sort();
    
    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Certificates Uploaded',
          data: sortedDates.map(date => dateCounts[date]),
          backgroundColor: '#4e73df',
          borderColor: '#2e59d9',
          borderWidth: 1,
        },
      ],
    };
  };

  useEffect(() => {
    if (!studentdata?.rollNo) {
      navigate("/student-list");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const certs = await fetchUserCertificates(studentdata.rollNo);
        setCertificates(certs);
        setChartData(processChartData(certs));
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentdata, navigate]);

  if (!studentdata) {
    return <div className="container">No student data available. Redirecting...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right">
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-faculty">
          {/* Sidebar content same as StudentList */}
        </div>

        <div className="profile-content">
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            <FaArrowLeft /> Back to Student List
          </button>

          <h2>Student Details</h2>
          
          <div className="student-info-card">
            <div className="student-basic-info">
              <h3>{studentdata.name}</h3>
              <p><strong>Roll No:</strong> {studentdata.rollNo}</p>
              <p><strong>Email:</strong> {studentdata.email}</p>
              <p><strong>Total Points:</strong> {studentdata.point || 0}</p>
              <p><strong>Department:</strong> {studentdata.department}</p>
            </div>
            
            <div className="student-stats">
              <div className="stat-card">
                <FaFileAlt className="stat-icon" />
                <div>
                  <h4>{certificates.length}</h4>
                  <p>Total Certificates</p>
                </div>
              </div>
              <div className="stat-card">
                <FaChartLine className="stat-icon" />
                <div>
                  <h4>{certificates.reduce((sum, cert) => sum + (cert.points || 0), 0)}</h4>
                  <p>Points from Certificates</p>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h3>Certificate Activity</h3>
            {loading ? (
              <p>Loading chart data...</p>
            ) : chartData && chartData.labels.length > 0 ? (
              <div className="chart-container">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Certificates Uploaded by Date',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p>No certificate data available for visualization.</p>
            )}
          </div>

          <div className="certificates-section">
            <h3>Certificates</h3>
            {loading ? (
              <p>Loading certificates...</p>
            ) : certificates.length === 0 ? (
              <p>No certificates found for this student.</p>
            ) : (
              <div className="certificate-grid">
                {certificates.map((cert) => (
                  <div key={cert.id} className="certificate-card">
                    <div className="certificate-header">
                      <h4>{cert.event_name || 'Unnamed Event'}</h4>
                      <span className={`status-badge ${cert.status?.toLowerCase()}`}>
                        {cert.status || 'Pending'}
                      </span>
                    </div>
                    <div className="certificate-details">
                      <p><strong>Organization:</strong> {cert.organization || 'N/A'}</p>
                      <p><strong>Date:</strong> {cert.date || 'Unknown date'}</p>
                      <p><strong>Points:</strong> {cert.points || 0}</p>
                    </div>
                    {cert.fileUrl && (
                      <a 
                        href={cert.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-certificate-btn"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};