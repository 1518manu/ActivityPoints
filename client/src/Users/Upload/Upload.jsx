// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaUpload, FaFile } from "react-icons/fa";
// import { NotificationContainer } from "../../Notification/NotificationContainer";
// import "./Upload.css";
// // import { db, storage } from "../../firebaseFile/firebaseConfig";
// // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// // import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// // import { getAuth } from "firebase/auth";
// import { uploadCertificate } from "../../firebaseFile/firebaseStorage"; // Import the function
// import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore"; // Import Firestore methods
// import { app } from "../../firebaseFile/firebaseConfig"; // Adjust the import based on your Firebase config file

// export function CertificateUploadPage() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState("");
//   const [category, setCategory] = useState("curricular");
//   const [eventDate, setEventDate] = useState("");
//   const [certificateDate, setCertificateDate] = useState("");
//   const [certificateType, setCertificateType] = useState("");
//   const [organization, setOrganization] = useState("");
//   const [institute, setInstitute] = useState("");
//   const [notification, setNotification] = useState({ message: "", type: "", show: false });
  
//   const navigate = useNavigate();

//   const institutes = ["TKMCE", "CTE", "NSSCE"];
//   const organizations = ["IEEE", "IEI", "ACM", "HESTIA", "TINKERHUB"];
//   const certificateTypes = ["Hackathon", "Sports", "Arts", "Workshop", "Volunteering",
//     "NPTEL Course", "Internship", "Webinar", "Seminar", "Conference", "Other"];

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//     }
//   };

  


//   const showNotification = (message, type) => {
//     setNotification({ message, type, show: true });
//     setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
//   };

// //-------------------------
// const db = getFirestore(app);
// // const studentsCollectionRef = collection(db, "Students");

// // const addStudent = async () => {
// //   try {
// //     const docRef = await addDoc(studentsCollectionRef, {
// //       roll_no: "123",
// //       name: "John Doe",
// //       adm_no: "A001",
// //       mail: "john@example.com",
// //     });
// //     console.log("Document added with ID:", docRef.id);
// //   } catch (error) {
// //     console.error("Error adding document:", error);
// //   }
// // };

// // addStudent();
// // Use useEffect inside the component
// useEffect(() => {
//   const fetchStudentData = async () => {
//     try {
//       // Reference to the "Students" collection
//       const studentsCollectionRef = collection(db, "Students");

//       // Get the documents from the collection
//       const querySnapshot = await getDocs(studentsCollectionRef);

//       // Iterate over the documents and log them
//       querySnapshot.forEach((doc) => {
//         console.log(doc.id, " => ", doc.data());
//       });
//     } catch (error) {
//       console.error("Error fetching student data: ", error);
//     }
//   };

//   fetchStudentData();
// }, [db]);

// //------------
// const handleUpload = async () => {
//   if (!selectedFile || !eventDate || !certificateDate || !certificateType || !organization || !institute) {
//     showNotification("Please fill all details before uploading!", "error");
//     return;
//   }

//   const userId = "someUserId"; // Replace with actual user ID from auth
//   const fileURL = await uploadCertificate(selectedFile, userId);

//   if (!fileURL) {
//     showNotification("File upload failed!", "error");
//     return;
//   }

//   const uploadData = {
//     fileURL, // Store the download URL instead of just the filename
//     category,
//     eventDate,
//     certificateDate,
//     certificateType,
//     organization,
//     institute,
//   };

//   console.log("Uploading Data to Firestore:", uploadData);

//   showNotification("Upload Successful!", "success");
//   setTimeout(() => {
//         navigate("/dashboard");
//        }, 1500); // 1.5 seconds delay
// };



// //-----------------
//   // const handleUpload = () => {
//   //   if (!selectedFile || !eventDate || !certificateDate || !certificateType || !organization || !institute) {
//   //     showNotification("Please fill all details before uploading!", "error");
//   //     //alert("Please fill all details before uploading!");
//   //     return;
//   //   }

//   //   const uploadData = {
//   //     fileName: selectedFile.name,
//   //     category,
//   //     eventDate,
//   //     certificateDate,
//   //     certificateType,
//   //     organization,
//   //     institute,
//   //   };

//   //   console.log("Uploading Data:", uploadData);
//   //   showNotification("upload Successful!", "success");
//   //   //alert("Certificate uploaded successfully!");
//   //   // Add a short delay before navigating
//   //   setTimeout(() => {
//   //     navigate("/dashboard");
//   //   }, 1500); // 1.5 seconds delay

//   //   // TODO: Implement backend file upload
//   // };
//   //----------------------------------------
  
// //----------------------------------------
//   return (
//     <div className="upload-container">
//       <NotificationContainer message={notification.message} type={notification.type} show={notification.show} />
//       <h2 className="Upload-Your-Certificate">Upload Your Certificate</h2>

//       {/* File Upload */}
//       <label className="upload-box">
//         <FaUpload className="upload-icon" />
//         <p>Click to select a certificate</p>
//         <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} />
//       </label>

//       {/* Preview */}
//       {previewUrl && (
//         <div className="preview-container">
//           <p>
//            <FaFile style={{ color: "#868282", fontSize: "20px", margin:"0px 10px 0px 0px ",fontWeight: "100" }}/>
//             Selected File: {selectedFile.name}</p>
//           {selectedFile.type.startsWith("image/") && (
//             <img src={previewUrl} alt="Certificate Preview" className="preview-image" />
//           )}
//         </div>
//       )}

//       {/* Toggle Button for Curricular / Non-Curricular */}
//         <div
//         className={`toggle-group ${category === "noncurricular" ? "noncurricular" : ""}`}
//         onClick={() => setCategory(category === "curricular" ? "noncurricular" : "curricular")}
//         >
//         <div className="toggle-active"></div>
//         <div className={`toggle-button ${category === "curricular" ? "active" : ""}`}>Curricular</div>
//         <div className={`toggle-button ${category === "noncurricular" ? "active" : ""}`}>Non-Curricular</div>
//       </div>

//       {/* Date of Event */}
//       <div className="input-group">
//         <label>Date of Event:</label>
//         <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
//       </div>

//       {/* Date of Certificate Provided */}
//       <div className="input-group">
//         <label>Date Certificate Provided:</label>
//         <input type="date" value={certificateDate} onChange={(e) => setCertificateDate(e.target.value)} />
//       </div>

//       {/* Certificate Type Dropdown */}
//       <div className="input-group">
//         <label>Type of Certificate:</label>
//         <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
//           <option value="" disabled>Select a Certificate Type</option>
//           {certificateTypes.map((cert) => (
//             <option key={cert} value={cert}>{cert}</option>
//           ))}
//         </select>
//       </div>

//       {/* Organization Dropdown */}
//       <div className="input-group">
//         <label>Organization:</label>
//         <select value={organization} onChange={(e) => setOrganization(e.target.value)}>
//           <option value="" disabled>Select an Organization</option>
//           {organizations.map((org) => (
//             <option key={org} value={org}>{org}</option>
//           ))}
//         </select>
//       </div>
      
//       {/* Institute Dropdown */}
//       <div className="input-group">
//         <label>Institute:</label>
//         <select value={institute} onChange={(e) => setInstitute(e.target.value)}>
//           <option value="" disabled>Select an Institute</option>
//           {institutes.map((inst) => (
//             <option key={inst} value={inst}>{inst}</option>
//           ))}
//         </select>
//       </div>

//       {/* Upload Button */}
//       <button className="uploadButton" onClick={handleUpload}>
//         Upload  <FaUpload style={{ color: "#ffff", fontSize: "20px", margin:" 5px 0px",fontWeight: "100" }}/>
//       </button>
//     </div>
//   );
// }





///

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFile } from "react-icons/fa";
import { NotificationContainer } from "../../Notification/NotificationContainer";
import { uploadCertificate } from "../../firebaseFile/firebaseStorage"; // Function to upload files
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebaseFile/firebaseConfig"; // Firebase config file
import "./Upload.css";

export function CertificateUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [category, setCategory] = useState("curricular");
  const [eventDate, setEventDate] = useState("");
  const [certificateDate, setCertificateDate] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [organization, setOrganization] = useState("");
  const [institute, setInstitute] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "", show: false });

  const navigate = useNavigate();
  const auth = getAuth(); // Get authenticated user
  const db = getFirestore(app);
  const storage = getStorage(app);

  const institutes = ["TKMCE", "CTE", "NSSCE"];
  const organizations = ["IEEE", "IEI", "ACM", "HESTIA", "TINKERHUB"];
  const certificateTypes = ["Hackathon", "Sports", "Arts", "Workshop", "Volunteering", "NPTEL Course", "Internship", "Webinar", "Seminar", "Conference", "Other"];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };

  // // 🔹 Function to Upload PDF and Save Data
  const handleUpload = async () => {
    if (!selectedFile || !eventDate || !certificateDate || !certificateType || !organization || !institute) {
      showNotification("Please fill all details before uploading!", "error");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showNotification("User not logged in!", "error");
      return;
    }

    const userId = user.uid; // Get logged-in user's ID
    const storageRef = ref(storage, `certificates/${userId}/${selectedFile.name}`);

    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, selectedFile);
      const fileURL = await getDownloadURL(storageRef);

      // Save certificate details & file URL to Firestore
      const docRef = await addDoc(collection(db, "certificates"), {
        userId,
        fileURL,
        category,
        eventDate,
        certificateDate,
        certificateType,
        organization,
        institute,
        uploadedAt: new Date(),
      });

      console.log("Certificate uploaded with ID:", docRef.id);
      showNotification("Upload Successful!", "success");

      setTimeout(() => {
        navigate("/StudentDashboard");
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      showNotification("File upload failed!", "error");
    }
  };

  //--------Cloudinary
//   const handleUpload = async () => {
//     if (!selectedFile || !eventDate || !certificateDate || !certificateType || !organization || !institute) {
//       showNotification("Please fill all details before uploading!", "error");
//       return;
//     }
  
//     const user = auth.currentUser;
//     if (!user) {
//       showNotification("User not logged in!", "error");
//       return;
//     }
  
//     const userId = user.uid;
//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("upload_preset", "certificates_upload"); // Replace with your Cloudinary preset
//     formData.append("folder", `certificates/${userId}`); // Create user-specific folders
  
//     try {
//       // 🔹 Upload file to Cloudinary
//       const response = await fetch("https://api.cloudinary.com/v1_1/dbcaiomnc/raw/upload", {
//         method: "POST",
//         body: formData,
//       });
  
//       if (!response.ok) throw new Error("Cloudinary upload failed");
  
//       const data = await response.json();
//       if (data.secure_url) {
//         const fileURL = data.secure_url; // This is the URL of the uploaded PDF file

//         // Save certificate details & file URL to Firestore
//         const docRef = await addDoc(collection(db, "certificates"), {
//             userId,
//             fileURL,
//             category,
//             eventDate,
//             certificateDate,
//             certificateType,
//             organization,
//             institute,
//             uploadedAt: new Date(),
//         });

//         console.log("Certificate uploaded with ID:", docRef.id);
//         showNotification("Upload Successful!", "success");

//         setTimeout(() => {
//             navigate("/StudentDashboard");
//         }, 1500);
//     } else {
//         showNotification("File upload failed!", "error");
//     }
// } catch (error) {
//     console.error("Upload failed:", error);
//     showNotification("File upload failed!", "error");
// }
// };
///----------------------------------------cloudinary
  

  return (
    <div className="upload-container">
      <NotificationContainer message={notification.message} type={notification.type} show={notification.show} />
      <h2 className="Upload-Your-Certificate">Upload Your Certificate</h2>

      {/* File Upload */}
      <label className="upload-box">
        <FaUpload className="upload-icon" />
        <p>Click to select a certificate</p>
        <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} />
      </label>

      {/* Preview */}
      {previewUrl && (
        <div className="preview-container">
          <p>
            <FaFile style={{ color: "#868282", fontSize: "20px", margin: "0px 10px 0px 0px", fontWeight: "100" }} />
            Selected File: {selectedFile.name}
          </p>
        </div>
      )}

      {/* Toggle Button for Curricular / Non-Curricular */}
      <div
        className={`toggle-group ${category === "noncurricular" ? "noncurricular" : ""}`}
        onClick={() => setCategory(category === "curricular" ? "noncurricular" : "curricular")}
      >
        <div className="toggle-active"></div>
        <div className={`toggle-button ${category === "curricular" ? "active" : ""}`}>Curricular</div>
        <div className={`toggle-button ${category === "noncurricular" ? "active" : ""}`}>Non-Curricular</div>
      </div>

      {/* Date of Event */}
      <div className="input-group">
        <label>Date of Event:</label>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>

      {/* Date of Certificate Provided */}
      <div className="input-group">
        <label>Date Certificate Provided:</label>
        <input type="date" value={certificateDate} onChange={(e) => setCertificateDate(e.target.value)} />
      </div>

      {/* Certificate Type Dropdown */}
      <div className="input-group">
        <label>Type of Certificate:</label>
        <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
          <option value="" disabled>Select a Certificate Type</option>
          {certificateTypes.map((cert) => (
            <option key={cert} value={cert}>{cert}</option>
          ))}
        </select>
      </div>

      {/* Organization Dropdown */}
      <div className="input-group">
        <label>Organization:</label>
        <select value={organization} onChange={(e) => setOrganization(e.target.value)}>
          <option value="" disabled>Select an Organization</option>
          {organizations.map((org) => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>
      </div>

      {/* Institute Dropdown */}
      <div className="input-group">
        <label>Institute:</label>
        <select value={institute} onChange={(e) => setInstitute(e.target.value)}>
          <option value="" disabled>Select an Institute</option>
          {institutes.map((inst) => (
            <option key={inst} value={inst}>{inst}</option>
          ))}
        </select>
      </div>

      {/* Upload Button */}
      <button className="uploadButton" onClick={handleUpload}>
        Upload <FaUpload style={{ color: "#ffff", fontSize: "20px", margin: "5px 0px", fontWeight: "100" }} />
      </button>
    </div>
  );
}

