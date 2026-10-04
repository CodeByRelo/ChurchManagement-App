import { useEffect, useMemo, useState } from "react";
import {
  faArrowUpRightFromSquare,
  faCircleInfo,
  faEye,
  faFileLines,
  faFilter,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faRotate,
  faTrash,
  faVideo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Media() {
  const { user, accessToken } = useAuth();

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const [form, setForm] = useState({
    title: "",
    mediaType: "Sermon",
    url: "",
    publishDate: "",
    description: "",
  });

  const canManage =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getMedia();

      setMedia(data || []);
    } catch (err) {
      setError(err.message || "Failed to load media.");
    } finally {
      setLoading(false);
    }
  }

  const mediaTypes = useMemo(() => {
    const types = media.map((item) => item.mediaType).filter(Boolean);

    return [...new Set(types)].sort();
  }, [media]);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const value = search.toLowerCase().trim();

      const matchesSearch =
        !value ||
        item.title?.toLowerCase().includes(value) ||
        item.description?.toLowerCase().includes(value);

      const matchesType = typeFilter === "All" || item.mediaType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [media, search, typeFilter]);

  const summary = useMemo(() => {
    return {
      total: media.length,
      sermons: media.filter(
        (item) => item.mediaType?.toLowerCase() === "sermon",
      ).length,
      videos: media.filter((item) => item.mediaType?.toLowerCase() === "video")
        .length,
      other: media.filter((item) => {
        const type = item.mediaType?.toLowerCase();

        return type !== "sermon" && type !== "video";
      }).length,
    };
  }, [media]);

  function resetForm() {
    setForm({
      title: "",
      mediaType: "Sermon",
      url: "",
      publishDate: toDateTimeLocal(new Date()),
      description: "",
    });

    setFormError("");
  }

  function openCreate() {
    resetForm();
    setSelectedMedia(null);
    setModal("create");
  }

  function openEdit(item) {
    setSelectedMedia(item);

    setForm({
      title: item.title || "",
      mediaType: item.mediaType || "Sermon",
      url: item.url || "",
      publishDate: toDateTimeLocal(item.publishDate),
      description: item.description || "",
    });

    setFormError("");
    setModal("edit");
  }

  function openView(item) {
    setSelectedMedia(item);
    setModal("view");
  }

  function closeModal() {
    if (submitting) return;

    setModal(null);
    setSelectedMedia(null);
    setFormError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toDateTimeLocal(date) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const offset = parsed.getTimezoneOffset();

    const localDate = new Date(parsed.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");

    if (!form.title.trim()) {
      setFormError("Please enter a title.");
      return;
    }

    if (!form.mediaType.trim()) {
      setFormError("Please select a media type.");
      return;
    }

    if (!form.url.trim()) {
      setFormError("Please enter a media URL.");
      return;
    }

    if (!form.publishDate) {
      setFormError("Please select a publish date.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      mediaType: form.mediaType.trim(),
      url: form.url.trim(),
      publishDate: new Date(form.publishDate).toISOString(),
      description: form.description.trim() || null,
    };

    try {
      setSubmitting(true);

      if (modal === "create") {
        const created = await api.createMedia(payload, accessToken);

        setMedia((current) => [created, ...current]);
      } else {
        const updated = await api.updateMedia(
          selectedMedia.mediaId,
          payload,
          accessToken,
        );

        setMedia((current) =>
          current.map((item) =>
            item.mediaId === selectedMedia.mediaId ? updated : item,
          ),
        );
      }

      closeModal();
    } catch (err) {
      setFormError(err.message || "Failed to save media item.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Delete "${item.title}"?`);

    if (!confirmed) return;

    try {
      setError("");

      await api.deleteMedia(item.mediaId, accessToken);

      setMedia((current) =>
        current.filter((mediaItem) => mediaItem.mediaId !== item.mediaId),
      );

      if (selectedMedia?.mediaId === item.mediaId) {
        closeModal();
      }
    } catch (err) {
      setError(err.message || "Failed to delete media item.");
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

  function getMediaIcon(type) {
    return type?.toLowerCase() === "sermon" ? faFileLines : faVideo;
  }

  return (
    <div className="media-page">
      <div className="media-header">
        <div>
          <div className="media-eyebrow">WEBSITE</div>

          <h1>Media</h1>

          <p>Manage sermons, videos and other church media displayed online.</p>
        </div>

        <div className="media-header-actions">
          <button
            type="button"
            className="media-refresh-button"
            onClick={loadMedia}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRotate} />
            Refresh
          </button>

          {canManage && (
            <button
              type="button"
              className="media-primary-button"
              onClick={openCreate}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Media
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="media-error">
          <FontAwesomeIcon icon={faCircleInfo} />

          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      <div className="media-summary">
        <div className="media-summary-card">
          <div className="media-summary-icon">
            <FontAwesomeIcon icon={faVideo} />
          </div>

          <div>
            <span>Total Media</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="media-summary-card">
          <div className="media-summary-icon sermon">
            <FontAwesomeIcon icon={faFileLines} />
          </div>

          <div>
            <span>Sermons</span>
            <strong>{summary.sermons}</strong>
          </div>
        </div>

        <div className="media-summary-card">
          <div className="media-summary-icon video">
            <FontAwesomeIcon icon={faVideo} />
          </div>

          <div>
            <span>Videos</span>
            <strong>{summary.videos}</strong>
          </div>
        </div>

        <div className="media-summary-card">
          <div className="media-summary-icon other">
            <FontAwesomeIcon icon={faCircleInfo} />
          </div>

          <div>
            <span>Other</span>
            <strong>{summary.other}</strong>
          </div>
        </div>
      </div>

      <div className="media-toolbar">
        <div className="media-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="media-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="All">All media types</option>

            {mediaTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="media-table-card">
        {loading ? (
          <div className="media-loading">
            <FontAwesomeIcon icon={faRotate} spin />

            <span>Loading media...</span>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="media-empty">
            <div>
              <FontAwesomeIcon icon={faVideo} />
            </div>

            <h3>No media found</h3>

            <p>Add media or change your search and filters.</p>

            {canManage && (
              <button type="button" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} />
                Add Media
              </button>
            )}
          </div>
        ) : (
          <div className="media-table-wrapper">
            <table className="media-table">
              <thead>
                <tr>
                  <th>MEDIA</th>
                  <th>TYPE</th>
                  <th>PUBLISHED</th>
                  <th>DESCRIPTION</th>
                  <th className="media-actions-heading">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.mediaId}>
                    <td>
                      <div className="media-title-cell">
                        <div className="media-avatar">
                          <FontAwesomeIcon
                            icon={getMediaIcon(item.mediaType)}
                          />
                        </div>

                        <div>
                          <strong>{item.title}</strong>

                          <span>Media #{item.mediaId}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="media-type">{item.mediaType}</span>
                    </td>

                    <td>
                      <span className="media-date">
                        {formatDate(item.publishDate)}
                      </span>
                    </td>

                    <td>
                      <div className="media-description">
                        {item.description || "No description"}
                      </div>
                    </td>

                    <td>
                      <div className="media-actions">
                        <button
                          type="button"
                          className="media-action-button view"
                          title="View media"
                          onClick={() => openView(item)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              className="media-action-button edit"
                              title="Edit media"
                              onClick={() => openEdit(item)}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>

                            <button
                              type="button"
                              className="media-action-button delete"
                              title="Delete media"
                              onClick={() => handleDelete(item)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </>
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

      {/* CREATE / EDIT */}
      {(modal === "create" || modal === "edit") && (
        <div className="media-modal-backdrop" onClick={closeModal}>
          <div
            className="media-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="media-modal-header">
              <div>
                <span>{modal === "create" ? "NEW MEDIA" : "EDIT MEDIA"}</span>

                <h2>{modal === "create" ? "Add Media" : "Edit Media"}</h2>
              </div>

              <button type="button" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="media-form">
              {formError && (
                <div className="media-form-error">
                  <FontAwesomeIcon icon={faCircleInfo} />

                  {formError}
                </div>
              )}

              <div className="media-form-grid">
                <div className="media-form-group full">
                  <label htmlFor="title">Title</label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    maxLength="200"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Sunday Morning Sermon"
                    required
                  />
                </div>

                <div className="media-form-group">
                  <label htmlFor="mediaType">Media Type</label>

                  <select
                    id="mediaType"
                    name="mediaType"
                    value={form.mediaType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Sermon">Sermon</option>

                    <option value="Video">Video</option>

                    <option value="Audio">Audio</option>

                    <option value="Livestream">Livestream</option>

                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="media-form-group">
                  <label htmlFor="publishDate">Publish Date</label>

                  <input
                    id="publishDate"
                    name="publishDate"
                    type="datetime-local"
                    value={form.publishDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="media-form-group full">
                  <label htmlFor="url">Media URL</label>

                  <input
                    id="url"
                    name="url"
                    type="url"
                    maxLength="1000"
                    value={form.url}
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                  />

                  <small>
                    Paste the public link to the sermon, video or media item.
                  </small>
                </div>

                <div className="media-form-group full">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    maxLength="2000"
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional description..."
                  />

                  <small>{form.description.length}/2000</small>
                </div>
              </div>

              <div className="media-modal-footer">
                <button
                  type="button"
                  className="media-secondary-button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="media-primary-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faRotate} spin />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={modal === "create" ? faPlus : faPen}
                      />

                      {modal === "create" ? "Add Media" : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW */}
      {modal === "view" && selectedMedia && (
        <div className="media-modal-backdrop" onClick={closeModal}>
          <div
            className="media-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="media-modal-header">
              <div>
                <span>MEDIA DETAILS</span>
                <h2>{selectedMedia.title}</h2>
              </div>

              <button type="button" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="media-view-body">
              <div className="media-view-profile">
                <div className="media-view-icon">
                  <FontAwesomeIcon
                    icon={getMediaIcon(selectedMedia.mediaType)}
                  />
                </div>

                <div>
                  <span>{selectedMedia.mediaType}</span>

                  <h3>{selectedMedia.title}</h3>
                </div>
              </div>

              <div className="media-detail-grid">
                <div>
                  <span>Published</span>

                  <strong>{formatDateTime(selectedMedia.publishDate)}</strong>
                </div>

                <div>
                  <span>Media ID</span>

                  <strong>#{selectedMedia.mediaId}</strong>
                </div>
              </div>

              <div className="media-view-section">
                <span>URL</span>

                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="media-url"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />

                  {selectedMedia.url}
                </a>
              </div>

              <div className="media-view-section">
                <span>Description</span>

                <div className="media-view-description">
                  {selectedMedia.description || "No description provided."}
                </div>
              </div>

              <div className="media-modal-footer">
                <button
                  type="button"
                  className="media-secondary-button"
                  onClick={closeModal}
                >
                  Close
                </button>

                {canManage && (
                  <>
                    <button
                      type="button"
                      className="media-danger-button"
                      onClick={() => handleDelete(selectedMedia)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>

                    <button
                      type="button"
                      className="media-primary-button"
                      onClick={() => openEdit(selectedMedia)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Media;
