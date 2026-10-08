import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { label: "Clusters", path: "/admin/clusters", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { label: "Desks", path: "/admin/desks", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" },
  { label: "People", path: "/admin/people", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
  { label: "Enquiries", path: "/admin/enquiries", icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
  { label: "Activity", path: "/admin/activity", icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" },
  { label: "Content", path: "/admin/content", icon: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" },
  { label: "Settings", path: "/admin/settings", icon: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" },
  { label: "Company Info", path: "/admin/siteinfo", icon: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v2h-2zm0-4h-8v-2h2v2h-2zm0-4h-8V9h2v2h-2zm0-4h-8V5h2v2h-2z" },
];

const ICONS = {
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* "/admin" only matches itself; other items also match their sub-pages */
const isActive = (path, pathname) =>
  path === "/admin"
    ? pathname === "/admin" || pathname === "/admin/"
    : pathname === path || pathname.startsWith(path + "/");

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const username = user?.username || "Admin";
  const initials = username.slice(0, 2).toUpperCase();
  const current = NAV_ITEMS.find(i => isActive(i.path, location.pathname));

  // close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Escape closes it, and the page behind doesn't scroll while it's open
  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* ---------- Mobile top bar ---------- */}
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="admin-sidebar"
        >
          <Icon d={ICONS.menu} />
        </button>
        <span className="admin-topbar-title">{current?.label || "TBB Admin"}</span>
        <span className="admin-topbar-avatar" aria-hidden="true">{initials}</span>
      </header>

      {/* dim backdrop behind the mobile menu */}
      <div
        className={`admin-overlay${open ? " show" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ---------- Sidebar ---------- */}
      <aside id="admin-sidebar" className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <span className="admin-logo-ring">
              <img src="/logo2.jpeg" alt="" width="40" height="40" />
            </span>
            <span className="admin-logo-text">
              TBB Admin
              <small>Content manager</small>
            </span>
          </Link>
          <button
            type="button"
            className="admin-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <Icon d={ICONS.close} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin">
          <span className="admin-nav-label">Menu</span>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon d={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-avatar" aria-hidden="true">{initials}</span>
            <span className="admin-user-text">
              <small>Signed in as</small>
              <strong>{username}</strong>
            </span>
          </div>
          <button type="button" onClick={handleLogout} className="admin-logout-btn">
            <Icon d={ICONS.logout} />
            Logout
          </button>
          <Link to="/" className="admin-back-link">
            <Icon d={ICONS.back} />
            Back to website
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}