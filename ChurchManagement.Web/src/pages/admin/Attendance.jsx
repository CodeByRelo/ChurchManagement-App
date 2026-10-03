import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faRotate,
  faXmark,
  faPen,
  faEye,
  faTrash,
  faCheck,
  faUser,
  faCalendarDays,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Attendance() {
  const { user, accessToken } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form, setForm] = useState({
    memberId: "",
    eventId: "",
    status: "Present",
  });

  const canManage =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator" ||
    user?.role === "Ministry Leader";

  const canDelete =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  const filteredAttendance = useMemo(() => {
    const term = search.trim().toLowerCase();

    return attendance.filter((record) => {
      const matchesSearch =
        !term ||
        record.memberName?.toLowerCase().includes(term) ||
        record.eventTitle?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      const matchesEvent =
        eventFilter === "All" || String(record.eventId) === String(eventFilter);

      return matchesSearch && matchesStatus && matchesEvent;
    });
  }, [attendance, search, statusFilter, eventFilter]);

  const presentCount = attendance.filter(
    (record) => record.status === "Present",
  ).length;

  const absentCount = attendance.filter(
    (record) => record.status === "Absent",
  ).length;

  const excusedCount = attendance.filter(
    (record) => record.status === "Excused",
  ).length;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [attendanceData, membersData, eventsData] = await Promise.all([
        api.getAttendance(accessToken),
        api.getMembers(accessToken),
        api.getEvents(accessToken),
      ]);

      setAttendance(attendanceData);
      setMembers(membersData);
      setEvents(eventsData);
    } catch (error) {
      setError(error.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      memberId: "",
      eventId: "",
      status: "Present",
    });

    setFormError("");
    setModal("create");
  }

  function openView(record) {
    setSelectedRecord(record);
    setFormError("");
    setModal("view");
  }

  function closeModal() {
    if (submitting) return;

    setModal(null);
    setSelectedRecord(null);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");

    const payload = {
      memberId: Number(form.memberId),
      eventId: Number(form.eventId),
      status: form.status,
    };

    try {
      await api.recordAttendance(payload, accessToken);

      await loadData();
      closeModal();
    } catch (error) {
      setFormError(error.message || "Failed to record attendance.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(record, status) {
    if (status === record.status) return;

    try {
      await api.updateAttendance(
        record.attendanceId,
        {
          memberId: record.memberId,
          eventId: record.eventId,
          status,
        },
        accessToken,
      );

      setAttendance((current) =>
        current.map((item) =>
          item.attendanceId === record.attendanceId
            ? { ...item, status }
            : item,
        ),
      );
    } catch (error) {
      setError(error.message || "Failed to update attendance.");
    }
  }

  async function handleDelete(record) {
    const confirmed = window.confirm(
      `Delete the attendance record for ${record.memberName}?`,
    );

    if (!confirmed) return;

    try {
      await api.deleteAttendance(record.attendanceId, accessToken);

      setAttendance((current) =>
        current.filter((item) => item.attendanceId !== record.attendanceId),
      );

      if (selectedRecord?.attendanceId === record.attendanceId) {
        closeModal();
      }
    } catch (error) {
      setError(error.message || "Failed to delete attendance.");
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (!canManage) {
    return (
      <section className="attendance-page">
        <div className="attendance-empty">
          <div>
            <FontAwesomeIcon icon={faClipboardCheck} />
          </div>
          <h3>Access restricted</h3>
          <p>You do not have permission to manage attendance.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="attendance-page">
      {/* HEADER */}
      <div className="attendance-header">
        <div>
          <p className="admin-eyebrow">CHURCH MANAGEMENT</p>

          <h1>Attendance</h1>

          <p>Record and manage member attendance across church events.</p>
        </div>

        <button
          type="button"
          className="attendance-primary-button"
          onClick={openCreate}
        >
          <FontAwesomeIcon icon={faPlus} />
          Record Attendance
        </button>
      </div>

      {/* SUMMARY */}
      <div className="attendance-summary">
        <div className="attendance-summary-card">
          <div className="attendance-summary-icon">
            <FontAwesomeIcon icon={faClipboardCheck} />
          </div>

          <div>
            <span>TOTAL RECORDS</span>
            <strong>{attendance.length}</strong>
          </div>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-icon present">
            <FontAwesomeIcon icon={faCheck} />
          </div>

          <div>
            <span>PRESENT</span>
            <strong>{presentCount}</strong>
          </div>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-icon absent">
            <FontAwesomeIcon icon={faXmark} />
          </div>

          <div>
            <span>ABSENT</span>
            <strong>{absentCount}</strong>
          </div>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-icon excused">
            <FontAwesomeIcon icon={faFilter} />
          </div>

          <div>
            <span>EXCUSED</span>
            <strong>{excusedCount}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="attendance-error">
          <strong>Something went wrong.</strong>
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="attendance-toolbar">
        <div className="attendance-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search member or event..."
          />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="attendance-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
          </select>

          <FontAwesomeIcon icon={faChevronDown} className="select-arrow" />
        </div>

        <div className="attendance-filter">
          <FontAwesomeIcon icon={faCalendarDays} />

          <select
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
          >
            <option value="All">All Events</option>

            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {event.title}
              </option>
            ))}
          </select>

          <FontAwesomeIcon icon={faChevronDown} className="select-arrow" />
        </div>

        <button
          type="button"
          className="attendance-refresh"
          onClick={loadData}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRotate} />
        </button>
      </div>

      {/* TABLE */}
      <div className="attendance-table-card">
        {loading ? (
          <div className="attendance-loading">
            <FontAwesomeIcon icon={faRotate} spin />
            <span>Loading attendance...</span>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="attendance-empty">
            <div>
              <FontAwesomeIcon icon={faClipboardCheck} />
            </div>

            <h3>
              {search || statusFilter !== "All" || eventFilter !== "All"
                ? "No attendance found"
                : "No attendance records yet"}
            </h3>

            <p>
              {search || statusFilter !== "All" || eventFilter !== "All"
                ? "Try adjusting your filters."
                : "Record your first attendance entry to get started."}
            </p>

            {!search && statusFilter === "All" && eventFilter === "All" && (
              <button type="button" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} />
                Record Attendance
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>MEMBER</th>
                    <th>EVENT</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.attendanceId}>
                      <td>
                        <div className="attendance-member-cell">
                          <div className="attendance-avatar">
                            <FontAwesomeIcon icon={faUser} />
                          </div>

                          <div>
                            <strong>{record.memberName}</strong>

                            <span>Member #{record.memberId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="attendance-event-cell">
                          <FontAwesomeIcon icon={faCalendarDays} />

                          <span>{record.eventTitle}</span>
                        </div>
                      </td>

                      <td>
                        <span className="attendance-date">
                          {formatDate(record.attendanceDate)}
                        </span>
                      </td>

                      <td>
                        <div
                          className={`attendance-status-control ${record.status.toLowerCase()}`}
                        >
                          <select
                            value={record.status}
                            onChange={(event) =>
                              handleStatusChange(record, event.target.value)
                            }
                          >
                            <option value="Present">Present</option>

                            <option value="Absent">Absent</option>

                            <option value="Excused">Excused</option>
                          </select>

                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className="select-arrow"
                          />
                        </div>
                      </td>

                      <td>
                        <div className="attendance-actions">
                          <button
                            type="button"
                            title="View"
                            onClick={() => openView(record)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              title="Delete"
                              className="danger"
                              onClick={() => handleDelete(record)}
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

            <div className="attendance-result-count">
              Showing <strong>{filteredAttendance.length}</strong> of{" "}
              <strong>{attendance.length}</strong> attendance records
            </div>
          </>
        )}
      </div>

      {/* CREATE MODAL */}
      {modal === "create" && (
        <div
          className="attendance-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="attendance-modal attendance-form-modal">
            <div className="attendance-modal-header">
              <div>
                <p>NEW ATTENDANCE</p>
                <h2>Record attendance</h2>
              </div>

              <button type="button" onClick={closeModal} disabled={submitting}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && (
              <div className="attendance-form-error">{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="attendance-form-grid">
                <div className="attendance-form-group attendance-form-full">
                  <label htmlFor="memberId">Member</label>

                  <div className="attendance-select">
                    <select
                      id="memberId"
                      name="memberId"
                      value={form.memberId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select a member...</option>

                      {members
                        .filter(
                          (member) => member.membershipStatus === "Active",
                        )
                        .map((member) => (
                          <option key={member.memberId} value={member.memberId}>
                            {member.firstName} {member.lastName}
                          </option>
                        ))}
                    </select>

                    <FontAwesomeIcon icon={faChevronDown} />
                  </div>
                </div>

                <div className="attendance-form-group attendance-form-full">
                  <label htmlFor="eventId">Event</label>

                  <div className="attendance-select">
                    <select
                      id="eventId"
                      name="eventId"
                      value={form.eventId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select an event...</option>

                      {events.map((event) => (
                        <option key={event.eventId} value={event.eventId}>
                          {event.title}
                        </option>
                      ))}
                    </select>

                    <FontAwesomeIcon icon={faChevronDown} />
                  </div>
                </div>

                <div className="attendance-form-group attendance-form-full">
                  <label htmlFor="status">Attendance Status</label>

                  <div className="attendance-select">
                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      <option value="Present">Present</option>

                      <option value="Absent">Absent</option>

                      <option value="Excused">Excused</option>
                    </select>

                    <FontAwesomeIcon icon={faChevronDown} />
                  </div>
                </div>
              </div>

              <div className="attendance-form-note">
                <FontAwesomeIcon icon={faClipboardCheck} />

                <span>
                  Attendance date is recorded automatically when the record is
                  created.
                </span>
              </div>

              <div className="attendance-modal-footer">
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

                  {submitting ? "Recording..." : "Record Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modal === "view" && selectedRecord && (
        <div
          className="attendance-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="attendance-modal">
            <div className="attendance-modal-header">
              <div>
                <p>ATTENDANCE RECORD</p>
                <h2>{selectedRecord.memberName}</h2>
              </div>

              <button type="button" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="attendance-profile">
              <div className="attendance-profile-icon">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </div>

              <div>
                <strong>{selectedRecord.memberName}</strong>

                <span>{selectedRecord.eventTitle}</span>
              </div>
            </div>

            <div className="attendance-details-grid">
              <div>
                <span>MEMBER</span>
                <strong>{selectedRecord.memberName}</strong>
              </div>

              <div>
                <span>EVENT</span>
                <strong>{selectedRecord.eventTitle}</strong>
              </div>

              <div>
                <span>ATTENDANCE DATE</span>
                <strong>{formatDate(selectedRecord.attendanceDate)}</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong
                  className={`attendance-detail-status ${selectedRecord.status.toLowerCase()}`}
                >
                  {selectedRecord.status}
                </strong>
              </div>
            </div>

            <div className="attendance-modal-footer">
              <button type="button" onClick={closeModal}>
                Close
              </button>

              {canDelete && (
                <button
                  type="button"
                  className="attendance-delete-button"
                  onClick={() => handleDelete(selectedRecord)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Attendance;
