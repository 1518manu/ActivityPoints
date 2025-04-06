import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFile, FaTimes } from "react-icons/fa";
import { NotificationContainer } from "../../../Notification/NotificationContainer";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebaseFile/firebaseConfig"; // Firebase config file
import "./Upload.css";
import { setLogLevel } from "firebase/app";

export function CertificateUploadPage() {
  const [certificateName, setCertificateName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [activityHead, setActivityHead] = useState("");
  const [activity, setActivity] = useState("");
  const [achievementLevel, setAchievementLevel] = useState("");
  const [role, setRole] = useState(""); // State for roles
  const [prize, setPrize] = useState("");
  const [eventDate, setEventDate] = useState(""); // Event Date
  const [certificateDate, setCertificateDate] = useState(""); // Certificate Date
  const [semester, setSemester] = useState(""); // State for semester
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", show: false });
  

  const navigate = useNavigate();

  
  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };

  
  const auth = getAuth(); // Get authenticated user
  const db = getFirestore(app);
  const activityOptions = {
    "National Initiatives": ["NCC", "NSS"],
    "Sports & Games": ["Football", "Cricket", "Basketball", "Other"],
    "Cultural Activities": ["Music", "Performing Arts", "Literary Arts"],
    "Professional Self Initiatives": [
      "Tech Fest,Tech Quiz",
      "MOOC",
      "Competitions conducted by Professional Societies - (IEEE,IET, ASME, SAE, NASA etc.)",
      "Attending Full time Conference/ Seminars / Exhibitions/ Workshop/ STTP conducted at IITs /NITs ",
      "Paper presentation/publication at IITs/NITs ",
      "Poster Presentation at IITs /NITs ",
      "Industrial Training/Internship (atleast for 5 full days)",
      "Industrial/Exhibition visits",
    ],
    "Entrepreneurship and Innovation": [
      "Foreign Language Skill (TOEFL/ IELTS/ BEC exams etc.)",
      "Startup Company-Registered legally ",
      "Patent Filed ",
      "Patent - Published",
      "Patent- Approved ",
      "Patent- Licensed",
      "Product Development",
      "Awards for Products developed ",
      "Innovative technologies developed and used by industries/users ",
      "Got venture capital funding for innovative ideas/products",
      "Startup Employment (Offering jobs to two persons not less than Rs. 15000/- per month) ",
      "Societal innovations ",
    ],
    "Leadership & Management": ["Student Societies", "College Association", "Festival & Technical Events", "Elected student representatives"],
  };

  const achievementLevels = ["Level I (College)", "Level II (Zonal)", "Level III (State/University)", "Level IV (National)", "Level V (International)"];
  const rolesForLeadership = ["Core Coordinator", "Sub Coordinator", "Volunteer"]; // Default roles for Leadership & Management
  const rolesForElectedRepresentatives = ["Chairman", "Secretary", "Other Council Members"]; // Roles for Elected Student Representatives
  const prizeOptions = ["None", "1st Prize", "2nd Prize", "3rd Prize"];
  // const semesterOptions = Array.from({ length: 8 }, (_, i) => Semester ${i + 1}); // Semester options from 1 to 8
  const semesterOptions = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);


  const eligibleForLevels = [
    "Sports & Games",
    "Cultural Activities",
    "Tech Fest,Tech Quiz",
    "Competitions conducted by Professional Societies - (IEEE,IET, ASME, SAE, NASA etc.)",
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size should be less than 5MB.");
        console.log("File size should be less than 5MB.");
        showNotification("File size should be less than 5MB.","info");
        return;
      }
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        setError("Only JPEG, PNG, and PDF files are allowed.");
        console.log("Only JPEG, PNG, and PDF files are allowed.");
        showNotification("Only JPEG, PNG, and PDF files are allowed.","info");
        
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async () => {

    setIsLoading(true);
    if (
      !certificateName ||
      !selectedFile ||
      !activityHead ||
      !activity ||
      (isLevelRequired() && !achievementLevel) ||
      (isRoleRequired() && !role) ||
      !eventDate ||
      !certificateDate ||
      !semester // Ensure semester is selected
    ) {
      setError("Please fill all fields before submitting.");
      console.log("Please fill all fields before submitting.");
      showNotification("Please fill all fields before submitting.","info");
      setIsLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("User not logged in!");
      console.log("User not logged in!");
      showNotification("User not logged in!","error");
      setIsLoading(false);
      return;
    }

    // const user_id = "B22CSB75";
    // const formData = new FormData();
    // formData.append("file", selectedFile);
    // formData.append("fileName", selectedFile.name);
    // formData.append("folder", certificates/${user_id});
    // formData.append("publicKey", "public_dGrtJlwx1cYmPGWcjN5Ybdp0bYw=");
    console.log("data in local storage", localStorage.getItem("userData"));
    //const user_id = "B22CSB75";
    const userData = JSON.parse(localStorage.getItem("userData"));
    const user_id = userData.rollNo;
    console.log(user_id);  // Output: B22CSB75

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileName", selectedFile.name);
    formData.append("folder", `certificates/${user_id}`); 
    formData.append("publicKey", "public_dGrtJlwx1cYmPGWcjN5Ybdp0bYw="); 

    try {
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
              method: "POST",
              headers: {
                Authorization: `Basic ${btoa("private_6doDUpitrkkv73i9cZvUYrviuDg=:")}`, // Fixed API Key format
              },
              body: formData,
            });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error Details:", errorDetails); // Log detailed error
        throw new Error("ImageKit upload failed");
      }

      const data = await response.json();
      if (data.url) {
        const fileURL = data.url; // This is the uploaded file's URL

        // Save certificate details & file URL to Firestore
        const docRef = await addDoc(collection(db, "certificates"), {
          user_id,
          certificateName: certificateName || null,
          fileURL,
          activityHead: activityHead || null,
          activity: activity || null,
          achievementLevel: achievementLevel || null,
          role: role || null,
          prize: prize || null,
          eventDate: eventDate || null,
          certificateDate: certificateDate || null,
          semester: semester || null, // Include semester in Firestore data
          uploadedAt: new Date(),
        });

        console.log("Certificate uploaded with ID:", docRef.id);
        
        await addDoc(collection(db, "Validation"), {
          cert_id: docRef.id,
          faculty_id: userData.mentor,  // Assuming userData.mentor is available in scope
          points: 0,
          rejectReason: null,
          validatedBy: null,
          validationTime: null,
          validation_status: "not validated",
          createdAt: new Date(),
        });

        console.log("Certificate uploaded with ID:", docRef.id);
        showNotification("Certificate uploaded successfully!","success");
        resetForm();

        await addDoc(collection(db, "Notifications"), {
          cert_id: docRef.id,
          for: "faculty",
          msg: `${userData.name} uploaded a new certificate`,
          status: "not viewed",
          type: "upload",
          user_id: userData.mentor, // Assigning the faculty ID as recipient
          timestamp: new Date().toISOString(),
        });
    
        console.log("Notification sent to faculty:", userData.mentor);

        setTimeout(() => {
          navigate("/StudentDashboard");
        }, 1500);
      } else {
        showNotification("File upload failed!","error");
        setError("File upload failed!");
        console.log("File upload failed!")
      }
    } catch (error) {
      console.error("Upload failed:", error);
      showNotification("File upload failed!","error");
      console.log("File upload failed!")
      setError("File upload failed!");
    } finally {
      console.log("false");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCertificateName("");
    setSelectedFile(null);
    setPreviewUrl("");
    setActivityHead("");
    setActivity("");
    setAchievementLevel("");
    setRole("");
    setPrize("");
    setEventDate("");
    setCertificateDate("");
    setSemester(""); // Reset semester
    setError("");
  };

  // Helper functions remain unchanged
  const isLevelRequired = () => {
    return (
      activityHead === "Sports & Games" ||
      activityHead === "Cultural Activities" ||
      eligibleForLevels.includes(activity)
    );
  };

  const isRoleRequired = () => {
    return activityHead === "Leadership & Management";
  };

  const isPrizeRequired = () => {
    return activityHead === "Sports & Games" || activityHead === "Cultural Activities";
  };

  const getRoles = () => {
    if (activity === "Elected student representatives") {
      return rolesForElectedRepresentatives;
    }
    return rolesForLeadership;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="upload-container">
      <NotificationContainer message={notification.message} type={notification.type} show={notification.show} />
      <h2>Upload Your Certificate</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="input-group">
        <label>Certificate Name:</label>
        <input
          type="text"
          value={certificateName}
          onChange={(e) => setCertificateName(e.target.value)}
          placeholder="Enter Certificate Name"
          aria-label="Certificate Name"
        />
      </div>

      <label className="file-input">
        <FaUpload /> Select Certificate
        <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} aria-label="Select Certificate" />
      </label>

      {previewUrl && (
        <div className="preview-container">
          <p>
            <FaFile /> {selectedFile?.name}
            <button onClick={() => setPreviewUrl("")} aria-label="Remove File">
              <FaTimes />
            </button>
          </p>
        </div>
      )}

      {/* Event Date */}
      <div className="input-group">
        <label>Date of Event:</label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          max={getTodayDate()} // Restrict to today's date or earlier
          aria-label="Event Date"
        />
      </div>

      {/* Certificate Date */}
      <div className="input-group">
        <label>Date Certificate Provided:</label>
        <input
          type="date"
          value={certificateDate}
          onChange={(e) => setCertificateDate(e.target.value)}
          max={getTodayDate()} // Restrict to today's date or earlier
          aria-label="Certificate Date"
        />
      </div>

      {/* Semester Dropdown */}
      <div className="input-group">
        <label>Semester:</label>
        <select value={semester} onChange={(e) => setSemester(e.target.value)} aria-label="Semester">
          <option value="" disabled>
            Select Semester
          </option>
          {semesterOptions.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>Activity Head:</label>
        <select value={activityHead} onChange={(e) => setActivityHead(e.target.value)} aria-label="Activity Head">
          <option value="" disabled>
            Select Activity Head
          </option>
          {Object.keys(activityOptions).map((head) => (
            <option key={head} value={head}>
              {head}
            </option>
          ))}
        </select>
      </div>

      {activityHead && (
        <div className="input-group">
          <label>Activity:</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} aria-label="Activity">
            <option value="" disabled>
              Select Activity
            </option>
            {activityOptions[activityHead].map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLevelRequired() && activityHead !== "Leadership & Management" && (
        <div className="input-group">
          <label>Achievement Level:</label>
          <select value={achievementLevel} onChange={(e) => setAchievementLevel(e.target.value)} aria-label="Achievement Level">
            <option value="" disabled>
              Select Level
            </option>
            {achievementLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      )}

      {isRoleRequired() && (
        <div className="input-group">
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
            <option value="" disabled>
              Select Role
            </option>
            {getRoles().map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </div>
      )}

      {isPrizeRequired() && (
        <div className="input-group">
          <label>Prize (if any):</label>
          <select value={prize} onChange={(e) => setPrize(e.target.value)} aria-label="Prize">
            <option value="" disabled>
              Select Prize
            </option>
            {prizeOptions.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </div>
      )}

      <button onClick={handleSubmit} className = "upload-button" disabled={isLoading}>
      {isLoading ? "Wait.." : "Upload"} <FaUpload />
      </button>
    </div>
  );
}