import { useCallback, useEffect, useState, useRef } from "react";
import { get, post, put, del } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

const ICONS = {
  folder: "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z",
  upload: "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  image: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
  file: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.998 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

function UploadModal({ onClose, onUpload }) {
  const closeRef = useRef(null);
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = e => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (altText) formData.append('alt_text', altText);
      if (description) formData.append('description', description);

      await onUpload(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="upload-title">Upload File</h2>
            <p>Add a new file to the media gallery</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div
            className={`upload-zone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file"
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <label htmlFor="file" className="upload-label">
              <Icon d={ICONS.upload} />
              <p>
                {file ? file.name : "Drag and drop a file here, or click to browse"}
              </p>
              {file && (
                <small className="upload-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </small>
              )}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="alt_text">Alt Text (for images)</label>
            <input
              id="alt_text"
              name="alt_text"
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ media, onClose, onUpdate }) {
  const closeRef = useRef(null);
  const [altText, setAltText] = useState(media?.alt_text || "");
  const [description, setDescription] = useState(media?.description || "");
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(media.id, { alt_text: altText, description });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="edit-title">Edit File Details</h2>
            <p>Update file metadata</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="alt_text">Alt Text (for images)</label>
            <input
              id="alt_text"
              name="alt_text"
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MediaManagement() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const { addToast } = useToast();

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/media/");
      setMediaFiles(data);
    } catch (err) {
      const msg = err.message || "Failed to load media files";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async formData => {
    try {
      await post("/admin/media/", formData, true);
      addToast("File uploaded successfully", "success");
      fetchMedia();
    } catch (err) {
      const msg = err.message || "Failed to upload file";
      addToast(msg, "error");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await put(`/admin/media/${id}/`, data);
      addToast("File updated successfully", "success");
      fetchMedia();
    } catch (err) {
      const msg = err.message || "Failed to update file";
      addToast(msg, "error");
    }
  };

  const handleDelete = async media => {
    if (!confirm(`Are you sure you want to delete "${media.filename}"?`)) return;
    try {
      await del(`/admin/media/${media.id}/`);
      addToast("File deleted successfully", "success");
      fetchMedia();
    } catch (err) {
      const msg = err.message || "Failed to delete file";
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

  const filteredFiles = filter === "all" ? mediaFiles : mediaFiles.filter(f => f.file_type === filter);

  const getFileIcon = type => {
    switch (type) {
      case "image": return ICONS.image;
      case "video": return ICONS.file;
      case "document": return ICONS.file;
      default: return ICONS.file;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Media Gallery</h1>
        <p>Manage uploaded files and media assets</p>
      </div>

      <div className="admin-toolbar">
        <div className="filter-group">
          <button
            type="button"
            className={`btn-ghost ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`btn-ghost ${filter === "image" ? "active" : ""}`}
            onClick={() => setFilter("image")}
          >
            Images
          </button>
          <button
            type="button"
            className={`btn-ghost ${filter === "document" ? "active" : ""}`}
            onClick={() => setFilter("document")}
          >
            Documents
          </button>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowUpload(true)}>
          <Icon d={ICONS.upload} />
          Upload File
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skel-row">
                <span /><span /><span /><span /><span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <span className="empty-icon"><Icon d={ICONS.warn} /></span>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchMedia}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Uploaded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(media => (
                  <tr key={media.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Icon d={getFileIcon(media.file_type)} style={{ width: "20px", height: "20px" }} />
                        <span className="cell-main">{media.filename}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-soft">{media.file_type}</span>
                    </td>
                    <td className="cell-muted">{media.file_size_display}</td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap" }}>
                      {formatDate(media.uploaded_at)}
                    </td>
                    <td className="cell-muted">{media.uploaded_by || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${media.filename}`}
                          onClick={() => setEditingMedia(media)}
                        >
                          <Icon d={ICONS.edit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete ${media.filename}`}
                          onClick={() => handleDelete(media)}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFiles.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.folder} /></span>
                <p>No media files found</p>
              </div>
            )}
          </>
        )}
      </div>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />
      )}

      {editingMedia && (
        <EditModal
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
