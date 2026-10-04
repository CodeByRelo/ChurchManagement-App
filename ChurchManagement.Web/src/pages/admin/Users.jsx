import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faUsers,
  faUserCheck,
  faUserSlash,
  faMagnifyingGlass,
  faFilter,
  faEye,
  faPen,
  faToggleOn,
  faToggleOff,
  faXmark,
  faShieldHalved,
  faEnvelope,
  faCircleCheck,
  faCircleXmark,
  faPlus,
  faLock,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ROLES = [
  {
    id: 1,
    name: "Super Administrator",
  },
  {
    id: 2,
    name: "Church Administrator",
  },
  {
    id: 3,
    name: "Ministry Leader",
  },
  {
    id: 4,
    name: "Member",
  },
];

function Users() {
  const { user, accessToken } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const [savingRole, setSavingRole] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: 4,
    isActive: true,
  });

  const isSuperAdmin =
    user?.roleName === "Super Administrator" ||
    user?.role === "Super Administrator";

  const isChurchAdmin =
    user?.roleName === "Church Administrator" ||
    user?.role === "Church Administrator";

  const canManageStatus = isSuperAdmin || isChurchAdmin;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getUsers(accessToken);

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.username?.toLowerCase().includes(searchValue) ||
        item.email?.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "all" ||
        item.roleName?.toLowerCase() === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter((item) => item.isActive).length;
  const inactiveUsers = users.filter((item) => !item.isActive).length;

  const administratorCount = users.filter(
    (item) =>
      item.roleName === "Super Administrator" ||
      item.roleName === "Church Administrator",
  ).length;

  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNewUser((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetNewUser = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: 4,
      isActive: true,
    });
  };

  const closeAddUserModal = () => {
    if (savingUser) return;

    setShowAddUser(false);
    resetNewUser();
  };

  const handleCreateUser = async () => {
    setError("");

    if (
      !newUser.username.trim() ||
      !newUser.email.trim() ||
      !newUser.password ||
      !newUser.confirmPassword
    ) {
      setError("Please complete all required user fields.");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newUser.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSavingUser(true);

      await api.createUser(
        {
          username: newUser.username.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          confirmPassword: newUser.confirmPassword,
          roleId: Number(newUser.roleId),
          isActive: newUser.isActive,
        },
        accessToken,
      );

      closeAddUserModal();
      await loadUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err.message || "Failed to create user.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!editingRole) return;

    try {
      setSavingRole(true);
      setError("");

      await api.updateUserRole(
        editingRole.userId,
        Number(editingRole.roleId),
        accessToken,
      );

      setEditingRole(null);
      await loadUsers();
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError(err.message || "Failed to update user role.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      setSavingStatus(true);
      setError("");

      await api.updateUserStatus(item.userId, !item.isActive, accessToken);

      if (selectedUser?.userId === item.userId) {
        setSelectedUser({
          ...selectedUser,
          isActive: !item.isActive,
        });
      }

      await loadUsers();
    } catch (err) {
      console.error("Failed to update user status:", err);
      setError(err.message || "Failed to update user status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const getInitials = (username) => {
    if (!username) return "U";

    return username
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleClass = (role) => {
    if (role === "Super Administrator") return "role-super";
    if (role === "Church Administrator") return "role-admin";
    if (role === "Ministry Leader") return "role-leader";
    return "role-member";
  };

  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <FontAwesomeIcon icon={faUserShield} />
            SYSTEM USERS
          </div>

          <h1>Users</h1>

          <p>Manage user accounts, roles and account access.</p>
        </div>

        <div className="page-header-actions">
          {isSuperAdmin && (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setError("");
                setShowAddUser(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="users-alert error">
          <FontAwesomeIcon icon={faCircleXmark} />

          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="users-summary">
        <div className="user-stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserSlash} />
          </div>

          <div>
            <span>Inactive</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>

          <div>
            <span>Administrators</span>
            <strong>{administratorCount}</strong>
          </div>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="users-card">
        {/* TOOLBAR */}
        <div className="users-toolbar">
          <div className="users-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />

            <input
              type="text"
              placeholder="Search username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="users-filters">
            <div className="filter-control">
              <FontAwesomeIcon icon={faFilter} />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>

                {ROLES.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="users-empty">
            <div className="users-loader"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-empty">
            <FontAwesomeIcon icon={faUsers} />

            <h3>No users found</h3>

            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Account ID</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.userId}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {getInitials(item.username)}
                        </div>

                        <div>
                          <strong>{item.username}</strong>

                          <span>
                            <FontAwesomeIcon icon={faEnvelope} />
                            {item.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`role-badge ${getRoleClass(item.roleName)}`}
                      >
                        <FontAwesomeIcon icon={faShieldHalved} />
                        {item.roleName || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          item.isActive
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        <span className="status-dot"></span>

                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <span className="user-id">#{item.userId}</span>
                    </td>

                    <td>
                      <div className="user-actions">
                        <button
                          type="button"
                          className="icon-action"
                          title="View user"
                          onClick={() => setSelectedUser(item)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {isSuperAdmin && (
                          <button
                            type="button"
                            className="icon-action"
                            title="Change role"
                            onClick={() =>
                              setEditingRole({
                                ...item,
                                roleId: item.roleId,
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                        )}

                        {canManageStatus && (
                          <button
                            type="button"
                            className={`icon-action ${
                              item.isActive ? "danger" : "success"
                            }`}
                            title={
                              item.isActive
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            disabled={savingStatus}
                            onClick={() => handleStatusToggle(item)}
                          >
                            <FontAwesomeIcon
                              icon={item.isActive ? faToggleOn : faToggleOff}
                            />
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

        <div className="users-footer">
          Showing <strong>{filteredUsers.length}</strong> of{" "}
          <strong>{users.length}</strong> users
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddUser && (
        <div className="users-modal-backdrop" onClick={closeAddUserModal}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  <FontAwesomeIcon icon={faUserPlus} />
                  NEW ACCOUNT
                </span>

                <h2>Add User</h2>

                <p>
                  Create a new account and assign the appropriate access level.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddUserModal}
                disabled={savingUser}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="user-create-form">
              <div className="form-group">
                <label htmlFor="new-username">Username</label>

                <input
                  id="new-username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={newUser.username}
                  onChange={handleNewUserChange}
                  disabled={savingUser}
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-email">Email Address</label>

                <input
                  id="new-email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  disabled={savingUser}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-role">Role</label>

                <select
                  id="new-role"
                  name="roleId"
                  value={newUser.roleId}
                  onChange={handleNewUserChange}
                  disabled={savingUser}
                >
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new-password">Password</label>

                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} />

                    <input
                      id="new-password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={newUser.password}
                      onChange={handleNewUserChange}
                      disabled={savingUser}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new-confirm-password">Confirm Password</label>

                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} />

                    <input
                      id="new-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={newUser.confirmPassword}
                      onChange={handleNewUserChange}
                      disabled={savingUser}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newUser.isActive}
                  onChange={handleNewUserChange}
                  disabled={savingUser}
                />

                <span>
                  <strong>Activate account</strong>
                  <small>The user will be able to sign in immediately.</small>
                </span>
              </label>
            </div>

            <div className="role-warning">
              <FontAwesomeIcon icon={faShieldHalved} />

              <p>
                Make sure the selected role matches the user's responsibilities.
                Roles control what the account can access.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={closeAddUserModal}
                disabled={savingUser}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleCreateUser}
                disabled={savingUser}
              >
                <FontAwesomeIcon icon={faUserPlus} />

                {savingUser ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedUser && (
        <div
          className="users-modal-backdrop"
          onClick={() => setSelectedUser(null)}
        >
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">USER ACCOUNT</span>

                <h2>User Details</h2>
              </div>

              <button type="button" onClick={() => setSelectedUser(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="modal-profile">
              <div className="modal-avatar">
                {getInitials(selectedUser.username)}
              </div>

              <div>
                <h3>{selectedUser.username}</h3>
                <p>{selectedUser.email}</p>
              </div>
            </div>

            <div className="user-detail-grid">
              <div className="detail-item">
                <span>Account ID</span>

                <strong>#{selectedUser.userId}</strong>
              </div>

              <div className="detail-item">
                <span>Status</span>

                <strong>
                  <span
                    className={
                      selectedUser.isActive
                        ? "detail-status active"
                        : "detail-status inactive"
                    }
                  >
                    <FontAwesomeIcon
                      icon={
                        selectedUser.isActive ? faCircleCheck : faCircleXmark
                      }
                    />

                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </strong>
              </div>

              <div className="detail-item full">
                <span>Role</span>

                <strong>
                  <span
                    className={`role-badge ${getRoleClass(
                      selectedUser.roleName,
                    )}`}
                  >
                    <FontAwesomeIcon icon={faShieldHalved} />

                    {selectedUser.roleName}
                  </span>
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              {canManageStatus && (
                <button
                  type="button"
                  className={
                    selectedUser.isActive
                      ? "secondary danger-button"
                      : "primary-button"
                  }
                  disabled={savingStatus}
                  onClick={() => handleStatusToggle(selectedUser)}
                >
                  <FontAwesomeIcon
                    icon={selectedUser.isActive ? faToggleOff : faToggleOn}
                  />

                  {selectedUser.isActive
                    ? "Deactivate Account"
                    : "Activate Account"}
                </button>
              )}

              <button
                type="button"
                className="secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {editingRole && (
        <div
          className="users-modal-backdrop"
          onClick={() => setEditingRole(null)}
        >
          <div
            className="users-modal small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">ACCESS CONTROL</span>

                <h2>Change User Role</h2>
              </div>

              <button type="button" onClick={() => setEditingRole(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="role-edit-user">
              <div className="modal-avatar">
                {getInitials(editingRole.username)}
              </div>

              <div>
                <strong>{editingRole.username}</strong>
                <span>{editingRole.email}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>

              <select
                value={editingRole.roleId}
                onChange={(e) =>
                  setEditingRole({
                    ...editingRole,
                    roleId: Number(e.target.value),
                  })
                }
              >
                {ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="role-warning">
              <FontAwesomeIcon icon={faShieldHalved} />

              <p>
                Changing a user's role changes the permissions available to that
                account.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setEditingRole(null)}
                disabled={savingRole}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleRoleUpdate}
                disabled={savingRole}
              >
                <FontAwesomeIcon icon={faPen} />

                {savingRole ? "Saving..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
