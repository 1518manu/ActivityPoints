import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Certificate.css";

export const Certificate = () => {
  const [certificates, setCertificates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the certificate list from the backend
    const fetchCertificates = async () => {
      try {
        const response = await fetch("/api/certificates"); // Adjust the API endpoint accordingly
        if (!response.ok) {
          throw new Error("Failed to fetch certificates");
        }
        const data = await response.json();
        setCertificates(data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };
    
    fetchCertificates();
  }, []);

  return (
    <div className="certificate-container">
      <h2>My Certificates</h2>
      <div className="certificate-list">
        {certificates.length > 0 ? (
          certificates.map((cert) => (
            <div key={cert.id} className="certificate-card">
              <h3>{cert.title}</h3>
              <p><strong>Issued By:</strong> {cert.issuer}</p>
              <p><strong>Date:</strong> {cert.date}</p>
              <p><strong>Description:</strong> {cert.description}</p>
              <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="view-button">
                View Certificate
              </a>
            </div>
          ))
        ) : (
          <p>No certificates found.</p>
        )}
      </div>
    </div>
  );
};
