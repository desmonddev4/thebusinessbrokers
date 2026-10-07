import { useEffect, useState } from "react";
import { get } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./Dashboard.css";

const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color }}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={icon} />
      </svg>
    </div>
    <div className="stat-content">
      <span className="stat-label">{title}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    desks: 0,
    clusters: 0,
    people: 0,
    enquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [desksRes, clustersRes, peopleRes, enquiriesRes] = await Promise.all([
          get("/desks/").catch(() => ({ length: 0 })),
          get("/clusters/").catch(() => ({ length: 0 })),
          get("/people/").catch(() => ({ length: 0 })),
          get("/enquiries/").catch(() => ({ length: 0 })),
        ]);

        setStats({
          desks: desksRes.length || 0,
          clusters: clustersRes.length || 0,
          people: peopleRes.length || 0,
          enquiries: enquiriesRes.length || 0,
        });
      } catch (err) {
        addToast("Failed to load dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [addToast]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Overview of your website content</p>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Overview of your website content</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Desks"
          value={stats.desks}
          icon="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          title="Clusters"
          value={stats.clusters}
          icon="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          title="People"
          value={stats.people}
          icon="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          title="Enquiries"
          value={stats.enquiries}
          icon="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
          color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/admin/desks" className="quick-action">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Add New Desk
            </a>
            <a href="/admin/people" className="quick-action">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Add Person
            </a>
            <a href="/admin/enquiries" className="quick-action">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              View Enquiries
            </a>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <p className="dashboard-placeholder">Activity log coming soon</p>
        </div>
      </div>
    </div>
  );
}
