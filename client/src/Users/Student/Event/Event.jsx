import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaThLarge, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaUserTie } from "react-icons/fa";
import './Event.css';
import { X, ExternalLink, CalendarPlus } from 'lucide-react';
import {
  addDays,
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
  isBefore,
  startOfDay
} from "date-fns";

// Calendar view constants
const VIEW_MODE = {
  MONTH: 'month',
  WEEK: 'week'
};

const EVENT_TYPES = {
  WORKSHOP: 'workshop',
  COMPETITION: 'competition',
  CAREER: 'career',
  NETWORKING: 'networking'
};

// Dummy event data with posters
const DUMMY_EVENTS = {
  "2025-04-15": [
    {
      id: 1,
      title: "Tech Workshop: Modern Web Development",
      time: "10:00 AM - 12:00 PM",
      description: "Join us for an interactive workshop on the latest technologies in web development including React, Next.js, and Tailwind CSS. This session will be led by industry experts and includes hands-on coding exercises.",
      maxParticipants: 30,
      registered: 15,
      type: EVENT_TYPES.WORKSHOP,
      poster: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      registrationLink: "https://example.com/register/tech-workshop",
      location: "Tech Building Room 101",
      speaker: "Dr. Sarah Johnson, Senior Developer at TechCorp",
      isRegistered: false,
      requirements: "Bring your laptop with Node.js installed"
    }
  ],
  "2025-04-20": [
    {
      id: 2,
      title: "Annual Career Fair",
      time: "9:00 AM - 4:00 PM",
      description: "Meet with top employers from the tech industry including Google, Amazon, and Microsoft. This is your opportunity to network, learn about internship programs, and potentially land your dream job.",
      maxParticipants: 100,
      registered: 78,
      type: EVENT_TYPES.CAREER,
      poster: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      registrationLink: "https://example.com/register/career-fair",
      location: "University Conference Center",
      speaker: "Various Company Representatives",
      isRegistered: false,
      requirements: "Bring multiple copies of your resume"
    }
  ],
  "2025-04-22": [
    {
      id: 3,
      title: "Coding Competition",
      time: "2:00 PM - 5:00 PM",
      description: "Test your coding skills against other students in our annual coding challenge. Problems will range from beginner to advanced levels across multiple programming languages.",
      maxParticipants: 50,
      registered: 42,
      type: EVENT_TYPES.COMPETITION,
      poster: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      registrationLink: "https://example.com/register/coding-competition",
      location: "Computer Lab 3",
      speaker: "Prof. Michael Chen",
      isRegistered: false,
      requirements: "Basic knowledge of any programming language"
    }
  ]
};

export const StudentEvent = ({ token, userData: initialUserData, onLogout }) => {
  const navigate = useNavigate();
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [viewMode, setViewMode] = useState(VIEW_MODE.MONTH);
  const [events] = useState(DUMMY_EVENTS);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    eventId: null
  });

  // Calendar handlers
  const navigateCalendar = (direction) => {
    if (viewMode === VIEW_MODE.MONTH) {
      setCurrentMonth(addMonths(currentMonth, direction));
    } else {
      setCurrentMonth(addDays(currentMonth, direction * 7));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    const dateKey = format(day, "yyyy-MM-dd");
    setSelectedEvents(events[dateKey] || []);
    setShowEventModal(true);
  };

  const handleEventClick = (day, event) => {
    setSelectedDate(day);
    setSelectedEvents([event]);
    setShowEventModal(true);
  };

  const addToCalendar = (event) => {
    try {
      // Parse the time string (e.g., "10:00 AM - 12:00 PM")
      const [startTimeStr, endTimeStr] = event.time.split(' - ');
      
      // Convert to 24-hour format for easier parsing
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return { hours, minutes };
      };
      
      const startTime = parseTime(startTimeStr);
      const endTime = parseTime(endTimeStr);
      
      // Format date for Google Calendar (YYYYMMDDTHHMMSS)
      const dateStr = format(selectedDate, "yyyyMMdd");
      const startDateTime = `${dateStr}T${startTime.hours.toString().padStart(2, '0')}${startTime.minutes.toString().padStart(2, '0')}00`;
      const endDateTime = `${dateStr}T${endTime.hours.toString().padStart(2, '0')}${endTime.minutes.toString().padStart(2, '0')}00`;
      
      const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${
        encodeURIComponent(event.title)
      }&dates=${startDateTime}/${endDateTime}&details=${
        encodeURIComponent(`${event.description}\n\nLocation: ${event.location}\nSpeaker: ${event.speaker}`)
      }&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
      
      window.open(googleCalendarUrl, "_blank");
    } catch (error) {
      console.error("Error creating calendar event:", error);
      alert("Failed to create calendar event. Please try again.");
    }
  };

  const handleRegister = (eventId) => {
    setRegistrationData({
      ...registrationData,
      eventId
    });
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    
    if (!registrationData.name || !registrationData.email) {
      alert("Please fill all fields");
      return;
    }
    
    // Update the event registration status
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const eventIndex = events[dateKey]?.findIndex(e => e.id === registrationData.eventId);
    
    if (eventIndex !== undefined && eventIndex !== -1) {
      const updatedEvents = { ...events };
      updatedEvents[dateKey][eventIndex].isRegistered = true;
      updatedEvents[dateKey][eventIndex].registered += 1;
      
      // Update selected events
      setSelectedEvents(updatedEvents[dateKey]);
      
      alert(`Successfully registered for ${updatedEvents[dateKey][eventIndex].title}!`);
      
      // Open registration link in new tab if available
      if (updatedEvents[dateKey][eventIndex].registrationLink) {
        window.open(updatedEvents[dateKey][eventIndex].registrationLink, "_blank");
      }
    }
    
    setRegistrationData({
      name: "",
      email: "",
      eventId: null
    });
    setShowEventModal(false);
  };

  const onCertificate = () => navigate("/certificate");
  const onNotification = () => navigate("/Notification");
  const onDutyLeave = () => navigate("/duty-leave");
  const onDashboard = () => navigate("/StudentDashboard");

  // Sub-components
  const EventDot = ({ event }) => (
    <div className={`event-dot ${event.type}`} title={event.title} />
  );

  const DayCell = ({ day, monthStart, events, onDateClick }) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    const dayEvents = events[formattedDate] || [];
    const isDisabled = !isSameMonth(day, monthStart);
    const isCurrentDay = isToday(day);
    const hasEvents = dayEvents.length > 0;

    return (
      <div
        className={`day-cell ${isDisabled ? "disabled" : ""} ${
          isCurrentDay ? "today" : ""
        } ${hasEvents ? "has-events" : ""}`}
        onClick={() => !isDisabled && onDateClick(day)}
      >
        <span className="day-number">{format(day, "d")}</span>
        {hasEvents && (
          <div className="event-preview">
            {dayEvents.slice(0, 2).map(event => (
              <EventDot key={event.id} event={event} />
            ))}
            {dayEvents.length > 2 && (
              <div className="more-events">+{dayEvents.length - 2}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const MonthView = ({ currentMonth, events, onDateClick }) => {
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
      <div className="days-grid">
        {weeks.map((week, weekIdx) => (
          <div className="week-row" key={weekIdx}>
            {week.map(day => (
              <DayCell
                key={day}
                day={day}
                monthStart={monthStart}
                events={events}
                onDateClick={onDateClick}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const WeekView = ({ currentMonth, events, onEventClick }) => {
    const weekStart = startOfWeek(currentMonth);
    const weekEnd = endOfWeek(currentMonth);
    const today = startOfDay(new Date());
  
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
    return (
      <div className="week-view">
        {days.map(day => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const dayEvents = events[formattedDate] || [];
          const isPastDate = isBefore(startOfDay(day), today);
          const isCurrentDay = isToday(day);
  
          return (
            <div
              key={day}
              className={`week-day 
                ${isCurrentDay ? 'today' : ''} 
                ${isPastDate ? 'past-date' : ''}`}
            >
              <div className="week-day-header">
                <span className="week-day-name">{format(day, "EEE")}</span>
                <span className="week-day-number">{format(day, "d")}</span>
              </div>
  
              <div className="week-day-events">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`week-event ${event.type}`}
                    onClick={() => onEventClick(day, event)}
                  >
                    <span className="event-time">{event.time.split(' - ')[0]}</span>
                    <span className="event-title">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const EventDetailsModal = ({ 
    selectedDate, 
    selectedEvents, 
    onClose, 
    onAddToCalendar,
    onRegister,
    registrationData,
    onRegistrationSubmit,
    onRegistrationChange
  }) => {
    const [activeEventIndex, setActiveEventIndex] = useState(0);
    const event = selectedEvents[activeEventIndex];
  
    if (!event) {
      return (
        <div className="modal-overlay">
          <div className="event-details-modal no-events">
            <button className="close-modal" onClick={onClose}>
              <X size={24} />
            </button>
            <div className="no-events-message">
              <h2>No events scheduled for {format(selectedDate, "MMMM d, yyyy")}</h2>
              <p>Check back later for upcoming events on this date.</p>
            </div>
          </div>
        </div>
      );
    }

    const handlePrevEvent = () => {
      setActiveEventIndex(prev => (prev > 0 ? prev - 1 : selectedEvents.length - 1));
    };

    const handleNextEvent = () => {
      setActiveEventIndex(prev => (prev < selectedEvents.length - 1 ? prev + 1 : 0));
    };

      
    if (!token) {
      navigate("/");
      return null;
    }

    return (
      <div className="modal-overlay">
        <div className="event-details-modal">
          <button className="close-modal" onClick={onClose}>
            <X size={24} />
          </button>

          {selectedEvents.length > 1 && (
            <div className="event-navigation">
              <button className="nav-arrow" onClick={handlePrevEvent}>
                &lt;
              </button>
              <span>{activeEventIndex + 1} of {selectedEvents.length}</span>
              <button className="nav-arrow" onClick={handleNextEvent}>
                &gt;
              </button>
            </div>
          )}

          <div className="event-details-container">
            <div className="event-poster">
              <img src={event.poster} alt={`${event.title} poster`} />
            </div>

            <div className="event-content">
              <div className="event-header">
                <h2>{event.title}</h2>
                <span className={`event-type ${event.type}`}>{event.type}</span>
              </div>

              <div className="event-meta">
                <div className="meta-item">
                  <span className="meta-label">Date:</span>
                  <span>{format(selectedDate, "MMMM d, yyyy")}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Time:</span>
                  <span>{event.time}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Location:</span>
                  <span>{event.location}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Speaker:</span>
                  <span>{event.speaker}</span>
                </div>
                {event.requirements && (
                  <div className="meta-item">
                    <span className="meta-label">Requirements:</span>
                    <span>{event.requirements}</span>
                  </div>
                )}
              </div>

              <div className="event-description">
                <h3>Event Details</h3>
                <p>{event.description}</p>
              </div>

              <div className="event-registration">
                <div className="registration-status">
                  <span className="spots-available">
                    {event.maxParticipants - event.registered} spots remaining
                  </span>
                  <progress 
                    value={event.registered} 
                    max={event.maxParticipants}
                  />
                </div>

                {event.isRegistered ? (
                  <div className="registration-success">
                    <p>You are registered for this event!</p>
                    <button
                      className="action-btn calendar-btn"
                      onClick={() => onAddToCalendar(event)}
                    >
                      <CalendarPlus size={18} />
                      Add Reminder to Calendar
                    </button>
                    {event.registrationLink && (
                      <a 
                        href={event.registrationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="registration-link"
                      >
                        View Registration Details <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ) : registrationData.eventId === event.id ? (
                  <form onSubmit={onRegistrationSubmit} className="registration-form">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={registrationData.name}
                        onChange={(e) => onRegistrationChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={registrationData.email}
                        onChange={(e) => onRegistrationChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => onRegistrationChange('eventId', null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="register-btn">
                        Complete Registration
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="event-actions">
                    <button
                      className="action-btn calendar-btn"
                      onClick={() => onAddToCalendar(event)}
                    >
                      <CalendarPlus size={18} />
                      Add to Calendar
                    </button>
                    <button
                      className="action-btn register-btn"
                      onClick={() => onRegister(event.id)}
                      disabled={event.registered >= event.maxParticipants}
                    >
                      {event.registered >= event.maxParticipants ? 
                        "Event Full" : "Register Now"}
                    </button>
                    {event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn external-link"
                      >
                        More Info <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/logo.png" alt="Logo" className="logo" />
          </div>
        </div>
        <div className="header-right">
          <button className="business-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-menu">
          <button onClick={onCertificate}>
            <FaThLarge className="menu-icon" /> Certificates
          </button>
          <button>
            <FaCog className="menu-icon" /> Settings
          </button>
          <button onClick={onDashboard}>
            <FaUserTie className="menu-icon" /> Dashboard
          </button>
          <button onClick={onDutyLeave}>
            <FaCalendarAlt className="menu-icon" /> Duty leave
          </button>
          <button onClick={onNotification}>
            <FaBell className="menu-icon" /> Notifications
          </button>
          <button onClick={onLogout} style={{ color: "#df0000" }}>
            <FaSignOutAlt style={{ color: "#df0000" }} className="menu-icon" /> Logout
          </button>
        </div>

        <main className="content">
          <div className="calendar-container">
            <div className="calendar-header">
              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === VIEW_MODE.MONTH ? 'active' : ''}`}
                  onClick={() => setViewMode(VIEW_MODE.MONTH)}
                >
                  Month
                </button>
                <button
                  className={`view-btn ${viewMode === VIEW_MODE.WEEK ? 'active' : ''}`}
                  onClick={() => setViewMode(VIEW_MODE.WEEK)}
                >
                  Week
                </button>
              </div>
              <div className="month-navigation">
                <button onClick={() => navigateCalendar(-1)}>
                  &lt;
                </button>
                <h2>
                  {viewMode === VIEW_MODE.MONTH
                    ? format(currentMonth, "MMMM yyyy")
                    : `${format(startOfWeek(currentMonth), "MMM d")} - ${format(endOfWeek(currentMonth), "MMM d, yyyy")}`
                  }
                </h2>
                <button onClick={() => navigateCalendar(1)}>
                  &gt;
                </button>
              </div>
              <button className="today-btn" onClick={goToToday}>
                Today
              </button>
            </div>

            <div className="days-row">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div className="day-name" key={i}>{day}</div>
              ))}
            </div>

            {viewMode === VIEW_MODE.MONTH ? (
              <MonthView
                currentMonth={currentMonth}
                events={events}
                onDateClick={handleDateClick}
              />
            ) : (
              <WeekView
                currentMonth={currentMonth}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
          </div>

          {showEventModal && (
            <EventDetailsModal
              selectedDate={selectedDate}
              selectedEvents={selectedEvents}
              onClose={() => setShowEventModal(false)}
              onAddToCalendar={addToCalendar}
              onRegister={handleRegister}
              registrationData={registrationData}
              onRegistrationSubmit={handleRegistrationSubmit}
              onRegistrationChange={(field, value) => setRegistrationData(prev => ({
                ...prev,
                [field]: value
              }))}
            />
          )}
        </main>
      </div>
    </div>
  );
};