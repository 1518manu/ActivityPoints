import React, { useState } from "react";
import { FaUpload, FaFile, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebaseFile/firebaseConfig";
import "./Upload.css";

export function EventUploadPage() {
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [speakers, setSpeakers] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [poster, setPoster] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const db = getFirestore(app);
  const storage = getStorage(app);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB.");
        return;
      }
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        setError("Only JPEG, PNG, and PDF files are allowed.");
        return;
      }
      setPoster(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!title || !organizer || !venue || !time || !eventDate || !deadline || !poster) {
      setError("Please fill all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      let posterUrl = "";
      if (poster) {
        const posterRef = ref(storage, `event-posters/${poster.name}`);
        await uploadBytes(posterRef, poster);
        posterUrl = await getDownloadURL(posterRef);
      }

      await addDoc(collection(db, "events"), {
        title,
        organizer,
        venue,
        time,
        link,
        eventDate,
        deadline,
        description,
        mode,
        eligibility,
        speakers,
        registrationFee,
        contactPerson,
        contactDetails,
        posterUrl,
        createdAt: new Date(),
      });

      navigate("/events");
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload event details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Event Details</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="input-group">
        <label>Event Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="input-group">
        <label>Organizer:</label>
        <input type="text" value={organizer} onChange={(e) => setOrganizer(e.target.value)} required />
      </div>

      <div className="input-group">
        <label>Venue:</label>
        <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required />
      </div>

      <div className="input-group">
        <label>Time:</label>
        <input type="text" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>

      <div className="input-group">
        <label>Event Date:</label>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
      </div>

      <div className="input-group">
        <label>Deadline for Registration:</label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
      </div>

      <div className="input-group">
        <label>Registration Link:</label>
        <input type="url" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>

      <div className="input-group">
        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>
      </div>

      <div className="input-group">
        <label>Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="" disabled>Select Mode</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      <div className="input-group">
        <label>Eligibility:</label>
        <input type="text" value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="e.g., Open to all students" />
      </div>

      <div className="input-group">
        <label>Speakers (if any):</label>
        <input type="text" value={speakers} onChange={(e) => setSpeakers(e.target.value)} placeholder="e.g., John Doe, Jane Smith" />
      </div>

      <div className="input-group">
        <label>Registration Fee (if any):</label>
        <input type="text" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} placeholder="e.g., Free / $10" />
      </div>

      <div className="input-group">
        <label>Contact Person:</label>
        <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Organizer Name" />
      </div>

      <div className="input-group">
        <label>Contact Details:</label>
        <input type="text" value={contactDetails} onChange={(e) => setContactDetails(e.target.value)} placeholder="Email or Phone" />
      </div>

      <label className="file-input">
        <FaUpload /> Upload Poster
        <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} required />
      </label>

      {previewUrl && (
        <div className="preview-container">
          <p><FaFile /> {poster?.name} <button onClick={() => setPreviewUrl("")}><FaTimes /></button></p>
        </div>
      )}

      <button onClick={handleSubmit} className="upload-button" disabled={isLoading}>
        {isLoading ? "Uploading..." : "Submit Event"} <FaUpload />
      </button>
    </div>
  );
}
