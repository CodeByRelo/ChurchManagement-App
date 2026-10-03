import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChurch,
  faPlus,
  faMagnifyingGlass,
  faRotate,
  faXmark,
  faPen,
  faEye,
  faTrash,
  faUsers,
  faUserPlus,
  faUserMinus,
  faCheck,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Ministries() {
  const { user, accessToken } = useAuth();

  const [ministries, setMinistries] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedMinistry, setSelectedMinistry] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    leaderId: "",
  });

  const [selectedMemberId, setSelectedMemberId] = useState("");

  const canManage =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  const canView =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator" ||
    user?.role === "Ministry Leader";

  const filteredMinistries = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return ministries;
    }

    return ministries.filter((ministry) =>
      [ministry.name, ministry.description, ministry.leaderName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [ministries, search]);

  const totalMembers = useMemo(
    () =>
      ministries.reduce((total, ministry) => total + ministry.memberCount, 0),
    [ministries],
  );

  useEffect(() => {
    loadMinistries();
    loadMembers();
  }, []);

  async function loadMinistries() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getMinistries(accessToken);
      setMinistries(data);
    } catch (error) {
      setError(error.message || "Failed to load ministries.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    try {
      const data = await api.getMembers(accessToken);
      setMembers(data);
    } catch {
      // Ministry page can still load without member data.
    }
  }

  async function refresh() {
    await Promise.all([loadMinistries(), loadMembers()]);
  }

  function openCreate() {
    setForm({
      name: "",
      description: "",
      leaderId: "",
    });

    setFormError("");
    setModal("create");
  }

  async function openEdit(ministry) {
    setFormError("");

    try {
      const data = await api.getMinistry(ministry.ministryId, accessToken);

      setSelectedMinistry(data);

      setForm({
        name: data.name || "",
        description: data.description || "",
        leaderId: data.leaderId || "",
      });

      setModal("edit");
    } catch (error) {
      setError(error.message || "Failed to load ministry.");
    }
  }

  async function openView(ministry) {
    setFormError("");
    setSelectedMemberId("");

    try {
      setMembersLoading(true);

      const [ministryData, memberData] = await Promise.all([
        api.getMinistry(ministry.ministryId, accessToken),
        api.getMinistryMembers(ministry.ministryId, accessToken),
      ]);

      setSelectedMinistry({
        ...ministryData,
        members: memberData,
      });

      setModal("view");
    } catch (error) {
      setError(error.message || "Failed to load ministry.");
    } finally {
      setMembersLoading(false);
    }
  }

  function closeModal() {
    if (submitting) return;

    setModal(null);
    setSelectedMinistry(null);
    setFormError("");
    setSelectedMemberId("");
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
      name: form.name.trim(),
      description: form.description.trim() || null,
      leaderId: form.leaderId ? Number(form.leaderId) : null,
    };

    try {
      if (modal === "create") {
        await api.createMinistry(payload, accessToken);
      } else {
        await api.updateMinistry(
          selectedMinistry.ministryId,
          payload,
          accessToken,
        );
      }

      await loadMinistries();
      closeModal();
    } catch (error) {
      setFormError(error.message || "Failed to save ministry.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(ministry) {
    const confirmed = window.confirm(
      `Delete "${ministry.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.deleteMinistry(ministry.ministryId, accessToken);

      await loadMinistries();

      if (selectedMinistry?.ministryId === ministry.ministryId) {
        closeModal();
      }
    } catch (error) {
      setError(error.message || "Failed to delete ministry.");
    }
  }

  async function handleAddMember() {
    if (!selectedMemberId || !selectedMinistry) return;

    setFormError("");
    setSubmitting(true);

    try {
      await api.addMinistryMember(
        selectedMinistry.ministryId,
        selectedMemberId,
        accessToken,
      );

      const updatedMembers = await api.getMinistryMembers(
        selectedMinistry.ministryId,
        accessToken,
      );

      const updatedMinistry = await api.getMinistry(
        selectedMinistry.ministryId,
        accessToken,
      );

      setSelectedMinistry({
        ...updatedMinistry,
        members: updatedMembers,
      });

      setSelectedMemberId("");

      await loadMinistries();
    } catch (error) {
      setFormError(error.message || "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveMember(memberId) {
    if (!selectedMinistry) return;

    const confirmed = window.confirm("Remove this member from the ministry?");

    if (!confirmed) return;

    setFormError("");
    setSubmitting(true);

    try {
      await api.removeMinistryMember(
        selectedMinistry.ministryId,
        memberId,
        accessToken,
      );

      const updatedMembers = await api.getMinistryMembers(
        selectedMinistry.ministryId,
        accessToken,
      );

      const updatedMinistry = await api.getMinistry(
        selectedMinistry.ministryId,
        accessToken,
      );

      setSelectedMinistry({
        ...updatedMinistry,
        members: updatedMembers,
      });

      await loadMinistries();
    } catch (error) {
      setFormError(error.message || "Failed to remove member.");
    } finally {
      setSubmitting(false);
    }
  }

  const availableMembers = members.filter(
    (member) =>
      !selectedMinistry?.members?.some(
        (existing) => existing.memberId === member.memberId,
      ),
  );

  if (!canView) {
    return (
      <section className="ministries-page">
        <div className="ministries-empty">
          <div>
            <FontAwesomeIcon icon={faChurch} />
          </div>
          <h3>Access restricted</h3>
          <p>You do not have permission to view ministries.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="ministries-page">
      {/* HEADER */}
      <div className="ministries-header">
        <div>
          <p className="admin-eyebrow">CHURCH MANAGEMENT</p>
          <h1>Ministries</h1>
          <p>Manage church ministries, leaders and members.</p>
        </div>

        {canManage && (
          <button
            type="button"
            className="ministries-primary-button"
            onClick={openCreate}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Ministry
          </button>
        )}
      </div>

      {/* SUMMARY */}
      <div className="ministries-summary">
        <div className="ministries-summary-card">
          <div className="ministries-summary-icon">
            <FontAwesomeIcon icon={faChurch} />
          </div>
          <div>
            <span>MINISTRIES</span>
            <strong>{ministries.length}</strong>
          </div>
        </div>

        <div className="ministries-summary-card">
          <div className="ministries-summary-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <span>TOTAL MEMBERS</span>
            <strong>{totalMembers}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="ministries-error">
          <strong>Something went wrong.</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="ministries-toolbar">
        <div className="ministries-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ministries..."
          />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="ministries-refresh"
          onClick={refresh}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRotate} />
        </button>
      </div>

      {/* TABLE */}
      <div className="ministries-table-card">
        {loading ? (
          <div className="ministries-loading">
            <FontAwesomeIcon icon={faRotate} spin />
            <span>Loading ministries...</span>
          </div>
        ) : filteredMinistries.length === 0 ? (
          <div className="ministries-empty">
            <div>
              <FontAwesomeIcon icon={faChurch} />
            </div>

            <h3>{search ? "No ministries found" : "No ministries yet"}</h3>

            <p>
              {search
                ? "Try adjusting your search."
                : "Create your first ministry to get started."}
            </p>

            {!search && canManage && (
              <button type="button" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} />
                Add Ministry
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="ministries-table-wrapper">
              <table className="ministries-table">
                <thead>
                  <tr>
                    <th>MINISTRY</th>
                    <th>LEADER</th>
                    <th>MEMBERS</th>
                    <th>DESCRIPTION</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMinistries.map((ministry) => (
                    <tr key={ministry.ministryId}>
                      <td>
                        <div className="ministry-name-cell">
                          <div className="ministry-avatar">
                            <FontAwesomeIcon icon={faChurch} />
                          </div>

                          <div>
                            <strong>{ministry.name}</strong>
                            <span>Ministry #{ministry.ministryId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="ministry-leader">
                          {ministry.leaderName || "Not assigned"}
                        </span>
                      </td>

                      <td>
                        <span className="ministry-member-count">
                          <FontAwesomeIcon icon={faUsers} />
                          {ministry.memberCount}
                        </span>
                      </td>

                      <td>
                        <span className="ministry-description">
                          {ministry.description || "No description"}
                        </span>
                      </td>

                      <td>
                        <div className="ministry-actions">
                          <button
                            type="button"
                            title="View"
                            onClick={() => openView(ministry)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                title="Edit"
                                onClick={() => openEdit(ministry)}
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                className="danger"
                                onClick={() => handleDelete(ministry)}
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

            <div className="ministries-result-count">
              Showing <strong>{filteredMinistries.length}</strong> of{" "}
              <strong>{ministries.length}</strong> ministries
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT */}
      {(modal === "create" || modal === "edit") && (
        <div
          className="ministry-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="ministry-modal ministry-form-modal">
            <div className="ministry-modal-header">
              <div>
                <p>{modal === "create" ? "NEW MINISTRY" : "EDIT MINISTRY"}</p>

                <h2>
                  {modal === "create" ? "Create ministry" : "Update ministry"}
                </h2>
              </div>

              <button type="button" onClick={closeModal} disabled={submitting}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && (
              <div className="ministry-form-error">{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="ministry-form-grid">
                <div className="ministry-form-group ministry-form-full">
                  <label htmlFor="name">Ministry Name</label>

                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Youth Ministry"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="ministry-form-group ministry-form-full">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Briefly describe the ministry..."
                    maxLength={1000}
                  />
                </div>

                <div className="ministry-form-group ministry-form-full">
                  <label htmlFor="leaderId">Ministry Leader</label>

                  <div className="ministry-select">
                    <select
                      id="leaderId"
                      name="leaderId"
                      value={form.leaderId}
                      onChange={handleFormChange}
                    >
                      <option value="">No leader assigned</option>

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
              </div>

              <div className="ministry-modal-footer">
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
                    ? "Saving..."
                    : modal === "create"
                      ? "Create Ministry"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW */}
      {modal === "view" && selectedMinistry && (
        <div
          className="ministry-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="ministry-modal">
            <div className="ministry-modal-header">
              <div>
                <p>MINISTRY DETAILS</p>
                <h2>{selectedMinistry.name}</h2>
              </div>

              <button type="button" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && (
              <div className="ministry-form-error">{formError}</div>
            )}

            <div className="ministry-profile">
              <div className="ministry-profile-icon">
                <FontAwesomeIcon icon={faChurch} />
              </div>

              <div>
                <strong>{selectedMinistry.name}</strong>

                <span>
                  {selectedMinistry.leaderName
                    ? `Led by ${selectedMinistry.leaderName}`
                    : "No leader assigned"}
                </span>
              </div>
            </div>

            <div className="ministry-details-grid">
              <div>
                <span>DESCRIPTION</span>
                <strong>
                  {selectedMinistry.description || "No description provided."}
                </strong>
              </div>

              <div>
                <span>MEMBERS</span>
                <strong>{selectedMinistry.memberCount}</strong>
              </div>

              <div>
                <span>CREATED</span>
                <strong>
                  {new Date(selectedMinistry.createdAt).toLocaleDateString()}
                </strong>
              </div>

              <div>
                <span>LAST UPDATED</span>
                <strong>
                  {new Date(selectedMinistry.updatedAt).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div className="ministry-members-section">
              <div className="ministry-section-heading">
                <div>
                  <p>MINISTRY MEMBERS</p>
                  <h3>
                    {selectedMinistry.memberCount} member
                    {selectedMinistry.memberCount !== 1 ? "s" : ""}
                  </h3>
                </div>
              </div>

              {canView && (
                <div className="ministry-add-member">
                  <div className="ministry-select">
                    <select
                      value={selectedMemberId}
                      onChange={(event) =>
                        setSelectedMemberId(event.target.value)
                      }
                    >
                      <option value="">Select a member...</option>

                      {availableMembers.map((member) => (
                        <option key={member.memberId} value={member.memberId}>
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                    </select>

                    <FontAwesomeIcon icon={faChevronDown} />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!selectedMemberId || submitting}
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Add
                  </button>
                </div>
              )}

              {membersLoading ? (
                <div className="ministry-members-loading">
                  <FontAwesomeIcon icon={faRotate} spin />
                  Loading members...
                </div>
              ) : selectedMinistry.members?.length === 0 ? (
                <div className="ministry-members-empty">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>No members have been added yet.</span>
                </div>
              ) : (
                <div className="ministry-member-list">
                  {selectedMinistry.members?.map((member) => (
                    <div className="ministry-member-row" key={member.memberId}>
                      <div className="ministry-member-avatar">
                        {member.firstName.charAt(0).toUpperCase()}
                      </div>

                      <div className="ministry-member-info">
                        <strong>
                          {member.firstName} {member.lastName}
                        </strong>
                        <span>{member.email}</span>
                      </div>

                      <div className="ministry-member-joined">
                        Joined{" "}
                        {new Date(member.joinedDate).toLocaleDateString()}
                      </div>

                      <button
                        type="button"
                        className="ministry-remove-member"
                        title="Remove member"
                        onClick={() => handleRemoveMember(member.memberId)}
                        disabled={submitting}
                      >
                        <FontAwesomeIcon icon={faUserMinus} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ministry-modal-footer">
              <button type="button" onClick={closeModal}>
                Close
              </button>

              {canManage && (
                <button
                  type="button"
                  className="modal-primary"
                  onClick={() => openEdit(selectedMinistry)}
                >
                  <FontAwesomeIcon icon={faPen} />
                  Edit Ministry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Ministries;
