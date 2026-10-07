import { useEffect, useState } from "react";
import { get, post, put, del } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

export default function AdminDesks() {
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchDesks();
  }, [addToast]);

  const fetchDesks = async () => {
    try {
      const data = await get("/desks/");
      setDesks(data);
    } catch (err) {
      addToast(err.message || "Failed to load desks", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredDesks = desks.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Desks</h1>
          <p>Manage your brokerage desks</p>
        </div>
        <div className="table-skeleton" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Desks</h1>
        <p>Manage your brokerage desks</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
          </svg>
          <input
            type="search"
            placeholder="Search desks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary">Add New Desk</button>
      </div>

      <div className="table-container">
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
            {filteredDesks.map((desk) => (
              <tr key={desk.id || desk.code}>
                <td>
                  <span className="badge">{desk.code}</span>
                </td>
                <td>{desk.name}</td>
                <td>{desk.cluster_name || "-"}</td>
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
        {filteredDesks.length === 0 && (
          <div className="empty-state">
            <p>No desks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
