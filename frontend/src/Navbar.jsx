import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { nav } from "./content.js";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  // close the mobile menu + reset scroll on route change
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  // track scroll so the header can shrink and gain a shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`mast ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap bar">
        <Link to="/" className="brand">
          <img src="/logo2.jpeg" alt="" width="42" height="42" />
          <span>Top <b>Business Brokers</b></span>
        </Link>

        <button
          className="menu-btn"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <nav id="nav" aria-label="Main" className={open ? "open" : ""}>
          {nav.map((n, i) => (
            <NavLink key={n.to} to={n.to} style={{ "--i": i }}>
              {n.label}
            </NavLink>
          ))}
          {/* adjust the route to wherever your contact page lives */}
          <Link to="/contact" className="nav-cta" style={{ "--i": nav.length }}>
            Get in touch
          </Link>
        </nav>
      </div>
    </header>
  );
}