import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faPeopleGroup,
  faMagnifyingGlass,
  faPlus,
  faPen,
  faEye,
  faTrash,
  faPhone,
  faLocationDot,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function Families() {
  const { user, accessToken } = useAuth();

  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedFamily, setSelectedFamily] = useState(null);

  const [form, setForm] = useState({
    familyName: "",
    address: "",
    contactNumber: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const canManageFamilies =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  useEffect(() => {
    loadFamilies();
  }, []);

  async function loadFamilies() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getFamilies(accessToken);

      setFamilies(data || []);
    } catch (error) {
      console.error("Failed to load families:", error);
      setError(error.message || "Unable to load families.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreateModal() {
    setSelectedFamily(null);

    setForm({
      familyName: "",
      address: "",
      contactNumber: "",
    });

    setFormError("");
    setShowModal(true);
  }

  function openEditModal(family) {
    setSelectedFamily(family);

    setForm({
      familyName: family.familyName || "",
      address: family.address || "",
      contactNumber: family.contactNumber || "",
    });

    setFormError("");
    setShowModal(true);
  }

  function openViewModal(family) {
    setSelectedFamily(family);
    setShowViewModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setSelectedFamily(null);
    setFormError("");
  }

  function closeViewModal() {
    setShowViewModal(false);
    setSelectedFamily(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setSaving(true);

    const payload = {
      familyName: form.familyName.trim(),
      address: form.address.trim() || null,
      contactNumber: form.contactNumber.trim() || null,
    };

    try {
      if (selectedFamily) {
        await api.updateFamily(selectedFamily.familyId, payload, accessToken);
      } else {
        await api.createFamily(payload, accessToken);
      }

      closeModal();
      await loadFamilies();
    } catch (error) {
      console.error("Failed to save family:", error);

      setFormError(error.message || "Unable to save family.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(family) {
    const confirmed = window.confirm(
      `Delete the ${family.familyName} family?\n\nMembers will not be deleted, but they will no longer be linked to this family.`,
    );

    if (!confirmed) return;

    try {
      await api.deleteFamily(family.familyId, accessToken);

      await loadFamilies();
    } catch (error) {
      console.error("Failed to delete family:", error);

      setError(error.message || "Unable to delete family.");
    }
  }

  const filteredFamilies = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return families;
    }

    return families.filter((family) =>
      [family.familyName, family.address, family.contactNumber]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value)),
    );
  }, [families, search]);

  const totalMembers = families.reduce(
    (total, family) => total + (family.memberCount || 0),
    0,
  );

  return (
    <section className="families-page">
      {/* HEADER */}
      <div className="families-header">
        <div>
          <p className="families-eyebrow">PEOPLE</p>

          <h1>Families</h1>

          <p>Manage church families and their household information.</p>
        </div>

        {canManageFamilies && (
          <button
            type="button"
            className="families-primary-button"
            onClick={openCreateModal}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Family
          </button>
        )}
      </div>

      {/* SUMMARY */}
      <div className="families-summary">
        <div className="families-summary-card">
          <div className="families-summary-icon">
            <FontAwesomeIcon icon={faPeopleGroup} />
          </div>

          <div>
            <span>TOTAL FAMILIES</span>
            <strong>{families.length}</strong>
          </div>
        </div>

        <div className="families-summary-card">
          <div className="families-summary-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>

          <div>
            <span>MEMBERS IN FAMILIES</span>
            <strong>{totalMembers}</strong>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="families-error">
          <strong>Unable to load families</strong>
          <span>{error}</span>

          <button type="button" onClick={loadFamilies}>
            Try Again
          </button>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="families-toolbar">
        <div className="families-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search families..."
          />
        </div>

        <span className="families-result-count">
          {filteredFamilies.length}{" "}
          {filteredFamilies.length === 1 ? "family" : "families"}
        </span>
      </div>

      {/* TABLE */}
      <div className="families-table-card">
        {loading ? (
          <div className="families-loading">
            <FontAwesomeIcon icon={faPeopleGroup} spin />
            <span>Loading families...</span>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className="families-empty">
            <div>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </div>

            <h3>{search ? "No families found" : "No families yet"}</h3>

            <p>
              {search
                ? "Try adjusting your search."
                : "Create your first family to get started."}
            </p>

            {!search && canManageFamilies && (
              <button
                type="button"
                onClick={openCreateModal}
                className="families-primary-button"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Family
              </button>
            )}
          </div>
        ) : (
          <div className="families-table-wrapper">
            <table className="families-table">
              <thead>
                <tr>
                  <th>FAMILY</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>MEMBERS</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredFamilies.map((family) => (
                  <tr key={family.familyId}>
                    <td>
                      <div className="family-name-cell">
                        <div className="family-avatar">
                          <FontAwesomeIcon icon={faPeopleGroup} />
                        </div>

                        <div>
                          <strong>{family.familyName}</strong>

                          <span>Family #{family.familyId}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {family.contactNumber ? (
                        <div className="family-contact">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{family.contactNumber}</span>
                        </div>
                      ) : (
                        <span className="family-muted">No contact number</span>
                      )}
                    </td>

                    <td>
                      {family.address ? (
                        <div className="family-address">
                          <FontAwesomeIcon icon={faLocationDot} />
                          <span>{family.address}</span>
                        </div>
                      ) : (
                        <span className="family-muted">No address</span>
                      )}
                    </td>

                    <td>
                      <span className="family-member-count">
                        <FontAwesomeIcon icon={faUsers} />
                        {family.memberCount}
                      </span>
                    </td>

                    <td>
                      <div className="family-actions">
                        <button
                          type="button"
                          title="View family"
                          onClick={() => openViewModal(family)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {canManageFamilies && (
                          <>
                            <button
                              type="button"
                              title="Edit family"
                              onClick={() => openEditModal(family)}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>

                            <button
                              type="button"
                              title="Delete family"
                              className="danger"
                              onClick={() => handleDelete(family)}
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="family-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="family-modal">
            <div className="family-modal-header">
              <div>
                <p>{selectedFamily ? "EDIT FAMILY" : "NEW FAMILY"}</p>

                <h2>{selectedFamily ? "Edit family" : "Add family"}</h2>
              </div>

              <button type="button" onClick={closeModal} disabled={saving}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && <div className="family-form-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="family-form-group">
                <label htmlFor="familyName">Family Name</label>

                <input
                  id="familyName"
                  name="familyName"
                  type="text"
                  value={form.familyName}
                  onChange={handleChange}
                  placeholder="e.g. Lephoto Family"
                  maxLength={150}
                  required
                  autoFocus
                />
              </div>

              <div className="family-form-group">
                <label htmlFor="address">Address</label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter family address"
                  maxLength={255}
                  rows={3}
                />
              </div>

              <div className="family-form-group">
                <label htmlFor="contactNumber">Contact Number</label>

                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 082 123 4567"
                  maxLength={30}
                />
              </div>

              <div className="family-modal-actions">
                <button
                  type="button"
                  className="family-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="families-primary-button"
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faPlus} />

                  {saving
                    ? "Saving..."
                    : selectedFamily
                      ? "Save Changes"
                      : "Create Family"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedFamily && (
        <div
          className="family-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeViewModal();
            }
          }}
        >
          <div className="family-modal">
            <div className="family-modal-header">
              <div>
                <p>FAMILY DETAILS</p>
                <h2>{selectedFamily.familyName}</h2>
              </div>

              <button type="button" onClick={closeViewModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="family-details">
              <div className="family-detail-card">
                <span>MEMBERS</span>
                <strong>{selectedFamily.memberCount}</strong>
              </div>

              <div className="family-detail-row">
                <span>Family ID</span>
                <strong>#{selectedFamily.familyId}</strong>
              </div>

              <div className="family-detail-row">
                <span>Contact Number</span>
                <strong>
                  {selectedFamily.contactNumber || "Not provided"}
                </strong>
              </div>

              <div className="family-detail-row">
                <span>Address</span>
                <strong>{selectedFamily.address || "Not provided"}</strong>
              </div>
            </div>

            <div className="family-modal-actions">
              <button
                type="button"
                className="family-cancel-button"
                onClick={closeViewModal}
              >
                Close
              </button>

              {canManageFamilies && (
                <button
                  type="button"
                  className="families-primary-button"
                  onClick={() => {
                    closeViewModal();
                    openEditModal(selectedFamily);
                  }}
                >
                  <FontAwesomeIcon icon={faPen} />
                  Edit Family
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Families;
