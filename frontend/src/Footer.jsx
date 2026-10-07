import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { nav } from "./content.js";
import "./Footer.css";

export default function Footer() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // fade the footer in the first time it scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect(); // only animate once
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer ref={ref} className={`foot ${visible ? "in" : ""}`}>
      <div className="wrap">
        <div className="foot-grid">
          {/* Column 1: brand */}
          <div className="foot-col foot-brand" style={{ "--i": 0 }}>
            <Link to="/" className="foot-logo">
              <span className="logo-badge">
                <img src="/logo2.jpeg" alt="" width="36" height="36" />
              </span>
              <span>Top <b>Business Brokers</b></span>
            </Link>
            <p>
              Helping businesses in Ghana buy, sell and grow with confidence.
            </p>
          </div>

          {/* Column 2: quick links */}
          <div className="foot-col" style={{ "--i": 1 }}>
            <h4>Quick links</h4>
            <ul className="foot-links" aria-label="Footer">
              {nav.map(n => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: contact */}
          <div className="foot-col" style={{ "--i": 2 }}>
            <h4>Contact</h4>
            <ul className="foot-contact">
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1z" />
                </svg>
                <a href="tel:+233243555882">+233 (0) 243 555 882</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
                </svg>
                <span>P. O. Box UP 629, KNUST, Kumasi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="foot-bottom">
          <p>
            © {new Date().getFullYear()} Top Business Brokers Consult Limited.
            Registered in Ghana, CS054812019.
          </p>
          <div className="foot-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <a
            href="#top"
            className="to-top"
            onClick={e => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to top
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8l-4.6 4.6L5 12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}