import { useEffect, useState } from "react";
import {
  faArrowUp,
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { api } from "../../services/api";
import logo from "../../assets/logo.png";

function Footer() {
  const [church, setChurch] = useState(null);

  useEffect(() => {
    loadChurchInfo();
  }, []);

  async function loadChurchInfo() {
    try {
      const data = await api.getChurchInfo();
      setChurch(data);
    } catch (error) {
      console.error("Failed to load church information:", error);
    }
  }

  return (
    <footer className="footer">
      <div className="footer-main">
        {/* BRAND */}
        <div className="footer-brand-block">
          <a href="/" className="footer-brand">
            <img src={logo} alt={church?.name || "Jesus Is Able Ministries"} />

            <div>
              <strong>{church?.name || "JESUS IS ABLE"}</strong>

              <span>MINISTRIES</span>
            </div>
          </a>

          <p>{church?.mission || "A community of faith, hope and love."}</p>
        </div>

        {/* NAVIGATION */}
        <div className="footer-column">
          <span className="footer-heading">EXPLORE</span>

          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#events">Events</a>
          <a href="#media">Media</a>
          <a href="#prayer">Prayer</a>
        </div>

        {/* CONNECT */}
        <div className="footer-column">
          <span className="footer-heading">CONNECT</span>

          <a href="#contact">Visit Us</a>
          <a href="#contact">Contact</a>
          <a href="#prayer">Prayer Request</a>
        </div>

        {/* CONTACT */}
        <div className="footer-column footer-contact">
          <span className="footer-heading">FIND US</span>

          {church?.address && (
            <div>
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{church.address}</span>
            </div>
          )}

          {church?.contactNumber && (
            <a href={`tel:${church.contactNumber}`}>
              <FontAwesomeIcon icon={faPhone} />
              <span>{church.contactNumber}</span>
            </a>
          )}

          {church?.email && (
            <a href={`mailto:${church.email}`}>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>{church.email}</span>
            </a>
          )}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <div>
          <span>
            © {new Date().getFullYear()}{" "}
            {church?.name || "Jesus Is Able Ministries"}
          </span>

          <span>{church?.address || "Botlokwa · Limpopo"}</span>
        </div>

        <a href="#" className="footer-back-top" aria-label="Back to top">
          <span>BACK TO TOP</span>

          <div>
            <FontAwesomeIcon icon={faArrowUp} />
          </div>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
