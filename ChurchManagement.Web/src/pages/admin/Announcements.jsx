import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faRotate,
  faXmark,
  faEye,
  faPen,
  faArchive,
  faCheck,
  faCalendarDays,
  faUser,
  faUsers,
  faChevronDown,
  faCircleInfo,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Announcements() {
  const { user, accessToken } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    publishDate: "",
    targetAudience: "",
    status: "Published",
  });

  const canManage =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  const filteredAnnouncements = useMemo(() => {
    const term = search.trim().toLowerCase();

    return announcements.filter((announcement) => {
      const matchesSearch =
        !term ||
        announcement.title?.toLowerCase().includes(term) ||
        announcement.content?.toLowerCase().includes(term) ||
        announcement.targetAudience
          ?.toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "All" ||
        announcement.status === statusFilter;

      const matchesAudience =
        audienceFilter === "All" ||
        announcement.targetAudience === audienceFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAudience
      );
    });
  }, [
    announcements,
    search,
    statusFilter,
    audienceFilter,
  ]);

  const publishedCount = announcements.filter(
    (announcement) => announcement.status === "Published"
  ).length;

  const draftCount = announcements.filter(
    (announcement) => announcement.status === "Draft"
  ).length;

  const archivedCount = announcements.filter(
    (announcement) => announcement.status === "Archived"
  ).length;

  const audienceOptions = useMemo(() => {
    return [
      ...new Set(
        announcements
          .map((announcement) => announcement.targetAudience)
          .filter(Boolean)
      ),
    ];
  }, [announcements]);

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    loadAnnouncements();
  }, [canManage]);

  async function loadAnnouncements() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getAnnouncementsAdmin(
        accessToken
      );

      setAnnouncements(data);
    } catch (error) {
      setError(
        error.message || "Failed to load announcements."
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      title: "",
      content: "",
      publishDate: toDateTimeLocal(new Date()),
      targetAudience: "",
      status: "Published",
    });

    setFormError("");
    setModal("create");
  }

  function openView(announcement) {
    setSelectedAnnouncement(announcement);
    setFormError("");
    setModal("view");
  }

  function openEdit(announcement) {
    setSelectedAnnouncement(announcement);

    setForm({
      title: announcement.title || "",
      content: announcement.content || "",
      publishDate: toDateTimeLocal(
        announcement.publishDate
      ),
      targetAudience:
        announcement.targetAudience || "",
      status: announcement.status || "Published",
    });

    setFormError("");
    setModal("edit");
  }

  function toDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  }

  function closeModal() {
    if (submitting) return;

    setModal(null);
    setSelectedAnnouncement(null);
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

    if (!form.publishDate) {
      setFormError("Publish date and time are required.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      publishDate: new Date(
        form.publishDate
      ).toISOString(),
      targetAudience:
        form.targetAudience.trim() || null,
    };

    try {
      if (modal === "create") {
        await api.createAnnouncement(
          payload,
          accessToken
        );
      } else {
        await api.updateAnnouncement(
          selectedAnnouncement.announcementId,
          {
            ...payload,
            status: form.status,
          },
          accessToken
        );
      }

      await loadAnnouncements();
      closeModal();
    } catch (error) {
      setFormError(
        error.message ||
          `Failed to ${
            modal === "create"
              ? "create"
              : "update"
          } the announcement.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive(announcement) {
    const confirmed = window.confirm(
      `Archive "${announcement.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.archiveAnnouncement(
        announcement.announcementId,
        accessToken
      );

      setAnnouncements((current) =>
        current.map((item) =>
          item.announcementId ===
          announcement.announcementId
            ? {
                ...item,
                status: "Archived",
              }
            : item
        )
      );

      if (
        selectedAnnouncement?.announcementId ===
        announcement.announcementId
      ) {
        setSelectedAnnouncement({
          ...announcement,
          status: "Archived",
        });
      }
    } catch (error) {
      setError(
        error.message ||
          "Failed to archive announcement."
      );
    }
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(value) {
    return new Date(value).toLocaleString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  if (!canManage) {
    return (
      <section className="announcements-page">
        <div className="announcements-empty">
          <div className="announcements-empty-icon">
            <FontAwesomeIcon icon={faBullhorn} />
          </div>

          <h3>Access restricted</h3>

          <p>
            You do not have permission to manage
            announcements.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="announcements-page">
        <div className="announcements-loading">
          <FontAwesomeIcon icon={faRotate} spin />
          <span>Loading announcements...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="announcements-page">
      <div className="announcements-header">
        <div>
          <p className="admin-eyebrow">
            CHURCH COMMUNICATION
          </p>

          <h1>Announcements</h1>

          <p>
            Create and manage announcements shared
            with the church community.
          </p>
        </div>

        <button
          type="button"
          className="announcements-primary-button"
          onClick={openCreate}
        >
          <FontAwesomeIcon icon={faPlus} />
          New Announcement
        </button>
      </div>

      {error && (
        <div className="announcements-error">
          <div>
            <strong>Something went wrong.</strong>
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      <div className="announcements-summary">
        <div className="announcements-summary-card">
          <div className="announcements-summary-icon">
            <FontAwesomeIcon icon={faBullhorn} />
          </div>

          <div>
            <span>TOTAL</span>
            <strong>{announcements.length}</strong>
          </div>
        </div>

        <div className="announcements-summary-card">
          <div className="announcements-summary-icon published">
            <FontAwesomeIcon icon={faCheck} />
          </div>

          <div>
            <span>PUBLISHED</span>
            <strong>{publishedCount}</strong>
          </div>
        </div>

        <div className="announcements-summary-card">
          <div className="announcements-summary-icon draft">
            <FontAwesomeIcon icon={faFileLines} />
          </div>

          <div>
            <span>DRAFTS</span>
            <strong>{draftCount}</strong>
          </div>
        </div>

        <div className="announcements-summary-card">
          <div className="announcements-summary-icon archived">
            <FontAwesomeIcon icon={faArchive} />
          </div>

          <div>
            <span>ARCHIVED</span>
            <strong>{archivedCount}</strong>
          </div>
        </div>
      </div>

      <div className="announcements-toolbar">
        <div className="announcements-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search announcements..."
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="announcements-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <FontAwesomeIcon
            icon={faChevronDown}
            className="select-arrow"
          />
        </div>

        <div className="announcements-filter">
          <FontAwesomeIcon icon={faUsers} />

          <select
            value={audienceFilter}
            onChange={(event) =>
              setAudienceFilter(event.target.value)
            }
          >
            <option value="All">All Audiences</option>

            {audienceOptions.map((audience) => (
              <option
                key={audience}
                value={audience}
              >
                {audience}
              </option>
            ))}
          </select>

          <FontAwesomeIcon
            icon={faChevronDown}
            className="select-arrow"
          />
        </div>

        <button
          type="button"
          className="announcements-refresh"
          onClick={loadAnnouncements}
          disabled={loading}
          title="Refresh"
        >
          <FontAwesomeIcon
            icon={faRotate}
            spin={loading}
          />
        </button>
      </div>

      <div className="announcements-table-card">
        {filteredAnnouncements.length === 0 ? (
          <div className="announcements-empty">
            <div className="announcements-empty-icon">
              <FontAwesomeIcon icon={faBullhorn} />
            </div>

            <h3>
              {search ||
              statusFilter !== "All" ||
              audienceFilter !== "All"
                ? "No announcements found"
                : "No announcements yet"}
            </h3>

            <p>
              {search ||
              statusFilter !== "All" ||
              audienceFilter !== "All"
                ? "Try adjusting your search or filters."
                : "Create your first announcement to get started."}
            </p>

            {!search &&
              statusFilter === "All" &&
              audienceFilter === "All" && (
                <button
                  type="button"
                  onClick={openCreate}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  New Announcement
                </button>
              )}
          </div>
        ) : (
          <>
            <div className="announcements-table-wrapper">
              <table className="announcements-table">
                <thead>
                  <tr>
                    <th>ANNOUNCEMENT</th>
                    <th>PUBLISH DATE</th>
                    <th>AUDIENCE</th>
                    <th>CREATED BY</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAnnouncements.map(
                    (announcement) => (
                      <tr
                        key={
                          announcement.announcementId
                        }
                      >
                        <td>
                          <div className="announcement-title-cell">
                            <div className="announcement-avatar">
                              <FontAwesomeIcon
                                icon={faBullhorn}
                              />
                            </div>

                            <div>
                              <strong>
                                {announcement.title}
                              </strong>

                              <span>
                                {announcement.content}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="announcement-date-cell">
                            <FontAwesomeIcon
                              icon={faCalendarDays}
                            />

                            <div>
                              <strong>
                                {formatDate(
                                  announcement.publishDate
                                )}
                              </strong>

                              <span>
                                {new Date(
                                  announcement.publishDate
                                ).toLocaleTimeString(
                                  undefined,
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="announcement-audience">
                            <FontAwesomeIcon
                              icon={faUsers}
                            />

                            <span>
                              {announcement.targetAudience ||
                                "Everyone"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="announcement-creator">
                            <FontAwesomeIcon
                              icon={faUser}
                            />

                            <span>
                              {announcement.createdByUsername ||
                                "Administrator"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`announcement-status ${announcement.status.toLowerCase()}`}
                          >
                            {announcement.status}
                          </span>
                        </td>

                        <td>
                          <div className="announcements-actions">
                            <button
                              type="button"
                              title="View"
                              onClick={() =>
                                openView(
                                  announcement
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faEye}
                              />
                            </button>

                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  announcement
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faPen}
                              />
                            </button>

                            {announcement.status !==
                              "Archived" && (
                              <button
                                type="button"
                                title="Archive"
                                className="danger"
                                onClick={() =>
                                  handleArchive(
                                    announcement
                                  )
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faArchive}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="announcements-result-count">
              Showing{" "}
              <strong>
                {filteredAnnouncements.length}
              </strong>{" "}
              of{" "}
              <strong>
                {announcements.length}
              </strong>{" "}
              announcements
            </div>
          </>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <div
          className="announcements-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="announcements-modal announcements-form-modal">
            <div className="announcements-modal-header">
              <div>
                <p>
                  {modal === "create"
                    ? "NEW ANNOUNCEMENT"
                    : "EDIT ANNOUNCEMENT"}
                </p>

                <h2>
                  {modal === "create"
                    ? "Create announcement"
                    : "Edit announcement"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && (
              <div className="announcements-form-error">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="announcements-form-grid">
                <div className="announcements-form-group announcements-form-full">
                  <label htmlFor="title">
                    Announcement Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Sunday Service Update"
                    maxLength={200}
                    required
                  />
                </div>

                <div className="announcements-form-group">
                  <label htmlFor="publishDate">
                    Publish Date & Time
                  </label>

                  <input
                    id="publishDate"
                    name="publishDate"
                    type="datetime-local"
                    value={form.publishDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="announcements-form-group">
                  <label htmlFor="targetAudience">
                    Target Audience
                  </label>

                  <input
                    id="targetAudience"
                    name="targetAudience"
                    type="text"
                    value={form.targetAudience}
                    onChange={handleFormChange}
                    placeholder="e.g. All Members"
                    maxLength={100}
                  />
                </div>

                {modal === "edit" && (
                  <div className="announcements-form-group">
                    <label htmlFor="status">
                      Status
                    </label>

                    <div className="announcements-select">
                      <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                      >
                        <option value="Draft">
                          Draft
                        </option>

                        <option value="Published">
                          Published
                        </option>

                        <option value="Archived">
                          Archived
                        </option>
                      </select>

                      <FontAwesomeIcon
                        icon={faChevronDown}
                      />
                    </div>
                  </div>
                )}

                <div className="announcements-form-group announcements-form-full">
                  <label htmlFor="content">
                    Announcement Content
                  </label>

                  <textarea
                    id="content"
                    name="content"
                    value={form.content}
                    onChange={handleFormChange}
                    placeholder="Write the announcement..."
                    rows="7"
                    maxLength={5000}
                    required
                  />

                  <span className="announcements-character-count">
                    {form.content.length} / 5000
                  </span>
                </div>
              </div>

              <div className="announcements-form-note">
                <FontAwesomeIcon icon={faCircleInfo} />

                <span>
                  New announcements are created as
                  published. You can change the status
                  after creating the announcement.
                </span>
              </div>

              <div className="announcements-modal-footer">
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
                    ? "Create Announcement"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" &&
        selectedAnnouncement && (
          <div
            className="announcements-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div className="announcements-modal">
              <div className="announcements-modal-header">
                <div>
                  <p>CHURCH ANNOUNCEMENT</p>

                  <h2>
                    {selectedAnnouncement.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="announcement-profile">
                <div className="announcement-profile-icon">
                  <FontAwesomeIcon
                    icon={faBullhorn}
                  />
                </div>

                <div>
                  <strong>
                    {selectedAnnouncement.title}
                  </strong>

                  <span>
                    {formatDateTime(
                      selectedAnnouncement.publishDate
                    )}
                  </span>
                </div>
              </div>

              <div className="announcement-details-grid">
                <div>
                  <span>STATUS</span>

                  <strong
                    className={`announcement-detail-status ${selectedAnnouncement.status.toLowerCase()}`}
                  >
                    {selectedAnnouncement.status}
                  </strong>
                </div>

                <div>
                  <span>TARGET AUDIENCE</span>

                  <strong>
                    {selectedAnnouncement.targetAudience ||
                      "Everyone"}
                  </strong>
                </div>

                <div>
                  <span>CREATED BY</span>

                  <strong>
                    {selectedAnnouncement.createdByUsername ||
                      "Administrator"}
                  </strong>
                </div>

                <div>
                  <span>PUBLISHED</span>

                  <strong>
                    {formatDateTime(
                      selectedAnnouncement.publishDate
                    )}
                  </strong>
                </div>
              </div>

              <div className="announcement-content">
                <span>CONTENT</span>

                <p>
                  {selectedAnnouncement.content}
                </p>
              </div>

              <div className="announcements-modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="modal-primary"
                  onClick={() =>
                    openEdit(
                      selectedAnnouncement
                    )
                  }
                >
                  <FontAwesomeIcon icon={faPen} />
                  Edit Announcement
                </button>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}

export default Announcements;