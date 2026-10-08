import { useCallback, useEffect, useMemo, useState } from "react";
import { get, post, put, del } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

const ICONS = {
  search: "M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 0 010 9z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  clusters: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

function ClusterModal({ cluster, onClose, onSave }) {
  const [formData, setFormData] = useState({
    order: cluster?.order || 0,
    name: cluster?.name || "",
    short_name: cluster?.short_name || "",
    slug: cluster?.slug || "",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = e => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.short_name.trim()) newErrors.short_name = "Short name is required";

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
        aria-labelledby="cluster-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="cluster-title">{cluster ? "Edit Cluster" : "Add New Cluster"}</h2>
            <p>{cluster ? "Update cluster information" : "Create a new practice cluster"}</p>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="order">Order</label>
            <input
              id="order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
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
              placeholder="e.g., Finance and Capital"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="short_name">Short Name *</label>
            <input
              id="short_name"
              name="short_name"
              type="text"
              value={formData.short_name}
              onChange={handleChange}
              className={errors.short_name ? "error" : ""}
              placeholder="e.g., Finance"
            />
            {errors.short_name && <span className="error-text">{errors.short_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              placeholder="Auto-generated from name"
              disabled
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {cluster ? "Update Cluster" : "Create Cluster"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingCluster, setEditingCluster] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/clusters/");
      setClusters(data);
    } catch (err) {
      const msg = err.message || "Failed to load clusters";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  const filteredClusters = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return clusters;
    return clusters.filter(
      c =>
        c.name?.toLowerCase().includes(t) ||
        c.short_name?.toLowerCase().includes(t)
    );
  }, [clusters, search]);

  const handleSave = async clusterData => {
    setIsSubmitting(true);
    try {
      if (editingCluster && editingCluster.id) {
        await put(`/admin/clusters/${editingCluster.id}/`, clusterData);
        addToast("Cluster updated successfully", "success");
      } else {
        await post("/admin/clusters/", clusterData);
        addToast("Cluster created successfully", "success");
      }
      setEditingCluster(null);
      fetchClusters();
    } catch (err) {
      const msg = err.message || "Failed to save cluster";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async cluster => {
    if (!confirm(`Are you sure you want to delete "${cluster.name}"? This will also delete all desks in this cluster.`)) return;
    try {
      await del(`/admin/clusters/${cluster.id}/`);
      addToast("Cluster deleted successfully", "success");
      fetchClusters();
    } catch (err) {
      const msg = err.message || "Failed to delete cluster";
      addToast(msg, "error");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Clusters</h1>
        <p>Manage practice clusters</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Icon d={ICONS.search} />
          <input
            type="search"
            aria-label="Search clusters"
            placeholder="Search by name or short name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
              <Icon d={ICONS.close} />
            </button>
          )}
        </div>

        <button type="button" className="btn-primary" onClick={() => setEditingCluster({})}>
          <Icon d={ICONS.add} />
          Add New Cluster
        </button>
      </div>

      {!loading && !error && (
        <p className="table-meta" aria-live="polite">
          Showing {filteredClusters.length} of {clusters.length}
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
            <button type="button" className="btn-primary" onClick={fetchClusters}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Name</th>
                  <th>Short Name</th>
                  <th>Desks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClusters.map(cluster => (
                  <tr key={cluster.id}>
                    <td>
                      <span className="badge">{cluster.order}</span>
                    </td>
                    <td>
                      <span className="cell-main">{cluster.name}</span>
                    </td>
                    <td>
                      <span className="badge badge-soft">{cluster.short_name}</span>
                    </td>
                    <td>
                      <span className="badge">{cluster.desk_count || 0}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${cluster.name}`}
                          onClick={() => setEditingCluster(cluster)}
                        >
                          <Icon d={ICONS.edit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete ${cluster.name}`}
                          onClick={() => handleDelete(cluster)}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClusters.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.clusters} /></span>
                <p>No clusters found{search ? ` for "${search.trim()}"` : ""}</p>
              </div>
            )}
          </>
        )}
      </div>

      {editingCluster && (
        <ClusterModal
          cluster={editingCluster.id !== undefined ? editingCluster : null}
          onClose={() => setEditingCluster(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
