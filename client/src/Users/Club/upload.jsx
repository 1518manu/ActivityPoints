import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFile, FaTimes } from "react-icons/fa";
import { NotificationContainer } from "../../../Notification/NotificationContainer";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebaseFile/firebaseConfig";
import "./EventUpload.css";

export function EventUploadPage() {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [maxParticipants, setMaxParticipants] = useState("");
    const [type, setType] = useState("");
    const [poster, setPoster] = useState(null);
    const [registrationLink, setRegistrationLink] = useState("");
    const [location, setLocation] = useState("");
    const [speaker, setSpeaker] = useState("");
    const [requirements, setRequirements] = useState("");
    const [dateOfEvent, setDateOfEvent] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "", show: false });
  
    const navigate = useNavigate();
  
    const showNotification = (message, type) => {
      setNotification({ message, type, show: true });
      setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
    };
  
    const auth = getAuth();
    const db = getFirestore(app);
    const storage = getStorage(app);
  
    const eventTypes = [
      "Workshop",
      "Competition",
      "Career Fair",
      "Networking",
      "Seminar",
      "Conference"
    ];
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError("File size should be less than 5MB.");
          showNotification("File size should be less than 5MB.", "info");
          return;
        }
        if (!["image/jpeg", "image/png"].includes(file.type)) {
          setError("Only JPEG and PNG files are allowed.");
          showNotification("Only JPEG and PNG files are allowed.", "info");
          return;
        }
        setPoster(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError("");
      }
    };
  
    const handleSubmit = async () => {
      setIsLoading(true);
      
      if (!title || !time || !description || !maxParticipants || !type || 
          !poster || !registrationLink || !location || !speaker || !dateOfEvent) {
        setError("Please fill all required fields before submitting.");
        showNotification("Please fill all required fields before submitting.", "info");
        setIsLoading(false);
        return;
      }
  
      const user = auth.currentUser;
      if (!user) {
        setError("User not logged in!");
        showNotification("User not logged in!", "error");
        setIsLoading(false);
        return;
      }
  
      try {
        // Upload poster image to Firebase Storage
        const storageRef = ref(storage, `event-posters/${user.uid}/${poster.name}`);
        await uploadBytes(storageRef, poster);
        const posterUrl = await getDownloadURL(storageRef);
  
        // Save event details to Firestore
        const docRef = await addDoc(collection(db, "events"), {
          title,
          time,
          description,
          maxParticipants: parseInt(maxParticipants),
          registered: 0, // Start with 0 registered
          type,
          posterUrl,
          registrationLink,
          location,
          speaker,
          requirements,
          dateOfEvent,
          createdAt: new Date(),
          createdBy: user.uid
        });
  
        console.log("Event created with ID:", docRef.id);
        showNotification("Event created successfully!", "success");
        
        // Reset form
        setTitle("");
        setTime("");
        setDescription("");
        setMaxParticipants("");
        setType("");
        setPoster(null);
        setPreviewUrl("");
        setRegistrationLink("");
        setLocation("");
        setSpeaker("");
        setRequirements("");
        setDateOfEvent("");
  
        // Navigate after successful submission
        setTimeout(() => {
          navigate("/events");
        }, 1500);
      } catch (error) {
        console.error("Error creating event:", error);
        setError("Failed to create event. Please try again.");
        showNotification("Failed to create event. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };
  
    const resetForm = () => {
      setTitle("");
      setTime("");
      setDescription("");
      setMaxParticipants("");
      setType("");
      setPoster(null);
      setPreviewUrl("");
      setRegistrationLink("");
      setLocation("");
      setSpeaker("");
      setRequirements("");
      setDateOfEvent("");
      setError("");
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
    <div className="event-upload">
      <NotificationContainer message={notification.message} type={notification.type} show={notification.show} />
      <h2 className="event-upload__title">Create New Event</h2>

      {error && <div className="event-upload__error">{error}</div>}

      <div className="event-upload__field">
        <label className="event-upload__label">Event Title:</label>
        <input
          type="text"
          className="event-upload__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Event Title"
          aria-label="Event Title"
        />
      </div>

      <div className="input-group">
        <label>Event Time:</label>
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="e.g., 10:00 AM - 12:00 PM"
          aria-label="Event Time"
        />
      </div>

      <div className="input-group">
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed description of the event"
          aria-label="Event Description"
          rows="4"
        />
      </div>

      <div className="input-group">
        <label>Maximum Participants:</label>
        <input
          type="number"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          placeholder="Enter maximum number of participants"
          aria-label="Maximum Participants"
          min="1"
        />
      </div>

      <div className="input-group">
        <label>Event Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Event Type">
          <option value="" disabled>Select Event Type</option>
          {eventTypes.map((eventType) => (
            <option key={eventType} value={eventType}>{eventType}</option>
          ))}
        </select>
      </div>


      <label className="event-upload__file-label">
        <FaUpload className="event-upload__file-icon" /> Select Event Poster
        <input 
          type="file" 
          className="event-upload__file-input"
          accept="image/jpeg, image/png" 
          onChange={handleFileChange} 
          aria-label="Select Event Poster" 
        />
      </label>

      {previewUrl && (
        <div className="event-upload__preview">
          <p className="event-upload__preview-info">
            <FaFile className="event-upload__file-icon" /> {poster?.name}
            <button 
              className="event-upload__preview-remove"
              onClick={() => setPreviewUrl("")} 
              aria-label="Remove File"
            >
              <FaTimes className="event-upload__remove-icon" />
            </button>
          </p>
          <img src={previewUrl} alt="Poster preview" className="event-upload__preview-image" />
        </div>
      )}

<div className="input-group">
        <label>Registration Link:</label>
        <input
          type="url"
          value={registrationLink}
          onChange={(e) => setRegistrationLink(e.target.value)}
          placeholder="Enter registration URL"
          aria-label="Registration Link"
        />
      </div>

      <div className="input-group">
        <label>Location:</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter event location"
          aria-label="Event Location"
        />
      </div>

      <div className="input-group">
        <label>Speaker/Instructor:</label>
        <input
          type="text"
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="Enter speaker name and affiliation"
          aria-label="Speaker"
        />
      </div>

      <div className="input-group">
        <label>Requirements:</label>
        <input
          type="text"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="e.g., Bring your laptop with Node.js installed"
          aria-label="Requirements"
        />
      </div>

      <div className="input-group">
        <label>Date of Event:</label>
        <input
          type="date"
          value={dateOfEvent}
          onChange={(e) => setDateOfEvent(e.target.value)}
          min={getTodayDate()} // Restrict to today or future dates
          aria-label="Date of Event"
        />
      </div>

      <button 
        onClick={handleSubmit} 
        className="event-upload__submit" 
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Event"} <FaUpload className="event-upload__submit-icon" />
      </button>
    </div>
  );
}