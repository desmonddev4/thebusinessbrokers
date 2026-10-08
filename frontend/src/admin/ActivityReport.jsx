import { useEffect, useState, useMemo } from "react";
import { get } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";
import "./ActivityReport.css";

const ICONS = {
  search: "M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 0 1 1 0-9 4.5 0 0 1 0 9z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  create: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  update: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  filter: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function ActivityReport() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterType, setFilterType] = useState("");
  const { addToast } = useToast();

  const fetchActivities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get("/admin/activity/");
      setActivities(data);
    } catch (err) {
      const msg = err.message || "Failed to load activities";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [addToast]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filter by action type
    if (filterAction) {
      filtered = filtered.filter(a => a.action === filterAction);
    }

    // Filter by content type
    if (filterType) {
      filtered = filtered.filter(a => a.content_type === filterType);
    }

    // Filter by search term
    const t = search.trim().toLowerCase();
    if (t) {
      filtered = filtered.filter(
        a =>
          a.description?.toLowerCase().includes(t) ||
          a.user?.toLowerCase().includes(t) ||
          a.object_name?.toLowerCase().includes(t)
      );
    }

    return filtered;
  }, [activities, search, filterAction, filterType]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "create": return ICONS.create;
      case "update": return ICONS.update;
      case "delete": return ICONS.delete;
      default: return ICONS.refresh;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "create": return "green";
      case "update": return "blue";
      case "delete": return "red";
      default: return "gray";
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "create": return "Create";
      case "update": return "Update";
      case "delete": return "Delete";
      default: return action;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Activity Report</h1>
        <p>Full activity log with filtering options</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Icon d={ICONS.search} />
          <input
            type="search"
            aria-label="Search activities"
            placeholder="Search by description, user, or object…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
              <Icon d={ICONS.close} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="filter-select"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="desk">Desks</option>
            <option value="person">People</option>
            <option value="enquiry">Enquiries</option>
          </select>
        </div>

        <button type="button" className="btn-ghost" onClick={fetchActivities}>
          <Icon d={ICONS.refresh} />
          Refresh
        </button>
      </div>

      {!loading && !error && (
        <p className="table-meta" aria-live="polite">
          Showing {filteredActivities.length} of {activities.length} activities
        </p>
      )}

      <div className="table-container">
        {loading ? (
          <div aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skel-row">
                <span /><span /><span /><span /><span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <span className="empty-icon"><Icon d={ICONS.refresh} /></span>
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchActivities}>
              <Icon d={ICONS.refresh} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map(activity => (
                  <tr key={activity.id}>
                    <td>
                      <span className={`activity-badge activity-badge--${getActionColor(activity.action)}`}>
                        <Icon d={getActionIcon(activity.action)} />
                        {getActionBadge(activity.action)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-soft">
                        {activity.content_type_display || activity.content_type}
                      </span>
                    </td>
                    <td>
                      <span className="cell-main">{activity.description}</span>
                      {activity.object_name && (
                        <span className="cell-sub">{activity.object_name}</span>
                      )}
                    </td>
                    <td>
                      <span className="cell-muted">{activity.user || 'System'}</span>
                    </td>
                    <td>
                      <span className="cell-muted">{formatTimestamp(activity.timestamp)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredActivities.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon d={ICONS.filter} /></span>
                <p>No activities found{search || filterAction || filterType ? " matching your filters" : ""}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
