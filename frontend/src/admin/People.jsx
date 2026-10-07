import { useEffect, useState } from "react";
import { get } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

export default function AdminPeople() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { addToast } = useToast();

  useEffect(() => {
    fetchPeople();
  }, [addToast]);

  const fetchPeople = async () => {
    try {
      const data = await get("/people/");
      setPeople(data);
    } catch (err) {
      addToast(err.message || "Failed to load people", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = people.filter(
    (p) =>
      (filter === "all" || p.kind === filter) &&
      (p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.role?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>People</h1>
          <p>Manage directors and advisers</p>
        </div>
        <div className="table-skeleton" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>People</h1>
        <p>Manage directors and advisers</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
          </svg>
          <input
            type="search"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "director" ? "active" : ""}`}
            onClick={() => setFilter("director")}
          >
            Directors
          </button>
          <button
            className={`filter-btn ${filter === "adviser" ? "active" : ""}`}
            onClick={() => setFilter("adviser")}
          >
            Advisers
          </button>
        </div>
        <button className="btn-primary">Add Person</button>
      </div>

      <div className="table-container">
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
            {filteredPeople.map((person) => (
              <tr key={person.id || person.name}>
                <td>
                  <div className="person-cell">
                    {person.photo ? (
                      <img src={person.photo} alt="" className="person-avatar" />
                    ) : (
                      <div className="person-avatar avatar-placeholder">
                        {person.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <span>{person.name}</span>
                  </div>
                </td>
                <td>{person.role || person.portfolio || "-"}</td>
                <td>
                  <span className={`badge badge-${person.kind}`}>
                    {person.kind}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                    <button className="btn-icon btn-icon-danger" title="Delete">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPeople.length === 0 && (
          <div className="empty-state">
            <p>No people found</p>
          </div>
        )}
      </div>
    </div>
  );
}
