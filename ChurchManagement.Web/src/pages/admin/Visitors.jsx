import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUserPlus,
  faMagnifyingGlass,
  faFilter,
  faPen,
  faEye,
  faTrash,
  faRotate,
  faXmark,
  faCheck,
  faEnvelope,
  faPhone,
  faCalendarDays,
  faClock,
  faUserCheck,
  faUserClock,
  faUserGroup,
  faChevronDown,
  faNoteSticky,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function Visitors() {
  const { user, accessToken } = useAuth();

  const canManageVisitors =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator" ||
    user?.role === "Ministry Leader";

  const canDeleteVisitors =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [updatingFollowUp, setUpdatingFollowUp] = useState(null);

  const followUpStatuses = [
    "Pending",
    "Contacted",
    "Followed Up",
    "Joined",
    "Closed",
  ];

  const emptyForm = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    visitDate: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadVisitors();
  }, []);

  async function loadVisitors() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getVisitors(accessToken);

      setVisitors(data || []);
    } catch (error) {
      console.error("Failed to load visitors:", error);

      setError(error.message || "Unable to load visitors.");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreate() {
    setEditingVisitor(null);

    setForm({
      ...emptyForm,
      visitDate: new Date().toISOString().substring(0, 10),
    });

    setFormError("");
    setShowForm(true);
  }

  function openEdit(visitor) {
    setEditingVisitor(visitor);

    setForm({
      firstName: visitor.firstName || "",
      lastName: visitor.lastName || "",
      phone: visitor.phone || "",
      email: visitor.email || "",
      visitDate: visitor.visitDate ? visitor.visitDate.substring(0, 10) : "",
      notes: visitor.notes || "",
    });

    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    if (submitting) return;

    setShowForm(false);
    setEditingVisitor(null);
    setFormError("");
  }

  function openView(visitor) {
    setSelectedVisitor(visitor);
  }

  function closeView() {
    setSelectedVisitor(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      visitDate: form.visitDate
        ? new Date(form.visitDate).toISOString()
        : new Date().toISOString(),
      notes: form.notes.trim() || null,
    };

    try {
      if (editingVisitor) {
        const updated = await api.updateVisitor(
          editingVisitor.visitorId,
          payload,
          accessToken,
        );

        setVisitors((current) =>
          current.map((visitor) =>
            visitor.visitorId === editingVisitor.visitorId ? updated : visitor,
          ),
        );

        if (selectedVisitor?.visitorId === editingVisitor.visitorId) {
          setSelectedVisitor(updated);
        }
      } else {
        const created = await api.createVisitor(payload, accessToken);

        setVisitors((current) => [created, ...current]);
      }

      closeForm();
    } catch (error) {
      console.error("Failed to save visitor:", error);

      setFormError(error.message || "Unable to save visitor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFollowUpChange(visitor, status) {
    if (visitor.followUpStatus === status) return;

    try {
      setUpdatingFollowUp(visitor.visitorId);

      const updated = await api.updateVisitorFollowUp(
        visitor.visitorId,
        status,
        accessToken,
      );

      setVisitors((current) =>
        current.map((item) =>
          item.visitorId === visitor.visitorId ? updated : item,
        ),
      );

      if (selectedVisitor?.visitorId === visitor.visitorId) {
        setSelectedVisitor(updated);
      }
    } catch (error) {
      console.error("Failed to update follow-up:", error);

      setError(error.message || "Unable to update follow-up status.");
    } finally {
      setUpdatingFollowUp(null);
    }
  }

  async function handleDelete(visitor) {
    const confirmed = window.confirm(
      `Delete ${visitor.firstName} ${visitor.lastName}?\n\nThis visitor record will be permanently removed.`,
    );

    if (!confirmed) return;

    try {
      await api.deleteVisitor(visitor.visitorId, accessToken);

      setVisitors((current) =>
        current.filter((item) => item.visitorId !== visitor.visitorId),
      );

      if (selectedVisitor?.visitorId === visitor.visitorId) {
        closeView();
      }
    } catch (error) {
      console.error("Failed to delete visitor:", error);

      setError(error.message || "Unable to delete visitor.");
    }
  }

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visitors.filter((visitor) => {
      const fullName = `${visitor.firstName} ${visitor.lastName}`.toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        visitor.email?.toLowerCase().includes(query) ||
        visitor.phone?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || visitor.followUpStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [visitors, search, statusFilter]);

  const pendingCount = visitors.filter(
    (visitor) => visitor.followUpStatus === "Pending",
  ).length;

  const contactedCount = visitors.filter(
    (visitor) => visitor.followUpStatus === "Contacted",
  ).length;

  const joinedCount = visitors.filter(
    (visitor) => visitor.followUpStatus === "Joined",
  ).length;

  function formatVisitDate(date) {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatLongDate(date) {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function getStatusClass(status) {
    return status?.toLowerCase().replace(/\s+/g, "-") || "pending";
  }

  return (
    <section className="visitors-page">
      {/* HEADER */}

      <div className="visitors-header">
        <div>
          <p className="dashboard-eyebrow">PEOPLE</p>

          <h1>Visitors</h1>

          <p>Manage visitors and keep track of follow-ups and engagement.</p>
        </div>

        {canManageVisitors && (
          <button
            type="button"
            className="visitors-primary-button"
            onClick={openCreate}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            Add Visitor
          </button>
        )}
      </div>

      {/* SUMMARY */}

      <div className="visitors-summary">
        <div className="visitors-summary-card">
          <div className="visitors-summary-icon">
            <FontAwesomeIcon icon={faUserGroup} />
          </div>

          <div>
            <span>TOTAL VISITORS</span>
            <strong>{visitors.length}</strong>
          </div>
        </div>

        <div className="visitors-summary-card">
          <div className="visitors-summary-icon">
            <FontAwesomeIcon icon={faUserClock} />
          </div>

          <div>
            <span>PENDING</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="visitors-summary-card">
          <div className="visitors-summary-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>

          <div>
            <span>CONTACTED</span>
            <strong>{contactedCount}</strong>
          </div>
        </div>

        <div className="visitors-summary-card">
          <div className="visitors-summary-icon">
            <FontAwesomeIcon icon={faCheck} />
          </div>

          <div>
            <span>JOINED</span>
            <strong>{joinedCount}</strong>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="visitors-error">
          <strong>Something went wrong</strong>

          <span>{error}</span>

          <button type="button" onClick={loadVisitors}>
            Try Again
          </button>
        </div>
      )}

      {/* TOOLBAR */}

      <div className="visitors-toolbar">
        <div className="visitors-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            placeholder="Search visitors..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="visitors-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Follow-ups</option>

            {followUpStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <FontAwesomeIcon className="select-arrow" icon={faChevronDown} />
        </div>

        <button
          type="button"
          className="visitors-refresh"
          onClick={loadVisitors}
          disabled={loading}
          title="Refresh visitors"
        >
          <FontAwesomeIcon icon={faRotate} spin={loading} />
        </button>
      </div>

      {/* TABLE */}

      <div className="visitors-table-card">
        {loading ? (
          <div className="visitors-loading">
            <FontAwesomeIcon icon={faRotate} spin />

            <span>Loading visitors...</span>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="visitors-empty">
            <div>
              <FontAwesomeIcon icon={faUserPlus} />
            </div>

            <h3>
              {search || statusFilter !== "All"
                ? "No visitors found"
                : "No visitors yet"}
            </h3>

            <p>
              {search || statusFilter !== "All"
                ? "Try changing your search or filter."
                : "Add your first visitor to get started."}
            </p>

            {!search && statusFilter === "All" && canManageVisitors && (
              <button type="button" onClick={openCreate}>
                <FontAwesomeIcon icon={faUserPlus} />
                Add Visitor
              </button>
            )}
          </div>
        ) : (
          <div className="visitors-table-wrapper">
            <table className="visitors-table">
              <thead>
                <tr>
                  <th>VISITOR</th>
                  <th>CONTACT</th>
                  <th>VISIT DATE</th>
                  <th>FOLLOW-UP</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor.visitorId}>
                    <td>
                      <div className="visitor-name-cell">
                        <div className="visitor-avatar">
                          {visitor.firstName?.charAt(0).toUpperCase()}
                          {visitor.lastName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {visitor.firstName} {visitor.lastName}
                          </strong>

                          <span>#{visitor.visitorId}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="visitor-contact-cell">
                        {visitor.email && (
                          <span>
                            <FontAwesomeIcon icon={faEnvelope} />
                            {visitor.email}
                          </span>
                        )}

                        {visitor.phone && (
                          <span>
                            <FontAwesomeIcon icon={faPhone} />
                            {visitor.phone}
                          </span>
                        )}

                        {!visitor.email && !visitor.phone && (
                          <span className="muted">No contact details</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="visitor-date-cell">
                        <FontAwesomeIcon icon={faCalendarDays} />

                        <span>{formatVisitDate(visitor.visitDate)}</span>
                      </div>
                    </td>

                    <td>
                      <div className="visitor-status-control">
                        <select
                          className={`visitor-status-select ${getStatusClass(
                            visitor.followUpStatus,
                          )}`}
                          value={visitor.followUpStatus}
                          disabled={updatingFollowUp === visitor.visitorId}
                          onChange={(event) =>
                            handleFollowUpChange(visitor, event.target.value)
                          }
                        >
                          {followUpStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <FontAwesomeIcon
                          className="select-arrow"
                          icon={faChevronDown}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="visitor-actions">
                        <button
                          type="button"
                          title="View visitor"
                          onClick={() => openView(visitor)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {canManageVisitors && (
                          <button
                            type="button"
                            title="Edit visitor"
                            onClick={() => openEdit(visitor)}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                        )}

                        {canDeleteVisitors && (
                          <button
                            type="button"
                            className="danger"
                            title="Delete visitor"
                            onClick={() => handleDelete(visitor)}
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
        )}
      </div>

      {/* RESULT COUNT */}

      {!loading && filteredVisitors.length > 0 && (
        <div className="visitors-result-count">
          Showing <strong>{filteredVisitors.length}</strong> of{" "}
          <strong>{visitors.length}</strong> visitors
        </div>
      )}

      {/* VIEW MODAL */}

      {selectedVisitor && (
        <div
          className="visitor-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeView();
            }
          }}
        >
          <div className="visitor-modal">
            <div className="visitor-modal-header">
              <div>
                <p>VISITOR PROFILE</p>

                <h2>
                  {selectedVisitor.firstName} {selectedVisitor.lastName}
                </h2>
              </div>

              <button type="button" onClick={closeView}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="visitor-profile">
              <div className="visitor-profile-avatar">
                {selectedVisitor.firstName?.charAt(0).toUpperCase()}
                {selectedVisitor.lastName?.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>
                  {selectedVisitor.firstName} {selectedVisitor.lastName}
                </strong>

                <span>Visitor #{selectedVisitor.visitorId}</span>
              </div>
            </div>

            <div className="visitor-details-grid">
              <div>
                <span>EMAIL</span>

                <strong>{selectedVisitor.email || "Not provided"}</strong>
              </div>

              <div>
                <span>PHONE</span>

                <strong>{selectedVisitor.phone || "Not provided"}</strong>
              </div>

              <div>
                <span>VISIT DATE</span>

                <strong>{formatLongDate(selectedVisitor.visitDate)}</strong>
              </div>

              <div>
                <span>FOLLOW-UP STATUS</span>

                <strong
                  className={`visitor-detail-status ${getStatusClass(
                    selectedVisitor.followUpStatus,
                  )}`}
                >
                  {selectedVisitor.followUpStatus}
                </strong>
              </div>

              <div className="visitor-detail-full">
                <span>NOTES</span>

                <strong>{selectedVisitor.notes || "No notes recorded."}</strong>
              </div>

              <div>
                <span>RECORD CREATED</span>

                <strong>{formatLongDate(selectedVisitor.createdAt)}</strong>
              </div>
            </div>

            <div className="visitor-follow-up-section">
              <div>
                <p>FOLLOW-UP</p>

                <h3>Update visitor status</h3>
              </div>

              <div className="visitor-follow-up-actions">
                {followUpStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={
                      selectedVisitor.followUpStatus === status ? "active" : ""
                    }
                    disabled={updatingFollowUp === selectedVisitor.visitorId}
                    onClick={() =>
                      handleFollowUpChange(selectedVisitor, status)
                    }
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="visitor-modal-footer">
              <button type="button" onClick={closeView}>
                Close
              </button>

              {canManageVisitors && (
                <button
                  type="button"
                  className="modal-primary"
                  onClick={() => {
                    closeView();
                    openEdit(selectedVisitor);
                  }}
                >
                  <FontAwesomeIcon icon={faPen} />
                  Edit Visitor
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}

      {showForm && (
        <div
          className="visitor-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              closeForm();
            }
          }}
        >
          <div className="visitor-modal visitor-form-modal">
            <div className="visitor-modal-header">
              <div>
                <p>{editingVisitor ? "EDIT VISITOR" : "NEW VISITOR"}</p>

                <h2>{editingVisitor ? "Update visitor" : "Add a visitor"}</h2>
              </div>

              <button type="button" onClick={closeForm} disabled={submitting}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && <div className="visitor-form-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="visitor-form-grid">
                <div className="visitor-form-group">
                  <label htmlFor="firstName">First Name</label>

                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    required
                    maxLength={100}
                    placeholder="First name"
                    autoFocus
                  />
                </div>

                <div className="visitor-form-group">
                  <label htmlFor="lastName">Last Name</label>

                  <input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleFormChange}
                    required
                    maxLength={100}
                    placeholder="Last name"
                  />
                </div>

                <div className="visitor-form-group">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    maxLength={255}
                    placeholder="visitor@example.com"
                  />
                </div>

                <div className="visitor-form-group">
                  <label htmlFor="phone">Phone</label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                    maxLength={20}
                    placeholder="Phone number"
                  />
                </div>

                <div className="visitor-form-group">
                  <label htmlFor="visitDate">Visit Date</label>

                  <input
                    id="visitDate"
                    name="visitDate"
                    type="date"
                    value={form.visitDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="visitor-form-group visitor-form-full">
                  <label htmlFor="notes">Notes</label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    maxLength={2000}
                    rows={4}
                    placeholder="Add any notes about the visitor..."
                  />
                </div>
              </div>

              {!editingVisitor && (
                <div className="visitor-form-note">
                  <FontAwesomeIcon icon={faUserClock} />

                  <span>
                    New visitors automatically start with a Pending follow-up
                    status.
                  </span>
                </div>
              )}

              <div className="visitor-modal-footer">
                <button type="button" onClick={closeForm} disabled={submitting}>
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-primary"
                  disabled={submitting}
                >
                  <FontAwesomeIcon
                    icon={submitting ? faRotate : faCheck}
                    spin={submitting}
                  />

                  {submitting
                    ? "Saving..."
                    : editingVisitor
                      ? "Save Changes"
                      : "Create Visitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Visitors;
