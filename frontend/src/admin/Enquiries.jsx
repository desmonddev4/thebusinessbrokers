import { useEffect, useState } from "react";
import { get } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchEnquiries();
  }, [addToast]);

  const fetchEnquiries = async () => {
    try {
      const data = await get("/enquiries/");
      setEnquiries(data);
    } catch (err) {
      addToast(err.message || "Failed to load enquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredEnquiries = enquiries.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.contact?.toLowerCase().includes(search.toLowerCase()) ||
      e.message?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Enquiries</h1>
          <p>View and manage contact form submissions</p>
        </div>
        <div className="table-skeleton" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Enquiries</h1>
        <p>View and manage contact form submissions</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
          </svg>
          <input
            type="search"
            placeholder="Search enquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Desk</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.map((enquiry) => (
              <tr key={enquiry.id}>
                <td>{enquiry.name}</td>
                <td>{enquiry.contact}</td>
                <td>{enquiry.desk_name || "-"}</td>
                <td>{formatDate(enquiry.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5-5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
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
        {filteredEnquiries.length === 0 && (
          <div className="empty-state">
            <p>No enquiries found</p>
          </div>
        )}
      </div>
    </div>
  );
}
