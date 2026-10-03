import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faUsers,
  faMagnifyingGlass,
  faFilter,
  faRotate,
  faXmark,
  faCheck,
  faCalendarDays,
  faEnvelope,
  faClock,
  faUserPlus,
  faBan,
  faChevronDown,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Registrations() {
  const { user, accessToken } = useAuth();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [selectedEventId, setSelectedEventId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState(null);

  const [form, setForm] = useState({
    memberId: "",
  });

  const canManage =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator" ||
    user?.role === "Ministry Leader";

  const selectedEvent = events.find(
    (event) => event.eventId === Number(selectedEventId),
  );

  const filteredRegistrations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesSearch =
        !term ||
        registration.memberName?.toLowerCase().includes(term) ||
        registration.memberEmail?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || registration.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, search, statusFilter]);

  const registeredCount = registrations.filter(
    (registration) => registration.status === "Registered",
  ).length;

  const cancelledCount = registrations.filter(
    (registration) => registration.status === "Cancelled",
  ).length;

  const availableMembers = members.filter(
    (member) =>
      member.membershipStatus === "Active" &&
      !registrations.some(
        (registration) =>
          registration.memberId === member.memberId &&
          registration.status === "Registered",
      ),
  );

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    loadPage();
  }, [canManage]);

  useEffect(() => {
    if (selectedEventId) {
      loadRegistrations(Number(selectedEventId));
    } else {
      setRegistrations([]);
    }
  }, [selectedEventId]);

  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      const [eventData, memberData] = await Promise.all([
        api.getEvents(),
        api.getMembers(accessToken),
      ]);

      setEvents(eventData);
      setMembers(memberData);

      const activeEvents = eventData.filter(
        (event) => event.status === "Active",
      );

      if (activeEvents.length > 0) {
        setSelectedEventId(String(activeEvents[0].eventId));
      }
    } catch (error) {
      setError(error.message || "Failed to load registration data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRegistrations(eventId) {
    setLoadingRegistrations(true);
    setError("");

    try {
      const data = await api.getEventRegistrations(eventId, accessToken);

      setRegistrations(data);
    } catch (error) {
      setError(error.message || "Failed to load registrations.");
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  }

  function openCreate() {
    setForm({
      memberId: "",
    });

    setFormError("");
    setModal("create");
  }

  function closeModal() {
    if (submitting) return;

    setModal(null);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleRegister(event) {
    event.preventDefault();

    if (!selectedEventId) {
      setFormError("Please select an event.");
      return;
    }

    if (!form.memberId) {
      setFormError("Please select a member.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await api.registerForEvent(
        Number(selectedEventId),
        Number(form.memberId),
        accessToken,
      );

      await loadRegistrations(Number(selectedEventId));

      closeModal();
    } catch (error) {
      setFormError(error.message || "Failed to register the member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(registration) {
    const confirmed = window.confirm(
      `Cancel ${registration.memberName}'s registration?`,
    );

    if (!confirmed) return;

    try {
      await api.cancelEventRegistration(
        registration.eventId,
        registration.memberId,
        accessToken,
      );

      await loadRegistrations(Number(selectedEventId));
    } catch (error) {
      setError(error.message || "Failed to cancel registration.");
    }
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
      <section className="registrations-page">
        <div className="registrations-empty">
          <div className="registrations-empty-icon">
            <FontAwesomeIcon icon={faListCheck} />
          </div>

          <h3>Access restricted</h3>

          <p>You do not have permission to manage event registrations.</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="registrations-page">
        <div className="registrations-loading">
          <FontAwesomeIcon icon={faRotate} spin />
          <span>Loading registrations...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="registrations-page">
      <div className="registrations-header">
        <div>
          <p className="admin-eyebrow">EVENT MANAGEMENT</p>

          <h1>Registrations</h1>

          <p>View and manage member registrations for church events.</p>
        </div>

        <button
          type="button"
          className="registrations-primary-button"
          onClick={openCreate}
          disabled={!selectedEventId}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Register Member
        </button>
      </div>

      {error && (
        <div className="registrations-error">
          <div>
            <strong>Something went wrong.</strong>
            <span>{error}</span>
          </div>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      <div className="registrations-event-selector">
        <div className="registrations-selector-label">
          <div className="registrations-selector-icon">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>

          <div>
            <span>SELECT EVENT</span>
            <strong>{selectedEvent?.title || "Choose an event"}</strong>
          </div>
        </div>

        <div className="registrations-select">
          <select
            value={selectedEventId}
            onChange={(event) => {
              setSelectedEventId(event.target.value);
              setSearch("");
              setStatusFilter("All");
            }}
          >
            <option value="">Choose an event</option>

            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {event.title} — {formatDate(event.eventDate)}
              </option>
            ))}
          </select>

          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>

      {selectedEvent && (
        <div className="registrations-event-info">
          <div>
            <span>DATE</span>
            <strong>{formatDateTime(selectedEvent.eventDate)}</strong>
          </div>

          <div>
            <span>LOCATION</span>
            <strong>{selectedEvent.location || "Not specified"}</strong>
          </div>

          <div>
            <span>CAPACITY</span>
            <strong>{selectedEvent.capacity || "Unlimited"}</strong>
          </div>

          <div>
            <span>REGISTERED</span>
            <strong>
              {selectedEvent.registrationCount || registeredCount}
            </strong>
          </div>
        </div>
      )}

      <div className="registrations-summary">
        <div className="registrations-summary-card">
          <div className="registrations-summary-icon">
            <FontAwesomeIcon icon={faListCheck} />
          </div>

          <div>
            <span>TOTAL RECORDS</span>
            <strong>{registrations.length}</strong>
          </div>
        </div>

        <div className="registrations-summary-card">
          <div className="registrations-summary-icon">
            <FontAwesomeIcon icon={faCheck} />
          </div>

          <div>
            <span>REGISTERED</span>
            <strong>{registeredCount}</strong>
          </div>
        </div>

        <div className="registrations-summary-card">
          <div className="registrations-summary-icon cancelled">
            <FontAwesomeIcon icon={faBan} />
          </div>

          <div>
            <span>CANCELLED</span>
            <strong>{cancelledCount}</strong>
          </div>
        </div>

        <div className="registrations-summary-card">
          <div className="registrations-summary-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>

          <div>
            <span>AVAILABLE MEMBERS</span>
            <strong>{availableMembers.length}</strong>
          </div>
        </div>
      </div>

      <div className="registrations-toolbar">
        <div className="registrations-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search registered members..."
          />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="registrations-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <FontAwesomeIcon icon={faChevronDown} className="select-arrow" />
        </div>

        <button
          type="button"
          className="registrations-refresh"
          onClick={() =>
            selectedEventId && loadRegistrations(Number(selectedEventId))
          }
          disabled={loadingRegistrations || !selectedEventId}
          title="Refresh"
        >
          <FontAwesomeIcon icon={faRotate} spin={loadingRegistrations} />
        </button>
      </div>

      <div className="registrations-table-card">
        {!selectedEventId ? (
          <div className="registrations-empty">
            <div className="registrations-empty-icon">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>

            <h3>Select an event</h3>

            <p>Choose an event above to view its registrations.</p>
          </div>
        ) : loadingRegistrations ? (
          <div className="registrations-loading">
            <FontAwesomeIcon icon={faRotate} spin />
            <span>Loading event registrations...</span>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="registrations-empty">
            <div className="registrations-empty-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>

            <h3>
              {search || statusFilter !== "All"
                ? "No registrations found"
                : "No registrations yet"}
            </h3>

            <p>
              {search || statusFilter !== "All"
                ? "Try adjusting your search or filter."
                : "Register a member for this event to get started."}
            </p>

            {!search &&
              statusFilter === "All" &&
              selectedEvent.status === "Active" && (
                <button type="button" onClick={openCreate}>
                  <FontAwesomeIcon icon={faUserPlus} />
                  Register Member
                </button>
              )}
          </div>
        ) : (
          <>
            <div className="registrations-table-wrapper">
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>MEMBER</th>
                    <th>EMAIL</th>
                    <th>REGISTERED</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration.registrationId}>
                      <td>
                        <div className="registration-member-cell">
                          <div className="registration-avatar">
                            {registration.memberName?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{registration.memberName}</strong>

                            <span>Member #{registration.memberId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="registration-email">
                          <FontAwesomeIcon icon={faEnvelope} />
                          <span>{registration.memberEmail || "No email"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="registration-date">
                          <FontAwesomeIcon icon={faClock} />
                          <span>
                            {formatDateTime(registration.registrationDate)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`registration-status ${registration.status.toLowerCase()}`}
                        >
                          {registration.status}
                        </span>
                      </td>

                      <td>
                        {registration.status === "Registered" && (
                          <div className="registration-actions">
                            <button
                              type="button"
                              className="danger"
                              title="Cancel registration"
                              onClick={() => handleCancel(registration)}
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="registrations-result-count">
              Showing <strong>{filteredRegistrations.length}</strong> of{" "}
              <strong>{registrations.length}</strong> registrations
            </div>
          </>
        )}
      </div>

      {modal === "create" && (
        <div
          className="registrations-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="registrations-modal">
            <div className="registrations-modal-header">
              <div>
                <p>NEW REGISTRATION</p>
                <h2>Register a member</h2>
              </div>

              <button type="button" onClick={closeModal} disabled={submitting}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && (
              <div className="registrations-form-error">{formError}</div>
            )}

            <div className="registration-event-preview">
              <div className="registration-event-preview-icon">
                <FontAwesomeIcon icon={faCalendarDays} />
              </div>

              <div>
                <span>EVENT</span>
                <strong>{selectedEvent?.title}</strong>
                <small>
                  {selectedEvent && formatDateTime(selectedEvent.eventDate)}
                </small>
              </div>
            </div>

            <form onSubmit={handleRegister}>
              <div className="registrations-form-group">
                <label htmlFor="memberId">Select Member</label>

                <div className="registrations-form-select">
                  <select
                    id="memberId"
                    name="memberId"
                    value={form.memberId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Choose a member</option>

                    {availableMembers.map((member) => (
                      <option key={member.memberId} value={member.memberId}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>

                  <FontAwesomeIcon icon={faChevronDown} />
                </div>
              </div>

              {availableMembers.length === 0 && (
                <div className="registrations-form-note">
                  <FontAwesomeIcon icon={faCircleInfo} />

                  <span>
                    All active members are already registered for this event, or
                    no active members are available.
                  </span>
                </div>
              )}

              <div className="registrations-modal-footer">
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
                  disabled={
                    submitting ||
                    availableMembers.length === 0 ||
                    selectedEvent?.status !== "Active"
                  }
                >
                  <FontAwesomeIcon icon={faCheck} />

                  {submitting ? "Registering..." : "Register Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Registrations;
