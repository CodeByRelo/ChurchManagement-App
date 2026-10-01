function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="hero-eyebrow">JESUS IS ABLE MINISTRIES</p>

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
          </a>

          <a href="#about" className="button button-light">
            Discover More
          </a>
        </div>
      </div>

      <div className="hero-bottom">
        <span>BOTLOKWA · LIMPOPO</span>
        <span>SINCE 2007</span>
      </div>
    </section>
  );
}

export default Hero;
