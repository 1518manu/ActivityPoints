import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUniversity, FaSignOutAlt, FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import './Club.css';
import { db } from '../../firebaseFile/firebaseConfig'; // adjust this path based on your setup
import { collection, addDoc, Timestamp ,getDocs} from 'firebase/firestore';
import { parse } from "date-fns"; // Make sure you have date-fns installed

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  isSameDay,
  addDays,
  parseISO
} from "date-fns";

export const Club = ({ token, userData: initialUserData, onLogout }) => {
  const [userData, setUserData] = useState(initialUserData);
  const navigate = useNavigate();
  //console.log("user data", userData);
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
    poster: ''
  });
  const [editingEvent, setEditingEvent] = useState({
    mode: 'create',
    event: {
      title: '',
      time: '',
      location: '',
      poster: '',
      description: '',
    },
  });
  
  const [showDayEvents, setShowDayEvents] = useState(false);

  // Sample events data
  // 
  //         id: 1,
  //         title: "Club Orientation",
  //         time: "3:00 PM ",
  //         duration: "2 hours",
  //         points: 10,
  //         description: "Welcome new members to our club and introduce them to our activities.",
  //         location: "Main Auditorium",
  //         poster: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57",
  //         maxParticipants: 50,
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Events"));
        const eventMap = {};
  
        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          
          if (eventData.date?.seconds) {
            // Convert Firestore timestamp to JS Date
            const eventDate = new Date(eventData.date.seconds * 1000);
            const dateKey = format(eventDate, "yyyy-MM-dd");
  
            if (!eventMap[dateKey]) {
              eventMap[dateKey] = [];
            }
  
            eventMap[dateKey].push({ id: doc.id, ...eventData });
          }
        });
  
        setEvents(eventMap);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };
  
    fetchEvents();
  }, []);
  // Navigation handlers
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Calendar handlers
  const navigateCalendar = (direction) => {
    if (viewMode === 'month') {
      setCurrentMonth(addMonths(currentMonth, direction));
    } else {
      setCurrentMonth(addDays(currentMonth, direction * 7));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    setShowDayEvents(true);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setShowDayEvents(true);
    setEditingEvent(null);
  };

  const closeDayEvents = () => {
    setShowDayEvents(false);
  };

  const handleAddEvent = () => {
    setEditingEvent({
      mode: 'create',
      date: selectedDate,
      event: {
        title: '',
        description: '',
        time: '',
        location: '',
        poster: ''
      }
    });
    setShowDayEvents(false);
  };

  const handleEditEvent = (event) => {
    setEditingEvent({
      mode: 'edit',
      date: selectedDate,
      event: { ...event }
    });
    setShowDayEvents(false);
  };

 
  const handleSaveEvent = async () => {
    const { title, time, location, poster, description } = editingEvent.event;
  
    if (!title || !time) {
      alert("Title and Time are required.");
      return;
    }
  
    try {
      // 🧠 Combine date and time into a single Date object
      const dateString = `${format(selectedDate, 'yyyy-MM-dd')} ${time}`; // e.g. "2025-04-09 2:00 PM"
      const combinedDate = parse(dateString, 'yyyy-MM-dd h:mm a', new Date());
  
      const newEvent = {
        title,
        time,
        location,
        poster,
        description,
        date: Timestamp.fromDate(combinedDate), // ✅ Save as Firestore Timestamp
        club_id: userData.club_id || 'Unknown',
        createdAt: Timestamp.now(),
      };
  
      await addDoc(collection(db, 'Events'), newEvent);
  
      console.log('Event saved successfully to Firestore');
      setEditingEvent(null);
      //fetchEvents(); // Optional: refresh events from DB
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event.");
    }
    //setEvents(updatedEvents);
      setEditingEvent(null);
      setShowDayEvents(true);
  };
  
  

  const handleDeleteEvent = () => {
    if (editingEvent.mode === 'edit') {
      const dateKey = format(editingEvent.date, 'yyyy-MM-dd');
      const updatedEvents = { ...events };
      updatedEvents[dateKey] = updatedEvents[dateKey].filter(e => e.id !== editingEvent.event.id);
      
      if (updatedEvents[dateKey].length === 0) {
        delete updatedEvents[dateKey];
      }
      
      setEvents(updatedEvents);
    }
    setEditingEvent(null);
    setShowDayEvents(true);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setShowDayEvents(true);
  };

  // Calendar sub-components
  const EventDot = () => (
    <div className="club-calendar__event-dot" />
  );

  const DayCell = ({ day, monthStart }) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    const dayEvents = events[formattedDate] || [];
    const isDisabled = !isSameMonth(day, monthStart);
    const isCurrentDay = isToday(day);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const hasEvents = dayEvents.length > 0;

    return (
      <div
        className={`club-calendar__day-cell ${isDisabled ? "club-calendar__day-cell--disabled" : ""} ${
          isCurrentDay ? "club-calendar__day-cell--today" : ""
        } ${isSelected ? "club-calendar__day-cell--selected" : ""} ${
          hasEvents ? "club-calendar__day-cell--has-events" : ""
        }`}
        onClick={() => !isDisabled && handleDateClick(day)}
      >
        <span className="club-calendar__day-number">{format(day, "d")}</span>
        {hasEvents && (
          <div className="club-calendar__event-dots">
            {dayEvents.slice(0, 3).map((_, i) => (
              <EventDot key={i} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const MonthView = ({ currentMonth }) => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="club-calendar__days-grid">
        {weeks.map((week, weekIdx) => (
          <div className="club-calendar__week-row" key={weekIdx}>
            {week.map(day => (
              <DayCell
                key={day}
                day={day}
                monthStart={monthStart}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const WeekView = ({ currentMonth }) => {
    const weekStart = startOfWeek(currentMonth);
    const weekEnd = endOfWeek(currentMonth);

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="club-calendar__week-view">
        {days.map(day => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const dayEvents = events[formattedDate] || [];
          const isCurrentDay = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div 
              key={day} 
              className={`club-calendar__week-day ${
                isCurrentDay ? 'club-calendar__week-day--today' : ''
              } ${
                isSelected ? 'club-calendar__week-day--selected' : ''
              }`}
              onClick={() => handleDateClick(day)}
            >
              <div className="club-calendar__week-day-header">
                <span className="club-calendar__week-day-name">{format(day, "EEE")}</span>
                <span className="club-calendar__week-day-number">{format(day, "d")}</span>
              </div>
              <div className="club-calendar__week-day-events">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="club-calendar__week-event"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(event);
                    }}
                  >
                    <span className="club-calendar__event-time">{event.time.split(' - ')[0]}</span>
                    <span className="club-calendar__event-title">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const DayEventsPopup = () => {
    if (!selectedDate || !showDayEvents) return null;
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayEvents = events[dateKey] || [];
    console.log("Events on selected date:", dayEvents.length);
    console.log("dateKey", dateKey);

    return (
      <div className="club-day-events-popup">
        <div className="club-day-events-popup__header">
          <h3 className="club-day-events-popup__title">
            Events for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <button 
            className="club-day-events-popup__close"
            onClick={closeDayEvents}
          >
            <FaTimes />
          </button>
        </div>
        
        {dayEvents.length > 0 ? (
          <div className="club-day-events-popup__list">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className="club-day-events-popup__item"
                onClick={() => handleEditEvent(event)}
              >
                <div className="club-day-events-popup__item-header">
                <div className="club-day-events-popup__item-description"><strong>{event.title}</strong></div>
                  <span className="club-day-events-popup__item-time">{event.time}</span>
                  {/* <span className="club-day-events-popup__item-title">{event.title}</span> */}
                </div>
                <div className="club-day-events-popup__item-location">Location: {event.location}</div>
                <div className="club-day-events-popup__item-location">Duration: {event.duration}</div>
                {event.description && (
                  <div className="club-day-events-popup__item-description">{event.description}</div>
                )}
                {event.poster && (
                  <div className="club-day-events-popup__item-poster">
                    <img src={event.poster} alt={event.title} />
                  </div>
                )}
                <div className="club-day-events-popup__item-description">Points: {event.points}</div>
                <div className="club-day-events-popup__item-footer">
                  Created by: {event.club_id}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="club-day-events-popup__empty">
            No events scheduled for this day
          </div>
        )}
        
        <button 
  className={`club-day-events-popup__add-button ${
    dayEvents.length > 0 ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''
  }`}
  onClick={handleAddEvent}
  disabled={dayEvents.length > 0}
>
  <FaPlus /> Add Event
</button>

      </div>
    );
  };

  const EventEditor = () => {
    if (!editingEvent) return null;

    return (
      <div className="club-event-editor">
        <div className="club-event-editor__header">
          <h3 className="club-event-editor__title">
            {editingEvent.mode === 'create' ? 'Add New Event' : 'Edit Event'}
          </h3>
          <button 
            className="club-event-editor__close"
            onClick={handleCancelEdit}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="club-event-editor__field">
          <label className="club-event-editor__label">Event Title*</label>
          <input 
            type="text" 
            className="club-event-editor__input"
            value={editingEvent.event.title}
            onChange={(e) => setEditingEvent({
              ...editingEvent,
              event: {
                ...editingEvent.event,
                title: e.target.value
              }
            })}
            placeholder="Enter event title"
          />
        </div>
        
        <div className="club-event-editor__field">
          <label className="club-event-editor__label">Time*</label>
          <input 
            type="text" 
            className="club-event-editor__input"
            value={editingEvent.event.time}
            onChange={(e) => setEditingEvent({
              ...editingEvent,
              event: {
                ...editingEvent.event,
                time: e.target.value
              }
            })}
            placeholder="e.g. 2:00 PM "
          />
        </div>
        
        <div className="club-event-editor__field">
          <label className="club-event-editor__label">Location</label>
          <input 
            type="text" 
            className="club-event-editor__input"
            value={editingEvent.event.location}
            onChange={(e) => setEditingEvent({
              ...editingEvent,
              event: {
                ...editingEvent.event,
                location: e.target.value
              }
            })}
            placeholder="Enter location"
          />
        </div>
        
        <div className="club-event-editor__field">
          <label className="club-event-editor__label">Poster Image URL</label>
          <input 
            type="text" 
            className="club-event-editor__input"
            value={editingEvent.event.poster}
            onChange={(e) => setEditingEvent({
              ...editingEvent,
              event: {
                ...editingEvent.event,
                poster: e.target.value
              }
            })}
            placeholder="Enter image URL"
          />
        </div>
        
        <div className="club-event-editor__field">
          <label className="club-event-editor__label">Description</label>
          <textarea 
            className="club-event-editor__textarea"
            value={editingEvent.event.description}
            onChange={(e) => setEditingEvent({
              ...editingEvent,
              event: {
                ...editingEvent.event,
                description: e.target.value
              }
            })}
            placeholder="Enter event description"
            rows="4"
          />
        </div>
        
        <div className="club-event-editor__actions">
          {editingEvent.mode === 'edit' && (
            <button 
              className="club-event-editor__button club-event-editor__button--delete"
              onClick={handleDeleteEvent}
            >
              Delete
            </button>
          )}
          <button 
            className="club-event-editor__button club-event-editor__button--cancel"
            onClick={handleCancelEdit}
          >
            Cancel
          </button>
          <button 
            className="club-event-editor__button club-event-editor__button--save"
            onClick={handleSaveEvent}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="club-dashboard">
      <header className="club-header">
        <div className="club-header__left">
          <div className="club-logo">
            <img src="/logo.png" alt="Club Logo" className="club-logo__image" />
          </div>
        </div>
        <div className="club-header__right">
          <button className="club-logout" onClick={onLogout}>
            <FaSignOutAlt className="club-logout__icon" /> Logout
          </button>
        </div>
      </header>

      <div className="club-content">
        <div className="club-profile">
          <div className="club-profile__banner">
            <div className="club-profile__banner-overlay"></div>
          </div>

          <div className="club-profile__details">
            <div className="club-profile__picture">
              <FaUser className="club-profile__picture-icon" />
            </div>
            <div className="club-profile__info">
              <h2 className="club-profile__name">{userData?.name || "Club Member"}</h2>
              <p className="club-profile__role">{userData?.role || "Member"}</p>
              <p className="club-profile__contact">
                {userData?.email || "email@example.com"} | {userData?.phone || "000-000-0000"}
              </p>
              <div className="club-profile__college">
                <FaUniversity className="club-profile__college-icon" /> {userData?.college || "NA"}
              </div>
            </div>
          </div>
        </div>

        <div className="club-main">
          <div className="club-calendar">
            <div className="club-calendar__header">
              <h2 className="club-calendar__title">Club Events Calendar</h2>
              <div className="club-calendar__controls">
                <div className="club-calendar__view-toggle">
                  <button 
                    className={`club-calendar__view-button ${viewMode === 'month' ? 'club-calendar__view-button--active' : ''}`}
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </button>
                  <button 
                    className={`club-calendar__view-button ${viewMode === 'week' ? 'club-calendar__view-button--active' : ''}`}
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </button>
                </div>
                <div className="club-calendar__navigation">
                  <button 
                    className="club-calendar__nav-button"
                    onClick={() => navigateCalendar(-1)}
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <h3 className="club-calendar__current-date">
                    {viewMode === 'month' 
                      ? format(currentMonth, 'MMMM yyyy') 
                      : `${format(startOfWeek(currentMonth), 'MMM d')} - ${format(endOfWeek(currentMonth), 'MMM d, yyyy')}`
                    }
                  </h3>
                  <button 
                    className="club-calendar__nav-button"
                    onClick={() => navigateCalendar(1)}
                  >
                    <FaChevronRight size={16} />
                  </button>
                </div>
                <button 
                  className="club-calendar__today-button"
                  onClick={goToToday}
                >
                  Today
                </button>
              </div>
            </div>

            {viewMode === 'month' && (
              <div className="club-calendar__days-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={i} className="club-calendar__day-name">{day}</div>
                ))}
              </div>
            )}

            {viewMode === 'month' ? (
              <MonthView currentMonth={currentMonth} />
            ) : (
              <WeekView currentMonth={currentMonth} />
            )}
          </div>

          <div className="club-sidebar">
            {editingEvent ? <EventEditor /> : <DayEventsPopup />}
          </div>
        </div>
      </div>
    </div>
  );
};