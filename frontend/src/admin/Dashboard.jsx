import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./Dashboard.css";

/* ---------- Icon paths ---------- */
const ICONS = {
  desks: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z",
  clusters: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  people: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  mail: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  addPerson: "M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  arrow: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  create: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  update: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* tone: navy | gold | blue | ink  (colours live in Dashboard.css) */
const StatCard = ({ title, value, icon, tone, delay = 0 }) => (
  <div className="stat-card" style={{ "--d": `${delay}ms` }}>
    <div className={`stat-icon stat-icon--${tone}`}>
      <Icon d={icon} />
    </div>
    <div className="stat-content">
      <span className="stat-label">{title}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

const QuickAction = ({ to, icon, children }) => (
  <Link to={to} className="quick-action">
    <span className="quick-action-icon">
      <Icon d={icon} />
    </span>
    <span className="quick-action-text">{children}</span>
    <span className="quick-action-arrow">
      <Icon d={ICONS.arrow} />
    </span>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    desks: 0,
    clusters: 0,
    people: 0,
    enquiries: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [desksRes, clustersRes, peopleRes, enquiriesRes, activitiesRes] = await Promise.all([
          get("/desks/").catch(() => ({ length: 0 })),
          get("/clusters/").catch(() => ({ length: 0 })),
          get("/people/").catch(() => ({ length: 0 })),
          get("/enquiries/").catch(() => ({ length: 0 })),
          get("/admin/activity/").catch(() => []),
        ]);

        setStats({
          desks: desksRes.length || 0,
          clusters: clustersRes.length || 0,
          people: peopleRes.length || 0,
          enquiries: enquiriesRes.length || 0,
        });
        setActivities(activitiesRes || []);
      } catch (err) {
        addToast("Failed to load dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [addToast]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "create": return ICONS.create;
      case "update": return ICONS.update;
      case "delete": return ICONS.delete;
      default: return ICONS.clock;
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

  const header = (
    <div className="admin-header">
      <h1>Dashboard</h1>
      <p>Overview of your website content</p>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard">
        {header}
        <div className="stats-grid" aria-hidden="true">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {header}

      <div className="stats-grid">
        <StatCard title="Total Desks" value={stats.desks} icon={ICONS.desks} tone="navy" delay={0} />
        <StatCard title="Clusters" value={stats.clusters} icon={ICONS.clusters} tone="gold" delay={80} />
        <StatCard title="People" value={stats.people} icon={ICONS.people} tone="blue" delay={160} />
        <StatCard title="Enquiries" value={stats.enquiries} icon={ICONS.mail} tone="ink" delay={240} />
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <QuickAction to="/admin/desks" icon={ICONS.add}>Add New Desk</QuickAction>
            <QuickAction to="/admin/people" icon={ICONS.addPerson}>Add Person</QuickAction>
            <QuickAction to="/admin/enquiries" icon={ICONS.mail}>View Enquiries</QuickAction>
          </div>
        </section>

        <section className="dashboard-card">
          <h2>Recent Activity</h2>
          {activities.length === 0 ? (
            <div className="dashboard-empty">
              <span className="dashboard-empty-icon">
                <Icon d={ICONS.clock} />
              </span>
              <p className="dashboard-placeholder">No recent activity</p>
            </div>
          ) : (
            <div className="activity-list">
              {activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon activity-icon--${getActionColor(activity.action)}`}>
                    <Icon d={getActionIcon(activity.action)} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">{activity.description}</p>
                    <div className="activity-meta">
                      <span className="activity-user">{activity.user || 'System'}</span>
                      <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}