import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaFileAlt, FaChartLine, FaSpinner } from "react-icons/fa";
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

export const StudentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  
  // Get studentdata from location state
  const { studentdata } = location.state || {};

  const fetchUserCertificates = async (rollNo) => {
    try {
      const q = query(
        collection(db, "certificates"), 
        where("user_id", "==", rollNo)
      );
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

  const processChartData = (certs = []) => {
    const initialCounts = {};
    
    const monthCounts = certs.reduce((acc, cert) => {
      if (!cert?.date) return acc;
      
      try {
        const date = new Date(cert.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      } catch (e) {
        console.error("Invalid date format:", cert.date);
      }
      return acc;
    }, initialCounts);

    const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
      try {
        return new Date(a) - new Date(b);
      } catch {
        return 0;
      }
    });

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Certificates Uploaded',
          data: sortedMonths.map(month => monthCounts[month]),
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
        setError(null);
        const certs = await fetchUserCertificates(studentdata.rollNo);
        setCertificates(certs || []);
        setChartData(processChartData(certs));
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load certificate data. Please try again.");
        setCertificates([]);
        setChartData(processChartData([]));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentdata, navigate]);

  // Safely calculate total points
  const totalPoints = certificates.reduce((sum, cert) => {
    const points = parseInt(cert?.points) || 0;
    return sum + points;
  }, 0);

  if (!studentdata) {
    return (
      <div className="container error-container">
        <p>No student data available. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu-faculty">
          {/* Sidebar navigation buttons */}
        </div>

        <div className="profile-content">
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            <FaArrowLeft /> Back to Student List
          </button>

          <h2>Student Details</h2>
          
          {/* Student Information Section */}
          <div className="student-info-card">
            <div className="student-basic-info">
              <h3>{studentdata.name || 'N/A'}</h3>
              <div className="info-grid">
                <div>
                  <p><strong>Roll No:</strong> {studentdata.rollNo || 'N/A'}</p>
                  <p><strong>Email:</strong> {studentdata.email || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Department:</strong> {studentdata.department || 'N/A'}</p>
                  <p><strong>Batch:</strong> {studentdata.batch || 'N/A'}</p>
                </div>
              </div>
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
                  <h4>{totalPoints}</h4>
                  <p>Total Points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Activity Chart */}
          <div className="chart-section">
            <h3>Certificate Activity</h3>
            {loading ? (
              <div className="loading-spinner">
                <FaSpinner className="spinner-icon" />
                <p>Loading chart data...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
              </div>
            ) : chartData?.labels?.length > 0 ? (
              <div className="chart-container">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            return `${context.parsed.y} certificate${context.parsed.y !== 1 ? 's' : ''}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                          stepSize: 1
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="no-data-message">No certificate data available for visualization.</p>
            )}
          </div>

          {/* Certificates List */}
          <div className="certificates-section">
            <div className="section-header">
              <h3>Certificates</h3>
              <p className="total-points">Total Points: {totalPoints}</p>
            </div>
            
            {loading ? (
              <div className="loading-spinner">
                <FaSpinner className="spinner-icon" />
                <p>Loading certificates...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
              </div>
            ) : certificates.length === 0 ? (
              <p className="no-data-message">No certificates found for this student.</p>
            ) : (
              <div className="certificate-grid">
                {certificates.map((cert) => (
                  <div key={cert.id} className="certificate-card">
                    <div className="certificate-header">
                      <h4>{cert.event_name || 'Unnamed Event'}</h4>
                      <span className={`status-badge ${cert.status?.toLowerCase() || 'pending'}`}>
                        {cert.status || 'Pending'}
                      </span>
                    </div>
                    <div className="certificate-details">
                      <p><strong>Organization:</strong> {cert.organization || 'N/A'}</p>
                      <p><strong>Date:</strong> {cert.date ? new Date(cert.date).toLocaleDateString() : 'Unknown date'}</p>
                      <p><strong>Points:</strong> {cert.points || 0}</p>
                      {cert.description && (
                        <p className="certificate-description">
                          <strong>Description:</strong> {cert.description}
                        </p>
                      )}
                    </div>
                    {cert.fileUrl && (
                      <div className="certificate-actions">
                        <a 
                          href={cert.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-certificate-btn"
                        >
                          View Certificate
                        </a>
                      </div>
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