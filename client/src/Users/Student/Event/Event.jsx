import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaThLarge, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaUserTie } from "react-icons/fa";
import './Event.css';
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

// Dummy event data
const DUMMY_EVENTS = {
  "2025-04-15": [
    {
      id: 1,
      title: "Tech Workshop: Modern Web Development",
      time: "10:00 AM - 12:00 PM",
      description: "Interactive workshop on the latest web technologies.",
      type: EVENT_TYPES.WORKSHOP,
      maxParticipants: 30,
      registered: 15,
      isRegistered: false
    }
  ],
  "2025-04-20": [
    {
      id: 2,
      title: "Annual Career Fair",
      time: "9:00 AM - 4:00 PM",
      description: "Meet with top employers from the tech industry.",
      type: EVENT_TYPES.CAREER,
      maxParticipants: 100,
      registered: 78,
      isRegistered: false
    }
  ],
  "2025-04-22": [
    {
      id: 3,
      title: "Coding Competition",
      time: "2:00 PM - 5:00 PM",
      description: "Test your coding skills against other students.",
      type: EVENT_TYPES.COMPETITION,
      maxParticipants: 50,
      registered: 42,
      isRegistered: false
    }
  ]
};

export const StudentEvent = ({ token, userData: initialUserData, onLogout }) => {
  const navigate = useNavigate();
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState(VIEW_MODE.MONTH);
  const [events] = useState(DUMMY_EVENTS);
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Navigation handlers
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
  };

  const toggleEventExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const handleRegister = (dateKey, eventId) => {
    const eventIndex = events[dateKey]?.findIndex(e => e.id === eventId);
    if (eventIndex !== undefined && eventIndex !== -1) {
      const updatedEvents = { ...events };
      updatedEvents[dateKey][eventIndex].isRegistered = true;
      updatedEvents[dateKey][eventIndex].registered += 1;
      alert(`Successfully registered for ${updatedEvents[dateKey][eventIndex].title}!`);
    }
  };

  // Navigation functions
  const onCertificate = () => navigate("/certificate");
  const onNotification = () => navigate("/Notification");
  const onDutyLeave = () => navigate("/duty-leave");
  const onDashboard = () => navigate("/StudentDashboard");

  // Calendar sub-components
  const EventItem = ({ event, dateKey, isExpanded }) => {
    const isFull = event.registered >= event.maxParticipants;
    
    return (
      <div className={`event-item ${event.type} ${isExpanded ? 'expanded' : ''}`}>
        <div className="event-header" onClick={() => toggleEventExpand(event.id)}>
          <span className="event-time">{event.time.split(' - ')[0]}</span>
          <span className="event-title">{event.title}</span>
          {isExpanded ? (
            <span className="event-toggle">▲</span>
          ) : (
            <span className="event-toggle">▼</span>
          )}
        </div>
        
        {isExpanded && (
          <div className="event-details">
            <p className="event-description">{event.description}</p>
            <div className="event-meta">
              <span>Spots: {event.maxParticipants - event.registered} remaining</span>
              <progress 
                value={event.registered} 
                max={event.maxParticipants}
              />
            </div>
            {event.isRegistered ? (
              <div className="registration-success">
                You are registered for this event!
              </div>
            ) : (
              <button
                className={`register-btn ${isFull ? 'disabled' : ''}`}
                onClick={() => handleRegister(dateKey, event.id)}
                disabled={isFull}
              >
                {isFull ? 'Event Full' : 'Register Now'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const DayCell = ({ day, monthStart, events }) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    const dayEvents = events[formattedDate] || [];
    const isDisabled = !isSameMonth(day, monthStart);
    const isCurrentDay = isToday(day);

    return (
      <div className={`day-cell ${isDisabled ? "disabled" : ""} ${isCurrentDay ? "today" : ""}`}>
        <div className="day-header">
          <span className="day-number">{format(day, "d")}</span>
        </div>
        <div className="day-events">
          {dayEvents.map(event => (
            <EventItem
              key={event.id}
              event={event}
              dateKey={formattedDate}
              isExpanded={expandedEvent === event.id}
            />
          ))}
        </div>
      </div>
    );
  };

  const MonthView = ({ currentMonth, events }) => {
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
                events={events}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const WeekView = ({ currentMonth, events }) => {
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
              key={day.toString()}
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
                  <EventItem
                    key={event.id}
                    event={event}
                    dateKey={formattedDate}
                    isExpanded={expandedEvent === event.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
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
              />
            ) : (
              <WeekView
                currentMonth={currentMonth}
                events={events}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};