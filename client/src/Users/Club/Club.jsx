import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaUser, FaUniversity, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { CalendarPlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './Club.css';
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

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
    poster: ''
  });
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  // Sample events data
  useEffect(() => {
    const sampleEvents = {
      [format(new Date(), 'yyyy-MM-dd')]: [
        {
          id: 1,
          title: "Club Orientation",
          time: "3:00 PM - 5:00 PM",
          description: "Welcome new members to our club and introduce them to our activities.",
          location: "Main Auditorium",
          poster: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57",
          createdBy: "Admin"
        }
      ],
      [format(addDays(new Date(), 3), 'yyyy-MM-dd')]: [
        {
          id: 2,
          title: "Workshop: Public Speaking",
          time: "10:00 AM - 12:00 PM",
          description: "Improve your public speaking skills with our expert trainers.",
          location: "Room 302",
          poster: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
          createdBy: "Admin"
        }
      ]
    };
    setEvents(sampleEvents);
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
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    setShowEventModal(false);
    setShowAddEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.time) {
      alert('Please fill in required fields');
      return;
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const updatedEvents = { ...events };
    
    if (!updatedEvents[dateKey]) {
      updatedEvents[dateKey] = [];
    }

    updatedEvents[dateKey].push({
      id: Date.now(),
      ...newEvent,
      createdBy: userData.name
    });

    setEvents(updatedEvents);
    setNewEvent({
      title: '',
      description: '',
      time: '',
      location: '',
      poster: ''
    });
    setShowAddEventModal(false);
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
    const hasEvents = dayEvents.length > 0;

    return (
      <div
        className={`club-calendar__day-cell ${isDisabled ? "club-calendar__day-cell--disabled" : ""} ${
          isCurrentDay ? "club-calendar__day-cell--today" : ""
        } ${hasEvents ? "club-calendar__day-cell--has-events" : ""}`}
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

          return (
            <div key={day} className={`club-calendar__week-day ${isCurrentDay ? 'club-calendar__week-day--today' : ''}`}>
              <div className="club-calendar__week-day-header">
                <span className="club-calendar__week-day-name">{format(day, "EEE")}</span>
                <span className="club-calendar__week-day-number">{format(day, "d")}</span>
              </div>
              <div className="club-calendar__week-day-events">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="club-calendar__week-event"
                    onClick={() => {
                      setSelectedDate(day);
                      setShowEventModal(true);
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

  const EventDetailsModal = ({ date, events, onClose, onAddEvent }) => {
    const dateEvents = events[format(date, 'yyyy-MM-dd')] || [];

    return (
      <div className="club-modal__overlay">
        <div className="club-modal">
          <button className="club-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
          <h3 className="club-modal__title">{format(date, 'EEEE, MMMM d, yyyy')}</h3>
          
          {dateEvents.length > 0 ? (
            <div className="club-modal__event-list">
              {dateEvents.map(event => (
                <div key={event.id} className="club-modal__event-item">
                  <div className="club-modal__event-time">{event.time}</div>
                  <div className="club-modal__event-title">{event.title}</div>
                  <div className="club-modal__event-location">{event.location}</div>
                  {event.poster && (
                    <div className="club-modal__event-poster">
                      <img src={event.poster} alt={event.title} className="club-modal__event-poster-image" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="club-modal__no-events">No events scheduled for this day</div>
          )}
          
          <div className="club-modal__actions">
            <button onClick={onAddEvent} className="club-modal__button club-modal__button--primary">
              <FaPlus className="club-modal__button-icon" /> Add Event
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AddEventModal = ({ date, onClose, onSave }) => {
    return (
      <div className="club-modal__overlay">
        <div className="club-modal">
          <button className="club-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
          <h3 className="club-modal__title">Add Event for {format(date, 'MMMM d, yyyy')}</h3>
          
          <div className="club-modal__field">
            <label className="club-modal__label">Event Title*</label>
            <input 
              type="text" 
              className="club-modal__input"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              placeholder="Enter event title"
            />
          </div>
          
          <div className="club-modal__field">
            <label className="club-modal__label">Time*</label>
            <input 
              type="text" 
              className="club-modal__input"
              value={newEvent.time}
              onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
              placeholder="e.g. 2:00 PM - 4:00 PM"
            />
          </div>
          
          <div className="club-modal__field">
            <label className="club-modal__label">Location</label>
            <input 
              type="text" 
              className="club-modal__input"
              value={newEvent.location}
              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              placeholder="Enter location"
            />
          </div>
          
          <div className="club-modal__field">
            <label className="club-modal__label">Poster Image URL</label>
            <input 
              type="text" 
              className="club-modal__input"
              value={newEvent.poster}
              onChange={(e) => setNewEvent({...newEvent, poster: e.target.value})}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="club-modal__field">
            <label className="club-modal__label">Description</label>
            <textarea 
              className="club-modal__textarea"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              placeholder="Enter event description"
              rows="4"
            />
          </div>
          
          <div className="club-modal__actions">
            <button 
              className="club-modal__button club-modal__button--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="club-modal__button club-modal__button--save"
              onClick={onSave}
            >
              Save Event
            </button>
          </div>
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
                  <ChevronLeft size={20} />
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
                  <ChevronRight size={20} />
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

          <div className="club-calendar__days-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="club-calendar__day-name">{day}</div>
            ))}
          </div>

          {viewMode === 'month' ? (
            <MonthView currentMonth={currentMonth} />
          ) : (
            <WeekView currentMonth={currentMonth} />
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedDate && (
        <EventDetailsModal 
          date={selectedDate}
          events={events}
          onClose={() => setShowEventModal(false)}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* Add Event Modal */}
      {showAddEventModal && selectedDate && (
        <AddEventModal
          date={selectedDate}
          onClose={() => setShowAddEventModal(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
};