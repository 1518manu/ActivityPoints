import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaThLarge, FaCog, FaCalendarAlt, FaBell, FaSignOutAlt, FaEdit, FaTimes, FaInfoCircle } from "react-icons/fa";
import { fetchUserData, fetchUserRole } from "../../Login/dataApi/userDataApi";
import './Events.css';

// Sample event and notice data
const sampleEvents = {
  '2025-03-20': {
    type: 'event',
    title: "Career Fair",
    organizer: "Placement Cell",
    venue: "Sports Complex",
    time: "9:00 AM - 5:00 PM",
    link: "https://example.com/register/career-fair"
  },
  '2025-03-29': {
    type: 'notice',
    title: "MOOC Registration Deadline",
    description: "Last day to register for semester MOOC courses",
    link: "https://example.com/mooc-registration"
  },
  '2025-04-15': {
    type: 'exam',
    title: "Midterm Examinations Begin",
    description: "All departments - check your schedule",
    link: "https://example.com/exam-schedule"
  },
  '2025-11-15': {
    type: 'event',
    title: "Tech Symposium",
    organizer: "Computer Science Dept",
    venue: "Main Auditorium",
    time: "10:00 AM - 4:00 PM",
    link: "https://example.com/register/tech-symposium"
  }
};

const Events = ({ token, userData: initialUserData, onLogout }) => {
  const [userData, setUserData] = useState(initialUserData);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const role = await fetchUserRole(initialUserData?.email);
        if (role) {
          const updatedUserData = await fetchUserData(initialUserData?.email, role);
          setUserData(updatedUserData || initialUserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [token, initialUserData?.email, navigate]);

  const months = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const changeMonth = (increment) => {
    setCurrentMonth((prevMonth) => {
      const newMonth = increment ? prevMonth + 1 : prevMonth - 1;
      if (newMonth < 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      } else if (newMonth > 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return newMonth;
    });
  };

  if (!userData) {
    return <div className="loading-container">Loading user data...</div>;
  }

  return (
    <div className="container">
      <Header onLogout={onLogout} />
      <div className="main-content">
        <Sidebar onLogout={onLogout} />
        <div className="profile-content">
          <ProfileBanner />
          <Calendar
            currentMonth={currentMonth}
            currentYear={currentYear}
            months={months}
            changeMonth={changeMonth}
            setSelectedDate={setSelectedDate}
          />
          {selectedDate && (
            <DatePopup 
              date={selectedDate} 
              onClose={() => setSelectedDate(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Header = ({ onLogout }) => (
  <header className="header">
    <div className="header-left">
      <img src="/api/placeholder/100/40" alt="Logo" className="logo" />
      <div className="search-bar">
        <input type="text" placeholder="Search" />
        <FaSearch className="search-icon" />
      </div>
    </div>
    <button className="business-btn" onClick={onLogout}>Logout</button>
  </header>
);

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  return (
    <div className="sidebar-menu">
      <button onClick={() => navigate("/certificate")}>
        <FaThLarge className="menu-icon" /> Certificates
      </button>
      <button><FaCog className="menu-icon" /> Settings</button>
      <button><FaCalendarAlt className="menu-icon" /> Events <span className="badge">new</span></button>
      <button><FaBell className="menu-icon" /> Notifications <span className="badge">new</span></button>
      <button onClick={onLogout} className="logout-btn">
        <FaSignOutAlt className="menu-icon" /> Logout
      </button>
    </div>
  );
};

const ProfileBanner = () => (
  <div className="profile-banner">
    <div className="banner-background"></div>
    <button className="edit-button">
      <FaEdit className="edit-icon" />
    </button>
  </div>
);

const Calendar = ({ currentMonth, currentYear, months, changeMonth, setSelectedDate }) => {
  const today = new Date();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = [...Array(daysInMonth).keys()].map(i => i + 1);
  const blanks = [...Array(firstDay).keys()];

  const isPastDate = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const hasEventOrNotice = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sampleEvents[dateStr];
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-heading">EVENT CALENDAR</h2>
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => changeMonth(false)}>&lt;</button>
          <h3>{months[currentMonth]} {currentYear}</h3>
          <button onClick={() => changeMonth(true)}>&gt;</button>
        </div>
        <table className="calendar-table">
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...blanks, ...daysArray].reduce((rows, day, index) => {
              if (index % 7 === 0) rows.push([]);
              rows[rows.length - 1].push(day);
              return rows;
            }, []).map((row, i) => (
              <tr key={`row-${i}`}>
                {row.map((day, j) => {
                  const isDay = typeof day === 'number';
                  const dateStr = isDay ? 
                    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const hasContent = isDay && hasEventOrNotice(day);
                  const isPast = isDay && isPastDate(day);
                  
                  return (
                    <td 
                      key={j} 
                      className={`calendar-day ${isPast ? 'past' : ''} ${hasContent ? 'has-content' : ''}`}
                      onClick={() => isDay && setSelectedDate(dateStr)}
                    >
                      {isDay ? day : ''}
                      {hasContent && <div className="content-indicator"></div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DatePopup = ({ date, onClose }) => {
  const content = sampleEvents[date];
  const isPast = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="date-modal">
      <div className="date-modal-content">
        <button className="close-modal" onClick={onClose}><FaTimes /></button>
        <h3>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        
        {content ? (
          <>
            {content.type === 'event' && (
              <div className="event-details">
                <h4>{content.title}</h4>
                <p><strong>Organizer:</strong> {content.organizer}</p>
                <p><strong>Venue:</strong> {content.venue}</p>
                <p><strong>Time:</strong> {content.time}</p>
                {isPast ? (
                  <div className="past-event-notice">
                    <p>This event has already passed.</p>
                  </div>
                ) : content.link && (
                  <a href={content.link} target="_blank" rel="noopener noreferrer" className="content-link">
                    Event Registration
                  </a>
                )}
              </div>
            )}
            
            {(content.type === 'notice' || content.type === 'exam') && (
              <div className="notice-details">
                <div className="notice-header">
                  <FaInfoCircle className="notice-icon" />
                  <h4>{content.title}</h4>
                </div>
                <p>{content.description}</p>
                {isPast ? (
                  <div className="past-event-notice">
                    <p>This {content.type} has expired.</p>
                  </div>
                ) : content.link && (
                  <a href={content.link} target="_blank" rel="noopener noreferrer" className="content-link">
                    {content.type === 'exam' ? 'View Schedule' : 'Register Now'}
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="no-content">
            <p>{isPast ? 'No events were scheduled on this date.' : 'No events scheduled for this date.'}</p>
            {!isPast && (
              <div className="upcoming-notice">
                <p>Check back later for updates or view the academic calendar.</p>
                <a href="https://example.com/academic-calendar" target="_blank" rel="noopener noreferrer" className="content-link">
                  Academic Calendar
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;