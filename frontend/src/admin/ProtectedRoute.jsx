import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./ProtectedRoute.css";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="pr-loading" role="status" aria-live="polite">
        <div className="pr-logo-ring">
          <img src="/logo2.jpeg" alt="" width="64" height="64" />
        </div>
        <span className="pr-spinner" aria-hidden="true" />
        <p>Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}