import { useEffect, useState } from "react";
import {
  faArrowRight,
  faCalendarDays,
  faClock,
  faEnvelope,
  faLocationDot,
  faPhone,
  faPlay,
  faQuoteLeft,
  faHandsPraying,
  faChurch,
  faBullhorn,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Hero from "../../components/public/Hero";
import SectionHeading from "../../components/public/SectionHeading";
import { api } from "../../services/api";

function Home() {
  const [church, setChurch] = useState(null);
  const [services, setServices] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [media, setMedia] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  async function loadHomeData() {
    try {
      const eventsData = await api.getEvents();
      setEvents(eventsData || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    }

    try {
      const churchData = await api.getChurchInfo();
      setChurch(churchData);
    } catch (error) {
      console.error("Failed to load church information:", error);
    }

    try {
      const servicesData = await api.getServices();
      setServices(servicesData || []);
    } catch (error) {
      console.error("Failed to load services:", error);
    }

    try {
      const announcementsData = await api.getAnnouncements();
      setAnnouncements(announcementsData || []);
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }

    try {
      const mediaData = await api.getMedia();
      setMedia(mediaData || []);
    } catch (error) {
      console.error("Failed to load media:", error);
    }
  }

  const upcomingEvents = events
    .filter((event) => {
      if (event.status !== "Active") {
        return false;
      }

      return new Date(event.eventDate) >= new Date();
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    )
    .slice(0, 4);

  const featuredMedia = media[0];

  return (
    <div className="home-page">
      {/* =====================================================
          HERO
      ===================================================== */}

      <Hero />

      {/* =====================================================
          WELCOME / ABOUT
      ===================================================== */}

      <section id="about" className="about-section">
        <div className="container about-grid">
          <div className="about-visual">
            <div className="about-year-display">
              <span>EST.</span>

              <strong>2007</strong>

              <div className="about-year-line" />

              <p>
                YEARS OF
                <br />
                FAITH & COMMUNITY
              </p>
            </div>

            <div className="about-visual-note">
              <FontAwesomeIcon icon={faChurch} />

              <span>
                JESUS IS ABLE
                <small>MINISTRIES</small>
              </span>
            </div>
          </div>

          <div className="about-content">
            <SectionHeading
              eyebrow="WHO WE ARE"
              title={church?.name || "Faith that feels like family."}
              description={
                church?.history ||
                "A community built on faith, hope and the love of Jesus Christ."
              }
            />

            <p className="about-lead">
              {church?.mission ||
                "We are committed to growing together in faith, serving our community and sharing the love of Jesus Christ."}
            </p>

            {church?.vision && (
              <div className="vision-block">
                <span>OUR VISION</span>
                <p>{church.vision}</p>
              </div>
            )}

            <a href="#contact" className="text-link">
              <span>Come and meet us</span>

              <FontAwesomeIcon icon={faArrowRight} />
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section id="services" className="services-section">
        <div className="container">
          <div className="section-topline">
            <div>
              <SectionHeading
                eyebrow="JOIN US"
                title="There is a place for you here."
                description="Come worship, pray and grow with us."
              />
            </div>

            <div className="section-icon">
              <FontAwesomeIcon icon={faChurch} />
            </div>
          </div>

          <div className="service-grid">
            {services.length > 0 ? (
              services.map((service, index) => (
                <article className="service-card" key={service.serviceId}>
                  <div className="service-card-top">
                    <span className="service-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <FontAwesomeIcon icon={faClock} />
                  </div>

                  <h3>{service.name}</h3>

                  <p>
                    {service.description ||
                      `Join us every ${service.day} for ${service.name}.`}
                  </p>

                  <div className="service-meta">
                    <span>{service.day}</span>
                    <strong>{service.time}</strong>
                  </div>
                </article>
              ))
            ) : (
              <article className="service-card service-card-empty">
                <div className="service-card-top">
                  <span className="service-number">01</span>

                  <FontAwesomeIcon icon={faChurch} />
                </div>

                <h3>Worship With Us</h3>

                <p>Join us for worship, fellowship and the Word.</p>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENTS
      ===================================================== */}

      <section id="events" className="events-section">
        <div className="container">
          <SectionHeading
            eyebrow="WHAT'S HAPPENING"
            title="Upcoming events."
            description="Stay connected with what is happening in our church community."
          />

          <div className="event-grid">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const eventDate = new Date(event.eventDate);

                return (
                  <article className="event-card" key={event.eventId}>
                    <div className="event-date">
                      <span>
                        {eventDate.toLocaleDateString("en-ZA", {
                          month: "short",
                        })}
                      </span>

                      <strong>
                        {eventDate.toLocaleDateString("en-ZA", {
                          day: "2-digit",
                        })}
                      </strong>
                    </div>

                    <div className="event-content">
                      <div className="event-label">
                        <FontAwesomeIcon icon={faCalendarDays} />

                        <span>UPCOMING</span>
                      </div>

                      <h3>{event.title}</h3>

                      <p>
                        {event.description ||
                          "Join us for this upcoming church event."}
                      </p>

                      {event.location && (
                        <div className="event-location">
                          <FontAwesomeIcon icon={faLocationDot} />

                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <FontAwesomeIcon
                      className="event-arrow"
                      icon={faArrowUpRightFromSquare}
                    />
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FontAwesomeIcon icon={faCalendarDays} />
                </div>

                <span>EVENTS</span>

                <h3>Something good is coming.</h3>

                <p>Upcoming church events will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          ANNOUNCEMENTS
      ===================================================== */}

      <section className="announcements-section">
        <div className="container">
          <div className="section-topline">
            <SectionHeading
              eyebrow="STAY CONNECTED"
              title="Latest announcements."
              description="Keep up with the latest news and updates from our church."
            />

            <div className="section-icon">
              <FontAwesomeIcon icon={faBullhorn} />
            </div>
          </div>

          <div className="announcement-list">
            {announcements.length > 0 ? (
              announcements.slice(0, 4).map((announcement) => (
                <article
                  className="announcement-card"
                  key={announcement.announcementId}
                >
                  <div className="announcement-date">
                    {new Date(announcement.publishDate).toLocaleDateString(
                      "en-ZA",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </div>

                  <div className="announcement-content">
                    <h3>{announcement.title}</h3>

                    <p>{announcement.content}</p>
                  </div>

                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="announcement-arrow"
                  />
                </article>
              ))
            ) : (
              <div className="announcement-empty">
                <FontAwesomeIcon icon={faBullhorn} />

                <p>No announcements available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MEDIA
      ===================================================== */}

      <section id="media" className="media-section">
        <div className="container media-grid">
          <div className="media-content">
            <SectionHeading
              eyebrow="MEDIA"
              title="Stay connected beyond Sunday."
              description="Watch, listen and stay connected with messages and moments from our church."
            />

            <div className="media-actions">
              {featuredMedia?.url && (
                <a
                  href={featuredMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-dark"
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Explore Media
                </a>
              )}

              {!featuredMedia?.url && (
                <span className="media-coming-soon">
                  <FontAwesomeIcon icon={faPlay} />
                  Media coming soon
                </span>
              )}
            </div>
          </div>

          <div className="media-feature">
            <div className="media-feature-number">01</div>

            <div className="media-feature-center">
              <div className="media-play">
                <FontAwesomeIcon icon={faPlay} />
              </div>

              <span>WATCH · LISTEN · CONNECT</span>

              <h3>
                Messages that
                <span>stay with you.</span>
              </h3>
            </div>

            <div className="media-feature-bottom">
              <span>JESUS IS ABLE MINISTRIES</span>

              <span>BOTLOKWA · LIMPOPO</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRAYER CTA
      ===================================================== */}

      <section id="prayer" className="prayer-section">
        <div className="container prayer-inner">
          <div className="prayer-icon">
            <FontAwesomeIcon icon={faHandsPraying} />
          </div>

          <p className="section-eyebrow">NEED PRAYER?</p>

          <h2>
            You don't have to
            <span>carry it alone.</span>
          </h2>

          <p>
            Whatever you are facing, our church family is here to stand with you
            in prayer.
          </p>

          <button type="button" className="button button-light">
            <FontAwesomeIcon icon={faHandsPraying} />
            Submit a Prayer Request
          </button>
        </div>
      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section id="contact" className="contact-section">
        <div className="container contact-grid">
          <div className="contact-intro">
            <SectionHeading
              eyebrow="COME VISIT"
              title="We'd love to meet you."
              description={
                church?.address ||
                "Whether you are visiting for the first time or looking for a church family, you are welcome here."
              }
            />

            <div className="contact-location-card">
              <div className="contact-location-icon">
                <FontAwesomeIcon icon={faLocationDot} />
              </div>

              <div>
                <span>FIND US</span>

                <strong>{church?.address || "Botlokwa, Limpopo"}</strong>
              </div>
            </div>
          </div>

          <div className="contact-details">
            {church?.contactNumber && (
              <a href={`tel:${church.contactNumber}`} className="contact-item">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </div>

                <div>
                  <span>PHONE</span>

                  <p>{church.contactNumber}</p>
                </div>

                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="contact-arrow"
                />
              </a>
            )}

            {church?.email && (
              <a href={`mailto:${church.email}`} className="contact-item">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>

                <div>
                  <span>EMAIL</span>

                  <p>{church.email}</p>
                </div>

                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="contact-arrow"
                />
              </a>
            )}

            <div className="contact-item">
              <div className="contact-icon">
                <FontAwesomeIcon icon={faLocationDot} />
              </div>

              <div>
                <span>LOCATION</span>

                <p>{church?.address || "Botlokwa, Limpopo"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="home-final-cta">
        <div className="container">
          <div className="final-cta-inner">
            <FontAwesomeIcon icon={faQuoteLeft} className="final-quote" />

            <h2>
              There is room
              <span>for you here.</span>
            </h2>

            <p>Come as you are. Grow with us. Walk in faith.</p>

            <a href="#contact" className="button button-dark">
              Plan Your Visit
              <FontAwesomeIcon icon={faArrowRight} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
