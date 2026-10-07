import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="wrap not-found-content">
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-gold">
            Go to homepage
          </Link>
          <Link to="/contact" className="btn-ghost">
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
