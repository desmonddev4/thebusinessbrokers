import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { get, post, put, del } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

const ICONS = {
  search: "M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 0 1 1 0-9 4.5 0 0 1 0 9z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  settings: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const VALUE_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "json", label: "JSON" },
];

function SettingModal({ setting, onClose, onSave }) {
  const closeRef = useRef(null);
  const [formData, setFormData] = useState({
    key: setting?.key || "",
    value: setting?.value || "",
    value_type: setting?.value_type || "text",
    description: setting?.description || "",
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
    if (!formData.key.trim()) newErrors.key = "Key is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="setting-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="setting-title">{setting ? "Edit Setting" : "Add New Setting"}</h2>
            <p>{setting ? "Update site setting" : "Create a new site setting"}</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="key">Key *</label>
            <input
              id="key"
              name="key"
              type="text"
              value={formData.key}
              onChange={handleChange}
              className={errors.key ? "error" : ""}
              placeholder="e.g., contact_email, site_url"
              disabled={!!setting}
            />
            {errors.key && <span className="error-text">{errors.key}</span>}
            {setting && <small className="form-hint">Key cannot be changed after creation</small>}
          </div>

          <div className="form-group">
            <label htmlFor="value_type">Value Type</label>
            <select
              id="value_type"
              name="value_type"
              value={formData.value_type}
              onChange={handleChange}
              disabled={!!setting}
            >
              {VALUE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {setting && <small className="form-hint">Type cannot be changed after creation</small>}
          </div>

          <div className="form-group">
            <label htmlFor="value">Value</label>
            {formData.value_type === "boolean" ? (
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="value"
                    checked={formData.value === "true" || formData.value === true}
                    onChange={handleChange}
                  />
                  <span>Enabled</span>
                </label>
              </div>
            ) : formData.value_type === "json" ? (
              <textarea
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                rows={6}
                placeholder="Enter JSON data"
                className="code-textarea"
              />
            ) : formData.value_type === "email" ? (
              <input
                id="value"
                name="value"
                type="email"
                value={formData.value}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            ) : formData.value_type === "url" ? (
              <input
                id="value"
                name="value"
                type="url"
                value={formData.value}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            ) : formData.value_type === "number" ? (
              <input
                id="value"
                name="value"
                type="number"
                value={formData.value}
                onChange={handleChange}
                placeholder="Enter a number"
              />
            ) : (
              <textarea
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                rows={3}
                placeholder="Enter text value"
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Describe what this setting controls"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {setting ? "Update Setting" : "Create Setting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingSetting, setEditingSetting] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/settings/");
      setSettings(data);
    } catch (err) {
      const msg = err.message || "Failed to load settings";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const filteredSettings = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return settings;
    return settings.filter(
      s =>
        s.key?.toLowerCase().includes(t) ||
        s.value?.toLowerCase().includes(t) ||
        s.description?.toLowerCase().includes(t)
    );
  }, [settings, search]);

  const handleSave = async settingData => {
    setIsSubmitting(true);
    try {
      if (editingSetting && editingSetting.id) {
        await put(`/admin/settings/${editingSetting.id}/`, settingData);
        addToast("Setting updated successfully", "success");
      } else {
        await post("/admin/settings/", settingData);
        addToast("Setting created successfully", "success");
      }
      setEditingSetting(null);
      fetchSettings();
    } catch (err) {
      const msg = err.message || "Failed to save setting";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async setting => {
    if (!confirm(`Are you sure you want to delete setting "${setting.key}"?`)) return;
    try {
      await del(`/admin/settings/${setting.id}/`);
      addToast("Setting deleted successfully", "success");
      fetchSettings();
    } catch (err) {
      const msg = err.message || "Failed to delete setting";
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

  const formatValue = (setting) => {
    if (setting.value_type === "boolean") {
      return setting.value === "true" || setting.value === true ? "Yes" : "No";
    }
    if (setting.value_type === "json") {
      try {
        const parsed = JSON.parse(setting.value);
        return JSON.stringify(parsed, null, 2).substring(0, 100) + "...";
      } catch {
        return setting.value.substring(0, 100) + "...";
      }
    }
    return setting.value?.substring(0, 100) + (setting.value?.length > 100 ? "..." : "") || "-";
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Site Settings</h1>
        <p>Manage global site configuration</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Icon d={ICONS.search} />
          <input
            type="search"
            aria-label="Search settings"
            placeholder="Search by key, value, or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
              <Icon d={ICONS.close} />
            </button>
          )}
        </div>

        <button type="button" className="btn-primary" onClick={() => setEditingSetting({})}>
          <Icon d={ICONS.add} />
          Add Setting
        </button>
      </div>

      {!loading && !error && (
        <p className="table-meta" aria-live="polite">
          Showing {filteredSettings.length} of {settings.length}
        </p>
      )}

      <div className="table-container">
        {loading ? (
          <div aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skel-row">
                <span /><span /><span /><span /><span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <span className="empty-icon"><Icon d={ICONS.warn} /></span>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchSettings}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Description</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSettings.map(setting => (
                  <tr key={setting.id}>
                    <td>
                      <span className="cell-main" style={{ fontFamily: "monospace" }}>{setting.key}</span>
                    </td>
                    <td>
                      <span className="badge badge-soft">{setting.value_type}</span>
                    </td>
                    <td>
                      <div className="cell-clip" title={setting.value || ""}>
                        {formatValue(setting)}
                      </div>
                    </td>
                    <td>
                      <div className="cell-clip" title={setting.description || ""}>
                        {setting.description || "-"}
                      </div>
                    </td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap" }}>
                      {formatDate(setting.updated_at)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${setting.key}`}
                          onClick={() => setEditingSetting(setting)}
                        >
                          <Icon d={ICONS.edit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete ${setting.key}`}
                          onClick={() => handleDelete(setting)}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSettings.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.settings} /></span>
                <p>No settings found{search ? ` for "${search.trim()}"` : ""}</p>
              </div>
            )}
          </>
        )}
      </div>

      {editingSetting && (
        <SettingModal
          setting={editingSetting.id !== undefined ? editingSetting : null}
          onClose={() => setEditingSetting(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
