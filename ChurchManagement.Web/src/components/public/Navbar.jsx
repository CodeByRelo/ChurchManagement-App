import { useState } from "react";

import {
  faArrowRight,
  faBars,
  faHandsPraying,
  faLock,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import logo from "../../assets/logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* BRAND */}
        <Link to="/" className="brand" onClick={closeMenu}>
          <img
            src={logo}
            alt="Jesus Is Able Ministries"
            className="brand-logo"
          />

          <span className="brand-text">
            Jesus Is Able
            <small>MINISTRIES</small>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#events">Events</a>
          <a href="#media">Media</a>
          <a href="#contact">Contact</a>
        </nav>

        {/* PRAYER CTA */}
        <a href="#prayer" className="nav-cta">
          <FontAwesomeIcon icon={faHandsPraying} />

          <span>Prayer Request</span>

          <FontAwesomeIcon icon={faArrowRight} className="nav-cta-arrow" />
        </a>

        {/* STAFF LOGIN */}
        <Link to="/admin/login" className="nav-login">
          <FontAwesomeIcon icon={faLock} />
          <span>Staff Login</span>
        </Link>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          className="nav-mobile-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}>
        <nav className="mobile-nav-links">
          <a href="#about" onClick={closeMenu}>
            About
          </a>

          <a href="#services" onClick={closeMenu}>
            Services
          </a>

          <a href="#events" onClick={closeMenu}>
            Events
          </a>

          <a href="#media" onClick={closeMenu}>
            Media
          </a>

          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>

          <a href="#prayer" className="mobile-prayer-link" onClick={closeMenu}>
            <FontAwesomeIcon icon={faHandsPraying} />
            <span>Prayer Request</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="mobile-prayer-arrow"
            />
          </a>

          <Link
            to="/admin/login"
            className="mobile-login-link"
            onClick={closeMenu}
          >
            <FontAwesomeIcon icon={faLock} />
            <span>Staff Login</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
