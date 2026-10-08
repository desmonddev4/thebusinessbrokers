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
  content: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
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
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "number", label: "Number" },
];

function ContentModal({ content, onClose, onSave }) {
  const closeRef = useRef(null);
  const [formData, setFormData] = useState({
    section: content?.section || "",
    key: content?.key || "",
    value: content?.value || "",
    value_type: content?.value_type || "text",
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
    if (!formData.section.trim()) newErrors.section = "Section is required";
    if (!formData.key.trim()) newErrors.key = "Key is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="content-title">{content ? "Edit Content" : "Add New Content"}</h2>
            <p>{content ? "Update content section" : "Create a new content section"}</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="section">Section *</label>
            <input
              id="section"
              name="section"
              type="text"
              value={formData.section}
              onChange={handleChange}
              className={errors.section ? "error" : ""}
              placeholder="e.g., about, contact, home"
            />
            {errors.section && <span className="error-text">{errors.section}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="key">Key *</label>
            <input
              id="key"
              name="key"
              type="text"
              value={formData.key}
              onChange={handleChange}
              className={errors.key ? "error" : ""}
              placeholder="e.g., title, description, body"
            />
            {errors.key && <span className="error-text">{errors.key}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="value_type">Value Type</label>
            <select
              id="value_type"
              name="value_type"
              value={formData.value_type}
              onChange={handleChange}
            >
              {VALUE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="value">Value</label>
            {formData.value_type === "html" || formData.value_type === "json" ? (
              <textarea
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                rows={8}
                placeholder={`Enter ${formData.value_type.toUpperCase()} content`}
                className="code-textarea"
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
                rows={4}
                placeholder="Enter text content"
              />
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {content ? "Update Content" : "Create Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSiteContent() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [editingContent, setEditingContent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/content/");
      setContents(data);
    } catch (err) {
      const msg = err.message || "Failed to load content";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const sections = useMemo(() => {
    const uniqueSections = [...new Set(contents.map(c => c.section))];
    return uniqueSections.sort();
  }, [contents]);

  const filteredContents = useMemo(() => {
    let filtered = contents;

    if (filterSection) {
      filtered = filtered.filter(c => c.section === filterSection);
    }

    const t = search.trim().toLowerCase();
    if (t) {
      filtered = filtered.filter(
        c =>
          c.section?.toLowerCase().includes(t) ||
          c.key?.toLowerCase().includes(t) ||
          c.value?.toLowerCase().includes(t)
      );
    }

    return filtered;
  }, [contents, search, filterSection]);

  const handleSave = async contentData => {
    setIsSubmitting(true);
    try {
      if (editingContent && editingContent.id) {
        await put(`/admin/content/${editingContent.id}/`, contentData);
        addToast("Content updated successfully", "success");
      } else {
        await post("/admin/content/", contentData);
        addToast("Content created successfully", "success");
      }
      setEditingContent(null);
      fetchContents();
    } catch (err) {
      const msg = err.message || "Failed to save content";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async content => {
    if (!confirm(`Are you sure you want to delete "${content.section}.${content.key}"?`)) return;
    try {
      await del(`/admin/content/${content.id}/`);
      addToast("Content deleted successfully", "success");
      fetchContents();
    } catch (err) {
      const msg = err.message || "Failed to delete content";
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
        <h1>Site Content</h1>
        <p>Manage editable static content sections</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Icon d={ICONS.search} />
          <input
            type="search"
            aria-label="Search content"
            placeholder="Search by section, key, or value…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
              <Icon d={ICONS.close} />
            </button>
          )}
        </div>

        <select
          value={filterSection}
          onChange={e => setFilterSection(e.target.value)}
          className="filter-select"
        >
          <option value="">All Sections</option>
          {sections.map(section => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>

        <button type="button" className="btn-primary" onClick={() => setEditingContent({})}>
          <Icon d={ICONS.add} />
          Add Content
        </button>
      </div>

      {!loading && !error && (
        <p className="table-meta" aria-live="polite">
          Showing {filteredContents.length} of {contents.length}
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
            <button type="button" className="btn-primary" onClick={fetchContents}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Value Preview</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.map(content => (
                  <tr key={content.id}>
                    <td>
                      <span className="badge">{content.section}</span>
                    </td>
                    <td>
                      <span className="cell-main">{content.key}</span>
                    </td>
                    <td>
                      <span className="badge badge-soft">{content.value_type}</span>
                    </td>
                    <td>
                      <div className="cell-clip" title={content.value || ""}>
                        {content.value || "-"}
                      </div>
                    </td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap" }}>
                      {formatDate(content.updated_at)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${content.section}.${content.key}`}
                          onClick={() => setEditingContent(content)}
                        >
                          <Icon d={ICONS.edit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete ${content.section}.${content.key}`}
                          onClick={() => handleDelete(content)}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredContents.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.content} /></span>
                <p>No content found{search || filterSection ? " matching your filters" : ""}</p>
              </div>
            )}
          </>
        )}
      </div>

      {editingContent && (
        <ContentModal
          content={editingContent.id !== undefined ? editingContent : null}
          onClose={() => setEditingContent(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
