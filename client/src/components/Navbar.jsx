import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="profile">
          <img src="/placeholder.svg?height=40&width=40" alt="Student" className="avatar" />
          <span className="name">Student Name</span>
        </div>
        <button className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
