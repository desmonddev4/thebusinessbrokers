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
  people: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const initials = name =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("") || "?";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "director", label: "Directors" },
  { key: "adviser", label: "Advisers" },
];

function PersonModal({ person, onClose, onSave }) {
  const closeRef = useRef(null);
  const [formData, setFormData] = useState({
    name: person?.name || "",
    kind: person?.kind || "adviser",
    role: person?.role || "",
    qualifications: person?.qualifications || "",
    portfolio: person?.portfolio || "",
    profile: person?.profile || "",
    published: person?.published !== undefined ? person.published : true,
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
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.kind) newErrors.kind = "Type is required";

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="person-title">{person ? "Edit Person" : "Add New Person"}</h2>
            <p>{person ? "Update person information" : "Add a new director or adviser"}</p>
          </div>
          <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="Full name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="kind">Type *</label>
            <select
              id="kind"
              name="kind"
              value={formData.kind}
              onChange={handleChange}
              className={errors.kind ? "error" : ""}
            >
              <option value="adviser">Adviser</option>
              <option value="director">Director</option>
            </select>
            {errors.kind && <span className="error-text">{errors.kind}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              placeholder="Job title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="qualifications">Qualifications</label>
            <input
              id="qualifications"
              name="qualifications"
              type="text"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="Professional qualifications"
            />
          </div>

          <div className="form-group">
            <label htmlFor="portfolio">Portfolio</label>
            <input
              id="portfolio"
              name="portfolio"
              type="text"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="Areas of expertise"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile">Profile</label>
            <textarea
              id="profile"
              name="profile"
              value={formData.profile}
              onChange={handleChange}
              rows={4}
              placeholder="Biographical information"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
              <span>Published (visible on website)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {person ? "Update Person" : "Create Person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPeople() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingPerson, setEditingPerson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/people/");
      setPeople(data);
    } catch (err) {
      const msg = err.message || "Failed to load people";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const counts = useMemo(
    () => ({
      all: people.length,
      director: people.filter(p => p.kind === "director").length,
      adviser: people.filter(p => p.kind === "adviser").length,
    }),
    [people]
  );

  const filteredPeople = useMemo(() => {
    const t = search.trim().toLowerCase();
    return people.filter(
      p =>
        (filter === "all" || p.kind === filter) &&
        (!t ||
          p.name?.toLowerCase().includes(t) ||
          p.role?.toLowerCase().includes(t) ||
          p.portfolio?.toLowerCase().includes(t))
    );
  }, [people, search, filter]);

  const handleSave = async personData => {
    setIsSubmitting(true);
    try {
      if (editingPerson && editingPerson.id) {
        await put(`/admin/people/${editingPerson.id}/`, personData);
        addToast("Person updated successfully", "success");
      } else {
        await post("/admin/people/", personData);
        addToast("Person created successfully", "success");
      }
      setEditingPerson(null);
      fetchPeople();
    } catch (err) {
      const msg = err.message || "Failed to save person";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async person => {
    if (!confirm(`Are you sure you want to delete "${person.name}"?`)) return;
    try {
      await del(`/admin/people/${person.id}/`);
      addToast("Person deleted successfully", "success");
      fetchPeople();
    } catch (err) {
      const msg = err.message || "Failed to delete person";
      addToast(msg, "error");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>People</h1>
        <p>Manage directors and advisers</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Icon d={ICONS.search} />
          <input
            type="search"
            aria-label="Search people"
            placeholder="Search by name or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
              <Icon d={ICONS.close} />
            </button>
          )}
        </div>

        <div className="filter-buttons" role="group" aria-label="Filter by type">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={`filter-btn ${filter === f.key ? "active" : ""}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {!loading && !error && <span className="filter-count">{counts[f.key]}</span>}
            </button>
          ))}
        </div>

        <button type="button" className="btn-primary" onClick={() => setEditingPerson({})}>
          <Icon d={ICONS.add} />
          Add Person
        </button>
      </div>

      {!loading && !error && (
        <p className="table-meta" aria-live="polite">
          Showing {filteredPeople.length} of {people.length}
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
            <button type="button" className="btn-primary" onClick={fetchPeople}>
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
                  <th>Role</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.map(person => (
                  <tr key={person.id || person.name}>
                    <td>
                      <div className="person-cell">
                        {person.photo ? (
                          <img src={person.photo} alt="" className="person-avatar" loading="lazy" />
                        ) : (
                          <div className="person-avatar avatar-placeholder" aria-hidden="true">
                            {initials(person.name)}
                          </div>
                        )}
                        <span className="cell-main">{person.name}</span>
                      </div>
                    </td>
                    <td className="cell-muted">{person.role || person.portfolio || "-"}</td>
                    <td>
                      <span className={`badge badge-${person.kind}`}>{person.kind}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${person.name}`}
                          onClick={() => setEditingPerson(person)}
                        >
                          <Icon d={ICONS.edit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                          aria-label={`Delete ${person.name}`}
                          onClick={() => handleDelete(person)}
                        >
                          <Icon d={ICONS.trash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPeople.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.people} /></span>
                <p>No people found{search ? ` for “${search.trim()}”` : ""}</p>
              </div>
            )}
          </>
        )}
      </div>

      {editingPerson && (
        <PersonModal
          person={editingPerson.id !== undefined ? editingPerson : null}
          onClose={() => setEditingPerson(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}