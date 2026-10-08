import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get, del } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

const ICONS = {
  search: "M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 0 1 1 0-9 4.5 0 0 1 0 9z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  view: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  mail: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const formatDate = dateStr => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* email -> mailto:, anything else -> tel: */
const contactHref = contact => {
  if (!contact) return null;
  const c = contact.trim();
  if (c.includes("@")) return `mailto:${c}`;
  const digits = c.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
};

function EnquiryModal({ enquiry, onClose }) {
  const closeRef = useRef(null);
  const href = contactHref(enquiry.contact);

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="enquiry-title">{enquiry.name}</h2>
            <p>Received {formatDate(enquiry.created_at)}</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <dl className="modal-grid">
          <div>
            <dt>Contact</dt>
            <dd>{enquiry.contact || "-"}</dd>
          </div>
          <div>
            <dt>Desk</dt>
            <dd>{enquiry.desk_name || "-"}</dd>
          </div>
        </dl>

        <p className="modal-message">{enquiry.message || "No message was included."}</p>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
          {href && (
            <a className="btn-primary" href={href}>
              <Icon d={ICONS.mail} />
              Reply
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const { addToast } = useToast();

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/enquiries/");
      setEnquiries(data);
    } catch (err) {
      const msg = err.message || "Failed to load enquiries";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const closeModal = useCallback(() => setSelected(null), []);

  const handleDelete = async enquiry => {
    if (!confirm(`Are you sure you want to delete enquiry from "${enquiry.name}"?`)) return;
    try {
      await del(`/admin/enquiries/${enquiry.id}/`);
      addToast("Enquiry deleted successfully", "success");
      fetchEnquiries();
    } catch (err) {
      const msg = err.message || "Failed to delete enquiry";
      addToast(msg, "error");
    }
  };

  const filteredEnquiries = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return enquiries;
    return enquiries.filter(
      e =>
        e.name?.toLowerCase().includes(t) ||
        e.contact?.toLowerCase().includes(t) ||
        e.desk_name?.toLowerCase().includes(t) ||
        e.message?.toLowerCase().includes(t)
    );
  }, [enquiries, search]);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Enquiries</h1>
        <p>View and manage contact form submissions</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Icon d={ICONS.search} />
          <input
            type="search"
            aria-label="Search enquiries"
            placeholder="Search by name, contact or message…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
              <Icon d={ICONS.close} />
            </button>
          )}
        </div>
      </div>

      {!loading && !error && (
        <p className="table-meta" aria-live="polite">
          Showing {filteredEnquiries.length} of {enquiries.length}
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
            <button type="button" className="btn-primary" onClick={fetchEnquiries}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Desk</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map(enquiry => (
                  <tr key={enquiry.id}>
                    <td className="cell-main">{enquiry.name}</td>
                    <td>{enquiry.contact}</td>
                    <td>
                      {enquiry.desk_name ? (
                        <span className="badge badge-soft">{enquiry.desk_name}</span>
                      ) : (
                        <span className="cell-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="cell-clip" title={enquiry.message || ""}>
                        {enquiry.message || "-"}
                      </div>
                    </td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap" }}>
                      {formatDate(enquiry.created_at)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon btn-icon-view"
                          title="View"
                          aria-label={`View enquiry from ${enquiry.name}`}
                          onClick={() => setSelected(enquiry)}
                        >
                          <Icon d={ICONS.view} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete enquiry from ${enquiry.name}`}
                          onClick={() => handleDelete(enquiry)}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEnquiries.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.mail} /></span>
                <p>No enquiries found{search ? ` for “${search.trim()}”` : ""}</p>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <EnquiryModal enquiry={selected} onClose={closeModal} />}
    </div>
  );
}