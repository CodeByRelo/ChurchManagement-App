import { useEffect, useState } from "react";
import {
  faChurch,
  faCircleCheck,
  faCircleExclamation,
  faFloppyDisk,
  faGlobe,
  faLocationDot,
  faPhone,
  faEnvelope,
  faEye,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function ChurchInformation() {
  const { user, accessToken } = useAuth();

  const [churchInfo, setChurchInfo] = useState(null);
  const [form, setForm] = useState({
    name: "",
    history: "",
    vision: "",
    mission: "",
    contactNumber: "",
    email: "",
    address: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canEdit =
    user?.role === "Super Administrator" ||
    user?.role === "Church Administrator";

  useEffect(() => {
    loadChurchInfo();
  }, []);

  const loadChurchInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getChurchInfo();

      setChurchInfo(data);

      setForm({
        name: data.name || "",
        history: data.history || "",
        vision: data.vision || "",
        mission: data.mission || "",
        contactNumber: data.contactNumber || "",
        email: data.email || "",
        address: data.address || "",
        website: data.website || "",
      });
    } catch (err) {
      // A 404 simply means the church information has not been configured yet.
      if (err.message?.toLowerCase().includes("not configured")) {
        setChurchInfo(null);
      } else {
        setError(err.message || "Failed to load church information.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) return;

    if (!form.name.trim()) {
      setError("Church name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await api.updateChurchInfo(
        {
          name: form.name.trim(),
          history: form.history.trim() || null,
          vision: form.vision.trim() || null,
          mission: form.mission.trim() || null,
          contactNumber: form.contactNumber.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          website: form.website.trim() || null,
        },
        accessToken,
      );

      setChurchInfo(updated);

      setForm({
        name: updated.name || "",
        history: updated.history || "",
        vision: updated.vision || "",
        mission: updated.mission || "",
        contactNumber: updated.contactNumber || "",
        email: updated.email || "",
        address: updated.address || "",
        website: updated.website || "",
      });

      setSuccess("Church information updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      setError(err.message || "Failed to update church information.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <FontAwesomeIcon icon={faChurch} spin />
          <span>Loading church information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page church-info-page">
      {/* PAGE HEADER */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            <FontAwesomeIcon icon={faChurch} />
            Website Information
          </div>

          <h1>Church Information</h1>

          <p>
            Manage the church details displayed across the website and member
            experience.
          </p>
        </div>

        <div className="church-info-status">
          <span className={churchInfo ? "status-dot active" : "status-dot"}>
            <FontAwesomeIcon
              icon={churchInfo ? faCircleCheck : faCircleExclamation}
            />
          </span>

          <div>
            <strong>{churchInfo ? "Configured" : "Not configured"}</strong>
            <small>
              {churchInfo
                ? "Church profile is available"
                : "Complete the church profile"}
            </small>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="admin-alert success">
          <FontAwesomeIcon icon={faCircleCheck} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="admin-alert error">
          <FontAwesomeIcon icon={faCircleExclamation} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}
        <section className="admin-card church-info-card">
          <div className="admin-card-header">
            <div>
              <h2>Basic Information</h2>
              <p>The main details visitors will see about the church.</p>
            </div>

            <div className="admin-card-icon">
              <FontAwesomeIcon icon={faChurch} />
            </div>
          </div>

          <div className="church-info-grid">
            <div className="admin-form-group full">
              <label htmlFor="name">
                Church Name <span>*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={200}
                disabled={!canEdit}
                placeholder="Enter church name"
              />
            </div>

            <div className="admin-form-group full">
              <label htmlFor="history">History</label>

              <textarea
                id="history"
                name="history"
                value={form.history}
                onChange={handleChange}
                maxLength={5000}
                rows={6}
                disabled={!canEdit}
                placeholder="Tell visitors about the church's history..."
              />

              <small>{form.history.length}/5000</small>
            </div>
          </div>
        </section>

        {/* VISION + MISSION */}
        <section className="admin-card church-info-card">
          <div className="admin-card-header">
            <div>
              <h2>Vision & Mission</h2>
              <p>Define the church's purpose and direction.</p>
            </div>

            <div className="admin-card-icon">
              <FontAwesomeIcon icon={faEye} />
            </div>
          </div>

          <div className="church-info-grid two-column">
            <div className="admin-form-group">
              <label htmlFor="vision">Vision</label>

              <textarea
                id="vision"
                name="vision"
                value={form.vision}
                onChange={handleChange}
                maxLength={2000}
                rows={7}
                disabled={!canEdit}
                placeholder="Enter the church vision..."
              />

              <small>{form.vision.length}/2000</small>
            </div>

            <div className="admin-form-group">
              <label htmlFor="mission">Mission</label>

              <textarea
                id="mission"
                name="mission"
                value={form.mission}
                onChange={handleChange}
                maxLength={2000}
                rows={7}
                disabled={!canEdit}
                placeholder="Enter the church mission..."
              />

              <small>{form.mission.length}/2000</small>
            </div>
          </div>
        </section>

        {/* CONTACT INFORMATION */}
        <section className="admin-card church-info-card">
          <div className="admin-card-header">
            <div>
              <h2>Contact Information</h2>
              <p>Details visitors can use to get in touch with the church.</p>
            </div>

            <div className="admin-card-icon">
              <FontAwesomeIcon icon={faPhone} />
            </div>
          </div>

          <div className="church-info-grid two-column">
            <div className="admin-form-group">
              <label htmlFor="contactNumber">
                <FontAwesomeIcon icon={faPhone} />
                Contact Number
              </label>

              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={form.contactNumber}
                onChange={handleChange}
                maxLength={30}
                disabled={!canEdit}
                placeholder="e.g. 071 234 5678"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} />
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                maxLength={255}
                disabled={!canEdit}
                placeholder="church@example.com"
              />
            </div>

            <div className="admin-form-group full">
              <label htmlFor="address">
                <FontAwesomeIcon icon={faLocationDot} />
                Address
              </label>

              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                maxLength={500}
                rows={3}
                disabled={!canEdit}
                placeholder="Enter the church address..."
              />
            </div>

            <div className="admin-form-group full">
              <label htmlFor="website">
                <FontAwesomeIcon icon={faGlobe} />
                Website
              </label>

              <input
                id="website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                maxLength={500}
                disabled={!canEdit}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </section>

        {/* FOOTER ACTION */}
        {canEdit ? (
          <div className="church-info-actions">
            <button
              type="submit"
              className="admin-btn primary"
              disabled={saving}
            >
              <FontAwesomeIcon
                icon={saving ? faPenToSquare : faFloppyDisk}
                spin={saving}
              />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <div className="admin-readonly-notice">
            <FontAwesomeIcon icon={faEye} />
            <span>You have read-only access to church information.</span>
          </div>
        )}
      </form>
    </div>
  );
}
