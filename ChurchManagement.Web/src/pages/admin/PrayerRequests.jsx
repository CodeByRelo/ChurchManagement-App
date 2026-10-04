import { useEffect, useMemo, useState } from "react";
import {
  faCircleCheck,
  faCircleInfo,
  faClock,
  faEye,
  faFilter,
  faMagnifyingGlass,
  faRotate,
  faTrash,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function PrayerRequests() {
  const { user, accessToken } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const isSuperAdmin = user?.role === "Super Administrator";

  const canDelete = isSuperAdmin || user?.role === "Church Administrator";

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getPrayerRequests(accessToken);

      setRequests(data || []);
    } catch (err) {
      setError(err.message || "Failed to load prayer requests.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        request.memberName?.toLowerCase().includes(searchValue) ||
        request.requestText?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === "Pending")
        .length,
      inProgress: requests.filter((request) => request.status === "In Progress")
        .length,
      answered: requests.filter((request) => request.status === "Answered")
        .length,
      closed: requests.filter((request) => request.status === "Closed").length,
    };
  }, [requests]);

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      const updated = await api.updatePrayerRequestStatus(
        id,
        status,
        accessToken,
      );

      setRequests((current) =>
        current.map((request) =>
          request.prayerRequestId === id ? updated : request,
        ),
      );

      if (selectedRequest?.prayerRequestId === id) {
        setSelectedRequest(updated);
      }
    } catch (err) {
      setError(err.message || "Failed to update prayer request.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(request) {
    const confirmed = window.confirm(
      `Delete the prayer request from ${request.memberName}?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(request.prayerRequestId);
      setError("");

      await api.deletePrayerRequest(request.prayerRequestId, accessToken);

      setRequests((current) =>
        current.filter(
          (item) => item.prayerRequestId !== request.prayerRequestId,
        ),
      );

      if (selectedRequest?.prayerRequestId === request.prayerRequestId) {
        setSelectedRequest(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete prayer request.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status) {
    switch (status) {
      case "Pending":
        return "pending";

      case "In Progress":
        return "in-progress";

      case "Answered":
        return "answered";

      case "Closed":
        return "closed";

      default:
        return "";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "Pending":
        return faClock;

      case "In Progress":
        return faRotate;

      case "Answered":
        return faCircleCheck;

      case "Closed":
        return faCircleInfo;

      default:
        return faCircleInfo;
    }
  }

  return (
    <div className="prayer-requests-page">
      <div className="prayer-requests-header">
        <div>
          <div className="prayer-requests-eyebrow">COMMUNICATION</div>

          <h1>Prayer Requests</h1>

          <p>Review and manage prayer requests submitted by church members.</p>
        </div>

        <button
          type="button"
          className="prayer-requests-refresh"
          onClick={loadRequests}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRotate} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="prayer-requests-error">
          <FontAwesomeIcon icon={faCircleInfo} />
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      <div className="prayer-requests-summary">
        <div className="prayer-summary-card">
          <div className="prayer-summary-icon">
            <FontAwesomeIcon icon={faCircleInfo} />
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="prayer-summary-card">
          <div className="prayer-summary-icon pending">
            <FontAwesomeIcon icon={faClock} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="prayer-summary-card">
          <div className="prayer-summary-icon in-progress">
            <FontAwesomeIcon icon={faRotate} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{summary.inProgress}</strong>
          </div>
        </div>

        <div className="prayer-summary-card">
          <div className="prayer-summary-icon answered">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>

          <div>
            <span>Answered</span>
            <strong>{summary.answered}</strong>
          </div>
        </div>

        <div className="prayer-summary-card">
          <div className="prayer-summary-icon closed">
            <FontAwesomeIcon icon={faCircleInfo} />
          </div>

          <div>
            <span>Closed</span>
            <strong>{summary.closed}</strong>
          </div>
        </div>
      </div>

      <div className="prayer-requests-toolbar">
        <div className="prayer-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            placeholder="Search member or request..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="prayer-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Answered">Answered</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="prayer-requests-table-card">
        {loading ? (
          <div className="prayer-requests-loading">
            <FontAwesomeIcon icon={faRotate} spin />
            <span>Loading prayer requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="prayer-requests-empty">
            <div>
              <FontAwesomeIcon icon={faCircleInfo} />
            </div>

            <h3>No prayer requests found</h3>

            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="prayer-requests-table-wrapper">
            <table className="prayer-requests-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>REQUEST</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                  <th className="prayer-actions-heading">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.prayerRequestId}>
                    <td>
                      <div className="prayer-member">
                        <div className="prayer-member-avatar">
                          <FontAwesomeIcon icon={faUser} />
                        </div>

                        <div>
                          <strong>{request.memberName}</strong>

                          <span>Member #{request.memberId}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="prayer-request-preview">
                        {request.requestText}
                      </div>
                    </td>

                    <td>
                      <div className="prayer-date">
                        {formatDate(request.submittedDate)}
                      </div>
                    </td>

                    <td>
                      <select
                        className={`prayer-status-select ${getStatusClass(
                          request.status,
                        )}`}
                        value={request.status}
                        disabled={updatingId === request.prayerRequestId}
                        onChange={(event) =>
                          handleStatusChange(
                            request.prayerRequestId,
                            event.target.value,
                          )
                        }
                      >
                        <option value="Pending">Pending</option>

                        <option value="In Progress">In Progress</option>

                        <option value="Answered">Answered</option>

                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td>
                      <div className="prayer-actions">
                        <button
                          type="button"
                          className="prayer-action-button view"
                          title="View request"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            className="prayer-action-button delete"
                            title="Delete request"
                            disabled={deletingId === request.prayerRequestId}
                            onClick={() => handleDelete(request)}
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

      {selectedRequest && (
        <div
          className="prayer-modal-backdrop"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="prayer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="prayer-modal-header">
              <div>
                <span>PRAYER REQUEST</span>
                <h2>Request Details</h2>
              </div>

              <button type="button" onClick={() => setSelectedRequest(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="prayer-modal-body">
              <div className="prayer-request-profile">
                <div className="prayer-profile-avatar">
                  <FontAwesomeIcon icon={faUser} />
                </div>

                <div>
                  <span>Submitted by</span>

                  <h3>{selectedRequest.memberName}</h3>

                  <small>Member #{selectedRequest.memberId}</small>
                </div>
              </div>

              <div className="prayer-detail-grid">
                <div>
                  <span>Submitted</span>
                  <strong>
                    {formatDateTime(selectedRequest.submittedDate)}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <div
                    className={`prayer-detail-status ${getStatusClass(
                      selectedRequest.status,
                    )}`}
                  >
                    <FontAwesomeIcon
                      icon={getStatusIcon(selectedRequest.status)}
                    />

                    {selectedRequest.status}
                  </div>
                </div>

                <div>
                  <span>Reviewed By</span>

                  <strong>
                    {selectedRequest.reviewedByUsername || "Not reviewed"}
                  </strong>
                </div>

                <div>
                  <span>Reviewed At</span>

                  <strong>
                    {selectedRequest.reviewedAt
                      ? formatDateTime(selectedRequest.reviewedAt)
                      : "Not reviewed"}
                  </strong>
                </div>
              </div>

              <div className="prayer-content-section">
                <span>Prayer Request</span>

                <div className="prayer-content">
                  {selectedRequest.requestText}
                </div>
              </div>

              <div className="prayer-modal-footer">
                <button
                  type="button"
                  className="prayer-secondary-button"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>

                {canDelete && (
                  <button
                    type="button"
                    className="prayer-danger-button"
                    onClick={() => handleDelete(selectedRequest)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrayerRequests;
