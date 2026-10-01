import { useEffect, useState } from "react";
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

  return (
    <div>
      <Hero />

      {/* ABOUT */}

      <section id="about" className="about-section">
        <div className="container about-grid">
          <div>
            <SectionHeading
              eyebrow="WHO WE ARE"
              title={church?.name || "Faith that feels like family."}
              description={
                church?.history ||
                "A community built on faith, hope and the love of Jesus Christ."
              }
            />
          </div>

          <div className="about-copy">
            <p>
              {church?.mission ||
                "We are committed to growing together in faith, serving our community and sharing the love of Jesus Christ."}
            </p>

            <a href="#contact" className="text-link">
              Learn more about us →
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}

      <section id="services" className="services-section">
        <div className="container">
          <SectionHeading
            eyebrow="JOIN US"
            title="Come worship with us."
            description="There is always a place for you here."
          />

          <div className="service-grid">
            {services.length > 0 ? (
              services.map((service) => (
                <article className="service-card" key={service.serviceId}>
                  <span>{String(service.serviceId).padStart(2, "0")}</span>

                  <h3>{service.name}</h3>

                  <p>
                    {service.description ||
                      `Join us every ${service.day} for ${service.name}.`}
                  </p>

                  <strong>{service.time}</strong>
                </article>
              ))
            ) : (
              <article className="service-card">
                <span>01</span>

                <h3>Worship With Us</h3>

                <p>Join us for worship, fellowship and the Word.</p>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* EVENTS */}

      <section id="events" className="events-section">
        <div className="container">
          <SectionHeading
            eyebrow="WHAT'S HAPPENING"
            title="Upcoming events."
            description="Stay connected with what's happening in our church community."
          />

          <div className="event-grid">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <article className="event-card" key={event.eventId}>
                  <div className="event-date">
                    {new Date(event.eventDate).toLocaleDateString("en-ZA", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>

                  <div>
                    <h3>{event.title}</h3>

                    <p>
                      {event.description ||
                        "Join us for this upcoming church event."}
                    </p>

                    {event.location && <small>{event.location}</small>}
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <span>EVENTS</span>

                <h3>Something good is coming.</h3>

                <p>Upcoming church events will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}

      <section className="announcements-section">
        <div className="container">
          <SectionHeading
            eyebrow="STAY CONNECTED"
            title="Latest announcements."
          />

          <div className="announcement-list">
            {announcements.length > 0 ? (
              announcements.slice(0, 4).map((announcement) => (
                <article
                  className="announcement-card"
                  key={announcement.announcementId}
                >
                  <span>
                    {new Date(announcement.publishDate).toLocaleDateString(
                      "en-ZA",
                    )}
                  </span>

                  <h3>{announcement.title}</h3>

                  <p>{announcement.content}</p>
                </article>
              ))
            ) : (
              <p className="muted">No announcements available at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* MEDIA */}

      <section id="media" className="media-section">
        <div className="container media-grid">
          <div>
            <SectionHeading
              eyebrow="MEDIA"
              title="Stay connected beyond Sunday."
              description="Watch, listen and stay connected with messages and moments from our church."
            />

            {media.length > 0 && media[0]?.url && (
              <a
                href={media[0].url}
                target="_blank"
                rel="noreferrer"
                className="button button-dark"
              >
                Explore Media
              </a>
            )}
          </div>

          <div className="media-placeholder">
            <span>JIA</span>
          </div>
        </div>
      </section>

      {/* PRAYER */}

      <section id="prayer" className="prayer-section">
        <div className="container prayer-inner">
          <p className="section-eyebrow">NEED PRAYER?</p>

          <h2>
            You don't have to
            <span>carry it alone.</span>
          </h2>

          <p>Share your prayer request with our church family.</p>

          <button type="button" className="button button-light">
            Submit a Prayer Request
          </button>
        </div>
      </section>

      {/* CONTACT */}

      <section id="contact" className="contact-section">
        <div className="container contact-grid">
          <SectionHeading
            eyebrow="COME VISIT"
            title="We'd love to meet you."
            description={
              church?.address ||
              "Whether you are visiting for the first time or looking for a church family, you are welcome here."
            }
          />

          <div className="contact-details">
            {church?.contactNumber && (
              <div>
                <span>PHONE</span>
                <p>{church.contactNumber}</p>
              </div>
            )}

            {church?.email && (
              <div>
                <span>EMAIL</span>
                <p>{church.email}</p>
              </div>
            )}

            <div>
              <span>LOCATION</span>

              <p>{church?.address || "Botlokwa, Limpopo"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
