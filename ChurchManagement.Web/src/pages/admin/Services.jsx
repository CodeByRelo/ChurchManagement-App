import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faPlus,
  faMagnifyingGlass,
  faRotate,
  faXmark,
  faEye,
  faPen,
  faTrash,
  faCheck,
  faLocationDot,
  faCalendarDays,
  faCircleInfo,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Services() {
  const { user, accessToken } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [form, setForm] = useState({
    name: "",
    day: "",
    time: "",
    location: "",
    description: "",
  });

  const canManage =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !term ||
        service.name?.toLowerCase().includes(term) ||
        service.day?.toLowerCase().includes(term) ||
        service.time?.toLowerCase().includes(term) ||
        service.location?.toLowerCase().includes(term);

      const matchesDay = dayFilter === "All" || service.day === dayFilter;

      return matchesSearch && matchesDay;
    });
  }, [services, search, dayFilter]);

  const uniqueDays = useMemo(() => {
    return [...new Set(services.map((service) => service.day))]
      .filter(Boolean)
      .sort();
  }, [services]);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getServices(accessToken);
      setServices(data);
    } catch (error) {
      setError(error.message || "Failed to load church services.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      name: "",
      day: "",
      time: "",
      location: "",
      description: "",
    });

    setFormError("");
    setModal("create");
  }

  function openView(service) {
    setSelectedService(service);
    setFormError("");
    setModal("view");
  }

  function openEdit(service) {
    setSelectedService(service);

    setForm({
      name: service.name || "",
      day: service.day || "",
      time: service.time || "",
      location: service.location || "",
      description: service.description || "",
    });

    setFormError("");
    setModal("edit");
  }

  function closeModal() {
    if (submitting) return;

    setModal(null);
    setSelectedService(null);
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
      name: form.name.trim(),
      day: form.day.trim(),
      time: form.time.trim(),
      location: form.location.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      if (modal === "create") {
        await api.createService(payload, accessToken);
      } else {
        await api.updateService(
          selectedService.serviceId,
          payload,
          accessToken,
        );
      }

      await loadServices();
      closeModal();
    } catch (error) {
      setFormError(
        error.message ||
          `Failed to ${modal === "create" ? "create" : "update"} the service.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(service) {
    const confirmed = window.confirm(`Delete "${service.name}"?`);

    if (!confirmed) return;

    try {
      await api.deleteService(service.serviceId, accessToken);

      setServices((current) =>
        current.filter((item) => item.serviceId !== service.serviceId),
      );

      if (selectedService?.serviceId === service.serviceId) {
        closeModal();
      }
    } catch (error) {
      setError(error.message || "Failed to delete the service.");
    }
  }

  if (!canManage) {
    return (
      <section className="services-page">
        <div className="services-empty">
          <div className="services-empty-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>

          <h3>Access restricted</h3>

          <p>You do not have permission to manage church services.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="services-page">
      {/* HEADER */}
      <div className="services-header">
        <div>
          <p className="admin-eyebrow">CHURCH MANAGEMENT</p>

          <h1>Services</h1>

          <p>Manage the church's regular services and weekly schedule.</p>
        </div>

        <button
          type="button"
          className="services-primary-button"
          onClick={openCreate}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Service
        </button>
      </div>

      {/* SUMMARY */}
      <div className="services-summary">
        <div className="services-summary-card">
          <div className="services-summary-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>

          <div>
            <span>TOTAL SERVICES</span>
            <strong>{services.length}</strong>
          </div>
        </div>

        <div className="services-summary-card">
          <div className="services-summary-icon">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>

          <div>
            <span>DAYS COVERED</span>
            <strong>{uniqueDays.length}</strong>
          </div>
        </div>

        <div className="services-summary-card">
          <div className="services-summary-icon">
            <FontAwesomeIcon icon={faLocationDot} />
          </div>

          <div>
            <span>LOCATIONS</span>
            <strong>
              {
                new Set(
                  services.map((service) => service.location).filter(Boolean),
                ).size
              }
            </strong>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="services-error">
          <div>
            <strong>Something went wrong.</strong>
            <span>{error}</span>
          </div>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="services-toolbar">
        <div className="services-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services..."
          />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="services-filter">
          <FontAwesomeIcon icon={faCalendarDays} />

          <select
            value={dayFilter}
            onChange={(event) => setDayFilter(event.target.value)}
          >
            <option value="All">All Days</option>

            {uniqueDays.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <FontAwesomeIcon icon={faChevronDown} className="select-arrow" />
        </div>

        <button
          type="button"
          className="services-refresh"
          onClick={loadServices}
          disabled={loading}
          title="Refresh"
        >
          <FontAwesomeIcon icon={faRotate} spin={loading} />
        </button>
      </div>

      {/* TABLE */}
      <div className="services-table-card">
        {loading ? (
          <div className="services-loading">
            <FontAwesomeIcon icon={faRotate} spin />

            <span>Loading services...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="services-empty">
            <div className="services-empty-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>

            <h3>
              {search || dayFilter !== "All"
                ? "No services found"
                : "No services yet"}
            </h3>

            <p>
              {search || dayFilter !== "All"
                ? "Try adjusting your search or filter."
                : "Add your first church service to get started."}
            </p>

            {!search && dayFilter === "All" && (
              <button type="button" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} />
                Add Service
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="services-table-wrapper">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>SERVICE</th>
                    <th>DAY</th>
                    <th>TIME</th>
                    <th>LOCATION</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.map((service) => (
                    <tr key={service.serviceId}>
                      <td>
                        <div className="service-name-cell">
                          <div className="service-avatar">
                            <FontAwesomeIcon icon={faClock} />
                          </div>

                          <div>
                            <strong>{service.name}</strong>

                            {service.description && (
                              <span>{service.description}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="service-day">{service.day}</span>
                      </td>

                      <td>
                        <div className="service-time">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{service.time}</span>
                        </div>
                      </td>

                      <td>
                        <div className="service-location">
                          <FontAwesomeIcon icon={faLocationDot} />

                          <span>{service.location || "Not specified"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="services-actions">
                          <button
                            type="button"
                            title="View"
                            onClick={() => openView(service)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEdit(service)}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            className="danger"
                            onClick={() => handleDelete(service)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="services-result-count">
              Showing <strong>{filteredServices.length}</strong> of{" "}
              <strong>{services.length}</strong> services
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {(modal === "create" || modal === "edit") && (
        <div
          className="services-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="services-modal services-form-modal">
            <div className="services-modal-header">
              <div>
                <p>{modal === "create" ? "NEW SERVICE" : "EDIT SERVICE"}</p>

                <h2>
                  {modal === "create"
                    ? "Add church service"
                    : "Edit church service"}
                </h2>
              </div>

              <button type="button" onClick={closeModal} disabled={submitting}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formError && (
              <div className="services-form-error">{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="services-form-grid">
                <div className="services-form-group services-form-full">
                  <label htmlFor="name">Service Name</label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Sunday Worship Service"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="services-form-group">
                  <label htmlFor="day">Day</label>

                  <div className="services-select">
                    <select
                      id="day"
                      name="day"
                      value={form.day}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select day...</option>

                      <option value="Sunday">Sunday</option>

                      <option value="Monday">Monday</option>

                      <option value="Tuesday">Tuesday</option>

                      <option value="Wednesday">Wednesday</option>

                      <option value="Thursday">Thursday</option>

                      <option value="Friday">Friday</option>

                      <option value="Saturday">Saturday</option>
                    </select>

                    <FontAwesomeIcon icon={faChevronDown} />
                  </div>
                </div>

                <div className="services-form-group">
                  <label htmlFor="time">Time</label>

                  <input
                    id="time"
                    name="time"
                    type="text"
                    value={form.time}
                    onChange={handleFormChange}
                    placeholder="e.g. 10:00"
                    maxLength={50}
                    required
                  />
                </div>

                <div className="services-form-group services-form-full">
                  <label htmlFor="location">Location</label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Main Church"
                    maxLength={200}
                  />
                </div>

                <div className="services-form-group services-form-full">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Add a short description..."
                    rows="4"
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="services-form-note">
                <FontAwesomeIcon icon={faCircleInfo} />

                <span>
                  Services added here are also displayed on the public church
                  website.
                </span>
              </div>

              <div className="services-modal-footer">
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
                      ? "Create Service"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modal === "view" && selectedService && (
        <div
          className="services-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="services-modal">
            <div className="services-modal-header">
              <div>
                <p>CHURCH SERVICE</p>

                <h2>{selectedService.name}</h2>
              </div>

              <button type="button" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="service-profile">
              <div className="service-profile-icon">
                <FontAwesomeIcon icon={faClock} />
              </div>

              <div>
                <strong>{selectedService.name}</strong>

                <span>
                  {selectedService.day} · {selectedService.time}
                </span>
              </div>
            </div>

            <div className="service-details-grid">
              <div>
                <span>DAY</span>
                <strong>{selectedService.day}</strong>
              </div>

              <div>
                <span>TIME</span>
                <strong>{selectedService.time}</strong>
              </div>

              <div>
                <span>LOCATION</span>
                <strong>{selectedService.location || "Not specified"}</strong>
              </div>

              <div>
                <span>SERVICE ID</span>
                <strong>#{selectedService.serviceId}</strong>
              </div>
            </div>

            {selectedService.description && (
              <div className="service-description">
                <span>DESCRIPTION</span>

                <p>{selectedService.description}</p>
              </div>
            )}

            <div className="services-modal-footer">
              <button type="button" onClick={closeModal}>
                Close
              </button>

              <button
                type="button"
                className="modal-primary"
                onClick={() => openEdit(selectedService)}
              >
                <FontAwesomeIcon icon={faPen} />
                Edit Service
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Services;
