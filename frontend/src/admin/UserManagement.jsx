import { useCallback, useEffect, useState, useRef } from "react";
import { get, post, put, del } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

const ICONS = {
  users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

function UserModal({ user, onClose, onSave, currentUser }) {
  const closeRef = useRef(null);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    is_superuser: user?.is_superuser || false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleSubmit = e => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!user && !formData.password) newErrors.password = "Password is required for new users";
    if (formData.password && formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const isCurrentUser = currentUser && user && user.id === currentUser.id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="user-title">{user ? "Edit User" : "Add New User"}</h2>
            <p>{user ? "Update user information" : "Create a new admin user"}</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
              placeholder="username"
              disabled={!!user}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
            {user && <small className="form-hint">Username cannot be changed</small>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password {!user ? "*" : "(leave blank to keep current)"}</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Minimum 8 characters"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_superuser"
                checked={formData.is_superuser}
                onChange={handleChange}
                disabled={isCurrentUser}
              />
              <span>Superuser (full system access)</span>
            </label>
            {isCurrentUser && <small className="form-hint">Cannot change your own superuser status</small>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/users/");
      setUsers(data);
      // Get current user from token
      const token = localStorage.getItem("access_token");
      if (token) {
        const profile = await get("/profile/");
        setCurrentUser(profile);
      }
    } catch (err) {
      const msg = err.message || "Failed to load users";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = async userData => {
    setIsSubmitting(true);
    try {
      if (editingUser && editingUser.id) {
        await put(`/admin/users/${editingUser.id}/`, userData);
        addToast("User updated successfully", "success");
      } else {
        await post("/admin/users/", userData);
        addToast("User created successfully", "success");
      }
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const msg = err.message || "Failed to save user";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async user => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) return;
    try {
      await del(`/admin/users/${user.id}/`);
      addToast("User deleted successfully", "success");
      fetchUsers();
    } catch (err) {
      const msg = err.message || "Failed to delete user";
      addToast(msg, "error");
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage admin users and their permissions</p>
      </div>

      <div className="admin-toolbar">
        <button type="button" className="btn-primary" onClick={() => setEditingUser({})}>
          <Icon d={ICONS.add} />
          Add User
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skel-row">
                <span /><span /><span /><span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <span className="empty-icon"><Icon d={ICONS.warn} /></span>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchUsers}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="cell-main">{user.username}</span>
                        {currentUser && user.id === currentUser.id && (
                          <span className="badge badge-soft" style={{ fontSize: "0.7rem" }}>You</span>
                        )}
                      </div>
                    </td>
                    <td>{user.email || "-"}</td>
                    <td>
                      <span className={`badge ${user.is_superuser ? "badge-director" : "badge-adviser"}`}>
                        {user.is_superuser ? "Superuser" : "Admin"}
                      </span>
                    </td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap" }}>
                      {formatDate(user.date_joined)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${user.username}`}
                          onClick={() => setEditingUser(user)}
                        >
                          <Icon d={ICONS.edit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete ${user.username}`}
                          onClick={() => handleDelete(user)}
                          disabled={currentUser && user.id === currentUser.id}
                          style={{ opacity: currentUser && user.id === currentUser.id ? 0.5 : 1 }}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.users} /></span>
                <p>No admin users found</p>
              </div>
            )}
          </>
        )}
      </div>

      {editingUser && (
        <UserModal
          user={editingUser.id !== undefined ? editingUser : null}
          currentUser={currentUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
