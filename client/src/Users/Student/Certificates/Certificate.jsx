import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseFile/firebaseConfig";
import { Loading } from "../../../Loading/Loading";
import "./Certificate.css";
import { setLogLevel } from "firebase/app";

export const Certificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData"));
  console.log("userData:", userData);
  let userId = userData.rollNo;
  console.log("rollNo:", userId);


  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const q = query(collection(db, "certificates"), where("user_id", "==", userId));
        const querySnapshot = await getDocs(q);

        const fetchedCertificates = querySnapshot.docs.map(doc => {
          const data = doc.data();

          // 🔹 Ensure PDF file extension in URL
          const fixedFileURL = data.fileURL;
          // if (!fixedFileURL.endsWith(".pdf")) {
          //   fixedFileURL += ".pdf";
          // }

          return { id: doc.id, ...data, fileURL: fixedFileURL };
        });

        setCertificates(fetchedCertificates);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);
  
  if (isLoading) return <Loading />;

  return (
    <div className="certificate-container">
      <h2>My Certificates</h2>
      <div className="certificate-list">
        {certificates.length > 0 ? (
          certificates.map((cert) => {
            console.log(cert); // Correct placement
            return (
              <div key={cert.id} className="certificate-card">
                <h3>{cert.certificateName}</h3>
                <p><strong>Issued By:</strong> {cert.activityHead || "N/A"}</p>
                <p><strong>Date:</strong> {cert.eventDate || "N/A"}</p>
                <p><strong>Description:</strong> {cert.description || "N/A"}</p>

                {/* 🔹 Option 1: Clickable Link */}
                <a
                  href={cert.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="certificate-link"
                >
                  View Certificate
                </a>

                {/* 🔹 Option 2: Embedded PDF Preview */}
                {/* <iframe 
                  src={cert.fileURL} 
                  width="100px" 
                  height="100px"
                  title={`Certificate for ${cert.certificateName}`}
                  style={{ border: "none", marginTop: "10px" }}
                ></iframe> */}
              </div>
            );
          })
        ) : (
          <p>No certificates found.</p>
        )}
      </div>
    </div>
  );
};

