import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faRotate,
  faXmark,
  faEye,
  faPen,
  faTrash,
  faCheck,
  faLocationDot,
  faUsers,
  faClock,
  faChevronDown,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Events() {
  const { user, accessToken } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    endDate: "",
    location: "",
    capacity: "",
    status: "Active",
  });

  const canManage =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !term ||
        event.title?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const activeCount = events.filter(
    (event) => event.status === "Active",
  ).length;

  const cancelledCount = events.filter(
    (event) => event.status === "Cancelled",
  ).length;

  const registrationTotal = events.reduce(
    (total, event) => total + (event.registrationCount || 0),
    0,
  );

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      setError(error.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      title: "",
      description: "",
      eventDate: "",
      endDate: "",
      location: "",
      capacity: "",
      status: "Active",
    });

    setFormError("");
    setModal("create");
  }

  function openView(event) {
    setSelectedEvent(event);
    setFormError("");
    setModal("view");
  }

  function openEdit(event) {
    setSelectedEvent(event);

    setForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: toDateTimeLocal(event.eventDate),
      endDate: event.endDate ? toDateTimeLocal(event.endDate) : "",
      location: event.location || "",
      capacity: event.capacity || "",
      status: event.status || "Active",
    });

    setFormError("");
    setModal("edit");
  }

  function toDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function closeModal() {
    if (submitting) return;

    setModal(null);
    setSelectedEvent(null);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validateDates() {
    if (!form.eventDate) {
      return "Event date and time are required.";
    }

    if (form.endDate && new Date(form.endDate) < new Date(form.eventDate)) {
      return "The event end date cannot be before the event date.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");

    const dateError = validateDates();

    if (dateError) {
      setFormError(dateError);
      setSubmitting(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      eventDate: new Date(form.eventDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      location: form.location.trim() || null,
      capacity: form.capacity ? Number(form.capacity) : null,
    };

    try {
      if (modal === "create") {
        await api.createEvent(payload, accessToken);
      } else {
        await api.updateEvent(
          selectedEvent.eventId,
          {
            ...payload,
            status: form.status,
          },
          accessToken,
        );
      }

      await loadEvents();
      closeModal();
    } catch (error) {
      setFormError(
        error.message ||
          `Failed to ${modal === "create" ? "create" : "update"} the event.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(event) {
    const confirmed = window.confirm(`Cancel "${event.title}"?`);

    if (!confirmed) return;

    try {
      await api.deleteEvent(event.eventId, accessToken);

      setEvents((current) =>
        current.map((item) =>
          item.eventId === event.eventId
            ? {
                ...item,
                status: "Cancelled",
              }
            : item,
        ),
      );

      if (selectedEvent?.eventId === event.eventId) {
        setSelectedEvent({
          ...event,
          status: "Cancelled",
        });
      }
    } catch (error) {
      setError(error.message || "Failed to cancel the event.");
    }
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(value) {
    return new Date(value).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateTime(value) {
    return new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!canManage) {
    return (
      <section className="events-page">
        <div className="events-empty">
          <div className="events-empty-icon">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>

          <h3>Access restricted</h3>

          <p>You do not have permission to manage events.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="events-page">
      {/* HEADER */}
      <div className="events-header">
        <div>
          <p className="admin-eyebrow">CHURCH MANAGEMENT</p>

          <h1>Events</h1>

          <p>Create and manage church events, schedules and registrations.</p>
        </div>

        <button
          type="button"
          className="events-primary-button"
          onClick={openCreate}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Event
        </button>
      </div>

      {/* SUMMARY */}
      <div className="events-summary">
        <div className="events-summary-card">
          <div className="events-summary-icon">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>

          <div>
            <span>TOTAL EVENTS</span>
            <strong>{events.length}</strong>
          </div>
        </div>

        <div className="events-summary-card">
          <div className="events-summary-icon">
            <FontAwesomeIcon icon={faCheck} />
          </div>

          <div>
            <span>ACTIVE</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="events-summary-card">
          <div className="events-summary-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>

          <div>
            <span>REGISTRATIONS</span>
            <strong>{registrationTotal}</strong>
          </div>
        </div>

        <div className="events-summary-card">
          <div className="events-summary-icon cancelled">
            <FontAwesomeIcon icon={faXmark} />
          </div>

          <div>
            <span>CANCELLED</span>
            <strong>{cancelledCount}</strong>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="events-error">
          <div>
            <strong>Something went wrong.</strong>
            <span>{error}</span>
          </div>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="events-toolbar">
        <div className="events-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events..."
          />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="events-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>

            <option value="Active">Active</option>

            <option value="Cancelled">Cancelled</option>
          </select>

          <FontAwesomeIcon icon={faChevronDown} className="select-arrow" />
        </div>

        <button
          type="button"
          className="events-refresh"
          onClick={loadEvents}
          disabled={loading}
          title="Refresh"
        >
          <FontAwesomeIcon icon={faRotate} spin={loading} />
        </button>
      </div>

      {/* TABLE */}
      <div className="events-table-card">
        {loading ? (
          <div className="events-loading">
            <FontAwesomeIcon icon={faRotate} spin />

            <span>Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="events-empty">
            <div className="events-empty-icon">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>

            <h3>
              {search || statusFilter !== "All"
                ? "No events found"
                : "No events yet"}
            </h3>

            <p>
              {search || statusFilter !== "All"
                ? "Try adjusting your search or filter."
                : "Create your first church event to get started."}
            </p>

            {!search && statusFilter === "All" && (
              <button type="button" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} />
                Add Event
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="events-table-wrapper">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>EVENT</th>
                    <th>DATE & TIME</th>
                    <th>LOCATION</th>
                    <th>REGISTRATIONS</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.eventId}>
                      <td>
                        <div className="event-name-cell">
                          <div className="event-avatar">
                            <FontAwesomeIcon icon={faCalendarDays} />
                          </div>

                          <div>
                            <strong>{event.title}</strong>

                            {event.description && (
                              <span>{event.description}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="event-date-cell">
                          <strong>{formatDate(event.eventDate)}</strong>

                          <span>
                            <FontAwesomeIcon icon={faClock} />
                            {formatTime(event.eventDate)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="event-location">
                          <FontAwesomeIcon icon={faLocationDot} />

                          <span>{event.location || "Not specified"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="event-registrations">
                          <FontAwesomeIcon icon={faUsers} />

                          <strong>{event.registrationCount}</strong>

                          {event.capacity && <span>/ {event.capacity}</span>}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`event-status ${event.status.toLowerCase()}`}
                        >
                          {event.status}
                        </span>
                      </td>

                      <td>
                        <div className="events-actions">
                          <button
                            type="button"
                            title="View"
                            onClick={() => openView(event)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEdit(event)}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>

                          {event.status !== "Cancelled" && (
                            <button
                              type="button"
                              title="Cancel"
                              className="danger"
                              onClick={() => handleDelete(event)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="events-result-count">
              Showing <strong>{filteredEvents.length}</strong> of{" "}
              <strong>{events.length}</strong> events
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT */}
      {(modal === "create" || modal === "edit") && (
        <div
          className="events-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="events-modal events-form-modal">
            <div className="events-modal-header">
              <div>
                <p>{modal === "create" ? "NEW EVENT" : "EDIT EVENT"}</p>

                <h2>
                  {modal === "create"
                    ? "Create church event"
                    : "Edit church event"}
                </h2>
              </div>

              <button type="button" onClick={closeModal} disabled={submitting}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && <div className="events-form-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="events-form-grid">
                <div className="events-form-group events-form-full">
                  <label htmlFor="title">Event Title</label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Youth Conference"
                    maxLength={200}
                    required
                  />
                </div>

                <div className="events-form-group">
                  <label htmlFor="eventDate">Start Date & Time</label>

                  <input
                    id="eventDate"
                    name="eventDate"
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="events-form-group">
                  <label htmlFor="endDate">End Date & Time</label>

                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="events-form-group">
                  <label htmlFor="location">Location</label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Main Church"
                    maxLength={255}
                  />
                </div>

                <div className="events-form-group">
                  <label htmlFor="capacity">Registration Capacity</label>

                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={form.capacity}
                    onChange={handleFormChange}
                    placeholder="Optional"
                    min="1"
                    max="100000"
                  />
                </div>

                {modal === "edit" && (
                  <div className="events-form-group">
                    <label htmlFor="status">Status</label>

                    <div className="events-select">
                      <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                      >
                        <option value="Active">Active</option>

                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                  </div>
                )}

                <div className="events-form-group events-form-full">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Add a short description..."
                    rows="4"
                    maxLength={2000}
                  />
                </div>
              </div>

              <div className="events-form-note">
                <FontAwesomeIcon icon={faCircleInfo} />

                <span>
                  New events are created as active and can be cancelled later
                  without removing the event history.
                </span>
              </div>

              <div className="events-modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-primary"
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faCheck} />

                  {submitting
                    ? modal === "create"
                      ? "Creating..."
                      : "Saving..."
                    : modal === "create"
                      ? "Create Event"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW */}
      {modal === "view" && selectedEvent && (
        <div
          className="events-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="events-modal">
            <div className="events-modal-header">
              <div>
                <p>CHURCH EVENT</p>

                <h2>{selectedEvent.title}</h2>
              </div>

              <button type="button" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="event-profile">
              <div className="event-profile-icon">
                <FontAwesomeIcon icon={faCalendarDays} />
              </div>

              <div>
                <strong>{selectedEvent.title}</strong>

                <span>{formatDateTime(selectedEvent.eventDate)}</span>
              </div>
            </div>

            <div className="event-details-grid">
              <div>
                <span>START</span>

                <strong>{formatDateTime(selectedEvent.eventDate)}</strong>
              </div>

              <div>
                <span>END</span>

                <strong>
                  {selectedEvent.endDate
                    ? formatDateTime(selectedEvent.endDate)
                    : "Not specified"}
                </strong>
              </div>

              <div>
                <span>LOCATION</span>

                <strong>{selectedEvent.location || "Not specified"}</strong>
              </div>

              <div>
                <span>REGISTRATIONS</span>

                <strong>
                  {selectedEvent.registrationCount}

                  {selectedEvent.capacity && ` / ${selectedEvent.capacity}`}
                </strong>
              </div>

              <div>
                <span>STATUS</span>

                <strong
                  className={`event-detail-status ${selectedEvent.status.toLowerCase()}`}
                >
                  {selectedEvent.status}
                </strong>
              </div>

              <div>
                <span>CREATED BY</span>

                <strong>
                  {selectedEvent.createdByUsername || "Administrator"}
                </strong>
              </div>
            </div>

            {selectedEvent.description && (
              <div className="event-description">
                <span>DESCRIPTION</span>

                <p>{selectedEvent.description}</p>
              </div>
            )}

            <div className="events-modal-footer">
              <button type="button" onClick={closeModal}>
                Close
              </button>

              <button
                type="button"
                className="modal-primary"
                onClick={() => openEdit(selectedEvent)}
              >
                <FontAwesomeIcon icon={faPen} />
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Events;
