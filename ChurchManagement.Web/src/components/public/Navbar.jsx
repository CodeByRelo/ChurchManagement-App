import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">JIA</span>

          <span className="brand-text">
            Jesus Is Able
            <small>MINISTRIES</small>
          </span>
        </Link>

        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#events">Events</a>
          <a href="#media">Media</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="#prayer" className="nav-cta">
          Prayer Request
        </a>
      </div>
    </header>
  );
}

export default Navbar;
