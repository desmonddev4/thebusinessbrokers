import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { get, post, put, del } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

const ICONS = {
  search: "M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  desks: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

function DeskModal({ desk, clusters, onClose, onSave }) {
  const closeRef = useRef(null);
  const [formData, setFormData] = useState({
    code: desk?.code || "",
    name: desk?.name || "",
    strapline: desk?.strapline || "",
    description: desk?.description || "",
    cluster: desk?.cluster || "",
    focus_areas: desk?.focus_areas || [],
  });
  const [errors, setErrors] = useState({});

  // Initialize cluster when editing - it might be an ID or a slug
  useEffect(() => {
    if (desk?.cluster && clusters.length > 0) {
      // If cluster is already an ID, use it directly
      if (typeof desk.cluster === 'number') {
        setFormData(prev => ({ ...prev, cluster: desk.cluster }));
      } else {
        // Otherwise, try to find by slug
        const clusterObj = clusters.find(c => c.slug === desk.cluster);
        if (clusterObj) {
          setFormData(prev => ({ ...prev, cluster: clusterObj.id }));
        }
      }
    }
  }, [desk, clusters]);

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
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.cluster) newErrors.cluster = "Cluster is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      focus_areas: Array.isArray(formData.focus_areas) ? formData.focus_areas : [],
    });
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
        aria-labelledby="desk-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="desk-title">{desk ? "Edit Desk" : "Add New Desk"}</h2>
            <p>{desk ? "Update desk information" : "Create a new brokerage desk"}</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="code">Code *</label>
            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              className={errors.code ? "error" : ""}
              placeholder="e.g., TEC"
            />
            {errors.code && <span className="error-text">{errors.code}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="e.g., Technology"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cluster">Cluster *</label>
            <select
              id="cluster"
              name="cluster"
              value={formData.cluster}
              onChange={handleChange}
              className={errors.cluster ? "error" : ""}
            >
              <option value="">Select a cluster</option>
              {clusters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.cluster && <span className="error-text">{errors.cluster}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="strapline">Strapline</label>
            <input
              id="strapline"
              name="strapline"
              type="text"
              value={formData.strapline}
              onChange={handleChange}
              placeholder="Short tagline"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Detailed description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="focus_areas">Focus Areas (comma-separated)</label>
            <input
              id="focus_areas"
              name="focus_areas"
              type="text"
              value={Array.isArray(formData.focus_areas) ? formData.focus_areas.join(", ") : formData.focus_areas}
              onChange={e => setFormData(prev => ({ ...prev, focus_areas: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
              placeholder="e.g., Software, Hardware, Services"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {desk ? "Update Desk" : "Create Desk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDesks() {
  const [desks, setDesks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingDesk, setEditingDesk] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchClusters = useCallback(async () => {
    try {
      const data = await get("/clusters/");
      setClusters(data);
    } catch (err) {
      console.error("Failed to load clusters:", err);
    }
  }, []);

  const fetchDesks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/desks/");
      setDesks(data);
    } catch (err) {
      const msg = err.message || "Failed to load desks";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDesks();
    fetchClusters();
  }, [fetchDesks, fetchClusters]);

  const filteredDesks = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return desks;
    return desks.filter(
      d =>
        d.name?.toLowerCase().includes(t) ||
        d.code?.toLowerCase().includes(t) ||
        d.cluster_name?.toLowerCase().includes(t)
    );
  }, [desks, search]);

  const handleSave = async deskData => {
    setIsSubmitting(true);
    try {
      if (editingDesk && editingDesk.id) {
        await put(`/admin/desks/${editingDesk.id}/`, deskData);
        addToast("Desk updated successfully", "success");
      } else {
        await post("/admin/desks/", deskData);
        addToast("Desk created successfully", "success");
      }
      setEditingDesk(null);
      fetchDesks();
    } catch (err) {
      const msg = err.message || "Failed to save desk";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async desk => {
    if (!confirm(`Are you sure you want to delete "${desk.name}"?`)) return;
    try {
      await del(`/admin/desks/${desk.id}/`);
      addToast("Desk deleted successfully", "success");
      fetchDesks();
    } catch (err) {
      const msg = err.message || "Failed to delete desk";
      addToast(msg, "error");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Desks</h1>
        <p>Manage your brokerage desks</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Icon d={ICONS.search} />
          <input
            type="search"
            aria-label="Search desks"
            placeholder="Search by name, code or cluster…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
              <Icon d={ICONS.close} />
            </button>
          )}
        </div>

        <button type="button" className="btn-primary" onClick={() => setEditingDesk({})}>
          <Icon d={ICONS.add} />
          Add New Desk
        </button>
      </div>

      {!loading && !error && (
        <p className="table-meta" aria-live="polite">
          Showing {filteredDesks.length} of {desks.length}
        </p>
      )}

      <div className="table-container">
        {loading ? (
          <div aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skel-row">
                <span /><span /><span /><span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <span className="empty-icon"><Icon d={ICONS.warn} /></span>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchDesks}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Cluster</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesks.map(desk => (
                  <tr key={desk.id || desk.code}>
                    <td>
                      <span className="badge">{desk.code}</span>
                    </td>
                    <td>
                      <span className="cell-main">{desk.name}</span>
                      {desk.strapline && <span className="cell-sub">{desk.strapline}</span>}
                    </td>
                    <td>
                      {desk.cluster_name ? (
                        <span className="badge badge-soft">{desk.cluster_name}</span>
                      ) : (
                        <span className="cell-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${desk.name}`}
                          onClick={() => setEditingDesk(desk)}
                        >
                          <Icon d={ICONS.edit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete ${desk.name}`}
                          onClick={() => handleDelete(desk)}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDesks.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.desks} /></span>
                <p>No desks found{search ? ` for “${search.trim()}”` : ""}</p>
              </div>
            )}
          </>
        )}
      </div>

      {editingDesk && (
        <DeskModal
          desk={editingDesk.id !== undefined ? editingDesk : null}
          clusters={clusters}
          onClose={() => setEditingDesk(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}