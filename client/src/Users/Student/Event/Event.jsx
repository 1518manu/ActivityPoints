import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaThLarge, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaUserTie } from "react-icons/fa";
import './Event.css';
import {db} from '../../../firebaseFile/firebaseConfig';
import { collection, getDocs } from "firebase/firestore";
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

// Constants
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

export const StudentEvent = ({ token, userData: initialUserData, onLogout }) => {
  const navigate = useNavigate();
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODE.MONTH);
  const [events, setEvents] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [dayEvents, setDayEvents] = useState([]);

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Step 1: Fetch all clubs first
        const clubsSnapshot = await getDocs(collection(db, "Clubs"));
        const clubMap = {}; // club_id => club name
  
        clubsSnapshot.forEach((clubDoc) => {
          const clubData = clubDoc.data();
          if (clubData.club_id && clubData.name) {
            clubMap[clubData.club_id] = clubData.name;
          }
        });
  
        // Step 2: Fetch events
        const querySnapshot = await getDocs(collection(db, "Events"));
        const fetchedEvents = {};
  
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const eventDate = data.date?.toDate();
  
          if (!(eventDate instanceof Date)) continue;
  
          const formattedDate = format(eventDate, "yyyy-MM-dd");
          const clubId = data.club_id || "";
          const clubName = clubMap[clubId] || "Unknown Club";
  
          if (!fetchedEvents[formattedDate]) {
            fetchedEvents[formattedDate] = [];
          }
  
          fetchedEvents[formattedDate].push({
            id: docSnap.id,
            title: data.title,
            time: format(eventDate, "hh:mm a"),
            description: data.description || "",
            type: data.type || "Event",
            maxParticipants: data.maxParticipants || 50,
            registered: data.registered || 0,
            points: data.points || 0,
            clubId,
            clubName, // ✅ now resolved using the map
            isRegistered: false,
            date: eventDate,
            poster: data.poster || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678"
          });
        }
  
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events or clubs:", error);
      }
    };
  
    fetchEvents();
  }, []);
  

  // Calendar navigation
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
    showEventsForDay(today);
  };

  // Event handlers
  const showEventsForDay = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    setSelectedDate(day);
    setDayEvents(events[dateKey] || []);
    setShowDayEvents(true);
  };

  const hideDayEvents = () => {
    setShowDayEvents(false);
    setExpandedEvent(null);
  };

  const toggleEventExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const handleRegister = (eventId) => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const eventIndex = events[dateKey]?.findIndex(e => e.id === eventId);
    
    if (eventIndex !== undefined && eventIndex !== -1) {
      const updatedEvents = { ...events };
      updatedEvents[dateKey][eventIndex].isRegistered = true;
      updatedEvents[dateKey][eventIndex].registered += 1;
      setEvents(updatedEvents);
      
      // Update the displayed events
      setDayEvents(updatedEvents[dateKey]);
      alert(`Successfully registered for ${updatedEvents[dateKey][eventIndex].title}!`);
    }
  };

  const addToCalendar = (event) => {
    // Format for Google Calendar
    const startTime = format(event.date, "yyyyMMdd'T'HHmmss");
    const endTime = format(addDays(event.date, 1), "yyyyMMdd'T'HHmmss"); // Assuming 1 day event
    
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${
      encodeURIComponent(event.title)
    }&dates=${startTime}/${endTime}&details=${
      encodeURIComponent(event.description)
    }&location=${encodeURIComponent(event.location || "")}`;
    
    window.open(calendarUrl, "_blank");
  };

  // Navigation functions
  const onCertificate = () => navigate("/certificate");
  const onNotification = () => navigate("/Notification");
  const onDutyLeave = () => navigate("/duty-leave");
  const onDashboard = () => navigate("/StudentDashboard");

  // Calendar sub-components
  const EventDot = ({ type }) => (
    <div className={`event-dot ${type}`} />
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
        className={`day-cell ${isDisabled ? "disabled" : ""} ${
          isCurrentDay ? "today" : ""
        } ${isSelected ? "selected" : ""} ${
          hasEvents ? "has-events" : ""
        }`}
        onClick={() => !isDisabled && showEventsForDay(day)}
      >
        <span className="day-number">{format(day, "d")}</span>
        {hasEvents && (
          <div className="event-indicator">
            <div className="event-marker" />
          </div>
        )}
        {hasEvents && (
          <div className="event-dots">
            {dayEvents.slice(0, 3).map((event, i) => (
              <EventDot key={i} type={event.type} />
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
      <div className="days-grid">
        {weeks.map((week, weekIdx) => (
          <div className="week-row" key={weekIdx}>
            {week.map(day => (
              <DayCell
                key={day.toString()}
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
    const today = startOfDay(new Date());
  
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
    return (
      <div className="week-view">
        {days.map(day => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const dayEvents = events[formattedDate] || [];
          const isPastDate = isBefore(startOfDay(day), today);
          const isCurrentDay = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
  
          return (
            <div
              key={day.toString()}
              className={`week-day 
                ${isCurrentDay ? 'today' : ''} 
                ${isPastDate ? 'past-date' : ''}
                ${isSelected ? 'selected' : ''}`}
              onClick={() => showEventsForDay(day)}
            >
              <div className="week-day-header">
                <span className="week-day-name">{format(day, "EEE")}</span>
                <span className="week-day-number">{format(day, "d")}</span>
                {dayEvents.length > 0 && (
                  <div className="event-marker" />
                )}
              </div>
              <div className="week-day-events">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`week-event ${event.type}`}
                  >
                    <span className="event-time">{event.time}</span>
                    <span className="event-title">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="more-events">+{dayEvents.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const EventDetails = ({ event }) => {
    const isFull = event.registered >= event.maxParticipants;
    
    return (
      <div className={`event-details ${expandedEvent === event.id ? 'expanded' : ''}`}>
        {event.poster && (
          <div className="event-poster">
            <img src={event.poster} alt={event.title} />
          </div>
        )}
        <div className="event-header" onClick={() => toggleEventExpand(event.id)}>
          <span className="event-time">{event.time}</span>
          <span className="event-title">{event.title}</span>
          <span className="event-type">{event.type}</span>
          <span className="event-toggle">
            {expandedEvent === event.id ? '▲' : '▼'}
          </span>
        </div>
        
        {expandedEvent === event.id && (
          <div className="event-content">
            <p className="event-club"><strong>Organised by: {event.clubName}</strong></p>
            <p className="event-description">{event.description}</p>
            <p className="event-points">{event.points}Points</p>
            <div className="event-meta">
              <div className="event-registration">
                <span>Spots: {event.maxParticipants - event.registered} remaining</span>
                <progress 
                  value={event.registered} 
                  max={event.maxParticipants}
                />
              </div>
              <div className="event-actions">
                {event.isRegistered ? (
                  <div className="registration-success">
                    You are registered for this event!
                    <button 
                      className="calendar-btn"
                      onClick={() => addToCalendar(event)}
                    >
                      Add to Calendar
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className={`register-btn ${isFull ? 'disabled' : ''}`}
                      onClick={() => handleRegister(event.id)}
                      disabled={isFull}
                    >
                      {isFull ? 'Event Full' : 'Register Now'}
                    </button>
                    <button 
                      className="calendar-btn"
                      onClick={() => addToCalendar(event)}
                    >
                      Add to Calendar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if(!token) navigate("/");

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src="https://ik.imagekit.io/yx0worcwu/logo.jpg?updatedAt=1745328786060" alt="Logo" className="logo" />
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
              <MonthView currentMonth={currentMonth} />
            ) : (
              <WeekView currentMonth={currentMonth} />
            )}
          </div>

          {/* Day Events Panel */}
          <div className={`day-events-panel ${showDayEvents ? 'visible' : ''}`}>
            <div className="day-events-header">
              <h3>{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "No date selected"}</h3>
              <button className="close-btn" onClick={hideDayEvents}>×</button>
            </div>
            
            <div className="day-events-list">
              {dayEvents.length > 0 ? (
                dayEvents.map(event => (
                  <EventDetails key={event.id} event={event} />
                ))
              ) : (
                <div className="no-events">No events scheduled for this day</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};