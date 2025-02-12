import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
         
          <p className="footer-description">
            Track your progress, earn rewards, and stay motivated!
          </p>
          
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Activity Points. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
