import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faMagnifyingGlass,
  faFilter,
  faPen,
  faEye,
  faUserSlash,
  faRotate,
  faXmark,
  faCheck,
  faEnvelope,
  faPhone,
  faPeopleGroup,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function Members() {
  const { user, accessToken } = useAuth();

  const canManageMembers =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familiesLoading, setFamiliesLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [selectedMember, setSelectedMember] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    familyId: "",
    userId: "",
    membershipStatus: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadMembers();
    loadFamilies();
  }, []);

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getMembers(accessToken);

      setMembers(data);
    } catch (error) {
      console.error(error);
      setError(error.message || "Unable to load members.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFamilies() {
    try {
      setFamiliesLoading(true);

      const data = await api.getFamilies(accessToken);

      setFamilies(data || []);
    } catch (error) {
      console.error("Failed to load families:", error);
    } finally {
      setFamiliesLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query) ||
        member.familyName?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || member.membershipStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  function openCreate() {
    setEditingMember(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(member) {
    setEditingMember(member);
    setForm({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      phone: member.phone || "",
      dateOfBirth: member.dateOfBirth
        ? member.dateOfBirth.substring(0, 10)
        : "",
      familyId: member.familyId || "",
      userId: member.userId || "",
      membershipStatus: member.membershipStatus || "Active",
    });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    if (submitting) return;

    setShowForm(false);
    setEditingMember(null);
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
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      dateOfBirth: form.dateOfBirth
        ? new Date(form.dateOfBirth).toISOString()
        : null,
      familyId: form.familyId ? Number(form.familyId) : null,
      userId: form.userId ? Number(form.userId) : null,
      membershipStatus: form.membershipStatus,
    };

    try {
      if (editingMember) {
        const updated = await api.updateMember(
          editingMember.memberId,
          payload,
          accessToken,
        );

        setMembers((current) =>
          current.map((member) =>
            member.memberId === editingMember.memberId ? updated : member,
          ),
        );
      } else {
        const created = await api.createMember(
          {
            ...payload,
          },
          accessToken,
        );

        setMembers((current) => [...current, created]);
      }

      closeForm();
    } catch (error) {
      setFormError(error.message || "Unable to save member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(member) {
    const confirmed = window.confirm(
      `Deactivate ${member.firstName} ${member.lastName}?`,
    );

    if (!confirmed) return;

    try {
      await api.deactivateMember(member.memberId, accessToken);

      setMembers((current) =>
        current.map((item) =>
          item.memberId === member.memberId
            ? {
                ...item,
                membershipStatus: "Inactive",
              }
            : item,
        ),
      );

      if (selectedMember?.memberId === member.memberId) {
        setSelectedMember({
          ...member,
          membershipStatus: "Inactive",
        });
      }
    } catch (error) {
      setError(error.message || "Unable to deactivate member.");
    }
  }

  function openView(member) {
    setSelectedMember(member);
  }

  function closeView() {
    setSelectedMember(null);
  }

  const activeCount = members.filter(
    (member) => member.membershipStatus === "Active",
  ).length;

  const inactiveCount = members.filter(
    (member) => member.membershipStatus === "Inactive",
  ).length;

  return (
    <section className="members-page">
      {/* HEADER */}

      <div className="members-header">
        <div>
          <p className="dashboard-eyebrow">PEOPLE</p>

          <h1>Members</h1>

          <p>Manage your church membership and member information.</p>
        </div>

        {canManageMembers && (
          <button
            type="button"
            className="members-primary-button"
            onClick={openCreate}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            Add Member
          </button>
        )}
      </div>

      {/* SUMMARY */}

      <div className="members-summary">
        <div>
          <span>TOTAL MEMBERS</span>
          <strong>{members.length}</strong>
        </div>

        <div>
          <span>ACTIVE</span>
          <strong>{activeCount}</strong>
        </div>

        <div>
          <span>INACTIVE</span>
          <strong>{inactiveCount}</strong>
        </div>
      </div>

      {/* TOOLBAR */}

      <div className="members-toolbar">
        <div className="members-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="members-filter">
          <FontAwesomeIcon icon={faFilter} />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <FontAwesomeIcon className="select-arrow" icon={faChevronDown} />
        </div>

        <button
          type="button"
          className="members-refresh"
          onClick={loadMembers}
          disabled={loading}
          title="Refresh members"
        >
          <FontAwesomeIcon icon={faRotate} spin={loading} />
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="members-error">
          <span>{error}</span>

          <button type="button" onClick={loadMembers}>
            Try Again
          </button>
        </div>
      )}

      {/* TABLE */}

      <div className="members-table-card">
        {loading ? (
          <div className="members-loading">
            <FontAwesomeIcon icon={faRotate} spin />

            <span>Loading members...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="members-empty">
            <div>
              <FontAwesomeIcon icon={faUsers} />
            </div>

            <h3>
              {search || statusFilter !== "All"
                ? "No members found"
                : "No members yet"}
            </h3>

            <p>
              {search || statusFilter !== "All"
                ? "Try changing your search or filter."
                : "Add your first member to get started."}
            </p>

            {!search && statusFilter === "All" && canManageMembers && (
              <button type="button" onClick={openCreate}>
                <FontAwesomeIcon icon={faUserPlus} />
                Add Member
              </button>
            )}
          </div>
        ) : (
          <div className="members-table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>CONTACT</th>
                  <th>FAMILY</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.memberId}>
                    <td>
                      <div className="member-name-cell">
                        <div className="member-avatar">
                          {member.firstName?.charAt(0).toUpperCase()}
                          {member.lastName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {member.firstName} {member.lastName}
                          </strong>

                          <span>#{member.memberId}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="member-contact-cell">
                        <span>
                          <FontAwesomeIcon icon={faEnvelope} />
                          {member.email}
                        </span>

                        {member.phone && (
                          <span>
                            <FontAwesomeIcon icon={faPhone} />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {member.familyName ? (
                        <span className="family-badge">
                          <FontAwesomeIcon icon={faPeopleGroup} />
                          {member.familyName}
                        </span>
                      ) : (
                        <span className="muted">No family</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`member-status ${member.membershipStatus?.toLowerCase()}`}
                      >
                        <span />
                        {member.membershipStatus}
                      </span>
                    </td>

                    <td>
                      <span className="joined-date">
                        {new Date(member.createdAt).toLocaleDateString(
                          "en-ZA",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </td>

                    <td>
                      <div className="member-actions">
                        <button
                          type="button"
                          title="View member"
                          onClick={() => openView(member)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {canManageMembers && (
                          <>
                            <button
                              type="button"
                              title="Edit member"
                              onClick={() => openEdit(member)}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>

                            {member.membershipStatus === "Active" && (
                              <button
                                type="button"
                                className="danger"
                                title="Deactivate member"
                                onClick={() => handleDeactivate(member)}
                              >
                                <FontAwesomeIcon icon={faUserSlash} />
                              </button>
                            )}
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

      {/* RESULT COUNT */}

      {!loading && filteredMembers.length > 0 && (
        <div className="members-result-count">
          Showing <strong>{filteredMembers.length}</strong> of{" "}
          <strong>{members.length}</strong> members
        </div>
      )}

      {/* VIEW MODAL */}

      {selectedMember && (
        <div
          className="member-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeView();
            }
          }}
        >
          <div className="member-modal">
            <div className="member-modal-header">
              <div>
                <p>MEMBER PROFILE</p>
                <h2>
                  {selectedMember.firstName} {selectedMember.lastName}
                </h2>
              </div>

              <button type="button" onClick={closeView}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="member-profile">
              <div className="member-profile-avatar">
                {selectedMember.firstName?.charAt(0).toUpperCase()}
                {selectedMember.lastName?.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>
                  {selectedMember.firstName} {selectedMember.lastName}
                </strong>

                <span>Member #{selectedMember.memberId}</span>
              </div>
            </div>

            <div className="member-details-grid">
              <div>
                <span>EMAIL</span>
                <strong>{selectedMember.email}</strong>
              </div>

              <div>
                <span>PHONE</span>
                <strong>{selectedMember.phone || "Not provided"}</strong>
              </div>

              <div>
                <span>DATE OF BIRTH</span>
                <strong>
                  {selectedMember.dateOfBirth
                    ? new Date(selectedMember.dateOfBirth).toLocaleDateString(
                        "en-ZA",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "Not provided"}
                </strong>
              </div>

              <div>
                <span>FAMILY</span>
                <strong>{selectedMember.familyName || "Not assigned"}</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>{selectedMember.membershipStatus}</strong>
              </div>

              <div>
                <span>MEMBER SINCE</span>
                <strong>
                  {new Date(selectedMember.createdAt).toLocaleDateString(
                    "en-ZA",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </strong>
              </div>
            </div>

            <div className="member-modal-footer">
              <button type="button" onClick={closeView}>
                Close
              </button>

              {canManageMembers && (
                <button
                  type="button"
                  className="modal-primary"
                  onClick={() => {
                    closeView();
                    openEdit(selectedMember);
                  }}
                >
                  <FontAwesomeIcon icon={faPen} />
                  Edit Member
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}

      {showForm && (
        <div
          className="member-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              closeForm();
            }
          }}
        >
          <div className="member-modal member-form-modal">
            <div className="member-modal-header">
              <div>
                <p>{editingMember ? "EDIT MEMBER" : "NEW MEMBER"}</p>

                <h2>{editingMember ? "Update member" : "Add a member"}</h2>
              </div>

              <button type="button" onClick={closeForm} disabled={submitting}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && <div className="member-form-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="member-form-grid">
                <div className="member-form-group">
                  <label htmlFor="firstName">First Name</label>

                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    required
                    maxLength={100}
                    placeholder="First name"
                  />
                </div>

                <div className="member-form-group">
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

                <div className="member-form-group">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                    maxLength={255}
                    placeholder="member@example.com"
                  />
                </div>

                <div className="member-form-group">
                  <label htmlFor="phone">Phone</label>

                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    maxLength={30}
                    placeholder="Phone number"
                  />
                </div>

                <div className="member-form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>

                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="member-form-group">
                  <label htmlFor="membershipStatus">Membership Status</label>

                  <select
                    id="membershipStatus"
                    name="membershipStatus"
                    value={form.membershipStatus}
                    onChange={handleFormChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="member-form-group">
                  <label htmlFor="familyId">Family</label>

                  <select
                    id="familyId"
                    name="familyId"
                    value={form.familyId || ""}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      {familiesLoading
                        ? "Loading families..."
                        : "No family / Not assigned"}
                    </option>

                    {families.map((family) => (
                      <option key={family.familyId} value={family.familyId}>
                        {family.familyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="member-form-group">
                  <label htmlFor="userId">User ID</label>

                  <input
                    id="userId"
                    name="userId"
                    type="number"
                    min="1"
                    value={form.userId}
                    onChange={handleFormChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="member-form-note">
                <FontAwesomeIcon icon={faCheck} />

                <span>
                  New members are automatically created with an Active
                  membership status.
                </span>
              </div>

              <div className="member-modal-footer">
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
                    : editingMember
                      ? "Save Changes"
                      : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Members;
