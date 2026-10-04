import {
  faArrowDown,
  faArrowRight,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import logo from "../../assets/logo.png";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" />

      {/* BRAND */}
      <div className="hero-brand">
        <img src={logo} alt="Jesus Is Able Ministries" />

        <span>
          JESUS IS ABLE
          <small>MINISTRIES</small>
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="hero-content">
        <div className="hero-kicker">
          <span />
          <p>WELCOME HOME</p>
        </div>

        <h1>
          A place to
          <span>belong.</span>
        </h1>

        <p className="hero-description">
          A community built on faith, hope and the love of Jesus Christ. Come
          worship with us, grow with us and discover what God has planned for
          your life.
        </p>

        <div className="hero-actions">
          <a href="#services" className="button button-dark">
            Join Us
            <FontAwesomeIcon icon={faArrowRight} />
          </a>

          <a href="#about" className="button button-light">
            Discover More
          </a>
        </div>
      </div>

      {/* LOCATION / DATE */}
      <div className="hero-bottom">
        <div className="hero-location">
          <FontAwesomeIcon icon={faLocationDot} />
          <span>BOTLOKWA · LIMPOPO</span>
        </div>

        <div className="hero-year">
          <span>SERVING OUR COMMUNITY</span>
          <strong>SINCE 2007</strong>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <a
        href="#about"
        className="hero-scroll"
        aria-label="Scroll to about section"
      >
        <span>SCROLL TO EXPLORE</span>

        <div>
          <FontAwesomeIcon icon={faArrowDown} />
        </div>
      </a>
    </section>
  );
}

export default Hero;
