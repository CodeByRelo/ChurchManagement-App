import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faListCheck,
  faPlus,
  faPen,
  faTrash,
  faEye,
  faMagnifyingGlass,
  faFilter,
  faXmark,
  faUserShield,
  faClock,
  faGlobe,
  faCircleInfo,
  faCircleCheck,
  faTriangleExclamation,
  faArrowRight,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AuditLogs() {
  const { accessToken } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getAuditLogs(accessToken);

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesSearch =
        !searchValue ||
        log.username?.toLowerCase().includes(searchValue) ||
        log.action?.toLowerCase().includes(searchValue) ||
        log.entityName?.toLowerCase().includes(searchValue) ||
        log.description?.toLowerCase().includes(searchValue) ||
        log.ipAddress?.toLowerCase().includes(searchValue);

      const matchesAction =
        actionFilter === "all" ||
        log.action?.toLowerCase() === actionFilter.toLowerCase();

      const matchesEntity =
        entityFilter === "all" ||
        log.entityName?.toLowerCase() === entityFilter.toLowerCase();

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, search, actionFilter, entityFilter]);

  const today = new Date();

  const todayLogs = logs.filter((log) => {
    const date = new Date(log.timestamp);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  });

  const createCount = logs.filter(
    (log) => log.action?.toLowerCase() === "create",
  ).length;

  const updateCount = logs.filter(
    (log) => log.action?.toLowerCase() === "update",
  ).length;

  const deleteCount = logs.filter(
    (log) => log.action?.toLowerCase() === "delete",
  ).length;

  const uniqueEntities = useMemo(() => {
    return [...new Set(logs.map((log) => log.entityName).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [logs]);

  const uniqueActions = useMemo(() => {
    return [...new Set(logs.map((log) => log.action).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [logs]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";

    const date = new Date(timestamp);

    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    const date = new Date(timestamp);

    return new Intl.DateTimeFormat("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getActionClass = (action) => {
    const value = action?.toLowerCase();

    if (value === "create") return "action-create";
    if (value === "update") return "action-update";
    if (value === "delete") return "action-delete";

    return "action-default";
  };

  const getActionIcon = (action) => {
    const value = action?.toLowerCase();

    if (value === "create") return faPlus;
    if (value === "update") return faPen;
    if (value === "delete") return faTrash;

    return faCircleInfo;
  };

  return (
    <div className="audit-logs-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <FontAwesomeIcon icon={faUserShield} />
            SYSTEM SECURITY
          </div>

          <h1>Audit Logs</h1>

          <p>
            Review system activity and track important account and data changes.
          </p>
        </div>

        <div className="audit-header-status">
          <span className="live-dot"></span>
          Activity monitoring
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="audit-alert error">
          <FontAwesomeIcon icon={faTriangleExclamation} />

          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="audit-summary">
        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <FontAwesomeIcon icon={faClipboardList} />
          </div>

          <div>
            <span>Total Activity</span>
            <strong>{logs.length}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>

          <div>
            <span>Today</span>
            <strong>{todayLogs.length}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <FontAwesomeIcon icon={faPlus} />
          </div>

          <div>
            <span>Created</span>
            <strong>{createCount}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <FontAwesomeIcon icon={faPen} />
          </div>

          <div>
            <span>Updated</span>
            <strong>{updateCount}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <FontAwesomeIcon icon={faTrash} />
          </div>

          <div>
            <span>Deleted</span>
            <strong>{deleteCount}</strong>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="audit-card">
        {/* TOOLBAR */}
        <div className="audit-toolbar">
          <div className="audit-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />

            <input
              type="text"
              placeholder="Search activity, user, entity or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="audit-filters">
            <div className="audit-filter">
              <FontAwesomeIcon icon={faFilter} />

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">All actions</option>

                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="all">All entities</option>

              {uniqueEntities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="audit-empty">
            <div className="audit-loader"></div>
            <p>Loading audit activity...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="audit-empty">
            <FontAwesomeIcon icon={faClipboardList} />

            <h3>No audit activity found</h3>

            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>User</th>
                  <th>Entity</th>
                  <th>Date & Time</th>
                  <th>IP Address</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.auditLogId}>
                    <td>
                      <div className="audit-activity">
                        <div
                          className={`audit-action-icon ${getActionClass(
                            log.action,
                          )}`}
                        >
                          <FontAwesomeIcon icon={getActionIcon(log.action)} />
                        </div>

                        <div>
                          <strong>{log.action}</strong>

                          <span>
                            {log.description || "System activity recorded"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="audit-user">
                        <div className="audit-user-avatar">
                          {log.username
                            ? log.username.charAt(0).toUpperCase()
                            : "S"}
                        </div>

                        <div>
                          <strong>{log.username || "System"}</strong>

                          {log.userId && <span>User #{log.userId}</span>}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="audit-entity">
                        <strong>{log.entityName}</strong>

                        {log.entityId && <span>#{log.entityId}</span>}
                      </div>
                    </td>

                    <td>
                      <div className="audit-date">
                        <strong>{formatDate(log.timestamp)}</strong>

                        <span>
                          {new Date(log.timestamp).toLocaleTimeString("en-ZA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="audit-ip">
                        <FontAwesomeIcon icon={faGlobe} />
                        {log.ipAddress || "—"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="audit-view-button"
                        title="View audit log"
                        onClick={() => setSelectedLog(log)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}
        <div className="audit-footer">
          <span>
            Showing <strong>{filteredLogs.length}</strong> of{" "}
            <strong>{logs.length}</strong> activity records
          </span>

          <span className="audit-footer-secure">
            <FontAwesomeIcon icon={faDatabase} />
            Read-only audit trail
          </span>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedLog && (
        <div
          className="audit-modal-backdrop"
          onClick={() => setSelectedLog(null)}
        >
          <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  <FontAwesomeIcon icon={faClipboardList} />
                  AUDIT RECORD
                </span>

                <h2>Activity Details</h2>

                <p>Detailed information about this system event.</p>
              </div>

              <button type="button" onClick={() => setSelectedLog(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="audit-modal-action">
              <div
                className={`audit-action-icon large ${getActionClass(
                  selectedLog.action,
                )}`}
              >
                <FontAwesomeIcon icon={getActionIcon(selectedLog.action)} />
              </div>

              <div>
                <span>Action</span>
                <strong>{selectedLog.action}</strong>
              </div>
            </div>

            <div className="audit-detail-grid">
              <div className="audit-detail">
                <span>User</span>

                <strong>{selectedLog.username || "System"}</strong>

                {selectedLog.userId && (
                  <small>User #{selectedLog.userId}</small>
                )}
              </div>

              <div className="audit-detail">
                <span>Entity</span>

                <strong>{selectedLog.entityName}</strong>

                {selectedLog.entityId && (
                  <small>Record #{selectedLog.entityId}</small>
                )}
              </div>

              <div className="audit-detail">
                <span>Timestamp</span>

                <strong>{formatDateTime(selectedLog.timestamp)}</strong>
              </div>

              <div className="audit-detail">
                <span>IP Address</span>

                <strong>{selectedLog.ipAddress || "Not recorded"}</strong>
              </div>

              <div className="audit-detail full">
                <span>Description</span>

                <div className="audit-description">
                  {selectedLog.description ||
                    "No additional description was recorded."}
                </div>
              </div>
            </div>

            <div className="audit-modal-footer">
              <div>
                <FontAwesomeIcon icon={faCircleCheck} />

                <span>This record is read-only and cannot be modified.</span>
              </div>

              <button
                type="button"
                className="secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
